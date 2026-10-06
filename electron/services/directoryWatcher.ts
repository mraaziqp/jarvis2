import chokidar from 'chokidar';
import fs from 'fs';
import path from 'path';
import { Pool } from 'pg';
import { LocalAiHybridRouter } from './localAiRouter';

export class LiveDirectoryRAGWatcher {
  private watcher: chokidar.FSWatcher | null = null;
  private router: LocalAiHybridRouter;
  private pgPool: Pool | null = null;
  private watchedPaths: Set<string> = new Set();
  private debounceTimers: Map<string, NodeJS.Timeout> = new Map();
  private onUpdateCallback?: (event: { event: string; path: string }) => void;
  public totalIndexedFiles: number = 0;

  constructor(router: LocalAiHybridRouter) {
    this.router = router;
    this.initDatabase();
  }

  private async initDatabase() {
    const conn = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/jarvis_brain';
    try {
      this.pgPool = new Pool({ connectionString: conn, connectionTimeoutMillis: 2000 });
      const client = await this.pgPool.connect();
      await client.query(`
        CREATE EXTENSION IF NOT EXISTS vector;
        CREATE TABLE IF NOT EXISTS codebase_embeddings (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          file_path TEXT NOT NULL,
          chunk_index INT NOT NULL,
          content TEXT NOT NULL,
          embedding vector(384),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          UNIQUE(file_path, chunk_index)
        );
      `);
      client.release();
      console.log('[Directory RAG] PostgreSQL vector database initialized for live codebase embeddings.');
    } catch (_e) {
      console.warn('[Directory RAG] PostgreSQL not connected. In-memory indexing fallback active.');
    }
  }

  setUpdateCallback(cb: (event: { event: string; path: string }) => void) {
    this.onUpdateCallback = cb;
  }

  startWatching(directories: string[]) {
    directories.forEach(d => this.watchedPaths.add(path.resolve(d)));

    this.watcher = chokidar.watch(Array.from(this.watchedPaths), {
      ignored: [
        /(^|[\/\\])\../, // dotfiles
        '**/node_modules/**',
        '**/.next/**',
        '**/dist/**',
        '**/dist-electron/**',
        '**/.git/**'
      ],
      persistent: true,
      ignoreInitial: false,
      awaitWriteFinish: {
        stabilityThreshold: 400,
        pollInterval: 100
      }
    });

    this.watcher
      .on('add', (filePath) => this.handleFileEvent('add', filePath))
      .on('change', (filePath) => this.handleFileEvent('change', filePath))
      .on('unlink', (filePath) => this.handleFileEvent('unlink', filePath));

    console.log(`[Directory RAG] Watching ${directories.length} active workspace root(s) for live RAG embeddings.`);
  }

  private handleFileEvent(event: 'add' | 'change' | 'unlink', filePath: string) {
    const ext = path.extname(filePath).toLowerCase();
    const validExts = ['.ts', '.tsx', '.js', '.jsx', '.json', '.md', '.sql', '.css'];
    if (!validExts.includes(ext)) return;

    if (this.debounceTimers.has(filePath)) {
      clearTimeout(this.debounceTimers.get(filePath)!);
    }

    const timer = setTimeout(async () => {
      this.debounceTimers.delete(filePath);
      if (event === 'unlink') {
        await this.removeFileEmbeddings(filePath);
      } else {
        await this.indexFile(filePath);
      }
      this.onUpdateCallback?.({ event, path: filePath });
    }, 400);

    this.debounceTimers.set(filePath, timer);
  }

  private async indexFile(filePath: string) {
    try {
      const content = await fs.promises.readFile(filePath, 'utf-8');
      if (!content.trim() || content.length > 500000) return; // skip massive files

      // Chunk file into ~1000 character windows
      const chunks = this.chunkText(content, 1000, 200);
      this.totalIndexedFiles++;

      for (let i = 0; i < chunks.length; i++) {
        const chunk = chunks[i];
        const embedding = await this.router.generateEmbedding(chunk);

        if (this.pgPool) {
          try {
            await this.pgPool.query(
              `INSERT INTO codebase_embeddings (file_path, chunk_index, content, embedding, updated_at)
               VALUES ($1, $2, $3, $4, NOW())
               ON CONFLICT (file_path, chunk_index)
               DO UPDATE SET content = EXCLUDED.content, embedding = EXCLUDED.embedding, updated_at = NOW();`,
              [filePath, i, chunk, JSON.stringify(embedding)]
            );
          } catch (dbErr) {
            // silent db fallback
          }
        }
      }

      console.log(`[Directory RAG] Indexed ${chunks.length} chunk(s) for ${path.basename(filePath)}`);
    } catch (err) {
      console.error(`[Directory RAG] Error indexing ${filePath}:`, err);
    }
  }

  private async removeFileEmbeddings(filePath: string) {
    if (!this.pgPool) return;
    try {
      await this.pgPool.query('DELETE FROM codebase_embeddings WHERE file_path = $1', [filePath]);
    } catch (_e) {}
  }

  private chunkText(text: string, chunkSize: number, overlap: number): string[] {
    const chunks: string[] = [];
    let start = 0;
    while (start < text.length) {
      const end = Math.min(start + chunkSize, text.length);
      chunks.push(text.slice(start, end));
      start += chunkSize - overlap;
    }
    return chunks;
  }

  stop() {
    this.watcher?.close();
  }
}

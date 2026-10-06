import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { exec } from 'child_process';
import { promisify } from 'util';
import { ScreenshotParams, ScreenshotResult } from '../../src/types/ipc';

const execAsync = promisify(exec);

export class ScreenshotService {
  private defaultOutputDir: string;

  constructor() {
    this.defaultOutputDir = path.join(os.homedir(), 'Pictures', 'Jarvis');
    if (!fs.existsSync(this.defaultOutputDir)) {
      fs.mkdirSync(this.defaultOutputDir, { recursive: true });
    }
  }

  async captureScreen(params?: ScreenshotParams): Promise<ScreenshotResult> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `${params?.filenamePrefix || 'jarvis'}-${timestamp}.${params?.format || 'png'}`;
    const outputDir = params?.targetDirectory || this.defaultOutputDir;

    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const filePath = path.join(outputDir, filename);

    // Method 1: Try screenshot-desktop if available
    try {
      const screenshot = require('screenshot-desktop');
      const imgBuffer = await screenshot({ filename: filePath, format: params?.format || 'png' });
      const base64Preview = imgBuffer.toString('base64').substring(0, 5000); // small preview

      return {
        filePath,
        fileName: filename,
        dimensions: { width: 1920, height: 1080 },
        base64Preview: `data:image/png;base64,${base64Preview}`,
        capturedAt: new Date().toISOString()
      };
    } catch (_err) {
      // Method 2: High-reliability native Windows PowerShell fallback
      if (process.platform === 'win32') {
        const psScript = `
          Add-Type -AssemblyName System.Windows.Forms
          Add-Type -AssemblyName System.Drawing
          $Screen = [System.Windows.Forms.Screen]::PrimaryScreen.Bounds
          $Bitmap = New-Object System.Drawing.Bitmap $Screen.Width, $Screen.Height
          $Graphics = [System.Drawing.Graphics]::FromImage($Bitmap)
          $Graphics.CopyFromScreen($Screen.Location, [System.Drawing.Point]::Empty, $Screen.Size)
          $Bitmap.Save('${filePath.replace(/\\/g, '\\\\')}', [System.Drawing.Imaging.ImageFormat]::Png)
          $Graphics.Dispose()
          $Bitmap.Dispose()
        `;

        await execAsync(`powershell -NoProfile -Command "${psScript.replace(/\n/g, ' ')}"`);
        
        return {
          filePath,
          fileName: filename,
          dimensions: { width: 1920, height: 1080 },
          capturedAt: new Date().toISOString()
        };
      }

      throw new Error(`Screen capture failed on platform ${process.platform}`);
    }
  }
}

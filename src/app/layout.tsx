import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Jarvis · Unified Native Workspace',
  description: 'Electron OS Bridge, Living Subagent Town Canvas, and pgvector Semantic Memory',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-cyber-950 text-slate-100 antialiased overflow-hidden">
        {children}
      </body>
    </html>
  );
}

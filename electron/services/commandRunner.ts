import { exec } from 'child_process';
import { promisify } from 'util';
import { ExecuteCommandParams, ExecuteCommandResult } from '../../src/types/ipc';

const execAsync = promisify(exec);

export class CommandRunnerService {
  private allowedCommands: Set<string>;

  constructor() {
    const envAllowed = process.env.JARVIS_ALLOWED_COMMANDS?.split(',') || [];
    this.allowedCommands = new Set([
      'lock',
      'screenshot',
      'play/pause',
      'next',
      'mute',
      'dir',
      'git status',
      ...envAllowed.map(c => c.trim().toLowerCase())
    ]);
  }

  isCommandAllowed(command: string): boolean {
    const base = command.trim().toLowerCase().split(' ')[0];
    return this.allowedCommands.has(base) || this.allowedCommands.has(command.trim().toLowerCase());
  }

  async executeNativeAction(action: 'lock' | 'play/pause' | 'next' | 'mute'): Promise<string> {
    if (process.platform === 'win32') {
      switch (action) {
        case 'lock':
          await execAsync('rundll32.exe user32.dll,LockWorkStation');
          return 'Workstation locked successfully.';
        case 'mute':
          // Using PowerShell media keys
          await execAsync('powershell -Command "(New-Object -ComObject WScript.Shell).SendKeys([char]173)"');
          return 'Volume toggle executed.';
        case 'play/pause':
          await execAsync('powershell -Command "(New-Object -ComObject WScript.Shell).SendKeys([char]179)"');
          return 'Media play/pause toggled.';
        case 'next':
          await execAsync('powershell -Command "(New-Object -ComObject WScript.Shell).SendKeys([char]176)"');
          return 'Track skipped.';
      }
    }
    return `Action ${action} dispatched.`;
  }

  async executeShell(params: ExecuteCommandParams): Promise<ExecuteCommandResult> {
    const cmd = params.command.trim();

    // Map known quick hands actions
    if (['lock', 'play/pause', 'next', 'mute'].includes(cmd.toLowerCase())) {
      const msg = await this.executeNativeAction(cmd.toLowerCase() as any);
      return { stdout: msg, stderr: '', exitCode: 0 };
    }

    if (!this.isCommandAllowed(cmd)) {
      throw new Error(`Command "${cmd}" is not in JARVIS_ALLOWED_COMMANDS policy.`);
    }

    try {
      const { stdout, stderr } = await execAsync(cmd, {
        cwd: params.workingDirectory || process.cwd(),
        timeout: 15000,
        maxBuffer: 1024 * 1024 * 2
      });
      return { stdout, stderr, exitCode: 0 };
    } catch (err: any) {
      return {
        stdout: err.stdout || '',
        stderr: err.stderr || err.message,
        exitCode: err.code || 1
      };
    }
  }
}

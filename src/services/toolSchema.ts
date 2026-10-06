/**
 * Expanded Tool Calling Schemas including Nut.js OS Automation & Triage
 */

export interface ToolDefinition {
  name: string;
  description: string;
  parameters: {
    type: 'object';
    properties: Record<string, {
      type: string;
      description: string;
      enum?: string[];
      default?: any;
    }>;
    required: string[];
  };
}

export const JARVIS_SYSTEM_TOOLS: ToolDefinition[] = [
  {
    name: 'take_screenshot_and_mail',
    description: 'Natively captures the local computer screen and sends it via email with attachment.',
    parameters: {
      type: 'object',
      properties: {
        to: { type: 'string', description: 'Recipient email address' },
        subject: { type: 'string', description: 'Subject of the email' },
        body: { type: 'string', description: 'Body text explaining the screenshot' }
      },
      required: ['to']
    }
  },
  {
    name: 'take_screenshot',
    description: 'Captures the active screen to the local pictures directory (~/Pictures/Jarvis).',
    parameters: {
      type: 'object',
      properties: {
        format: { type: 'string', description: 'Image format', enum: ['png', 'jpg'] },
        filenamePrefix: { type: 'string', description: 'Prefix for generated filename' }
      },
      required: []
    }
  },
  {
    name: 'send_mail',
    description: 'Dispatches an email through the local mail sentry service with optional file attachments.',
    parameters: {
      type: 'object',
      properties: {
        to: { type: 'string', description: 'Destination email address' },
        subject: { type: 'string', description: 'Subject line' },
        body: { type: 'string', description: 'Email message text' },
        attachments: { type: 'array', description: 'Array of local absolute file paths to attach' } as any
      },
      required: ['to', 'subject', 'body']
    }
  },
  {
    name: 'locate_window',
    description: 'Nut.js automation: Finds an OS window matching a title regex and brings it to the foreground.',
    parameters: {
      type: 'object',
      properties: {
        titleRegex: { type: 'string', description: 'Regular expression or keyword to match window title' },
        bringToFront: { type: 'boolean', description: 'Whether to bring the window to the front' }
      },
      required: ['titleRegex']
    }
  },
  {
    name: 'read_crash_logs',
    description: 'Reads recent crash logs or stack traces from active project and OS log directories.',
    parameters: {
      type: 'object',
      properties: {
        processName: { type: 'string', description: 'Name of the crashed process (e.g. Next.js, Node, Tailscale)' },
        sourcePath: { type: 'string', description: 'Custom log directory or file path' },
        maxLines: { type: 'number', description: 'Max lines to inspect from bottom of log' }
      },
      required: []
    }
  },
  {
    name: 'execute_keyboard_macro',
    description: 'Nut.js automation: Emits keyboard input sequences to the target or foreground application.',
    parameters: {
      type: 'object',
      properties: {
        sequence: { type: 'array', description: 'Array of key actions to perform' } as any
      },
      required: ['sequence']
    }
  },
  {
    name: 'auto_triage_process',
    description: 'Autonomous triage loop: locates crashed window, reads crash logs, and executes automated recovery keystrokes.',
    parameters: {
      type: 'object',
      properties: {
        processName: { type: 'string', description: 'Process identifier to triage' },
        logPath: { type: 'string', description: 'Path to crash logs' },
        restartCommand: { type: 'string', description: 'Command to run for process restart' }
      },
      required: ['processName']
    }
  }
];

/**
 * Natural language intent parser for quick client-side fallback / local routing
 */
export function parseNaturalLanguageCommand(input: string, userEmail: string = 'mraaziqp@gmail.com') {
  const lower = input.toLowerCase();

  // Pattern: "mail the screenshot... and mail it to me" or "take a screenshot and mail it"
  if ((lower.includes('mail') || lower.includes('email')) && lower.includes('screenshot')) {
    return {
      toolName: 'take_screenshot_and_mail',
      params: {
        to: userEmail,
        subject: 'Jarvis Requested Screenshot',
        body: 'Mohammed, here is the screenshot you requested from your active workstation.'
      },
      requiresConfirmation: true
    };
  }

  // Pattern: "screenshot"
  if (lower.startsWith('screenshot') || lower.includes('take a screenshot')) {
    return {
      toolName: 'take_screenshot',
      params: { format: 'png', filenamePrefix: 'jarvis' },
      requiresConfirmation: false
    };
  }

  // Pattern: "locate window" / "find window"
  if (lower.includes('locate window') || lower.includes('find window')) {
    const target = input.replace(/locate window|find window/gi, '').trim() || 'Chrome';
    return {
      toolName: 'locate_window',
      params: { titleRegex: target, bringToFront: true },
      requiresConfirmation: false
    };
  }

  // Pattern: "crash log" / "read logs"
  if (lower.includes('crash log') || lower.includes('read logs')) {
    return {
      toolName: 'read_crash_logs',
      params: { processName: 'node', maxLines: 50 },
      requiresConfirmation: false
    };
  }

  // Pattern: "lock" or "lock workstation"
  if (lower.includes('lock workstation') || lower.trim() === 'lock') {
    return {
      toolName: 'execute_command',
      params: { command: 'lock' },
      requiresConfirmation: false
    };
  }

  // Pattern: "triage"
  if (lower.includes('triage') || lower.includes('auto triage')) {
    return {
      toolName: 'auto_triage_process',
      params: { processName: 'Next.js', restartCommand: 'npm run dev' },
      requiresConfirmation: true
    };
  }

  return null;
}

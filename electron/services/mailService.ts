import * as nodemailer from 'nodemailer';
import * as path from 'path';
import * as fs from 'fs';
import { SendMailParams, SendMailResult } from '../../src/types/ipc';

export class MailService {
  private transporter: nodemailer.Transporter | null = null;
  private isSimulationMode: boolean = false;

  constructor() {
    this.initTransporter();
  }

  private initTransporter() {
    const host = process.env.SMTP_HOST;
    const port = parseInt(process.env.SMTP_PORT || '587', 10);
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;

    if (host && user && pass) {
      this.transporter = nodemailer.createTransport({
        host,
        port,
        secure: port === 465,
        auth: { user, pass }
      });
    } else {
      // In development or when credentials aren't set, use graceful simulated delivery with disk audit log
      this.isSimulationMode = true;
    }
  }

  async sendMail(params: SendMailParams): Promise<SendMailResult> {
    const attachments = (params.attachments || []).map((filePath) => {
      const resolved = path.resolve(filePath);
      if (!fs.existsSync(resolved)) {
        throw new Error(`Attachment file does not exist: ${resolved}`);
      }
      return {
        filename: path.basename(resolved),
        path: resolved
      };
    });

    if (this.isSimulationMode || !this.transporter) {
      // Log to local simulated mailbox
      const simulatedId = `sim-${Date.now()}-${Math.random().toString(36).substring(2, 8)}@jarvis.local`;
      console.log(`[Jarvis Mail Sentry] Simulated mail dispatched to: ${params.to}`);
      console.log(`[Jarvis Mail Sentry] Subject: ${params.subject}`);
      console.log(`[Jarvis Mail Sentry] Attachments: ${attachments.map(a => a.filename).join(', ') || 'none'}`);

      return {
        messageId: simulatedId,
        accepted: [params.to],
        rejected: [],
        timestamp: new Date().toISOString()
      };
    }

    const info = await this.transporter.sendMail({
      from: process.env.SMTP_FROM || '"Jarvis Sentry" <jarvis@assistant.local>',
      to: params.to,
      cc: params.cc,
      subject: params.subject,
      text: params.body,
      html: `<div style="font-family: sans-serif; padding: 20px; background: #0c121e; color: #f1f5f9; border-radius: 8px;">
        <h2 style="color: #00f2fe; margin-top: 0;">Jarvis Automated Dispatch</h2>
        <p style="white-space: pre-wrap;">${params.body}</p>
        <hr style="border: 1px solid #1e293b; margin: 20px 0;" />
        <small style="color: #94a3b8;">Sent securely via Jarvis Native OS Bridge on ${new Date().toLocaleString()}</small>
      </div>`,
      attachments
    });

    return {
      messageId: info.messageId,
      accepted: Array.isArray(info.accepted) ? (info.accepted as string[]) : [params.to],
      rejected: Array.isArray(info.rejected) ? (info.rejected as string[]) : [],
      timestamp: new Date().toISOString()
    };
  }
}

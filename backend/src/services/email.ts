import { Resend } from 'resend';
import dotenv from 'dotenv';

dotenv.config();

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendAlertEmail(params: {
  toName: string;
  toEmail: string;
  fromEmail: string;
  userName: string;
  eventType: string;
  source: string;
  occurredAt: Date;
  confidence?: number;
  locationLat?: number;
  locationLng?: number;
  isTest: boolean;
}): Promise<{ messageId?: string; error?: string }> {
  try {
    let subject = `URGENT: Alert from ${params.userName}`;
    if (params.isTest) {
      subject = `TEST: Alert from ${params.userName}`;
    }

    let html = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 5px;">
    `;

    if (params.isTest) {
      html += `
        <div style="background-color: #f39c12; color: white; padding: 15px; text-align: center; font-size: 20px; font-weight: bold; border-radius: 5px; margin-bottom: 20px;">
          ⚠️ THIS IS A TEST — NOT A REAL EMERGENCY
        </div>
      `;
    }

    html += `
      <h2 style="color: #e74c3c;">Emergency Alert</h2>
      <p>Hello ${params.toName},</p>
      <p><strong>${params.userName}</strong> has triggered an alert.</p>
      <ul>
        <li><strong>Event Type:</strong> ${params.eventType.replace('_', ' ')}</li>
        <li><strong>Time:</strong> ${params.occurredAt.toISOString()}</li>
    `;

    if (params.confidence !== undefined) {
      html += `<li><strong>Confidence:</strong> ${(params.confidence * 100).toFixed(1)}%</li>`;
    }

    if (params.locationLat !== undefined && params.locationLng !== undefined) {
      const gmapsLink = `https://www.google.com/maps/search/?api=1&query=${params.locationLat},${params.locationLng}`;
      html += `<li><strong>Location:</strong> <a href="${gmapsLink}">View on Google Maps</a></li>`;
    }

    html += `
      </ul>
      <p style="background-color: #fce4ec; padding: 15px; border-left: 4px solid #e91e63;">
        <strong>Please check on ${params.userName} immediately. If you cannot reach them, contact emergency services.</strong>
      </p>
      <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
      <p style="font-size: 12px; color: #7f8c8d; text-align: center;">
        QuietGuard is an assistive tool, not a substitute for emergency services.
      </p>
      </div>
    `;

    const data = await resend.emails.send({
      from: params.fromEmail,
      to: params.toEmail,
      subject,
      html,
    });

    if (data.error) {
      return { error: data.error.message };
    }

    return { messageId: data.data?.id };
  } catch (error: any) {
    return { error: error.message };
  }
}

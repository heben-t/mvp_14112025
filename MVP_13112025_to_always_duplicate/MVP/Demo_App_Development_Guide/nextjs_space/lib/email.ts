import { Resend } from 'resend';

function getResendClient() {
  if (!process.env.RESEND_API_KEY) {
    console.warn('RESEND_API_KEY environment variable is not set');
    // Return a mock client that doesn't actually send emails during build
    return {
      emails: {
        send: async () => ({ success: false, error: 'API key not configured' })
      }
    } as any;
  }
  return new Resend(process.env.RESEND_API_KEY);
}

const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'noreply@yourdomain.com';

export async function sendInvestmentNotification(
  to: string,
  data: {
    investorName: string;
    campaignTitle: string;
    amount: number;
    startupName: string;
  }
) {
  try {
    const resend = getResendClient();
    await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject: `New Investment in ${data.campaignTitle}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>New Investment Received!</h2>
          <p>Great news! You've received a new investment for your campaign.</p>
          
          <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Campaign:</strong> ${data.campaignTitle}</p>
            <p><strong>Investor:</strong> ${data.investorName}</p>
            <p><strong>Amount:</strong> $${data.amount.toLocaleString()}</p>
          </div>
          
          <p>Please review this investment in your dashboard and respond within 48 hours.</p>
          
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/startup/investments" 
             style="display: inline-block; background: #000; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0;">
            Review Investment
          </a>
          
          <p style="color: #666; font-size: 14px; margin-top: 30px;">
            This is an automated notification from your AI ROI Dashboard.
          </p>
        </div>
      `,
    });
    return { success: true };
  } catch (error) {
    console.error('Email send error:', error);
    return { success: false, error };
  }
}

export async function sendInvestmentStatusUpdate(
  to: string,
  data: {
    campaignTitle: string;
    amount: number;
    status: 'accepted' | 'rejected';
    startupName: string;
  }
) {
  const isAccepted = data.status === 'accepted';
  
  try {
    const resend = getResendClient();
    await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject: `Investment ${isAccepted ? 'Accepted' : 'Declined'} - ${data.campaignTitle}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Investment ${isAccepted ? 'Accepted' : 'Declined'}</h2>
          <p>${isAccepted 
            ? 'Congratulations! Your investment has been accepted.' 
            : 'Your investment has been declined by the startup.'
          }</p>
          
          <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Campaign:</strong> ${data.campaignTitle}</p>
            <p><strong>Startup:</strong> ${data.startupName}</p>
            <p><strong>Amount:</strong> $${data.amount.toLocaleString()}</p>
            <p><strong>Status:</strong> ${isAccepted ? '✅ Accepted' : '❌ Declined'}</p>
          </div>
          
          ${isAccepted 
            ? '<p>Your funds will be transferred to escrow. You can track your investment in your portfolio.</p>' 
            : '<p>Your payment will be refunded within 5-7 business days.</p>'
          }
          
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/investor/investments" 
             style="display: inline-block; background: #000; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0;">
            View Portfolio
          </a>
          
          <p style="color: #666; font-size: 14px; margin-top: 30px;">
            This is an automated notification from your AI ROI Dashboard.
          </p>
        </div>
      `,
    });
    return { success: true };
  } catch (error) {
    console.error('Email send error:', error);
    return { success: false, error };
  }
}

export async function sendWelcomeEmail(
  to: string,
  data: {
    name: string;
    userType: 'investor' | 'startup';
  }
) {
  try {
    const resend = getResendClient();
    await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject: 'Welcome to AI ROI Dashboard',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Welcome to AI ROI Dashboard, ${data.name}!</h2>
          <p>Thank you for joining our platform. We're excited to have you on board.</p>
          
          ${data.userType === 'investor' 
            ? `
              <p>As an investor, you can:</p>
              <ul>
                <li>Discover and invest in promising startups</li>
                <li>Track your portfolio performance</li>
                <li>Get AI-powered investment recommendations</li>
                <li>Manage your investments in one place</li>
              </ul>
            `
            : `
              <p>As a startup, you can:</p>
              <ul>
                <li>Create and manage fundraising campaigns</li>
                <li>Connect with qualified investors</li>
                <li>Track campaign performance in real-time</li>
                <li>Manage investment offers efficiently</li>
              </ul>
            `
          }
          
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" 
             style="display: inline-block; background: #000; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0;">
            Get Started
          </a>
          
          <p style="color: #666; font-size: 14px; margin-top: 30px;">
            Need help? Contact us at support@yourdomain.com
          </p>
        </div>
      `,
    });
    return { success: true };
  } catch (error) {
    console.error('Email send error:', error);
    return { success: false, error };
  }
}

export async function sendSubscriptionConfirmation(
  to: string,
  data: {
    name: string;
    plan: string;
    amount: number;
  }
) {
  try {
    const resend = getResendClient();
    await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject: 'Subscription Confirmed',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Subscription Confirmed!</h2>
          <p>Hi ${data.name},</p>
          <p>Your subscription has been successfully activated.</p>
          
          <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Plan:</strong> ${data.plan}</p>
            <p><strong>Amount:</strong> $${data.amount}/month</p>
          </div>
          
          <p>You now have access to all premium features. Start exploring!</p>
          
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" 
             style="display: inline-block; background: #000; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0;">
            Go to Dashboard
          </a>
          
          <p style="color: #666; font-size: 14px; margin-top: 30px;">
            You can manage your subscription anytime from your account settings.
          </p>
        </div>
      `,
    });
    return { success: true };
  } catch (error) {
    console.error('Email send error:', error);
    return { success: false, error };
  }
}

// Aliases for compatibility
export const sendInvestmentAcceptedEmail = (to: string, data: any) => 
  sendInvestmentStatusUpdate(to, { ...data, status: 'accepted' });

export const sendInvestmentRejectedEmail = (to: string, data: any) => 
  sendInvestmentStatusUpdate(to, { ...data, status: 'rejected' });

export const sendInvestmentNotificationToStartup = sendInvestmentNotification;
export const sendInvestmentConfirmationToInvestor = (to: string, data: any) => 
  sendInvestmentStatusUpdate(to, { ...data, status: 'accepted' });

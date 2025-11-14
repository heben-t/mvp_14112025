import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export interface InvestmentEmailData {
  investorName: string;
  investorEmail: string;
  startupName: string;
  startupEmail: string;
  amount: number;
  campaignTitle: string;
  campaignId: string;
}

export async function sendInvestmentNotificationToStartup(data: InvestmentEmailData) {
  try {
    const { data: emailData, error } = await resend.emails.send({
      from: 'Hebed AI <notifications@hebed.ai>',
      to: data.startupEmail,
      subject: `New Investment Received: $${data.amount.toLocaleString()}`,
      html: `
        <h2>New Investment Received!</h2>
        <p>Great news! You've received a new investment for your campaign.</p>
        
        <h3>Investment Details:</h3>
        <ul>
          <li><strong>Investor:</strong> ${data.investorName}</li>
          <li><strong>Amount:</strong> $${data.amount.toLocaleString()}</li>
          <li><strong>Campaign:</strong> ${data.campaignTitle}</li>
        </ul>
        
        <p>Please review and respond to this investment in your dashboard:</p>
        <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard/startup/investments" 
           style="background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
          Review Investment
        </a>
        
        <p style="margin-top: 20px; color: #666; font-size: 14px;">
          You can accept or reject this investment within 48 hours.
        </p>
      `,
    });

    if (error) {
      console.error('Failed to send startup notification:', error);
      return { success: false, error };
    }

    return { success: true, data: emailData };
  } catch (error) {
    console.error('Error sending startup notification:', error);
    return { success: false, error };
  }
}

export async function sendInvestmentConfirmationToInvestor(data: InvestmentEmailData) {
  try {
    const { data: emailData, error } = await resend.emails.send({
      from: 'Hebed AI <notifications@hebed.ai>',
      to: data.investorEmail,
      subject: `Investment Confirmed: ${data.campaignTitle}`,
      html: `
        <h2>Investment Confirmed</h2>
        <p>Thank you for your investment! Your payment has been processed successfully.</p>
        
        <h3>Investment Summary:</h3>
        <ul>
          <li><strong>Startup:</strong> ${data.startupName}</li>
          <li><strong>Campaign:</strong> ${data.campaignTitle}</li>
          <li><strong>Amount:</strong> $${data.amount.toLocaleString()}</li>
        </ul>
        
        <p>The startup will review your investment and respond within 48 hours.</p>
        
        <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard/investor/investments" 
           style="background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
          View Your Investments
        </a>
        
        <p style="margin-top: 20px; color: #666; font-size: 14px;">
          Your funds are held in escrow until the startup accepts your investment.
        </p>
      `,
    });

    if (error) {
      console.error('Failed to send investor confirmation:', error);
      return { success: false, error };
    }

    return { success: true, data: emailData };
  } catch (error) {
    console.error('Error sending investor confirmation:', error);
    return { success: false, error };
  }
}

export async function sendInvestmentAcceptedEmail(data: InvestmentEmailData) {
  try {
    const { data: emailData, error } = await resend.emails.send({
      from: 'Hebed AI <notifications@hebed.ai>',
      to: data.investorEmail,
      subject: `Investment Accepted: ${data.campaignTitle}`,
      html: `
        <h2>Investment Accepted! 🎉</h2>
        <p>Great news! ${data.startupName} has accepted your investment.</p>
        
        <h3>Investment Details:</h3>
        <ul>
          <li><strong>Startup:</strong> ${data.startupName}</li>
          <li><strong>Campaign:</strong> ${data.campaignTitle}</li>
          <li><strong>Amount:</strong> $${data.amount.toLocaleString()}</li>
        </ul>
        
        <p>Your funds have been released from escrow and the investment is now active.</p>
        
        <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard/investor/portfolio" 
           style="background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
          View Portfolio
        </a>
      `,
    });

    if (error) {
      console.error('Failed to send acceptance email:', error);
      return { success: false, error };
    }

    return { success: true, data: emailData };
  } catch (error) {
    console.error('Error sending acceptance email:', error);
    return { success: false, error };
  }
}

export async function sendInvestmentRejectedEmail(data: InvestmentEmailData & { reason?: string }) {
  try {
    const { data: emailData, error } = await resend.emails.send({
      from: 'Hebed AI <notifications@hebed.ai>',
      to: data.investorEmail,
      subject: `Investment Update: ${data.campaignTitle}`,
      html: `
        <h2>Investment Update</h2>
        <p>We wanted to inform you that ${data.startupName} has declined your investment at this time.</p>
        
        <h3>Investment Details:</h3>
        <ul>
          <li><strong>Startup:</strong> ${data.startupName}</li>
          <li><strong>Campaign:</strong> ${data.campaignTitle}</li>
          <li><strong>Amount:</strong> $${data.amount.toLocaleString()}</li>
        </ul>
        
        ${data.reason ? `<p><strong>Reason:</strong> ${data.reason}</p>` : ''}
        
        <p>Your funds have been returned to your original payment method within 5-7 business days.</p>
        
        <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard/investor/discover" 
           style="background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
          Discover Other Opportunities
        </a>
      `,
    });

    if (error) {
      console.error('Failed to send rejection email:', error);
      return { success: false, error };
    }

    return { success: true, data: emailData };
  } catch (error) {
    console.error('Error sending rejection email:', error);
    return { success: false, error };
  }
}

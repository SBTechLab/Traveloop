import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Verify connection configuration
transporter.verify(function (error, success) {
  if (error) {
    console.error('[EMAIL SERVICE] Connection error:', error);
  } else {
    console.log('[EMAIL SERVICE] Server is ready to take our messages');
  }
});

export const sendPasswordResetEmail = async (to: string, resetLink: string) => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.log(`[EMAIL SERVICE] Missing credentials. Password Reset Link for ${to}: ${resetLink}`);
    return;
  }

  try {
    await transporter.sendMail({
      from: `"Traveloop Support" <${process.env.EMAIL_USER}>`,
      to,
      subject: 'Password Reset Request',
      html: `
        <div style="font-family: 'Plus Jakarta Sans', sans-serif; padding: 40px; background-color: #081425; color: #d8e3fb; border-radius: 24px; max-width: 600px; margin: 0 auto; border: 1px solid rgba(88, 66, 55, 0.2);">
          <div style="text-align: center; margin-bottom: 32px;">
            <h2 style="color: #ffb690; font-family: 'Noto Serif', serif; font-size: 32px; margin-bottom: 8px;">Secure Your Journey</h2>
            <p style="color: #d8e3fb; opacity: 0.7;">Password Reset Request</p>
          </div>
          
          <p style="font-size: 16px; line-height: 1.6; margin-bottom: 32px;">
            We received a request to reset your Traveloop account password. If this was you, click the premium button below to proceed.
          </p>
          
          <div style="text-align: center; margin-bottom: 32px;">
            <a href="${resetLink}" style="background-color: #ffb690; color: #552100; padding: 16px 32px; text-decoration: none; border-radius: 12px; font-weight: bold; font-size: 16px; display: inline-block; box-shadow: 0 10px 20px rgba(255, 182, 144, 0.2);">
              Reset Password
            </a>
          </div>
          
          <p style="font-size: 14px; opacity: 0.6; margin-bottom: 8px;">
            This link will expire in 1 hour. If you didn't request this, you can safely ignore this email.
          </p>
          
          <hr style="border: 0; border-top: 1px solid rgba(88, 66, 55, 0.1); margin: 32px 0;" />
          
          <div style="text-align: center; font-size: 12px; opacity: 0.5;">
            <p>Sent with ❤️ from the Traveloop Team</p>
            <p>© 2026 Traveloop. All rights reserved.</p>
          </div>
        </div>
      `,
    });
    console.log(`[EMAIL SERVICE] Reset email sent to ${to}`);
  } catch (error) {
    console.error(`[EMAIL SERVICE] Error sending email to ${to}:`, error);
    throw error;
  }
};

export const sendItineraryShareEmail = async (to: string, userName: string, tripName: string, shareLink: string) => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.log(`[EMAIL SERVICE] Missing credentials. Share Link for ${tripName}: ${shareLink}`);
    return;
  }

  try {
    await transporter.sendMail({
      from: `"Traveloop Sharing" <${process.env.EMAIL_USER}>`,
      to,
      subject: `${userName} shared an itinerary with you!`,
      html: `
        <div style="font-family: 'Plus Jakarta Sans', sans-serif; padding: 40px; background-color: #f7f9fb; color: #191c1e; border-radius: 24px; max-width: 600px; margin: 0 auto; border: 1px solid #c6c6cd;">
          <div style="text-align: center; margin-bottom: 32px;">
            <h2 style="color: #9d4300; font-family: 'Noto Serif', serif; font-size: 32px; margin-bottom: 8px;">Adventure Awaits!</h2>
            <p style="color: #45464d; font-size: 18px;">${userName} invited you to view <b>${tripName}</b></p>
          </div>
          
          <p style="font-size: 16px; line-height: 1.6; margin-bottom: 32px; text-align: center;">
            Join the journey and explore the detailed itinerary, activities, and destinations planned for this incredible expedition.
          </p>
          
          <div style="text-align: center; margin-bottom: 32px;">
            <a href="${shareLink}" style="background-color: #000000; color: #ffffff; padding: 16px 32px; text-decoration: none; border-radius: 12px; font-weight: bold; font-size: 16px; display: inline-block; box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);">
              View Itinerary
            </a>
          </div>
          
          <hr style="border: 0; border-top: 1px solid #c6c6cd; margin: 32px 0;" />
          
          <div style="text-align: center; font-size: 12px; color: #76777d;">
            <p>Traveloop — Redefining Global Exploration</p>
            <p>© 2026 Traveloop Technologies</p>
          </div>
        </div>
      `,
    });
    console.log(`[EMAIL SERVICE] Share email sent to ${to}`);
  } catch (error) {
    console.error(`[EMAIL SERVICE] Error sending share email to ${to}:`, error);
    throw error;
  }
};

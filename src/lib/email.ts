export function sendResetEmail(email: string, token: string) {
  // In a real app, use nodemailer or similar.
  // For now, log to console just like the original server.
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const url = `${appUrl}/auth/reset-password?token=${token}`;
  console.log(`Sending password reset to ${email}: ${url}`);
}

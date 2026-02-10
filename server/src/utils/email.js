function sendResetEmail(email, token) {
  const url = `http://localhost:3000/auth/reset-password?token=${token}`;
  console.log(`Sending password reset to ${email}: ${url}`);
}

module.exports = { sendResetEmail };

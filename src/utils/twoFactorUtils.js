const speakeasy = require("speakeasy");

// Generate a 2FA secret
const generate2FASecret = (options = { name: "ProfitFolio", issuer: "ProfitFolio" }) => {
  return speakeasy.generateSecret(options);
};

// Verify a 2FA OTP
const verify2FA = (secret, otp) => {
  return speakeasy.totp.verify({
    secret,
    encoding: "base32",
    token: otp,
  });
};

module.exports = { generate2FASecret, verify2FA };

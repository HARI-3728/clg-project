// Configurable OTP Service for MediCare+
// Supports mock OTP in development, easily swapped with Twilio/MSG91/Fast2SMS in production

const isMock = process.env.MOCK_OTP !== 'false';
const provider = process.env.SMS_PROVIDER || 'mock';
const expiryMinutes = parseInt(process.env.OTP_EXPIRY_MINUTES || '10', 10);

// In-memory or cache store for active OTPs: mobile -> { code, expiresAt, attempts }
const activeOtps = new Map();

/**
 * Generate a 6-digit numeric OTP code
 */
const generateOtpCode = () => {
  if (isMock) {
    // In mock development mode, provide standard easy code 123456 or a randomized 6-digit
    return '123456';
  }
  return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * Send OTP to a mobile phone number
 * @param {string} mobile 
 * @returns {Promise<{ success: boolean, otp?: string, message: string, expiresIn: string }>}
 */
const sendOtp = async (mobile) => {
  const code = generateOtpCode();
  const expiresAt = new Date(Date.now() + expiryMinutes * 60 * 1000);

  // Store in active OTP cache
  activeOtps.set(mobile, {
    code,
    expiresAt,
    attempts: 0
  });

  if (isMock) {
    console.log(`\n======================================================`);
    console.log(`📱 [MOCK OTP SERVICE] MediCare+ Verification Code`);
    console.log(`   Recipient Mobile: ${mobile}`);
    console.log(`   Security Code:   ${code}`);
    console.log(`   Expires At:      ${expiresAt.toLocaleTimeString()}`);
    console.log(`======================================================\n`);

    return {
      success: true,
      otp: code, // Return code in dev for effortless testing and API responses
      expiresIn: `${expiryMinutes} minutes`,
      message: `Mock OTP sent to ${mobile}. Verification code: ${code}`
    };
  }

  // Real SMS Provider Dispatch Hook (e.g. Twilio, MSG91)
  try {
    if (provider === 'twilio') {
      // e.g. twilioClient.messages.create({ body: `Your MediCare+ code is ${code}`, to: mobile, from: ... })
      console.log(`Sending SMS via Twilio to ${mobile}`);
    } else {
      console.log(`Sending SMS via Provider (${provider}) to ${mobile}`);
    }

    return {
      success: true,
      expiresIn: `${expiryMinutes} minutes`,
      message: `OTP sent successfully to ${mobile}`
    };
  } catch (error) {
    console.error('Failed to dispatch real SMS:', error);
    throw new Error(`SMS delivery failed: ${error.message}`);
  }
};

/**
 * Verify OTP for mobile
 * @param {string} mobile 
 * @param {string} enteredOtp 
 * @returns {{ valid: boolean, message: string }}
 */
const verifyOtp = (mobile, enteredOtp) => {
  const cleanMobile = (mobile || '').trim();
  const cleanOtp = (enteredOtp || '').toString().trim();

  // If in mock dev mode, accept '123456' universally or any stored matching code
  if (isMock && cleanOtp === '123456') {
    return { valid: true, message: 'OTP verified successfully (Dev bypass/mock).' };
  }

  const record = activeOtps.get(cleanMobile);
  if (!record) {
    if (isMock) {
      // In dev mode allow 123456 even if not pre-requested
      if (cleanOtp === '123456') {
        return { valid: true, message: 'OTP verified successfully.' };
      }
    }
    return { valid: false, message: 'No active OTP found for this mobile. Please request a new code.' };
  }

  if (new Date() > record.expiresAt) {
    activeOtps.delete(cleanMobile);
    return { valid: false, message: 'OTP has expired. Please request a new code.' };
  }

  if (record.code !== cleanOtp) {
    record.attempts += 1;
    if (record.attempts >= 4) {
      activeOtps.delete(cleanMobile);
      return { valid: false, message: 'Too many incorrect attempts. Please request a new OTP.' };
    }
    return { valid: false, message: 'Invalid OTP code. Please check and try again.' };
  }

  // Successful verification - clear OTP
  activeOtps.delete(cleanMobile);
  return { valid: true, message: 'OTP verified successfully.' };
};

module.exports = {
  sendOtp,
  verifyOtp,
  isMockProvider: isMock
};


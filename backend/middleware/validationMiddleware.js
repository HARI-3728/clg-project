/**
 * Request Validation Middleware for MediCare+ Backend
 */

const validatePatientOtpRequest = (req, res, next) => {
  const { mobile } = req.body;
  if (!mobile || typeof mobile !== 'string') {
    return res.status(400).json({
      success: false,
      message: 'Mobile number is required to generate verification OTP.'
    });
  }

  // Sanitize and check length
  const digitsOnly = mobile.replace(/\D/g, '');
  if (digitsOnly.length < 10) {
    return res.status(400).json({
      success: false,
      message: 'Please provide a valid 10-digit mobile number.'
    });
  }

  req.body.sanitizedMobile = digitsOnly.slice(-10); // Standard 10-digit format
  next();
};

const validatePatientOtpVerify = (req, res, next) => {
  const { mobile, otp } = req.body;
  if (!mobile) {
    return res.status(400).json({
      success: false,
      message: 'Mobile number is required for OTP verification.'
    });
  }

  if (!otp || typeof otp !== 'string' || otp.trim().length === 0) {
    return res.status(400).json({
      success: false,
      message: 'Verification OTP code is required.'
    });
  }

  next();
};

const validateDoctorLogin = (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !email.trim()) {
    return res.status(400).json({
      success: false,
      message: 'Doctor email or medical registration number is required.'
    });
  }

  if (!password || password.trim().length === 0) {
    return res.status(400).json({
      success: false,
      message: 'Password is required to sign in.'
    });
  }

  next();
};

const validateHospitalLogin = (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !email.trim()) {
    return res.status(400).json({
      success: false,
      message: 'Hospital administrative email is required.'
    });
  }

  // Basic email pattern check
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email.trim())) {
    return res.status(400).json({
      success: false,
      message: 'Please enter a valid hospital administrative email address.'
    });
  }

  if (!password || password.trim().length === 0) {
    return res.status(400).json({
      success: false,
      message: 'Hospital portal password is required.'
    });
  }

  next();
};

module.exports = {
  validatePatientOtpRequest,
  validatePatientOtpVerify,
  validateDoctorLogin,
  validateHospitalLogin
};


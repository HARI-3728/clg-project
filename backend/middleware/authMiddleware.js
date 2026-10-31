const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Protect middleware: Ensures request contains a valid JWT in Authorization header
 */
const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Access denied: No authentication token provided. Please log in.'
    });
  }

  try {
    const secret = process.env.JWT_SECRET || 'medicare_default_secret_2026';
    const decoded = jwt.verify(token, secret);

    // If User model is available and connected, find user, otherwise attach decoded claims
    let user = null;
    try {
      user = await User.findById(decoded.id).select('-password');
    } catch (dbErr) {
      // Graceful fallback if database connection is offline
    }

    if (!user) {
      // Use token claims as user context
      req.user = {
        id: decoded.id,
        role: decoded.role,
        name: decoded.name,
        email: decoded.email,
        mobile: decoded.mobile,
        patientId: decoded.patientId || decoded.medicalID,
        medicalID: decoded.medicalID || decoded.patientId,
        doctorId: decoded.doctorId,
        hospitalId: decoded.hospitalId,
        hospital: decoded.hospital
      };
    } else {
      req.user = user.toObject ? user.toObject() : user;
    }

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Access denied: Token is invalid or expired. Please sign in again.'
    });
  }
};

/**
 * Role authorization middleware
 * @param  {...string} roles Allowed roles ('patient', 'doctor', 'hospital')
 */
const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: Access restricted to [${roles.join(', ')}]. Current role: '${req.user?.role || 'unauthenticated'}'.`
      });
    }
    next();
  };
};

/**
 * Hospital Isolation Middleware:
 * Enforces rule: "Each hospital must manage only its own data."
 */
const hospitalDataOnly = (req, res, next) => {
  if (req.user?.role === 'hospital') {
    const userHospId = req.user.hospitalId || req.user.id;
    // Inject hospital filter into request query/body
    req.hospitalScope = userHospId;
  }
  next();
};

/**
 * Optional Protect middleware: Attaches req.user if a valid token is present, but doesn't block unauthenticated requests.
 */
const optionalProtect = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }
  if (!token) return next();

  try {
    const secret = process.env.JWT_SECRET || 'medicare_default_secret_2026';
    const decoded = jwt.verify(token, secret);
    req.user = {
      id: decoded.id,
      role: decoded.role,
      name: decoded.name,
      email: decoded.email,
      mobile: decoded.mobile,
      patientId: decoded.patientId || decoded.medicalID,
      medicalID: decoded.medicalID || decoded.patientId,
      doctorId: decoded.doctorId,
      hospitalId: decoded.hospitalId,
      hospital: decoded.hospital
    };
    next();
  } catch (err) {
    next();
  }
};

/**
 * Patient Isolation Middleware:
 * Enforces rule: "Prevent patients from accessing other patients' records."
 */
const patientDataOnly = (req, res, next) => {
  if (req.user?.role === 'patient') {
    const ownPatientId = req.user.patientId || req.user.medicalID || req.user.id;
    if (req.params.patientId && req.params.patientId !== ownPatientId && req.params.patientId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You cannot access medical records belonging to another patient.'
      });
    }
    if (req.query.patientId && req.query.patientId !== ownPatientId && req.query.patientId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You cannot access medical records belonging to another patient.'
      });
    }
    if (req.body && req.body.patientId && req.body.patientId !== ownPatientId && req.body.patientId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You cannot submit or modify medical records for another patient.'
      });
    }
    // Lock query & body to patient's own ID
    req.query.patientId = ownPatientId;
    if (req.body) {
      req.body.patientId = ownPatientId;
    }
  }
  next();
};

module.exports = {
  protect,
  authorizeRoles,
  hospitalDataOnly,
  optionalProtect,
  patientDataOnly
};


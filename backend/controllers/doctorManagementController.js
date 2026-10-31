const { Doctor, Hospital } = require('../models');
const { initialDoctors } = require('../data/seedData');
const { generateDoctorId } = require('../utils/idGenerator');
const { getDBStatus } = require('../config/db');

// In-memory runtime doctors fallback for offline dev mode
let inMemoryDoctors = [...initialDoctors];

/**
 * @desc   Hospital adds a new doctor to its institution
 * @route  POST /api/hospital/doctors
 * @access Private (Hospital only)
 */
const addDoctorByHospital = async (req, res, next) => {
  try {
    const hospitalId = req.user?.hospitalId || req.hospitalScope || 'hosp_1';
    const hospitalName = req.user?.name || req.user?.legalName || 'KMCH Hospital';
    const {
      doctorName,
      name,
      email,
      specialization,
      specialty,
      qualification,
      experience,
      consultationFee,
      fee,
      availability
    } = req.body;

    const finalName = doctorName || name;
    const finalSpecialty = specialization || specialty || 'General Physician';
    const finalFee = consultationFee || (fee ? parseInt(fee.replace(/\D/g, ''), 10) : 400);

    if (!finalName || !email) {
      return res.status(400).json({
        success: false,
        message: 'Doctor name and email are required.'
      });
    }

    const uniqueDocId = generateDoctorId('DOC');

    const newDoctorData = {
      doctorId: uniqueDocId,
      id: uniqueDocId,
      doctorName: finalName,
      name: finalName,
      email: email.toLowerCase().trim(),
      specialization: finalSpecialty,
      qualification: qualification || 'MBBS, MD',
      experience: experience || '8+ Years Exp',
      hospitalId,
      hospital: hospitalName,
      hospitalName,
      consultationFee: finalFee,
      availability: availability || {
        online: {
          days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
          timing: '04:00 PM - 08:00 PM',
          slots: ['04:00 PM', '05:00 PM', '06:00 PM', '07:00 PM'],
          isAvailable: true
        },
        offline: {
          days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
          timing: '09:00 AM - 01:00 PM',
          slots: ['09:30 AM', '10:30 AM', '11:30 AM', '12:30 PM'],
          isAvailable: true
        },
        availableDays: 'Mon - Sat',
        timing: '09:00 AM - 01:00 PM & 04:00 PM - 08:00 PM',
        availableSlots: ['09:30 AM', '10:30 AM', '11:30 AM', '04:00 PM', '05:00 PM', '06:00 PM'],
        isAvailableOnline: true
      }
    };

    if (getDBStatus()) {
      try {
        await Doctor.create(newDoctorData);
      } catch (dbErr) {
        console.warn('Doctor DB save notice:', dbErr.message);
      }
    }

    inMemoryDoctors.push(newDoctorData);

    return res.status(201).json({
      success: true,
      message: `Doctor ${finalName} successfully added to hospital staff.`,
      doctor: newDoctorData
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc   Hospital views all its affiliated doctors
 * @route  GET /api/hospital/doctors
 * @access Private (Hospital only)
 */
const getDoctorsByHospital = async (req, res, next) => {
  try {
    const hospitalId = req.user?.hospitalId || req.hospitalScope || req.query.hospitalId || 'hosp_1';

    let doctors = [];
    if (getDBStatus()) {
      try {
        doctors = await Doctor.find({ hospitalId }).sort({ createdAt: -1 });
      } catch (dbErr) {
        // Fallback
      }
    }

    if (!doctors || doctors.length === 0) {
      doctors = inMemoryDoctors.filter((d) => !d.hospitalId || d.hospitalId === hospitalId);
    }

    return res.status(200).json({
      success: true,
      count: doctors.length,
      hospitalId,
      doctors
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc   Hospital updates a doctor record
 * @route  PUT /api/hospital/doctors/:id
 * @access Private (Hospital only)
 */
const updateDoctorByHospital = async (req, res, next) => {
  try {
    const hospitalId = req.user?.hospitalId || req.hospitalScope || 'hosp_1';
    const { id } = req.params;

    let updated = null;
    if (getDBStatus()) {
      try {
        updated = await Doctor.findOneAndUpdate(
          { $or: [{ doctorId: id }, { _id: id }], hospitalId },
          { $set: req.body },
          { new: true, runValidators: true }
        );
      } catch (dbErr) {
        // Fallback
      }
    }

    const docIndex = inMemoryDoctors.findIndex(
      (d) => (d.doctorId === id || d.id === id) && (!d.hospitalId || d.hospitalId === hospitalId)
    );

    if (docIndex !== -1) {
      inMemoryDoctors[docIndex] = { ...inMemoryDoctors[docIndex], ...req.body };
      updated = inMemoryDoctors[docIndex];
    }

    if (!updated) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found in this hospital roster.'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Doctor updated successfully.',
      doctor: updated
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc   Doctor updates own professional profile
 * @route  PUT /api/doctor/profile
 * @access Private (Doctor only)
 */
const updateDoctorProfile = async (req, res, next) => {
  try {
    const doctorId = req.user?.doctorId || req.user?.id || 'doc_1';

    let updated = null;
    if (getDBStatus()) {
      try {
        updated = await Doctor.findOneAndUpdate(
          { $or: [{ doctorId }, { _id: doctorId }] },
          { $set: req.body },
          { new: true, runValidators: true }
        );
      } catch (dbErr) {
        // Fallback
      }
    }

    const index = inMemoryDoctors.findIndex((d) => d.doctorId === doctorId || d.id === doctorId);
    if (index !== -1) {
      inMemoryDoctors[index] = { ...inMemoryDoctors[index], ...req.body };
      updated = inMemoryDoctors[index];
    }

    return res.status(200).json({
      success: true,
      message: 'Doctor profile updated successfully.',
      doctor: updated || req.body
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc   Doctor configures separate online and offline availability
 * @route  PUT /api/doctor/availability
 * @access Private (Doctor only)
 */
const updateDoctorAvailability = async (req, res, next) => {
  try {
    const doctorId = req.user?.doctorId || req.user?.id || 'doc_1';
    const { online, offline } = req.body;

    const updatePayload = {};
    if (online) {
      updatePayload['availability.online'] = {
        days: online.days || ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        timing: online.timing || '04:00 PM - 08:00 PM',
        slots: online.slots || ['04:00 PM', '05:00 PM', '06:00 PM', '07:00 PM'],
        isAvailable: online.isAvailable !== false
      };
    }

    if (offline) {
      updatePayload['availability.offline'] = {
        days: offline.days || ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
        timing: offline.timing || '09:00 AM - 01:00 PM',
        slots: offline.slots || ['09:30 AM', '10:30 AM', '11:30 AM', '12:30 PM'],
        isAvailable: offline.isAvailable !== false
      };
    }

    let doctorDoc = null;
    if (getDBStatus()) {
      try {
        doctorDoc = await Doctor.findOneAndUpdate(
          { $or: [{ doctorId }, { _id: doctorId }] },
          { $set: updatePayload },
          { new: true }
        );
      } catch (dbErr) {
        // Fallback
      }
    }

    const index = inMemoryDoctors.findIndex((d) => d.doctorId === doctorId || d.id === doctorId);
    if (index !== -1) {
      inMemoryDoctors[index].availability = {
        ...(inMemoryDoctors[index].availability || {}),
        online: online || inMemoryDoctors[index].availability?.online,
        offline: offline || inMemoryDoctors[index].availability?.offline
      };
      doctorDoc = inMemoryDoctors[index];
    }

    return res.status(200).json({
      success: true,
      message: 'Doctor online and offline availability schedule updated successfully.',
      availability: doctorDoc?.availability || { online, offline }
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc   Get doctor availability schedule
 * @route  GET /api/doctor/availability
 * @access Public / Private
 */
const getDoctorAvailability = async (req, res, next) => {
  try {
    const doctorId = req.params.id || req.user?.doctorId || req.query.doctorId || 'doc_1';

    let doc = inMemoryDoctors.find((d) => d.doctorId === doctorId || d.id === doctorId);
    if (getDBStatus()) {
      try {
        const found = await Doctor.findOne({ $or: [{ doctorId }, { _id: doctorId }] });
        if (found) doc = found;
      } catch (e) {}
    }

    if (!doc) {
      return res.status(404).json({ success: false, message: 'Doctor not found.' });
    }

    const availability = doc.availability || {
      online: {
        days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        timing: '04:00 PM - 08:00 PM',
        slots: ['04:00 PM', '05:00 PM', '06:00 PM', '07:00 PM'],
        isAvailable: true
      },
      offline: {
        days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
        timing: '09:00 AM - 01:00 PM',
        slots: ['09:30 AM', '10:30 AM', '11:30 AM', '12:30 PM'],
        isAvailable: true
      }
    };

    return res.status(200).json({
      success: true,
      doctorId: doc.doctorId || doc.id,
      doctorName: doc.doctorName || doc.name,
      specialization: doc.specialization || doc.specialty,
      consultationFee: doc.consultationFee || 400,
      availability
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc   List all doctors with specialization and online/offline availability
 * @route  GET /api/doctors or /api/public/doctors
 * @access Public
 */
const getAllDoctorsWithAvailability = async (req, res, next) => {
  try {
    const { hospitalId, specialization, specialty, type, search } = req.query;

    let list = inMemoryDoctors;
    if (getDBStatus()) {
      try {
        const dbDocs = await Doctor.find({});
        if (dbDocs.length > 0) list = dbDocs;
      } catch (e) {}
    }

    if (hospitalId) {
      list = list.filter((d) => d.hospitalId === hospitalId);
    }

    const specFilter = specialization || specialty;
    if (specFilter) {
      list = list.filter(
        (d) => (d.specialization || d.specialty || '').toLowerCase() === specFilter.toLowerCase()
      );
    }

    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (d) =>
          (d.doctorName || d.name || '').toLowerCase().includes(q) ||
          (d.specialization || d.specialty || '').toLowerCase().includes(q) ||
          (d.hospital || d.hospitalName || '').toLowerCase().includes(q)
      );
    }

    // Filter by online or offline availability flag if specified
    if (type) {
      const t = type.toLowerCase();
      if (t === 'online') {
        list = list.filter((d) => d.availability?.online?.isAvailable !== false);
      } else if (t === 'offline') {
        list = list.filter((d) => d.availability?.offline?.isAvailable !== false);
      }
    }

    // Format response ensuring specialization and availability are structured
    const formatted = list.map((d) => {
      const docObj = d.toObject ? d.toObject() : { ...d };
      const onlineAvail = docObj.availability?.online || {
        days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
        timing: '04:00 PM - 08:00 PM',
        slots: ['04:00 PM', '05:00 PM', '06:00 PM', '07:00 PM'],
        isAvailable: true
      };
      const offlineAvail = docObj.availability?.offline || {
        days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
        timing: '09:00 AM - 01:00 PM',
        slots: ['09:30 AM', '10:30 AM', '11:30 AM', '12:30 PM'],
        isAvailable: true
      };

      return {
        doctorId: docObj.doctorId || docObj.id,
        doctorName: docObj.doctorName || docObj.name,
        specialization: docObj.specialization || docObj.specialty || 'General Physician',
        qualification: docObj.qualification || 'MBBS, MD',
        experience: docObj.experience || '10+ Years Exp',
        hospitalId: docObj.hospitalId || 'hosp_1',
        hospitalName: docObj.hospitalName || docObj.hospital || 'KMCH (Kovai Medical Center)',
        consultationFee: docObj.consultationFee || 400,
        currency: 'INR',
        rating: docObj.rating || 4.9,
        avatar: docObj.avatar,
        availability: {
          online: onlineAvail,
          offline: offlineAvail
        }
      };
    });

    return res.status(200).json({
      success: true,
      count: formatted.length,
      doctors: formatted
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  addDoctorByHospital,
  getDoctorsByHospital,
  updateDoctorByHospital,
  updateDoctorProfile,
  updateDoctorAvailability,
  getDoctorAvailability,
  getAllDoctorsWithAvailability
};


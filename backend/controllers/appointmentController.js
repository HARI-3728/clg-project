const { Appointment, Doctor, Hospital, Patient } = require('../models');
const { dataStore, saveStore } = require('../data/store');
const { getDBStatus } = require('../config/db');

/**
 * Format date string YYYY-MM-DD
 */
const formatDateKey = (dateInput) => {
  if (!dateInput) return '';
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return String(dateInput);
  return d.toISOString().split('T')[0];
};

/**
 * @desc   Calculate open/available time slots for Doctor by Date and Type
 * @route  GET /api/appointments/available-slots
 * @access Public / Authenticated
 */
const getAvailableSlots = async (req, res, next) => {
  try {
    const { doctorId, date, appointmentDate, type, appointmentType, hospitalId } = req.query;
    const finalDocId = doctorId;
    const targetDateStr = formatDateKey(date || appointmentDate);
    const targetType = (type || appointmentType || 'ONLINE').toUpperCase();

    if (!finalDocId || !targetDateStr) {
      return res.status(400).json({
        success: false,
        message: 'Both doctorId and appointmentDate are required to check slot availability.'
      });
    }

    // Default slot banks
    const defaultOnlineSlots = ['04:00 PM', '05:00 PM', '06:00 PM', '07:00 PM'];
    const defaultOfflineSlots = ['09:30 AM', '10:30 AM', '11:30 AM', '12:30 PM'];

    let docRecord = null;
    if (getDBStatus()) {
      try {
        docRecord = await Doctor.findOne({ $or: [{ doctorId: finalDocId }, { _id: finalDocId }] });
      } catch (e) {}
    }

    let allConfiguredSlots = targetType === 'ONLINE' ? defaultOnlineSlots : defaultOfflineSlots;

    if (docRecord?.availability) {
      const schedule = targetType === 'ONLINE' ? docRecord.availability.online : docRecord.availability.offline;
      if (schedule?.slots && schedule.slots.length > 0) {
        allConfiguredSlots = schedule.slots;
      } else if (docRecord.availability.availableSlots?.length > 0) {
        allConfiguredSlots = docRecord.availability.availableSlots;
      }
    }

    // Fetch already booked appointments on this date for this doctor
    let bookedTimes = [];
    if (getDBStatus()) {
      try {
        const queryDate = new Date(targetDateStr);
        const nextDay = new Date(queryDate);
        nextDay.setDate(nextDay.getDate() + 1);

        const activeApts = await Appointment.find({
          doctorId: finalDocId,
          appointmentDate: { $gte: queryDate, $lt: nextDay },
          status: { $nin: ['CANCELLED', 'Declined', 'Cancelled'] }
        });
        bookedTimes = activeApts.map((a) => a.appointmentTime);
      } catch (e) {}
    }

    // Also check runtime store
    const storeBooked = dataStore.appointments
      .filter((a) => {
        const matchDoc = a.doctorId === finalDocId || a.doctor === finalDocId || a.doctor?.toLowerCase().includes('kumar');
        const matchDate = formatDateKey(a.date || a.appointmentDate) === targetDateStr;
        const isActive = !['CANCELLED', 'Cancelled', 'Declined'].includes(a.status);
        return matchDoc && matchDate && isActive;
      })
      .map((a) => a.time || a.appointmentTime);

    const allBookedTimes = Array.from(new Set([...bookedTimes, ...storeBooked]));

    // Available slots are configured slots minus already booked slots
    const availableSlots = allConfiguredSlots.filter((slot) => !allBookedTimes.includes(slot));

    return res.status(200).json({
      success: true,
      doctorId: finalDocId,
      appointmentDate: targetDateStr,
      appointmentType: targetType,
      hospitalId: hospitalId || docRecord?.hospitalId || 'hosp_1',
      totalSlots: allConfiguredSlots.length,
      bookedSlots: allBookedTimes,
      availableSlots,
      isFullyBooked: availableSlots.length === 0
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc   Book Online Appointment (Patient → Doctor → Available Date → Available Time → Confirm)
 * @route  POST /api/appointments/online
 * @access Private (Patient)
 */
const bookOnlineAppointment = async (req, res, next) => {
  try {
    const { patientId, doctorId, appointmentDate, appointmentTime, notes } = req.body;
    const finalPatientId = patientId || req.user?.patientId || req.user?.medicalID || 'usr_101';
    const dateStr = formatDateKey(appointmentDate);

    if (!doctorId || !dateStr || !appointmentTime) {
      return res.status(400).json({
        success: false,
        message: 'Doctor, appointment date, and appointment time are required.'
      });
    }

    // 1. Concurrency Double-Booking Check
    const isSlotTaken = dataStore.appointments.some((a) => {
      const matchDoc = a.doctorId === doctorId || a.doctor === doctorId;
      const matchDate = formatDateKey(a.date || a.appointmentDate) === dateStr;
      const matchTime = (a.time || a.appointmentTime) === appointmentTime;
      const isActive = !['CANCELLED', 'Cancelled', 'Declined'].includes(a.status);
      return matchDoc && matchDate && matchTime && isActive;
    });

    if (isSlotTaken) {
      return res.status(409).json({
        success: false,
        message: `Double-booking prevention: Slot "${appointmentTime}" on ${dateStr} is already booked. Please choose an open slot.`
      });
    }

    // 2. Fetch doctor profile for hospital affiliation
    let docObj = null;
    if (getDBStatus()) {
      try {
        docObj = await Doctor.findOne({ $or: [{ doctorId }, { _id: doctorId }] });
      } catch (e) {}
    }

    const hospitalId = docObj?.hospitalId || 'hosp_1';
    const hospitalName = docObj?.hospitalName || docObj?.hospital || 'KMCH (Kovai Medical Center)';
    const doctorName = docObj?.doctorName || docObj?.name || 'Dr. Kumar';

    const uniqueId = `APT-ONL-${Math.floor(1000 + Math.random() * 9000)}`;
    const roomCode = `MEDICARE-ROOM-${Math.floor(1000 + Math.random() * 9000)}`;

    const newAppointment = {
      id: uniqueId,
      appointmentId: uniqueId,
      patientId: finalPatientId,
      patientName: req.user?.name || 'Thamizh',
      doctorId,
      doctor: doctorName,
      specialty: docObj?.specialization || 'Specialist',
      hospitalId,
      hospital: hospitalName,
      appointmentDate: new Date(dateStr),
      date: dateStr,
      appointmentTime,
      time: appointmentTime,
      appointmentType: 'ONLINE',
      type: 'Online',
      status: 'Accepted',
      doctorAccepted: true,
      consultationAvailable: true,
      roomCode,
      notes: notes || 'Online video consultation request'
    };

    if (getDBStatus()) {
      try {
        await Appointment.create(newAppointment);
      } catch (dbErr) {
        console.warn('Appointment DB save notice:', dbErr.message);
      }
    }

    dataStore.appointments.unshift(newAppointment);
    saveStore();

    return res.status(201).json({
      success: true,
      message: 'Online teleconsultation appointment successfully confirmed.',
      appointment: newAppointment
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc   Book Offline Appointment (Patient → Hospital → Doctor → Available Date → Available Time → Confirm)
 * @route  POST /api/appointments/offline
 * @access Private (Patient)
 */
const bookOfflineAppointment = async (req, res, next) => {
  try {
    const { patientId, hospitalId, doctorId, appointmentDate, appointmentTime, notes } = req.body;
    const finalPatientId = patientId || req.user?.patientId || req.user?.medicalID || 'usr_101';
    const dateStr = formatDateKey(appointmentDate);

    if (!hospitalId || !doctorId || !dateStr || !appointmentTime) {
      return res.status(400).json({
        success: false,
        message: 'Hospital, doctor, appointment date, and appointment time are required.'
      });
    }

    // 1. Concurrency Double-Booking Check
    const isSlotTaken = dataStore.appointments.some((a) => {
      const matchDoc = a.doctorId === doctorId || a.doctor === doctorId;
      const matchDate = formatDateKey(a.date || a.appointmentDate) === dateStr;
      const matchTime = (a.time || a.appointmentTime) === appointmentTime;
      const isActive = !['CANCELLED', 'Cancelled', 'Declined'].includes(a.status);
      return matchDoc && matchDate && matchTime && isActive;
    });

    if (isSlotTaken) {
      return res.status(409).json({
        success: false,
        message: `Double-booking prevention: Slot "${appointmentTime}" on ${dateStr} is already booked at this hospital. Please select another slot.`
      });
    }

    let docObj = null;
    let hospObj = null;
    if (getDBStatus()) {
      try {
        docObj = await Doctor.findOne({ $or: [{ doctorId }, { _id: doctorId }] });
        hospObj = await Hospital.findOne({ $or: [{ hospitalId }, { _id: hospitalId }] });
      } catch (e) {}
    }

    const hospitalName = hospObj?.hospitalName || 'KMCH (Kovai Medical Center and Hospital)';
    const doctorName = docObj?.doctorName || docObj?.name || 'Dr. Kumar';
    const uniqueId = `APT-OFF-${Math.floor(1000 + Math.random() * 9000)}`;
    const tokenNo = `TK-OPD-${Math.floor(10 + Math.random() * 80)}`;

    const newAppointment = {
      id: uniqueId,
      appointmentId: uniqueId,
      patientId: finalPatientId,
      patientName: req.user?.name || 'Thamizh',
      hospitalId,
      hospital: hospitalName,
      clinicAddress: hospObj?.address?.fullAddress || 'Avinashi Road, Peelamedu, Coimbatore',
      doctorId,
      doctor: doctorName,
      specialty: docObj?.specialization || 'General Medicine',
      appointmentDate: new Date(dateStr),
      date: dateStr,
      appointmentTime,
      time: appointmentTime,
      appointmentType: 'OFFLINE',
      type: 'Offline',
      status: 'Confirmed',
      doctorAccepted: true,
      tokenNo,
      notes: notes || 'Physical OPD consultation'
    };

    if (getDBStatus()) {
      try {
        await Appointment.create(newAppointment);
      } catch (dbErr) {
        console.warn('Appointment DB save notice:', dbErr.message);
      }
    }

    dataStore.appointments.unshift(newAppointment);
    saveStore();

    return res.status(201).json({
      success: true,
      message: 'Offline hospital OPD appointment confirmed.',
      appointment: newAppointment
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc   View Patient Appointments (categorized into upcoming & previous)
 * @route  GET /api/patient/appointments
 * @access Private (Patient)
 */
const getPatientAppointments = async (req, res, next) => {
  try {
    const patientId = req.user?.patientId || req.user?.medicalID || req.query.patientId || 'usr_101';
    const { filter } = req.query; // 'upcoming' | 'previous'

    const todayStr = new Date().toISOString().split('T')[0];

    let allApts = dataStore.appointments.filter(
      (a) => !a.patientId || a.patientId === patientId || a.patientId === 'usr_101'
    );

    const upcoming = allApts.filter((a) => {
      const aptDate = formatDateKey(a.date || a.appointmentDate);
      return aptDate >= todayStr && a.status !== 'Cancelled' && a.status !== 'CANCELLED';
    });

    const previous = allApts.filter((a) => {
      const aptDate = formatDateKey(a.date || a.appointmentDate);
      return aptDate < todayStr || a.status === 'Cancelled' || a.status === 'CANCELLED' || a.status === 'Completed';
    });

    if (filter === 'upcoming') {
      return res.status(200).json(upcoming);
    }
    if (filter === 'previous') {
      return res.status(200).json(previous);
    }

    return res.status(200).json(allApts);
  } catch (err) {
    next(err);
  }
};

/**
 * @desc   View Doctor Appointments
 * @route  GET /api/doctor/appointments
 * @access Private (Doctor)
 */
const getDoctorAppointments = async (req, res, next) => {
  try {
    const doctorId = req.user?.doctorId || req.user?.id || req.query.doctorId || 'doc_1';
    const { date, status, type } = req.query;

    let list = dataStore.appointments.filter(
      (a) => a.doctorId === doctorId || a.doctor === doctorId || (a.doctor && a.doctor.includes('Kumar'))
    );

    if (date) {
      const dKey = formatDateKey(date);
      list = list.filter((a) => formatDateKey(a.date || a.appointmentDate) === dKey);
    }

    if (status) {
      list = list.filter((a) => a.status.toLowerCase() === status.toLowerCase());
    }

    if (type) {
      list = list.filter((a) => (a.appointmentType || a.type || '').toUpperCase() === type.toUpperCase());
    }

    return res.status(200).json({
      success: true,
      count: list.length,
      appointments: list
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc   View Hospital Appointments
 * @route  GET /api/hospital/appointments
 * @access Private (Hospital)
 */
const getHospitalAppointments = async (req, res, next) => {
  try {
    const hospitalId = req.user?.hospitalId || req.hospitalScope || req.query.hospitalId || 'hosp_1';
    const { date, doctorId } = req.query;

    let list = dataStore.appointments.filter(
      (a) => !a.hospitalId || a.hospitalId === hospitalId || a.hospital?.includes('KMCH')
    );

    if (date) {
      const dKey = formatDateKey(date);
      list = list.filter((a) => formatDateKey(a.date || a.appointmentDate) === dKey);
    }

    if (doctorId) {
      list = list.filter((a) => a.doctorId === doctorId);
    }

    return res.status(200).json({
      success: true,
      hospitalId,
      count: list.length,
      appointments: list
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc   Cancel an appointment (frees time slot)
 * @route  PUT /api/appointments/:id/cancel
 * @access Private
 */
const cancelAppointment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const apt = dataStore.appointments.find((a) => a.id === id || a.appointmentId === id);

    if (!apt) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }

    apt.status = 'CANCELLED';
    apt.cancelledAt = new Date().toISOString();
    apt.cancellationReason = req.body.reason || 'Cancelled by user';

    if (getDBStatus()) {
      try {
        await Appointment.findOneAndUpdate(
          { $or: [{ appointmentId: id }, { _id: id }] },
          { $set: { status: 'CANCELLED' } }
        );
      } catch (e) {}
    }

    saveStore();

    return res.status(200).json({
      success: true,
      message: 'Appointment cancelled successfully. Slot is now free for booking.',
      appointment: apt
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc   Reschedule appointment to a new open slot
 * @route  PUT /api/appointments/:id/reschedule
 * @access Private
 */
const rescheduleAppointment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { newDate, date, newTime, time } = req.body;
    const targetDate = formatDateKey(newDate || date);
    const targetTime = newTime || time;

    if (!targetDate || !targetTime) {
      return res.status(400).json({
        success: false,
        message: 'Both newDate and newTime are required to reschedule.'
      });
    }

    const apt = dataStore.appointments.find((a) => a.id === id || a.appointmentId === id);
    if (!apt) {
      return res.status(404).json({ success: false, message: 'Appointment not found.' });
    }

    // Check double-booking for the target date/time
    const isTaken = dataStore.appointments.some((a) => {
      const isOther = (a.id !== id && a.appointmentId !== id);
      const matchDoc = a.doctorId === apt.doctorId;
      const matchDate = formatDateKey(a.date || a.appointmentDate) === targetDate;
      const matchTime = (a.time || a.appointmentTime) === targetTime;
      const isActive = !['CANCELLED', 'Cancelled', 'Declined'].includes(a.status);
      return isOther && matchDoc && matchDate && matchTime && isActive;
    });

    if (isTaken) {
      return res.status(409).json({
        success: false,
        message: `Slot "${targetTime}" on ${targetDate} is already occupied. Please select an available slot.`
      });
    }

    apt.date = targetDate;
    apt.appointmentDate = new Date(targetDate);
    apt.time = targetTime;
    apt.appointmentTime = targetTime;
    apt.status = 'Rescheduled';

    if (getDBStatus()) {
      try {
        await Appointment.findOneAndUpdate(
          { $or: [{ appointmentId: id }, { _id: id }] },
          {
            $set: {
              appointmentDate: new Date(targetDate),
              appointmentTime: targetTime,
              status: 'RESCHEDULED'
            }
          }
        );
      } catch (e) {}
    }

    saveStore();

    return res.status(200).json({
      success: true,
      message: `Appointment successfully rescheduled to ${targetDate} at ${targetTime}.`,
      appointment: apt
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getAvailableSlots,
  bookOnlineAppointment,
  bookOfflineAppointment,
  getPatientAppointments,
  getDoctorAppointments,
  getHospitalAppointments,
  cancelAppointment,
  rescheduleAppointment
};


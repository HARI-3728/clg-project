const { dataStore, saveStore } = require('../data/store');

// Accept an appointment request
const acceptAppointment = (req, res) => {
  const apt = dataStore.appointments.find((a) => a.id === req.params.id);
  if (!apt) return res.status(404).json({ error: 'Appointment not found' });
  apt.status = 'Accepted';
  apt.doctorAccepted = true;
  apt.consultationAvailable = true;
  apt.roomCode = apt.roomCode || `MEDICARE-DR-${Math.floor(1000 + Math.random() * 9000)}`;
  saveStore();
  res.json({ success: true, appointment: apt });
};

// Reject an appointment request
const rejectAppointment = (req, res) => {
  const apt = dataStore.appointments.find((a) => a.id === req.params.id);
  if (!apt) return res.status(404).json({ error: 'Appointment not found' });
  apt.status = 'Declined';
  apt.doctorAccepted = false;
  apt.consultationAvailable = false;
  apt.declineReason = req.body.reason || 'Doctor unavailable at selected time';
  saveStore();
  res.json({ success: true, appointment: apt });
};

// Update status
const updateAppointmentStatus = (req, res) => {
  const apt = dataStore.appointments.find((a) => a.id === req.params.id);
  if (!apt) return res.status(404).json({ error: 'Appointment not found' });
  apt.status = req.body.status || apt.status;
  saveStore();
  res.json(apt);
};

// Issue new prescription
const issuePrescription = (req, res) => {
  const newRx = {
    id: `rx_${Date.now()}`,
    code: `RX-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
    status: 'ACTIVE',
    saved: false,
    reminderEnabled: true,
    prescriptionDate: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
    ...req.body
  };
  dataStore.prescriptions.unshift(newRx);
  saveStore();
  res.status(201).json({ success: true, prescription: newRx });
};

module.exports = {
  acceptAppointment,
  rejectAppointment,
  updateAppointmentStatus,
  issuePrescription
};


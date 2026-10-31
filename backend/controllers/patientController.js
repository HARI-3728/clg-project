const { dataStore, saveStore } = require('../data/store');

// GET patient profile
const getPatientProfile = (req, res) => {
  res.json(dataStore.profile);
};

// PRESCRIPTIONS
const getPrescriptions = (req, res) => {
  res.json(dataStore.prescriptions);
};

const savePrescription = (req, res) => {
  const rx = dataStore.prescriptions.find((p) => p.id === req.params.id);
  if (!rx) return res.status(404).json({ error: 'Prescription not found' });
  rx.saved = !rx.saved;
  saveStore();
  res.json({ success: true, saved: rx.saved, message: rx.saved ? 'Prescription saved to records' : 'Prescription unpinned' });
};

const togglePrescriptionReminder = (req, res) => {
  const rx = dataStore.prescriptions.find((p) => p.id === req.params.id);
  if (!rx) return res.status(404).json({ error: 'Prescription not found' });
  rx.reminderEnabled = !rx.reminderEnabled;
  saveStore();
  res.json({ success: true, reminderEnabled: rx.reminderEnabled, message: rx.reminderEnabled ? 'Reminders activated' : 'Reminders muted' });
};

// ROUTINE MEDICINES
const getRoutineMedicines = (req, res) => {
  res.json(dataStore.routineMedicines);
};

const addRoutineMedicine = (req, res) => {
  const newItem = {
    id: `rtm_${Date.now()}`,
    takenToday: false,
    lastTakenAt: null,
    reminderEnabled: true,
    ...req.body
  };
  dataStore.routineMedicines.push(newItem);
  saveStore();
  res.status(201).json(newItem);
};

const updateRoutineMedicine = (req, res) => {
  const index = dataStore.routineMedicines.findIndex((m) => m.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'Routine medicine not found' });
  dataStore.routineMedicines[index] = { ...dataStore.routineMedicines[index], ...req.body };
  saveStore();
  res.json(dataStore.routineMedicines[index]);
};

const deleteRoutineMedicine = (req, res) => {
  dataStore.routineMedicines = dataStore.routineMedicines.filter((m) => m.id !== req.params.id);
  saveStore();
  res.json({ success: true, message: 'Routine medicine deleted' });
};

// REPORTS
const getReports = (req, res) => {
  res.json(dataStore.reports);
};

const addReport = (req, res) => {
  const newReport = {
    id: `rep_${Date.now()}`,
    uploadDate: new Date().toISOString().split('T')[0],
    isPrivate: true,
    status: 'Uploaded / Processing',
    ...req.body
  };
  dataStore.reports.unshift(newReport);
  saveStore();
  res.status(201).json(newReport);
};

const deleteReport = (req, res) => {
  dataStore.reports = dataStore.reports.filter((r) => r.id !== req.params.id);
  saveStore();
  res.json({ success: true, message: 'Report deleted' });
};

// APPOINTMENTS
const getAppointments = (req, res) => {
  res.json(dataStore.appointments);
};

const createAppointment = (req, res) => {
  const isOnline = req.body.type === 'Online';
  const newAppointment = {
    id: `APT-${isOnline ? 'ONL' : 'OFF'}-${Math.floor(1000 + Math.random() * 9000)}`,
    status: isOnline ? 'Pending Doctor Acceptance' : 'Confirmed',
    doctorAccepted: !isOnline,
    tokenNo: !isOnline ? `TK-OPD-${Math.floor(10 + Math.random() * 80)}` : undefined,
    roomCode: isOnline ? `MEDICARE-ROOM-${Math.floor(1000 + Math.random() * 9000)}` : undefined,
    ...req.body
  };
  dataStore.appointments.unshift(newAppointment);
  saveStore();
  res.status(201).json(newAppointment);
};

const rescheduleAppointment = (req, res) => {
  const apt = dataStore.appointments.find((a) => a.id === req.params.id);
  if (!apt) return res.status(404).json({ error: 'Appointment not found' });
  apt.date = req.body.date || apt.date;
  apt.time = req.body.time || apt.time;
  apt.status = 'Rescheduled';
  saveStore();
  res.json(apt);
};

const cancelAppointment = (req, res) => {
  const apt = dataStore.appointments.find((a) => a.id === req.params.id);
  if (!apt) return res.status(404).json({ error: 'Appointment not found' });
  apt.status = 'Cancelled';
  saveStore();
  res.json(apt);
};

// NOTIFICATIONS
const getNotifications = (req, res) => {
  res.json(dataStore.notifications);
};

const markNotificationRead = (req, res) => {
  const notif = dataStore.notifications.find((n) => n.id === req.params.id);
  if (!notif) return res.status(404).json({ error: 'Notification not found' });
  notif.unread = false;
  saveStore();
  res.json(notif);
};

const markAllNotificationsRead = (req, res) => {
  dataStore.notifications.forEach((n) => { n.unread = false; });
  saveStore();
  res.json({ success: true });
};

const deleteNotification = (req, res) => {
  dataStore.notifications = dataStore.notifications.filter((n) => n.id !== req.params.id);
  saveStore();
  res.json({ success: true });
};

// ORDERS
const getOrders = (req, res) => {
  res.json(dataStore.orders);
};

const createOrder = (req, res) => {
  const newOrder = {
    id: `ord_${Date.now()}`,
    orderNumber: `ORD-2026-${Math.floor(1000 + Math.random() * 9000)}`,
    status: 'Confirmed',
    orderDate: new Date().toISOString().split('T')[0],
    orderTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    billed: false,
    ...req.body
  };
  dataStore.orders.unshift(newOrder);
  saveStore();
  res.status(201).json(newOrder);
};

// REMINDERS & VACCINATIONS & DIAGNOSTICS
const getReminders = (req, res) => res.json(dataStore.reminders);
const getVaccinations = (req, res) => res.json(dataStore.vaccinations);
const getDiagnosticBookings = (req, res) => res.json(dataStore.diagnosticBookings);

const emergencyCall = (req, res) => {
  res.json({ success: true, message: 'Emergency dispatch pinged. Ambulance units alerted.' });
};

module.exports = {
  getPatientProfile,
  getPrescriptions,
  savePrescription,
  togglePrescriptionReminder,
  getRoutineMedicines,
  addRoutineMedicine,
  updateRoutineMedicine,
  deleteRoutineMedicine,
  getReports,
  addReport,
  deleteReport,
  getAppointments,
  createAppointment,
  rescheduleAppointment,
  cancelAppointment,
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  deleteNotification,
  getOrders,
  createOrder,
  getReminders,
  getVaccinations,
  getDiagnosticBookings,
  emergencyCall
};


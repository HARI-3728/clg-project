const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const { connectDB, getDBStatus, getDBError, sanitizeURI } = require('./config/db');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

// Route imports
const authRoutes = require('./routes/authRoutes');
const publicRoutes = require('./routes/publicRoutes');
const patientRoutes = require('./routes/patientRoutes');
const doctorRoutes = require('./routes/doctorRoutes');
const hospitalRoutes = require('./routes/hospitalRoutes');
const appointmentRoutes = require('./routes/appointmentRoutes');
const prescriptionRoutes = require('./routes/prescriptionRoutes');
const reminderRoutes = require('./routes/reminderRoutes');
const dietRoutes = require('./routes/dietRoutes');

const app = express();
const PORT = process.env.BACKEND_PORT || process.env.PORT || 5000;

// Global Middlewares
app.use(cors({
  origin: true,
  credentials: true
}));
app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));

// Static file serving for securely uploaded medical reports
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Health Check API
app.get('/api/health', (req, res) => {
  const isDbConnected = getDBStatus();
  const dbError = getDBError();
  const rawUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/medicare_db';
  res.status(200).json({
    status: 'ONLINE',
    database: {
      status: isDbConnected ? 'CONNECTED' : 'DISCONNECTED',
      uri: sanitizeURI(rawUri),
      error: dbError ? `${dbError.code || dbError.name || 'ERROR'}: ${dbError.message}` : null
    },
    service: 'MediCare+ Healthcare Backend API',
    version: '2.5.0',
    timestamp: new Date().toISOString(),
    modules: [
      'Doctor Management',
      'Appointment Management (Online/Offline)',
      'Prescription Management',
      'Automatic Medicine Reminders',
      'Medical History & Secure Reports',
      'Educational Diet Plans'
    ]
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/public', publicRoutes);
app.use('/api/medicines', publicRoutes);
app.use('/api/hospitals', publicRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api/patient', patientRoutes);
app.use('/api/doctor', doctorRoutes);
app.use('/api/hospital', hospitalRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/prescriptions', prescriptionRoutes);
app.use('/api/reminders', reminderRoutes);
app.use('/api/diet-plans', dietRoutes);

// Error Handlers
app.use(notFound);
app.use(errorHandler);

// Start Server (Connect to MongoDB before accepting requests)
const startServer = async () => {
  await connectDB();

  if (process.env.NODE_ENV !== 'test') {
    app.listen(PORT, () => {
      console.log(`\n======================================================`);
      console.log(`🏥 MediCare+ Healthcare Backend Server Running`);
      console.log(`   Port:         http://localhost:${PORT}`);
      console.log(`   Health:       http://localhost:${PORT}/api/health`);
      console.log(`   Appointments: http://localhost:${PORT}/api/appointments/available-slots`);
      console.log(`   Diet Plans:   http://localhost:${PORT}/api/diet-plans`);
      console.log(`======================================================\n`);
    });
  }
};

startServer();

module.exports = app;

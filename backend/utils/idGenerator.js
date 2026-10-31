const generatePatientId = () => {
  const random4 = Math.floor(1000 + Math.random() * 9000);
  const random3 = Math.floor(100 + Math.random() * 900);
  return `MC-${random4}-${random3}`;
};

const generateDoctorId = (prefix = 'DOC') => {
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  return `${prefix}-${randomNum}`;
};

const generateHospitalId = (name = 'HOSP') => {
  const code = name.replace(/[^a-zA-Z]/g, '').slice(0, 4).toUpperCase();
  const randomNum = Math.floor(100 + Math.random() * 900);
  return `HOSP-${code}-${randomNum}`;
};

module.exports = {
  generatePatientId,
  generateDoctorId,
  generateHospitalId
};


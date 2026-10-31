const { initialMedicines, initialHospitals, initialDoctors } = require('../data/seedData');

/**
 * @desc   Get public catalogue of medicines
 * @route  GET /api/public/medicines or /api/medicines
 * @access Public
 */
const getPublicMedicines = (req, res) => {
  const { search, category } = req.query;
  let list = [...initialMedicines];

  if (search) {
    const q = search.toLowerCase();
    list = list.filter(
      (m) => m.name.toLowerCase().includes(q) || (m.generalPurpose && m.generalPurpose.toLowerCase().includes(q))
    );
  }

  if (category && category !== 'all') {
    list = list.filter((m) => m.category && m.category.toLowerCase().includes(category.toLowerCase()));
  }

  res.status(200).json(list);
};

/**
 * @desc   Get single medicine details
 * @route  GET /api/public/medicines/:id
 * @access Public
 */
const getMedicineById = (req, res) => {
  const medicine = initialMedicines.find((m) => m.id === req.params.id);
  if (!medicine) {
    return res.status(404).json({ success: false, message: 'Medicine not found' });
  }
  res.status(200).json(medicine);
};

/**
 * @desc   Get list of verified hospitals
 * @route  GET /api/public/hospitals or /api/hospitals
 * @access Public
 */
const getPublicHospitals = (req, res) => {
  res.status(200).json(initialHospitals);
};

/**
 * @desc   Get list of verified doctors
 * @route  GET /api/public/doctors or /api/doctors
 * @access Public
 */
const getPublicDoctors = (req, res) => {
  const { hospitalId, specialty } = req.query;
  let list = [...initialDoctors];

  if (hospitalId) {
    list = list.filter((d) => d.hospitalId === hospitalId);
  }
  if (specialty) {
    list = list.filter((d) => d.specialty.toLowerCase() === specialty.toLowerCase());
  }

  res.status(200).json(list);
};

module.exports = {
  getPublicMedicines,
  getMedicineById,
  getPublicHospitals,
  getPublicDoctors
};


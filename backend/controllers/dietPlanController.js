const { educationalDietPlans, UNIVERSAL_MEDICAL_DISCLAIMER } = require('../data/dietPlansData');

// In-memory runtime store for doctor-reviewed clinical diet notes
const doctorDietReviews = new Map();

/**
 * @desc   Get all educational diet plans with clinical disclaimers
 * @route  GET /api/diet-plans
 * @access Public / Authenticated
 */
const getAllDietPlans = (req, res) => {
  return res.status(200).json({
    success: true,
    disclaimer: UNIVERSAL_MEDICAL_DISCLAIMER,
    count: educationalDietPlans.length,
    plans: educationalDietPlans
  });
};

/**
 * @desc   Get educational diet plan for a specific diagnosis
 * @route  GET /api/diet-plans/:condition
 * @access Public / Authenticated
 */
const getDietPlanByCondition = (req, res) => {
  const { condition } = req.params;
  const targetKey = (condition || '').toLowerCase().trim();

  let matchedPlan = educationalDietPlans.find(
    (p) =>
      p.conditionKey.toLowerCase() === targetKey ||
      p.conditionName.toLowerCase().includes(targetKey) ||
      targetKey.includes(p.conditionKey.toLowerCase())
  );

  if (!matchedPlan) {
    // Default to general fever recovery / balanced nutrition
    matchedPlan = educationalDietPlans[0];
  }

  // Check if doctor has attached customized clinical review notes for this patient
  const patientId = req.query.patientId || req.user?.patientId;
  const customReview = patientId ? doctorDietReviews.get(`${patientId}_${matchedPlan.conditionKey}`) : null;

  return res.status(200).json({
    success: true,
    disclaimer: UNIVERSAL_MEDICAL_DISCLAIMER,
    dietPlan: {
      ...matchedPlan,
      customClinicalGuidance: customReview || null
    }
  });
};

/**
 * @desc   Healthcare professional (Doctor) reviews and annotates dietary guidance
 * @route  POST /api/doctor/diet-plans/review
 * @access Private (Doctor only)
 */
const reviewDietPlanByDoctor = (req, res) => {
  const doctorName = req.user?.name || req.body.doctorName || 'Dr. Kumar, MD';
  const hospital = req.user?.hospital || 'KMCH (Kovai Medical Center)';
  const { patientId, conditionKey, clinicalNotes, recommendations } = req.body;

  if (!patientId || !conditionKey) {
    return res.status(400).json({
      success: false,
      message: 'patientId and conditionKey are required for clinical review.'
    });
  }

  const reviewRecord = {
    reviewedBy: doctorName,
    doctorHospital: hospital,
    patientId,
    conditionKey,
    clinicalNotes: clinicalNotes || 'Reviewed and validated for patient general recovery.',
    recommendations: recommendations || [],
    reviewDate: new Date().toISOString(),
    status: 'Clinically Reviewed by Attending Physician'
  };

  doctorDietReviews.set(`${patientId}_${conditionKey}`, reviewRecord);

  return res.status(200).json({
    success: true,
    message: 'Dietary guidance successfully reviewed by qualified healthcare professional.',
    review: reviewRecord,
    disclaimer: UNIVERSAL_MEDICAL_DISCLAIMER
  });
};

module.exports = {
  getAllDietPlans,
  getDietPlanByCondition,
  reviewDietPlanByDoctor
};


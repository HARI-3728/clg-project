const express = require('express');
const router = express.Router();
const {
  getAllDietPlans,
  getDietPlanByCondition,
  reviewDietPlanByDoctor
} = require('../controllers/dietPlanController');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');

// Public educational diet plans
router.get('/', getAllDietPlans);
router.get('/:condition', getDietPlanByCondition);

// Healthcare professional review & clinical notes
router.post('/review', protect, authorizeRoles('doctor'), reviewDietPlanByDoctor);

module.exports = router;


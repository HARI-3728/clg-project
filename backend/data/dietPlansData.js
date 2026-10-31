// MediCare+ Educational Diet Information Knowledge Base
// IMPORTANT: Educational guidance only. Does not replace professional medical diagnosis or prescription.

const UNIVERSAL_MEDICAL_DISCLAIMER =
  'DISCLAIMER: This dietary information is provided strictly for educational and general health guidance purposes. It does not constitute medical advice, diagnosis, or an individualized prescription. Dietary requirements vary based on personal clinical history, medications, and metabolic state. Always consult your attending physician or a qualified clinical nutritionist before altering your diet.';

const educationalDietPlans = [
  {
    conditionKey: 'fever',
    conditionName: 'Viral Fever & Acute Infections',
    planName: 'Fever Recovery & Hydration Diet Plan',
    purpose: 'Support immune recovery, prevent dehydration, and provide easily assimilable caloric intake during fever.',
    disclaimer: UNIVERSAL_MEDICAL_DISCLAIMER,
    clinicalReview: {
      reviewedByProfessional: true,
      reviewer: 'Dr. Kumar, MD (General Medicine) - KMCH Hospital',
      reviewStatus: 'Approved for General Educational Use',
      lastReviewedDate: '2026-10-15',
      clinicalNotes: 'Hydration and electrolyte balance are paramount during pyrexia. Light warm meals reduce metabolic stress.'
    },
    hydrationAdvice: 'Consume 2.5 to 3 liters of fluids daily including tender coconut water, clear broth, and oral rehydration solution (ORS).',
    meals: {
      breakfast: 'Warm thin rice porridge (kanji) or idli with mild coriander chutney. Tender coconut water.',
      midMorning: 'Pomegranate juice or warm clear vegetable soup.',
      lunch: 'Steamed rice with light moong dal, boiled vegetables (carrots, bottle gourd), and fresh curd.',
      eveningSnack: 'Steamed apples or hot water with a dash of honey and tulsi.',
      dinner: 'Light oats porridge or vegetable khichdi with boiled potatoes.',
      bedtime: 'Warm turmeric milk or herbal chamomile infusion.'
    },
    recommendedFoods: [
      'Tender coconut water and ORS',
      'Clear vegetable and chicken soups',
      'Steamed idlis, rice kanji, and moong dal khichdi',
      'Boiled potatoes, carrots, and pumpkin',
      'Citrus fruits (oranges, sweet limes) rich in vitamin C'
    ],
    foodsToAvoid: [
      'Deep-fried and excessively oily foods',
      'Extremely spicy curries and heavy masalas',
      'Cold carbonated beverages and unpasteurized milk',
      'Heavy red meats and processed junk snacks'
    ]
  },
  {
    conditionKey: 'diabetes',
    conditionName: 'Type-2 Diabetes & Glycemic Control',
    planName: 'Diabetic & Low Glycemic Diet Plan',
    purpose: 'Promote stable postprandial blood glucose, avoid insulin spikes, and ensure adequate fiber intake.',
    disclaimer: UNIVERSAL_MEDICAL_DISCLAIMER,
    clinicalReview: {
      reviewedByProfessional: true,
      reviewer: 'Dr. Priya, MD (Diabetology) - GKNM Hospital',
      reviewStatus: 'Approved for General Educational Use',
      lastReviewedDate: '2026-10-18',
      clinicalNotes: 'Pair complex carbohydrates with protein and fiber. Avoid skipped meals to mitigate hypoglycemia risk.'
    },
    hydrationAdvice: 'Drink 2.5 liters of clean water daily. Plain buttermilk or fenugreek-infused water is recommended.',
    meals: {
      breakfast: 'Oats upma with vegetables or multi-grain dosas with mint chutney and boiled egg whites.',
      midMorning: 'A handful of soaked almonds and walnuts or one small guava.',
      lunch: 'Brown rice or millet roti with mixed vegetable sabzi, dal, and cucumber raita.',
      eveningSnack: 'Roasted chana (Bengal gram) or green tea with sugar-free multi-grain biscuit.',
      dinner: 'Two multigrain rotis with grilled paneer/tofu or steamed fish and fresh green salad.',
      bedtime: 'Warm skimmed milk with a pinch of cinnamon.'
    },
    recommendedFoods: [
      'Whole millets (ragi, bajra, foxtail millet)',
      'High-fiber legumes (green gram, chickpeas, lentils)',
      'Leafy greens (spinach, methi, moringa leaves)',
      'Low glycemic fruits (guava, green apples, berries, papaya in moderation)',
      'Healthy nuts (walnuts, almonds, chia seeds)'
    ],
    foodsToAvoid: [
      'Refined sugars, sweets, jaggery, and honey in excess',
      'White bread, refined maida, and polished white rice',
      'Sugar-sweetened sodas and packaged fruit juices',
      'Deep-fried snacks and pastries'
    ]
  },
  {
    conditionKey: 'hypertension',
    conditionName: 'Hypertension & Cardiovascular Health',
    planName: 'DASH & Low Sodium Cardiovascular Diet Plan',
    purpose: 'Lower systolic/diastolic blood pressure, reduce vascular resistance, and supply potassium-magnesium balance.',
    disclaimer: UNIVERSAL_MEDICAL_DISCLAIMER,
    clinicalReview: {
      reviewedByProfessional: true,
      reviewer: 'Dr. Kumar, MD - KMCH Cardiology Care Wing',
      reviewStatus: 'Approved for General Educational Use',
      lastReviewedDate: '2026-10-20',
      clinicalNotes: 'Dietary sodium restriction (<2g/day) in tandem with regular aerobic activity produces marked pressure reduction.'
    },
    hydrationAdvice: 'Drink 2 to 2.5 liters of water daily. Avoid high-sodium packaged sports drinks.',
    meals: {
      breakfast: 'Whole wheat toast with unsalted peanut butter and sliced banana, or vegetable poha with less salt.',
      midMorning: 'Fresh unsalted tomato juice or coconut water.',
      lunch: 'Brown rice, yellow dal tadka (low salt), sautéed beans, and fresh beet-cucumber salad with lemon.',
      eveningSnack: 'Steamed corn or plain unsalted makhana (fox nuts).',
      dinner: 'Two chapattis with methi dal or grilled lean chicken and steamed broccoli.',
      bedtime: 'Warm low-fat milk.'
    },
    recommendedFoods: [
      'Potassium-rich foods (bananas, sweet potatoes, spinach)',
      'Fresh garlic, ginger, and lemon for flavor without added salt',
      'Unsalted seeds (flaxseeds, sunflower seeds, pumpkin seeds)',
      'Whole grains (oats, quinoa, brown rice)'
    ],
    foodsToAvoid: [
      'Pickles, papads, and canned soups with high sodium preservatives',
      'Processed cheeses and cured meats',
      'Excessive caffeine, energy drinks, and alcohol',
      'Salted potato crisps and commercial sauces (soy sauce, ketchup)'
    ]
  },
  {
    conditionKey: 'gastritis',
    conditionName: 'Acidity, GERD & Gastritis',
    planName: 'Bland Gastrointestinal & Anti-Acidity Diet Plan',
    purpose: 'Soothe gastric mucosal lining, prevent acid reflux, and promote painless gastric emptying.',
    disclaimer: UNIVERSAL_MEDICAL_DISCLAIMER,
    clinicalReview: {
      reviewedByProfessional: true,
      reviewer: 'KMCH Gastroenterology Department',
      reviewStatus: 'Approved for General Educational Use',
      lastReviewedDate: '2026-10-12',
      clinicalNotes: 'Avoid lying down within 2 hours after meals. Prefer small, frequent alkaline meals.'
    },
    hydrationAdvice: 'Sip tender coconut water or cumin-boiled water through the day. Avoid drinking large volumes during meals.',
    meals: {
      breakfast: 'Oatmeal made with water and almond milk, topped with banana slices.',
      midMorning: 'Tender coconut water or fresh chilled watermelon slices.',
      lunch: 'Steamed rice with yellow moong dal and bottle gourd (lauki) sabzi. Fresh probiotic yogurt.',
      eveningSnack: 'Dry toast or boiled sweet potato cubes.',
      dinner: 'Soft khichdi with boiled zucchini or pumpkin soup.',
      bedtime: 'Cold skimmed milk with no added sugar.'
    },
    recommendedFoods: [
      'Alkaline fruits (bananas, melons, apples)',
      'Probiotic curd and homemade buttermilk',
      'Soft-cooked grains (oatmeal, rice, boiled potatoes)',
      'Cooling spices (cumin, fennel, coriander)'
    ],
    foodsToAvoid: [
      'Excessively spicy foods and chili powders',
      'Citrus fruits (lemons, tomatoes, vinegar) in acute flare-ups',
      'Carbonated soft drinks, coffee, and black tea',
      'Deep fried foods and peppermint'
    ]
  }
];

module.exports = {
  UNIVERSAL_MEDICAL_DISCLAIMER,
  educationalDietPlans
};


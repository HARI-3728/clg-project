import React, { useState } from 'react';
import {
  Clock,
  Flame,
  HeartPulse,
  CheckCircle2,
  AlertTriangle,
  Info,
  Calendar,
  Utensils,
  Apple,
  Coffee,
  Sun,
  Sunset,
  Moon,
  Sparkles,
  ShieldCheck,
  Stethoscope,
  ChevronRight
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { usePatientData } from '../context/PatientContext';
import './pages.css';

// 7-Day Weekly Meal Database (Affordable, balanced, familiar foods)
const weeklyMealPlan = {
  Monday: {
    veg: {
      breakfast: 'Steamed Idli (3 pcs) with vegetable sambar & fresh mint-coriander chutney',
      midMorning: 'Tender coconut water and a small bowl of fresh papaya slices',
      lunch: 'Steamed brown or white rice with yellow dal tadka, carrot-beans poriyal, and fresh curd',
      eveningSnack: 'Roasted chana (chickpeas) with green tea or spiced buttermilk (chaas)',
      dinner: 'Warm phulkas / whole wheat rotis (2) with mixed vegetable sabzi and cucumber salad'
    },
    nonVeg: {
      breakfast: '2 Boiled eggs with whole wheat toast & a glass of warm milk or tea',
      midMorning: 'Tender coconut water and a small bowl of seasonal fruit slices',
      lunch: 'Steamed rice with homemade light chicken curry, vegetable poriyal, and fresh curd',
      eveningSnack: 'Roasted makhana / chana with green tea',
      dinner: 'Whole wheat phulkas (2) with grilled chicken breast / egg curry and cucumber salad'
    }
  },
  Tuesday: {
    veg: {
      breakfast: 'Vegetable Upma prepared with semolina, carrots, peas, and roasted peanuts',
      midMorning: '1 Medium fresh apple or guava with a glass of water',
      lunch: 'Chapatis (2) with paneer bhurji / soy chunks curry, spinach dal, and sliced tomatoes',
      eveningSnack: 'Boiled sweet corn with a pinch of black pepper and lemon juice',
      dinner: 'Comforting Moong dal khichdi with roasted papad and vegetable raita'
    },
    nonVeg: {
      breakfast: 'Egg omelette with sautéed bell peppers, onions, and 2 brown bread slices',
      midMorning: 'Fresh seasonal fruit bowl (papaya or apple)',
      lunch: 'Chapatis (2) with fish curry, spinach dal, and cucumber-tomato salad',
      eveningSnack: 'Boiled sweet corn / egg white chaat with lemon juice',
      dinner: 'Light Moong dal khichdi with steamed fish or chicken soup'
    }
  },
  Wednesday: {
    veg: {
      breakfast: 'Oats porridge cooked with low-fat milk, topped with sliced banana and 4 almonds',
      midMorning: 'Spiced buttermilk (neer more) infused with curry leaves and ginger',
      lunch: 'Steamed rice with South-Indian rasam, cluster beans / kovakkai poriyal, and boiled egg / curd',
      eveningSnack: 'Steamed sundal (boiled white chickpeas tossed with mustard and grated coconut)',
      dinner: 'Millet or whole wheat dosa (2) with tomato chutney and warm vegetable stew'
    },
    nonVeg: {
      breakfast: 'Scrambled eggs (2) with whole grain toast and sliced banana',
      midMorning: 'Spiced buttermilk with curry leaves and ginger',
      lunch: 'Steamed rice with light fish stew / rasam, vegetable poriyal, and salad',
      eveningSnack: 'Steamed chickpea sundal with green tea',
      dinner: 'Whole wheat dosa (2) with light chicken stew and coconut chutney'
    }
  },
  Thursday: {
    veg: {
      breakfast: 'Poha with potatoes, onions, green peas, and crushed roasted peanuts',
      midMorning: 'Fresh pomegranate bowl (1 small cup) with water',
      lunch: 'Phulkas (2) with Rajma masala (kidney beans curry), cucumber raita, and steamed rice',
      eveningSnack: 'Whole wheat digestive biscuits (2) with green tea or masala tea',
      dinner: 'Vegetable daliya (broken wheat porridge) loaded with carrots, beans, and coriander'
    },
    nonVeg: {
      breakfast: 'Boiled egg bhurji with toasted multigrain bread and tea',
      midMorning: 'Fresh pomegranate bowl or orange slices',
      lunch: 'Phulkas (2) with egg curry or light chicken gravy, rice, and mixed salad',
      eveningSnack: 'Roasted murmura (puffed rice) with green tea',
      dinner: 'Broken wheat daliya with shredded chicken and carrots'
    }
  },
  Friday: {
    veg: {
      breakfast: 'Millet Pongal with coconut chutney and hot drumstick sambar',
      midMorning: '1 Fresh pear or orange with a handful of soaked pumpkin seeds',
      lunch: 'Steamed rice with mixed vegetable sambar, snake gourd poriyal, and freshly set curd',
      eveningSnack: 'Handful of roasted peanuts and dried raisins',
      dinner: 'Whole wheat chapatis (2) with Methi (fenugreek) paneer sabzi and mint raita'
    },
    nonVeg: {
      breakfast: 'Poached eggs (2) on whole wheat toast with a cup of black coffee or tea',
      midMorning: 'Fresh citrus fruit (orange or sweet lime)',
      lunch: 'Steamed rice with regional fish curry, vegetable poriyal, and curd',
      eveningSnack: 'Roasted peanuts and raisins with green tea',
      dinner: 'Chapatis (2) with grilled chicken tikka / fish and steamed greens'
    }
  },
  Saturday: {
    veg: {
      breakfast: 'Ragi (finger millet) Dosa with onion-tomato chutney and vegetable kootu',
      midMorning: 'Glass of tender coconut water or fresh lemonade',
      lunch: 'Curd rice tempered with mustard & pomegranate, paired with potato-peas dry curry',
      eveningSnack: 'Fruit chaat (guava, cucumber, apple sprinkled with chaat masala)',
      dinner: 'Vegetable stuffed paratha (cooked with minimal oil) with plain curd and pickle'
    },
    nonVeg: {
      breakfast: 'Ragi dosa with egg curry or chicken mince kheema',
      midMorning: 'Tender coconut water or fresh lemonade',
      lunch: 'Steamed rice with chicken curry, curd, and cucumber salad',
      eveningSnack: 'Fruit chaat or boiled egg with chaat masala',
      dinner: 'Stuffed vegetable & chicken wrap with curd dip'
    }
  },
  Sunday: {
    veg: {
      breakfast: 'Warm whole wheat Aloo-Gobhi paratha (light oil) with homemade mint curd',
      midMorning: 'Fresh watermelon or muskmelon bowl',
      lunch: 'Fragrant vegetable pulao with soy chunks, onion raita, and mixed vegetable gravy',
      eveningSnack: 'Occasional treat allowance (e.g. 1 small samosa or baked snack) with ginger tea',
      dinner: 'Light vegetable soup with toasted bread and warm moong dal khichdi'
    },
    nonVeg: {
      breakfast: 'Masala French toast (2 slices) with fruit bowl and green tea',
      midMorning: 'Fresh watermelon or muskmelon slices',
      lunch: 'Sunday family chicken biryani (moderate portion) with onion-cucumber raita and boiled egg',
      eveningSnack: 'Occasional favorite snack in moderation with tea',
      dinner: 'Light clear chicken vegetable soup with phulkas and salad'
    }
  }
};

// Health Context Educational Database
const healthContextData = {
  fever: {
    title: 'Fever & Acute Infection Recovery',
    tag: 'Hydration & Easy Toleration',
    color: '#2563eb',
    bgColor: '#eff6ff',
    borderColor: '#bfdbfe',
    overview: 'During an infection or fever, the body experiences higher metabolic rates and fluid loss through sweating. The priority is staying well-hydrated and consuming gentle, easily digestible foods.',
    hydrationGuidelines: [
      'Tender coconut water: rich in natural electrolytes (potassium & sodium)',
      'Clear vegetable or chicken broth: provides warming amino acids and sodium',
      'Oral Rehydration Solution (ORS) or electrolyte water if fluid loss is pronounced',
      'Warm herbal teas (ginger, tulsi) or warm water with a squeeze of lemon'
    ],
    soothingFoods: [
      'Moong dal khichdi cooked to a soft consistency with minimal spices',
      'Steamed idlis with light sambar or warm rasam',
      'Rice gruel (kanji / congee) with a pinch of rock salt',
      'Soft boiled vegetables like carrots, bottle gourd, and pumpkin'
    ],
    foodsToAvoid: [
      'Heavy deep-fried savories and oily curries that strain digestion',
      'Excessively spicy foods that cause gastric distress during illness',
      'Very cold refrigerated beverages that can trigger throat discomfort'
    ]
  },
  acidity: {
    title: 'Acidity & Acid Reflux (GERD)',
    tag: 'Gastric Soothing & Trigger Awareness',
    color: '#d97706',
    bgColor: '#fffbeb',
    borderColor: '#fde68a',
    overview: 'Acidity and gastroesophageal reflux occur when stomach acids flow back into the esophagus. Modifying meal size, timing, and identifying personal food triggers can significantly relieve discomfort.',
    hydrationGuidelines: [
      'Sip room-temperature water throughout the day; avoid drinking large volumes during meals',
      'Chilled low-fat milk or fresh buttermilk with a pinch of roasted cumin',
      'Mild chamomile or licorice infusion; avoid peppermint tea which relaxes the lower esophageal sphincter'
    ],
    soothingFoods: [
      'Oatmeal and broken wheat daliya: naturally non-acidic and absorbent',
      'Ripe bananas and melons: alkaline fruits that buffer acidity',
      'Steamed green vegetables like beans, zucchini, and spinach',
      'Lean proteins (boiled egg whites, steamed fish, plain tofu)'
    ],
    foodsToAvoid: [
      'Citrus fruits (lemon, oranges, sour tomatoes) on an empty stomach',
      'Coffee, strong tea, carbonated sodas, and energy drinks',
      'Heavy late-night dinners eaten less than 2-3 hours before lying down',
      'Deep-fried snacks, raw garlic, and excessive chili powders'
    ]
  },
  anemia: {
    title: 'Anemia & Iron Support',
    tag: 'Iron Absorption & Nutritional Diversity',
    color: '#dc2626',
    bgColor: '#fef2f2',
    borderColor: '#fecaca',
    overview: 'Nutritional anemia often stems from inadequate dietary iron, vitamin B12, or folate. Emphasizing iron-rich whole foods along with natural absorption enhancers aids blood cell renewal.',
    hydrationGuidelines: [
      'Fresh amla (Indian gooseberry) juice: powerhouse of Vitamin C to boost iron absorption',
      'Pomegranate and beetroot smoothie diluted with water',
      'Avoid drinking strong tea or coffee immediately with meals, as polyphenols inhibit iron uptake'
    ],
    soothingFoods: [
      'Dark leafy greens: Moringa (drumstick leaves), methi, and spinach cooked with tomatoes',
      'Legumes & pulses: Black chana, rajma, lentils, and sprouted moong',
      'Jaggery with roasted peanuts, dry dates, and raisins as healthy snacks',
      'Non-veg options: Organ meats, egg yolks, and poultry providing high-bioavailability heme iron'
    ],
    foodsToAvoid: [
      'Consuming calcium supplements or huge glasses of milk directly with iron-rich main meals (calcium competes for absorption)',
      'Excessive refined flour (maida) products lacking natural trace minerals'
    ]
  },
  diabetes_bp: {
    title: 'Diabetes & High Blood Pressure (Hypertension)',
    tag: 'Glycemic Balance & Sodium Moderation',
    color: '#059669',
    bgColor: '#ecfdf5',
    borderColor: '#a7f3d0',
    overview: 'Lifestyle management of glycemic response and vascular health centers on whole-grain complex carbohydrates, dietary fiber, and mindful sodium moderation.',
    hydrationGuidelines: [
      'Plain water (aim for 2.5 - 3 liters daily unless restricted by a doctor)',
      'Unsweetened green tea, cinnamon-infused warm water, or fenugreek seed water in the morning',
      'Fresh lemon water without added sugar or high-sodium syrup'
    ],
    soothingFoods: [
      'Millets (ragi, foxtail, jowar) and whole wheat instead of polished white carbohydrates',
      'High-soluble fiber legumes, beans, and lentils that slow carbohydrate breakdown',
      'Potassium-rich vegetables: bottle gourd, ridge gourd, ash gourd, and steamed greens',
      'Nuts and seeds: walnuts, flaxseeds, and chia seeds for omega-3 fatty acids'
    ],
    foodsToAvoid: [
      'High sodium foods: store-bought pickles, papads, instant noodles, and processed salted meats',
      'Refined sugars, packaged sweets, soft drinks, and refined corn syrups',
      'Trans-fat rich bakery items and deep-fried fast food'
    ]
  }
};

export const DietPlan = () => {
  const { prescriptions = [], appointments = [] } = usePatientData();

  // Active Main Tab: 'weekly' (Section A) or 'educational' (Section B)
  const [activeMainTab, setActiveMainTab] = useState('weekly');

  // Section A State
  const [selectedDay, setSelectedDay] = useState('Monday');
  const [dietType, setDietType] = useState('veg'); // 'veg' | 'nonVeg'

  // Section B State
  const [selectedCondition, setSelectedCondition] = useState('fever');

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const currentDailyPlan = weeklyMealPlan[selectedDay][dietType];
  const activeConditionInfo = healthContextData[selectedCondition];

  // Check for relevant active doctor prescriptions
  const relevantPrescription = prescriptions.find(
    p => (p.status === 'ACTIVE' || !p.status) && (p.dietPlanCondition || p.instructions)
  );

  return (
    <div className="diet-plan-page fade-in" style={{ maxWidth: '1200px', margin: '0 auto' }}>
      {/* Page Header */}
      <div className="page-header" style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 className="page-title">Diet Plan & Nutrition Portal</h1>
          <p className="page-subtitle">7-day balanced weekly meal planner & evidence-based educational health guidance</p>
        </div>
      </div>

      {/* Main Module Tabs (Section A vs Section B) */}
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '2rem', background: 'var(--neutral-100)', padding: '0.35rem', borderRadius: 'var(--radius-lg)', width: 'fit-content' }}>
        <button
          onClick={() => setActiveMainTab('weekly')}
          style={{
            padding: '0.65rem 1.5rem',
            borderRadius: 'var(--radius-md)',
            fontWeight: '800',
            fontSize: '0.95rem',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            backgroundColor: activeMainTab === 'weekly' ? 'var(--primary-600)' : 'transparent',
            color: activeMainTab === 'weekly' ? 'white' : 'var(--neutral-700)',
            transition: 'all 0.2s',
            boxShadow: activeMainTab === 'weekly' ? '0 2px 8px rgba(37,99,235,0.25)' : 'none'
          }}
        >
          <Utensils size={18} />
          Section A: 7-Day Weekly Meal Planner
        </button>

        <button
          onClick={() => setActiveMainTab('educational')}
          style={{
            padding: '0.65rem 1.5rem',
            borderRadius: 'var(--radius-md)',
            fontWeight: '800',
            fontSize: '0.95rem',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            backgroundColor: activeMainTab === 'educational' ? 'var(--primary-600)' : 'transparent',
            color: activeMainTab === 'educational' ? 'white' : 'var(--neutral-700)',
            transition: 'all 0.2s',
            boxShadow: activeMainTab === 'educational' ? '0 2px 8px rgba(37,99,235,0.25)' : 'none'
          }}
        >
          <HeartPulse size={18} />
          Section B: General Health-Context Information
        </button>
      </div>

      {/* ========================================================================= */}
      {/* SECTION A: GENERAL WEEKLY PLAN (7-DAY PLANNER WITH 5 MEAL SLOTS)        */}
      {/* ========================================================================= */}
      {activeMainTab === 'weekly' && (
        <div className="fade-in">
          {/* Day Selector & Veg/Non-Veg Toggle */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
            {/* Days Tabs */}
            <div style={{ display: 'flex', gap: '0.4rem', overflowX: 'auto', paddingBottom: '0.25rem' }}>
              {daysOfWeek.map((day) => (
                <button
                  key={day}
                  onClick={() => setSelectedDay(day)}
                  style={{
                    padding: '0.55rem 1.15rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid',
                    borderColor: selectedDay === day ? 'var(--primary-600)' : 'var(--border-subtle)',
                    backgroundColor: selectedDay === day ? 'var(--primary-600)' : 'white',
                    color: selectedDay === day ? 'white' : 'var(--neutral-700)',
                    fontWeight: '800',
                    fontSize: '0.875rem',
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {day}
                </button>
              ))}
            </div>

            {/* Veg / Non-Veg Switcher */}
            <div style={{ display: 'flex', gap: '0.4rem', backgroundColor: 'var(--neutral-100)', padding: '0.25rem', borderRadius: 'var(--radius-md)' }}>
              <button
                onClick={() => setDietType('veg')}
                style={{
                  padding: '0.45rem 1rem',
                  borderRadius: 'var(--radius-sm)',
                  border: 'none',
                  cursor: 'pointer',
                  fontWeight: '800',
                  fontSize: '0.825rem',
                  backgroundColor: dietType === 'veg' ? '#059669' : 'transparent',
                  color: dietType === 'veg' ? 'white' : 'var(--neutral-600)',
                  transition: 'all 0.15s'
                }}
              >
                🌱 Vegetarian
              </button>
              <button
                onClick={() => setDietType('nonVeg')}
                style={{
                  padding: '0.45rem 1rem',
                  borderRadius: 'var(--radius-sm)',
                  border: 'none',
                  cursor: 'pointer',
                  fontWeight: '800',
                  fontSize: '0.825rem',
                  backgroundColor: dietType === 'nonVeg' ? '#b45309' : 'transparent',
                  color: dietType === 'nonVeg' ? 'white' : 'var(--neutral-600)',
                  transition: 'all 0.15s'
                }}
              >
                🍗 Non-Veg Alternatives
              </button>
            </div>
          </div>

          {/* Current Day Title Banner */}
          <div style={{ marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Calendar size={20} color="var(--primary-600)" />
            <h2 style={{ fontSize: '1.35rem', fontWeight: '900', margin: 0, color: 'var(--neutral-900)' }}>
              {selectedDay}'s Balanced Daily Routine ({dietType === 'veg' ? 'Vegetarian' : 'Non-Vegetarian Options'})
            </h2>
          </div>

          {/* 5 Meal Slots Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
            {/* 1. Breakfast */}
            <Card style={{ padding: '1.5rem', borderTop: '4px solid #2563eb', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <div style={{ width: '38px', height: '38px', borderRadius: '50%', backgroundColor: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Sun size={20} />
                </div>
                <div>
                  <span style={{ fontSize: '0.75rem', fontWeight: '800', color: '#2563eb', textTransform: 'uppercase' }}>Slot 1 • 07:30 - 08:30 AM</span>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: '800', margin: 0 }}>Breakfast</h3>
                </div>
              </div>
              <p style={{ fontSize: '0.925rem', color: 'var(--neutral-800)', lineHeight: '1.5', margin: 0 }}>
                {currentDailyPlan.breakfast}
              </p>
            </Card>

            {/* 2. Mid-Morning Snack */}
            <Card style={{ padding: '1.5rem', borderTop: '4px solid #059669', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <div style={{ width: '38px', height: '38px', borderRadius: '50%', backgroundColor: '#ecfdf5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Apple size={20} />
                </div>
                <div>
                  <span style={{ fontSize: '0.75rem', fontWeight: '800', color: '#059669', textTransform: 'uppercase' }}>Slot 2 • 11:00 AM</span>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: '800', margin: 0 }}>Mid-Morning Snack</h3>
                </div>
              </div>
              <p style={{ fontSize: '0.925rem', color: 'var(--neutral-800)', lineHeight: '1.5', margin: 0 }}>
                {currentDailyPlan.midMorning}
              </p>
            </Card>

            {/* 3. Lunch */}
            <Card style={{ padding: '1.5rem', borderTop: '4px solid #d97706', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <div style={{ width: '38px', height: '38px', borderRadius: '50%', backgroundColor: '#fffbeb', color: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Utensils size={20} />
                </div>
                <div>
                  <span style={{ fontSize: '0.75rem', fontWeight: '800', color: '#d97706', textTransform: 'uppercase' }}>Slot 3 • 01:00 - 02:00 PM</span>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: '800', margin: 0 }}>Lunch</h3>
                </div>
              </div>
              <p style={{ fontSize: '0.925rem', color: 'var(--neutral-800)', lineHeight: '1.5', margin: 0 }}>
                {currentDailyPlan.lunch}
              </p>
            </Card>

            {/* 4. Evening Snack */}
            <Card style={{ padding: '1.5rem', borderTop: '4px solid #7c3aed', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <div style={{ width: '38px', height: '38px', borderRadius: '50%', backgroundColor: '#f5f3ff', color: '#7c3aed', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Coffee size={20} />
                </div>
                <div>
                  <span style={{ fontSize: '0.75rem', fontWeight: '800', color: '#7c3aed', textTransform: 'uppercase' }}>Slot 4 • 05:00 - 05:30 PM</span>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: '800', margin: 0 }}>Evening Snack</h3>
                </div>
              </div>
              <p style={{ fontSize: '0.925rem', color: 'var(--neutral-800)', lineHeight: '1.5', margin: 0 }}>
                {currentDailyPlan.eveningSnack}
              </p>
            </Card>

            {/* 5. Dinner */}
            <Card style={{ padding: '1.5rem', borderTop: '4px solid #0284c7', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <div style={{ width: '38px', height: '38px', borderRadius: '50%', backgroundColor: '#f0f9ff', color: '#0284c7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Moon size={20} />
                </div>
                <div>
                  <span style={{ fontSize: '0.75rem', fontWeight: '800', color: '#0284c7', textTransform: 'uppercase' }}>Slot 5 • 07:30 - 08:30 PM</span>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: '800', margin: 0 }}>Dinner</h3>
                </div>
              </div>
              <p style={{ fontSize: '0.925rem', color: 'var(--neutral-800)', lineHeight: '1.5', margin: 0 }}>
                {currentDailyPlan.dinner}
              </p>
            </Card>
          </div>

          {/* Balanced Non-Judgmental Occasional Foods Guidance */}
          <Card style={{ padding: '1.75rem', backgroundColor: '#fefce8', border: '1px solid #fef08a', marginBottom: '2.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
              <div style={{ width: '44px', height: '44px', borderRadius: '50%', backgroundColor: '#facc15', color: '#713f12', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Sparkles size={24} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: '800', color: '#713f12', margin: '0 0 0.4rem 0' }}>
                  Occasional Foods & Mindful Moderation
                </h3>
                <p style={{ fontSize: '0.9rem', color: '#854d0e', lineHeight: '1.6', margin: 0 }}>
                  Enjoying favorite snacks, sweets, or comfort foods occasionally is a normal, sustainable part of life. Rather than strict guilt or total elimination, practice mindful portion awareness: savor smaller servings slowly alongside your regular nutrient-rich meals. Balancing occasional treats with daily hydration and wholesome staples keeps nutrition positive and realistic.
                </p>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION B: GENERAL HEALTH-CONTEXT INFORMATION                            */}
      {/* ========================================================================= */}
      {activeMainTab === 'educational' && (
        <div className="fade-in">
          {/* Medical Disclaimer Banner */}
          <div style={{ padding: '1rem 1.25rem', backgroundColor: '#f8fafc', borderRadius: 'var(--radius-lg)', border: '1px solid #cbd5e1', marginBottom: '1.75rem', display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
            <Info size={20} color="#64748b" style={{ flexShrink: 0, marginTop: '2px' }} />
            <div style={{ fontSize: '0.85rem', color: '#475569', lineHeight: '1.5' }}>
              <strong>Educational Information Only:</strong> The general health-context guidelines below are for informational and educational awareness only. They do not constitute a medical diagnosis, clinical diet prescription, or claim to cure diseases. Nutritional needs vary widely between individuals. Always consult a qualified medical doctor or registered clinical dietitian for personalized therapy.
            </div>
          </div>

          {/* Distinct Doctor-Provided Instructions (When Available) */}
          {relevantPrescription && (
            <Card style={{ padding: '1.5rem', marginBottom: '2rem', borderLeft: '6px solid #2563eb', backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', flexWrap: 'wrap' }}>
                <div style={{ width: '44px', height: '44px', borderRadius: '50%', backgroundColor: '#059669', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Stethoscope size={24} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                    <span className="badge badge-success" style={{ fontWeight: '800' }}>DOCTOR-PROVIDED INSTRUCTION</span>
                    <span style={{ fontSize: '0.8rem', color: '#047857' }}>From Prescription #{relevantPrescription.code || relevantPrescription.id}</span>
                  </div>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: '800', color: '#065f46', margin: '0 0 0.35rem 0' }}>
                    Clinical Advice by Dr. {relevantPrescription.doctorName || 'Consultant'} ({relevantPrescription.hospitalName || 'KMCH'})
                  </h3>
                  <p style={{ fontSize: '0.9rem', color: '#047857', margin: '0 0 0.5rem 0', lineHeight: '1.5' }}>
                    "{relevantPrescription.instructions}"
                  </p>
                  {relevantPrescription.dietPlanName && (
                    <span style={{ fontSize: '0.8rem', fontWeight: '700', color: '#065f46', backgroundColor: '#dcfce7', padding: '0.2rem 0.6rem', borderRadius: 'var(--radius-sm)' }}>
                      Associated Plan: {relevantPrescription.dietPlanName}
                    </span>
                  )}
                </div>
              </div>
            </Card>
          )}

          {/* Condition Selector Tabs */}
          <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.75rem', flexWrap: 'wrap' }}>
            {[
              { id: 'fever', label: '🌡️ Fever & Acute Infection' },
              { id: 'acidity', label: '🍋 Acidity & Reflux (GERD)' },
              { id: 'anemia', label: '🩸 Anemia & Iron Support' },
              { id: 'diabetes_bp', label: '🩺 Diabetes & High Blood Pressure' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedCondition(tab.id)}
                style={{
                  padding: '0.65rem 1.25rem',
                  borderRadius: 'var(--radius-lg)',
                  fontWeight: '800',
                  fontSize: '0.9rem',
                  border: '1.5px solid',
                  borderColor: selectedCondition === tab.id ? healthContextData[tab.id].color : 'var(--border-subtle)',
                  backgroundColor: selectedCondition === tab.id ? healthContextData[tab.id].bgColor : 'white',
                  color: selectedCondition === tab.id ? healthContextData[tab.id].color : 'var(--neutral-700)',
                  cursor: 'pointer',
                  transition: 'all 0.15s'
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Selected Condition Card Display */}
          <Card style={{ padding: '1.75rem', marginBottom: '2rem', borderLeft: `6px solid ${activeConditionInfo.color}` }}>
            <div style={{ marginBottom: '1.25rem' }}>
              <span className="badge" style={{ backgroundColor: activeConditionInfo.bgColor, color: activeConditionInfo.color, border: `1px solid ${activeConditionInfo.borderColor}`, fontWeight: '800', marginBottom: '0.5rem' }}>
                {activeConditionInfo.tag}
              </span>
              <h2 style={{ fontSize: '1.5rem', fontWeight: '900', color: 'var(--neutral-900)', margin: '0.35rem 0' }}>
                {activeConditionInfo.title}
              </h2>
              <p style={{ fontSize: '0.95rem', color: 'var(--neutral-700)', lineHeight: '1.6', margin: 0 }}>
                {activeConditionInfo.overview}
              </p>
            </div>

            {/* Three Grid Blocks: Hydration, Soothing Foods, Foods to Moderate */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
              {/* Hydration Guidance */}
              <div style={{ padding: '1.25rem', backgroundColor: '#f0f9ff', borderRadius: 'var(--radius-md)', border: '1px solid #bae6fd' }}>
                <h4 style={{ fontSize: '1rem', fontWeight: '800', color: '#0369a1', margin: '0 0 0.75rem 0' }}>
                  💧 Hydration & Fluids
                </h4>
                <ul style={{ paddingLeft: '1.2rem', margin: 0, fontSize: '0.875rem', color: '#0c4a6e', display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
                  {activeConditionInfo.hydrationGuidelines.map((item, idx) => (
                    <li key={idx}>{item}</li>
                  ))}
                </ul>
              </div>

              {/* Soothing & Nourishing Foods */}
              <div style={{ padding: '1.25rem', backgroundColor: '#ecfdf5', borderRadius: 'var(--radius-md)', border: '1px solid #a7f3d0' }}>
                <h4 style={{ fontSize: '1rem', fontWeight: '800', color: '#047857', margin: '0 0 0.75rem 0' }}>
                  🥗 Easy-to-Tolerate Staples
                </h4>
                <ul style={{ paddingLeft: '1.2rem', margin: 0, fontSize: '0.875rem', color: '#064e3b', display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
                  {activeConditionInfo.soothingFoods.map((item, idx) => (
                    <li key={idx}>{item}</li>
                  ))}
                </ul>
              </div>

              {/* Potential Triggers & Foods to Moderate */}
              <div style={{ padding: '1.25rem', backgroundColor: '#fff7ed', borderRadius: 'var(--radius-md)', border: '1px solid #fed7aa' }}>
                <h4 style={{ fontSize: '1rem', fontWeight: '800', color: '#c2410c', margin: '0 0 0.75rem 0' }}>
                  ⚠️ Potential Triggers to Limit
                </h4>
                <ul style={{ paddingLeft: '1.2rem', margin: 0, fontSize: '0.875rem', color: '#7c2d12', display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
                  {activeConditionInfo.foodsToAvoid.map((item, idx) => (
                    <li key={idx}>{item}</li>
                  ))}
                </ul>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

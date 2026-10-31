// Initial Seed Data for MediCare+ Backend

const initialPatient = {
  id: 'usr_101',
  patientId: 'usr_101',
  name: 'Thamizh',
  email: 'thamizh@example.com',
  mobile: '+91 98765 43210',
  role: 'patient',
  bloodGroup: 'O+',
  medicalID: 'MC-8942-021',
  age: 28,
  gender: 'Male',
  height: '172 cm',
  weight: '68 kg',
  emergencyContact: '+91 98765 43210',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
};

const initialDoctors = [
  {
    id: 'doc_1',
    doctorId: 'doc_1',
    name: 'Dr. Kumar',
    email: 'dr.kumar@medicare.com',
    role: 'doctor',
    specialty: 'General Physician',
    hospitalId: 'hosp_1',
    hospital: 'KMCH (Kovai Medical Center)',
    experience: '14 Years Exp',
    rating: 4.9,
    fee: '₹400',
    contact: '+91 98421 55670',
    availableDays: 'Mon - Sat',
    availableTime: '10:00 AM - 01:00 PM & 05:00 PM - 08:00 PM',
    medicalRegNo: 'TNMC-44812',
    avatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&auto=format&fit=crop&q=80',
    consultationCategories: ['Common Symptoms & Illnesses', 'General Medical Conditions', 'Other Common Conditions'],
    diseaseTreated: [
      'Fever', 'Cold', 'Cough', 'Headache', 'Body Pain', 'Fatigue / Weakness', 'Dizziness', 'Vomiting', 'Nausea', 'Diarrhea',
      'Viral Fever', 'Dengue', 'Malaria', 'Typhoid', 'Low Blood Pressure', 'Anemia', 'Food Poisoning'
    ]
  },
  {
    id: 'doc_2',
    doctorId: 'doc_2',
    name: 'Dr. Priya',
    email: 'dr.priya@medicare.com',
    role: 'doctor',
    specialty: 'Diabetologist',
    hospitalId: 'hosp_2',
    hospital: 'GKNM Hospital',
    experience: '11 Years Exp',
    rating: 4.9,
    fee: '₹500',
    contact: '+91 98422 66780',
    availableDays: 'Mon - Fri',
    availableTime: '02:00 PM - 06:00 PM',
    medicalRegNo: 'TNMC-51204',
    avatar: 'https://images.unsplash.com/photo-1594824813589-a2123924f0c4?w=150&auto=format&fit=crop&q=80',
    consultationCategories: ['General Medical Conditions', 'Other Common Conditions'],
    diseaseTreated: ['Diabetes', 'Thyroid Disorders', 'High Blood Pressure', 'Weight-Related Consultation']
  }
];

const initialHospitals = [
  {
    id: 'hosp_1',
    hospitalId: 'hosp_1',
    name: 'KMCH Hospital',
    legalName: 'Kovai Medical Center and Hospital',
    email: 'kmch@hospital.com',
    role: 'hospital',
    location: 'Avinashi Road, Peelamedu, Coimbatore',
    contact: '+91 422 432 3800',
    emergencyPhone: '+91 422 432 3800',
    registrationNo: 'CBE-HOSP-1990-08',
    rating: 4.9,
    reviews: 620,
    emergency24x7: true,
    departments: ['General Medicine', 'Cardiology', 'Diabetology', 'Orthopedics', 'Neurology', 'Dermatology'],
    doctorCount: 45,
    avatar: 'https://images.unsplash.com/photo-1587351021759-3e566b6af7cc?w=150&auto=format&fit=crop&q=80',
    image: 'https://images.unsplash.com/photo-1587351021759-3e566b6af7cc?w=400&auto=format&fit=crop&q=80'
  },
  {
    id: 'hosp_2',
    hospitalId: 'hosp_2',
    name: 'GKNM Hospital',
    legalName: 'G. Kuppuswamy Naidu Memorial Hospital',
    email: 'gknm@hospital.com',
    role: 'hospital',
    location: 'P.N. Palayam, Coimbatore',
    contact: '+91 422 224 5000',
    emergencyPhone: '+91 422 224 5000',
    registrationNo: 'CBE-HOSP-1952-01',
    rating: 4.8,
    reviews: 480,
    emergency24x7: true,
    departments: ['Cardiology', 'General Medicine', 'Pediatrics', 'Oncology', 'Orthopedics'],
    doctorCount: 38,
    avatar: 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=150&auto=format&fit=crop&q=80',
    image: 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=400&auto=format&fit=crop&q=80'
  }
];

const initialMedicines = [
  {
    id: 'med_1',
    name: 'Paracetamol',
    generalPurpose: 'Fever and mild pain',
    price: 40,
    stock: 150,
    prescriptionRequired: false,
    form: 'Tablet',
    category: 'Antipyretic / Analgesic'
  },
  {
    id: 'med_2',
    name: 'Cetirizine',
    generalPurpose: 'Allergy symptoms',
    price: 55,
    stock: 120,
    prescriptionRequired: false,
    form: 'Tablet',
    category: 'Antihistamine'
  },
  {
    id: 'med_3',
    name: 'ORS',
    generalPurpose: 'Rehydration during fluid loss',
    price: 30,
    stock: 200,
    prescriptionRequired: false,
    form: 'Oral Powder Sachet',
    category: 'Oral Electrolytes'
  },
  {
    id: 'med_4',
    name: 'Antacid',
    generalPurpose: 'Acidity and heartburn',
    price: 85,
    stock: 80,
    prescriptionRequired: false,
    form: 'Chewable Tablet / Syrup',
    category: 'Gastrointestinal'
  },
  {
    id: 'med_5',
    name: 'Calcium supplements',
    generalPurpose: 'Calcium supplementation',
    price: 120,
    stock: 90,
    prescriptionRequired: false,
    form: 'Tablet',
    category: 'Mineral Supplement'
  },
  {
    id: 'med_6',
    name: 'Iron supplements',
    generalPurpose: 'Iron supplementation',
    price: 110,
    stock: 75,
    prescriptionRequired: false,
    form: 'Capsule',
    category: 'Hematinic'
  },
  {
    id: 'med_7',
    name: 'Vitamin D supplements',
    generalPurpose: 'Vitamin D supplementation',
    price: 160,
    stock: 60,
    prescriptionRequired: false,
    form: 'Softgel Capsule',
    category: 'Vitamin Supplement'
  },
  {
    id: 'med_8',
    name: 'Saline nasal drops',
    generalPurpose: 'Nasal dryness and congestion',
    price: 65,
    stock: 110,
    prescriptionRequired: false,
    form: 'Nasal Drops',
    category: 'Nasal Care'
  },
  {
    id: 'med_9',
    name: 'Ibuprofen',
    generalPurpose: 'Pain, inflammation and fever',
    price: 75,
    stock: 100,
    prescriptionRequired: false,
    form: 'Tablet',
    category: 'NSAID / Pain Relief'
  },
  {
    id: 'med_10',
    name: 'Amoxicillin',
    generalPurpose: 'Certain bacterial infections',
    price: 140,
    stock: 45,
    prescriptionRequired: true,
    form: 'Capsule',
    category: 'Antibiotic'
  }
];

module.exports = {
  initialPatient,
  initialDoctors,
  initialHospitals,
  initialMedicines
};


export const mockUserProfile = {
  id: "usr_101",
  name: "Patient",
  email: "patient@medicare.com",
  role: "patient",
  avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
  bloodGroup: "O+",
  age: 28,
  gender: "Male",
  height: "172 cm",
  weight: "68 kg",
  emergencyContact: "+91 98765 43210",
  medicalID: "MC-8942-021"
};

import { sampleMedicines } from './medicinesData';

export const mockMedicines = sampleMedicines;

export const coimbatoreHospitals = [
  {
    id: "hosp_1",
    name: "KMCH (Kovai Medical Center and Hospital)",
    location: "Avinashi Road, Peelamedu, Coimbatore",
    contact: "+91 422 432 3800",
    rating: 4.9,
    reviews: 620,
    emergency24x7: true,
    image: "https://images.unsplash.com/photo-1587351021759-3e566b6af7cc?w=400&auto=format&fit=crop&q=80",
    departments: ["General Medicine", "Cardiology", "Diabetology", "Orthopedics", "Neurology", "Dermatology"],
    doctorCount: 45
  },
  {
    id: "hosp_2",
    name: "GKNM Hospital (G. Kuppuswamy Naidu Memorial)",
    location: "P.N. Palayam, Coimbatore",
    contact: "+91 422 224 5000",
    rating: 4.8,
    reviews: 480,
    emergency24x7: true,
    image: "https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=400&auto=format&fit=crop&q=80",
    departments: ["Cardiology", "General Medicine", "Pediatrics", "Oncology", "Orthopedics"],
    doctorCount: 38
  },
  {
    id: "hosp_3",
    name: "PSG Hospitals",
    location: "Peelamedu, Coimbatore",
    contact: "+91 422 257 0170",
    rating: 4.8,
    reviews: 540,
    emergency24x7: true,
    image: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=400&auto=format&fit=crop&q=80",
    departments: ["General Medicine", "Diabetology", "Dermatology", "ENT", "Pediatrics"],
    doctorCount: 40
  },
  {
    id: "hosp_4",
    name: "Ganga Hospital",
    location: "Mettupalayam Road, Coimbatore",
    contact: "+91 422 248 5000",
    rating: 4.9,
    reviews: 580,
    emergency24x7: true,
    image: "https://images.unsplash.com/photo-1586773860418-d37222d8fce3?w=400&auto=format&fit=crop&q=80",
    departments: ["Orthopedics", "Trauma Surgery", "Plastic Surgery", "General Medicine"],
    doctorCount: 32
  },
  {
    id: "hosp_5",
    name: "Sri Ramakrishna Hospital",
    location: "Avarampalayam, Coimbatore",
    contact: "+91 422 450 0000",
    rating: 4.7,
    reviews: 420,
    emergency24x7: true,
    image: "https://images.unsplash.com/photo-1516549655169-df83a0774514?w=400&auto=format&fit=crop&q=80",
    departments: ["General Medicine", "Cardiology", "Nephrology", "Dermatology"],
    doctorCount: 35
  },
  {
    id: "hosp_6",
    name: "Royal Care Super Speciality Hospital",
    location: "Neelambur, Coimbatore",
    contact: "+91 422 222 7000",
    rating: 4.8,
    reviews: 360,
    emergency24x7: true,
    image: "https://images.unsplash.com/photo-1538108149393-fbbd81895907?w=400&auto=format&fit=crop&q=80",
    departments: ["Neurology", "Cardiology", "Pulmonology", "General Medicine"],
    doctorCount: 28
  },
  {
    id: "hosp_7",
    name: "KG Hospital",
    location: "Arts College Road, Coimbatore",
    contact: "+91 422 221 2121",
    rating: 4.7,
    reviews: 390,
    emergency24x7: true,
    image: "https://images.unsplash.com/photo-1576602976047-174e57a47881?w=400&auto=format&fit=crop&q=80",
    departments: ["Cardiology", "Diabetology", "General Medicine", "Gastroenterology"],
    doctorCount: 30
  },
  {
    id: "hosp_8",
    name: "KMC Speciality Hospital",
    location: "Race Course, Coimbatore",
    contact: "+91 422 222 1000",
    rating: 4.6,
    reviews: 290,
    emergency24x7: false,
    image: "https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=400&auto=format&fit=crop&q=80",
    departments: ["General Medicine", "Pediatrics", "Dermatology"],
    doctorCount: 20
  },
  {
    id: "hosp_9",
    name: "Kovai Diabetes & Speciality Center",
    location: "RS Puram, Coimbatore",
    contact: "+91 422 247 2222",
    rating: 4.9,
    reviews: 310,
    emergency24x7: false,
    image: "https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=400&auto=format&fit=crop&q=80",
    departments: ["Diabetology", "Endocrinology", "Podiatry", "Dietetics"],
    doctorCount: 15
  },
  {
    id: "hosp_10",
    name: "Apex Eye & Multispecialty Hospital",
    location: "Saibaba Colony, Coimbatore",
    contact: "+91 422 243 1111",
    rating: 4.7,
    reviews: 260,
    emergency24x7: false,
    image: "https://images.unsplash.com/photo-1551076805-e1869033e561?w=400&auto=format&fit=crop&q=80",
    departments: ["Ophthalmology", "Dermatology", "General Medicine"],
    doctorCount: 18
  }
];

export const APPOINTMENT_CATEGORIES = [
  {
    id: 'A',
    name: 'Common Symptoms & Illnesses',
    description: 'Everyday acute symptoms, fevers, pains and common illnesses',
    conditions: [
      { id: 1, name: 'Fever', specialty: 'General Physician' },
      { id: 2, name: 'Cold', specialty: 'General Physician' },
      { id: 3, name: 'Cough', specialty: 'General Physician' },
      { id: 4, name: 'Headache', specialty: 'General Physician' },
      { id: 5, name: 'Sore Throat', specialty: 'ENT Specialist' },
      { id: 6, name: 'Body Pain', specialty: 'General Physician' },
      { id: 7, name: 'Fatigue / Weakness', specialty: 'General Physician' },
      { id: 8, name: 'Dizziness', specialty: 'General Physician' },
      { id: 9, name: 'Vomiting', specialty: 'General Physician' },
      { id: 10, name: 'Nausea', specialty: 'General Physician' },
      { id: 11, name: 'Diarrhea', specialty: 'General Physician' },
      { id: 12, name: 'Constipation', specialty: 'Gastroenterologist' },
      { id: 13, name: 'Stomach Pain', specialty: 'Gastroenterologist' },
      { id: 14, name: 'Acidity', specialty: 'Gastroenterologist' },
      { id: 15, name: 'Allergy', specialty: 'Dermatologist' }
    ]
  },
  {
    id: 'B',
    name: 'General Medical Conditions',
    description: 'Infectious diseases, metabolic disorders, and systemic conditions',
    conditions: [
      { id: 16, name: 'Viral Fever', specialty: 'General Physician' },
      { id: 17, name: 'Dengue', specialty: 'General Physician' },
      { id: 18, name: 'Malaria', specialty: 'General Physician' },
      { id: 19, name: 'Typhoid', specialty: 'General Physician' },
      { id: 20, name: 'Asthma', specialty: 'Pulmonologist' },
      { id: 21, name: 'Diabetes', specialty: 'Diabetologist' },
      { id: 22, name: 'High Blood Pressure', specialty: 'Cardiologist' },
      { id: 23, name: 'Low Blood Pressure', specialty: 'General Physician' },
      { id: 24, name: 'Anemia', specialty: 'General Physician' },
      { id: 25, name: 'Thyroid Disorders', specialty: 'Diabetologist' },
      { id: 26, name: 'Migraine', specialty: 'Neurologist' },
      { id: 27, name: 'Arthritis', specialty: 'Orthopedics' },
      { id: 28, name: 'Gastritis', specialty: 'Gastroenterologist' },
      { id: 29, name: 'Food Poisoning', specialty: 'General Physician' },
      { id: 30, name: 'Urinary Tract Infection (UTI)', specialty: 'Nephrologist' }
    ]
  },
  {
    id: 'C',
    name: 'Specialist-Related Conditions',
    description: 'Specific organ, musculoskeletal, sensory, or mental health concerns',
    conditions: [
      { id: 31, name: 'Skin Allergy', specialty: 'Dermatologist' },
      { id: 32, name: 'Acne', specialty: 'Dermatologist' },
      { id: 33, name: 'Hair Fall', specialty: 'Dermatologist' },
      { id: 34, name: 'Eye Infection', specialty: 'Ophthalmologist' },
      { id: 35, name: 'Ear Pain', specialty: 'ENT Specialist' },
      { id: 36, name: 'Dental Pain', specialty: 'Dental Surgeon' },
      { id: 37, name: 'Back Pain', specialty: 'Orthopedics' },
      { id: 38, name: 'Joint Pain', specialty: 'Orthopedics' },
      { id: 39, name: 'Menstrual Problems', specialty: 'Gynecologist' },
      { id: 40, name: 'Pregnancy-Related Consultation', specialty: 'Gynecologist' },
      { id: 41, name: 'Heart-Related Problems', specialty: 'Cardiologist' },
      { id: 42, name: 'Kidney-Related Problems', specialty: 'Nephrologist' },
      { id: 43, name: 'Liver-Related Problems', specialty: 'Gastroenterologist' },
      { id: 44, name: 'Respiratory Problems', specialty: 'Pulmonologist' },
      { id: 45, name: 'Mental Health Consultation', specialty: 'Psychiatrist' }
    ]
  },
  {
    id: 'D',
    name: 'Other Common Conditions',
    description: 'Skin eruptions, chronic reflux, rehabilitation and wellness consultations',
    conditions: [
      { id: 46, name: 'Sinusitis', specialty: 'ENT Specialist' },
      { id: 47, name: 'Bronchitis', specialty: 'Pulmonologist' },
      { id: 48, name: 'Pneumonia', specialty: 'Pulmonologist' },
      { id: 49, name: 'Chickenpox', specialty: 'General Physician' },
      { id: 50, name: 'Measles', specialty: 'General Physician' },
      { id: 51, name: 'Eczema', specialty: 'Dermatologist' },
      { id: 52, name: 'Fungal Infection', specialty: 'Dermatologist' },
      { id: 53, name: 'Piles', specialty: 'Gastroenterologist' },
      { id: 54, name: 'Acid Reflux (GERD)', specialty: 'Gastroenterologist' },
      { id: 55, name: 'Sleep Problems', specialty: 'Neurologist' },
      { id: 56, name: 'Weight-Related Consultation', specialty: 'Diabetologist' },
      { id: 57, name: 'Nutritional Deficiency', specialty: 'General Physician' },
      { id: 58, name: 'Muscle Strain', specialty: 'Orthopedics' },
      { id: 59, name: 'Sprain', specialty: 'Orthopedics' },
      { id: 60, name: 'General Health Check-up', specialty: 'General Physician' }
    ]
  }
];

export const coimbatoreDoctors = [
  {
    id: "doc_1",
    name: "Dr. Kumar",
    specialty: "General Physician",
    consultationCategories: ["Common Symptoms & Illnesses", "General Medical Conditions", "Other Common Conditions"],
    diseaseTreated: [
      "Fever", "Cold", "Cough", "Headache", "Body Pain", "Fatigue / Weakness", "Dizziness", "Vomiting", "Nausea", "Diarrhea",
      "Viral Fever", "Dengue", "Malaria", "Typhoid", "Low Blood Pressure", "Anemia", "Food Poisoning",
      "Chickenpox", "Measles", "Nutritional Deficiency", "General Health Check-up"
    ],
    experience: "14 Years Exp",
    hospital: "KMCH",
    hospitalId: "hosp_1",
    availableDays: "Mon - Sat",
    availableTime: "10:00 AM - 01:00 PM & 05:00 PM - 08:00 PM",
    rating: 4.9,
    fee: "₹400",
    avatar: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&auto=format&fit=crop&q=80",
    availableSlots: ["09:30 AM", "10:30 AM", "11:30 AM", "04:30 PM", "05:30 PM", "06:30 PM"]
  },
  {
    id: "doc_2",
    name: "Dr. Priya",
    specialty: "Diabetologist",
    consultationCategories: ["General Medical Conditions", "Other Common Conditions"],
    diseaseTreated: ["Diabetes", "Thyroid Disorders", "High Blood Pressure", "Weight-Related Consultation"],
    experience: "12 Years Exp",
    hospital: "ABC Hospital",
    hospitalId: "hosp_9",
    availableDays: "Mon - Fri",
    availableTime: "09:30 AM - 01:30 PM",
    rating: 4.8,
    fee: "₹500",
    avatar: "https://images.unsplash.com/photo-1594824813566-82823d5afe4a?w=150&auto=format&fit=crop&q=80",
    availableSlots: ["09:30 AM", "10:30 AM", "11:30 AM", "12:30 PM"]
  },
  {
    id: "doc_3",
    name: "Dr. S. Rajan",
    specialty: "Cardiologist",
    consultationCategories: ["General Medical Conditions", "Specialist-Related Conditions"],
    diseaseTreated: ["Heart-Related Problems", "High Blood Pressure", "Low Blood Pressure", "Dizziness"],
    experience: "18 Years Exp",
    hospital: "KMCH",
    hospitalId: "hosp_1",
    availableDays: "Mon - Sat",
    availableTime: "11:00 AM - 03:00 PM",
    rating: 4.9,
    fee: "₹600",
    avatar: "https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=150&auto=format&fit=crop&q=80",
    availableSlots: ["11:00 AM", "12:00 PM", "01:30 PM", "02:30 PM"]
  },
  {
    id: "doc_4",
    name: "Dr. Anita Sundaram",
    specialty: "Dermatologist",
    consultationCategories: ["Common Symptoms & Illnesses", "Specialist-Related Conditions", "Other Common Conditions"],
    diseaseTreated: ["Allergy", "Skin Allergy", "Acne", "Hair Fall", "Eczema", "Fungal Infection"],
    experience: "10 Years Exp",
    hospital: "PSG Hospitals",
    hospitalId: "hosp_3",
    availableDays: "Tue - Sat",
    availableTime: "04:00 PM - 08:00 PM",
    rating: 4.7,
    fee: "₹450",
    avatar: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&auto=format&fit=crop&q=80",
    availableSlots: ["04:00 PM", "05:00 PM", "06:00 PM", "07:00 PM"]
  },
  {
    id: "doc_5",
    name: "Dr. M. Karthik",
    specialty: "Orthopedics",
    consultationCategories: ["General Medical Conditions", "Specialist-Related Conditions", "Other Common Conditions"],
    diseaseTreated: ["Arthritis", "Back Pain", "Joint Pain", "Muscle Strain", "Sprain"],
    experience: "16 Years Exp",
    hospital: "Ganga Hospital",
    hospitalId: "hosp_4",
    availableDays: "Mon - Sat",
    availableTime: "10:00 AM - 04:00 PM",
    rating: 4.9,
    fee: "₹550",
    avatar: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=150&auto=format&fit=crop&q=80",
    availableSlots: ["10:00 AM", "11:00 AM", "01:00 PM", "02:30 PM", "03:30 PM"]
  },
  {
    id: "doc_6",
    name: "Dr. Sarah Jenkins",
    specialty: "Pulmonologist",
    consultationCategories: ["Common Symptoms & Illnesses", "General Medical Conditions", "Specialist-Related Conditions", "Other Common Conditions"],
    diseaseTreated: ["Asthma", "Respiratory Problems", "Sinusitis", "Bronchitis", "Pneumonia", "Cough", "Cold"],
    experience: "11 Years Exp",
    hospital: "GKNM Hospital",
    hospitalId: "hosp_2",
    availableDays: "Mon - Fri",
    availableTime: "10:00 AM - 02:00 PM",
    rating: 4.8,
    fee: "₹400",
    avatar: "https://images.unsplash.com/photo-1594824813566-82823d5afe4a?w=150&auto=format&fit=crop&q=80",
    availableSlots: ["10:00 AM", "11:00 AM", "12:00 PM", "01:00 PM"]
  },
  {
    id: "doc_7",
    name: "Dr. K. Venkatesh",
    specialty: "Neurologist",
    consultationCategories: ["Common Symptoms & Illnesses", "General Medical Conditions", "Other Common Conditions"],
    diseaseTreated: ["Headache", "Migraine", "Dizziness", "Sleep Problems"],
    experience: "15 Years Exp",
    hospital: "Royal Care Hospital",
    hospitalId: "hosp_6",
    availableDays: "Mon - Fri",
    availableTime: "02:00 PM - 06:00 PM",
    rating: 4.8,
    fee: "₹650",
    avatar: "https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=150&auto=format&fit=crop&q=80",
    availableSlots: ["02:00 PM", "03:00 PM", "04:00 PM", "05:00 PM"]
  },
  {
    id: "doc_8",
    name: "Dr. Deepa Raman",
    specialty: "Gastroenterologist",
    consultationCategories: ["Common Symptoms & Illnesses", "General Medical Conditions", "Specialist-Related Conditions", "Other Common Conditions"],
    diseaseTreated: ["Constipation", "Stomach Pain", "Acidity", "Gastritis", "Food Poisoning", "Liver-Related Problems", "Piles", "Acid Reflux (GERD)"],
    experience: "13 Years Exp",
    hospital: "KG Hospital",
    hospitalId: "hosp_7",
    availableDays: "Mon - Sat",
    availableTime: "10:00 AM - 01:00 PM & 05:00 PM - 07:30 PM",
    rating: 4.8,
    fee: "₹500",
    avatar: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&auto=format&fit=crop&q=80",
    availableSlots: ["10:00 AM", "11:30 AM", "05:00 PM", "06:30 PM"]
  },
  {
    id: "doc_9",
    name: "Dr. R. Meenakshi",
    specialty: "ENT Specialist",
    consultationCategories: ["Common Symptoms & Illnesses", "Specialist-Related Conditions", "Other Common Conditions"],
    diseaseTreated: ["Sore Throat", "Ear Pain", "Sinusitis", "Cold"],
    experience: "11 Years Exp",
    hospital: "PSG Hospitals",
    hospitalId: "hosp_3",
    availableDays: "Mon - Fri",
    availableTime: "09:00 AM - 01:00 PM",
    rating: 4.7,
    fee: "₹450",
    avatar: "https://images.unsplash.com/photo-1594824813566-82823d5afe4a?w=150&auto=format&fit=crop&q=80",
    availableSlots: ["09:00 AM", "10:00 AM", "11:00 AM", "12:00 PM"]
  },
  {
    id: "doc_10",
    name: "Dr. Arvind Swamy",
    specialty: "Ophthalmologist",
    consultationCategories: ["Specialist-Related Conditions"],
    diseaseTreated: ["Eye Infection"],
    experience: "17 Years Exp",
    hospital: "Apex Eye & Multispecialty Hospital",
    hospitalId: "hosp_10",
    availableDays: "Mon - Sat",
    availableTime: "10:00 AM - 03:00 PM",
    rating: 4.9,
    fee: "₹450",
    avatar: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&auto=format&fit=crop&q=80",
    availableSlots: ["10:00 AM", "11:30 AM", "01:30 PM", "02:30 PM"]
  },
  {
    id: "doc_11",
    name: "Dr. Lakshmi Narayanan",
    specialty: "Gynecologist",
    consultationCategories: ["Specialist-Related Conditions"],
    diseaseTreated: ["Menstrual Problems", "Pregnancy-Related Consultation"],
    experience: "16 Years Exp",
    hospital: "KMCH",
    hospitalId: "hosp_1",
    availableDays: "Mon - Sat",
    availableTime: "09:30 AM - 02:00 PM",
    rating: 4.9,
    fee: "₹550",
    avatar: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&auto=format&fit=crop&q=80",
    availableSlots: ["09:30 AM", "11:00 AM", "12:30 PM", "01:30 PM"]
  },
  {
    id: "doc_12",
    name: "Dr. Suresh Babu",
    specialty: "Nephrologist",
    consultationCategories: ["General Medical Conditions", "Specialist-Related Conditions"],
    diseaseTreated: ["Urinary Tract Infection (UTI)", "Kidney-Related Problems"],
    experience: "15 Years Exp",
    hospital: "Sri Ramakrishna Hospital",
    hospitalId: "hosp_5",
    availableDays: "Mon - Fri",
    availableTime: "11:00 AM - 03:00 PM",
    rating: 4.8,
    fee: "₹600",
    avatar: "https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=150&auto=format&fit=crop&q=80",
    availableSlots: ["11:00 AM", "12:00 PM", "01:30 PM", "02:30 PM"]
  },
  {
    id: "doc_13",
    name: "Dr. Sanjay Verma",
    specialty: "Psychiatrist",
    consultationCategories: ["Specialist-Related Conditions", "Other Common Conditions"],
    diseaseTreated: ["Mental Health Consultation", "Sleep Problems"],
    experience: "14 Years Exp",
    hospital: "Royal Care Hospital",
    hospitalId: "hosp_6",
    availableDays: "Tue - Sat",
    availableTime: "03:00 PM - 07:00 PM",
    rating: 4.8,
    fee: "₹650",
    avatar: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&auto=format&fit=crop&q=80",
    availableSlots: ["03:00 PM", "04:00 PM", "05:00 PM", "06:00 PM"]
  },
  {
    id: "doc_14",
    name: "Dr. Radhika Nair",
    specialty: "Dental Surgeon",
    consultationCategories: ["Specialist-Related Conditions"],
    diseaseTreated: ["Dental Pain"],
    experience: "9 Years Exp",
    hospital: "KMCH",
    hospitalId: "hosp_1",
    availableDays: "Mon - Sat",
    availableTime: "10:00 AM - 02:00 PM & 05:00 PM - 08:00 PM",
    rating: 4.7,
    fee: "₹350",
    avatar: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&auto=format&fit=crop&q=80",
    availableSlots: ["10:00 AM", "11:30 AM", "05:30 PM", "07:00 PM"]
  }
];

export const mockPrescriptions = [
  {
    id: "rx_101",
    code: "RX-2026-9021",
    doctorName: "Dr. Kumar",
    hospitalName: "KMCH",
    diagnosis: "Fever",
    prescriptionDate: "20 Sep 2026",
    medicineName: "Paracetamol",
    dosage: "1 tablet",
    frequency: "Morning + Night",
    duration: "5 Days",
    instructions: "Take after food.",
    status: "ACTIVE",
    reminderStatus: "Reminder Enabled",
    reportTitle: "Fever & Complete Blood Count (CBC) Report",
    reportDate: "20 Sep 2026",
    reportSummary: "WBC count normal. Platelets 240,000/mcL. Mild viral fever markers."
  },
  {
    id: "rx_102",
    code: "RX-2026-8812",
    doctorName: "Dr. Priya",
    hospitalName: "ABC Hospital",
    diagnosis: "Diabetes",
    prescriptionDate: "10 Feb 2026",
    medicineName: "Metformin 500mg",
    dosage: "1 tablet",
    frequency: "Night",
    duration: "30 Days",
    instructions: "Take after food.",
    status: "ACTIVE",
    reminderStatus: "Reminder Enabled",
    reportTitle: "HbA1c & Fasting Glucose Profile",
    reportDate: "10 Feb 2026",
    reportSummary: "HbA1c: 6.8%. Fasting Glucose: 110 mg/dL. Good glycemic control."
  },
  {
    id: "rx_103",
    code: "RX-2025-4402",
    doctorName: "Dr. Kumar",
    hospitalName: "KMCH",
    diagnosis: "Fever & Cold",
    prescriptionDate: "20 Aug 2025",
    medicineName: "Amoxicillin 500mg",
    dosage: "1 capsule",
    frequency: "Morning + Night",
    duration: "7 Days",
    instructions: "Take with warm water after food.",
    status: "INACTIVE",
    reminderStatus: "Reminder Completed / Disabled",
    reportTitle: "General Clinical Diagnostic Report",
    reportDate: "20 Aug 2025",
    reportSummary: "Temperature 100.2°F. Viral throat infection resolved."
  },
  {
    id: "rx_104",
    code: "RX-2025-1104",
    doctorName: "Dr. Sarah Jenkins",
    hospitalName: "MetroCare Hospital",
    diagnosis: "Acute Respiratory Infection",
    prescriptionDate: "15 Dec 2025",
    medicineName: "Azithromycin 500mg",
    dosage: "1 tablet",
    frequency: "Morning",
    duration: "3 Days",
    instructions: "Take before food.",
    status: "INACTIVE",
    reminderStatus: "Reminder Completed / Disabled",
    reportTitle: "Chest Radiography (X-Ray) Report",
    reportDate: "15 Dec 2025",
    reportSummary: "Clear lung fields, normal bronchial pattern."
  }
];

export const mockMedicalHistory = [
  {
    id: "mh_1",
    hospital: "KMCH",
    doctor: "Dr. Kumar",
    diagnosis: "Fever",
    date: "20 Aug 2025",
    year: "2025",
    status: "Resolved",
    notes: "Prescribed Paracetamol & oral hydration. Patient fully recovered.",
    rxCode: "RX-2025-4402",
    reportTitle: "General Clinical Diagnostic Report"
  },
  {
    id: "mh_2",
    hospital: "ABC Hospital",
    doctor: "Dr. Priya",
    diagnosis: "Diabetes",
    date: "10 Feb 2026",
    year: "2026",
    status: "Under Control",
    notes: "Metabolic review & glycemic dietary management plan.",
    rxCode: "RX-2026-8812",
    reportTitle: "HbA1c & Fasting Glucose Profile"
  },
  {
    id: "mh_3",
    hospital: "KMCH",
    doctor: "Dr. Kumar",
    diagnosis: "Fever",
    date: "20 Sep 2026",
    year: "2026",
    status: "Active Treatment",
    notes: "Oral antipyretic therapy with hydration.",
    rxCode: "RX-2026-9021",
    reportTitle: "Fever & Complete Blood Count (CBC) Report"
  },
  {
    id: "mh_4",
    hospital: "MetroCare Hospital",
    doctor: "Dr. Sarah Jenkins",
    diagnosis: "Respiratory Infection",
    date: "15 Dec 2025",
    year: "2025",
    status: "Resolved",
    notes: "Short course antibiotic therapy completed.",
    rxCode: "RX-2025-1104",
    reportTitle: "Chest Radiography (X-Ray) Report"
  }
];

export const mockDietPlans = {
  fever: {
    condition: "Fever",
    assignedBy: "Dr. Kumar (KMCH Hospital)",
    description: "Light, easily digestible, and hydrating diet to assist recovery during fever and infection.",
    meals: {
      breakfast: [
        "Warm Oats Porridge or Soft Idli with Mild Coconut Chutney",
        "Steamed Apple / Stewed Papaya",
        "Warm Herbal Tea or Warm Water"
      ],
      lunch: [
        "Soft Rice with Diluted Yellow Moong Dal (Khichdi)",
        "Steamed Carrot & Bottle Gourd (Lauki)",
        "Fresh Clear Vegetable Soup"
      ],
      evening: [
        "Fresh Tender Coconut Water",
        "Light Puffed Rice (Muri) or Roasted Makhana"
      ],
      dinner: [
        "Warm Tomato & Barley Soup",
        "1 Soft Wheat Roti with Boiled Vegetables or Light Dal Soup"
      ]
    },
    prefer: [
      "Clear warm soups & vegetable broths",
      "Fresh Tender Coconut Water & ORS fluids",
      "Steamed apples, pomegranates & papaya",
      "Soft Khichdi & Moong dal",
      "Warm boiled water with tulsi or ginger"
    ],
    limit: [
      "Oily, fried & spicy foods",
      "Heavy dairy cream, butter & cheese",
      "Chilled drinks, ice creams & carbonated sodas",
      "Processed fast food & refined sugar sweets",
      "Excessive caffeine & energy drinks"
    ]
  },
  diabetes: {
    condition: "Diabetes",
    assignedBy: "Dr. Priya (ABC Hospital)",
    description: "General balanced, lower-added-sugar diet guidance for optimal glycemic management.",
    meals: {
      breakfast: [
        "Multi-grain Dosa / Vegetable Oats Upma with Sambar",
        "1 Boiled Egg / Sprouted Moong Salad",
        "Unsweetened Green Tea or Cinnamon Water"
      ],
      lunch: [
        "Brown Rice or 2 Whole Wheat / Millets Rotis",
        "Lentil Soup (Tadka Dal) & Steamed Spinach (Palak)",
        "Fresh Cucumber & Tomato Salad",
        "Low-fat Homemade Curd"
      ],
      evening: [
        "Handful of Roasted Chana (Bengal Gram) & 5 Walnuts",
        "Lemon Tea without sugar"
      ],
      dinner: [
        "Grilled Tofu / Paneer / Fish with Roasted Vegetables",
        "1 Missi Roti (Gram Flour Roti) or Vegetable Soup"
      ]
    },
    prefer: [
      "High-fiber whole grains (Oats, Millets, Quinoa, Brown Rice)",
      "Green leafy vegetables (Spinach, Methi, Broccoli, Beans)",
      "Legumes, sprouts, lentils & lean protein",
      "Nuts (Almonds, Walnuts) & seeds (Chia, Flaxseeds)",
      "Bitter gourd (Karela), jamun & amla juice"
    ],
    limit: [
      "Refined white sugar, jaggery, honey & sweets",
      "Sweetened fruit juices & carbonated soft drinks",
      "Refined flour (Maida) white bread, cakes & pastries",
      "Deep-fried snacks (Samosas, Chips, Namkeen)",
      "High glycemic fruits in large quantities (Mango, Banana)"
    ]
  }
};

export const mockReminders = [
  {
    id: "rem_1",
    medName: "Paracetamol",
    dosage: "1 Tablet",
    time: "8:00 AM",
    category: "today",
    prescriptionSource: "From KMCH Prescription",
    rxCode: "RX-2026-9021",
    daysRemaining: "4 days remaining",
    taken: true,
    missed: false,
    statusText: "Taken at 08:02 AM"
  },
  {
    id: "rem_2",
    medName: "Paracetamol",
    dosage: "1 Tablet",
    time: "8:00 PM",
    category: "today",
    prescriptionSource: "From KMCH Prescription",
    rxCode: "RX-2026-9021",
    daysRemaining: "4 days remaining",
    taken: false,
    missed: false,
    statusText: "Scheduled for Evening"
  },
  {
    id: "rem_3",
    medName: "Metformin 500mg",
    dosage: "1 Tablet",
    time: "8:30 PM",
    category: "today",
    prescriptionSource: "From ABC Hospital Prescription",
    rxCode: "RX-2026-8812",
    daysRemaining: "28 days remaining",
    taken: false,
    missed: false,
    statusText: "Scheduled for Night"
  },
  {
    id: "rem_4",
    medName: "Paracetamol",
    dosage: "1 Tablet",
    time: "8:00 AM",
    category: "upcoming",
    prescriptionSource: "From KMCH Prescription",
    rxCode: "RX-2026-9021",
    daysRemaining: "3 days remaining",
    taken: false,
    missed: false,
    statusText: "Tomorrow Morning"
  },
  {
    id: "rem_5",
    medName: "Metformin 500mg",
    dosage: "1 Tablet",
    time: "8:30 PM",
    category: "upcoming",
    prescriptionSource: "From ABC Hospital Prescription",
    rxCode: "RX-2026-8812",
    daysRemaining: "27 days remaining",
    taken: false,
    missed: false,
    statusText: "Tomorrow Night"
  },
  {
    id: "rem_6",
    medName: "Amoxicillin 500mg",
    dosage: "1 Capsule",
    time: "8:00 AM",
    category: "completed",
    prescriptionSource: "From KMCH Prescription",
    rxCode: "RX-2025-4402",
    daysRemaining: "Completed",
    taken: true,
    missed: false,
    statusText: "Completed Course (Aug 2025)"
  }
];

export const mockHealthRecords = [
  {
    id: "rec_1",
    title: "Blood Test Report",
    subTitle: "Fever & Complete Blood Count (CBC)",
    category: "Blood Test Report",
    hospital: "KMCH",
    doctor: "Dr. Kumar",
    date: "20 Sep 2026",
    status: "Normal",
    fileSize: "2.4 MB",
    summary: "WBC count 7,200/mcL (Normal). Platelets 240,000/mcL. Hemoglobin 14.5 g/dL. ESR mildly elevated."
  },
  {
    id: "rec_2",
    title: "Lab Report",
    subTitle: "HbA1c & Fasting Blood Sugar Profile",
    category: "Lab Report",
    hospital: "ABC Hospital",
    doctor: "Dr. Priya",
    date: "10 Feb 2026",
    status: "Controlled",
    fileSize: "1.8 MB",
    summary: "HbA1c 6.8%. Fasting Blood Glucose 110 mg/dL. Postprandial Glucose 145 mg/dL."
  },
  {
    id: "rec_3",
    title: "Scan Report",
    subTitle: "Chest X-Ray & Radiography Digital Scan",
    category: "Scan Report",
    hospital: "MetroCare Hospital",
    doctor: "Dr. Sarah Jenkins",
    date: "15 Dec 2025",
    status: "Clear",
    fileSize: "14.1 MB",
    summary: "Digital Chest X-Ray (PA view): Clear lung fields, normal cardiothoracic ratio, no active lesions."
  },
  {
    id: "rec_4",
    title: "Prescription Report",
    subTitle: "Digital Outpatient Prescription Record",
    category: "Prescription",
    hospital: "KMCH",
    doctor: "Dr. Kumar",
    date: "20 Sep 2026",
    status: "Active",
    fileSize: "1.1 MB",
    summary: "Official KMCH OPD Prescription RX-2026-9021 for Paracetamol 650mg therapy."
  }
];

export const mockAppointments = [
  {
    id: "APT-COIM-9921",
    doctor: "Dr. Kumar",
    hospital: "KMCH",
    specialty: "General Physician",
    date: "28 Sep 2026",
    time: "10:30 AM",
    mode: "Online",
    status: "Confirmed",
    category: "upcoming",
    tokenNo: "A-14",
    videoLink: "https://medicare.app/meet/apt-coim-9921"
  },
  {
    id: "APT-COIM-8842",
    doctor: "Dr. Priya",
    hospital: "ABC Hospital",
    specialty: "Diabetologist",
    date: "05 Oct 2026",
    time: "02:15 PM",
    mode: "Offline",
    status: "Scheduled",
    category: "upcoming",
    tokenNo: "B-08",
    clinicAddress: "45 Trunk Road, Central District, Coimbatore"
  },
  {
    id: "APT-COIM-4410",
    doctor: "Dr. Kumar",
    hospital: "KMCH",
    specialty: "General Physician",
    date: "20 Aug 2025",
    time: "11:00 AM",
    mode: "Offline",
    status: "Completed",
    category: "past",
    tokenNo: "A-02"
  },
  {
    id: "APT-COIM-2201",
    doctor: "Dr. Sarah Jenkins",
    hospital: "GKNM Hospital",
    specialty: "General Physician",
    date: "15 Dec 2025",
    time: "04:30 PM",
    mode: "Online",
    status: "Completed",
    category: "past",
    tokenNo: "C-11"
  }
];

export const mockHospitalBills = [
  {
    id: "hosp_bill_1",
    billNo: "KMCH-HOSP-2026-101",
    patientName: "Patient",
    hospital: "KMCH Super-Specialty Hospital",
    serviceCategory: "OPD Consultation & Diagnostic Panel",
    doctorName: "Dr. Kumar",
    roomNo: "OPD Room 4",
    date: "20 Sep 2026",
    subtotal: 750,
    taxAmount: 100,
    amount: "₹850",
    numericAmount: 850,
    status: "Paid",
    paymentMode: "UPI / GPay"
  },
  {
    id: "hosp_bill_2",
    billNo: "KMCH-HOSP-2026-102",
    patientName: "Patient",
    hospital: "KMCH Super-Specialty Hospital",
    serviceCategory: "Complete Blood Count & Lab Tests",
    doctorName: "Dr. Kumar",
    roomNo: "Lab-B",
    date: "22 Sep 2026",
    subtotal: 1200,
    taxAmount: 50,
    amount: "₹1,250",
    numericAmount: 1250,
    status: "Paid",
    paymentMode: "Credit Card"
  },
  {
    id: "hosp_bill_3",
    billNo: "GKNM-HOSP-2026-304",
    patientName: "Senthil Nathan",
    hospital: "GKNM Hospital",
    serviceCategory: "Cardiology OPD & ECG Diagnostic",
    doctorName: "Dr. S. Rajan",
    roomNo: "Cardio OPD 12",
    date: "24 Sep 2026",
    subtotal: 1500,
    taxAmount: 150,
    amount: "₹1,650",
    numericAmount: 1650,
    status: "Pending",
    paymentMode: "Pending"
  }
];

export const mockPharmacyBills = [
  {
    id: "pharm_bill_1",
    billNo: "KMCH-PHARM-2026-8801",
    patientName: "Patient",
    hospital: "KMCH Hospital Pharmacy",
    date: "20 Sep 2026",
    items: [
      { medicine: "Paracetamol 650mg", quantity: 2, unitPrice: 50, total: 100 },
      { medicine: "Metformin 500mg", quantity: 1, unitPrice: 180, total: 180 }
    ],
    subtotal: 280,
    discountAmount: 28,
    taxAmount: 13,
    amount: "₹265",
    numericAmount: 265,
    status: "Paid",
    paymentMode: "Cash"
  },
  {
    id: "pharm_bill_2",
    billNo: "KMCH-PHARM-2026-8802",
    patientName: "Patient",
    hospital: "KMCH Hospital Pharmacy",
    date: "22 Sep 2026",
    items: [
      { medicine: "Amoxicillin 500mg", quantity: 1, unitPrice: 150, total: 150 },
      { medicine: "Vitamin D3 5000 IU", quantity: 1, unitPrice: 220, total: 220 }
    ],
    subtotal: 370,
    discountAmount: 37,
    taxAmount: 17,
    amount: "₹350",
    numericAmount: 350,
    status: "Paid",
    paymentMode: "UPI"
  }
];

export const mockBills = mockHospitalBills;

export const mockNearbyHealthcare = coimbatoreHospitals;

export const mockVaccinations = [
  {
    id: "vac_1",
    name: "COVID-19 Booster (KP.2)",
    date: "Jan 12, 2026",
    administeredBy: "KMCH Hospital",
    status: "Completed",
    dose: "Dose 4",
    batchNo: "CV-2026-881",
    certificateAvailable: true
  },
  {
    id: "vac_2",
    name: "Annual Influenza (Flu) Shot 2026",
    date: "Sep 20, 2026",
    administeredBy: "ABC Hospital",
    status: "Scheduled",
    dose: "Annual Dose",
    batchNo: "Pending",
    certificateAvailable: false
  }
];

export const mockAIChatHistory = [
  {
    id: 'msg_bot_1',
    sender: 'bot',
    text: 'Hello! I am **MediCare AI**, your 24/7 clinical assistant. I can help you with medicine dosage queries, symptom checks, prescription reminders, and lab report summaries. How can I assist you today?',
    time: '10:00 AM',
    suggestedChips: [
      'Check my medicine reminders',
      'Explain my prescription',
      'Find nearby hospital'
    ]
  },
  {
    id: 'msg_user_1',
    sender: 'user',
    text: 'Can you tell me about my current prescription and any side effects?',
    time: '10:01 AM'
  },
  {
    id: 'msg_bot_2',
    sender: 'bot',
    text: 'Based on your active prescription **RX-2026-4821**, you have been prescribed **Amoxicillin 500mg** twice daily for 7 days. Common mild side effects include nausea, stomach upset, and skin rash. If you experience difficulty breathing or severe swelling, seek immediate medical attention and discontinue the medication.',
    time: '10:01 AM',
    suggestedChips: [
      'Set medicine reminder',
      'Check drug interactions',
      'Book follow-up appointment'
    ]
  }
];

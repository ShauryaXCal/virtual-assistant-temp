export interface Patient {
  id: string;
  name: string;
  age: number;
  gender: string;
  dateOfBirth: string;
  primaryConditions: string[];
  mrn: string;
  insuranceProvider: string;
  insurancePolicyNumber: string;
}

export type PatientCategory = 'existing' | 'existing-urgent' | 'new-to-practice' | 'referral';

export interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  date: string;
  time: string;
  duration: number;
  type: string;
  reason: string;
  status: string;
  patientCategory: PatientCategory;
}

export interface MedicalEncounter {
  id: string;
  date: string;
  reason: string;
  diagnosis: string;
  notes: string;
}

export interface Condition {
  id: string;
  name: string;
  icd10Code: string;
  status: 'active' | 'resolved' | 'chronic';
  diagnosedDate: string;
  resolvedDate?: string;
  notes: string;
}

export interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  prescribedDate: string;
  status: 'active' | 'discontinued' | 'completed';
  notes: string;
}

export interface LabReport {
  id: string;
  testName: string;
  testDate: string;
  resultValue: string;
  normalRange: string;
  unit: string;
  status: 'normal' | 'high' | 'low' | 'critical';
  notes: string;
}

export interface ChatMessage {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: string;
}

const PATIENTS: Patient[] = [
  {
    id: 'p1',
    name: 'Robert Johnson',
    age: 58,
    gender: 'Male',
    dateOfBirth: '1966-03-15',
    primaryConditions: ['Type 2 Diabetes', 'Hypertension'],
    mrn: 'MRN-001458',
    insuranceProvider: 'Blue Cross Blue Shield',
    insurancePolicyNumber: 'BCBS-9876543210',
  },
  {
    id: 'p2',
    name: 'Emily Chen',
    age: 42,
    gender: 'Female',
    dateOfBirth: '1982-07-22',
    primaryConditions: ['Asthma', 'Seasonal Allergies'],
    mrn: 'MRN-002341',
    insuranceProvider: 'Aetna',
    insurancePolicyNumber: 'AET-5432109876',
  },
  {
    id: 'p3',
    name: 'Michael Thompson',
    age: 65,
    gender: 'Male',
    dateOfBirth: '1959-11-08',
    primaryConditions: ['Coronary Artery Disease', 'Hyperlipidemia'],
    mrn: 'MRN-003892',
    insuranceProvider: 'Medicare',
    insurancePolicyNumber: 'MED-1234567890A',
  },
  {
    id: 'p4',
    name: 'Sarah Williams',
    age: 35,
    gender: 'Female',
    dateOfBirth: '1989-05-12',
    primaryConditions: ['Hypothyroidism'],
    mrn: 'MRN-004521',
    insuranceProvider: 'UnitedHealthcare',
    insurancePolicyNumber: 'UHC-8765432109',
  },
  {
    id: 'p5',
    name: 'James Martinez',
    age: 71,
    gender: 'Male',
    dateOfBirth: '1953-09-30',
    primaryConditions: ['Atrial Fibrillation', 'Chronic Kidney Disease'],
    mrn: 'MRN-005783',
    insuranceProvider: 'Cigna',
    insurancePolicyNumber: 'CIG-3210987654',
  },
];

const TODAY = new Date().toISOString().split('T')[0];
const TOMORROW = new Date(Date.now() + 86400000).toISOString().split('T')[0];

export const APPOINTMENTS: Appointment[] = [
  {
    id: 'a1',
    patientId: 'p1',
    patientName: 'Robert Johnson',
    date: TODAY,
    time: '09:00',
    duration: 30,
    type: 'Follow-up',
    reason: 'Diabetes management review',
    status: 'scheduled',
    patientCategory: 'existing',
  },
  {
    id: 'a2',
    patientId: 'p2',
    patientName: 'Emily Chen',
    date: TODAY,
    time: '10:00',
    duration: 30,
    type: 'Urgent Visit',
    reason: 'Asthma symptoms worsening - Regular doctor unavailable',
    status: 'scheduled',
    patientCategory: 'existing-urgent',
  },
  {
    id: 'a3',
    patientId: 'p3',
    patientName: 'Michael Thompson',
    date: TODAY,
    time: '11:30',
    duration: 45,
    type: 'Annual Physical',
    reason: 'Routine annual examination',
    status: 'scheduled',
    patientCategory: 'existing',
  },
  {
    id: 'a4',
    patientId: 'p4',
    patientName: 'Sarah Williams',
    date: TODAY,
    time: '14:00',
    duration: 30,
    type: 'New Patient',
    reason: 'New patient onboarding - Initial consultation',
    status: 'scheduled',
    patientCategory: 'new-to-practice',
  },
  {
    id: 'a5',
    patientId: 'p5',
    patientName: 'James Martinez',
    date: TOMORROW,
    time: '09:00',
    duration: 30,
    type: 'Referral',
    reason: 'Referred by Dr. Anderson - Cardiology consultation',
    status: 'scheduled',
    patientCategory: 'referral',
  },
];

export const MEDICAL_ENCOUNTERS: Record<string, MedicalEncounter[]> = {
  p1: [
    {
      id: 'e1',
      date: '2024-09-15',
      reason: 'Diabetes follow-up',
      diagnosis: 'Type 2 Diabetes Mellitus - well controlled',
      notes: 'HbA1c 6.8%. Patient reports good medication compliance. Continue current regimen.',
    },
    {
      id: 'e2',
      date: '2024-06-20',
      reason: 'Blood pressure check',
      diagnosis: 'Essential Hypertension',
      notes: 'BP 132/84. Slight elevation, advised lifestyle modifications and continue antihypertensive.',
    },
    {
      id: 'e3',
      date: '2024-03-10',
      reason: 'Annual physical examination',
      diagnosis: 'Multiple chronic conditions - stable',
      notes: 'Comprehensive metabolic panel ordered. Patient counseled on diet and exercise.',
    },
  ],
  p2: [
    {
      id: 'e4',
      date: '2024-08-25',
      reason: 'Asthma exacerbation',
      diagnosis: 'Mild persistent asthma',
      notes: 'Increased inhaler use last week. Peak flow reduced. Prescribed prednisone burst.',
    },
    {
      id: 'e5',
      date: '2024-05-18',
      reason: 'Allergy symptoms',
      diagnosis: 'Seasonal allergic rhinitis',
      notes: 'Started on nasal corticosteroid spray. Advised to avoid outdoor activities during high pollen.',
    },
  ],
  p3: [
    {
      id: 'e6',
      date: '2024-09-01',
      reason: 'Chest discomfort',
      diagnosis: 'Stable angina',
      notes: 'EKG unchanged from baseline. Stress test scheduled. Nitroglycerin provided for breakthrough symptoms.',
    },
    {
      id: 'e7',
      date: '2024-07-12',
      reason: 'Cardiology follow-up',
      diagnosis: 'Coronary artery disease - stable',
      notes: 'Echocardiogram shows EF 55%. Continue dual antiplatelet therapy and statin.',
    },
  ],
};

export const PATIENT_CONDITIONS: Record<string, Condition[]> = {
  p1: [
    {
      id: 'c1',
      name: 'Type 2 Diabetes Mellitus',
      icd10Code: 'E11.9',
      status: 'chronic',
      diagnosedDate: '2018-03-15',
      notes: 'Well controlled with metformin and lifestyle modifications',
    },
    {
      id: 'c2',
      name: 'Essential Hypertension',
      icd10Code: 'I10',
      status: 'chronic',
      diagnosedDate: '2016-11-20',
      notes: 'Managed with lisinopril 10mg daily',
    },
    {
      id: 'c3',
      name: 'Dyslipidemia',
      icd10Code: 'E78.5',
      status: 'active',
      diagnosedDate: '2019-06-08',
      notes: 'On atorvastatin 20mg daily',
    },
  ],
  p2: [
    {
      id: 'c4',
      name: 'Mild Persistent Asthma',
      icd10Code: 'J45.30',
      status: 'chronic',
      diagnosedDate: '2015-04-12',
      notes: 'Uses albuterol inhaler as needed and fluticasone daily',
    },
    {
      id: 'c5',
      name: 'Seasonal Allergic Rhinitis',
      icd10Code: 'J30.2',
      status: 'active',
      diagnosedDate: '2014-05-20',
      notes: 'Symptoms typically worse in spring and fall',
    },
  ],
  p3: [
    {
      id: 'c6',
      name: 'Coronary Artery Disease',
      icd10Code: 'I25.10',
      status: 'chronic',
      diagnosedDate: '2020-02-14',
      notes: 'Post-MI, stent placement in LAD',
    },
    {
      id: 'c7',
      name: 'Hyperlipidemia',
      icd10Code: 'E78.5',
      status: 'chronic',
      diagnosedDate: '2018-08-22',
      notes: 'High-intensity statin therapy',
    },
  ],
};

export const PATIENT_MEDICATIONS: Record<string, Medication[]> = {
  p1: [
    {
      id: 'm1',
      name: 'Metformin',
      dosage: '1000mg',
      frequency: 'Twice daily with meals',
      prescribedDate: '2018-03-15',
      status: 'active',
      notes: 'Take with food to reduce GI side effects',
    },
    {
      id: 'm2',
      name: 'Lisinopril',
      dosage: '10mg',
      frequency: 'Once daily in the morning',
      prescribedDate: '2016-11-20',
      status: 'active',
      notes: 'Monitor blood pressure regularly',
    },
    {
      id: 'm3',
      name: 'Atorvastatin',
      dosage: '20mg',
      frequency: 'Once daily at bedtime',
      prescribedDate: '2019-06-08',
      status: 'active',
      notes: 'Lipid panel every 6 months',
    },
    {
      id: 'm4',
      name: 'Aspirin',
      dosage: '81mg',
      frequency: 'Once daily',
      prescribedDate: '2018-03-15',
      status: 'active',
      notes: 'Enteric-coated for cardiovascular protection',
    },
  ],
  p2: [
    {
      id: 'm5',
      name: 'Albuterol Inhaler',
      dosage: '90mcg',
      frequency: '2 puffs as needed',
      prescribedDate: '2015-04-12',
      status: 'active',
      notes: 'Use for acute shortness of breath or wheezing',
    },
    {
      id: 'm6',
      name: 'Fluticasone Inhaler',
      dosage: '110mcg',
      frequency: '2 puffs twice daily',
      prescribedDate: '2015-04-12',
      status: 'active',
      notes: 'Rinse mouth after use to prevent thrush',
    },
    {
      id: 'm7',
      name: 'Montelukast',
      dosage: '10mg',
      frequency: 'Once daily at bedtime',
      prescribedDate: '2020-03-15',
      status: 'active',
      notes: 'For asthma and allergy control',
    },
  ],
  p3: [
    {
      id: 'm8',
      name: 'Aspirin',
      dosage: '81mg',
      frequency: 'Once daily',
      prescribedDate: '2020-02-14',
      status: 'active',
      notes: 'Antiplatelet therapy post-MI',
    },
    {
      id: 'm9',
      name: 'Clopidogrel',
      dosage: '75mg',
      frequency: 'Once daily',
      prescribedDate: '2020-02-14',
      status: 'active',
      notes: 'Dual antiplatelet therapy for 12 months post-stent',
    },
    {
      id: 'm10',
      name: 'Atorvastatin',
      dosage: '80mg',
      frequency: 'Once daily at bedtime',
      prescribedDate: '2020-02-14',
      status: 'active',
      notes: 'High-intensity statin for CAD',
    },
    {
      id: 'm11',
      name: 'Metoprolol',
      dosage: '50mg',
      frequency: 'Twice daily',
      prescribedDate: '2020-02-14',
      status: 'active',
      notes: 'Beta-blocker for heart rate control',
    },
  ],
};

export const LAB_REPORTS: Record<string, LabReport[]> = {
  p1: [
    {
      id: 'l1',
      testName: 'Hemoglobin A1c',
      testDate: '2024-09-10',
      resultValue: '6.8',
      normalRange: '< 5.7',
      unit: '%',
      status: 'high',
      notes: 'Improved from previous 7.2%. Continue current diabetes management.',
    },
    {
      id: 'l2',
      testName: 'Fasting Glucose',
      testDate: '2024-09-10',
      resultValue: '118',
      normalRange: '70-100',
      unit: 'mg/dL',
      status: 'high',
      notes: 'Slightly elevated but acceptable for diabetic patient.',
    },
    {
      id: 'l3',
      testName: 'LDL Cholesterol',
      testDate: '2024-09-10',
      resultValue: '95',
      normalRange: '< 100',
      unit: 'mg/dL',
      status: 'normal',
      notes: 'At goal for diabetic patient on statin therapy.',
    },
    {
      id: 'l4',
      testName: 'Creatinine',
      testDate: '2024-09-10',
      resultValue: '1.1',
      normalRange: '0.7-1.3',
      unit: 'mg/dL',
      status: 'normal',
      notes: 'Normal kidney function.',
    },
  ],
  p2: [
    {
      id: 'l5',
      testName: 'Peak Flow',
      testDate: '2024-08-25',
      resultValue: '380',
      normalRange: '450-550',
      unit: 'L/min',
      status: 'low',
      notes: 'Reduced during asthma exacerbation. Follow up after steroid course.',
    },
    {
      id: 'l6',
      testName: 'IgE Total',
      testDate: '2024-05-18',
      resultValue: '250',
      normalRange: '< 100',
      unit: 'IU/mL',
      status: 'high',
      notes: 'Elevated consistent with allergic conditions.',
    },
  ],
  p3: [
    {
      id: 'l7',
      testName: 'Troponin I',
      testDate: '2024-09-01',
      resultValue: '0.02',
      normalRange: '< 0.04',
      unit: 'ng/mL',
      status: 'normal',
      notes: 'No acute myocardial injury.',
    },
    {
      id: 'l8',
      testName: 'BNP',
      testDate: '2024-09-01',
      resultValue: '85',
      normalRange: '< 100',
      unit: 'pg/mL',
      status: 'normal',
      notes: 'No evidence of heart failure.',
    },
    {
      id: 'l9',
      testName: 'LDL Cholesterol',
      testDate: '2024-07-12',
      resultValue: '68',
      normalRange: '< 70',
      unit: 'mg/dL',
      status: 'normal',
      notes: 'At goal for CAD patient on high-intensity statin.',
    },
  ],
};

export function getPatientById(patientId: string): Patient | undefined {
  return PATIENTS.find(p => p.id === patientId);
}

export function getAppointmentsByDate(date: string): Appointment[] {
  return APPOINTMENTS.filter(a => a.date === date);
}

export function getMedicalEncounters(patientId: string): MedicalEncounter[] {
  return MEDICAL_ENCOUNTERS[patientId] || [];
}

export function getPatientConditions(patientId: string): Condition[] {
  return PATIENT_CONDITIONS[patientId] || [];
}

export function getPatientMedications(patientId: string): Medication[] {
  return PATIENT_MEDICATIONS[patientId] || [];
}

export function getLabReports(patientId: string): LabReport[] {
  return LAB_REPORTS[patientId] || [];
}

export const CHAT_SUGGESTIONS = [
  'Latest treatment guidelines for hypertension',
  'Drug interactions for elderly patients',
  'Differential diagnosis for chest pain',
  'Screening recommendations for diabetes',
  'Management of acute asthma exacerbation',
  'Anticoagulation in atrial fibrillation',
];

export function generateAIResponse(userMessage: string): string {
  const lowerMessage = userMessage.toLowerCase();

  if (lowerMessage.includes('hypertension') || lowerMessage.includes('blood pressure')) {
    return 'According to the 2023 ACC/AHA guidelines for hypertension management:\n\n• Target BP < 130/80 mmHg for most adults\n• First-line agents: ACE inhibitors, ARBs, thiazide diuretics, or CCBs\n• For stage 2 HTN (≥140/90), consider starting with 2 agents\n• Lifestyle modifications remain crucial: DASH diet, weight loss, exercise, sodium restriction\n• Monitor for target organ damage: kidney function, cardiovascular risk assessment';
  }

  if (lowerMessage.includes('drug interaction') || lowerMessage.includes('elderly')) {
    return 'Key considerations for drug interactions in elderly patients:\n\n• Beers Criteria identifies potentially inappropriate medications\n• Common interactions: NSAIDs with anticoagulants, multiple CNS depressants\n• Renal function affects dosing (use CrCl for adjustment)\n• Polypharmacy increases risk - aim for medication reconciliation\n• Watch for anticholinergic burden and fall risk medications\n• Consider pharmacokinetic changes: reduced clearance, altered distribution';
  }

  if (lowerMessage.includes('chest pain') || lowerMessage.includes('differential')) {
    return 'Differential diagnosis for chest pain:\n\n**Life-threatening causes:**\n• Acute coronary syndrome (MI, unstable angina)\n• Pulmonary embolism\n• Aortic dissection\n• Tension pneumothorax\n\n**Common causes:**\n• Musculoskeletal (costochondritis)\n• GERD/esophageal spasm\n• Anxiety/panic disorder\n• Stable angina\n\n**Workup:** ECG, troponin, chest X-ray, consider D-dimer if PE suspected. Use HEART score for risk stratification.';
  }

  if (lowerMessage.includes('diabetes') || lowerMessage.includes('screening')) {
    return 'Diabetes screening recommendations (ADA 2024):\n\n**Who to screen:**\n• All adults ≥35 years (regardless of risk factors)\n• Adults <35 with overweight/obesity AND ≥1 risk factor\n• Women with prior gestational diabetes annually\n\n**Screening tests:**\n• HbA1c ≥6.5%\n• Fasting glucose ≥126 mg/dL\n• 2-hour OGTT ≥200 mg/dL\n\n**Prediabetes:** HbA1c 5.7-6.4%, FPG 100-125 mg/dL\nRescreen every 3 years if normal, annually if prediabetic.';
  }

  if (lowerMessage.includes('asthma') || lowerMessage.includes('exacerbation')) {
    return 'Acute asthma exacerbation management:\n\n**Initial assessment:**\n• Severity: mild, moderate, severe, life-threatening\n• Peak flow or FEV1 if available\n• Oxygen saturation\n\n**Treatment:**\n• Oxygen to maintain SpO2 >90%\n• SABA (albuterol) 2-4 puffs q20min or continuous nebulization\n• Systemic corticosteroids (prednisone 40-60mg or equivalent)\n• Consider ipratropium for severe cases\n• Magnesium sulfate IV for severe, refractory cases\n\n**Disposition:** Admit if incomplete response, severe obstruction, or high-risk features.';
  }

  if (lowerMessage.includes('atrial fibrillation') || lowerMessage.includes('anticoagulation')) {
    return 'Anticoagulation in atrial fibrillation:\n\n**Risk stratification - CHA₂DS₂-VASc:**\n• C: CHF (1 pt)\n• H: Hypertension (1 pt)\n• A₂: Age ≥75 (2 pts)\n• D: Diabetes (1 pt)\n• S₂: Prior stroke/TIA (2 pts)\n• V: Vascular disease (1 pt)\n• A: Age 65-74 (1 pt)\n• Sc: Sex category (female, 1 pt)\n\n**Recommendations:**\n• Score ≥2: Anticoagulation recommended\n• DOACs preferred over warfarin (apixaban, rivaroxaban, edoxaban, dabigatran)\n• Assess bleeding risk with HAS-BLED score\n• Consider left atrial appendage closure if contraindications to AC';
  }

  return `Based on current medical literature and clinical guidelines:\n\n${userMessage}\n\nThis is a complex clinical question. Key considerations include:\n\n• Patient-specific factors and comorbidities\n• Current evidence-based guidelines and recommendations\n• Risk-benefit analysis for the individual patient\n• Shared decision-making with the patient\n\nI recommend reviewing the latest guidelines from relevant specialty societies and considering consultation with specialists when appropriate. Always correlate clinical findings with the patient's overall presentation and goals of care.`;
}

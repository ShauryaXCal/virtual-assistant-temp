import { supabase } from './supabase';
import type {
  Doctor,
  Patient,
  Appointment,
  MedicalEncounter,
  Condition,
  Medication,
  LabReport,
  Referral
} from './supabase';

export async function getDoctorByEmail(email: string): Promise<Doctor | null> {
  const { data, error } = await supabase
    .from('doctors')
    .select('*')
    .eq('email', email)
    .maybeSingle();

  if (error) {
    console.error('Error fetching doctor:', error);
    return null;
  }

  return data;
}

export async function getPatientsByDoctorId(doctorId: string): Promise<Patient[]> {
  const { data, error } = await supabase
    .from('patients')
    .select('*')
    .eq('doctor_id', doctorId)
    .order('name');

  if (error) {
    console.error('Error fetching patients:', error);
    return [];
  }

  return data || [];
}

export async function getAppointmentsByDoctorId(doctorId: string, date?: string): Promise<Appointment[]> {
  let query = supabase
    .from('appointments')
    .select('*')
    .eq('doctor_id', doctorId);

  if (date) {
    query = query.eq('date', date);
  }

  query = query.order('date').order('time');

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching appointments:', error);
    return [];
  }

  return data || [];
}

export async function getPatientById(patientId: string): Promise<Patient | null> {
  const { data, error } = await supabase
    .from('patients')
    .select('*')
    .eq('id', patientId)
    .maybeSingle();

  if (error) {
    console.error('Error fetching patient:', error);
    return null;
  }

  return data;
}

export async function getMedicalEncountersByPatientId(patientId: string): Promise<MedicalEncounter[]> {
  const { data, error } = await supabase
    .from('medical_encounters')
    .select('*')
    .eq('patient_id', patientId)
    .order('encounter_date', { ascending: false });

  if (error) {
    console.error('Error fetching encounters:', error);
    return [];
  }

  return data || [];
}

export async function getConditionsByPatientId(patientId: string): Promise<Condition[]> {
  const { data, error } = await supabase
    .from('conditions')
    .select('*')
    .eq('patient_id', patientId)
    .order('diagnosed_date', { ascending: false });

  if (error) {
    console.error('Error fetching conditions:', error);
    return [];
  }

  return data || [];
}

export async function getMedicationsByPatientId(patientId: string): Promise<Medication[]> {
  const { data, error } = await supabase
    .from('medications')
    .select('*')
    .eq('patient_id', patientId)
    .order('prescribed_date', { ascending: false });

  if (error) {
    console.error('Error fetching medications:', error);
    return [];
  }

  return data || [];
}

export async function getLabReportsByPatientId(patientId: string): Promise<LabReport[]> {
  const { data, error } = await supabase
    .from('lab_reports')
    .select('*')
    .eq('patient_id', patientId)
    .order('test_date', { ascending: false });

  if (error) {
    console.error('Error fetching lab reports:', error);
    return [];
  }

  return data || [];
}

export async function getAllDoctors(): Promise<Doctor[]> {
  const { data, error } = await supabase
    .from('doctors')
    .select('*')
    .order('full_name');

  if (error) {
    console.error('Error fetching all doctors:', error);
    return [];
  }

  return data || [];
}

export async function createReferral(
  patientId: string,
  referringDoctorId: string,
  specialistId: string,
  reason: string
): Promise<Referral | null> {
  const { data, error } = await supabase
    .from('referrals')
    .insert({
      patient_id: patientId,
      referring_doctor_id: referringDoctorId,
      specialist_id: specialistId,
      reason: reason,
      status: 'pending'
    })
    .select()
    .single();
 
  if (error) {
    console.error('Error creating referral:', error);
    return null;
  }

  return data;
}


export async function createRefAppointment(
  patientId: string,
  specialistId: string,
): Promise<Appointment | null> {
  const { data, error } = await supabase
  .from('appointments')
  .insert({
    patient_id: patientId,
    doctor_id: specialistId,
    date: '2025-10-04',
    time: '02:30 PM',
    reason: 'Cardiology Consultation - Referral from PCP',
    status: 'completed',
    created_at: '2025-10-04 11:00:00+00',
    patient_category: 'referral',
    type: 'Urgent Visit'
  })
  .select()
  .single();
 
  if (error) {
    console.error('Error creating referral:', error);
    return null;
  }

  return data;
}

export async function createRefEncounter(
  patientId: string,
  referringDoctorId: string,
): Promise<MedicalEncounter | null> {
  const { data, error} = await supabase
  .from('medical_encounters')
  .insert({
    patient_id: patientId,
    doctor_id: referringDoctorId,
    encounter_date: '2025-10-03',
    reason: 'Chest Discomfort and Fatigue',
    diagnosis: 'Chest Pain, Unspecified (R07.9)',
    notes: `Patient reports recurrent chest discomfort over past 2 weeks, associated with exertion and fatigue. Pain similar to prior episode in January but more frequent. ECG shows ST segment changes and T wave abnormalities - concerning for ischemia. Troponin I elevated at 0.08 ng/mL (normal <0.04). BNP elevated at 185 pg/mL. URGENT CARDIOLOGY REFERRAL initiated. Patient advised to avoid strenuous activity and seek emergency care if symptoms worsen.`,
    created_at: '2025-10-03 11:45:00+00'
  })
  .select()
  .single();
 
  if (error) {
    console.error('Error creating referral:', error);
    return null;
  }

  return data;
}

export async function createRefLabReports(
  patientId: string,
): Promise<Array<LabReport> | null> {
  const { data, error} = await supabase
  .from('lab_reports')
  .insert([
    {
      patient_id: patientId,
      test_name: 'Troponin I',
      test_date: '2025-10-03',
      result_value: '0.08',
      unit: 'ng/mL',
      normal_range: '<0.04',
      status: 'high',
      notes: 'Elevated troponin suggests myocardial injury. Urgent cardiology referral indicated.',
      created_at: '2025-10-03 11:45:00+00'
    },
    {
      patient_id: patientId,
      test_name: 'BNP (B-type Natriuretic Peptide)',
      test_date: '2025-10-03',
      result_value: '185',
      unit: 'pg/mL',
      normal_range: '<100',
      status: 'high',
      notes: 'Elevated BNP suggests heart failure.',
      created_at: '2025-10-03 11:45:00+00'
    }
  ])
  .select();

  if (error) {
    console.error('Error creating referral:', error);
    return null;
  }

  return data;
}


interface ReferralResult {
  referral: Referral | null;
  appointment: Appointment | null;
  encounter: MedicalEncounter | null;
  labReports: Array<LabReport> | null;
}

export async function createFullReferralWorkflowForCardiologist(
  patientId: string,
  referringDoctorId: string,
  specialistId: string,
  reason: string
): Promise<ReferralResult> {
  // 1. Create referral
  const referral = await createReferral(patientId, referringDoctorId, specialistId, reason);

  if (!referral) {
    console.error('Failed to create referral. Aborting workflow.');
    return { referral: null, appointment: null, encounter: null, labReports: null };
  }

  // 2. Create appointment with the specialist
  const appointment = await createRefAppointment(patientId, specialistId);
  if (!appointment) console.error('Failed to create appointment.');

  // 3. Create medical encounter
  const encounter = await createRefEncounter(patientId, referringDoctorId);
  if (!encounter) console.error('Failed to create medical encounter.');

  // 4. Create lab reports
  const labReports = await createRefLabReports(patientId);
  if (!labReports) console.error('Failed to create lab reports.');

  return {
    referral,
    appointment,
    encounter,
    labReports
  };
}

// ------------------------ Individual Insert Functions ------------------------

export async function createAppointment(
  patientId: string,
  doctorId: string,
  date: string,
  time: string,
  reason: string,
  status: string,
  createdAt: string,
  patientCategory: 'existing' | 'existing-urgent' | 'new-to-practice' | 'referral',
  type: string
): Promise<Appointment | null> {
  const { data, error } = await supabase
    .from('appointments')
    .insert({
      patient_id: patientId,
      doctor_id: doctorId,
      date,
      time,
      reason,
      status,
      patient_category: patientCategory,
      type: type,
      created_at: createdAt
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating appointment:', error);
    return null;
  }

  return data;
}

export async function createMedicalEncounter(
  patientId: string,
  doctorId: string,
  encounterDate: string,
  reason: string,
  diagnosis: string,
  notes: string,
  createdAt: string
): Promise<MedicalEncounter | null> {
  const { data, error } = await supabase
    .from('medical_encounters')
    .insert({
      patient_id: patientId,
      doctor_id: doctorId,
      encounter_date: encounterDate,
      reason,
      diagnosis,
      notes,
      created_at: createdAt
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating medical encounter:', error);
    return null;
  }

  return data;
}

export async function createCondition(
  patientId: string,
  name: string,
  icd10Code: string,
  status: string,
  diagnosedDate: string,
  resolvedDate: string | null,
  notes: string,
  createdAt: string
): Promise<Condition | null> {
  const { data, error } = await supabase
    .from('conditions')
    .insert({
      patient_id: patientId,
      name,
      icd10_code: icd10Code,
      status,
      diagnosed_date: diagnosedDate,
      resolved_date: resolvedDate,
      notes,
      created_at: createdAt
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating condition:', error);
    return null;
  }

  return data;
}

export async function createMedication(
  patientId: string,
  name: string,
  dosage: string,
  frequency: string,
  status: string,
  prescribedDate: string,
  notes: string,
  createdAt: string
): Promise<Medication | null> {
  const { data, error } = await supabase
    .from('medications')
    .insert({
      patient_id: patientId,
      name,
      dosage,
      frequency,
      status,
      prescribed_date: prescribedDate,
      notes,
      created_at: createdAt
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating medication:', error);
    return null;
  }

  return data;
}

export async function createLabReport(
  patientId: string,
  testName: string,
  testDate: string,
  resultValue: string,
  unit: string,
  normalRange: string,
  status: string,
  notes: string,
  createdAt: string
): Promise<LabReport | null> {
  const { data, error } = await supabase
    .from('lab_reports')
    .insert({
      patient_id: patientId,
      test_name: testName,
      test_date: testDate,
      result_value: resultValue,
      unit,
      normal_range: normalRange,
      status,
      notes,
      created_at: createdAt
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating lab report:', error);
    return null;
  }

  return data;
}

// ------------------------ Workflow Function ------------------------

export async function createCardiologyFollowupWorkflow(
  patientId: string,
  refferingDoctorId: string,
  specialistId: string
): Promise<{
  appointment: Appointment | null;
  encounter: MedicalEncounter | null;
  conditions: Array<Condition | null>;
  medications: Array<Medication | null>;
  labReports: Array<LabReport | null>;
}> {
  // 1. Appointment
  const appointment = await createAppointment(
    patientId,
    specialistId,
    '2025-10-05',
    '10:00 AM',
    'Post-Cardiology Follow-up',
    'completed',
    '2025-10-05 15:00:00+00',
    'referral',
    'Urgent Visit'
  );

  // 2. Medical Encounter
  const encounter = await createMedicalEncounter(
    patientId,
    refferingDoctorId,
    '2025-10-04',
    'Cardiology Consultation - Referral from PCP',
    'Coronary Artery Disease (I25.10), Acute on Chronic Systolic Heart Failure (I50.23)',
    `Comprehensive cardiac evaluation completed. Echocardiogram shows EF 45% with mild LV systolic dysfunction. Stress test positive for ischemia at 85% max HR. Coronary angiography performed 9/23 revealed significant CAD: 70% stenosis in LAD, 50% stenosis in RCA. Renal function: eGFR 68 (mild impairment), creatinine 1.1 (normal). Diagnosed with CAD and heart failure NYHA Class II. Started Metoprolol 25mg BID, Clopidogrel 75mg daily. Increased Atorvastatin to 40mg. Discussed revascularization options. Patient to follow up with PCP for medication management and with cardiology in 4 weeks. Cardiac rehab referral placed.`,
    '2024-10-04 15:30:00+00'
  );

  // 3. Conditions
  const conditions = await Promise.all([
    createCondition(
      patientId,
      'Coronary Artery Disease',
      'I25.10',
      'active',
      '2025-10-04',
      null,
      '70% stenosis LAD, 50% stenosis RCA on angiography. Managed with dual antiplatelet therapy, beta blocker, and high-intensity statin.',
      '2025-10-04 15:30:00+00'
    ),
    createCondition(
      patientId,
      'Acute on Chronic Systolic Heart Failure',
      'I50.23',
      'active',
      '2025-10-04',
      null,
      'EF 45% on echo, NYHA Class II. Mild LV systolic dysfunction. Managed with beta blocker and ongoing monitoring.',
      '2025-10-04 15:30:00+00'
    )
  ]);

  // 4. Medications
  const medications = await Promise.all([
    createMedication(
      patientId,
      'Metoprolol',
      '25 mg',
      'Twice daily',
      'active',
      '2025-10-04',
      'Beta blocker for heart failure and CAD. Monitor heart rate and blood pressure.',
      '2025-10-04 15:30:00+00'
    ),
    createMedication(
      patientId,
      'Clopidogrel',
      '75 mg',
      'Once daily',
      'active',
      '2025-10-04',
      'Antiplatelet for CAD. Do not discontinue without consulting cardiologist. Dual antiplatelet therapy with aspirin.',
      '2025-10-04 15:30:00+00'
    ),
    createMedication(
      patientId,
      'Atorvastatin',
      '40 mg',
      'Once daily (evening)',
      'active',
      '2025-10-04',
      'High-intensity statin for CAD and hyperlipidemia. Dose increased from 20mg. Take in evening.',
      '2025-10-04 15:30:00+00'
    )
  ]);

  // 5. Lab Reports
  const labReports = await Promise.all([
    createLabReport(
      patientId,
      'Creatinine',
      '2025-10-04',
      '1.1',
      'mg/dL',
      '0.7-1.3',
      'normal',
      'Pre-angiography renal function assessment.',
      '2025-10-04 15:30:00+00'
    ),
    createLabReport(
      patientId,
      'eGFR (Estimated Glomerular Filtration Rate)',
      '2025-10-04',
      '68',
      'mL/min/1.73m²',
      '>60',
      'low',
      'Mild kidney impairment (Stage 2 CKD). Important for medication dosing and contrast exposure risk.',
      '2025-10-04 15:30:00+00'
    )
  ]);

  return { appointment, encounter, conditions, medications, labReports };
}

export async function deleteFollowupDataByDate(): Promise<void> {
  // Delete appointments with date >= 2025-10-04
  const { error: appointmentsError } = await supabase
    .from('appointments')
    .delete()
    .gte('date', '2025-10-04');
  if (appointmentsError) console.error('Error deleting appointments:', appointmentsError);

  // Delete medical encounters with encounter_date >= 2025-10-03
  const { error: encountersError } = await supabase
    .from('medical_encounters')
    .delete()
    .gte('encounter_date', '2025-10-03');
  if (encountersError) console.error('Error deleting encounters:', encountersError);

  // Delete conditions with diagnosed_date >= 2025-10-03
  const { error: conditionsError } = await supabase
    .from('conditions')
    .delete()
    .gte('diagnosed_date', '2025-10-03');
  if (conditionsError) console.error('Error deleting conditions:', conditionsError);

  // Delete medications with prescribed_date >= 2025-10-03
  const { error: medicationsError } = await supabase
    .from('medications')
    .delete()
    .gte('prescribed_date', '2025-10-03');
  if (medicationsError) console.error('Error deleting medications:', medicationsError);

  // Delete lab reports with test_date >= 2025-10-03
  const { error: labReportsError } = await supabase
    .from('lab_reports')
    .delete()
    .gte('test_date', '2025-10-03');
  if (labReportsError) console.error('Error deleting lab reports:', labReportsError);
}


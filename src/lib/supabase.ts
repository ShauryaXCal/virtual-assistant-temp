import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface Doctor {
  id: string;
  email: string;
  full_name: string;
  npi_id: string;
  specialty: string;
  created_at: string;
}

export interface Patient {
  id: string;
  doctor_id: string;
  mrn: string;
  name: string;
  date_of_birth: string;
  age: number;
  gender: string;
  insurance_provider: string;
  insurance_policy_number: string;
  created_at: string;
}

export interface Appointment {
  id: string;
  patient_id: string;
  doctor_id: string;
  date: string;
  time: string;
  reason: string;
  status: string;
  patient_category: 'existing' | 'existing-urgent' | 'new-to-practice' | 'referral';
  type: string;
  created_at: string;
}

export interface MedicalEncounter {
  id: string;
  patient_id: string;
  doctor_id: string;
  encounter_date: string;
  reason: string;
  diagnosis: string;
  notes: string;
  created_at: string;
}

export interface Condition {
  id: string;
  patient_id: string;
  name: string;
  icd10_code: string;
  status: string;
  diagnosed_date: string;
  resolved_date: string | null;
  notes: string;
  created_at: string;
}

export interface Medication {
  id: string;
  patient_id: string;
  name: string;
  dosage: string;
  frequency: string;
  status: string;
  prescribed_date: string;
  notes: string;
  created_at: string;
}

export interface LabReport {
  id: string;
  patient_id: string;
  test_name: string;
  test_date: string;
  result_value: string;
  unit: string;
  normal_range: string;
  status: string;
  notes: string | null;
  created_at: string;
}

export interface Referral {
  id: string;
  patient_id: string;
  referring_doctor_id: string;
  specialist_id: string;
  reason: string;
  status: string;
  created_at: string;
}

/*
  # Healthcare Application Database Schema

  ## Overview
  This migration creates a comprehensive healthcare database schema for managing doctors, patients, appointments, medical records, and referrals.

  ## New Tables

  ### 1. `doctors`
  Stores healthcare provider information
  - `id` (uuid, primary key) - Unique identifier
  - `email` (text, unique) - Doctor's email address
  - `full_name` (text) - Doctor's full name
  - `npi_id` (text, unique) - National Provider Identifier
  - `specialty` (text) - Medical specialty
  - `created_at` (timestamptz) - Record creation timestamp

  ### 2. `patients`
  Stores patient demographic and insurance information
  - `id` (uuid, primary key) - Unique identifier
  - `doctor_id` (uuid, foreign key) - Assigned primary doctor
  - `mrn` (text, unique) - Medical Record Number
  - `name` (text) - Patient's full name
  - `date_of_birth` (date) - Patient's date of birth
  - `age` (integer) - Patient's age
  - `gender` (text) - Patient's gender
  - `insurance_provider` (text) - Insurance company name
  - `insurance_policy_number` (text) - Insurance policy number
  - `created_at` (timestamptz) - Record creation timestamp

  ### 3. `appointments`
  Stores appointment scheduling information
  - `id` (uuid, primary key) - Unique identifier
  - `patient_id` (uuid, foreign key) - Patient reference
  - `doctor_id` (uuid, foreign key) - Doctor reference
  - `date` (date) - Appointment date
  - `time` (text) - Appointment time
  - `reason` (text) - Reason for visit
  - `status` (text) - Appointment status (scheduled, completed, cancelled)
  - `care_setting` (text) - Care setting (outpatient, inpatient, emergency, other)
  - `encounter_type` (text) - Encounter type (new, followup, referral)
  - `created_at` (timestamptz) - Record creation timestamp

  ### 4. `medical_encounters`
  Stores clinical visit records
  - `id` (uuid, primary key) - Unique identifier
  - `patient_id` (uuid, foreign key) - Patient reference
  - `doctor_id` (uuid, foreign key) - Treating doctor
  - `encounter_date` (date) - Date of encounter
  - `reason` (text) - Chief complaint
  - `diagnosis` (text) - Clinical diagnosis
  - `notes` (text) - Clinical notes
  - `created_at` (timestamptz) - Record creation timestamp

  ### 5. `conditions`
  Stores patient diagnoses and chronic conditions
  - `id` (uuid, primary key) - Unique identifier
  - `patient_id` (uuid, foreign key) - Patient reference
  - `name` (text) - Condition name
  - `icd10_code` (text) - ICD-10 diagnosis code
  - `status` (text) - Condition status (active, chronic, resolved)
  - `diagnosed_date` (date) - Date diagnosed
  - `resolved_date` (date, nullable) - Date resolved
  - `notes` (text) - Additional notes
  - `created_at` (timestamptz) - Record creation timestamp

  ### 6. `medications`
  Stores patient medication records
  - `id` (uuid, primary key) - Unique identifier
  - `patient_id` (uuid, foreign key) - Patient reference
  - `name` (text) - Medication name
  - `dosage` (text) - Dosage amount and form
  - `frequency` (text) - Administration frequency
  - `status` (text) - Medication status (active, discontinued)
  - `prescribed_date` (date) - Date prescribed
  - `notes` (text) - Additional notes
  - `created_at` (timestamptz) - Record creation timestamp

  ### 7. `lab_reports`
  Stores laboratory test results
  - `id` (uuid, primary key) - Unique identifier
  - `patient_id` (uuid, foreign key) - Patient reference
  - `test_name` (text) - Name of laboratory test
  - `test_date` (date) - Date test was performed
  - `result_value` (text) - Test result value
  - `unit` (text) - Unit of measurement
  - `normal_range` (text) - Normal reference range
  - `status` (text) - Result status (normal, high, low, critical)
  - `notes` (text, nullable) - Additional notes
  - `created_at` (timestamptz) - Record creation timestamp

  ### 8. `referrals`
  Stores patient referral records
  - `id` (uuid, primary key) - Unique identifier
  - `patient_id` (uuid, foreign key) - Patient reference
  - `referring_doctor_id` (uuid, foreign key) - Doctor making referral
  - `specialist_id` (uuid, foreign key) - Referred specialist
  - `reason` (text) - Reason for referral
  - `status` (text) - Referral status (pending, accepted, completed)
  - `created_at` (timestamptz) - Record creation timestamp

  ## Security
  - Row Level Security (RLS) enabled on all tables
  - Doctors can only access their own patients' data
  - Policies enforce authentication and ownership checks
  - Service role required for cross-doctor operations (referrals)

  ## Important Notes
  1. All timestamps use timestamptz for timezone awareness
  2. Foreign key constraints ensure data integrity
  3. Indexes on foreign keys for query performance
  4. RLS policies ensure HIPAA-compliant data access
*/

-- Create doctors table
CREATE TABLE IF NOT EXISTS doctors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  full_name text NOT NULL,
  npi_id text UNIQUE NOT NULL,
  specialty text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE doctors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Doctors can view their own profile"
  ON doctors FOR SELECT
  TO authenticated
  USING (email = current_setting('request.jwt.claims', true)::json->>'email');

-- Create patients table
CREATE TABLE IF NOT EXISTS patients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  doctor_id uuid REFERENCES doctors(id) ON DELETE SET NULL,
  mrn text UNIQUE NOT NULL,
  name text NOT NULL,
  date_of_birth date NOT NULL,
  age integer NOT NULL,
  gender text NOT NULL,
  insurance_provider text NOT NULL,
  insurance_policy_number text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE patients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Doctors can view their own patients"
  ON patients FOR SELECT
  TO authenticated
  USING (
    doctor_id IN (
      SELECT id FROM doctors 
      WHERE email = current_setting('request.jwt.claims', true)::json->>'email'
    )
  );

-- Create appointments table
CREATE TABLE IF NOT EXISTS appointments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid REFERENCES patients(id) ON DELETE CASCADE NOT NULL,
  doctor_id uuid REFERENCES doctors(id) ON DELETE CASCADE NOT NULL,
  date date NOT NULL,
  time text NOT NULL,
  reason text NOT NULL,
  status text DEFAULT 'scheduled' NOT NULL,
  type text DEFAULT 'Follow-up' NOT NULL,
  patient_category text DEFAULT 'existing' NOT NULL,
  care_setting text DEFAULT 'outpatient' NOT NULL,
  encounter_type text DEFAULT 'followup' NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Doctors can view their own appointments"
  ON appointments FOR SELECT
  TO authenticated
  USING (
    doctor_id IN (
      SELECT id FROM doctors 
      WHERE email = current_setting('request.jwt.claims', true)::json->>'email'
    )
  );

-- Create medical_encounters table
CREATE TABLE IF NOT EXISTS medical_encounters (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid REFERENCES patients(id) ON DELETE CASCADE NOT NULL,
  doctor_id uuid REFERENCES doctors(id) ON DELETE CASCADE NOT NULL,
  encounter_date date NOT NULL,
  reason text NOT NULL,
  diagnosis text NOT NULL,
  notes text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE medical_encounters ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Doctors can view encounters for their patients"
  ON medical_encounters FOR SELECT
  TO authenticated
  USING (
    patient_id IN (
      SELECT id FROM patients 
      WHERE doctor_id IN (
        SELECT id FROM doctors 
        WHERE email = current_setting('request.jwt.claims', true)::json->>'email'
      )
    )
  );

-- Create conditions table
CREATE TABLE IF NOT EXISTS conditions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid REFERENCES patients(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  icd10_code text NOT NULL,
  status text NOT NULL,
  diagnosed_date date NOT NULL,
  resolved_date date,
  notes text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE conditions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Doctors can view conditions for their patients"
  ON conditions FOR SELECT
  TO authenticated
  USING (
    patient_id IN (
      SELECT id FROM patients 
      WHERE doctor_id IN (
        SELECT id FROM doctors 
        WHERE email = current_setting('request.jwt.claims', true)::json->>'email'
      )
    )
  );

-- Create medications table
CREATE TABLE IF NOT EXISTS medications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid REFERENCES patients(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  dosage text NOT NULL,
  frequency text NOT NULL,
  status text NOT NULL,
  prescribed_date date NOT NULL,
  notes text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE medications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Doctors can view medications for their patients"
  ON medications FOR SELECT
  TO authenticated
  USING (
    patient_id IN (
      SELECT id FROM patients 
      WHERE doctor_id IN (
        SELECT id FROM doctors 
        WHERE email = current_setting('request.jwt.claims', true)::json->>'email'
      )
    )
  );

-- Create lab_reports table
CREATE TABLE IF NOT EXISTS lab_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid REFERENCES patients(id) ON DELETE CASCADE NOT NULL,
  test_name text NOT NULL,
  test_date date NOT NULL,
  result_value text NOT NULL,
  unit text NOT NULL,
  normal_range text NOT NULL,
  status text NOT NULL,
  notes text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE lab_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Doctors can view lab reports for their patients"
  ON lab_reports FOR SELECT
  TO authenticated
  USING (
    patient_id IN (
      SELECT id FROM patients 
      WHERE doctor_id IN (
        SELECT id FROM doctors 
        WHERE email = current_setting('request.jwt.claims', true)::json->>'email'
      )
    )
  );

-- Create referrals table
CREATE TABLE IF NOT EXISTS referrals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid REFERENCES patients(id) ON DELETE CASCADE NOT NULL,
  referring_doctor_id uuid REFERENCES doctors(id) ON DELETE CASCADE NOT NULL,
  specialist_id uuid REFERENCES doctors(id) ON DELETE CASCADE NOT NULL,
  reason text NOT NULL,
  status text DEFAULT 'pending' NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Doctors can view referrals they made"
  ON referrals FOR SELECT
  TO authenticated
  USING (
    referring_doctor_id IN (
      SELECT id FROM doctors 
      WHERE email = current_setting('request.jwt.claims', true)::json->>'email'
    )
  );

CREATE POLICY "Doctors can create referrals"
  ON referrals FOR INSERT
  TO authenticated
  WITH CHECK (
    referring_doctor_id IN (
      SELECT id FROM doctors 
      WHERE email = current_setting('request.jwt.claims', true)::json->>'email'
    )
  );

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_patients_doctor_id ON patients(doctor_id);
CREATE INDEX IF NOT EXISTS idx_appointments_doctor_id ON appointments(doctor_id);
CREATE INDEX IF NOT EXISTS idx_appointments_patient_id ON appointments(patient_id);
CREATE INDEX IF NOT EXISTS idx_appointments_date ON appointments(date);
CREATE INDEX IF NOT EXISTS idx_medical_encounters_patient_id ON medical_encounters(patient_id);
CREATE INDEX IF NOT EXISTS idx_conditions_patient_id ON conditions(patient_id);
CREATE INDEX IF NOT EXISTS idx_medications_patient_id ON medications(patient_id);
CREATE INDEX IF NOT EXISTS idx_lab_reports_patient_id ON lab_reports(patient_id);
CREATE INDEX IF NOT EXISTS idx_referrals_patient_id ON referrals(patient_id);
CREATE INDEX IF NOT EXISTS idx_referrals_referring_doctor_id ON referrals(referring_doctor_id);

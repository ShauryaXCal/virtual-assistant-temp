import { useState, useRef, useEffect } from 'react';
import { User, Calendar, Activity, Pill, TestTube, FileText, AlertCircle, MoreVertical, Send, Info, X } from 'lucide-react';
import {
  getPatientById,
  getMedicalEncountersByPatientId,
  getConditionsByPatientId,
  getMedicationsByPatientId,
  getLabReportsByPatientId,
  getAllDoctors,
  createReferral,
  createFullReferralWorkflowForCardiologist,
  createCardiologyFollowupWorkflow,
} from '../../lib/database';
import type { Patient, MedicalEncounter, Condition, Medication, LabReport, Doctor } from '../../lib/supabase';

interface RightPanelProps {
  patientId: string | null;
  appointment: { id: string; time: string; reason: string } | null;
}

type Tab = 'encounters' | 'conditions' | 'medications' | 'labs';

interface Specialist {
  id: string;
  name: string;
  specialty: string;
  npi: string;
}

export function RightPanel({ patientId, appointment }: RightPanelProps) {
  const [activeTab, setActiveTab] = useState<Tab>('encounters');
  const [showReferralMenu, setShowReferralMenu] = useState(false);
  const [showReferralSuccess, setShowReferralSuccess] = useState(false);
  const [showSummaryModal, setShowSummaryModal] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const [patient, setPatient] = useState<Patient | null>(null);
  const [encounters, setEncounters] = useState<MedicalEncounter[]>([]);
  const [conditions, setConditions] = useState<Condition[]>([]);
  const [medications, setMedications] = useState<Medication[]>([]);
  const [labs, setLabs] = useState<LabReport[]>([]);
  const [specialists, setSpecialists] = useState<Specialist[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadSpecialists() {
      const doctors = await getAllDoctors();
      const currentDoctorId = 'befec32a-c29a-4b31-a55c-cf23abe50b8d';
      const specialistList = doctors
        .filter(d => d.id !== currentDoctorId)
        .map(d => ({
          id: d.id,
          name: d.full_name,
          specialty: d.specialty,
          npi: d.npi_id,
        }));
      setSpecialists(specialistList);
    }
    loadSpecialists();
  }, []);

  useEffect(() => {
    async function loadPatientData() {
      if (!patientId) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      const [patientData, encountersData, conditionsData, medicationsData, labsData] = await Promise.all([
        getPatientById(patientId),
        getMedicalEncountersByPatientId(patientId),
        getConditionsByPatientId(patientId),
        getMedicationsByPatientId(patientId),
        getLabReportsByPatientId(patientId),
      ]);

      setPatient(patientData);
      setEncounters(encountersData);
      setConditions(conditionsData);
      setMedications(medicationsData);
      setLabs(labsData);
      setIsLoading(false);
    }

    loadPatientData();
  }, [patientId]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowReferralMenu(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleReferral = async (specialist: Specialist) => {
    if (!patientId) return;

    const currentDoctorId = 'befec32a-c29a-4b31-a55c-cf23abe50b8d';
    const referralReason = appointment?.reason || 'General referral';

    if (currentDoctorId == "befec32a-c29a-4b31-a55c-cf23abe50b8d") {
      await createFullReferralWorkflowForCardiologist(patientId, currentDoctorId, specialist.id, referralReason);
    }
    else {
      await createCardiologyFollowupWorkflow(patientId, currentDoctorId, specialist.id);
    }
    setShowReferralMenu(false);
    setShowReferralSuccess(true);
    setTimeout(() => setShowReferralSuccess(false), 3000);
  };

  if (!patientId) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center">
        <User className="w-16 h-16 text-gray-400 dark:text-gray-600 mb-4" />
        <p className="text-gray-600 dark:text-gray-400 font-medium">No patient selected</p>
        <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
          Select a patient or appointment to view details
        </p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-healthcare-500"></div>
      </div>
    );
  }

  if (!patient) return null;

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
      case 'normal':
        return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
      case 'high':
      case 'critical':
        return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
      case 'low':
        return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'resolved':
      case 'discontinued':
      case 'completed':
        return 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-400';
      case 'chronic':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
      default:
        return 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-400';
    }
  };

  const activeConditions = conditions.filter(c => c.status === 'active' || c.status === 'chronic');
  const activeMedications = medications.filter(m => m.status === 'active');

  const tabs: { id: Tab; label: string; icon: typeof Activity }[] = [
    { id: 'encounters', label: 'Encounters', icon: Activity },
    { id: 'conditions', label: 'Conditions', icon: FileText },
    { id: 'medications', label: 'Medications', icon: Pill },
    { id: 'labs', label: 'Lab Reports', icon: TestTube },
  ];

  const generatePatientSummary = () => {
    const currentDoctorId = 'befec32a-c29a-4b31-a55c-cf23abe50b8d';
    const myEncounters = encounters.filter(e => e.doctor_id === currentDoctorId);
    const lastMyEncounter = myEncounters[0];
    const isNewPatient = myEncounters.length === 0;

    interface SummarySection {
      title?: string;
      content: string;
    }

    const sections: SummarySection[] = [];

    // Header section
    if (appointment) {
      sections.push({
        content: `${patient.name} is a ${patient.age}-year-old ${patient.gender.toLowerCase()} presenting for ${appointment.reason.toLowerCase()}.`
      });
    } else {
      sections.push({
        content: `${patient.name} is a ${patient.age}-year-old ${patient.gender.toLowerCase()}.`
      });
    }

    if (isNewPatient) {
      // New patient - show baseline summary
      if (activeConditions.length > 0) {
        const conditionsList = activeConditions.map(c => c.name).join(', ');
        sections.push({
          title: 'Medical History',
          content: conditionsList
        });
      }

      if (activeMedications.length > 0) {
        const medList = activeMedications.map(m => `${m.name} ${m.dosage}`).slice(0, 3).join(', ');
        sections.push({
          title: 'Current Medications',
          content: `${medList}${activeMedications.length > 3 ? `, and ${activeMedications.length - 3} others` : ''}`
        });
      }
    } else {
      // Existing patient - focus on changes since last visit
      const lastVisitDate = new Date(lastMyEncounter.encounter_date);

      sections.push({
        title: 'Last Visit',
        content: `${lastMyEncounter.encounter_date} for ${lastMyEncounter.reason.toLowerCase()}`
      });

      // Check for new encounters with other providers
      const encountersSinceLastVisit = encounters.filter(e =>
        e.doctor_id !== currentDoctorId && new Date(e.encounter_date) > lastVisitDate
      );

      // Check for new labs since last visit
      const newLabs = labs.filter(l => new Date(l.test_date) > lastVisitDate);

      // Check for new medications since last visit
      const newMeds = medications.filter(m => new Date(m.prescribed_date) > lastVisitDate);

      // Check for new conditions since last visit
      const newConditions = conditions.filter(c => new Date(c.diagnosed_date) > lastVisitDate);

      // Build changes list
      const changeItems: string[] = [];

      if (encountersSinceLastVisit.length > 0) {
        changeItems.push(`• ${encountersSinceLastVisit.length} visit${encountersSinceLastVisit.length > 1 ? 's' : ''} with other providers`);
      }

      if (newConditions.length > 0) {
        const condList = newConditions.map(c => c.name).join(', ');
        changeItems.push(`• New diagnoses: ${condList}`);
      }

      if (newMeds.length > 0) {
        const medsList = newMeds.slice(0, 2).map(m => m.name).join(', ');
        changeItems.push(`• New medications: ${medsList}${newMeds.length > 2 ? `, +${newMeds.length - 2} more` : ''}`);
      }

      if (newLabs.length > 0) {
        const abnormalNewLabs = newLabs.filter(l => l.status !== 'normal');
        if (abnormalNewLabs.length > 0) {
          const labsList = abnormalNewLabs.slice(0, 2).map(l => `${l.test_name} (${l.status})`).join(', ');
          changeItems.push(`• New labs: ${labsList}${abnormalNewLabs.length > 2 ? `, +${abnormalNewLabs.length - 2} more` : ''}`);
        } else {
          changeItems.push(`• ${newLabs.length} new lab${newLabs.length > 1 ? 's' : ''} (all normal)`);
        }
      }

      if (changeItems.length > 0) {
        sections.push({
          title: 'Changes Since Last Visit',
          content: changeItems.join('\n')
        });
      }

      // Current active conditions summary
      if (activeConditions.length > 0) {
        const conditionsList = activeConditions.slice(0, 3).map(c => c.name).join(', ');
        sections.push({
          title: 'Active Conditions',
          content: `${conditionsList}${activeConditions.length > 3 ? `, +${activeConditions.length - 3} more` : ''}`
        });
      }
    }

    return sections;
  };

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      <div className="px-6 pt-4 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
        <div className="flex items-start space-x-3 mb-6">
          <div className="w-12 h-12 bg-healthcare-100 dark:bg-healthcare-900/30 rounded-full flex items-center justify-center flex-shrink-0">
            <User className="w-6 h-6 text-healthcare-600 dark:text-healthcare-400" />
          </div>
          <div className="flex-1">
            <div className="flex items-center space-x-2">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{patient.name}</h2>
              <button
                onClick={() => setShowSummaryModal(true)}
                className="p-1 rounded-full hover:bg-healthcare-100 dark:hover:bg-healthcare-900/30 transition-colors duration-200"
                aria-label="View patient summary"
              >
                <Info className="w-5 h-5 text-healthcare-600 dark:text-healthcare-400" />
              </button>
            </div>
            <div className="flex items-center space-x-3 text-sm text-gray-600 dark:text-gray-400 mt-1">
              <span>{patient.age} years</span>
              <span>•</span>
              <span>{patient.gender}</span>
            </div>
          </div>
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setShowReferralMenu(!showReferralMenu)}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200"
            >
              <MoreVertical className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>
            {showReferralMenu && (
              <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-gray-900 rounded-lg shadow-xl border border-gray-200 dark:border-gray-800 z-50">
                <div className="p-3 border-b border-gray-200 dark:border-gray-800">
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Refer Patient (Simulated)</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Select a specialist to refer to</p>
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {specialists.map((specialist) => (
                    <button
                      key={specialist.id}
                      onClick={() => handleReferral(specialist)}
                      className="w-full text-left p-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-200 border-b border-gray-100 dark:border-gray-800 last:border-b-0"
                    >
                      <div className="flex items-start space-x-3">
                        <div className="w-8 h-8 bg-healthcare-100 dark:bg-healthcare-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                          <User className="w-4 h-4 text-healthcare-600 dark:text-healthcare-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{specialist.name}</p>
                          <p className="text-xs text-gray-600 dark:text-gray-400">{specialist.specialty}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-500">NPI: {specialist.npi}</p>
                        </div>
                        <Send className="w-4 h-4 text-gray-400 dark:text-gray-500 flex-shrink-0 mt-1" />
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {showReferralSuccess && (
          <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-lg">
            <p className="text-sm text-green-800 dark:text-green-300 flex items-center space-x-2">
              <Send className="w-4 h-4" />
              <span>Referral sent successfully (simulated)</span>
            </p>
          </div>
        )}
      </div>

      {showSummaryModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-800">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Patient Information</h2>
              <button
                onClick={() => setShowSummaryModal(false)}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200"
                aria-label="Close modal"
              >
                <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </button>
            </div>

            <div className="overflow-y-auto p-6 space-y-6">
              <div>
                <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">MRN</p>
                    <p className="text-gray-900 dark:text-white font-medium">{patient.mrn}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">Date of Birth</p>
                    <p className="text-gray-900 dark:text-white">{patient.date_of_birth}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">Insurance Provider</p>
                    <p className="text-gray-900 dark:text-white">{patient.insurance_provider}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">Policy Number</p>
                    <p className="text-gray-900 dark:text-white font-mono text-xs">{patient.insurance_policy_number}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 sticky top-0 z-10">
      <div className="p-4">
                <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">Clinical Summary</h3>
                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 space-y-3">
                  {generatePatientSummary().map((section, index) => (
                    <div key={index}>
                      {section.title ? (
                        <div>
                          <p className="text-xs font-semibold text-healthcare-600 dark:text-healthcare-400 mb-1">
                            {section.title}
                          </p>
                          <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line">
                            {section.content}
                          </p>
                        </div>
                      ) : (
                        <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                          {section.content}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
        <div className="flex space-x-0.5 px-2 py-1.5 overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 min-w-0 px-2 py-1.5 rounded text-xs font-medium transition-colors duration-200 flex flex-col items-center justify-center gap-0.5 ${
                  activeTab === tab.id
                    ? 'bg-healthcare-500 text-white'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                <Icon className="w-3.5 h-3.5 flex-shrink-0" />
                <span className="truncate text-[10px] leading-tight">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="p-4">
        {activeTab === 'encounters' && (
          <div className="space-y-4">
            {encounters.length === 0 ? (
              <p className="text-center text-gray-500 dark:text-gray-400 py-8">No encounters found</p>
            ) : (
              encounters.map((encounter) => (
                <div
                  key={encounter.id}
                  className="p-4 bg-white dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700"
                >
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{encounter.reason}</p>
                    <span className="text-xs text-gray-500 dark:text-gray-400">{encounter.encounter_date}</span>
                  </div>
                  <p className="text-sm text-healthcare-600 dark:text-healthcare-400 font-medium mb-2">
                    {encounter.diagnosis}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{encounter.notes}</p>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'conditions' && (
          <div className="space-y-4">
            {conditions.length === 0 ? (
              <p className="text-center text-gray-500 dark:text-gray-400 py-8">No conditions found</p>
            ) : (
              conditions.map((condition) => (
                <div
                  key={condition.id}
                  className="p-4 bg-white dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{condition.name}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{condition.icd10_code}</p>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(condition.status)}`}>
                      {condition.status}
                    </span>
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                    Diagnosed: {condition.diagnosed_date}
                    {condition.resolved_date && ` • Resolved: ${condition.resolved_date}`}
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{condition.notes}</p>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'medications' && (
          <div className="space-y-4">
            {medications.length === 0 ? (
              <p className="text-center text-gray-500 dark:text-gray-400 py-8">No medications found</p>
            ) : (
              medications.map((medication) => (
                <div
                  key={medication.id}
                  className="p-4 bg-white dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{medication.name}</p>
                      <p className="text-sm text-healthcare-600 dark:text-healthcare-400 mt-1">
                        {medication.dosage} • {medication.frequency}
                      </p>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(medication.status)}`}>
                      {medication.status}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                    Prescribed: {medication.prescribed_date}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{medication.notes}</p>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'labs' && (
          <div className="space-y-4">
            {labs.length === 0 ? (
              <p className="text-center text-gray-500 dark:text-gray-400 py-8">No lab reports found</p>
            ) : (
              labs.map((lab) => (
                <div
                  key={lab.id}
                  className="p-4 bg-white dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{lab.test_name}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{lab.test_date}</p>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(lab.status)}`}>
                      {lab.status}
                    </span>
                  </div>
                  <div className="flex items-baseline space-x-2 mb-2">
                    <p className="text-lg font-semibold text-gray-900 dark:text-white">
                      {lab.result_value} {lab.unit}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Normal: {lab.normal_range} {lab.unit}
                    </p>
                  </div>
                  {lab.notes && <p className="text-sm text-gray-600 dark:text-gray-400">{lab.notes}</p>}
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}

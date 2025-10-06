import { useState, useEffect } from 'react';
import { Calendar, Clock, User, AlertCircle, UserPlus, Share2 } from 'lucide-react';
import { getAppointmentsByDoctorId, getPatientById } from '../../lib/database';
import { useAuth } from '../../contexts/AuthContext';
import type { Appointment as DbAppointment, Patient } from '../../lib/supabase';

interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  time: string;
  reason: string;
  type: string;
  duration: number;
  patientCategory: 'existing' | 'existing-urgent' | 'new-to-practice' | 'referral';
}

interface LeftPanelProps {
  onSelectAppointment: (patientId: string, appointment: Appointment) => void;
}

export function LeftPanel({ onSelectAppointment }: LeftPanelProps) {
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState('2025-10-03');
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadAppointments() {
      if (!user) return;

      setIsLoading(true);
      const dbAppointments = await getAppointmentsByDoctorId(user.id, selectedDate);

      const appointmentsWithDetails = await Promise.all(
        dbAppointments.map(async (apt) => {
          const patient = await getPatientById(apt.patient_id);
          return {
            id: apt.id,
            patientId: apt.patient_id,
            patientName: patient?.name || 'Unknown',
            time: apt.time,
            reason: apt.reason,
            type: apt.type,
            duration: 30,
            patientCategory: apt.patient_category
          };
        })
      );

      setAppointments(appointmentsWithDetails);
      setIsLoading(false);
    }

    loadAppointments();
  }, [user, selectedDate]);

  const existingPatients = appointments.filter(a => a.patientCategory == 'existing');
  const urgentPatients = appointments.filter(a => a.patientCategory == 'existing-urgent');
  const newPatients = appointments.filter(a => a.patientCategory == 'new-to-practice');
  const referralPatients= appointments.filter(a => a.patientCategory == 'referral');

  const getAppointmentTypeColor = (type: string) => {
    switch (type) {
      case 'Follow-up':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
      case 'New Patient':
        return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
      case 'Annual Physical':
        return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400';
      case 'Urgent Visit':
        return 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400';
      case 'Referral':
        return 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400';
      default:
        return 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-400';
    }
  };

  const getCategoryIcon = (category: PatientCategory) => {
    switch (category) {
      case 'existing':
        return User;
      case 'existing-urgent':
        return AlertCircle;
      case 'new-to-practice':
        return UserPlus;
      case 'referral':
        return Share2;
    }
  };

  const getCategoryColor = (category: PatientCategory) => {
    switch (category) {
      case 'existing':
        return 'bg-healthcare-100 dark:bg-healthcare-900/30 text-healthcare-600 dark:text-healthcare-400';
      case 'existing-urgent':
        return 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400';
      case 'new-to-practice':
        return 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400';
      case 'referral':
        return 'bg-teal-100 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400';
    }
  };

  const renderAppointmentCard = (appointment: Appointment) => {
    const Icon = getCategoryIcon(appointment.patientCategory);
    return (
      <button
        key={appointment.id}
        onClick={() => onSelectAppointment(appointment.patientId, appointment)}
        className="w-full p-3 bg-white dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-healthcare-500 dark:hover:border-healthcare-500 transition-all duration-200 text-left group"
      >
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center space-x-2 flex-1 min-w-0">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${getCategoryColor(appointment.patientCategory)}`}>
              <Icon className="w-3.5 h-3.5" />
            </div>
            <p className="font-medium text-sm text-gray-900 dark:text-white group-hover:text-healthcare-600 dark:group-hover:text-healthcare-400 transition-colors truncate">
              {appointment.patientName}
            </p>
          </div>
          <span className={`px-2 py-0.5 rounded text-xs font-medium flex-shrink-0 ml-2 ${getAppointmentTypeColor(appointment.type)}`}>
            {appointment.type}
          </span>
        </div>

        <div className="flex items-center space-x-3 text-xs text-gray-600 dark:text-gray-400 mb-2">
          <div className="flex items-center space-x-1">
            <Clock className="w-3 h-3" />
            <span>{appointment.time}</span>
          </div>
          <span>•</span>
          <span>{appointment.duration} min</span>
        </div>

        <p className="text-xs text-gray-700 dark:text-gray-300 line-clamp-2">
          {appointment.reason}
        </p>
      </button>
    );
  };

  const renderCategorySection = (
    title: string,
    appointments: Appointment[],
    icon: React.ReactNode
  ) => {
    if (appointments.length === 0) return null;

    return (
      <div className="mb-4">
        <div className="flex items-center space-x-2 mb-2 px-1">
          {icon}
          <h3 className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
            {title}
          </h3>
          <span className="text-xs text-gray-500 dark:text-gray-400">({appointments.length})</span>
        </div>
        <div className="space-y-2">
          {appointments.map(renderAppointmentCard)}
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-gray-200 dark:border-gray-800">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Appointments</h2>
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-healthcare-500 focus:border-transparent outline-none transition-colors duration-200"
        />
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-healthcare-500"></div>
          </div>
        ) : appointments.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-6">
            <Calendar className="w-12 h-12 text-gray-400 dark:text-gray-600 mb-3" />
            <p className="text-gray-600 dark:text-gray-400 font-medium">No appointments</p>
            <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
              No appointments scheduled for this date
            </p>
          </div>
        ) : (
          <div>
            {renderCategorySection(
              'Existing Patients',
              existingPatients,
              <User className="w-4 h-4 text-healthcare-600 dark:text-healthcare-400" />
            )}
            {renderCategorySection(
              'Urgent (Existing)',
              urgentPatients,
              <AlertCircle className="w-4 h-4 text-orange-600 dark:text-orange-400" />
            )}
            {renderCategorySection(
              'New to Practice',
              newPatients,
              <UserPlus className="w-4 h-4 text-green-600 dark:text-green-400" />
            )}
            {renderCategorySection(
              'Referrals',
              referralPatients,
              <Share2 className="w-4 h-4 text-teal-600 dark:text-teal-400" />
            )}
          </div>
        )}
      </div>
    </div>
  );
}

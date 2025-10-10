import { useState, useEffect } from 'react';
import { Calendar, User, AlertCircle, UserPlus, Share2, Plus } from 'lucide-react';
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

type PatientCategory = 'existing' | 'existing-urgent' | 'new-to-practice' | 'referral';

function parseTime(timeStr: string): { hours: number; minutes: number } {
  const [time, period] = timeStr.split(' ');
  let [hours, minutes] = time.split(':').map(Number);

  if (period === 'PM' && hours !== 12) hours += 12;
  if (period === 'AM' && hours === 12) hours = 0;

  return { hours, minutes };
}

function timeToMinutes(timeStr: string): number {
  const { hours, minutes } = parseTime(timeStr);
  return hours * 60 + minutes;
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

  const workdayStart = 8;
  const workdayEnd = 18;
  const hours = Array.from({ length: workdayEnd - workdayStart }, (_, i) => workdayStart + i);

  const getCategoryColor = (category: PatientCategory) => {
    switch (category) {
      case 'existing':
        return 'bg-healthcare-500 border-healthcare-600';
      case 'existing-urgent':
        return 'bg-orange-500 border-orange-600';
      case 'new-to-practice':
        return 'bg-green-500 border-green-600';
      case 'referral':
        return 'bg-teal-500 border-teal-600';
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

  const formatTime = (hour: number) => {
    if (hour === 0) return '12 AM';
    if (hour < 12) return `${hour} AM`;
    if (hour === 12) return '12 PM';
    return `${hour - 12} PM`;
  };

  const getAppointmentsForHour = (hour: number) => {
    return appointments.filter(apt => {
      const aptMinutes = timeToMinutes(apt.time);
      const hourStart = hour * 60;
      const hourEnd = (hour + 1) * 60;
      return aptMinutes >= hourStart && aptMinutes < hourEnd;
    });
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

      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-healthcare-500"></div>
          </div>
        ) : (
          <div className="relative">
            {hours.map((hour) => {
              const hourAppointments = getAppointmentsForHour(hour);
              return (
                <div
                  key={hour}
                  className="flex border-b border-gray-100 dark:border-gray-800/50 hover:bg-gray-50/50 dark:hover:bg-gray-900/30 transition-colors duration-150"
                  style={{ minHeight: '60px' }}
                >
                  <div className="w-16 flex-shrink-0 py-1 pr-3 text-right">
                    <span className="text-[11px] font-medium text-gray-500 dark:text-gray-500">
                      {formatTime(hour)}
                    </span>
                  </div>

                  <div className="flex-1 py-1 pr-2 relative">
                    {hourAppointments.length === 0 ? (
                      <button className="w-full h-full flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-200 group">
                        <Plus className="w-3.5 h-3.5 text-gray-300 dark:text-gray-700 group-hover:text-healthcare-400 dark:group-hover:text-healthcare-500" />
                      </button>
                    ) : (
                      <div className="space-y-1">
                        {hourAppointments.map((appointment) => {
                          const Icon = getCategoryIcon(appointment.patientCategory);
                          return (
                            <button
                              key={appointment.id}
                              onClick={() => onSelectAppointment(appointment.patientId, appointment)}
                              className={`w-full px-2 py-1.5 rounded-md border-l-[3px] text-left transition-all duration-200 hover:shadow-sm ${getCategoryColor(
                                appointment.patientCategory
                              )} text-white group`}
                            >
                              <div className="flex items-center justify-between gap-2 mb-0.5">
                                <div className="flex items-center gap-1.5 flex-1 min-w-0">
                                  <Icon className="w-3 h-3 flex-shrink-0 opacity-90" />
                                  <span className="text-[11px] font-semibold tracking-tight">
                                    {appointment.time}
                                  </span>
                                </div>
                                <span className="text-[10px] opacity-75 flex-shrink-0">
                                  {appointment.duration}m
                                </span>
                              </div>
                              <p className="text-xs font-semibold leading-tight truncate pl-[18px]">
                                {appointment.patientName}
                              </p>
                              <p className="text-[11px] opacity-80 line-clamp-1 leading-tight pl-[18px] mt-0.5">
                                {appointment.reason}
                              </p>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

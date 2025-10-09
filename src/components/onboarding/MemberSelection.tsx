import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { User, MapPin, Stethoscope, ChevronRight } from 'lucide-react';

interface OrganizationMember {
  id: string;
  full_name: string;
  role: string;
  specialty: string;
  location: string;
  email: string;
}

interface MemberSelectionProps {
  onSelectMember: (member: OrganizationMember) => void;
}

export function MemberSelection({ onSelectMember }: MemberSelectionProps) {
  const [members, setMembers] = useState<OrganizationMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    try {
      const { data, error } = await supabase
        .from('organization_members')
        .select('*')
        .eq('is_available', true)
        .order('role');

      if (error) throw error;
      setMembers(data || []);
    } catch (error) {
      console.error('Error fetching members:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectMember = (member: OrganizationMember) => {
    setSelectedMemberId(member.id);
    setTimeout(() => {
      onSelectMember(member);
    }, 300);
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'Primary Care Physician':
        return 'from-blue-500 to-blue-600';
      case 'Cardiologist':
        return 'from-red-500 to-red-600';
      case 'Nurse':
        return 'from-green-500 to-green-600';
      case 'Clinical Quality Analyst':
        return 'from-purple-500 to-purple-600';
      default:
        return 'from-gray-500 to-gray-600';
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'Primary Care Physician':
      case 'Cardiologist':
        return Stethoscope;
      case 'Nurse':
        return User;
      case 'Clinical Quality Analyst':
        return User;
      default:
        return User;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-healthcare-50 to-blue-50 dark:from-gray-950 dark:to-gray-900">
        <div className="text-gray-600 dark:text-gray-400">Loading organization members...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-healthcare-50 to-blue-50 dark:from-gray-950 dark:to-gray-900 py-12 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-healthcare-400 to-healthcare-600 rounded-2xl mb-6 shadow-lg">
            <User className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-3">
            Welcome to Riverside Medical Center
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Select your role to continue to your personalized workspace
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {members.map((member) => {
            const RoleIcon = getRoleIcon(member.role);
            const isSelected = selectedMemberId === member.id;

            return (
              <button
                key={member.id}
                onClick={() => handleSelectMember(member)}
                className={`group relative bg-white dark:bg-gray-900 rounded-2xl border-2 transition-all duration-300 overflow-hidden text-left
                  ${isSelected
                    ? 'border-healthcare-500 shadow-2xl scale-105'
                    : 'border-gray-200 dark:border-gray-700 hover:border-healthcare-400 hover:shadow-xl hover:scale-102'
                  }`}
              >
                <div className={`absolute top-0 left-0 right-0 h-32 bg-gradient-to-br ${getRoleColor(member.role)} opacity-10`} />

                <div className="relative p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className={`w-14 h-14 bg-gradient-to-br ${getRoleColor(member.role)} rounded-xl flex items-center justify-center shadow-lg`}>
                      <RoleIcon className="w-7 h-7 text-white" />
                    </div>
                    <ChevronRight className={`w-6 h-6 transition-transform duration-300 ${isSelected ? 'text-healthcare-500 translate-x-1' : 'text-gray-400 group-hover:translate-x-1 group-hover:text-healthcare-500'}`} />
                  </div>

                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                    {member.full_name}
                  </h3>

                  <p className={`text-sm font-semibold mb-4 bg-gradient-to-r ${getRoleColor(member.role)} bg-clip-text text-transparent`}>
                    {member.role}
                  </p>

                  <div className="space-y-2">
                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                      <Stethoscope className="w-4 h-4 mr-2 flex-shrink-0" />
                      <span className="line-clamp-1">{member.specialty}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                      <MapPin className="w-4 h-4 mr-2 flex-shrink-0" />
                      <span className="line-clamp-1">{member.location}</span>
                    </div>
                  </div>
                </div>

                {isSelected && (
                  <div className="absolute inset-0 border-2 border-healthcare-500 rounded-2xl pointer-events-none">
                    <div className="absolute inset-0 bg-healthcare-500 opacity-5" />
                  </div>
                )}
              </button>
            );
          })}
        </div>

        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Select the role that matches your position in the organization
          </p>
        </div>
      </div>
    </div>
  );
}

import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { ChevronRight } from 'lucide-react';

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
    }, 200);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-950">
        <div className="text-gray-500 dark:text-gray-400 text-sm">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center px-4 py-12">
      <div className="max-w-2xl w-full">
        <div className="text-center mb-12">
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
            Riverside Medical Center
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Select your role to continue
          </p>
        </div>

        <div className="space-y-3">
          {members.map((member) => {
            const isSelected = selectedMemberId === member.id;

            return (
              <button
                key={member.id}
                onClick={() => handleSelectMember(member)}
                className={`w-full bg-white dark:bg-gray-900 border rounded-lg p-5 text-left transition-all duration-200
                  ${isSelected
                    ? 'border-healthcare-500 shadow-sm'
                    : 'border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700'
                  }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-3 mb-1">
                      <h3 className="text-base font-medium text-gray-900 dark:text-white">
                        {member.full_name}
                      </h3>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {member.role}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {member.specialty}
                    </p>
                  </div>
                  <ChevronRight className={`w-5 h-5 flex-shrink-0 ml-4 transition-all duration-200 ${
                    isSelected
                      ? 'text-healthcare-500'
                      : 'text-gray-400 group-hover:text-gray-500'
                  }`} />
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

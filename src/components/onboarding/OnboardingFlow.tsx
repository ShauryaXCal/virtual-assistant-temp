import { useState } from 'react';
import { MemberSelection } from './MemberSelection';
import { FocusSelection } from './FocusSelection';
import { supabase } from '../../lib/supabase';

interface OrganizationMember {
  id: string;
  full_name: string;
  role: string;
  specialty: string;
  location: string;
  email: string;
}

interface OnboardingFlowProps {
  onComplete: () => void;
}

export function OnboardingFlow({ onComplete }: OnboardingFlowProps) {
  const [step, setStep] = useState<'member-selection' | 'focus-selection'>('member-selection');
  const [selectedMember, setSelectedMember] = useState<OrganizationMember | null>(null);

  const handleMemberSelect = (member: OrganizationMember) => {
    setSelectedMember(member);
    setStep('focus-selection');
  };

  const handleFocusSubmit = async (focus: string) => {
    if (!selectedMember) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        await supabase.auth.signInAnonymously();
        const { data: { user: newUser } } = await supabase.auth.getUser();

        if (newUser) {
          await createSession(newUser.id, selectedMember.id, focus);
        }
      } else {
        await createSession(user.id, selectedMember.id, focus);
      }

      localStorage.setItem('selectedMember', JSON.stringify(selectedMember));
      localStorage.setItem('focusArea', focus);

      onComplete();
    } catch (error) {
      console.error('Error completing onboarding:', error);
    }
  };

  const createSession = async (userId: string, memberId: string, focus: string) => {
    const { error } = await supabase
      .from('user_sessions')
      .insert({
        user_id: userId,
        member_id: memberId,
        focus_area: focus,
      });

    if (error) {
      console.error('Error creating session:', error);
    }
  };

  if (step === 'member-selection') {
    return <MemberSelection onSelectMember={handleMemberSelect} />;
  }

  if (step === 'focus-selection' && selectedMember) {
    return <FocusSelection member={selectedMember} onSubmit={handleFocusSubmit} />;
  }

  return null;
}

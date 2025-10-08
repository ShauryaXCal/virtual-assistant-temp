import { useEffect, useRef, useState } from 'react';

interface AgentSettings {
  outputFormat: string;
  dataPriority: string[];
  actionTypes: string[];
  responseStyle: string;
  detailLevel: string;
  includeReferences: boolean;
  suggestFollowups: boolean;
  prioritizeRecent: boolean;
  customInstructions: string;
}

export function InstructionsLeftPanel() {
  const scrollRef = useRef<HTMLDivElement>(null);

  const [settings, setSettings] = useState<AgentSettings>({
    outputFormat: 'structured',
    dataPriority: ['labs', 'medications', 'conditions'],
    actionTypes: ['diagnostic', 'prescribe', 'monitoring'],
    responseStyle: 'concise',
    detailLevel: 'medium',
    includeReferences: true,
    suggestFollowups: true,
    prioritizeRecent: true,
    customInstructions: '',
  });

  useEffect(() => {
    const savedSettings = localStorage.getItem('agent_settings');

    if (savedSettings) {
      try {
        setSettings(JSON.parse(savedSettings));
      } catch {}
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('agent_settings', JSON.stringify(settings));
  }, [settings]);


  const updateSetting = <K extends keyof AgentSettings>(key: K, value: AgentSettings[K]) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const toggleDataPriority = (item: string) => {
    setSettings(prev => ({
      ...prev,
      dataPriority: prev.dataPriority.includes(item)
        ? prev.dataPriority.filter(i => i !== item)
        : [...prev.dataPriority, item]
    }));
  };

  const toggleActionType = (item: string) => {
    setSettings(prev => ({
      ...prev,
      actionTypes: prev.actionTypes.includes(item)
        ? prev.actionTypes.filter(i => i !== item)
        : [...prev.actionTypes, item]
    }));
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-gray-200 dark:border-gray-800">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Agent Control</h2>
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">Configure AI behavior and preferences</p>
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto">
        <div className="p-4 space-y-5">
            <SettingSection
              title="Custom Instructions"
              subtitle="Provide specific guidance for how the AI should assist you"
            >
              <textarea
                value={settings.customInstructions}
                onChange={(e) => updateSetting('customInstructions', e.target.value)}
                placeholder="Example: Always mention potential drug interactions, prioritize evidence-based guidelines, use patient-friendly language for education materials..."
                className="w-full px-3 py-2 text-sm rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-1 focus:ring-healthcare-500 resize-none placeholder:text-gray-400 dark:placeholder:text-gray-500"
                rows={4}
              />
            </SettingSection>

            <SettingSection
              title="Output Format"
              subtitle="How should the AI present information to you?"
            >
              <div className="space-y-2">
                {[
                  { value: 'structured', label: 'Structured', desc: 'Organized sections with bullet points for easy scanning' },
                  { value: 'narrative', label: 'Narrative', desc: 'Flowing paragraphs with connected thoughts' },
                  { value: 'clinical', label: 'Clinical SOAP', desc: 'Subjective, Objective, Assessment, Plan format' },
                  { value: 'concise', label: 'Concise', desc: 'Key points only, minimal elaboration' },
                  { value: 'detailed', label: 'Detailed', desc: 'Comprehensive analysis with full context' },
                ].map(option => (
                  <label key={option.value} className="flex items-start gap-2 cursor-pointer group p-2 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <input
                      type="radio"
                      name="outputFormat"
                      value={option.value}
                      checked={settings.outputFormat === option.value}
                      onChange={(e) => updateSetting('outputFormat', e.target.value)}
                      className="mt-0.5 w-4 h-4 text-healthcare-500 focus:ring-healthcare-500"
                    />
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">{option.label}</div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">{option.desc}</div>
                    </div>
                  </label>
                ))}
              </div>
            </SettingSection>

            <SettingSection title="Data Priority" subtitle="Order matters - first selected shown first">
              <div className="space-y-1.5">
                {['labs', 'medications', 'conditions', 'vitals', 'allergies', 'procedures', 'encounters'].map(item => (
                  <label key={item} className="flex items-center gap-2 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={settings.dataPriority.includes(item)}
                      onChange={() => toggleDataPriority(item)}
                      className="w-3.5 h-3.5 rounded border-gray-300 dark:border-gray-700 text-healthcare-500 focus:ring-healthcare-500"
                    />
                    <span className="text-xs text-gray-700 dark:text-gray-300 capitalize group-hover:text-healthcare-600 dark:group-hover:text-healthcare-400">
                      {item}
                    </span>
                    {settings.dataPriority.includes(item) && (
                      <span className="ml-auto text-[10px] text-gray-500 dark:text-gray-400">
                        #{settings.dataPriority.indexOf(item) + 1}
                      </span>
                    )}
                  </label>
                ))}
              </div>
            </SettingSection>

            <SettingSection
              title="Suggested Actions"
              subtitle="What types of clinical actions should the AI recommend?"
            >
              <div className="space-y-2">
                {[
                  { value: 'diagnostic', label: 'Diagnostic Workup', desc: 'Suggest labs, imaging, or tests to order' },
                  { value: 'prescribe', label: 'Medication Management', desc: 'Recommend prescriptions, dosage adjustments, or alternatives' },
                  { value: 'referral', label: 'Specialist Referrals', desc: 'Identify when to refer to specialists or subspecialties' },
                  { value: 'monitoring', label: 'Follow-up & Monitoring', desc: 'Propose monitoring schedules and surveillance plans' },
                  { value: 'patientEd', label: 'Patient Education', desc: 'Suggest patient counseling topics and resources' },
                  { value: 'preventive', label: 'Preventive Care', desc: 'Recommend screenings, vaccinations, lifestyle interventions' },
                  { value: 'documentation', label: 'Documentation Support', desc: 'Help with clinical documentation and coding' },
                  { value: 'differential', label: 'Differential Diagnosis', desc: 'Explore alternative diagnoses and red flags' },
                ].map(action => (
                  <label key={action.value} className="flex items-start gap-2 cursor-pointer group p-2 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <input
                      type="checkbox"
                      checked={settings.actionTypes.includes(action.value)}
                      onChange={() => toggleActionType(action.value)}
                      className="mt-0.5 w-4 h-4 rounded border-gray-300 dark:border-gray-700 text-healthcare-500 focus:ring-healthcare-500"
                    />
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">{action.label}</div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">{action.desc}</div>
                    </div>
                  </label>
                ))}
              </div>
            </SettingSection>

            <SettingSection
              title="Response Style"
              subtitle="What tone and level of formality works best for you?"
            >
              <div className="space-y-2">
                {[
                  { value: 'concise', label: 'Concise & Direct', desc: 'Brief, actionable points without extra elaboration' },
                  { value: 'detailed', label: 'Detailed & Thorough', desc: 'Comprehensive with context, rationale, and considerations' },
                  { value: 'conversational', label: 'Conversational', desc: 'Friendly, approachable tone with explanations' },
                  { value: 'clinical', label: 'Clinical & Formal', desc: 'Professional medical language suitable for documentation' },
                ].map(style => (
                  <label key={style.value} className="flex items-start gap-2 cursor-pointer group p-2 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <input
                      type="radio"
                      name="responseStyle"
                      value={style.value}
                      checked={settings.responseStyle === style.value}
                      onChange={(e) => updateSetting('responseStyle', e.target.value)}
                      className="mt-0.5 w-4 h-4 text-healthcare-500 focus:ring-healthcare-500"
                    />
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">{style.label}</div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">{style.desc}</div>
                    </div>
                  </label>
                ))}
              </div>
            </SettingSection>

            <SettingSection
              title="Detail Level"
              subtitle="How much information should be included in responses?"
            >
              <div className="space-y-2">
                {[
                  { value: 'low', label: 'Essential Only', desc: 'Key facts and immediate actions needed' },
                  { value: 'medium', label: 'Balanced', desc: 'Important details with some context and reasoning' },
                  { value: 'high', label: 'Comprehensive', desc: 'Full explanations, alternatives, and supporting evidence' },
                ].map(level => (
                  <label key={level.value} className="flex items-start gap-2 cursor-pointer group p-2 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <input
                      type="radio"
                      name="detailLevel"
                      value={level.value}
                      checked={settings.detailLevel === level.value}
                      onChange={(e) => updateSetting('detailLevel', e.target.value)}
                      className="mt-0.5 w-4 h-4 text-healthcare-500 focus:ring-healthcare-500"
                    />
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">{level.label}</div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">{level.desc}</div>
                    </div>
                  </label>
                ))}
              </div>
            </SettingSection>

            <SettingSection
              title="Additional Preferences"
              subtitle="Fine-tune how the AI assists you"
            >
              <div className="space-y-2">
                <label className="flex items-start gap-2 cursor-pointer group p-2 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                  <input
                    type="checkbox"
                    checked={settings.includeReferences}
                    onChange={(e) => updateSetting('includeReferences', e.target.checked)}
                    className="mt-0.5 w-4 h-4 rounded border-gray-300 dark:border-gray-700 text-healthcare-500 focus:ring-healthcare-500"
                  />
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">Include Medical References</div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">Cite guidelines, studies, or clinical resources when applicable</div>
                  </div>
                </label>
                <label className="flex items-start gap-2 cursor-pointer group p-2 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                  <input
                    type="checkbox"
                    checked={settings.suggestFollowups}
                    onChange={(e) => updateSetting('suggestFollowups', e.target.checked)}
                    className="mt-0.5 w-4 h-4 rounded border-gray-300 dark:border-gray-700 text-healthcare-500 focus:ring-healthcare-500"
                  />
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">Suggest Follow-up Actions</div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">Recommend next steps and care coordination after each response</div>
                  </div>
                </label>
                <label className="flex items-start gap-2 cursor-pointer group p-2 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                  <input
                    type="checkbox"
                    checked={settings.prioritizeRecent}
                    onChange={(e) => updateSetting('prioritizeRecent', e.target.checked)}
                    className="mt-0.5 w-4 h-4 rounded border-gray-300 dark:border-gray-700 text-healthcare-500 focus:ring-healthcare-500"
                  />
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">Prioritize Recent Data</div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">Give more weight to recent labs, vitals, and clinical findings</div>
                  </div>
                </label>
              </div>
            </SettingSection>
        </div>
      </div>
    </div>
  );
}

function SettingSection({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2.5">
      <div>
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white">{title}</h3>
        {subtitle && <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">{subtitle}</p>}
      </div>
      {children}
    </div>
  );
}




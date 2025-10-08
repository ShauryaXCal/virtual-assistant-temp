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
    actionTypes: ['review', 'prescribe', 'order'],
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
        <div className="p-3 space-y-4">
            <SettingSection title="Output Format">
              <select
                value={settings.outputFormat}
                onChange={(e) => updateSetting('outputFormat', e.target.value)}
                className="w-full px-2 py-1.5 text-xs rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-1 focus:ring-healthcare-500"
              >
                <option value="structured">Structured (sections & bullet points)</option>
                <option value="narrative">Narrative (paragraph form)</option>
                <option value="clinical">Clinical (SOAP note format)</option>
                <option value="concise">Concise (key points only)</option>
                <option value="detailed">Detailed (comprehensive analysis)</option>
              </select>
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

            <SettingSection title="Suggested Actions">
              <div className="space-y-1.5">
                {['review', 'prescribe', 'order', 'refer', 'schedule', 'document', 'educate'].map(item => (
                  <label key={item} className="flex items-center gap-2 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={settings.actionTypes.includes(item)}
                      onChange={() => toggleActionType(item)}
                      className="w-3.5 h-3.5 rounded border-gray-300 dark:border-gray-700 text-healthcare-500 focus:ring-healthcare-500"
                    />
                    <span className="text-xs text-gray-700 dark:text-gray-300 capitalize group-hover:text-healthcare-600 dark:group-hover:text-healthcare-400">
                      {item}
                    </span>
                  </label>
                ))}
              </div>
            </SettingSection>

            <SettingSection title="Response Style">
              <select
                value={settings.responseStyle}
                onChange={(e) => updateSetting('responseStyle', e.target.value)}
                className="w-full px-2 py-1.5 text-xs rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-1 focus:ring-healthcare-500"
              >
                <option value="concise">Concise & Direct</option>
                <option value="detailed">Detailed & Thorough</option>
                <option value="conversational">Conversational</option>
                <option value="clinical">Clinical & Formal</option>
              </select>
            </SettingSection>

            <SettingSection title="Detail Level">
              <div className="flex gap-2">
                {['low', 'medium', 'high'].map(level => (
                  <button
                    key={level}
                    onClick={() => updateSetting('detailLevel', level)}
                    className={`flex-1 px-2 py-1.5 text-xs rounded-md transition-colors ${
                      settings.detailLevel === level
                        ? 'bg-healthcare-500 text-white'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                    }`}
                  >
                    {level.charAt(0).toUpperCase() + level.slice(1)}
                  </button>
                ))}
              </div>
            </SettingSection>

            <SettingSection title="Additional Options">
              <div className="space-y-2">
                <label className="flex items-center justify-between cursor-pointer group">
                  <span className="text-xs text-gray-700 dark:text-gray-300 group-hover:text-healthcare-600 dark:group-hover:text-healthcare-400">
                    Include medical references
                  </span>
                  <input
                    type="checkbox"
                    checked={settings.includeReferences}
                    onChange={(e) => updateSetting('includeReferences', e.target.checked)}
                    className="w-4 h-4 rounded border-gray-300 dark:border-gray-700 text-healthcare-500 focus:ring-healthcare-500"
                  />
                </label>
                <label className="flex items-center justify-between cursor-pointer group">
                  <span className="text-xs text-gray-700 dark:text-gray-300 group-hover:text-healthcare-600 dark:group-hover:text-healthcare-400">
                    Suggest follow-up actions
                  </span>
                  <input
                    type="checkbox"
                    checked={settings.suggestFollowups}
                    onChange={(e) => updateSetting('suggestFollowups', e.target.checked)}
                    className="w-4 h-4 rounded border-gray-300 dark:border-gray-700 text-healthcare-500 focus:ring-healthcare-500"
                  />
                </label>
                <label className="flex items-center justify-between cursor-pointer group">
                  <span className="text-xs text-gray-700 dark:text-gray-300 group-hover:text-healthcare-600 dark:group-hover:text-healthcare-400">
                    Prioritize recent data
                  </span>
                  <input
                    type="checkbox"
                    checked={settings.prioritizeRecent}
                    onChange={(e) => updateSetting('prioritizeRecent', e.target.checked)}
                    className="w-4 h-4 rounded border-gray-300 dark:border-gray-700 text-healthcare-500 focus:ring-healthcare-500"
                  />
                </label>
              </div>
            </SettingSection>

            <SettingSection title="Custom Instructions">
              <textarea
                value={settings.customInstructions}
                onChange={(e) => updateSetting('customInstructions', e.target.value)}
                placeholder="Add any specific instructions for the AI agent..."
                className="w-full px-2 py-1.5 text-xs rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-1 focus:ring-healthcare-500 resize-none"
                rows={3}
              />
            </SettingSection>
        </div>
      </div>
    </div>
  );
}

function SettingSection({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <div>
        <h3 className="text-xs font-semibold text-gray-900 dark:text-white">{title}</h3>
        {subtitle && <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5">{subtitle}</p>}
      </div>
      {children}
    </div>
  );
}




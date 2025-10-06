import { useMemo, useRef, useState, useEffect } from 'react';
import { Search, Loader2, Sparkles, ArrowRight, ChevronDown, ChevronUp } from 'lucide-react';
import { CHAT_SUGGESTIONS } from '../../data/mockData';
import Markdown from 'react-markdown'



import {
  getPatientById,
  getMedicalEncountersByPatientId,
  getConditionsByPatientId,
  getMedicationsByPatientId,
  getLabReportsByPatientId,
} from '../../lib/database';

import { useAuth } from '../../contexts/AuthContext';
import { callAgent } from '../../lib/agentClient';

import type { Patient, MedicalEncounter, Condition, Medication, LabReport } from '../../lib/supabase';

function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function generatePatientQuestions(
  encounters: MedicalEncounter[],
  medications: Medication[],
  conditions: Condition[],
  labs: LabReport[]
): string[] {
  const questions: string[] = [];

  // --- Medications ---
  medications.forEach(med => {
    questions.push(`Why was ${med.name} prescribed?`);
    questions.push(`When was ${med.name} started?`);
    if (med.status === "discontinued") {
      questions.push(`When was ${med.name} discontinued?`);
    }
  });

  // --- Conditions ---
  conditions.forEach(cond => {
    questions.push(`What is the history of ${cond.name}?`);
    questions.push(`When was ${cond.name} diagnosed?`);
    questions.push(`Is ${cond.name} active or resolved?`);
    // Check if any medication notes mention this condition
    const relatedMeds = medications
      .filter(m => m.notes.toLowerCase().includes(cond.name.toLowerCase()))
      .map(m => m.name);
    if (relatedMeds.length) {
      questions.push(
        `Which medications are being used to manage ${cond.name}? (e.g., ${relatedMeds.join(
          ", "
        )})`
      );
    }
  });

  // --- Encounters ---
  encounters.forEach(enc => {
    questions.push(`What was the diagnosis in the encounter on ${enc.encounter_date}?`);
    questions.push(
      `What treatments or referrals were done in the encounter on ${enc.encounter_date}?`
    );
    questions.push(`Show me encounters for reason: ${enc.reason}`);
  });

  // --- Labs ---
  labs.forEach(lab => {
    questions.push(`What were the results of ${lab.test_name} on ${lab.test_date}?`);
    if (lab.status !== "normal") {
      questions.push(`Why was ${lab.test_name} abnormal?`);
    }
  });

  // --- Patient Summary ---
  questions.push(`What is the patient’s cardiac history?`);
  questions.push(`What chronic conditions does the patient have?`);
  questions.push(`What medications is the patient currently taking?`);

  return questions;
}



interface SearchResult {
  id: string;
  query: string;
  answer: string;
  timestamp: string;
}
interface CenterPanelProps {
  patientId: string | null;
  appointment: { id: string; time: string; reason: string } | null;
  rightPanelOpen: boolean;
}

export function CenterPanel({patientId, rightPanelOpen}:CenterPanelProps) {

  const { user } = useAuth();

  const [searchHistory, setSearchHistory] = useState<SearchResult[]>([]);
  const [currentQuery, setCurrentQuery] = useState('');
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchStep, setSearchStep] = useState(0);
  const [input, setInput] = useState('');
  const [conversation, setConversation] = useState<SearchResult[]>([]);


  // const [patient, setPatient] = useState<Patient | null>(null);
  // const [encounters, setEncounters] = useState<MedicalEncounter[]>([]);
  // const [conditions, setConditions] = useState<Condition[]>([]);
  // const [medications, setMedications] = useState<Medication[]>([]);
  // const [labs, setLabs] = useState<LabReport[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [chatSuggestions, setChatSuggestions] = useState<string[]>(CHAT_SUGGESTIONS);
  const [showAllSuggestions, setShowAllSuggestions] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const [currentPatientName, setCurrentPatientName] = useState<string | null>(null);

  const systemMessage = useMemo(() => {
    const doctorName = user?.fullName || 'Unknown Doctor';
    const specialty = user?.specialty || 'General Medicine';
    const patientContext = rightPanelOpen && currentPatientName ? ` The current patient is ${currentPatientName}.` : '';
    return `You are a clinical assistant. The current user is Dr. ${doctorName} (Specialty: ${specialty}).${patientContext} Provide  evidence-informed answers with clear formatting.`;
  }, [user, rightPanelOpen, currentPatientName]);
  
  useEffect(() => {
    async function loadPatientData() {
      if (!patientId) {
        setIsLoading(false);
        setCurrentPatientName(null);
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


      setChatSuggestions(shuffleArray(generatePatientQuestions(encountersData, medicationsData, conditionsData, labsData)));
      setCurrentPatientName(patientData ? patientData.name : null);
      
      // setPatient(patientData);
      // setEncounters(encountersData);
      // setConditions(conditionsData);
      // setMedications(medicationsData);
      // setLabs(labsData);
      // setIsLoading(false);
    }

    loadPatientData();
  }, [patientId]);




  const handleSearch = async (queryText?: string) => {
    const query = queryText || input;
    if (!query.trim() || isSearching) return;

    setCurrentQuery(query);
    setCurrentAnswer('');
    setInput('');
    setIsSearching(true);
    setSearchStep(0);

    setError(null);
    if (abortRef.current) {
      abortRef.current.abort();
    }
    abortRef.current = new AbortController();

    try {
      const historyMessages = conversation.flatMap(item => ([
        { role: 'user' as const, content: item.query },
        { role: 'assistant' as const, content: item.answer }
      ]));
      const answer = await callAgent([
        { role: 'system', content: systemMessage },
        ...historyMessages,
        { role: 'user', content: query }
      ], { signal: abortRef.current.signal });
      const formatted = formatAnswer(answer);
      setCurrentAnswer(formatted);

      const result: SearchResult = {
        id: Date.now().toString(),
        query,
        answer: formatted,
        timestamp: new Date().toISOString(),
      };
      setConversation((prev) => [...prev, result]);
      setSearchHistory((prev) => [result, ...prev]);
    } catch (e: any) {
      if (e?.name !== 'AbortError') {
        setError(e?.message || 'Failed to get answer from agent');
      }
    } finally {
      setIsSearching(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSearch();
    }
  };

  const handleNewSearch = () => {
    setCurrentQuery('');
    setCurrentAnswer('');
    setInput('');
    setError(null);
    setConversation([]);
  };

  const handleSelectHistoryItem = (item: SearchResult) => {
    setCurrentQuery(item.query);
    setCurrentAnswer(item.answer);
    setInput('');
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      {!currentQuery && !currentAnswer ? (
        <div className="flex-1 flex flex-col items-center justify-center p-8">
          <div className="w-full max-w-3xl">
            <div className="flex items-center justify-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-br from-healthcare-400 to-healthcare-600 rounded-2xl flex items-center justify-center">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
            </div>

            <h1 className="text-4xl font-bold text-center text-gray-900 dark:text-white mb-4">
              How can I help?
            </h1>
            <p className="text-center text-gray-600 dark:text-gray-400 mb-8 text-lg">
              Ask about guidelines, diagnoses, treatments, and drug safety for your patients.
            </p>

            <div className="relative mb-8">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask anything..."
                  className="w-full pl-12 pr-4 py-4 text-lg rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-healthcare-500 focus:border-transparent outline-none transition-all duration-200 shadow-sm hover:shadow-md"
                  autoFocus
                />
              </div>
            </div>

            <div className="mb-8">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-3">Try asking:</p>
              <div className={showAllSuggestions ? "grid grid-cols-1 md:grid-cols-2 gap-2 max-h-80 overflow-y-auto" : "grid grid-cols-1 md:grid-cols-2 gap-2"}>
                {(showAllSuggestions ? chatSuggestions : chatSuggestions.slice(0, 6)).map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => handleSearch(suggestion)}
                    className="group px-4 py-3 text-left bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-healthcare-500 dark:hover:border-healthcare-500 hover:shadow-md transition-all duration-200 flex items-center justify-between"
                  >
                    <span className="text-sm text-gray-700 dark:text-gray-300">{suggestion}</span>
                    <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-healthcare-500 opacity-0 group-hover:opacity-100 transition-all duration-200" />
                  </button>
                ))}
              </div>
              {chatSuggestions.length > 6 && (
                <div className="flex justify-center mt-2">
                  <button
                    className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-healthcare-100 dark:hover:bg-healthcare-900/20 transition-colors focus:outline-none"
                    onClick={() => setShowAllSuggestions((prev) => !prev)}
                    aria-label={showAllSuggestions ? 'Show less' : 'Show all'}
                  >
                    {showAllSuggestions ? (
                      <ChevronUp className="w-6 h-6 text-healthcare-500" />
                    ) : (
                      <ChevronDown className="w-6 h-6 text-healthcare-500" />
                    )}
                  </button>
                </div>
              )}
            </div>

            {searchHistory.length > 0 && (
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-3">Recent searches:</p>
                <div className="space-y-2">
                  {searchHistory.slice(0, 3).map((item) => (
                    <button
                      key={item.id}
                      onClick={() => handleSelectHistoryItem(item)}
                      className="w-full group px-4 py-3 text-left bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-healthcare-500 dark:hover:border-healthcare-500 transition-all duration-200 flex items-center justify-between"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-900 dark:text-gray-100 font-medium truncate">{item.query}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{formatTime(item.timestamp)}</p>
                      </div>
                      <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-healthcare-500 flex-shrink-0 ml-2" />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-3xl mx-auto px-6 py-8">
            <button
              onClick={handleNewSearch}
              className="mb-6 text-healthcare-500 hover:text-healthcare-600 font-medium text-sm flex items-center space-x-2 transition-colors duration-200"
            >
              <Search className="w-4 h-4" />
              <span>New search</span>
            </button>

            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                {currentQuery}
              </h1>
            </div>

            {isSearching ? (
              <div className="space-y-6">
                {searchStep >= 0 && (
                  <div className="flex items-center space-x-3 px-4 py-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg border-l-4 border-healthcare-500">
                    {searchStep === 0 ? (
                      <Loader2 className="w-5 h-5 animate-spin text-healthcare-500 flex-shrink-0" />
                    ) : (
                      <div className="w-5 h-5 rounded-full bg-healthcare-500 flex items-center justify-center flex-shrink-0">
                        <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    )}
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {searchStep === 0 ? 'Analyzing query' : 'Finished analyzing'}
                    </span>
                  </div>
                )}

                <div className="space-y-3 pl-4 border-l-2 border-gray-200 dark:border-gray-700">
                  <div className={`flex items-start space-x-3 transition-opacity duration-300 ${searchStep >= 1 ? 'opacity-100' : 'opacity-40'}`}>
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                      searchStep === 1
                        ? 'bg-healthcare-100 dark:bg-healthcare-900/30'
                        : searchStep > 1
                        ? 'bg-healthcare-500'
                        : 'bg-gray-200 dark:bg-gray-700'
                    }`}>
                      {searchStep === 1 ? (
                        <Loader2 className="w-3.5 h-3.5 text-healthcare-600 dark:text-healthcare-400 animate-spin" />
                      ) : searchStep > 1 ? (
                        <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        <Search className="w-3.5 h-3.5 text-gray-400" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className={`text-sm ${searchStep >= 1 ? 'font-medium text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'}`}>
                        Searching patient medical history
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Reviewing encounters, conditions, medications, and lab results</p>
                    </div>
                  </div>

                  <div className={`flex items-start space-x-3 transition-opacity duration-300 ${searchStep >= 2 ? 'opacity-100' : 'opacity-40'}`}>
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                      searchStep === 2
                        ? 'bg-healthcare-100 dark:bg-healthcare-900/30'
                        : searchStep > 2
                        ? 'bg-healthcare-500'
                        : 'bg-gray-200 dark:bg-gray-700'
                    }`}>
                      {searchStep === 2 ? (
                        <Loader2 className="w-3.5 h-3.5 text-healthcare-600 dark:text-healthcare-400 animate-spin" />
                      ) : searchStep > 2 ? (
                        <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        <Search className="w-3.5 h-3.5 text-gray-400" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className={`text-sm ${searchStep >= 2 ? 'font-medium text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'}`}>
                        Searching clinical guidelines and protocols
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Accessing published medical literature, FDA, CDC, and more</p>
                    </div>
                  </div>

                  <div className={`flex items-start space-x-3 transition-opacity duration-300 ${searchStep >= 3 ? 'opacity-100' : 'opacity-40'}`}>
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                      searchStep >= 3
                        ? 'bg-healthcare-100 dark:bg-healthcare-900/30'
                        : 'bg-gray-200 dark:bg-gray-700'
                    }`}>
                      {searchStep >= 3 ? (
                        <Loader2 className="w-3.5 h-3.5 text-healthcare-600 dark:text-healthcare-400 animate-spin" />
                      ) : (
                        <Sparkles className="w-3.5 h-3.5 text-gray-400" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className={`text-sm ${searchStep >= 3 ? 'font-medium text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'}`}>
                        Synthesizing relevant information
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Combining patient data with clinical evidence</p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="prose prose-sm dark:prose-invert max-w-none space-y-4">
                {conversation.map((turn) => (
                  <div key={turn.id} className="p-6 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
                    <div className="mb-3">
                      <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Question</h3>
                      <div className="text-gray-800 dark:text-gray-200 whitespace-pre-wrap leading-relaxed">
                        {turn.query}
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-healthcare-100 dark:bg-healthcare-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Sparkles className="w-5 h-5 text-healthcare-600 dark:text-healthcare-400" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Answer</h3>
                        <div className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
                          <Markdown>{turn.answer}</Markdown>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {error && (
                  <div className="text-red-600 dark:text-red-400 text-sm">{error}</div>
                )}

                <div className="p-4 bg-healthcare-50 dark:bg-healthcare-900/10 rounded-lg border border-healthcare-200 dark:border-healthcare-800">
                  <p className="text-xs text-healthcare-700 dark:text-healthcare-400">
                    <strong>Note:</strong> This information is based on current clinical guidelines and medical literature.
                    Always verify with the latest evidence-based sources and consider individual patient factors when making clinical decisions.
                  </p>
                </div>
              </div>
            )}

            {searchHistory.length > 0 && !isSearching && (
              <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-800">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Related searches</h3>
                <div className="grid grid-cols-1 gap-2">
                  {searchHistory
                    .filter((item) => item.id !== searchHistory[0]?.id)
                    .slice(0, 3)
                    .map((item) => (
                      <button
                        key={item.id}
                        onClick={() => handleSelectHistoryItem(item)}
                        className="group px-4 py-3 text-left bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-healthcare-500 dark:hover:border-healthcare-500 transition-all duration-200 flex items-center justify-between"
                      >
                        <span className="text-sm text-gray-700 dark:text-gray-300">{item.query}</span>
                        <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-healthcare-500 flex-shrink-0" />
                      </button>
                    ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {(currentQuery || currentAnswer) && !isSearching && (
        <div className="border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4">
          <div className="max-w-3xl mx-auto">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask a follow-up question..."
                className="w-full pl-12 pr-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-healthcare-500 focus:border-transparent outline-none transition-colors duration-200"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function formatAnswer(raw: string): string {
  const normalized = raw
    .replace(/\r\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
  return normalized;
}

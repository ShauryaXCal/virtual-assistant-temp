import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Eye, EyeOff, Stethoscope, Loader2, CheckCircle2, XCircle, ArrowRight, ArrowLeft, Search, MapPin, Briefcase } from 'lucide-react';

interface SignupPageProps {
  onSwitchToLogin: () => void;
}

type SignupStep = 'credentials' | 'loading' | 'confirmation';

interface PractitionerInfo {
  specialty: string;
  location: string;
  role: string;
}

export function SignupPage({ onSwitchToLogin }: SignupPageProps) {
  const { signup } = useAuth();
  const [step, setStep] = useState<SignupStep>('credentials');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [npiId, setNpiId] = useState('');
  const [practitionerInfo, setPractitionerInfo] = useState<PractitionerInfo>({
    specialty: '',
    location: '',
    role: 'Doctor'
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);

  const passwordStrength = {
    length: password.length >= 8,
    match: password && confirmPassword && password === confirmPassword,
  };

  useEffect(() => {
    if (step === 'loading') {
      const duration = 3000;
      const interval = 50;
      const steps = duration / interval;
      let currentStep = 0;

      const timer = setInterval(() => {
        currentStep++;
        setLoadingProgress((currentStep / steps) * 100);

        if (currentStep >= steps) {
          clearInterval(timer);
          const mockInfo: PractitionerInfo = {
            specialty: 'Primary Care Physician',
            location: 'New York, NY',
            role: 'Doctor'
          };
          setPractitionerInfo(mockInfo);
          setStep('confirmation');
        }
      }, interval);

      return () => clearInterval(timer);
    }
  }, [step]);

  const handleCredentialsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!fullName || !email || !password || !confirmPassword || !npiId) {
      setError('Please fill in all fields');
      return;
    }

    if (!passwordStrength.length) {
      setError('Password must be at least 8 characters long');
      return;
    }

    if (!passwordStrength.match) {
      setError('Passwords do not match');
      return;
    }

    if (!/^\d{10}$/.test(npiId)) {
      setError('NPI ID must be exactly 10 digits');
      return;
    }

    setStep('loading');
  };

  const handleFinalSubmit = async () => {
    setIsLoading(true);
    try {
      await signup(fullName, email, password, npiId, practitionerInfo.specialty, practitionerInfo.location, practitionerInfo.role);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Signup failed');
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    setStep('credentials');
    setLoadingProgress(0);
  };

  if (step === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-healthcare-50 to-healthcare-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4 transition-colors duration-300">
        <div className="w-full max-w-md">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-12 transition-colors duration-300">
            <div className="flex flex-col items-center">
              <div className="relative mb-8">
                <div className="w-24 h-24 bg-healthcare-500 rounded-full flex items-center justify-center animate-pulse">
                  <Search className="w-12 h-12 text-white" />
                </div>
                <div className="absolute inset-0 w-24 h-24 border-4 border-healthcare-200 dark:border-healthcare-800 rounded-full animate-ping opacity-20"></div>
              </div>

              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                Retrieving Your Information
              </h2>
              <p className="text-gray-600 dark:text-gray-400 text-center mb-8">
                Searching national practitioner database...
              </p>

              <div className="w-full space-y-4">
                <div className="flex items-center text-sm text-gray-700 dark:text-gray-300">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center mr-3 transition-all duration-300 ${
                    loadingProgress > 25 ? 'bg-healthcare-500' : 'bg-gray-300 dark:bg-gray-600'
                  }`}>
                    {loadingProgress > 25 ? (
                      <CheckCircle2 className="w-4 h-4 text-white" />
                    ) : (
                      <Loader2 className="w-4 h-4 text-white animate-spin" />
                    )}
                  </div>
                  <span>Verifying NPI credentials</span>
                </div>

                <div className="flex items-center text-sm text-gray-700 dark:text-gray-300">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center mr-3 transition-all duration-300 ${
                    loadingProgress > 50 ? 'bg-healthcare-500' : 'bg-gray-300 dark:bg-gray-600'
                  }`}>
                    {loadingProgress > 50 ? (
                      <CheckCircle2 className="w-4 h-4 text-white" />
                    ) : (
                      <Loader2 className="w-4 h-4 text-white animate-spin" />
                    )}
                  </div>
                  <span>Fetching specialty information</span>
                </div>

                <div className="flex items-center text-sm text-gray-700 dark:text-gray-300">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center mr-3 transition-all duration-300 ${
                    loadingProgress > 75 ? 'bg-healthcare-500' : 'bg-gray-300 dark:bg-gray-600'
                  }`}>
                    {loadingProgress > 75 ? (
                      <CheckCircle2 className="w-4 h-4 text-white" />
                    ) : (
                      <Loader2 className="w-4 h-4 text-white animate-spin" />
                    )}
                  </div>
                  <span>Retrieving practice location</span>
                </div>
              </div>

              <div className="w-full mt-8 bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-healthcare-500 h-full transition-all duration-300 ease-out"
                  style={{ width: `${loadingProgress}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (step === 'confirmation') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-healthcare-50 to-healthcare-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4 transition-colors duration-300">
        <div className="w-full max-w-2xl">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 md:p-10 transition-colors duration-300">
            <div className="flex flex-col items-center mb-8">
              <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mb-4">
                <CheckCircle2 className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Confirm Your Information</h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">Review and edit your professional details</p>
            </div>

            <div className="space-y-5">
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-5 border border-gray-200 dark:border-gray-600">
                <div className="flex items-start mb-4">
                  <Stethoscope className="w-5 h-5 text-healthcare-500 mr-2 mt-0.5" />
                  <div className="flex-1">
                    <label htmlFor="specialty" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Specialty
                    </label>
                    <input
                      id="specialty"
                      type="text"
                      value={practitionerInfo.specialty}
                      onChange={(e) => setPractitionerInfo({ ...practitionerInfo, specialty: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-healthcare-500 focus:border-transparent outline-none transition-colors duration-200"
                      placeholder="e.g., Primary Care Physician"
                    />
                  </div>
                </div>

                <div className="flex items-start mb-4">
                  <MapPin className="w-5 h-5 text-healthcare-500 mr-2 mt-0.5" />
                  <div className="flex-1">
                    <label htmlFor="location" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Practice Location
                    </label>
                    <input
                      id="location"
                      type="text"
                      value={practitionerInfo.location}
                      onChange={(e) => setPractitionerInfo({ ...practitionerInfo, location: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-healthcare-500 focus:border-transparent outline-none transition-colors duration-200"
                      placeholder="e.g., New York, NY"
                    />
                  </div>
                </div>

                <div className="flex items-start">
                  <Briefcase className="w-5 h-5 text-healthcare-500 mr-2 mt-0.5" />
                  <div className="flex-1">
                    <label htmlFor="role" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Professional Role
                    </label>
                    <select
                      id="role"
                      value={practitionerInfo.role}
                      onChange={(e) => setPractitionerInfo({ ...practitionerInfo, role: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-healthcare-500 focus:border-transparent outline-none transition-colors duration-200"
                    >
                      <option value="Doctor">Doctor</option>
                      <option value="Nurse">Nurse</option>
                      <option value="Surgeon">Surgeon</option>
                      <option value="Administrator">Administrator</option>
                      <option value="Physician Assistant">Physician Assistant</option>
                      <option value="Nurse Practitioner">Nurse Practitioner</option>
                      <option value="Specialist">Specialist</option>
                    </select>
                  </div>
                </div>
              </div>

              {error && (
                <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                </div>
              )}

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={handleBack}
                  disabled={isLoading}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white font-medium py-3 rounded-lg transition-colors duration-200 flex items-center justify-center disabled:opacity-50"
                >
                  <ArrowLeft className="w-5 h-5 mr-2" />
                  Back
                </button>
                <button
                  type="button"
                  onClick={handleFinalSubmit}
                  disabled={isLoading || !practitionerInfo.specialty || !practitionerInfo.location}
                  className="flex-1 bg-healthcare-500 hover:bg-healthcare-600 disabled:bg-healthcare-300 text-white font-medium py-3 rounded-lg transition-colors duration-200 flex items-center justify-center"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Creating account...
                    </>
                  ) : (
                    <>
                      Confirm & Create Account
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-healthcare-50 to-healthcare-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4 transition-colors duration-300">
      <div className="w-full max-w-2xl">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 md:p-10 transition-colors duration-300">
          <div className="flex flex-col items-center mb-8">
            <div className="w-16 h-16 bg-healthcare-500 rounded-full flex items-center justify-center mb-4">
              <Stethoscope className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Create Account</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">Join our healthcare platform</p>
          </div>

          <form onSubmit={handleCredentialsSubmit} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Full Name
                </label>
                <input
                  id="fullName"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-healthcare-500 focus:border-transparent outline-none transition-colors duration-200"
                  placeholder="Dr. John Smith"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-healthcare-500 focus:border-transparent outline-none transition-colors duration-200"
                  placeholder="doctor@healthcare.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="npiId" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                NPI ID
              </label>
              <input
                id="npiId"
                type="text"
                value={npiId}
                onChange={(e) => setNpiId(e.target.value.replace(/\D/g, '').slice(0, 10))}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-healthcare-500 focus:border-transparent outline-none transition-colors duration-200"
                placeholder="1234567890"
                maxLength={10}
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Your 10-digit National Provider Identifier
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-healthcare-500 focus:border-transparent outline-none transition-colors duration-200"
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-healthcare-500 focus:border-transparent outline-none transition-colors duration-200"
                    placeholder="Confirm your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
            </div>

            {password && (
              <div className="space-y-2 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex items-center text-sm">
                  {passwordStrength.length ? (
                    <CheckCircle2 className="w-4 h-4 text-green-500 mr-2" />
                  ) : (
                    <XCircle className="w-4 h-4 text-gray-400 mr-2" />
                  )}
                  <span className={passwordStrength.length ? 'text-green-600 dark:text-green-400' : 'text-gray-600 dark:text-gray-400'}>
                    At least 8 characters
                  </span>
                </div>
                {confirmPassword && (
                  <div className="flex items-center text-sm">
                    {passwordStrength.match ? (
                      <CheckCircle2 className="w-4 h-4 text-green-500 mr-2" />
                    ) : (
                      <XCircle className="w-4 h-4 text-red-500 mr-2" />
                    )}
                    <span className={passwordStrength.match ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>
                      Passwords match
                    </span>
                  </div>
                )}
              </div>
            )}

            {error && (
              <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-healthcare-500 hover:bg-healthcare-600 text-white font-medium py-3 rounded-lg transition-colors duration-200 flex items-center justify-center group"
            >
              Continue
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
            <p className="text-center text-sm text-gray-600 dark:text-gray-400">
              Already have an account?{' '}
              <button
                onClick={onSwitchToLogin}
                className="text-healthcare-500 hover:text-healthcare-600 font-medium"
              >
                Sign in
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

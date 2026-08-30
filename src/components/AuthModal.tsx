import React, { useState } from 'react';
import {
  X,
  Mail,
  Lock,
  User as UserIcon,
  Building2,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Eye,
  EyeOff,
  AlertCircle,
  Flame
} from 'lucide-react';
import { Button } from './ui/Button';
import { StartupStage, User } from '../types';
import { syncUserWithBackend } from '../lib/clientAuthSync';
import {
  auth,
  googleProvider,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  updateFirebaseProfile
} from '../lib/firebase';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'signin' | 'signup';
  onAuthSuccess: (user: User, token: string, state: any) => void;
  onEnterDemo: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialMode = 'signin',
  onAuthSuccess,
  onEnterDemo
}) => {
  const [mode, setMode] = useState<'signin' | 'signup'>(initialMode);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [startupName, setStartupName] = useState('');
  const [stage, setStage] = useState<StartupStage>('Validating');

  // Reset when initialMode changes or modal opens
  React.useEffect(() => {
    setMode(initialMode);
    setError(null);
  }, [initialMode, isOpen]);

  if (!isOpen) return null;

  // Firebase sync helper with backend
  const syncWithBackend = async (
    firebaseUid: string,
    userEmail: string,
    userName: string,
    photoURL?: string,
    targetStartupName?: string,
    targetStage?: StartupStage
  ) => {
    const { user, token, state } = await syncUserWithBackend(
      firebaseUid,
      userEmail,
      userName,
      photoURL,
      targetStartupName,
      targetStage || 'Idea'
    );
    onAuthSuccess(user, token, state);
    onClose();
  };

  // Google Sign-In Handler
  const handleGoogleSignIn = async () => {
    setError(null);
    setGoogleLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const fbUser = result.user;
      await syncWithBackend(
        fbUser.uid,
        fbUser.email || '',
        fbUser.displayName || 'Founder',
        fbUser.photoURL || undefined,
        startupName.trim() || undefined,
        stage
      );
    } catch (err: any) {
      if (err.code === 'auth/popup-closed-by-user' || err.code === 'auth/cancelled-popup-request') {
        // User intentionally closed the popup; exit cleanly without error
        return;
      }
      console.error('Firebase Google Auth error:', err);
      if (err.code === 'auth/popup-blocked') {
        setError('Popup was blocked by your browser. Please allow popups or use email sign-in.');
      } else {
        setError(err.message || 'Google sign-in failed. Please try again.');
      }
    } finally {
      setGoogleLoading(false);
    }
  };

  // Email / Password Form Submission Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !password) {
      setError('Please fill in your email and password');
      return;
    }

    if (mode === 'signup') {
      if (!name.trim()) {
        setError('Please enter your full name');
        return;
      }
      if (password.length < 6) {
        setError('Password must be at least 6 characters long');
        return;
      }
    }

    // Demo shortcut check
    if (cleanEmail === 'demo@founderzero.app' && password === 'demo123') {
      onEnterDemo();
      onClose();
      return;
    }

    setLoading(true);

    try {
      if (mode === 'signup') {
        // Firebase Auth User Creation
        const userCredential = await createUserWithEmailAndPassword(auth, cleanEmail, password);
        const fbUser = userCredential.user;

        // Update display name in Firebase Auth
        if (name.trim()) {
          try {
            await updateFirebaseProfile(fbUser, { displayName: name.trim() });
          } catch (e) {
            // Non-blocking
          }
        }

        await syncWithBackend(
          fbUser.uid,
          cleanEmail,
          name.trim(),
          undefined,
          startupName.trim() || `${name.trim()}'s Startup`,
          stage
        );
      } else {
        // Firebase Auth Sign In
        const userCredential = await signInWithEmailAndPassword(auth, cleanEmail, password);
        const fbUser = userCredential.user;

        await syncWithBackend(
          fbUser.uid,
          fbUser.email || cleanEmail,
          fbUser.displayName || name.trim() || 'Founder',
          fbUser.photoURL || undefined
        );
      }
    } catch (err: any) {
      if (
        err.code === 'auth/user-not-found' ||
        err.code === 'auth/wrong-password' ||
        err.code === 'auth/invalid-credential' ||
        err.code === 'auth/email-already-in-use' ||
        err.code === 'auth/weak-password' ||
        err.code === 'auth/invalid-email'
      ) {
        console.warn('Firebase Email Auth:', err.code);
      } else {
        console.error('Firebase Email Auth error:', err);
      }
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        setError('Invalid email or password. Please verify credentials or create an account.');
      } else if (err.code === 'auth/email-already-in-use') {
        setError('An account with this email already exists. Please sign in instead.');
      } else if (err.code === 'auth/weak-password') {
        setError('Password is too weak. Please use at least 6 characters.');
      } else if (err.code === 'auth/invalid-email') {
        setError('Please enter a valid email address.');
      } else {
        setError(err.message || 'Authentication error. Please check your credentials.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleFillDemo = () => {
    setEmail('demo@founderzero.app');
    setPassword('demo123');
    setError(null);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl shadow-2xl border border-slate-200/80 w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Ribbon */}
        <div className="bg-[#0F172A] p-6 text-white relative shrink-0">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition"
            aria-label="Close modal"
          >
            <X size={18} />
          </button>

          <div className="flex items-center gap-2.5 mb-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#0052FF] to-[#38BDF8] flex items-center justify-center text-white font-bold text-sm shadow-md shadow-blue-500/20">
              0
            </div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-white text-base tracking-tight">FounderZero</span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono bg-amber-500/20 text-amber-300 font-bold border border-amber-400/30">
                <Flame size={11} className="text-amber-400 fill-amber-400" />
                FIREBASE AUTH
              </span>
            </div>
          </div>

          <h2 className="text-xl font-bold text-white tracking-tight">
            {mode === 'signin' ? 'Sign In to Your Workspace' : 'Create Your Founder Account'}
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            {mode === 'signin'
              ? 'Access your zero-budget roadmap and live startup diagnostics'
              : 'Start tracking real metrics, customer feedback, and zero-budget stack'}
          </p>

          {/* Mode Switch Tabs */}
          <div className="flex items-center p-1 bg-slate-900/90 rounded-xl mt-5 border border-slate-800">
            <button
              type="button"
              onClick={() => {
                setMode('signin');
                setError(null);
              }}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
                mode === 'signin'
                  ? 'bg-[#0052FF] text-white shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('signup');
                setError(null);
              }}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
                mode === 'signup'
                  ? 'bg-[#0052FF] text-white shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Create Account
            </button>
          </div>
        </div>

        {/* Modal Body / Form */}
        <div className="p-6 overflow-y-auto flex-1">
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200/80 text-rose-800 text-xs flex items-start gap-2 animate-in fade-in">
              <AlertCircle size={16} className="text-rose-600 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Google Sign In Button */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={googleLoading || loading}
            className="w-full py-2.5 px-4 bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 rounded-xl text-xs font-semibold flex items-center justify-center gap-3 transition shadow-xs hover:border-slate-400 disabled:opacity-60"
          >
            {googleLoading ? (
              <span className="w-4 h-4 border-2 border-slate-400 border-t-blue-600 rounded-full animate-spin" />
            ) : (
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
            )}
            <span>Continue with Google</span>
          </button>

          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200"></div>
            </div>
            <div className="relative flex justify-center text-[11px] uppercase tracking-wider text-slate-400">
              <span className="bg-white px-2">or with Firebase email</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
            {mode === 'signup' && (
              <>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Founder Full Name</label>
                  <div className="relative">
                    <UserIcon size={15} className="absolute left-3.5 top-3 text-slate-400" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. Elena Rostova"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-[#0052FF] focus:bg-white transition"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Startup / App Name</label>
                    <div className="relative">
                      <Building2 size={15} className="absolute left-3.5 top-3 text-slate-400" />
                      <input
                        type="text"
                        placeholder="e.g. ApexMetrics"
                        value={startupName}
                        onChange={(e) => setStartupName(e.target.value)}
                        className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-[#0052FF] focus:bg-white transition"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Current Stage</label>
                    <select
                      value={stage}
                      onChange={(e) => setStage(e.target.value as StartupStage)}
                      className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-[#0052FF] focus:bg-white transition"
                    >
                      <option value="Idea">Idea Stage</option>
                      <option value="Validating">Validating</option>
                      <option value="Building MVP">Building MVP</option>
                      <option value="Launched">Launched</option>
                      <option value="First Revenue">First Revenue</option>
                      <option value="Growing">Growing</option>
                    </select>
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Email Address</label>
              <div className="relative">
                <Mail size={15} className="absolute left-3.5 top-3 text-slate-400" />
                <input
                  type="email"
                  required
                  placeholder="founder@startup.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-[#0052FF] focus:bg-white transition"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="font-semibold text-slate-700">Password</label>
                {mode === 'signin' && (
                  <button
                    type="button"
                    onClick={handleFillDemo}
                    className="text-[11px] text-[#0052FF] hover:underline font-mono"
                  >
                    Use Demo Sandbox
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock size={15} className="absolute left-3.5 top-3 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder={mode === 'signup' ? 'Min 6 characters' : 'Enter your password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-[#0052FF] focus:bg-white transition font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              variant="gradient"
              size="lg"
              className="w-full mt-2 font-semibold shadow-md shadow-blue-500/20"
              disabled={loading || googleLoading}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  <span>Authenticating with Firebase...</span>
                </span>
              ) : mode === 'signin' ? (
                <span className="flex items-center justify-center gap-2">
                  <span>Sign In with Firebase</span>
                  <ArrowRight size={15} />
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <span>Create Firebase Account</span>
                  <ArrowRight size={15} />
                </span>
              )}
            </Button>
          </form>

          {/* Bottom Sandbox Divider */}
          <div className="mt-5 pt-4 border-t border-slate-100 flex flex-col gap-2.5">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span>Want to inspect first?</span>
              <button
                onClick={() => {
                  onClose();
                  onEnterDemo();
                }}
                className="text-[#0052FF] font-semibold hover:underline flex items-center gap-1"
              >
                <Sparkles size={12} />
                <span>Explore Demo Sandbox →</span>
              </button>
            </div>
            <div className="text-[11px] text-slate-400 text-center flex items-center justify-center gap-1">
              <ShieldCheck size={13} className="text-emerald-600" />
              <span>Firebase Auth & Firestore database rules deployed.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

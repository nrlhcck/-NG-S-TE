import React, { useState, useEffect } from 'react';
import { User, SchoolType } from '../types';
import { AVATARS, GRADES } from '../data';
import { auth, db, handleFirestoreError, OperationType, isFirebaseConfigured } from '../firebase';
import { 
  signInWithPopup, 
  GoogleAuthProvider, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';
import { doc, getDoc, writeBatch } from 'firebase/firestore';
import { GraduationCap, LogIn, Sparkles, UserPlus, AlertCircle, CheckCircle2 } from 'lucide-react';

interface LoginProps {
  onLoginSuccess: (user: User) => void;
}

export default function Login({ onLoginSuccess }: LoginProps) {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [isOnboarding, setIsOnboarding] = useState<boolean>(false);
  const [isRegistering, setIsRegistering] = useState<boolean>(false);
  
  // Auth Form Fields
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  // Onboarding Profile Fields
  const [username, setUsername] = useState<string>('');
  const [name, setName] = useState<string>('');
  const [schoolType, setSchoolType] = useState<SchoolType>('Middle School');
  const [grade, setGrade] = useState<number>(5);
  const [avatar, setAvatar] = useState<string>('🎒');
  const [studyGoal, setStudyGoal] = useState<number>(10);
  const [usernameStatus, setUsernameStatus] = useState<'idle' | 'checking' | 'available' | 'taken'>('idle');

  // Listen to Firebase Auth state
  useEffect(() => {
    if (!isFirebaseConfigured) {
      // Local Sandbox Mode: bypass real Firebase Auth state observer checks
      return;
    }
    const unsubscribe = onAuthStateChanged(auth, async (fUser) => {
      if (fUser) {
        setFirebaseUser(fUser);
        setLoading(true);
        try {
          // Check if user profile already exists in Firestore
          const userDocRef = doc(db, 'users', fUser.uid);
          const userDoc = await getDoc(userDocRef);
          
          if (userDoc.exists()) {
            // Profile exists! Complete auth flow
            onLoginSuccess(userDoc.data() as User);
          } else {
            // New user registered! Onboarding is required.
            setIsOnboarding(true);
            if (fUser.displayName) {
              setName(fUser.displayName);
            }
          }
        } catch (err) {
          console.error("Auth sync error:", err);
          setError("Failed to sync your profile from database.");
        } finally {
          setLoading(false);
        }
      } else {
        setFirebaseUser(null);
        setIsOnboarding(false);
      }
    });

    return unsubscribe;
  }, [onLoginSuccess]);

  // Check username availability
  useEffect(() => {
    if (!username || username.trim().length < 3) {
      setUsernameStatus('idle');
      return;
    }

    const timer = setTimeout(async () => {
      setUsernameStatus('checking');
      
      const cleanName = username.trim().toLowerCase();
      // Check standard alphanumeric character set
      if (!/^[a-zA-Z0-9_\-]+$/.test(cleanName)) {
        setUsernameStatus('taken');
        return;
      }

      if (!isFirebaseConfigured) {
        // Local mode option checks
        const localUsersStr = localStorage.getItem('mock_users') || '{}';
        try {
          const localUsers = JSON.parse(localUsersStr);
          const isTaken = Object.values(localUsers).some((entry: any) => 
            entry.user && entry.user.username && entry.user.username.toLowerCase() === cleanName && entry.user.id !== firebaseUser?.uid
          );
          if (isTaken) {
            setUsernameStatus('taken');
          } else {
            setUsernameStatus('available');
          }
        } catch (e) {
          setUsernameStatus('available');
        }
        return;
      }

      try {
        const usernameRef = doc(db, 'usernames', cleanName);
        const usernameSnap = await getDoc(usernameRef);
        
        if (usernameSnap.exists()) {
          const mappedUID = usernameSnap.data().userId;
          // If already mapped to current account, it's fine!
          if (mappedUID === firebaseUser?.uid) {
            setUsernameStatus('available');
          } else {
            setUsernameStatus('taken');
          }
        } else {
          setUsernameStatus('available');
        }
      } catch (err) {
        console.error("Username check error:", err);
        setUsernameStatus('idle');
      }
    }, 500); // 500ms debounce check for ultra snappiness

    return () => clearTimeout(timer);
  }, [username, firebaseUser]);

  // Standard interactive validation for grade ranges
  useEffect(() => {
    const available = GRADES[schoolType];
    if (!available.includes(grade)) {
      setGrade(available[0]);
    }
  }, [schoolType, grade]);

  // Email / Password Login
  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    if (!email || !password) {
      setError('Please fill in check fields.');
      return;
    }

    setLoading(true);

    if (!isFirebaseConfigured) {
      try {
        const localUsersStr = localStorage.getItem('mock_users') || '{}';
        const localUsers = JSON.parse(localUsersStr);
        const match = localUsers[email.toLowerCase().trim()];
        if (match && match.password === password) {
          setSuccess('Local login successful! Preparing your English Quest academy...');
          setTimeout(() => {
            onLoginSuccess(match.user);
          }, 1000);
        } else {
          setError('Incorrect local email or password. Feel free to register a new account!');
        }
      } catch (e) {
        setError('Error accessing local user data.');
      } finally {
        setLoading(false);
      }
      return;
    }

    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Incorrect email or password combination.');
    } finally {
      setLoading(false);
    }
  };

  // Email / Password signup
  const handleEmailRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!email || !password) {
      setError('Please supply both email and password.');
      return;
    }

    if (password.length < 6) {
      setError('Password must contain at least 6 characters.');
      return;
    }

    setLoading(true);

    if (!isFirebaseConfigured) {
      try {
        const localUsersStr = localStorage.getItem('mock_users') || '{}';
        const localUsers = JSON.parse(localUsersStr);
        if (localUsers[email.toLowerCase().trim()]) {
          setError('This email address is already registered locally.');
          setLoading(false);
          return;
        }

        const simulatedUid = 'local_' + Math.random().toString(36).substr(2, 9);
        setFirebaseUser({
          uid: simulatedUid,
          email: email.trim(),
          displayName: email.split('@')[0],
        } as any);
        setIsOnboarding(true);
        setSuccess('Local developer account simulated! Set up your student profile next.');
      } catch (e) {
        setError('Failed to setup mock registration.');
      } finally {
        setLoading(false);
      }
      return;
    }

    try {
      await createUserWithEmailAndPassword(auth, email, password);
      setSuccess('Core account initialized. Welcome aboard!');
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Registration failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  // Google Login popup
  const handleGoogleLogin = async () => {
    setError('');
    setSuccess('');
    setLoading(true);

    if (!isFirebaseConfigured) {
      try {
        const simulatedUid = 'local_google_' + Math.random().toString(36).substr(2, 9);
        setFirebaseUser({
          uid: simulatedUid,
          email: 'google_guest@quest.com',
          displayName: 'Google Guest',
        } as any);
        setIsOnboarding(true);
        setSuccess('Google login simulated successfully in Local Mode! Fill in your details.');
      } catch (e) {
        setError('Error during Google simulation.');
      } finally {
        setLoading(false);
      }
      return;
    }

    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Google Auth flow was externalized.');
    } finally {
      setLoading(false);
    }
  };

  // Onboarding save profile transaction
  const handleOnboardingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!firebaseUser) return;

    const trimmedUser = username.trim().toLowerCase();
    const trimmedName = name.trim();

    if (!trimmedUser || trimmedUser.length < 3) {
      setError('Username must be at least 3 characters long.');
      return;
    }

    if (!trimmedName) {
      setError('Please input your display name.');
      return;
    }

    if (!/^[a-zA-Z0-9_\-]+$/.test(trimmedUser)) {
      setError('Username can only contain letters, numbers, underscores, and hyphens.');
      return;
    }

    setLoading(true);

    if (!isFirebaseConfigured) {
      try {
        const userProfile: User = {
          id: firebaseUser.uid,
          username: trimmedUser,
          name: trimmedName,
          email: firebaseUser.email || undefined,
          schoolType,
          grade,
          avatar,
          xp: 1500, // Pre-seed 1500 XP to give them some visual progression items
          studyGoalHours: studyGoal,
          joinedAt: new Date().toISOString(),
          completedTopics: [],
          friends: [],
          studyLogs: [
            {
              id: 'first_log',
              date: new Date().toISOString().split('T')[0],
              subjectId: 'general_english',
              subjectName: 'Onboarding Quest',
              topicId: 'hello_world',
              topicName: 'Lingo Quest Entrance',
              minutes: 30,
              questionsSolved: 5,
              status: 'Perfect'
            }
          ],
          quizResults: []
        };

        const localUsersStr = localStorage.getItem('mock_users') || '{}';
        const localUsers = JSON.parse(localUsersStr);
        localUsers[email.toLowerCase().trim() || 'google_guest@quest.com'] = {
          password: password,
          user: userProfile
        };
        localStorage.setItem('mock_users', JSON.stringify(localUsers));

        setSuccess('Local profile setup completed! Launching academy tab...');
        setTimeout(() => {
          onLoginSuccess(userProfile);
        }, 1000);
      } catch (err) {
        console.error(err);
        setError('Failed to configure local user profile.');
      } finally {
        setLoading(false);
      }
      return;
    }

    try {
      // Re-verify username uniqueness immediately right before writing
      const usernameRef = doc(db, 'usernames', trimmedUser);
      const usernameSnap = await getDoc(usernameRef);
      
      if (usernameSnap.exists() && usernameSnap.data().userId !== firebaseUser.uid) {
        setError('This specific username is already claimed. Choose another.');
        setUsernameStatus('taken');
        setLoading(false);
        return;
      }

      const userProfile: User = {
        id: firebaseUser.uid,
        username: trimmedUser,
        name: trimmedName,
        email: firebaseUser.email || undefined,
        schoolType,
        grade,
        avatar,
        xp: 1500, // Pre-seed 1500 XP to give them some visual progression items
        studyGoalHours: studyGoal,
        joinedAt: new Date().toISOString()
      };

      // Perform persistent synchronized atomic operations
      const batch = writeBatch(db);
      batch.set(usernameRef, { userId: firebaseUser.uid });
      batch.set(doc(db, 'users', firebaseUser.uid), userProfile);
      
      // Auto-create a warm welcome study log to populate charts
      const logRef = doc(db, 'users', firebaseUser.uid, 'studyLogs', 'first_log');
      batch.set(logRef, {
        id: 'first_log',
        date: new Date().toISOString().split('T')[0],
        subjectId: 'general_english',
        subjectName: 'Onboarding Quest',
        topicId: 'hello_world',
        topicName: 'Lingo Quest Entrance',
        minutes: 30,
        questionsSolved: 5,
        status: 'Perfect'
      });

      await batch.commit();
      onLoginSuccess(userProfile);
    } catch (err: any) {
      console.error("Failed storing profile credentials:", err);
      handleFirestoreError(err, OperationType.WRITE, `users/${firebaseUser.uid}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 selection:bg-indigo-500 selection:text-white relative overflow-hidden">
      {/* Dynamic Cosmic visual backdrop */}
      <div className="absolute top-0 left-0 right-0 h-96 bg-gradient-to-b from-indigo-950/40 via-transparent to-transparent pointer-events-none" />
      <div className="absolute top-1/2 left-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-1/4 w-96 h-96 bg-fuchsia-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-lg bg-slate-800/95 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden backdrop-blur-md relative z-10">
        
        {/* TOP BAR BRAND DECORATION */}
        <div className="p-8 text-center border-b border-slate-700/50 relative">
          <div className="absolute top-4 right-4 bg-indigo-500/10 border border-indigo-500/20 px-3 py-1 rounded-full text-[10px] font-mono tracking-widest text-indigo-400 font-bold uppercase">
            Lingo Quest v3.0
          </div>
          <div className="flex flex-col items-center">
            <div className="p-4 bg-indigo-600/20 text-indigo-400 rounded-2xl border border-indigo-500/30 w-fit shadow-lg shadow-indigo-500/10 animate-pulse">
              <GraduationCap className="h-9 w-9" />
            </div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight font-sans mt-4">
              Lingo Quest
            </h1>
            <p className="text-slate-400 text-xs font-semibold uppercase tracking-widest mt-1">
              English Learning Odyssey
            </p>
          </div>
        </div>

        {/* NOTIFICATIVE MESSAGE PANEL */}
        <div className="px-8 pt-6">
          {error && (
            <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-rose-300 text-sm font-medium flex gap-3 items-center">
              <AlertCircle className="h-5 w-5 shrink-0 text-rose-400" />
              <p>{error}</p>
            </div>
          )}
          {success && (
            <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-emerald-300 text-sm font-medium flex gap-3 items-center">
              <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-400" />
              <p>{success}</p>
            </div>
          )}
          {!isFirebaseConfigured && (
            <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl text-amber-300 text-xs font-medium leading-relaxed">
              ⚠️ **Local Sandbox Mode**: Firebase credentials have not been linked to the cloud workspace yet. Complete the Firebase authorization prompt in your assistant sidebar, and the full Google Authenticator system will activate instantly.
            </div>
          )}
        </div>

        <div className="p-8">
          {isOnboarding ? (
            /* ================= ONBOARDING SCREEN ================= */
            <form onSubmit={handleOnboardingSubmit} className="space-y-6">
              <div className="text-center mb-4">
                <span className="text-2xl"> Compass 🧭</span>
                <h2 className="text-lg font-bold text-white mt-1">Setup Your Student Record</h2>
                <p className="text-xs text-slate-400">Let's configure your academic scope and avatar</p>
              </div>

              <div className="space-y-4">
                {/* Full name input */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 tracking-wider uppercase ml-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your name"
                    className="w-full px-4 py-3 bg-slate-900 border border-slate-700/80 rounded-2xl focus:outline-none focus:border-indigo-500 focus:bg-slate-950 transition-all text-white font-medium"
                  />
                </div>

                {/* Unique Username input with debounced availability check */}
                <div className="space-y-1.5 relative">
                  <div className="flex justify-between items-center ml-1">
                    <label className="text-[10px] font-bold text-slate-400 tracking-wider uppercase">Unique Username</label>
                    {usernameStatus === 'checking' && <span className="text-[9px] text-slate-400">Checking...</span>}
                    {usernameStatus === 'available' && <span className="text-[9px] text-emerald-400 font-bold">✓ Available</span>}
                    {usernameStatus === 'taken' && <span className="text-[9px] text-rose-400 font-bold">✗ Taken or Invalid</span>}
                  </div>
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/\s+/g, ''))}
                    placeholder="e.g. lingo_master"
                    className="w-full px-4 py-3 bg-slate-900 border border-slate-700/80 rounded-2xl focus:outline-none focus:border-indigo-500 focus:bg-slate-950 transition-all text-white font-medium"
                  />
                  <p className="text-[9px] text-slate-500 mt-1 pl-1">
                    Your friends will add you using this username. Letters, numbers, and underscores allowed (min 3 chars).
                  </p>
                </div>

                {/* Academic level selecting */}
                <div className="grid grid-cols-2 gap-4 bg-slate-950/50 p-3.5 rounded-2xl border border-slate-700/50">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase ml-1">School Level</span>
                    <div className="flex gap-2 mt-1">
                      <button
                        type="button"
                        onClick={() => setSchoolType('Middle School')}
                        className={`flex-1 py-2 px-3 text-xs font-bold rounded-xl border transition-all ${
                          schoolType === 'Middle School'
                            ? 'bg-indigo-600 border-indigo-600 text-white'
                            : 'bg-slate-900 border-slate-700 text-slate-400 hover:bg-slate-800'
                        }`}
                      >
                        Middle
                      </button>
                      <button
                        type="button"
                        onClick={() => setSchoolType('High School')}
                        className={`flex-1 py-2 px-3 text-xs font-bold rounded-xl border transition-all ${
                          schoolType === 'High School'
                            ? 'bg-indigo-600 border-indigo-600 text-white'
                            : 'bg-slate-900 border-slate-700 text-slate-400 hover:bg-slate-800'
                        }`}
                      >
                        High
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase ml-1">Grade</span>
                    <select
                      value={grade}
                      onChange={(e) => setGrade(Number(e.target.value))}
                      className="w-full mt-1 px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl focus:outline-none text-slate-300 font-bold text-xs cursor-pointer"
                    >
                      {GRADES[schoolType].map((g) => (
                        <option key={g} value={g}>
                          Grade {g}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Study goal selection slider */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center px-1">
                    <label className="text-[10px] font-bold text-slate-400 tracking-wider uppercase">Weekly Target</label>
                    <span className="text-xs font-extrabold text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-2.5 py-0.5 rounded-full">{studyGoal} Hours</span>
                  </div>
                  <input
                    type="range"
                    min="2"
                    max="40"
                    step="1"
                    value={studyGoal}
                    onChange={(e) => setStudyGoal(Number(e.target.value))}
                    className="w-full accent-indigo-500 h-1.5 bg-slate-750 rounded-lg cursor-pointer"
                  />
                </div>

                {/* Avatar picker flow */}
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 tracking-wider uppercase ml-1">Choose Mascot Avatar</label>
                  <div className="flex flex-wrap gap-2.5 bg-slate-950/40 p-3 rounded-2xl border border-slate-700/60 max-h-32 overflow-y-auto">
                    {AVATARS.map((av) => (
                      <button
                        type="button"
                        key={av}
                        onClick={() => setAvatar(av)}
                        className={`h-11 w-11 text-xl flex items-center justify-center rounded-xl transition-all ${
                          avatar === av ? 'bg-indigo-600 border-2 border-indigo-400 scale-110 shadow-md shadow-indigo-500/20' : 'hover:bg-slate-800 bg-slate-900 border border-slate-700/40'
                        }`}
                      >
                        {av}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || usernameStatus !== 'available'}
                className="w-full py-3.5 px-4 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-2xl transition-all shadow-lg active:scale-98 flex items-center justify-center gap-2"
              >
                {loading ? "Registering account..." : "Complete Profile & Launch Quest"}
              </button>
            </form>
          ) : (
            /* ================= LOGIN & REGISTER SCREEN ================= */
            <form onSubmit={isRegistering ? handleEmailRegister : handleEmailLogin} className="space-y-5">
              
              {/* EMAIL INPUT */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 tracking-wider uppercase ml-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="student@quest.com"
                  className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-2xl focus:outline-none focus:border-indigo-500 focus:bg-slate-950 transition-all text-white font-medium"
                />
              </div>

              {/* PASSWORD INPUT */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 tracking-wider uppercase ml-1">Password</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-2xl focus:outline-none focus:border-indigo-500 focus:bg-slate-950 transition-all text-white font-medium animate-none"
                />
              </div>

              {/* ACTION SUBMIT BUTTON */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 px-4 bg-white hover:bg-slate-100 disabled:opacity-75 text-slate-950 font-bold rounded-2xl transition-all shadow-md active:scale-98 flex items-center justify-center gap-2"
              >
                {isRegistering ? <UserPlus className="h-5 w-5" /> : <LogIn className="h-5 w-5" />}
                {loading ? "Authenticating..." : (isRegistering ? "Create New Student Account" : "Access Your Portal")}
              </button>

              <div className="relative flex items-center justify-center py-2">
                <div className="absolute w-full h-px bg-slate-750"></div>
                <span className="relative bg-slate-800 px-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">or connect with</span>
              </div>

              {/* GOOGLE PRIMARY ACTION BUTTON */}
              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={loading}
                className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-75 text-white font-bold rounded-2xl transition-all shadow-sm active:scale-98 flex items-center justify-center gap-2 border border-indigo-400/20"
              >
                <Sparkles className="h-4.5 w-4.5 text-indigo-200" />
                Sign In with Google Account
              </button>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => { setIsRegistering(!isRegistering); setError(''); }}
                  className="text-indigo-400 hover:text-indigo-300 font-bold text-xs transition-all focus:outline-none inline-flex items-center gap-1.5"
                >
                  {isRegistering ? "Already have an account? Sign In" : "New to Lingo Quest? Create Student Profile"}
                </button>
              </div>

              {/* PREVIEW DEMO ACCOUNT QUICK LOG */}
              <div className="bg-slate-900/40 rounded-2xl p-4 border border-slate-700/50 mt-6 text-center text-[11px] text-slate-400 leading-relaxed">
                <span className="font-semibold text-slate-300">💡 Quick Evaluation Hint</span>
                <p className="mt-1">
                  You can register a fake account with a dummy email (e.g., <code className="bg-slate-950 px-1 py-0.5 rounded text-indigo-400">test@quest.com</code>/password <code className="bg-slate-950 px-1 py-0.5 rounded text-indigo-400">123456</code>) or log in with any Google account on your browser to activate the live databases.
                </p>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

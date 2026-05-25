import React, { useState, useEffect } from 'react';
import { User, StudyLog, QuizResult, SchoolType } from '../types';
import { SUBJECTS, GRADES, AVATARS } from '../data';
import { db, handleFirestoreError, OperationType, isFirebaseConfigured } from '../firebase';
import { 
  collection, 
  doc, 
  setDoc, 
  updateDoc, 
  onSnapshot, 
  query, 
  orderBy 
} from 'firebase/firestore';
import {
  Award,
  BookOpen,
  CheckCircle,
  Clock,
  Flame,
  PlusCircle,
  Sparkles,
  TrendingDown,
  TrendingUp,
  X,
  Settings,
  User as UserIcon,
  MessageSquare,
  Send,
  Loader2,
  Image as ImageIcon
} from 'lucide-react';

interface DashboardProps {
  user: User;
  onUpdateUser: (updatedUser: User) => void;
}

export default function Dashboard({ user, onUpdateUser }: DashboardProps) {
  const [showLogModal, setShowLogModal] = useState<boolean>(false);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('');
  const [selectedTopicId, setSelectedTopicId] = useState<string>('');
  const [logMinutes, setLogMinutes] = useState<number>(30);
  const [logQuestions, setLogQuestions] = useState<number>(10);
  const [logStatus, setLogStatus] = useState<'Perfect' | 'Review' | 'Struggling'>('Perfect');
  const [logNotes, setLogNotes] = useState<string>('');

  // Live Firestore collections state
  const [studyLogs, setStudyLogs] = useState<StudyLog[]>([]);
  const [quizResults, setQuizResults] = useState<QuizResult[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Profile Settings toggle & fields
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [settingsName, setSettingsName] = useState<string>(user.name);
  const [settingsSchoolType, setSettingsSchoolType] = useState<SchoolType>(user.schoolType);
  const [settingsGrade, setSettingsGrade] = useState<number>(user.grade);
  const [settingsAvatar, setSettingsAvatar] = useState<string>(user.avatar);
  const [settingsPhotoUrl, setSettingsPhotoUrl] = useState<string>('');
  const [settingsStudyGoal, setSettingsStudyGoal] = useState<number>(user.studyGoalHours);
  const [updatingSettings, setUpdatingSettings] = useState<boolean>(false);

  // AI Assistant Chat Box state
  const [chatOpen, setChatOpen] = useState<boolean>(false);
  const [chatMessage, setChatMessage] = useState<string>('');
  const [chatThread, setChatThread] = useState<{ role: 'user' | 'assistant'; content: string }[]>([
    { role: 'assistant', content: `Hello ${user.name}! 🌟 I am your personalized Lingo Buddy. Ask me any English grammar questions, let's practice the 8th-grade "have/has got" rules, or check how to improve your vocabulary camp level!` }
  ]);
  const [sendingChat, setSendingChat] = useState<boolean>(false);

  // Syncer for local user state updates
  useEffect(() => {
    if (!isFirebaseConfigured) {
      setStudyLogs(user.studyLogs || []);
      setQuizResults(user.quizResults || []);
    }
  }, [user, isFirebaseConfigured]);

  // Listen to study logs in real-time
  useEffect(() => {
    if (!isFirebaseConfigured) {
      setStudyLogs(user.studyLogs || []);
      setLoading(false);
      return;
    }
    const logsRef = collection(db, 'users', user.id, 'studyLogs');
    const logsQuery = query(logsRef, orderBy('date', 'desc'));
    
    const unsubscribeLogs = onSnapshot(logsQuery, (snapshot) => {
      const logs: StudyLog[] = [];
      snapshot.forEach((docSnap) => {
        logs.push(docSnap.data() as StudyLog);
      });
      setStudyLogs(logs);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, `users/${user.id}/studyLogs`);
    });

    return unsubscribeLogs;
  }, [user.id]);

  // Listen to quiz results in real-time
  useEffect(() => {
    if (!isFirebaseConfigured) {
      setQuizResults(user.quizResults || []);
      return;
    }
    const resultsRef = collection(db, 'users', user.id, 'quizResults');
    const resultsQuery = query(resultsRef, orderBy('completedAt', 'desc'));

    const unsubscribeResults = onSnapshot(resultsQuery, (snapshot) => {
      const results: QuizResult[] = [];
      snapshot.forEach((docSnap) => {
        results.push(docSnap.data() as QuizResult);
      });
      setQuizResults(results);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, `users/${user.id}/quizResults`);
    });

    return unsubscribeResults;
  }, [user.id]);

  // Handle syncing selected grade within available limits
  useEffect(() => {
    const list = GRADES[settingsSchoolType];
    if (!list.includes(settingsGrade)) {
      setSettingsGrade(list[0]);
    }
  }, [settingsSchoolType, settingsGrade]);

  // Derived Statistics
  const level = Math.floor(user.xp / 500) + 1;
  const xpNeededForNextLevel = 500 - (user.xp % 500);
  const levelProgressPercent = ((user.xp % 500) / 500) * 100;

  // Curriculums representing the student's level (Middle or High School)
  const relevantSubjects = SUBJECTS.filter(
    (sub) => sub.schoolType === user.schoolType
  );

  const totalStudyMinutes = studyLogs.reduce((acc, curr) => acc + curr.minutes, 0);
  const totalQuestionsSolved = studyLogs.reduce((acc, curr) => acc + curr.questionsSolved, 0);

  const weeklyStudyHours = parseFloat((totalStudyMinutes / 60).toFixed(1));
  const goalProgressPercent = Math.min(Math.round((weeklyStudyHours / user.studyGoalHours) * 100), 100);

  // Insert standard learning entry
  const handleAddStudyLog = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSubjectId || !selectedTopicId) return;

    const matchedSubject = relevantSubjects.find((s) => s.id === selectedSubjectId);
    const matchedTopic = matchedSubject?.topics.find((t) => t.id === selectedTopicId);

    if (!matchedSubject || !matchedTopic) return;

    const newLogId = 'log_' + Date.now();
    const newLog: StudyLog = {
      id: newLogId,
      date: new Date().toISOString().split('T')[0],
      subjectId: selectedSubjectId,
      subjectName: matchedSubject.name,
      topicId: selectedTopicId,
      topicName: matchedTopic.name,
      minutes: Number(logMinutes),
      questionsSolved: Number(logQuestions),
      status: logStatus,
      notes: logNotes.trim() || undefined
    };

    const xpReward = Math.round(Number(logMinutes) * 1) + (Number(logQuestions) * 2);

    if (!isFirebaseConfigured) {
      onUpdateUser({
        ...user,
        xp: user.xp + xpReward,
        studyLogs: [newLog, ...(user.studyLogs || [])]
      });
      setShowLogModal(false);
      // Reset Form
      setLogMinutes(30);
      setLogQuestions(10);
      setLogStatus('Perfect');
      setLogNotes('');
      return;
    }

    try {
      // 1. Write the log entry document securely
      await setDoc(doc(db, 'users', user.id, 'studyLogs', newLogId), newLog);

      // 2. Synchronize new XP on main User profile
      await updateDoc(doc(db, 'users', user.id), {
        xp: user.xp + xpReward
      });

      // Update local state copy to trigger fast UI reflect
      onUpdateUser({
        ...user,
        xp: user.xp + xpReward
      });

      setShowLogModal(false);
      // Reset Form
      setLogMinutes(30);
      setLogQuestions(10);
      setLogStatus('Perfect');
      setLogNotes('');
    } catch (err) {
      console.error(err);
      handleFirestoreError(err, OperationType.WRITE, `users/${user.id}/studyLogs/${newLogId}`);
    }
  };

  // Update Settings
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdatingSettings(true);

    const updatePayload: any = {
      name: settingsName.trim(),
      schoolType: settingsSchoolType,
      grade: settingsGrade,
      avatar: settingsAvatar,
      studyGoalHours: settingsStudyGoal
    };

    // Custom photo URL
    if (settingsPhotoUrl.trim()) {
      updatePayload.avatar = settingsPhotoUrl.trim();
    }

    if (!isFirebaseConfigured) {
      onUpdateUser({
        ...user,
        ...updatePayload
      });
      setShowSettings(false);
      setUpdatingSettings(false);
      return;
    }

    try {
      const userRef = doc(db, 'users', user.id);

      await updateDoc(userRef, updatePayload);
      
      onUpdateUser({
        ...user,
        ...updatePayload
      });

      setShowSettings(false);
    } catch (err) {
      console.error(err);
      handleFirestoreError(err, OperationType.UPDATE, `users/${user.id}`);
    } finally {
      setUpdatingSettings(false);
    }
  };

  const handleSubjectChange = (subjectId: string) => {
    setSelectedSubjectId(subjectId);
    const firstTopic = relevantSubjects.find((s) => s.id === subjectId)?.topics[0];
    setSelectedTopicId(firstTopic ? firstTopic.id : '');
  };

  // Submit search query to the Server-proxy Lingo AI chat
  const handleSendChatMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatMessage.trim()) return;

    const userText = chatMessage.trim();
    const updatedThread = [...chatThread, { role: 'user' as const, content: userText }];
    setChatThread(updatedThread);
    setChatMessage('');
    setSendingChat(true);

    try {
      const response = await fetch('/api/ai-tutor', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          messages: updatedThread,
          context: {
            name: user.name,
            schoolType: user.schoolType,
            grade: user.grade,
            xp: user.xp
          }
        })
      });

      if (!response.ok) {
        throw new Error("Failed to contact the AI assistant proxy.");
      }

      const data = await response.json();
      setChatThread(prev => [...prev, { role: 'assistant', content: data.reply }]);
    } catch (error) {
      console.error("Chat error:", error);
      setChatThread(prev => [...prev, { 
        role: 'assistant', 
        content: "⚠️ **Connection Error**: I could not reach my full-stack proxy. This usually happens if the server is starting up or if the API key hasn't been added. Let's try sending again in a few seconds!" 
      }]);
    } finally {
      setSendingChat(false);
    }
  };

  // Check if avatar is an image URL or an emoji
  const renderAvatar = (avString: string) => {
    if (avString.startsWith('http://') || avString.startsWith('https://') || avString.includes('/') || avString.includes('.')) {
      return (
        <img 
          src={avString} 
          alt="Profile Avatar" 
          referrerPolicy="no-referrer"
          className="h-full w-full object-cover rounded-2xl" 
        />
      );
    }
    return <span className="text-4xl select-none">{avString}</span>;
  };

  return (
    <div className="space-y-8 animate-fade-in text-slate-700">
      
      {/* 1. HEADER PROFILE & SETTINGS TOGGLE */}
      <div className="bg-white rounded-3xl border border-slate-100 p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xs relative overflow-hidden">
        <div className="absolute top-0 right-0 transform translate-x-12 -translate-y-12 h-44 w-44 bg-indigo-50/30 rounded-full blur-2xl"></div>
        <div className="flex items-center gap-5 relative z-10">
          <div className="h-20 w-20 rounded-2xl bg-slate-50 flex items-center justify-center shadow-inner border border-slate-200 shrink-0 overflow-hidden">
            {renderAvatar(user.avatar)}
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="text-2xl font-sans font-extrabold text-slate-800 tracking-tight">{user.name}</h2>
              <span className="px-3 py-0.5 text-[10px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-100 rounded-full">
                Grade {user.grade}
              </span>
            </div>
            <p className="text-slate-400 text-xs font-semibold mt-1">
              Active Curriculum Level: <strong className="text-slate-500 font-bold">{user.schoolType}</strong>
            </p>
            <div className="flex items-center gap-4 mt-2.5">
              <span className="text-xs text-slate-500 font-bold flex items-center gap-1 bg-slate-50/80 px-2 py-1 rounded-lg border border-slate-100">
                <Flame className="h-4 w-4 text-orange-500 fill-orange-500" />
                Level {level}
              </span>
              <span className="text-xs text-slate-500 font-bold flex items-center gap-1 bg-slate-50/80 px-2 py-1 rounded-lg border border-slate-100">
                <Award className="h-4 w-4 text-amber-500" />
                {user.xp} XP
              </span>
              <button 
                onClick={() => {
                  setSettingsName(user.name);
                  setSettingsSchoolType(user.schoolType);
                  setSettingsGrade(user.grade);
                  setSettingsAvatar(user.avatar);
                  setSettingsStudyGoal(user.studyGoalHours);
                  setSettingsPhotoUrl('');
                  setShowSettings(!showSettings);
                }}
                className="text-xs text-indigo-600 hover:text-indigo-800 font-extrabold flex items-center gap-1 ml-2 bg-indigo-50 hover:bg-indigo-100/60 px-2.5 py-1 rounded-lg transition-colors"
              >
                <Settings className="h-3.5 w-3.5" />
                Edit Settings
              </button>
            </div>
          </div>
        </div>

        {/* XP Progress Bar */}
        <div className="md:w-72 bg-slate-50 rounded-2xl p-4 border border-slate-200/50 relative z-10">
          <div className="flex justify-between items-center text-xs text-slate-500 font-semibold mb-2">
            <span>Level {level}</span>
            <span>{user.xp % 500} / 500 XP</span>
          </div>
          <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-full transition-all duration-500"
              style={{ width: `${levelProgressPercent}%` }}
            ></div>
          </div>
          <p className="text-[10px] text-slate-400 font-semibold mt-2 text-right">
            {xpNeededForNextLevel} XP needed for Level {level + 1}
          </p>
        </div>
      </div>

      {/* SETTINGS CARD DROPDOWN SECTION */}
      {showSettings && (
        <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-md animate-fade-in">
          <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2 pb-3 border-b border-slate-100">
            <UserIcon className="h-5 w-5 text-indigo-500" />
            Profile & Class Settings
          </h3>
          <form onSubmit={handleSaveSettings} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 tracking-wider uppercase pl-1">Display Name</label>
                <input
                  type="text"
                  required
                  value={settingsName}
                  onChange={(e) => setSettingsName(e.target.value)}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:bg-white text-slate-700 font-semibold text-sm"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 tracking-wider uppercase pl-1">
                  Custom Profile Photo URL
                </label>
                <div className="relative">
                  <ImageIcon className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-400" />
                  <input
                    type="url"
                    value={settingsPhotoUrl}
                    onChange={(e) => setSettingsPhotoUrl(e.target.value)}
                    placeholder="https://example.com/photo.png"
                    className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:bg-white text-slate-600 text-xs font-semibold"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200/40">
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase pl-1">Tier</span>
                <div className="flex gap-2 mt-1">
                  <button
                    type="button"
                    onClick={() => setSettingsSchoolType('Middle School')}
                    className={`flex-1 py-1.5 px-3 text-xs font-bold rounded-xl border transition-all ${
                      settingsSchoolType === 'Middle School'
                        ? 'bg-slate-900 border-slate-900 text-white'
                        : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-105'
                    }`}
                  >
                    Middle
                  </button>
                  <button
                    type="button"
                    onClick={() => setSettingsSchoolType('High School')}
                    className={`flex-1 py-1.5 px-3 text-xs font-bold rounded-xl border transition-all ${
                      settingsSchoolType === 'High School'
                        ? 'bg-slate-900 border-slate-900 text-white'
                        : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-105'
                    }`}
                  >
                    High
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase pl-1">Change Class / Grade</span>
                <select
                  value={settingsGrade}
                  onChange={(e) => setSettingsGrade(Number(e.target.value))}
                  className="w-full mt-1 px-3 py-1.5 bg-white border border-slate-200 rounded-xl focus:outline-none text-slate-700 font-bold text-xs"
                >
                  {GRADES[settingsSchoolType].map((g) => (
                    <option key={g} value={g}>
                      Grade {g}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between text-[10px] font-bold text-slate-400 tracking-wider uppercase px-1">
                  <span>Weekly Goal</span>
                  <span className="text-indigo-600 font-bold">{settingsStudyGoal} hrs</span>
                </div>
                <input
                  type="range"
                  min="2"
                  max="40"
                  step="1"
                  value={settingsStudyGoal}
                  onChange={(e) => setSettingsStudyGoal(Number(e.target.value))}
                  className="w-full accent-indigo-500 mt-2 cursor-pointer"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase pl-1">Change Avatar Character</span>
              <div className="flex flex-wrap gap-2 bg-slate-50 p-3 rounded-xl border border-slate-200/60 max-h-24 overflow-y-auto">
                {AVATARS.map((av) => (
                  <button
                    type="button"
                    key={av}
                    onClick={() => { setSettingsAvatar(av); setSettingsPhotoUrl(''); }}
                    className={`h-9 w-9 text-lg flex items-center justify-center rounded-lg transition-all ${
                      settingsAvatar === av ? 'bg-white border-2 border-indigo-500 scale-105 shadow-xs' : 'hover:bg-slate-200 bg-white border border-slate-200'
                    }`}
                  >
                    {av}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-4 justify-end pt-2">
              <button 
                type="button" 
                onClick={() => setShowSettings(false)}
                className="px-4 py-2 border border-slate-200 text-slate-500 text-xs font-bold rounded-xl hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                disabled={updatingSettings}
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl transition-all shadow-xs flex items-center gap-2"
              >
                {updatingSettings && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                Save Settings Info
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 2. PROGRESS METRICS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white rounded-2xl border border-slate-100 p-5 flex items-center gap-4 shadow-2xs">
          <div className="p-3 bg-indigo-50 rounded-xl text-indigo-600 transition-colors">
            <Clock className="h-6 w-6" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none block">Study Duration</span>
            <h3 className="text-2xl font-extrabold text-slate-800 mt-1">
              {Math.floor(totalStudyMinutes / 60)}h {totalStudyMinutes % 60}m
            </h3>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 p-5 flex items-center gap-4 shadow-2xs">
          <div className="p-3 bg-emerald-50 rounded-xl text-emerald-600 transition-colors">
            <CheckCircle className="h-6 w-6" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none block">Completed Lessons</span>
            <h3 className="text-2xl font-extrabold text-slate-800 mt-1">
              {user.completedTopics?.length || 0} / {relevantSubjects.reduce((acc, curr) => acc + curr.topics.length, 0)}
            </h3>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 p-5 flex items-center gap-4 shadow-2xs">
          <div className="p-3 bg-amber-500/10 rounded-xl text-amber-600 transition-colors">
            <TrendingUp className="h-6 w-6" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none block">Solved Exercises</span>
            <h3 className="text-2xl font-extrabold text-slate-800 mt-1">
              {totalQuestionsSolved} Questions
            </h3>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 p-5 flex items-center gap-4 shadow-2xs">
          <div className="p-3 bg-purple-50 rounded-xl text-purple-600 transition-colors">
            <Award className="h-6 w-6" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none block">Completed Quizzes</span>
            <h3 className="text-2xl font-extrabold text-slate-800 mt-1">
              {quizResults.length} Quizzes
            </h3>
          </div>
        </div>
      </div>

      {/* 3. RADIAL GOALS & RAPID CONTROLS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-100 p-6 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-2xs">
          <div className="space-y-4 max-w-sm text-left">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-indigo-500 animate-spin-slow" />
              <h4 className="text-lg font-sans font-bold text-slate-800">Weekly Target Tracker</h4>
            </div>
            <p className="text-slate-500 text-xs leading-relaxed font-semibold">
              Work towards your weekly goal of <strong className="text-indigo-600 font-bold">{user.studyGoalHours} hours</strong>. Every study period recorded gets you closer to completing your objective!
            </p>
            <div className="flex gap-4">
              <div>
                <span className="text-slate-400 text-xs font-semibold">Accumulated Time</span>
                <p className="text-lg font-extrabold text-indigo-650 mt-0.5">{weeklyStudyHours} Hours</p>
              </div>
              <div className="w-px bg-slate-100"></div>
              <div>
                <span className="text-slate-400 text-xs font-semibold">Weekly Goal</span>
                <p className="text-lg font-extrabold text-slate-600 mt-0.5">{user.studyGoalHours} Hours</p>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-center justify-center shrink-0">
            <div className="relative h-28 w-28 flex items-center justify-center">
              <svg className="absolute inset-0 transform -rotate-90 w-full h-full" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="40" stroke="#f1f5f9" strokeWidth="9" fill="transparent" />
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  stroke="url(#radialGrad)"
                  strokeWidth="9"
                  fill="transparent"
                  strokeDasharray="251.2"
                  strokeDashoffset={251.2 - (251.2 * goalProgressPercent) / 100}
                  strokeLinecap="round"
                />
                <defs>
                  <linearGradient id="radialGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#4f46e5" />
                    <stop offset="100%" stopColor="#6366f1" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="text-center">
                <span className="text-xl font-extrabold text-slate-800">{goalProgressPercent}%</span>
                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">Goal</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-slate-900 text-white rounded-3xl p-6 flex flex-col justify-between shadow-lg relative overflow-hidden text-left">
          <div className="absolute top-0 right-0 transform translate-x-4 -translate-y-4 h-32 w-32 bg-indigo-500/10 rounded-full blur-2xl"></div>
          <div>
            <h4 className="text-lg font-bold flex items-center gap-2">
              <PlusCircle className="text-indigo-400" />
              Log Study Session
            </h4>
            <p className="text-slate-400 text-xs mt-2 leading-relaxed">
              Record reading, listening, or grammar exercises. Adding studies boosts your level, XP, and populates learning logs instantly.
            </p>
          </div>
          <button
            onClick={() => {
              if (relevantSubjects.length > 0) {
                const firstSub = relevantSubjects[0];
                setSelectedSubjectId(firstSub.id);
                setSelectedTopicId(firstSub.topics[0]?.id || '');
              }
              setShowLogModal(true);
            }}
            className="w-full mt-6 py-3 px-4 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-2xl transition-all shadow-md active:scale-98"
          >
            Save Learning Study Period
          </button>
        </div>
      </div>

      {/* 4. CHAT WITH AI LINGO BUDDY */}
      <div className="bg-gradient-to-tr from-slate-950 via-slate-900 to-indigo-950 text-white rounded-3xl p-6 sm:p-8 border border-slate-700/50 shadow-lg text-left relative overflow-hidden">
        <div className="absolute top-1/2 left-3/4 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row gap-6 justify-between items-start md:items-center">
          <div className="space-y-2 max-w-lg">
            <span className="px-3 py-0.5 text-[9px] font-bold text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 rounded-full uppercase tracking-widest">
              AI Powered Assistance
            </span>
            <h3 className="text-xl font-bold flex items-center gap-2">
              <MessageSquare className="h-5.5 w-5.5 text-indigo-400 animate-bounce" />
              Practice with your Lingo AI Buddy
            </h3>
            <p className="text-slate-400 text-xs leading-relaxed">
              Stuck on "Have/Has Got" grammar, or need definitions? Chat with Lingo Buddy. Our secure full-stack backend handles Gemini queries seamlessly in English and Turkish!
            </p>
          </div>
          <button
            onClick={() => setChatOpen(!chatOpen)}
            className="px-5 py-3 bg-white text-slate-950 hover:bg-slate-150 text-xs font-bold rounded-2xl transition-all duration-300 shadow-xl shrink-0"
          >
            {chatOpen ? "Minimize AI Buddy" : "Activate Live AI Buddy Chat"}
          </button>
        </div>

        {chatOpen && (
          <div className="mt-6 border-t border-slate-705/80 pt-6 space-y-4">
            <div className="bg-slate-950/60 rounded-2xl p-4 max-h-72 overflow-y-auto space-y-3.5 border border-slate-800/80">
              {chatThread.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`p-3.5 rounded-2xl text-xs leading-relaxed max-w-sm ${msg.role === 'user' ? 'bg-indigo-600 text-white rounded-tr-none' : 'bg-slate-850/90 text-slate-200 border border-slate-750 rounded-tl-none'}`}>
                    <p className="font-bold text-[9px] uppercase tracking-wider text-indigo-300 mb-0.5">
                      {msg.role === 'user' ? 'You' : 'Lingo Buddy'}
                    </p>
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                  </div>
                </div>
              ))}
              {sendingChat && (
                <div className="flex justify-start">
                  <div className="bg-slate-855 text-slate-350 p-4 rounded-2xl text-xs flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin text-indigo-400" />
                    <span>Buddy is thinking...</span>
                  </div>
                </div>
              )}
            </div>

            <form onSubmit={handleSendChatMessage} className="flex gap-3">
              <input
                type="text"
                disabled={sendingChat}
                value={chatMessage}
                onChange={(e) => setChatMessage(e.target.value)}
                placeholder="Ask me anything: When do I use 'has got' instead of 'have got'?"
                className="flex-1 px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl focus:outline-none focus:border-indigo-500 text-white text-sm"
              />
              <button
                type="submit"
                disabled={sendingChat || !chatMessage.trim()}
                className="px-4 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl transition-all flex items-center justify-center shrink-0"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>
          </div>
        )}
      </div>

      {/* 5. LIVE SYNCED STUDY RECORDS */}
      <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-2xs">
        <h4 className="text-lg font-sans font-bold text-slate-800 mb-4 pb-2 border-b border-slate-50 flex justify-between items-center">
          <span>Study Sessions History</span>
          {studyLogs.length > 0 && <span className="text-xs font-semibold text-slate-400 font-mono">Real-time DB synced</span>}
        </h4>
        
        {loading ? (
          <div className="py-12 flex flex-col items-center justify-center text-slate-400 gap-2">
            <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
            <span className="text-xs font-semibold">Pulling study logs...</span>
          </div>
        ) : studyLogs.length === 0 ? (
          <div className="py-12 text-center text-slate-400 space-y-2">
            <span className="text-3xl">🗓️</span>
            <p className="font-semibold text-xs uppercase tracking-wider">No logged entries yet</p>
            <p className="text-xs max-w-xs mx-auto text-slate-400 leading-normal">
              Go ahead and tap "Save Learning Study Period" to catalog your English practice sessions.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600 border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 tracking-wider font-extrabold uppercase">
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Subject</th>
                  <th className="py-3 px-4">Topic</th>
                  <th className="py-3 px-4 text-center">Duration</th>
                  <th className="py-3 px-4 text-center">Exercises</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4">Memo</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {studyLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-55 transition-colors">
                    <td className="py-3.5 px-4 whitespace-nowrap text-slate-500 font-bold">{log.date}</td>
                    <td className="py-3.5 px-4 whitespace-nowrap font-extrabold text-slate-900">{log.subjectName}</td>
                    <td className="py-3.5 px-4 font-semibold text-slate-750">{log.topicName}</td>
                    <td className="py-3.5 px-4 text-center font-bold text-indigo-650">{log.minutes} mins</td>
                    <td className="py-3.5 px-4 text-center font-bold text-slate-700">{log.questionsSolved}</td>
                    <td className="py-3.5 px-4 text-center">
                      <span
                        className={`inline-flex px-2.5 py-0.5 text-[10px] font-bold rounded-full ${
                          log.status === 'Perfect'
                            ? 'bg-emerald-50 text-emerald-700'
                            : log.status === 'Review'
                            ? 'bg-amber-50 text-amber-700'
                            : 'bg-rose-50 text-rose-700'
                        }`}
                      >
                        {log.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-400 max-w-xs truncate">{log.notes || '---'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 6. SUBJECT ENROLLMENT PERCENT RADIAL DETAILS */}
      <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-2xs">
        <h4 className="text-lg font-sans font-bold text-slate-800 mb-5 flex items-center gap-2 text-left">
          <BookOpen className="h-5 w-5 text-indigo-500" />
          Lesson Curriculum Accomplishment
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 text-left">
          {relevantSubjects.map((sub) => {
            const subjectTopics = sub.topics.map((t) => t.id);
            const userCompletedCount = (user.completedTopics || []).filter((id) =>
              subjectTopics.includes(id)
            ).length;
            const itemPercent = subjectTopics.length > 0
              ? Math.round((userCompletedCount / subjectTopics.length) * 100)
              : 0;

            return (
              <div key={sub.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-200/50 space-y-3">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2 bg-indigo-50/20 px-2 py-1 rounded-lg">
                    <span className="font-extrabold text-slate-700 text-xs">{sub.name}</span>
                  </div>
                  <span className="text-[10px] font-mono font-bold text-indigo-600 bg-indigo-50 px-20 py-0.5 rounded-md">
                    {userCompletedCount}/{sub.topics.length} Units Completed
                  </span>
                </div>
                <div>
                  <div className="flex justify-between items-center text-[10px] text-slate-400 font-bold mb-1 uppercase">
                    <span>Topic Progress</span>
                    <span>{itemPercent}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-slate-800 rounded-full transition-all duration-300"
                      style={{ width: `${itemPercent}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* QUICK WORKBOOK LOGGER MODAL */}
      {showLogModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl overflow-hidden border border-slate-100 p-6 relative">
            <button
              onClick={() => setShowLogModal(false)}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-105 rounded-full transition-colors"
            >
              <X className="h-5 w-5" />
            </button>

            <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2 text-left">
              📝 Log Work Details
            </h3>

            <form onSubmit={handleAddStudyLog} className="space-y-4 text-left">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1 pl-1">Choose Course</label>
                <select
                  value={selectedSubjectId}
                  onChange={(e) => handleSubjectChange(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none text-slate-700 font-semibold text-xs cursor-pointer"
                >
                  <option value="" disabled>--- Course Selection ---</option>
                  {relevantSubjects.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1 pl-1">Choose Topic / Module</label>
                <select
                  value={selectedTopicId}
                  onChange={(e) => setSelectedTopicId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none text-slate-700 font-semibold text-xs cursor-pointer"
                >
                  <option value="" disabled>--- Topic Selection ---</option>
                  {relevantSubjects
                    .find((s) => s.id === selectedSubjectId)
                    ?.topics.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name}
                      </option>
                    ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1 pl-1">Period (Minutes)</label>
                  <input
                    type="number"
                    min="5"
                    max="480"
                    value={logMinutes}
                    onChange={(e) => setLogMinutes(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none text-slate-700 font-bold text-xs"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1 pl-1">Exercises Solved</label>
                  <input
                    type="number"
                    min="0"
                    max="300"
                    value={logQuestions}
                    onChange={(e) => setLogQuestions(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none text-slate-700 font-bold text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1 pl-1">How do you feel about this lesson?</label>
                <div className="grid grid-cols-3 gap-2 mt-1">
                  {(['Perfect', 'Review', 'Struggling'] as const).map((st) => (
                    <button
                      type="button"
                      key={st}
                      onClick={() => setLogStatus(st)}
                      className={`py-2 px-1 text-[11px] font-extrabold rounded-xl border text-center transition-all ${
                        logStatus === st
                          ? st === 'Perfect'
                            ? 'bg-emerald-50 border-emerald-500 text-emerald-700'
                            : st === 'Review'
                            ? 'bg-amber-50 border-amber-550 text-amber-700'
                            : 'bg-rose-50 border-rose-500 text-rose-700'
                          : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1 pl-1">Personal Notes (Optional)</label>
                <textarea
                  value={logNotes}
                  onChange={(e) => setLogNotes(e.target.value)}
                  placeholder="Notes on what you practiced or vocabulary you solved..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none text-slate-700 text-xs h-16 resize-none font-semibold"
                />
              </div>

              <div className="bg-indigo-50/50 p-2.5 border border-indigo-100 rounded-xl text-center text-[10px] text-indigo-700 font-bold uppercase">
                🎯 XP Gain: <strong className="text-indigo-900">+{logMinutes * 1 + logQuestions * 2} XP</strong>
              </div>

              <button
                type="submit"
                disabled={!selectedSubjectId || !selectedTopicId}
                className="w-full py-3 bg-slate-900 text-white font-bold rounded-xl transition-all hover:bg-slate-800 text-xs text-center disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Log Progress
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { User } from './types';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import Subjects from './components/Subjects';
import Friends from './components/Friends';
import VocabCamp from './components/VocabCamp';
import { GraduationCap, LogOut, LayoutDashboard, BookOpen, Users, Zap } from 'lucide-react';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'subjects' | 'vocab_camp' | 'friends'>('dashboard');

  // Load current session from localStorage on register
  useEffect(() => {
    const sessionUser = localStorage.getItem('current_school_user');
    if (sessionUser) {
      setCurrentUser(JSON.parse(sessionUser));
    }
  }, []);

  const handleUpdateCurrentUser = (updatedUser: User) => {
    setCurrentUser(updatedUser);
    localStorage.setItem('current_school_user', JSON.stringify(updatedUser));
  };

  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user);
    localStorage.setItem('current_school_user', JSON.stringify(user));
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('current_school_user');
  };

  const renderAvatar = (avString: string) => {
    if (avString.startsWith('http://') || avString.startsWith('https://') || avString.includes('/') || avString.includes('.')) {
      return (
        <img 
          src={avString} 
          alt="Profile Avatar" 
          referrerPolicy="no-referrer"
          className="h-full w-full object-cover rounded-full" 
        />
      );
    }
    return <span className="text-xl select-none">{avString}</span>;
  };

  if (!currentUser) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      
      {/* 1. GLOBAL NAVIGATION HEADER */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200/60 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
          
          {/* Logo Brand */}
          <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => setActiveTab('dashboard')}>
            <div className="p-2 bg-indigo-600 text-white rounded-xl">
              <GraduationCap className="h-6 w-6 animate-pulse" />
            </div>
            <div className="text-left">
              <span className="font-extrabold text-slate-900 tracking-tight text-lg">Lingo Quest</span>
              <p className="text-[10px] text-indigo-650 font-bold uppercase tracking-widest leading-none mt-0.5">English Academy</p>
            </div>
          </div>

          {/* Desktop Navigation Link Hubs */}
          <nav className="hidden lg:flex items-center gap-1 bg-slate-100 p-1.5 rounded-2xl border border-slate-200/50">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`px-3.5 py-2 font-bold text-xs rounded-xl transition-all flex items-center gap-1.5 outline-none ${
                activeTab === 'dashboard'
                  ? 'bg-white text-slate-800 shadow-xs'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <LayoutDashboard className="h-4 w-4" />
              Progress Tracker
            </button>
            <button
              onClick={() => setActiveTab('subjects')}
              className={`px-3.5 py-2 font-bold text-xs rounded-xl transition-all flex items-center gap-1.5 outline-none ${
                activeTab === 'subjects'
                  ? 'bg-white text-slate-800 shadow-xs'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <BookOpen className="h-4 w-4" />
              Syllabus Chapters
            </button>
            <button
              onClick={() => setActiveTab('vocab_camp')}
              className={`px-3.5 py-2 font-bold text-xs rounded-xl transition-all flex items-center gap-1.5 outline-none ${
                activeTab === 'vocab_camp'
                  ? 'bg-white text-slate-800 shadow-xs'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <Zap className="h-4 w-4 text-amber-500 fill-amber-500" />
              Vocabulary Camp
            </button>
            <button
              onClick={() => setActiveTab('friends')}
              className={`px-3.5 py-2 font-bold text-xs rounded-xl transition-all flex items-center gap-1.5 outline-none ${
                activeTab === 'friends'
                  ? 'bg-white text-slate-800 shadow-xs'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <Users className="h-4 w-4" />
              Friends Arena
            </button>
          </nav>

          {/* Quick Profile Hub and LogOut Action */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-3 bg-slate-50 border border-slate-200/60 py-1.5 px-3 rounded-2xl shrink-0">
              <div className="h-8 w-8 bg-white rounded-full flex items-center justify-center overflow-hidden border border-slate-200/50 shadow-inner">
                {renderAvatar(currentUser.avatar)}
              </div>
              <div className="hidden sm:block text-left">
                <h5 className="font-bold text-xs text-slate-800 leading-none">{currentUser.name}</h5>
                <p className="text-[9px] text-slate-400 font-extrabold uppercase mt-1">{currentUser.schoolType} • Grade {currentUser.grade}</p>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="p-2.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-100 rounded-xl transition-all shrink-0 outline-none"
              title="Sign Out"
            >
              <LogOut className="h-4.5 w-4.5" />
            </button>
          </div>

        </div>

        {/* Mobile Navigational Switchers */}
        <div className="lg:hidden flex border-t border-slate-100 bg-white">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex-1 py-3 text-center text-[10px] font-bold transition-all border-b-2 flex flex-col items-center gap-1 outline-none ${
              activeTab === 'dashboard'
                ? 'border-indigo-650 text-indigo-650 bg-indigo-50/15'
                : 'border-transparent text-slate-500'
            }`}
          >
            <LayoutDashboard className="h-4 w-4" />
            Tracker
          </button>
          <button
            onClick={() => setActiveTab('subjects')}
            className={`flex-1 py-3 text-center text-[10px] font-bold transition-all border-b-2 flex flex-col items-center gap-1 outline-none ${
              activeTab === 'subjects'
                ? 'border-indigo-650 text-indigo-650 bg-indigo-50/15'
                : 'border-transparent text-slate-500'
            }`}
          >
            <BookOpen className="h-4 w-4" />
            Chapters
          </button>
          <button
            onClick={() => setActiveTab('vocab_camp')}
            className={`flex-1 py-3 text-center text-[10px] font-bold transition-all border-b-2 flex flex-col items-center gap-1 outline-none ${
              activeTab === 'vocab_camp'
                ? 'border-indigo-650 text-indigo-650 bg-indigo-50/15'
                : 'border-transparent text-slate-500'
            }`}
          >
            <Zap className="h-4 w-4" />
            Vocab Camp
          </button>
          <button
            onClick={() => setActiveTab('friends')}
            className={`flex-1 py-3 text-center text-[10px] font-bold transition-all border-b-2 flex flex-col items-center gap-1 outline-none ${
              activeTab === 'friends'
                ? 'border-indigo-650 text-indigo-650 bg-indigo-50/15'
                : 'border-transparent text-slate-500'
            }`}
          >
            <Users className="h-4 w-4" />
            Friends
          </button>
        </div>
      </header>

      {/* Main Body Containers */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'dashboard' && (
          <Dashboard user={currentUser} onUpdateUser={handleUpdateCurrentUser} />
        )}
        {activeTab === 'subjects' && (
          <Subjects user={currentUser} onUpdateUser={handleUpdateCurrentUser} />
        )}
        {activeTab === 'vocab_camp' && (
          <VocabCamp user={currentUser} onUpdateUser={handleUpdateCurrentUser} />
        )}
        {activeTab === 'friends' && (
          <Friends user={currentUser} onUpdateUser={handleUpdateCurrentUser} />
        )}
      </main>

      {/* Footer Branding Design */}
      <footer className="bg-white border-t border-slate-200 mt-12 py-6 text-center">
        <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">
          © {new Date().getFullYear()} Lingo Quest Academy • All rights reserved.
        </p>
      </footer>
    </div>
  );
}

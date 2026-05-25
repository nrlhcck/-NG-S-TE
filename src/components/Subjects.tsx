import React, { useState, useEffect } from 'react';
import { User, Subject, Topic, QuizQuestion, QuizResult } from '../types';
import { SUBJECTS } from '../data';
import { db, handleFirestoreError, OperationType, isFirebaseConfigured } from '../firebase';
import { doc, updateDoc, setDoc } from 'firebase/firestore';
import {
  Award,
  BookOpen,
  CheckCircle,
  ChevronRight,
  GraduationCap,
  Play,
  RotateCcw,
  Sparkles,
  Trophy
} from 'lucide-react';

interface SubjectsProps {
  user: User;
  onUpdateUser: (updatedUser: User) => void;
}

export default function Subjects({ user, onUpdateUser }: SubjectsProps) {
  // Navigation & Browsing defaults matching current user settings
  const [browsingSchoolType, setBrowsingSchoolType] = useState<typeof user.schoolType>(user.schoolType);
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);

  // Active Quiz parameters
  const [activeQuiz, setActiveQuiz] = useState<boolean>(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [selectedOptionIndex, setSelectedOptionIndex] = useState<number | null>(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState<boolean>(false);
  const [correctAnswersCount, setCorrectAnswersCount] = useState<number>(0);
  const [quizFinished, setQuizFinished] = useState<boolean>(false);
  const [savingQuiz, setSavingQuiz] = useState<boolean>(false);

  // Filter subjects based on active selection (Middle or High School level)
  const filteredSubjects = SUBJECTS.filter(
    (sub) => sub.schoolType === browsingSchoolType
  );

  const handleSelectSubject = (sub: Subject) => {
    setSelectedSubject(sub);
    setSelectedTopic(null);
    setActiveQuiz(false);
  };

  const handleSelectTopic = (topic: Topic) => {
    setSelectedTopic(topic);
    setActiveQuiz(false);
    
    // Reset Quiz state parameters
    setCurrentQuestionIndex(0);
    setSelectedOptionIndex(null);
    setIsAnswerSubmitted(false);
    setCorrectAnswersCount(0);
    setQuizFinished(false);
  };

  // Toggle complete checks for an active topic
  const toggleTopicCompletion = async (topicId: string) => {
    const isCompleted = (user.completedTopics || []).includes(topicId);
    let updatedCompleted: string[];
    let xpChange = 0;

    if (isCompleted) {
      updatedCompleted = (user.completedTopics || []).filter((id) => id !== topicId);
      xpChange = -55; // Remove completion bonus
    } else {
      updatedCompleted = [...(user.completedTopics || []), topicId];
      xpChange = 55; // Add custom completion bonus
    }

    const updatedXp = Math.max(0, user.xp + xpChange);

    if (!isFirebaseConfigured) {
      onUpdateUser({
        ...user,
        xp: updatedXp,
        completedTopics: updatedCompleted
      });
      return;
    }

    try {
      await updateDoc(doc(db, 'users', user.id), {
        completedTopics: updatedCompleted,
        xp: updatedXp
      });

      onUpdateUser({
        ...user,
        xp: updatedXp,
        completedTopics: updatedCompleted
      });
    } catch (err) {
      console.error("Completion write error:", err);
      handleFirestoreError(err, OperationType.UPDATE, `users/${user.id}`);
    }
  };

  const handleOptionClick = (optionIdx: number) => {
    if (isAnswerSubmitted) return;
    setSelectedOptionIndex(optionIdx);
  };

  const handleSubmitAnswer = (question: QuizQuestion) => {
    if (selectedOptionIndex === null || isAnswerSubmitted) return;

    setIsAnswerSubmitted(true);
    if (selectedOptionIndex === question.correctAnswer) {
      setCorrectAnswersCount((prev) => prev + 1);
    }
  };

  // Progression to subsequent quiz modules & write results to Firestore
  const handleNextQuestion = async (topic: Topic) => {
    if (!selectedTopic) return;
    const isLast = currentQuestionIndex === topic.quiz.length - 1;

    if (isLast) {
      setSavingQuiz(true);
      const percentageScore = Math.round((correctAnswersCount / topic.quiz.length) * 100);
      const quizId = 'quiz_' + Date.now();
      
      const newResult: QuizResult = {
        id: quizId,
        topicId: topic.id,
        topicName: topic.name,
        subjectId: topic.subjectId,
        subjectName: selectedSubject?.name || 'General English',
        score: correctAnswersCount,
        totalQuestions: topic.quiz.length,
        completedAt: new Date().toLocaleDateString('en-US')
      };

      const xpBonus = 100 + (correctAnswersCount * 25);
      const hasPassed = percentageScore >= 60;
      
      let finalCompleted = [...(user.completedTopics || [])];
      let hasJustCompletedTopic = false;

      if (hasPassed && !finalCompleted.includes(topic.id)) {
        finalCompleted.push(topic.id);
        hasJustCompletedTopic = true;
      }

      const finalXp = user.xp + xpBonus + (hasJustCompletedTopic ? 55 : 0);

      if (!isFirebaseConfigured) {
        onUpdateUser({
          ...user,
          completedTopics: finalCompleted,
          xp: finalXp,
          quizResults: [...(user.quizResults || []), newResult]
        });
        setQuizFinished(true);
        setSavingQuiz(false);
        return;
      }

      try {
        // Save quiz result document to subcollection
        await setDoc(doc(db, 'users', user.id, 'quizResults', quizId), newResult);

        // Update profile XP & completed units array
        await updateDoc(doc(db, 'users', user.id), {
          completedTopics: finalCompleted,
          xp: finalXp
        });

        onUpdateUser({
          ...user,
          completedTopics: finalCompleted,
          xp: finalXp,
          quizResults: [...(user.quizResults || []), newResult]
        });

        setQuizFinished(true);
      } catch (err) {
        console.error("Quiz saving Firestore error:", err);
        handleFirestoreError(err, OperationType.WRITE, `users/${user.id}/quizResults/${quizId}`);
      } finally {
        setSavingQuiz(false);
      }
    } else {
      setCurrentQuestionIndex((prev) => prev + 1);
      setSelectedOptionIndex(null);
      setIsAnswerSubmitted(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fade-in text-slate-700 text-left">
      
      {/* 1. LEFT PANEL: SELECTION CONTROLS */}
      <div className="lg:col-span-4 space-y-6">
        
        {/* Tier/Level filter box */}
        <div className="bg-white rounded-3xl border border-slate-100 p-5 shadow-2xs space-y-3">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
            <GraduationCap className="h-4 w-4 text-indigo-500" />
            Syllabus filters
          </h4>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => {
                setBrowsingSchoolType('Middle School');
                setSelectedSubject(null);
                setSelectedTopic(null);
              }}
              className={`py-2 px-3 text-xs font-bold rounded-xl border transition-all ${
                browsingSchoolType === 'Middle School'
                  ? 'bg-indigo-650 border-indigo-650 text-white shadow-xs'
                  : 'bg-slate-50 border-slate-205 text-slate-500 hover:bg-slate-100'
              }`}
            >
              Middle School
            </button>
            <button
              onClick={() => {
                setBrowsingSchoolType('High School');
                setSelectedSubject(null);
                setSelectedTopic(null);
              }}
              className={`py-2 px-3 text-xs font-bold rounded-xl border transition-all ${
                browsingSchoolType === 'High School'
                  ? 'bg-indigo-650 border-indigo-650 text-white shadow-xs'
                  : 'bg-slate-50 border-slate-205 text-slate-500 hover:bg-slate-100'
              }`}
            >
              High School
            </button>
          </div>
        </div>

        {/* Subjects menu catalog listings */}
        <div className="bg-white rounded-3xl border border-slate-100 p-5 shadow-2xs space-y-3.5">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
            <BookOpen className="h-4.5 w-4.5 text-indigo-500" />
            Courses Curriculum
          </h4>
          
          {filteredSubjects.length === 0 ? (
            <p className="text-xs text-slate-450 italic text-center py-4">No active courses listed in this grade range.</p>
          ) : (
            <div className="space-y-2">
              {filteredSubjects.map((sub) => {
                const isSelected = selectedSubject?.id === sub.id;
                const doneCount = sub.topics.filter((t) => (user.completedTopics || []).includes(t.id)).length;

                return (
                  <button
                    key={sub.id}
                    onClick={() => handleSelectSubject(sub)}
                    className={`w-full text-left p-3.5 rounded-2xl border transition-all flex items-center justify-between outline-none ${
                      isSelected
                        ? 'bg-slate-900 border-slate-900 text-white shadow-sm'
                        : 'bg-slate-50/70 border-slate-200/50 hover:bg-slate-100/70 text-slate-700'
                    }`}
                  >
                    <div>
                      <h5 className="font-extrabold text-xs">{sub.name}</h5>
                      <p className={`text-[10px] font-semibold mt-0.5 ${isSelected ? 'text-slate-350' : 'text-slate-400'}`}>
                        {sub.topics.length} Study Chapters
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md ${
                        isSelected ? 'bg-white/10 text-slate-100' : 'bg-slate-200/50 text-slate-500'
                      }`}>
                        {doneCount}/{sub.topics.length} Clear
                      </span>
                      <ChevronRight className="h-3.5 w-3.5" />
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Active Topics Checklist sidebar */}
        {selectedSubject && (
          <div className="bg-white rounded-3xl border border-slate-100 p-5 shadow-2xs space-y-3.5 animate-fade-in">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              {selectedSubject.name} chapters
            </h4>
            <div className="space-y-2">
              {selectedSubject.topics.map((t) => {
                const isSelected = selectedTopic?.id === t.id;
                const isDone = (user.completedTopics || []).includes(t.id);

                return (
                  <button
                    key={t.id}
                    onClick={() => handleSelectTopic(t)}
                    className={`w-full text-left p-3 rounded-xl border transition-all flex items-center justify-between outline-none ${
                      isSelected
                        ? 'bg-indigo-600 border-indigo-600 text-white shadow-xs'
                        : 'bg-white border-slate-100 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2 max-w-[80%]">
                      <span className="text-xs select-none shrink-0">{isDone ? '✅' : '📖'}</span>
                      <span className="font-bold text-[11px] truncate leading-tight">{t.name}</span>
                    </div>
                    <span className={`text-[9px] font-semibold px-1 py-0.5 rounded shrink-0 font-mono ${
                      isSelected ? 'bg-indigo-700/50 text-indigo-100' : 'bg-slate-100 text-slate-400'
                    }`}>
                      {t.durationMinutes} mins
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* 2. RIGHT PANEL: CONTENT & TEST RUNNER */}
      <div className="lg:col-span-8">
        {!selectedTopic ? (
          /* Empty landing state */
          <div className="bg-white rounded-3xl border border-slate-100 p-12 text-center h-full flex flex-col items-center justify-center space-y-4">
            <div className="h-16 w-16 rounded-full bg-slate-50 flex items-center justify-center text-3xl shadow-inner border border-slate-120">
              📚
            </div>
            <div className="max-w-md space-y-1.5">
              <h3 className="text-lg font-bold text-slate-800">Learn Grammar & Run Assessments</h3>
              <p className="text-slate-450 text-xs leading-relaxed font-semibold">
                Explore topic overviews, study guides, and test sheets curated specifically for Middle and High School grades. Choose a course module on the left sidebar to embark on your English language study!
              </p>
            </div>
          </div>
        ) : (
          /* Chapters container card */
          <div className="bg-white rounded-3xl border border-slate-100 shadow-2xs overflow-hidden animate-fade-in">
            {/* Header banner background */}
            <div className="bg-gradient-to-tr from-slate-950 via-slate-850 to-indigo-950 p-6 sm:p-8 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-400">
                  {selectedSubject?.name} • Grade {selectedSubject?.grade} level
                </span>
                <h3 className="text-xl font-extrabold tracking-tight mt-1">{selectedTopic.name}</h3>
                <p className="text-slate-300 text-xs mt-1 max-w-lg leading-relaxed">{selectedTopic.description}</p>
              </div>

              {/* Instant Toggle Topic completion checkpoint */}
              <button
                onClick={() => toggleTopicCompletion(selectedTopic.id)}
                className={`py-2.5 px-4.5 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-2 outline-none ${
                  (user.completedTopics || []).includes(selectedTopic.id)
                    ? 'bg-emerald-505 bg-emerald-600 text-white shadow-md shadow-emerald-700/10'
                    : 'bg-white/10 hover:bg-white/20 text-white border border-white/10'
                }`}
              >
                <CheckCircle className="h-4 w-4 shrink-0" />
                {(user.completedTopics || []).includes(selectedTopic.id) ? 'Completed' : 'Complete Topic'}
              </button>
            </div>

            {/* Main content viewport */}
            {!activeQuiz ? (
              /* Lesson text block description */
              <div className="p-6 sm:p-8 space-y-6">
                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">
                    📖 Lesson Material Overview
                  </h4>
                  <div
                    className="prose prose-slate prose-sm text-slate-650 leading-relaxed font-medium space-y-4"
                    dangerouslySetInnerHTML={{ __html: selectedTopic.contents }}
                  />
                </div>

                {/* STUDY PROGRESS AND TEST STAT ENGINES */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-6 border-t border-slate-100">
                  <div className="bg-indigo-50/50 p-5 rounded-2xl border border-indigo-100 flex items-start gap-3">
                    <span className="text-xl mt-0.5">💡</span>
                    <div>
                      <h5 className="font-bold text-indigo-950 text-xs">Accumulate Progression XP</h5>
                      <p className="text-slate-550 text-[11px] mt-1 leading-normal font-semibold">
                        Read through the curriculum, then click the "Complete Topic" button in the header bar above to claim <strong>+55 XP</strong> bonuses!
                      </p>
                    </div>
                  </div>

                  {selectedTopic.quiz && selectedTopic.quiz.length > 0 && (
                    <div className="bg-slate-900 text-white p-5 rounded-2xl flex flex-col justify-between">
                      <div>
                        <h5 className="font-bold text-xs flex items-center gap-1">
                          <Trophy className="h-4 w-4 text-amber-400" />
                          Topic Assessment Sheet
                        </h5>
                        <p className="text-slate-400 text-[11px] mt-1 pr-1 leading-normal font-medium">
                          Take a multi-question, interactive matching and choice assessment quiz. Earn scores and level multipliers dynamically!
                        </p>
                      </div>
                      <button
                        onClick={() => setActiveQuiz(true)}
                        className="w-full mt-4 py-2.5 px-4 bg-indigo-650 hover:bg-indigo-600 text-white font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5 outline-none"
                      >
                        <Play className="h-3.5 w-3.5 fill-white" />
                        Start Assessment Quiz
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              /* ACTIVE QUIZ PLAYER VIEW */
              <div className="p-6 sm:p-8 space-y-6 animate-fade-in">
                <div className="flex justify-between items-center border-b border-slate-100 pb-4">
                  <h4 className="font-extrabold text-slate-800 text-xs uppercase tracking-wider">Evaluation Sheet</h4>
                  <button
                    onClick={() => setActiveQuiz(false)}
                    className="text-slate-400 hover:text-slate-600 text-xs font-semibold transition-all"
                  >
                    Return to Chapter
                  </button>
                </div>

                {!quizFinished ? (
                  /* SINGLE QUESTION VIEW RENDER */
                  <div className="space-y-6">
                    <div className="flex items-center justify-between text-xs text-slate-400 font-bold">
                      <span>Question {currentQuestionIndex + 1} of {selectedTopic.quiz.length}</span>
                      <span className="text-emerald-555 font-bold text-emerald-600">Correct: {correctAnswersCount}</span>
                    </div>

                    {/* Question Statement Box */}
                    <div className="p-5 bg-slate-50 border border-slate-150 rounded-2xl">
                      <p className="font-bold text-slate-800 text-sm leading-relaxed whitespace-pre-line">
                        {selectedTopic.quiz[currentQuestionIndex].question}
                      </p>
                    </div>

                    {/* Options list selection */}
                    <div className="grid grid-cols-1 gap-3">
                      {selectedTopic.quiz[currentQuestionIndex].options.map((option, idx) => {
                        const isSelected = selectedOptionIndex === idx;
                        const isCorrect = idx === selectedTopic.quiz[currentQuestionIndex].correctAnswer;

                        let optionStyle = 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700 hover:border-slate-300';

                        if (isAnswerSubmitted) {
                          if (isCorrect) {
                            optionStyle = 'bg-emerald-50 border-emerald-500 text-emerald-800';
                          } else if (isSelected) {
                            optionStyle = 'bg-rose-50 border-rose-555 border-rose-500 text-rose-800';
                          } else {
                            optionStyle = 'bg-white border-slate-100 text-slate-400 opacity-55 cursor-not-allowed';
                          }
                        } else if (isSelected) {
                          optionStyle = 'bg-indigo-50 border-indigo-550 border-indigo-550 text-indigo-800';
                        }

                        return (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => handleOptionClick(idx)}
                            disabled={isAnswerSubmitted}
                            className={`w-full text-left p-4 rounded-xl border-2 font-bold text-xs transition-all flex items-center justify-between outline-none ${optionStyle}`}
                          >
                            <span>{option}</span>
                            {isAnswerSubmitted && isCorrect && (
                              <span className="text-emerald-600 font-bold text-[10px] uppercase bg-emerald-100 px-2.5 py-0.5 rounded-full">Correct</span>
                            )}
                            {isAnswerSubmitted && isSelected && !isCorrect && (
                              <span className="text-rose-600 font-bold text-[10px] uppercase bg-rose-100 px-2.5 py-0.5 rounded-full">Incorrect</span>
                            )}
                          </button>
                        );
                      })}
                    </div>

                    {/* Solution rationale block */}
                    <div className="space-y-4">
                      {isAnswerSubmitted && (
                        <div className="p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100/60 space-y-1">
                          <h5 className="font-extrabold text-indigo-950 text-xs flex items-center gap-1">
                            <Sparkles className="h-3.5 w-3.5 text-indigo-500" />
                            Lesson Buddy Explanation
                          </h5>
                          <p className="text-slate-600 text-xs leading-relaxed font-semibold">
                            {selectedTopic.quiz[currentQuestionIndex].explanation}
                          </p>
                        </div>
                      )}

                      {!isAnswerSubmitted ? (
                        <button
                          type="button"
                          onClick={() => handleSubmitAnswer(selectedTopic.quiz[currentQuestionIndex])}
                          disabled={selectedOptionIndex === null}
                          className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed outline-none"
                        >
                          Verify Answer Selection
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleNextQuestion(selectedTopic)}
                          disabled={savingQuiz}
                          className="w-full py-3 bg-indigo-600 hover:bg-indigo-555 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl transition-all outline-none"
                        >
                          {currentQuestionIndex === selectedTopic.quiz.length - 1
                            ? (savingQuiz ? 'Logging and Finishing Test...' : 'Submit Final Assessment')
                            : 'Proceed to Next Question'}
                        </button>
                      )}
                    </div>
                  </div>
                ) : (
                  /* QUIZ REPORT CARD / REPORTING VIEW */
                  <div className="text-center py-10 space-y-6">
                    <div className="h-20 w-20 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center text-3xl mx-auto shadow-inner border border-emerald-100">
                      🏆
                    </div>

                    <div className="space-y-1.5 max-w-sm mx-auto">
                      <h3 className="text-lg font-bold text-slate-800">Assessment Solved Successfully!</h3>
                      <p className="text-slate-450 text-xs leading-relaxed font-semibold">
                        You have polished your understanding of "{selectedTopic.name}" and passed the quiz module! XP bonuses and metrics have been securely saved to your server record.
                      </p>
                    </div>

                    <div className="max-w-xs mx-auto border border-dashed border-slate-205 bg-slate-50/50 rounded-3xl p-4 flex justify-around text-center">
                      <div>
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Correct</span>
                        <p className="text-lg font-extrabold text-emerald-600 mt-0.5">
                          {correctAnswersCount} / {selectedTopic.quiz.length}
                        </p>
                      </div>
                      <div className="w-px bg-slate-200"></div>
                      <div>
                        <span className="text-[10px] text-indigo-500 font-bold uppercase tracking-wider">Rewards</span>
                        <p className="text-lg font-extrabold text-indigo-600 mt-0.5">
                          +{100 + correctAnswersCount * 25} XP
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-3 max-w-sm mx-auto">
                      <button
                        onClick={() => {
                          setCorrectAnswersCount(0);
                          setCurrentQuestionIndex(0);
                          setSelectedOptionIndex(null);
                          setIsAnswerSubmitted(false);
                          setQuizFinished(false);
                        }}
                        className="flex-1 py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-all text-xs flex items-center justify-center gap-1.5 outline-none"
                      >
                        <RotateCcw className="h-3.5 w-3.5" /> Retry Sheet
                      </button>
                      <button
                        onClick={() => setActiveQuiz(false)}
                        className="flex-1 py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition-all text-xs outline-none"
                      >
                        Back to Lesson
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

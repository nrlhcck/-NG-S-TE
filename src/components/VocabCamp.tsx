import React, { useState, useEffect } from 'react';
import { User, VocabularyWord } from '../types';
import { VOCABULARY_CAMP } from '../data';
import { db, handleFirestoreError, OperationType, isFirebaseConfigured } from '../firebase';
import { doc, updateDoc } from 'firebase/firestore';
import {
  Volume2,
  ChevronLeft,
  ChevronRight,
  Flame,
  Award,
  BookOpen,
  Gamepad2,
  Trophy,
  RotateCcw,
  Sparkles,
  Zap,
  CheckCircle2
} from 'lucide-react';

interface VocabCampProps {
  user: User;
  onUpdateUser: (updatedUser: User) => void;
}

export default function VocabCamp({ user, onUpdateUser }: VocabCampProps) {
  // Difficulty Selection
  const [level, setLevel] = useState<'easy' | 'medium' | 'hard'>('easy');
  const [activeTab, setActiveTab] = useState<'flashcards' | 'match'>('flashcards');

  // Flashcards navigation
  const [cardIndex, setCardIndex] = useState<number>(0);
  const [isFlipped, setIsFlipped] = useState<boolean>(false);

  // Matching game state variables
  const [gameBoard, setGameBoard] = useState<{ id: string; val: string; isEnglish: boolean; matchWord: string; isMatched: boolean }[]>([]);
  const [selectedTileId, setSelectedTileId] = useState<string | null>(null);
  const [wrongTileIds, setWrongTileIds] = useState<string[]>([]);
  const [matchedPairsCount, setMatchedPairsCount] = useState<number>(0);
  const [gameWon, setGameWon] = useState<boolean>(false);
  const [xpAwarded, setXpAwarded] = useState<boolean>(false);
  const [savingXp, setSavingXp] = useState<boolean>(false);

  // Get active subset of 200 words
  const activeWords = VOCABULARY_CAMP[level];

  // Speak pronunciation using Web Speech Audio Synthesis API
  const handlePronounce = (word: string) => {
    if ('speechSynthesis' in window) {
      // Clean word string of any helper metadata suffixes e.g. hello_2
      const cleanWord = word.split('_')[0];
      const utterance = new SpeechSynthesisUtterance(cleanWord);
      utterance.lang = 'en-US';
      utterance.rate = 0.9;
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(utterance);
    }
  };

  // Reset indices on difficulty change
  useEffect(() => {
    setCardIndex(0);
    setIsFlipped(false);
    handleResetGame();
  }, [level]);

  // Handle Game Restart
  const handleResetGame = () => {
    setSelectedTileId(null);
    setWrongTileIds([]);
    setMatchedPairsCount(0);
    setGameWon(false);
    setXpAwarded(false);

    // Pick 5 random words from the 200 subset
    const shuffledSubset = [...activeWords].sort(() => 0.5 - Math.random()).slice(0, 5);
    
    // Construct cards
    const englishCards = shuffledSubset.map((w, index) => ({
      id: `eng-${w.word}-${index}`,
      val: w.word.split('_')[0], // clean presentation
      isEnglish: true,
      matchWord: w.word,
      isMatched: false
    }));

    const turkishCards = shuffledSubset.map((w, index) => ({
      id: `tur-${w.word}-${index}`,
      val: w.meaning.split(' (')[0], // clean presentation
      isEnglish: false,
      matchWord: w.word,
      isMatched: false
    }));

    // Randomize layout of 10 nodes
    const randomizedGrid = [...englishCards, ...turkishCards].sort(() => 0.5 - Math.random());
    setGameBoard(randomizedGrid);
  };

  // Run game setup on mount or tab focus change
  useEffect(() => {
    if (activeTab === 'match') {
      handleResetGame();
    }
  }, [activeTab]);

  // Click handler for grid tiles
  const handleTileClick = async (clickedId: string) => {
    if (gameWon) return;
    const clickedTile = gameBoard.find((t) => t.id === clickedId);
    if (!clickedTile || clickedTile.isMatched) return;

    // Reset wrong highlight matches
    if (wrongTileIds.length > 0) {
      setWrongTileIds([]);
    }

    // First pick
    if (selectedTileId === null) {
      setSelectedTileId(clickedId);
      return;
    }

    // Match validation against prior pick
    if (selectedTileId === clickedId) {
      setSelectedTileId(null);
      return;
    }

    const previousTile = gameBoard.find((t) => t.id === selectedTileId);
    if (!previousTile) return;

    // Verify compatibility
    const isSameConcept = previousTile.matchWord === clickedTile.matchWord;
    const isDifferentLanguage = previousTile.isEnglish !== clickedTile.isEnglish;

    if (isSameConcept && isDifferentLanguage) {
      // Match found!
      const updatedBoard = gameBoard.map((item) => {
        if (item.matchWord === clickedTile.matchWord) {
          return { ...item, isMatched: true };
        }
        return item;
      });

      setGameBoard(updatedBoard);
      setSelectedTileId(null);
      
      const newMatchedCount = matchedPairsCount + 1;
      setMatchedPairsCount(newMatchedCount);

      // Pronounce English partner
      const matchedEnglishWord = previousTile.isEnglish ? previousTile.val : clickedTile.val;
      handlePronounce(matchedEnglishWord);

      if (newMatchedCount === 5) {
        setGameWon(true);
        await saveMatchXpBonus();
      }
    } else {
      // Wrong Match representation
      setWrongTileIds([selectedTileId, clickedId]);
      setSelectedTileId(null);
    }
  };

  // Save +50 XP reward into User profile in Firestore
  const saveMatchXpBonus = async () => {
    if (xpAwarded || savingXp) return;
    setSavingXp(true);
    
    const xpBonus = 50;
    const updatedUser = {
      ...user,
      xp: user.xp + xpBonus
    };

    if (!isFirebaseConfigured) {
      onUpdateUser(updatedUser);
      setXpAwarded(true);
      setSavingXp(false);
      return;
    }

    try {
      await updateDoc(doc(db, 'users', user.id), {
        xp: updatedUser.xp
      });
      onUpdateUser(updatedUser);
      setXpAwarded(true);
    } catch (err) {
      console.error("Match XP Award error:", err);
      handleFirestoreError(err, OperationType.UPDATE, `users/${user.id}`);
    } finally {
      setSavingXp(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in text-slate-755 text-left">
      
      {/* 1. SECTOR HEADER ACTION CARD */}
      <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-rose-50 rounded-2xl text-rose-600">
            <Zap className="h-6 w-6 animate-pulse text-indigo-505 text-rose-500 fill-rose-550 fill-rose-500" />
          </div>
          <div>
            <h2 className="text-xl font-sans font-extrabold text-slate-800 tracking-tight">Vocabulary Quest Camp</h2>
            <p className="text-slate-400 text-xs font-semibold mt-0.5">
              Acquire 600 essential high-frequency words categorized by difficulty levels (200 words per tier)
            </p>
          </div>
        </div>

        {/* Level Segment Controllers */}
        <div className="bg-slate-50 border border-slate-205 p-1 rounded-xl flex gap-1 self-start md:self-auto">
          {(['easy', 'medium', 'hard'] as const).map((lvl) => (
            <button
              key={lvl}
              onClick={() => setLevel(lvl)}
              className={`py-1.5 px-3 rounded-lg text-xs font-bold uppercase tracking-wider transition-all outline-none ${
                level === lvl
                  ? 'bg-rose-500 text-white shadow-xs'
                  : 'text-slate-500 hover:bg-slate-200/50'
              }`}
            >
              {lvl}
            </button>
          ))}
        </div>
      </div>

      {/* 2. CORE TABS */}
      <div className="border-b border-slate-200 flex gap-4">
        <button
          onClick={() => setActiveTab('flashcards')}
          className={`pb-2.5 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all outline-none border-b-2 ${
            activeTab === 'flashcards'
              ? 'border-rose-500 text-rose-600'
              : 'border-transparent text-slate-450 hover:text-slate-650'
          }`}
        >
          <BookOpen className="h-4 w-4" />
          Flashcards Explorer ({activeWords.length} Words)
        </button>
        <button
          onClick={() => setActiveTab('match')}
          className={`pb-2.5 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all outline-none border-b-2 ${
            activeTab === 'match'
              ? 'border-rose-500 text-rose-600'
              : 'border-transparent text-slate-450 hover:text-slate-650'
          }`}
        >
          <Gamepad2 className="h-4 w-4" />
          Speed Match Arena
        </button>
      </div>

      {/* TAB CONTENT: FLASHCARDS STUDY GUIDE */}
      {activeTab === 'flashcards' && (
        <div className="space-y-6">
          <div className="max-w-md mx-auto space-y-6 pt-4">
            
            {/* Interactive Flipped Card Box */}
            <div 
              onClick={() => setIsFlipped(!isFlipped)}
              className="group cursor-pointer perspective h-56 transition-all duration-300"
            >
              <div className={`relative w-full h-full duration-500 transform-style transition-transform ${isFlipped ? 'rotate-y-180' : ''}`}>
                
                {/* FRONT: English Word */}
                <div className="absolute inset-0 backface-hidden bg-white border border-slate-120 rounded-3xl p-8 shadow-xs flex flex-col justify-between text-center items-center">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                    Front • Word {cardIndex + 1} of 200
                  </span>
                  
                  <div className="space-y-2.5">
                    <h3 className="text-3xl font-extrabold text-slate-850 tracking-tight group-hover:scale-105 transition-transform duration-200">
                      {activeWords[cardIndex].word.split('_')[0]}
                    </h3>
                    <p className="text-[11px] font-bold text-slate-400 capitalize">Difficulty: {level}</p>
                  </div>

                  {/* Speak Vocal Speaker Button */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePronounce(activeWords[cardIndex].word);
                    }}
                    className="p-2.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-full transition-all outline-none shadow-inner"
                    title="Listen Pronunciation"
                  >
                    <Volume2 className="h-5 w-5" />
                  </button>
                </div>

                {/* BACK: Meaning translation */}
                <div className="absolute inset-0 backface-hidden bg-rose-50 border border-rose-200 text-rose-950 rounded-3xl p-8 shadow-xs flex flex-col justify-between text-center items-center rotate-y-180">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-rose-700">
                    Back • Translation
                  </span>

                  <div className="space-y-1">
                    <h3 className="text-2xl font-extrabold text-rose-900 italic">
                      {activeWords[cardIndex].meaning.split(' (')[0]}
                    </h3>
                    {activeWords[cardIndex].meaning.includes('(') && (
                      <p className="text-[10px] text-rose-700 uppercase font-black font-mono">
                        ({activeWords[cardIndex].meaning.split('(')[1]}
                      </p>
                    )}
                  </div>

                  <span className="text-[9px] font-mono tracking-wide text-rose-600 uppercase font-extrabold">
                    Tap anywhere to hide
                  </span>
                </div>

              </div>
            </div>

            {/* Slider Switch Toggles */}
            <div className="flex items-center justify-between px-3">
              <button
                disabled={cardIndex === 0}
                onClick={() => {
                  setCardIndex((prev) => Math.max(0, prev - 1));
                  setIsFlipped(false);
                }}
                className="p-2.5 bg-rose-500 border border-rose-500 hover:bg-rose-600 disabled:opacity-20 disabled:cursor-not-allowed text-white rounded-xl transition-all outline-none flex items-center gap-1 text-xs font-bold shadow-xs active:scale-98"
              >
                <ChevronLeft className="h-4 w-4" /> Previous
              </button>

              <span className="text-xs font-bold font-mono text-slate-450 uppercase">
                {cardIndex + 1} / 200 Complete
              </span>

              <button
                disabled={cardIndex === activeWords.length - 1}
                onClick={() => {
                  setCardIndex((prev) => Math.min(activeWords.length - 1, prev + 1));
                  setIsFlipped(false);
                }}
                className="p-2.5 bg-rose-500 border border-rose-500 hover:bg-rose-600 disabled:opacity-20 disabled:cursor-not-allowed text-white rounded-xl transition-all outline-none flex items-center gap-1 text-xs font-bold shadow-xs active:scale-98"
              >
                Next <ChevronRight className="h-4 w-4" />
              </button>
            </div>

            {/* Hint Box */}
            <p className="text-[10px] text-slate-400 font-bold text-center italic leading-relaxed uppercase">
              Pro tip: Tap the card to reveal the Turkish translation, or click the pink speaker icon to practice your listening accent!
            </p>

          </div>
        </div>
      )}

      {/* TAB CONTENT: SPEED MATCH ARENA MINI GAME */}
      {activeTab === 'match' && (
        <div className="space-y-6 pt-2">
          
          <div className="flex justify-between items-center bg-slate-50 border border-slate-205 p-4 rounded-2xl">
            <div className="flex items-center gap-2">
              <Gamepad2 className="h-5 w-5 text-rose-500 animate-bounce" />
              <div>
                <h4 className="text-xs font-extrabold text-slate-800">Card Match Puzzle Mode</h4>
                <p className="text-slate-400 text-[10px] font-semibold leading-none mt-0.5">Flip correct word-translation couples to finish</p>
              </div>
            </div>

            <div className="text-right">
              <span className="text-xs font-black text-rose-600 block">Matched: {matchedPairsCount} / 5</span>
            </div>
          </div>

          {!gameWon ? (
            /* ACTIVE MATCH GRID */
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {gameBoard.map((tile) => {
                const isSelected = selectedTileId === tile.id;
                const isWrong = wrongTileIds.includes(tile.id);
                
                let tileClass = 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-350';

                if (tile.isMatched) {
                  tileClass = 'bg-emerald-50 border-emerald-300 text-emerald-450 pointer-events-none opacity-20';
                } else if (isWrong) {
                  tileClass = 'bg-rose-50 border-rose-500 text-rose-800 animate-pulse';
                } else if (isSelected) {
                  tileClass = 'bg-rose-50 border-rose-550 border-rose-500 text-rose-900 shadow-md';
                }

                return (
                  <button
                    key={tile.id}
                    onClick={() => handleTileClick(tile.id)}
                    className={`h-28 rounded-2xl border-2 font-bold text-xs p-3 flex flex-col justify-between items-center text-center transition-all select-none outline-none ${tileClass}`}
                  >
                    <span className={`text-[9px] font-black uppercase tracking-wider ${
                      tile.isEnglish ? 'text-indigo-400' : 'text-slate-400'
                    }`}>
                      {tile.isEnglish ? 'English' : 'Turkish'}
                    </span>
                    <span className="font-extrabold leading-tight text-xs tracking-tight break-all">
                      {tile.val}
                    </span>
                    <span className="h-2"></span>
                  </button>
                );
              })}
            </div>
          ) : (
            /* GAME COMPLETED VICTORY PANEL */
            <div className="bg-white border border-slate-120 rounded-3xl p-8 text-center max-w-md mx-auto space-y-5 animate-fade-in shadow-xs">
              <div className="h-16 w-16 bg-emerald-50 rounded-full border border-emerald-100 flex items-center justify-center text-3xl mx-auto">
                🎉
              </div>

              <div className="space-y-1">
                <h3 className="text-base font-extrabold text-slate-850">Splendid Match Complete!</h3>
                <p className="text-slate-450 text-xs font-semibold leading-normal">
                  You successfully paired all {level} terms flawlessly! You've claimed a study-camp boost reward.
                </p>
              </div>

              <div className="bg-emerald-500/5 border border-dashed border-emerald-500/30 rounded-2xl p-3 flex items-center justify-center gap-2">
                <Sparkles className="h-4.5 w-4.5 text-emerald-600 animate-spin" />
                <span className="text-xs font-bold text-emerald-800 uppercase">XP multiplier reward logged: +50 XP</span>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleResetGame}
                  className="flex-1 py-2 px-3 bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5 outline-none shadow-xs active:scale-98"
                >
                  <RotateCcw className="h-4.5 w-4.5" /> Study Next Set
                </button>
              </div>
            </div>
          )}

        </div>
      )}

    </div>
  );
}

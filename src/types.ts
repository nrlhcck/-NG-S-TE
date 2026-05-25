/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type SchoolType = 'Middle School' | 'High School';

export interface User {
  id: string;
  username: string;
  name: string;
  email?: string;
  schoolType: SchoolType;
  grade: number; // 5-8 for Middle School, 9-12 for High School
  avatar: string; // Emoji avatar or placeholder URL
  xp: number;
  studyGoalHours: number; // Weekly goal
  joinedAt: string; // ISO DateTime
  completedTopics?: string[]; // List of topicIds
  studyLogs?: StudyLog[];
  quizResults?: QuizResult[];
  friends?: string[];
}

export interface Topic {
  id: string;
  subjectId: string;
  name: string;
  description: string;
  durationMinutes: number;
  contents: string; // Markdown summary
  quiz: QuizQuestion[];
}

export interface Subject {
  id: string;
  name: string;
  schoolType: SchoolType;
  grade: number;
  icon: string; // Lucide icon name
  description: string;
  color: string; // Tailwind color name e.g., 'blue', 'orange'
  topics: Topic[];
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number; // index (0-3)
  explanation: string;
}

export interface StudyLog {
  id: string;
  date: string; // YYYY-MM-DD
  subjectId: string;
  subjectName: string;
  topicId: string;
  topicName: string;
  minutes: number;
  questionsSolved: number;
  status: 'Perfect' | 'Review' | 'Struggling';
  notes?: string;
}

export interface QuizResult {
  id: string;
  topicId: string;
  topicName: string;
  subjectId: string;
  subjectName: string;
  score: number; // number of correct answers
  totalQuestions: number;
  completedAt: string; // ISO DateTime
}

export interface Friend {
  friendId: string;
  username: string;
  name: string;
  avatar: string;
  xp: number;
  schoolType: SchoolType;
  grade: number;
  status: 'request_sent' | 'request_received' | 'accepted';
  updatedAt: string; // ISO DateTime
}

export interface VocabularyWord {
  word: string;
  meaning: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

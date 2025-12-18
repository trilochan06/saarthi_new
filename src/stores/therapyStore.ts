import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Activity, Learner, Assignment, ActivityType, Language, ActivityStatus } from '@/types/therapy';

interface TherapyState {
  // Auth
  isAuthenticated: boolean;
  userRole: 'therapist' | 'child' | null;
  currentChildId: string | null;
  
  // Data
  learners: Learner[];
  activities: Activity[];
  assignments: Assignment[];
  
  // Actions
  login: (role: 'therapist' | 'child', childId?: string) => void;
  logout: () => void;
  
  addLearner: (learner: Omit<Learner, 'id' | 'createdAt'>) => void;
  updateLearner: (id: string, updates: Partial<Learner>) => void;
  deleteLearner: (id: string) => void;
  
  addActivity: (activity: Omit<Activity, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateActivity: (id: string, updates: Partial<Activity>) => void;
  deleteActivity: (id: string) => void;
  
  assignActivity: (activityId: string, learnerId: string) => void;
  updateAssignment: (id: string, updates: Partial<Assignment>) => void;
  updateAssignmentStatus: (id: string, status: ActivityStatus, lastUpdate: string) => void;
}

const generateId = () => Math.random().toString(36).substr(2, 9);

export const useTherapyStore = create<TherapyState>()(
  persist(
    (set, get) => ({
      isAuthenticated: false,
      userRole: null,
      currentChildId: null,
      learners: [
        {
          id: 'learner-1',
          name: 'Aarav Sharma',
          age: 6,
          preferredLanguage: 'hindi',
          createdAt: new Date('2024-01-15'),
        },
        {
          id: 'learner-2',
          name: 'Priya Patel',
          age: 5,
          preferredLanguage: 'english',
          createdAt: new Date('2024-02-20'),
        },
        {
          id: 'learner-3',
          name: 'Karthik Rajan',
          age: 7,
          preferredLanguage: 'tamil',
          createdAt: new Date('2024-03-10'),
        },
      ],
      activities: [
        {
          id: 'activity-1',
          name: 'Daily Needs AAC Board',
          type: 'aac',
          targetLanguage: 'hindi',
          instruction: 'Tap on the pictures to communicate your needs',
          instructionTranslations: {
            english: 'Tap on the pictures to communicate your needs',
            hindi: 'अपनी जरूरतों को बताने के लिए चित्रों पर टैप करें',
            tamil: 'உங்கள் தேவைகளை தெரிவிக்க படங்களை தட்டவும்',
          },
          createdAt: new Date('2024-03-01'),
          updatedAt: new Date('2024-03-01'),
          aacItems: [
            { id: '1', label: 'Water', labelTranslations: { english: 'Water', hindi: 'पानी', tamil: 'தண்ணீர்' } },
            { id: '2', label: 'Food', labelTranslations: { english: 'Food', hindi: 'खाना', tamil: 'உணவு' } },
            { id: '3', label: 'Help', labelTranslations: { english: 'Help', hindi: 'मदद', tamil: 'உதவி' } },
            { id: '4', label: 'Bathroom', labelTranslations: { english: 'Bathroom', hindi: 'शौचालय', tamil: 'கழிவறை' } },
          ],
        },
        {
          id: 'activity-2',
          name: 'Color Matching',
          type: 'matching',
          targetLanguage: 'english',
          instruction: 'Match the color with its name',
          instructionTranslations: {
            english: 'Match the color with its name',
            hindi: 'रंग को उसके नाम से मिलाएं',
            tamil: 'நிறத்தை அதன் பெயருடன் பொருத்தவும்',
          },
          createdAt: new Date('2024-03-05'),
          updatedAt: new Date('2024-03-05'),
          matchingOptions: [
            { id: '1', text: 'Red', textTranslations: { english: 'Red', hindi: 'लाल', tamil: 'சிவப்பு' }, isCorrect: true },
            { id: '2', text: 'Blue', textTranslations: { english: 'Blue', hindi: 'नीला', tamil: 'நீலம்' }, isCorrect: false },
            { id: '3', text: 'Green', textTranslations: { english: 'Green', hindi: 'हरा', tamil: 'பச்சை' }, isCorrect: false },
          ],
        },
      ],
      assignments: [
        {
          id: 'assign-1',
          activityId: 'activity-1',
          learnerId: 'learner-1',
          status: 'in-progress',
          lastUpdate: 'Opened activity',
          assignedAt: new Date('2024-03-15'),
          updatedAt: new Date('2024-03-16'),
        },
        {
          id: 'assign-2',
          activityId: 'activity-2',
          learnerId: 'learner-2',
          status: 'completed',
          lastUpdate: 'Completed',
          assignedAt: new Date('2024-03-14'),
          updatedAt: new Date('2024-03-15'),
        },
      ],

      login: (role, childId) => set({ isAuthenticated: true, userRole: role, currentChildId: childId || null }),
      logout: () => set({ isAuthenticated: false, userRole: null, currentChildId: null }),

      addLearner: (learner) => set((state) => ({
        learners: [...state.learners, {
          ...learner,
          id: generateId(),
          createdAt: new Date(),
        }],
      })),

      updateLearner: (id, updates) => set((state) => ({
        learners: state.learners.map((l) => l.id === id ? { ...l, ...updates } : l),
      })),

      deleteLearner: (id) => set((state) => ({
        learners: state.learners.filter((l) => l.id !== id),
      })),

      addActivity: (activity) => set((state) => ({
        activities: [...state.activities, {
          ...activity,
          id: generateId(),
          createdAt: new Date(),
          updatedAt: new Date(),
        }],
      })),

      updateActivity: (id, updates) => set((state) => ({
        activities: state.activities.map((a) => 
          a.id === id ? { ...a, ...updates, updatedAt: new Date() } : a
        ),
      })),

      deleteActivity: (id) => set((state) => ({
        activities: state.activities.filter((a) => a.id !== id),
      })),

      assignActivity: (activityId, learnerId) => set((state) => ({
        assignments: [...state.assignments, {
          id: generateId(),
          activityId,
          learnerId,
          status: 'assigned',
          lastUpdate: 'Not started',
          assignedAt: new Date(),
          updatedAt: new Date(),
        }],
      })),

      updateAssignment: (id, updates) => set((state) => ({
        assignments: state.assignments.map((a) =>
          a.id === id ? { ...a, ...updates, updatedAt: new Date() } : a
        ),
      })),

      updateAssignmentStatus: (id, status, lastUpdate) => set((state) => ({
        assignments: state.assignments.map((a) =>
          a.id === id ? { ...a, status, lastUpdate, updatedAt: new Date() } : a
        ),
      })),
    }),
    {
      name: 'therapy-store',
    }
  )
);

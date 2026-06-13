import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { MarkbookState, Student, Subject, Assessment, SchoolInfo } from '@/types/markbook';

const initialState: MarkbookState = {
  schoolInfo: {
    school: 'Afran',
    teacher: 'Ms.Elfo',
    year: '2018',
    semester: '1st',
    class: '',
  },
  students: [],
  subjects: [],
  assessments: [],
  selectedSubjectId: null,
  scoreDisplayMode: '100%',
};

type Action =
  | { type: 'SET_SCHOOL_INFO'; payload: Partial<SchoolInfo> }
  | { type: 'ADD_STUDENT'; payload: Student }
  | { type: 'UPDATE_STUDENT'; payload: Student }
  | { type: 'DELETE_STUDENT'; payload: string }
  | { type: 'ADD_SUBJECT'; payload: Subject }
  | { type: 'DELETE_SUBJECT'; payload: string }
  | { type: 'UPDATE_ASSESSMENT'; payload: Assessment }
  | { type: 'SET_SELECTED_SUBJECT'; payload: string }
  | { type: 'SET_SCORE_DISPLAY_MODE'; payload: '10%' | '100%' }
  | { type: 'IMPORT_DATA'; payload: Partial<MarkbookState> }
  | { type: 'SET_STUDENTS'; payload: Student[] }
  | { type: 'SET_ASSESSMENTS'; payload: Assessment[] };

function markbookReducer(state: MarkbookState, action: Action): MarkbookState {
  switch (action.type) {
    case 'SET_SCHOOL_INFO':
      return { ...state, schoolInfo: { ...state.schoolInfo, ...action.payload } };
    case 'ADD_STUDENT': {
      const newStudent = action.payload;
      const newAssessments = state.subjects.map(subject => ({
        studentId: newStudent.id,
        subjectId: subject.id,
        scores: Array(10).fill(0),
      }));
      return {
        ...state,
        students: [...state.students, newStudent],
        assessments: [...state.assessments, ...newAssessments],
      };
    }
    case 'UPDATE_STUDENT':
      return {
        ...state,
        students: state.students.map(s => 
          s.id === action.payload.id ? action.payload : s
        ),
      };
    case 'DELETE_STUDENT':
      return {
        ...state,
        students: state.students.filter(s => s.id !== action.payload),
        assessments: state.assessments.filter(a => a.studentId !== action.payload),
      };
    case 'ADD_SUBJECT': {
      const newSubject = action.payload;
      const newAssessments = state.students.map(student => ({
        studentId: student.id,
        subjectId: newSubject.id,
        scores: Array(10).fill(0),
      }));
      return {
        ...state,
        subjects: [...state.subjects, newSubject],
        assessments: [...state.assessments, ...newAssessments],
      };
    }
    case 'DELETE_SUBJECT':
      return {
        ...state,
        subjects: state.subjects.filter(s => s.id !== action.payload),
        assessments: state.assessments.filter(a => a.subjectId !== action.payload),
        selectedSubjectId: state.selectedSubjectId === action.payload 
          ? state.subjects[0]?.id || null 
          : state.selectedSubjectId,
      };
    case 'UPDATE_ASSESSMENT':
      const existingAssessment = state.assessments.find(
        a => a.studentId === action.payload.studentId && a.subjectId === action.payload.subjectId
      );
      if (existingAssessment) {
        return {
          ...state,
          assessments: state.assessments.map(a =>
            a.studentId === action.payload.studentId && a.subjectId === action.payload.subjectId
              ? action.payload
              : a
          ),
        };
      } else {
        // If assessment doesn't exist, create it
        return {
          ...state,
          assessments: [...state.assessments, action.payload],
        };
      }
    case 'SET_SELECTED_SUBJECT':
      return { ...state, selectedSubjectId: action.payload };
    case 'SET_SCORE_DISPLAY_MODE':
      return { ...state, scoreDisplayMode: action.payload };
    case 'IMPORT_DATA':
      return { ...state, ...action.payload };
    case 'SET_STUDENTS':
      return { ...state, students: action.payload };
    case 'SET_ASSESSMENTS':
      return { ...state, assessments: action.payload };
    default:
      return state;
  }
}

interface MarkbookContextType {
  state: MarkbookState;
  dispatch: React.Dispatch<Action>;
  getStudentAssessment: (studentId: string, subjectId: string) => Assessment | undefined;
  getStudentTotal: (studentId: string, subjectId: string) => number;
  getStudentRank: (studentId: string, subjectId: string) => number;
  getAllSubjectsTotals: (studentId: string) => { [subjectId: string]: number };
  getOverallTotal: (studentId: string) => number;
  getOverallAverage: (studentId: string) => number;
  getOverallRank: (studentId: string) => number;
}

const MarkbookContext = createContext<MarkbookContextType | undefined>(undefined);

export function MarkbookProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(markbookReducer, initialState);

  const getStudentAssessment = (studentId: string, subjectId: string) => {
    return state.assessments.find(
      a => a.studentId === studentId && a.subjectId === subjectId
    );
  };

  const getStudentTotal = (studentId: string, subjectId: string) => {
    const assessment = getStudentAssessment(studentId, subjectId);
    if (!assessment) return 0;
    return assessment.scores.reduce((sum, score) => sum + score, 0);
  };

  const getStudentRank = (studentId: string, subjectId: string) => {
    const totals = state.students.map(student => ({
      studentId: student.id,
      total: getStudentTotal(student.id, subjectId),
    }));
    totals.sort((a, b) => b.total - a.total);
    const index = totals.findIndex(t => t.studentId === studentId);
    return index + 1;
  };

  const getAllSubjectsTotals = (studentId: string) => {
    const totals: { [subjectId: string]: number } = {};
    state.subjects.forEach(subject => {
      totals[subject.id] = getStudentTotal(studentId, subject.id);
    });
    return totals;
  };

  const getOverallTotal = (studentId: string) => {
    const totals = getAllSubjectsTotals(studentId);
    return Object.values(totals).reduce((sum, t) => sum + t, 0);
  };

  const getOverallAverage = (studentId: string) => {
    const total = getOverallTotal(studentId);
    const subjectCount = state.subjects.length;
    return subjectCount > 0 ? total / subjectCount : 0;
  };

  const getOverallRank = (studentId: string) => {
    const allTotals = state.students.map(student => ({
      studentId: student.id,
      total: getOverallTotal(student.id),
    }));
    allTotals.sort((a, b) => b.total - a.total);
    const index = allTotals.findIndex(t => t.studentId === studentId);
    return index + 1;
  };

  return (
    <MarkbookContext.Provider
      value={{
        state,
        dispatch,
        getStudentAssessment,
        getStudentTotal,
        getStudentRank,
        getAllSubjectsTotals,
        getOverallTotal,
        getOverallAverage,
        getOverallRank,
      }}
    >
      {children}
    </MarkbookContext.Provider>
  );
}

export function useMarkbook() {
  const context = useContext(MarkbookContext);
  if (!context) {
    throw new Error('useMarkbook must be used within a MarkbookProvider');
  }
  return context;
}

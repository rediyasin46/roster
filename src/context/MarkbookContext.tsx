import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import {
  MarkbookState,
  Student,
  Subject,
  Assessment,
  SchoolInfo,
  AssessmentSemester,
  SubjectSemesterView,
} from '@/types/markbook';
import { defaultAssessments, defaultStudents, defaultSubjects } from '@/data/defaultStudents';
import {
  getSemesterAverage,
  getSemesterRank,
  getSemesterTotal,
  getSemestersWithData,
  getSubjectScore,
} from '@/utils/semesterScores';

const initialState: MarkbookState = {
  schoolInfo: {
    school: 'Afran',
    teacher: 'Ms.Elfo',
    year: '2018',
    semester: '1st',
    class: '',
  },
  students: defaultStudents,
  subjects: defaultSubjects,
  assessments: defaultAssessments,
  selectedSubjectId: defaultSubjects[0]?.id ?? null,
  subjectSemesterView: '1st',
  scoreDisplayMode: '100%',
  isSeedData: true,
};

function clearSeedData(state: MarkbookState): MarkbookState {
  if (!state.isSeedData) return state;
  return {
    ...state,
    isSeedData: false,
    students: [],
    subjects: [],
    assessments: [],
    selectedSubjectId: null,
  };
}

type Action =
  | { type: 'SET_SCHOOL_INFO'; payload: Partial<SchoolInfo> }
  | { type: 'ADD_STUDENT'; payload: Student }
  | { type: 'UPDATE_STUDENT'; payload: Student }
  | { type: 'DELETE_STUDENT'; payload: string }
  | { type: 'ADD_SUBJECT'; payload: Subject }
  | { type: 'DELETE_SUBJECT'; payload: string }
  | { type: 'UPDATE_ASSESSMENT'; payload: Assessment }
  | { type: 'SET_SELECTED_SUBJECT'; payload: string }
  | { type: 'SET_SUBJECT_SEMESTER_VIEW'; payload: SubjectSemesterView }
  | { type: 'SET_SCORE_DISPLAY_MODE'; payload: '10%' | '100%' }
  | { type: 'IMPORT_DATA'; payload: Partial<MarkbookState> }
  | { type: 'SET_STUDENTS'; payload: Student[] }
  | { type: 'SET_ASSESSMENTS'; payload: Assessment[] }
  | {
      type: 'BULK_IMPORT';
      payload: {
        newStudents?: Student[];
        updatedStudents?: Student[];
        newSubjects?: Subject[];
        assessmentUpdates?: Assessment[];
        selectSubjectId?: string;
        importScoreIndex?: number;
      };
    };

function markbookReducer(state: MarkbookState, action: Action): MarkbookState {
  switch (action.type) {
    case 'SET_SCHOOL_INFO':
      return { ...state, schoolInfo: { ...state.schoolInfo, ...action.payload } };
    case 'ADD_STUDENT': {
      const base = clearSeedData(state);
      const newStudent = action.payload;
      const newAssessments = base.subjects.map(subject => ({
        studentId: newStudent.id,
        subjectId: subject.id,
        scores: Array(10).fill(0),
      }));
      return {
        ...base,
        students: [...base.students, newStudent].sort((a, b) => a.rn - b.rn),
        assessments: [...base.assessments, ...newAssessments],
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
      const base = clearSeedData(state);
      const newSubject = action.payload;
      const newAssessments = base.students.map(student => ({
        studentId: student.id,
        subjectId: newSubject.id,
        scores: Array(10).fill(0),
      }));
      return {
        ...base,
        subjects: [...base.subjects, newSubject],
        assessments: [...base.assessments, ...newAssessments],
        selectedSubjectId: base.selectedSubjectId ?? newSubject.id,
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
    case 'SET_SUBJECT_SEMESTER_VIEW': {
      const view = action.payload;
      const schoolSemester = view === 'both' ? state.schoolInfo.semester : view;
      return {
        ...state,
        subjectSemesterView: view,
        schoolInfo: { ...state.schoolInfo, semester: schoolSemester },
      };
    }
    case 'SET_SCORE_DISPLAY_MODE':
      return { ...state, scoreDisplayMode: action.payload };
    case 'IMPORT_DATA':
      return { ...state, ...action.payload };
    case 'SET_STUDENTS':
      return { ...state, students: action.payload };
    case 'SET_ASSESSMENTS':
      return { ...state, assessments: action.payload };
    case 'BULK_IMPORT': {
      const {
        newStudents = [],
        updatedStudents = [],
        newSubjects = [],
        assessmentUpdates = [],
        selectSubjectId,
        importScoreIndex = 0,
      } = action.payload;

      const cleared = clearSeedData(state);
      let students = [...cleared.students];
      let subjects = [...cleared.subjects];
      let assessments = [...cleared.assessments];

      if (updatedStudents.length > 0) {
        const updateMap = new Map(updatedStudents.map((s) => [s.id, s]));
        students = students.map((s) => updateMap.get(s.id) ?? s);
      }

      for (const subject of newSubjects) {
        if (subjects.some((s) => s.id === subject.id)) continue;
        subjects.push(subject);
        for (const student of students) {
          assessments.push({
            studentId: student.id,
            subjectId: subject.id,
            scores: Array(10).fill(0),
          });
        }
      }

      for (const student of newStudents) {
        if (students.some((s) => s.id === student.id)) continue;
        students.push(student);
        for (const subject of subjects) {
          assessments.push({
            studentId: student.id,
            subjectId: subject.id,
            scores: Array(10).fill(0),
          });
        }
      }

      for (const update of assessmentUpdates) {
        const idx = assessments.findIndex(
          (a) => a.studentId === update.studentId && a.subjectId === update.subjectId
        );
        if (idx >= 0) {
          const existing = assessments[idx];
          assessments[idx] = {
            ...existing,
            scores: existing.scores.map((s, i) =>
              i === importScoreIndex ? update.scores[importScoreIndex] : s
            ),
          };
        } else {
          assessments.push(update);
        }
      }

      students.sort((a, b) => {
        const rnA = typeof a.rn === 'number' ? a.rn : parseInt(String(a.rn || 0), 10);
        const rnB = typeof b.rn === 'number' ? b.rn : parseInt(String(b.rn || 0), 10);
        return (Number.isNaN(rnA) ? 0 : rnA) - (Number.isNaN(rnB) ? 0 : rnB);
      });

      return {
        ...cleared,
        students,
        subjects,
        assessments,
        selectedSubjectId: selectSubjectId ?? cleared.selectedSubjectId ?? subjects[0]?.id ?? null,
      };
    }
    default:
      return state;
  }
}

interface MarkbookContextType {
  state: MarkbookState;
  dispatch: React.Dispatch<Action>;
  getStudentAssessment: (studentId: string, subjectId: string) => Assessment | undefined;
  getStudentSemesterScore: (studentId: string, subjectId: string, semester: AssessmentSemester) => number;
  getStudentTotal: (studentId: string, subjectId: string) => number;
  getStudentRank: (studentId: string, subjectId: string) => number;
  getAllSubjectsTotals: (studentId: string) => { [subjectId: string]: number };
  getSemesterTotal: (studentId: string, semester: AssessmentSemester) => number;
  getSemesterAverage: (studentId: string, semester: AssessmentSemester) => number;
  getSemesterRank: (studentId: string, semester: AssessmentSemester) => number;
  getSemestersWithData: () => AssessmentSemester[];
  getOverallTotal: (studentId: string) => number;
  getOverallAverage: (studentId: string) => number;
  getOverallRank: (studentId: string) => number;
}

const MarkbookContext = createContext<MarkbookContextType | undefined>(undefined);

function getScoreForView(
  assessments: Assessment[],
  subjects: Subject[],
  students: Student[],
  studentId: string,
  subjectId: string,
  view: SubjectSemesterView
): number {
  if (view === 'both') {
    const semesters = getSemestersWithData(assessments, students, subjects);
    if (semesters.length === 0) return 0;
    const total = semesters.reduce(
      (sum, semester) => sum + getSubjectScore(assessments, studentId, subjectId, semester),
      0
    );
    return total / semesters.length;
  }
  return getSubjectScore(assessments, studentId, subjectId, view);
}

export function MarkbookProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(markbookReducer, initialState);

  const getStudentAssessment = (studentId: string, subjectId: string) => {
    return state.assessments.find(
      a => a.studentId === studentId && a.subjectId === subjectId
    );
  };

  const getStudentSemesterScore = (
    studentId: string,
    subjectId: string,
    semester: AssessmentSemester
  ) => {
    return getSubjectScore(state.assessments, studentId, subjectId, semester);
  };

  const getStudentTotal = (studentId: string, subjectId: string) => {
    return getScoreForView(
      state.assessments,
      state.subjects,
      state.students,
      studentId,
      subjectId,
      state.subjectSemesterView
    );
  };

  const getStudentRank = (studentId: string, subjectId: string) => {
    const totals = state.students.map(student => ({
      studentId: student.id,
      total: getScoreForView(
        state.assessments,
        state.subjects,
        state.students,
        student.id,
        subjectId,
        state.subjectSemesterView
      ),
    }));
    totals.sort((a, b) => b.total - a.total);
    const index = totals.findIndex(t => t.studentId === studentId);
    return index + 1;
  };

  const getAllSubjectsTotals = (studentId: string) => {
    const totals: { [subjectId: string]: number } = {};
    state.subjects.forEach(subject => {
      totals[subject.id] = getScoreForView(
        state.assessments,
        state.subjects,
        state.students,
        studentId,
        subject.id,
        state.subjectSemesterView
      );
    });
    return totals;
  };

  const getSemesterTotalForStudent = (studentId: string, semester: AssessmentSemester) => {
    return getSemesterTotal(state.assessments, state.subjects, studentId, semester);
  };

  const getSemesterAverageForStudent = (studentId: string, semester: AssessmentSemester) => {
    return getSemesterAverage(state.assessments, state.subjects, studentId, semester);
  };

  const getSemesterRankForStudent = (studentId: string, semester: AssessmentSemester) => {
    return getSemesterRank(
      state.assessments,
      state.subjects,
      state.students,
      studentId,
      semester
    );
  };

  const getSemestersWithDataForClass = () => {
    return getSemestersWithData(state.assessments, state.students, state.subjects);
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
        getStudentSemesterScore,
        getStudentTotal,
        getStudentRank,
        getAllSubjectsTotals,
        getSemesterTotal: getSemesterTotalForStudent,
        getSemesterAverage: getSemesterAverageForStudent,
        getSemesterRank: getSemesterRankForStudent,
        getSemestersWithData: getSemestersWithDataForClass,
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

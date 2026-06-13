export interface Student {
  id: string;
  name: string;
  rn: number;
  sex?: string;
  age?: string | number;
  village?: string;
  kebele?: string;
  year?: string;
}

export interface Subject {
  id: string;
  name: string;
  maxScore: number;
}

export interface Assessment {
  studentId: string;
  subjectId: string;
  scores: number[]; // 10 assessments
}

export interface SchoolInfo {
  school: string;
  teacher: string;
  year: string;
  semester: string;
  class: string;
}

export interface MarkbookState {
  schoolInfo: SchoolInfo;
  students: Student[];
  subjects: Subject[];
  assessments: Assessment[];
  selectedSubjectId: string | null;
  scoreDisplayMode: '10%' | '100%';
}

export interface RankData {
  studentId: string;
  studentName: string;
  rn: number;
  subjectScores: { [subjectId: string]: number };
  total: number;
  average: number;
  rank: number;
}

export interface RosterSemesterData {
  semester: string;
  subjectScores: { [subjectId: string]: number };
  total: number;
  average: number;
  rank: number;
}

export interface RosterData {
  studentId: string;
  studentName: string;
  rn: number;
  semesters: RosterSemesterData[];
  averageRow: RosterSemesterData;
}

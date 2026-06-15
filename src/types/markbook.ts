export interface StudentSemesterRecord {
  absent?: string | number;
  conduct?: string;
  remark?: string;
}

export interface Student {
  id: string;
  name: string;
  rn: number;
  sex?: string;
  age?: string | number;
  village?: string;
  kebele?: string;
  year?: string;
  /** @deprecated Use semester1.absent — kept for backward compatibility */
  absent?: string | number;
  /** @deprecated Use semester1.conduct */
  conduct?: string;
  /** @deprecated Use semester1.remark */
  remark?: string;
  semester1?: StudentSemesterRecord;
  semester2?: StudentSemesterRecord;
}

export type AssessmentSemester = '1st' | '2nd';

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
  grade?: string;
  section?: string;
}

export type SubjectSemesterView = AssessmentSemester | 'both';

export interface MarkbookState {
  schoolInfo: SchoolInfo;
  students: Student[];
  subjects: Subject[];
  assessments: Assessment[];
  selectedSubjectId: string | null;
  /** Controls subject column display on the Assessments page (1st / 2nd / both) */
  subjectSemesterView: SubjectSemesterView;
  scoreDisplayMode: '10%' | '100%';
  /** True while demo/seed rows are shown; cleared when user adds or imports real data */
  isSeedData: boolean;
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

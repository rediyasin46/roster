import type {
  Assessment,
  AssessmentSemester,
  Student,
  Subject,
  SubjectSemesterView,
} from '@/types/markbook';

export const SCORE_INDEX: Record<AssessmentSemester, number> = { '1st': 0, '2nd': 1 };

export function getSemestersToShow(view: SubjectSemesterView): AssessmentSemester[] {
  if (view === '2nd') return ['2nd'];
  if (view === 'both') return ['1st', '2nd'];
  return ['1st'];
}

export function resolveImportSemester(view: string): AssessmentSemester | null {
  if (view === '1st' || view === '2nd') return view;
  return null;
}

export function getSubjectScore(
  assessments: Assessment[],
  studentId: string,
  subjectId: string,
  semester: AssessmentSemester
): number {
  const assessment = assessments.find(
    (a) => a.studentId === studentId && a.subjectId === subjectId
  );
  if (!assessment) return 0;
  const score = assessment.scores[SCORE_INDEX[semester]];
  return typeof score === 'number' && !Number.isNaN(score) ? score : 0;
}

export function getSubjectScoreDisplay(
  assessments: Assessment[],
  studentId: string,
  subjectId: string,
  semester: AssessmentSemester
): number | '' {
  const assessment = assessments.find(
    (a) => a.studentId === studentId && a.subjectId === subjectId
  );
  if (!assessment) return '';
  const score = assessment.scores[SCORE_INDEX[semester]];
  return typeof score === 'number' && !Number.isNaN(score) ? score : '';
}

export function getSemesterSubjectScores(
  assessments: Assessment[],
  subjects: Subject[],
  studentId: string,
  semester: AssessmentSemester
): Record<string, number> {
  const scores: Record<string, number> = {};
  subjects.forEach((subject) => {
    scores[subject.id] = getSubjectScore(assessments, studentId, subject.id, semester);
  });
  return scores;
}

export function getSemesterTotal(
  assessments: Assessment[],
  subjects: Subject[],
  studentId: string,
  semester: AssessmentSemester
): number {
  return subjects.reduce(
    (sum, subject) => sum + getSubjectScore(assessments, studentId, subject.id, semester),
    0
  );
}

export function getSemesterAverage(
  assessments: Assessment[],
  subjects: Subject[],
  studentId: string,
  semester: AssessmentSemester
): number {
  if (subjects.length === 0) return 0;
  return getSemesterTotal(assessments, subjects, studentId, semester) / subjects.length;
}

export function getSemesterRank(
  assessments: Assessment[],
  subjects: Subject[],
  students: Student[],
  studentId: string,
  semester: AssessmentSemester
): number {
  const totals = students.map((student) => ({
    studentId: student.id,
    total: getSemesterTotal(assessments, subjects, student.id, semester),
  }));
  totals.sort((a, b) => b.total - a.total);
  const index = totals.findIndex((t) => t.studentId === studentId);
  return index >= 0 ? index + 1 : 0;
}

export function semesterHasScoreData(
  assessments: Assessment[],
  students: Student[],
  subjects: Subject[],
  semester: AssessmentSemester
): boolean {
  const idx = SCORE_INDEX[semester];
  return students.some((student) =>
    subjects.some((subject) => {
      const assessment = assessments.find(
        (a) => a.studentId === student.id && a.subjectId === subject.id
      );
      const score = assessment?.scores[idx];
      return typeof score === 'number' && score > 0;
    })
  );
}

export function getSemestersWithData(
  assessments: Assessment[],
  students: Student[],
  subjects: Subject[]
): AssessmentSemester[] {
  const semesters: AssessmentSemester[] = [];
  if (semesterHasScoreData(assessments, students, subjects, '1st')) {
    semesters.push('1st');
  }
  if (semesterHasScoreData(assessments, students, subjects, '2nd')) {
    semesters.push('2nd');
  }
  return semesters.length > 0 ? semesters : ['1st'];
}

export function getCombinedSemesterScores(
  assessments: Assessment[],
  subjects: Subject[],
  studentId: string,
  semesters: AssessmentSemester[]
): Record<string, number> {
  const scores: Record<string, number> = {};
  subjects.forEach((subject) => {
    const values = semesters.map((semester) =>
      getSubjectScore(assessments, studentId, subject.id, semester)
    );
    scores[subject.id] = values.reduce((sum, value) => sum + value, 0) / values.length;
  });
  return scores;
}

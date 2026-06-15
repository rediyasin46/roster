import { Assessment, Student, Subject } from '@/types/markbook';

export const defaultSubjects: Subject[] = [
  { id: 'amharic', name: 'Amharic', maxScore: 100 },
  { id: 'english', name: 'English', maxScore: 100 },
  { id: 'maths', name: 'Maths', maxScore: 100 },
  { id: 'science', name: 'Science', maxScore: 100 },
];

export const defaultStudents: Student[] = [
  { id: 'student-1', name: 'አበበ ከበደ', rn: 1 },
  { id: 'student-2', name: 'ሰላም ተስፋዬ', rn: 2 },
  { id: 'student-3', name: 'ዳዊት ሙሉጌታ', rn: 3 },
  { id: 'student-4', name: 'ሀና ገብረ ማርያም', rn: 4 },
  { id: 'student-5', name: 'ብርሃኑ አለማየሁ', rn: 5 },
];

const defaultScores: Record<string, { amharic: number; english: number; maths: number; science: number }> = {
  'student-1': { amharic: 85, english: 78, maths: 92, science: 88 },
  'student-2': { amharic: 90, english: 82, maths: 75, science: 80 },
  'student-3': { amharic: 72, english: 88, maths: 95, science: 91 },
  'student-4': { amharic: 88, english: 91, maths: 68, science: 76 },
  'student-5': { amharic: 95, english: 85, maths: 89, science: 93 },
};

function createAssessment(studentId: string, subjectId: string, score: number): Assessment {
  return {
    studentId,
    subjectId,
    scores: [score, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  };
}

export const defaultAssessments: Assessment[] = defaultStudents.flatMap((student) => {
  const scores = defaultScores[student.id];
  return defaultSubjects.map((subject) =>
    createAssessment(student.id, subject.id, scores[subject.id as keyof typeof scores])
  );
});

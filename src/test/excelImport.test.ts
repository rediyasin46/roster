import { describe, it, expect } from 'vitest';
import {
  processSpreadsheetImport,
  findFieldColumnIndex,
  getPresentStudentFields,
} from '@/utils/excelImport';

const headers = [
  'RN',
  'Student Name',
  'Sex',
  'Age',
  'Village',
  'Kebele',
  'siltigna',
  'amharic',
  'english',
  'maths',
  'science',
  'art',
  'hpe',
  'Absent',
  'Conduct',
  'Remark',
  'Action',
];

describe('excelImport conduct column', () => {
  it('maps conduct to the Conduct header column only', () => {
    expect(findFieldColumnIndex(headers, 'conduct')).toBe(14);
    expect(getPresentStudentFields(headers).has('conduct')).toBe(true);
  });

  it('stores dash as empty conduct when Conduct cell is -', () => {
    const rows = [
      headers,
      [1, 'Student 1', '-', '-', '-', '-', 85, 60, 52, 54, 89, 56, 89, '-', '-', '-', ''],
    ];
    const { payload } = processSpreadsheetImport(rows, [], []);
    expect(payload.newStudents).toHaveLength(1);
    expect(payload.newStudents[0].conduct).toBeUndefined();
  });

  it('does not put subject scores into conduct', () => {
    const rows = [
      headers,
      [1, 'Student 1', '-', '-', '-', '-', 85, 60, 52, 54, 89, 56, 89, '-', '-', '-', ''],
      [2, 'Student 2', '-', '-', '-', '-', 94, 77, 75, 80, 95, 65, 82, '-', '-', '-', ''],
    ];
    const { payload } = processSpreadsheetImport(rows, [], []);
    for (const s of payload.newStudents) {
      expect(s.conduct).not.toBe('89');
      expect(s.conduct).not.toBe('82');
      expect(s.conduct).toBeUndefined();
    }
  });

  it('imports conduct only when Conduct column has a real value', () => {
    const rows = [
      headers,
      [1, 'Student 1', '-', '-', '-', '-', 85, 60, 52, 54, 89, 56, 89, '-', 'Good', '-', ''],
    ];
    const { payload } = processSpreadsheetImport(rows, [], []);
    expect(payload.newStudents[0].conduct).toBe('Good');
  });

  it('does not treat numeric subject scores as conduct when Conduct cell is empty', () => {
    const rows = [
      headers,
      [1, 'Student 1', '-', '-', '-', '-', 85, 60, 52, 54, 89, 56, 89, '-', '-', '-', ''],
      [2, 'Student 2', '-', '-', '-', '-', 94, 77, 75, 80, 95, 65, 82, '-', '-', '-', ''],
      [3, 'Student 3', '-', '-', '-', '-', 82, 67, 55, 66, 82, 76, 84, '-', '-', '-', ''],
      [4, 'Student 4', '-', '-', '-', '-', 89, 84, 90, 85, 94, 82, 97, '-', '-', '-', ''],
    ];
    const { payload } = processSpreadsheetImport(rows, [], []);
    expect(payload.newStudents).toHaveLength(4);
    for (const s of payload.newStudents) {
      expect(['83', '92', '85', '98']).not.toContain(s.conduct);
    }
  });

  it('does not keep stale conduct when re-importing with empty Conduct column', () => {
    const existing = [
      {
        id: 'student-1',
        rn: 1,
        name: 'Student 1',
        conduct: '83',
      },
    ];
    const rows = [
      headers,
      [1, 'Student 1', '-', '-', '-', '-', 85, 60, 52, 54, 89, 56, 89, '-', '-', '-', ''],
    ];
    const { payload } = processSpreadsheetImport(rows, existing, []);
    expect(payload.updatedStudents[0]?.conduct).toBeUndefined();
  });

  it('leaves conduct unset when Conduct column is missing from the file', () => {
    const headersNoConduct = headers.filter((h) => h !== 'Conduct');
    const row = [1, 'Student 1', '-', '-', '-', '-', 85, 60, 52, 54, 89, 56, 89, '-', '-', ''];
    const { payload } = processSpreadsheetImport([headersNoConduct, row], [], []);
    expect(payload.newStudents[0].conduct).toBeUndefined();
  });

  it('imports behavior as a subject column, not as conduct', () => {
    const subjectHeaders = [
      'RN',
      'siltigna',
      'amharic',
      'english',
      'maths',
      'science',
      'art',
      'behavior',
      'hpe',
    ];
    const rows = [
      subjectHeaders,
      [1, 85, 60, 52, 54, 89, 56, 83, 89],
      [2, 94, 77, 75, 80, 95, 65, 92, 82],
    ];
    const { payload } = processSpreadsheetImport(rows, [], [], { purpose: 'subjects' });
    expect(payload.newSubjects.map((s) => s.name)).toEqual([
      'siltigna',
      'amharic',
      'english',
      'maths',
      'science',
      'art',
      'behavior',
      'hpe',
    ]);
    expect(payload.newStudents[0].conduct).toBeUndefined();
    const behaviorAssessments = payload.assessmentUpdates.filter(
      (a) => a.subjectId === 'behavior'
    );
    expect(behaviorAssessments).toHaveLength(2);
    expect(behaviorAssessments[0].scores[0]).toBe(83);
    expect(behaviorAssessments[1].scores[0]).toBe(92);
  });

  it('ignores numeric score-like values in the Conduct column', () => {
    const rows = [
      headers,
      [1, 'Student 1', '-', '-', '-', '-', 85, 60, 52, 54, 89, 56, 89, '-', 83, '-', ''],
      [2, 'Student 2', '-', '-', '-', '-', 94, 77, 75, 80, 95, 65, 82, '-', 92, '-', ''],
      [3, 'Student 3', '-', '-', '-', '-', 82, 67, 55, 66, 82, 76, 84, '-', 85, '-', ''],
      [4, 'Student 4', '-', '-', '-', '-', 89, 84, 90, 85, 94, 82, 97, '-', 98, '-', ''],
    ];
    const { payload } = processSpreadsheetImport(rows, [], [], { purpose: 'studentInfo' });
    expect(payload.newStudents).toHaveLength(4);
    for (const s of payload.newStudents) {
      expect(s.conduct).toBeUndefined();
    }
  });
});

describe('excelImport purpose modes', () => {
  const subjectHeaders = ['RN', 'siltigna', 'amharic', 'english', 'maths'];
  const studentHeaders = ['RN', 'Student Name', 'Sex', 'Conduct', 'Absent'];

  it('subjects mode imports only numeric scores and ignores student info columns', () => {
    const rows = [
      [...subjectHeaders, 'Student Name', 'Conduct'],
      [1, 85, 60, 52, 54, 'Alice', 'Good'],
      [2, 94, 77, 75, 80, 'Bob', 'Excellent'],
    ];
    const { payload } = processSpreadsheetImport(rows, [], [], { purpose: 'subjects' });
    expect(payload.newSubjects).toHaveLength(4);
    expect(payload.assessmentUpdates.length).toBeGreaterThan(0);
    expect(payload.newStudents[0].name).toBe('Student 1');
    expect(payload.newStudents[0].conduct).toBeUndefined();
  });

  it('subjects mode skips non-numeric text in score columns', () => {
    const rows = [
      subjectHeaders,
      [1, 85, 'absent', 52, 54],
      [2, 94, 77, 75, 80],
    ];
    const { payload } = processSpreadsheetImport(rows, [], [], { purpose: 'subjects' });
    const amharicScores = payload.assessmentUpdates.filter((a) => a.subjectId === 'amharic');
    expect(amharicScores).toHaveLength(1);
    expect(amharicScores[0].scores[0]).toBe(77);
  });

  it('studentInfo mode imports text and numbers and ignores subject columns', () => {
    const rows = [
      [...studentHeaders, 'siltigna', 'amharic'],
      [1, 'Alice', 'F', 'Good', 2, 85, 60],
      [2, 'Bob', 'M', 'Excellent', '0', 94, 77],
    ];
    const { payload } = processSpreadsheetImport(rows, [], [], { purpose: 'studentInfo' });
    expect(payload.newSubjects).toHaveLength(0);
    expect(payload.assessmentUpdates).toHaveLength(0);
    expect(payload.newStudents[0].name).toBe('Alice');
    expect(payload.newStudents[0].conduct).toBe('Good');
    expect(payload.newStudents[0].absent).toBe(2);
    expect(payload.newStudents[1].name).toBe('Bob');
    expect(payload.newStudents[1].absent).toBe('0');
  });

  it('studentInfo mode fails when no student columns are present', () => {
    const rows = [subjectHeaders, [1, 85, 60, 52, 54]];
    const { error } = processSpreadsheetImport(rows, [], [], { purpose: 'studentInfo' });
    expect(error).toMatch(/student information columns/i);
  });

  it('subjects mode fails when no subject columns are present', () => {
    const rows = [studentHeaders, [1, 'Alice', 'F', 'Good', 2]];
    const { error } = processSpreadsheetImport(rows, [], [], { purpose: 'subjects' });
    expect(error).toMatch(/subject score columns/i);
  });
});

describe('excelImport duplicate filtering', () => {
  it('keeps only the first duplicate subject column by header name', () => {
    const headers = ['RN', 'amharic', 'english', 'amharic', 'maths'];
    const rows = [
      headers,
      [1, 85, 72, 99, 54],
      [2, 90, 88, 70, 80],
    ];
    const { payload, warnings } = processSpreadsheetImport(rows, [], [], { purpose: 'subjects' });
    expect(payload.newSubjects.map((s) => s.name)).toEqual(['amharic', 'english', 'maths']);
    expect(payload.assessmentUpdates.filter((a) => a.subjectId === 'amharic')).toHaveLength(2);
    expect(payload.assessmentUpdates.find((a) => a.studentId.includes('1') && a.subjectId === 'amharic')?.scores[0]).toBe(85);
    expect(warnings?.some((w) => w.includes('amharic'))).toBe(true);
  });

  it('keeps only the first duplicate subject column when names differ by case', () => {
    const headers = ['RN', 'Amharic', 'amharic'];
    const rows = [headers, [1, 85, 99]];
    const { payload, warnings } = processSpreadsheetImport(rows, [], [], { purpose: 'subjects' });
    expect(payload.newSubjects).toHaveLength(1);
    expect(payload.assessmentUpdates[0].scores[0]).toBe(85);
    expect(warnings?.some((w) => w.includes('amharic'))).toBe(true);
  });

  it('keeps only the first row for a duplicate roll number', () => {
    const headers = ['RN', 'Student Name', 'amharic'];
    const rows = [
      headers,
      [1, 'Alice First', 85],
      [1, 'Alice Duplicate', 99],
      [2, 'Bob', 72],
    ];
    const { payload, warnings } = processSpreadsheetImport(rows, [], [], { purpose: 'all' });
    expect(payload.newStudents).toHaveLength(2);
    expect(payload.newStudents.find((s) => s.rn === 1)?.name).toBe('Alice First');
    const aliceScore = payload.assessmentUpdates.find(
      (a) => a.subjectId === 'amharic' && payload.newStudents.some((s) => s.id === a.studentId && s.rn === 1)
    );
    expect(aliceScore?.scores[0]).toBe(85);
    expect(warnings?.some((w) => w.includes('1'))).toBe(true);
  });

  it('does not create duplicate assessment updates for the same student and subject', () => {
    const headers = ['RN', 'maths', 'maths'];
    const rows = [headers, [1, 55, 55]];
    const { payload } = processSpreadsheetImport(rows, [], [], { purpose: 'subjects' });
    expect(payload.assessmentUpdates.filter((a) => a.subjectId === 'maths')).toHaveLength(1);
  });
});

describe('excelImport semester targeting', () => {
  const studentHeaders = ['RN', 'Student Name', 'Absent', 'Conduct', 'Remark'];
  const subjectHeaders = ['RN', 'amharic', 'english'];

  it('writes Absent, Conduct, and Remark to semester1 by default', () => {
    const rows = [
      studentHeaders,
      [1, 'Alice', 2, 'Good', 'Needs help'],
    ];
    const { payload } = processSpreadsheetImport(rows, [], [], { purpose: 'studentInfo' });
    expect(payload.newStudents[0].absent).toBe(2);
    expect(payload.newStudents[0].conduct).toBe('Good');
    expect(payload.newStudents[0].remark).toBe('Needs help');
    expect(payload.newStudents[0].semester1?.conduct).toBe('Good');
  });

  it('writes Absent, Conduct, and Remark to semester2 when selected', () => {
    const rows = [
      studentHeaders,
      [1, 'Alice', 2, 'Good', 'Needs help'],
    ];
    const { payload } = processSpreadsheetImport(rows, [], [], {
      purpose: 'studentInfo',
      importSemester: '2nd',
    });
    expect(payload.newStudents[0].absent).toBeUndefined();
    expect(payload.newStudents[0].semester2?.absent).toBe(2);
    expect(payload.newStudents[0].semester2?.conduct).toBe('Good');
    expect(payload.newStudents[0].semester2?.remark).toBe('Needs help');
  });

  it('imports subject scores into the selected semester index', () => {
    const rows = [
      subjectHeaders,
      [1, 85, 72],
      [2, 90, 88],
    ];
    const { payload } = processSpreadsheetImport(rows, [], [], {
      purpose: 'subjects',
      importSemester: '2nd',
    });
    expect(payload.importScoreIndex).toBe(1);
    const amharic = payload.assessmentUpdates.find((a) => a.subjectId === 'amharic');
    expect(amharic?.scores[1]).toBe(85);
    expect(amharic?.scores[0]).toBe(0);
  });

  it('clears 2nd semester conduct without touching 1st semester data', () => {
    const existing = [
      {
        id: 'student-1',
        rn: 1,
        name: 'Alice',
        conduct: 'Old 1st',
        semester1: { conduct: 'Old 1st' },
        semester2: { conduct: 'Old 2nd' },
      },
    ];
    const rows = [
      studentHeaders,
      [1, 'Alice', '-', '-', '-'],
    ];
    const { payload } = processSpreadsheetImport(rows, existing, [], {
      purpose: 'studentInfo',
      importSemester: '2nd',
    });
    expect(payload.updatedStudents[0]?.conduct).toBe('Old 1st');
    expect(payload.updatedStudents[0]?.semester1?.conduct).toBe('Old 1st');
    expect(payload.updatedStudents[0]?.semester2?.conduct).toBeUndefined();
  });
});

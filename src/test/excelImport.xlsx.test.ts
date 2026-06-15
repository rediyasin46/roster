import { describe, it, expect } from 'vitest';
import * as XLSX from 'xlsx';
import { processSpreadsheetImport } from '@/utils/excelImport';

describe('excelImport xlsx roundtrip', () => {
  it('reads conduct from the Conduct header column in a real xlsx file', () => {
    const headerRow = [
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
    ];
    const dataRows = [
      [1, 'Student 1', '-', '-', '-', '-', 85, 60, 52, 54, 89, 56, 89, '-', '-', '-'],
      [2, 'Student 2', '-', '-', '-', '-', 94, 77, 75, 80, 95, 65, 82, '-', '-', '-'],
    ];

    const ws = XLSX.utils.aoa_to_sheet([headerRow, ...dataRows]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
    const buffer = XLSX.write(wb, { type: 'array', bookType: 'xlsx' });
    const readWb = XLSX.read(buffer, { type: 'array' });
    const readWs = readWb.Sheets[readWb.SheetNames[0]];
    const jsonData = XLSX.utils.sheet_to_json(readWs, { header: 1 }) as unknown[][];

    const { payload } = processSpreadsheetImport(jsonData, [], []);
    expect(payload.newStudents).toHaveLength(2);
    for (const student of payload.newStudents) {
      expect(['83', '92', '85', '98']).not.toContain(student.conduct);
      expect(student.conduct).toBeUndefined();
    }
  });
});

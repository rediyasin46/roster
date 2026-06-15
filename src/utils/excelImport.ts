import * as XLSX from 'xlsx';
import { Assessment, AssessmentSemester, Student, Subject } from '@/types/markbook';

const SCORE_INDEX: Record<AssessmentSemester, number> = { '1st': 0, '2nd': 1 };
const SEMESTER_FIELDS = ['absent', 'conduct', 'remark'] as const;
type SemesterField = (typeof SEMESTER_FIELDS)[number];

const STUDENT_FIELD_ALIASES: Record<string, string[]> = {
  name: ['name', 'student name', 'full name', 'pupil name', 'student'],
  age: ['age'],
  sex: ['sex', 'gender'],
  village: ['village'],
  kebele: ['kebele'],
  absent: ['absent', 'absences', 'absence'],
  conduct: ['conduct'],
  remark: ['remark', 'remarks', 'comment', 'comments'],
};

const STUDENT_FIELDS = Object.keys(STUDENT_FIELD_ALIASES);

const SKIP_COLUMNS = new Set([
  'year', 'class', 'grade', 'section', 'action', 'edit', 'delete', 'total', 'average', 'rank',
]);

const EMPTY_CELL_VALUES = new Set(['-', '—', '–', 'n/a', 'na', 'none']);

export function normalizeHeader(header: unknown): string {
  return String(header ?? '')
    .replace(/^\uFEFF/, '')
    .trim()
    .toLowerCase();
}

export function isStudentFieldHeader(header: string): boolean {
  const h = normalizeHeader(header);
  if (!h) return false;

  for (const [field, aliases] of Object.entries(STUDENT_FIELD_ALIASES)) {
    if (field === 'name') {
      if (aliases.some((alias) => h === alias)) return true;
      if (h.includes('student') && h.includes('name')) return true;
      continue;
    }
    if (aliases.some((alias) => h === alias)) return true;
  }

  return false;
}

function normalizeStudentFieldValue(
  value: string | number | undefined
): string | number | undefined {
  if (value === null || value === undefined) return undefined;
  if (typeof value === 'number') return value;
  const trimmed = String(value).trim();
  if (!trimmed || EMPTY_CELL_VALUES.has(trimmed.toLowerCase())) return undefined;
  return trimmed;
}

export async function readSpreadsheetFile(file: File): Promise<any[][]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = new Uint8Array(event.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        resolve(XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][]);
      } catch (error) {
        reject(error);
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsArrayBuffer(file);
  });
}

export function findRnColumnIndex(headers: string[]): number {
  const normalized = headers.map(normalizeHeader);
  for (let i = 0; i < normalized.length; i++) {
    const h = normalized[i];
    if (!h) continue;
    if (h === 'rn' || h === '#' || h === 'no' || h === 'no.') return i;
    if (h.includes('roll')) return i;
  }
  return -1;
}

export function findFieldColumnIndex(headers: string[], field: string): number {
  const aliases = STUDENT_FIELD_ALIASES[field] ?? [field];
  const normalized = headers.map(normalizeHeader);

  for (const alias of aliases) {
    const idx = normalized.findIndex((h) => h === alias);
    if (idx !== -1) return idx;
  }

  if (field === 'name') {
    const idx = normalized.findIndex((h) => h.includes('student') && h.includes('name'));
    if (idx !== -1) return idx;
    const nameIdx = normalized.findIndex((h) => h === 'name');
    if (nameIdx !== -1) return nameIdx;
  }

  return -1;
}

export function getPresentStudentFields(headers: string[]): Set<string> {
  const present = new Set<string>();
  for (const field of STUDENT_FIELDS) {
    if (findFieldColumnIndex(headers, field) >= 0) {
      present.add(field);
    }
  }
  return present;
}

export function isStudentInfoColumn(header: string): boolean {
  const h = normalizeHeader(header);
  if (!h) return true;
  if (SKIP_COLUMNS.has(h)) return true;
  return isStudentFieldHeader(header);
}

export function resolveSubjectId(name: string, existingSubjects: Subject[]): string {
  const trimmed = name.trim();
  const existing = existingSubjects.find(
    (s) => s.name.trim().toLowerCase() === trimmed.toLowerCase()
  );
  if (existing) return existing.id;
  return trimmed.toLowerCase().replace(/\s+/g, '-');
}

export type SubjectColumn = { name: string; index: number };

/** Keep the first occurrence of each subject column (by header name and resolved subject id). */
export function dedupeSubjectColumns(
  columns: SubjectColumn[],
  existingSubjects: Subject[]
): { columns: SubjectColumn[]; skippedColumns: string[] } {
  const seenHeaders = new Set<string>();
  const seenSubjectIds = new Set<string>();
  const skippedColumns: string[] = [];
  const knownSubjects = [...existingSubjects];

  const kept = columns.filter((column) => {
    const trimmedName = column.name.trim();
    const normalizedHeader = normalizeHeader(trimmedName);
    if (!normalizedHeader) return false;

    const subjectId = resolveSubjectId(trimmedName, knownSubjects);

    if (seenHeaders.has(normalizedHeader) || seenSubjectIds.has(subjectId)) {
      skippedColumns.push(trimmedName || `Column ${column.index + 1}`);
      return false;
    }

    seenHeaders.add(normalizedHeader);
    seenSubjectIds.add(subjectId);
    if (!knownSubjects.some((s) => s.id === subjectId)) {
      knownSubjects.push({ id: subjectId, name: trimmedName, maxScore: 100 });
    }
    return true;
  });

  return { columns: kept, skippedColumns };
}

export interface ParsedSpreadsheetRow {
  rowIdx: number;
  row: any[];
  rn: number;
}

/** Keep the first spreadsheet row for each roll number. */
export function dedupeRowsByRn(
  jsonData: any[][],
  rnIndex: number
): { rows: ParsedSpreadsheetRow[]; skippedRows: number[] } {
  const seenRns = new Set<number>();
  const rows: ParsedSpreadsheetRow[] = [];
  const skippedRows: number[] = [];

  for (let rowIdx = 1; rowIdx < jsonData.length; rowIdx++) {
    const row = jsonData[rowIdx];
    if (!row) continue;

    const rnRaw = row[rnIndex];
    if (rnRaw === null || rnRaw === undefined || rnRaw === '') continue;

    const rn = parseInt(String(rnRaw), 10);
    if (Number.isNaN(rn)) continue;

    if (seenRns.has(rn)) {
      skippedRows.push(rn);
      continue;
    }

    seenRns.add(rn);
    rows.push({ rowIdx, row, rn });
  }

  return { rows, skippedRows };
}

function cellValue(row: any[], index: number): string | number | undefined {
  if (index < 0 || index >= row.length) return undefined;
  const value = row[index];
  if (value === null || value === undefined || value === '') return undefined;
  return value;
}

function normalizeConductValue(value: string | number | undefined): string | undefined {
  const normalized = normalizeStudentFieldValue(value);
  if (normalized === undefined) return undefined;
  const text = String(normalized).trim();
  // Conduct is a behavioural/text field — ignore numeric score-like values.
  if (/^-?\d+(\.\d+)?$/.test(text)) return undefined;
  return text;
}

function studentFieldCellValue(
  row: any[],
  index: number,
  field?: string
): string | number | undefined {
  const raw = cellValue(row, index);
  if (field === 'conduct') return normalizeConductValue(raw);
  return normalizeStudentFieldValue(raw);
}

function buildStudentFieldColumnMap(headers: string[]): Map<string, number> {
  const map = new Map<string, number>();
  for (const field of STUDENT_FIELDS) {
    const index = findFieldColumnIndex(headers, field);
    if (index >= 0) map.set(field, index);
  }
  return map;
}

function extractStudentFields(
  row: any[],
  studentFieldColumns: Map<string, number>,
  presentFields: Set<string>
) {
  const fields: Record<string, string | number | undefined> = {};
  for (const field of presentFields) {
    const index = studentFieldColumns.get(field);
    if (index === undefined) continue;
    fields[field] = studentFieldCellValue(row, index, field);
  }
  return fields;
}

function findExistingStudentByRn(students: Student[], rn: number): Student | undefined {
  return students.find((s) => {
    const sRn = typeof s.rn === 'number' ? s.rn : parseInt(String(s.rn || 0), 10);
    return !Number.isNaN(sRn) && sRn === rn;
  });
}

function applySemesterField(
  student: Student,
  field: SemesterField,
  value: string | number | undefined,
  importSemester: AssessmentSemester,
  clearWhenEmpty: boolean
): Student {
  const semKey = importSemester === '1st' ? 'semester1' : 'semester2';
  const semRecord = { ...(student[semKey] ?? {}) };

  if (value !== undefined) {
    semRecord[field] = field === 'conduct' || field === 'remark' ? String(value) : value;
  } else if (clearWhenEmpty) {
    delete semRecord[field];
  }

  const updated: Student = { ...student, [semKey]: semRecord };

  if (importSemester === '1st') {
    if (value !== undefined) {
      updated[field] = field === 'conduct' || field === 'remark' ? String(value) : value;
    } else if (clearWhenEmpty) {
      delete updated[field];
    }
  }

  return updated;
}

function mergeStudentFields(
  existing: Student,
  fields: Record<string, string | number | undefined>,
  presentFields: Set<string>,
  importSemester: AssessmentSemester
): Student {
  let merged = { ...existing };

  if (presentFields.has('name') && fields.name !== undefined) {
    merged.name = String(fields.name);
  }
  if (presentFields.has('age') && fields.age !== undefined) {
    merged.age = fields.age;
  }
  if (presentFields.has('sex') && fields.sex !== undefined) {
    merged.sex = String(fields.sex);
  }
  if (presentFields.has('village') && fields.village !== undefined) {
    merged.village = String(fields.village);
  }
  if (presentFields.has('kebele') && fields.kebele !== undefined) {
    merged.kebele = String(fields.kebele);
  }

  for (const field of SEMESTER_FIELDS) {
    if (!presentFields.has(field)) continue;
    merged = applySemesterField(merged, field, fields[field], importSemester, true);
  }

  return merged;
}

function createStudentFromFields(
  rn: number,
  fields: Record<string, string | number | undefined>,
  presentFields: Set<string>,
  id: string,
  importSemester: AssessmentSemester
): Student {
  let student: Student = {
    id,
    rn,
    name:
      presentFields.has('name') && fields.name !== undefined
        ? String(fields.name)
        : `Student ${rn}`,
    age: presentFields.has('age') ? fields.age : undefined,
    sex: presentFields.has('sex') && fields.sex !== undefined ? String(fields.sex) : undefined,
    village:
      presentFields.has('village') && fields.village !== undefined
        ? String(fields.village)
        : undefined,
    kebele:
      presentFields.has('kebele') && fields.kebele !== undefined
        ? String(fields.kebele)
        : undefined,
  };

  for (const field of SEMESTER_FIELDS) {
    if (!presentFields.has(field)) continue;
    student = applySemesterField(student, field, fields[field], importSemester, false);
  }

  return student;
}

export interface BulkImportPayload {
  newStudents: Student[];
  updatedStudents: Student[];
  newSubjects: Subject[];
  assessmentUpdates: Assessment[];
  selectSubjectId?: string;
  /** Which scores[] index imported subject scores target (0 = 1st, 1 = 2nd) */
  importScoreIndex?: number;
  skippedDuplicateColumns?: string[];
  skippedDuplicateRows?: number[];
}

export type SpreadsheetImportPurpose = 'subjects' | 'studentInfo' | 'all';

export interface SpreadsheetImportOptions {
  purpose?: SpreadsheetImportPurpose;
  singleSubjectName?: string;
  /** Semester row to write scores and Absent/Conduct/Remark into */
  importSemester?: AssessmentSemester;
}

export interface SpreadsheetImportResult {
  payload: BulkImportPayload;
  error?: string;
  warnings?: string[];
}

/** Unified import: any subset of columns matched by RN. Safe to call repeatedly for partial fills. */
export function processSpreadsheetImport(
  jsonData: any[][],
  existingStudents: Student[],
  existingSubjects: Subject[],
  options: SpreadsheetImportOptions = {}
): SpreadsheetImportResult {
  const purpose = options.purpose ?? 'all';
  const singleSubjectName = options.singleSubjectName;
  const importSemester = options.importSemester ?? '1st';
  const scoreIndex = SCORE_INDEX[importSemester];
  if (jsonData.length < 2) {
    return { payload: emptyBulkPayload(), error: 'File is empty or has no data rows.' };
  }

  const headers = jsonData[0].map((h) => String(h ?? '').trim());
  const rnIndex = findRnColumnIndex(headers);
  if (rnIndex === -1) {
    return {
      payload: emptyBulkPayload(),
      error: 'Could not find RN (Roll Number) column. Include a column named RN or Roll Number.',
    };
  }

  const presentStudentFields = getPresentStudentFields(headers);
  const studentFieldColumns = buildStudentFieldColumnMap(headers);
  const activeStudentFields =
    purpose === 'subjects' ? new Set<string>() : presentStudentFields;

  let subjectColumns = headers
    .map((name, index) => ({ name, index }))
    .filter(({ name, index }) => {
      if (index === rnIndex || !name.trim()) return false;
      return !isStudentInfoColumn(name);
    });

  if (purpose === 'studentInfo') {
    subjectColumns = [];
  }

  if (singleSubjectName?.trim()) {
    if (subjectColumns.length === 0) {
      return {
        payload: emptyBulkPayload(),
        error: 'No score column found in the file for the subject you entered.',
      };
    }
    if (subjectColumns.length === 1) {
      subjectColumns = [{ name: singleSubjectName.trim(), index: subjectColumns[0].index }];
    }
  }

  const { columns: uniqueSubjectColumns, skippedColumns } = dedupeSubjectColumns(
    subjectColumns,
    existingSubjects
  );
  subjectColumns = uniqueSubjectColumns;

  if (purpose === 'subjects' && subjectColumns.length === 0) {
    return {
      payload: emptyBulkPayload(),
      error:
        'No subject score columns found. Add Subject imports only accept numeric score columns (e.g. Amharic, Maths, Science).',
    };
  }

  if (purpose === 'studentInfo' && activeStudentFields.size === 0) {
    return {
      payload: emptyBulkPayload(),
      error:
        'No student information columns found. Use columns like Student Name, Sex, Age, Village, Kebele, Absent, Conduct, or Remark.',
    };
  }

  if (purpose === 'all' && activeStudentFields.size === 0 && subjectColumns.length === 0) {
    return {
      payload: emptyBulkPayload(),
      error:
        'No recognizable columns found. Use column names like RN, Student Name, Sex, Age, Village, Kebele, subject names, Absent, Conduct, or Remark.',
    };
  }

  const newSubjects: Subject[] = [];
  const subjectIdByColumn = new Map<number, string>();

  for (const column of subjectColumns) {
    const subjectId = resolveSubjectId(column.name, [...existingSubjects, ...newSubjects]);
    subjectIdByColumn.set(column.index, subjectId);

    const alreadyExists =
      existingSubjects.some((s) => s.id === subjectId) ||
      newSubjects.some((s) => s.id === subjectId);

    if (!alreadyExists) {
      newSubjects.push({
        id: subjectId,
        name: column.name.trim(),
        maxScore: 100,
      });
    }
  }

  const newStudents: Student[] = [];
  const updatedStudents: Student[] = [];
  const assessmentUpdateMap = new Map<string, Assessment>();
  const rnToStudentId = new Map<number, string>();
  const timestamp = Date.now();
  const allKnownStudents = [...existingStudents];

  const { rows: uniqueRows, skippedRows } = dedupeRowsByRn(jsonData, rnIndex);
  const warnings: string[] = [];

  if (skippedColumns.length > 0) {
    warnings.push(
      `Skipped duplicate column(s): ${[...new Set(skippedColumns)].join(', ')}`
    );
  }
  if (skippedRows.length > 0) {
    warnings.push(
      `Skipped duplicate roll number(s): ${[...new Set(skippedRows)].join(', ')}`
    );
  }

  for (const { row, rn, rowIdx } of uniqueRows) {
    const fields = extractStudentFields(row, studentFieldColumns, activeStudentFields);
    const hasStudentFieldData = Object.values(fields).some((v) => v !== undefined);

    if (!rnToStudentId.has(rn)) {
      let existing = findExistingStudentByRn(allKnownStudents, rn);

      if (!existing && fields.name) {
        existing = allKnownStudents.find(
          (s) => s.name && s.name.toLowerCase() === String(fields.name).toLowerCase()
        );
      }

      if (existing) {
        if (hasStudentFieldData) {
          const merged = mergeStudentFields(existing, fields, activeStudentFields, importSemester);
          updatedStudents.push(merged);
          rnToStudentId.set(rn, merged.id);
          const idx = allKnownStudents.findIndex((s) => s.id === merged.id);
          if (idx >= 0) allKnownStudents[idx] = merged;
        } else {
          rnToStudentId.set(rn, existing.id);
        }
      } else if (hasStudentFieldData || subjectColumns.length === 0) {
        const student = createStudentFromFields(
          rn,
          fields,
          activeStudentFields,
          `student-${rn}-${timestamp}-${rowIdx}`,
          importSemester
        );
        newStudents.push(student);
        rnToStudentId.set(rn, student.id);
        allKnownStudents.push(student);
      }
    } else if (hasStudentFieldData) {
      const studentId = rnToStudentId.get(rn)!;
      const existing = allKnownStudents.find((s) => s.id === studentId);
      if (existing) {
        const merged = mergeStudentFields(existing, fields, activeStudentFields, importSemester);
        if (!updatedStudents.some((s) => s.id === merged.id)) {
          updatedStudents.push(merged);
        }
        const idx = allKnownStudents.findIndex((s) => s.id === merged.id);
        if (idx >= 0) allKnownStudents[idx] = merged;
      }
    }

    let studentId = rnToStudentId.get(rn);

    if (!studentId && subjectColumns.length > 0) {
      const student = createStudentFromFields(
        rn,
        {},
        new Set(),
        `student-${rn}-${timestamp}-${rowIdx}`,
        importSemester
      );
      newStudents.push(student);
      rnToStudentId.set(rn, student.id);
      allKnownStudents.push(student);
      studentId = student.id;
    }

    if (!studentId) continue;

    for (const column of subjectColumns) {
      const subjectId = subjectIdByColumn.get(column.index);
      if (!subjectId) continue;

      const rawScore = row[column.index];
      if (rawScore === null || rawScore === undefined || rawScore === '') continue;

      const scoreValue = parseFloat(String(rawScore));
      if (Number.isNaN(scoreValue)) continue;

      const score = Math.min(Math.max(scoreValue, 0), 100);
      const scores = Array(10).fill(0);
      scores[scoreIndex] = score;
      assessmentUpdateMap.set(`${studentId}:${subjectId}`, {
        studentId,
        subjectId,
        scores,
      });
    }
  }

  const assessmentUpdates = Array.from(assessmentUpdateMap.values());

  if (
    newStudents.length === 0 &&
    updatedStudents.length === 0 &&
    assessmentUpdates.length === 0 &&
    newSubjects.length === 0
  ) {
    return {
      payload: emptyBulkPayload(),
      error: 'No matching rows found. Ensure RN values match existing students or include student data.',
    };
  }

  const firstSubjectId =
    subjectColumns.length > 0
      ? subjectIdByColumn.get(subjectColumns[0].index)
      : undefined;

  return {
    payload: {
      newStudents,
      updatedStudents,
      newSubjects,
      assessmentUpdates,
      selectSubjectId: firstSubjectId,
      importScoreIndex: scoreIndex,
      skippedDuplicateColumns: skippedColumns.length > 0 ? skippedColumns : undefined,
      skippedDuplicateRows: skippedRows.length > 0 ? skippedRows : undefined,
    },
    warnings: warnings.length > 0 ? warnings : undefined,
  };
}

/** @deprecated Use processSpreadsheetImport */
export function processStudentInfoImport(
  jsonData: any[][],
  existingStudents: Student[]
): { payload: BulkImportPayload; error?: string } {
  return processSpreadsheetImport(jsonData, existingStudents, [], { purpose: 'studentInfo' });
}

/** @deprecated Use processSpreadsheetImport */
export function processSubjectImport(
  jsonData: any[][],
  existingStudents: Student[],
  existingSubjects: Subject[],
  singleSubjectName?: string
): { payload: BulkImportPayload; error?: string } {
  return processSpreadsheetImport(jsonData, existingStudents, existingSubjects, {
    purpose: 'subjects',
    singleSubjectName,
  });
}

function emptyBulkPayload(): BulkImportPayload {
  return {
    newStudents: [],
    updatedStudents: [],
    newSubjects: [],
    assessmentUpdates: [],
  };
}

export function sortStudentsByRn(students: Student[]): Student[] {
  return [...students].sort((a, b) => {
    const rnA = typeof a.rn === 'number' ? a.rn : parseInt(String(a.rn || 0), 10);
    const rnB = typeof b.rn === 'number' ? b.rn : parseInt(String(b.rn || 0), 10);
    return (Number.isNaN(rnA) ? 0 : rnA) - (Number.isNaN(rnB) ? 0 : rnB);
  });
}

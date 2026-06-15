import { useState, useRef, useMemo } from 'react';
import { Plus, Trash2, Edit2, Upload, Printer, FileDown, X } from 'lucide-react';
import * as XLSX from 'xlsx';
import { useMarkbook } from '@/context/MarkbookContext';
import { AppHeader } from '@/components/AppHeader';
import { SchoolInfoDialog, SchoolInfoSummary } from '@/components/SchoolInfoDialog';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  processSpreadsheetImport,
  readSpreadsheetFile,
  sortStudentsByRn,
} from '@/utils/excelImport';
import {
  getSemestersToShow,
  getSubjectScoreDisplay,
  resolveImportSemester,
  SCORE_INDEX,
} from '@/utils/semesterScores';
import type { AssessmentSemester, Student, StudentSemesterRecord, SubjectSemesterView } from '@/types/markbook';
import { cn } from '@/lib/utils';

function getSemesterRecord(student: Student, semester: AssessmentSemester): StudentSemesterRecord {
  const key = semester === '1st' ? 'semester1' : 'semester2';
  const record = student[key] ?? {};
  if (semester === '1st') {
    return {
      absent: record.absent ?? student.absent,
      conduct: record.conduct ?? student.conduct,
      remark: record.remark ?? student.remark,
    };
  }
  return record;
}

const SUBJECT_SEMESTER_OPTIONS: { value: SubjectSemesterView; label: string }[] = [
  { value: '1st', label: '1st' },
  { value: '2nd', label: '2nd' },
  { value: 'both', label: 'Both' },
];

const emptyStudentForm = () => ({
  name: '',
  sex: '',
  age: '',
  village: '',
  kebele: '',
  absent: '',
  conduct: '',
  remark: '',
});

export default function Assessments() {
  const { state, dispatch } = useMarkbook();
  const { students, subjects, selectedSubjectId, isSeedData, schoolInfo, subjectSemesterView } = state;
  const { toast } = useToast();

  const sortedStudents = useMemo(() => sortStudentsByRn(students), [students]);
  
  const [isSchoolInfoOpen, setIsSchoolInfoOpen] = useState(false);
  const [newSubjectName, setNewSubjectName] = useState('');
  const [isAddSubjectOpen, setIsAddSubjectOpen] = useState(false);
  const [isAddStudentOpen, setIsAddStudentOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<string | null>(null);
  const [editStudentField, setEditStudentField] = useState<string>('');
  const [editStudentValue, setEditStudentValue] = useState('');
  const [editStudentSemester, setEditStudentSemester] = useState<AssessmentSemester>('1st');
  const [importMode, setImportMode] = useState<'single' | 'multiple'>('single');
  const [studentImportMode, setStudentImportMode] = useState<'single' | 'multiple'>('single');
  const [selectedImportFile, setSelectedImportFile] = useState<File | null>(null);
  const [studentImportFile, setStudentImportFile] = useState<File | null>(null);
  const [newStudent, setNewStudent] = useState(emptyStudentForm());
  const subjectFileInputRef = useRef<HTMLInputElement>(null);
  const studentFileInputRef = useRef<HTMLInputElement>(null);

  const handleAddSubjectExcel = async () => {
    if (!selectedImportFile) {
      toast({
        title: "Please select a file",
        description: "Select an Excel or CSV file to import",
        variant: "destructive",
      });
      return;
    }

    const importSemester = resolveImportSemester(subjectSemesterView);
    if (!importSemester) {
      toast({
        title: "Select a semester",
        description: "Choose 1st or 2nd semester before importing subject scores.",
        variant: "destructive",
      });
      return;
    }

    try {
      const jsonData = await readSpreadsheetFile(selectedImportFile);
      const { payload, error, warnings } = processSpreadsheetImport(
        jsonData,
        isSeedData ? [] : students,
        isSeedData ? [] : subjects,
        {
          purpose: 'subjects',
          singleSubjectName: newSubjectName.trim() || undefined,
          importSemester,
        }
      );

      if (error) {
        toast({
          title: "Import Failed",
          description: error,
          variant: "destructive",
        });
        return;
      }

      dispatch({ type: 'BULK_IMPORT', payload });

      const parts: string[] = [];
      if (payload.newSubjects.length > 0) {
        parts.push(`${payload.newSubjects.length} subject(s) added`);
      }
      if (payload.newStudents.length > 0) {
        parts.push(`${payload.newStudents.length} student(s) added`);
      }
      if (payload.updatedStudents.length > 0) {
        parts.push(`${payload.updatedStudents.length} student(s) updated`);
      }
      if (payload.assessmentUpdates.length > 0) {
        parts.push(`${payload.assessmentUpdates.length} score(s) imported`);
      }

      toast({
        title: "Import Successful",
        description: [parts.join(', ') || 'Data imported successfully.', ...(warnings ?? [])]
          .filter(Boolean)
          .join(' '),
      });

      setNewSubjectName('');
      setSelectedImportFile(null);
      setImportMode('single');
      setIsAddSubjectOpen(false);
    } catch (error) {
      console.error('Import error:', error);
      toast({
        title: "Import Failed",
        description: "Failed to parse the file. Please check the file format.",
        variant: "destructive",
      });
    }
  };

  const handleAddStudent = () => {
    setNewStudent(emptyStudentForm());
    setStudentImportFile(null);
    setStudentImportMode('single');
    setIsAddStudentOpen(true);
  };

  const getNextStudentRn = () => {
    if (students.length === 0) return 1;
    const maxRn = Math.max(
      ...students.map((s) => {
        const rn = typeof s.rn === 'number' ? s.rn : parseInt(String(s.rn || 0), 10);
        return Number.isNaN(rn) ? 0 : rn;
      })
    );
    return maxRn + 1;
  };

  const handleAddSubjectManual = () => {
    const subjectName = newSubjectName.trim();
    if (!subjectName) {
      toast({
        title: "Please enter subject name",
        description: "Subject name is required",
        variant: "destructive",
      });
      return;
    }

    const subjectNameLower = subjectName.toLowerCase();
    const existingSubject = subjects.find(
      (s) => s.name && s.name.toLowerCase() === subjectNameLower
    );

    if (existingSubject) {
      toast({
        title: "Duplicate Subject",
        description: `Subject "${existingSubject.name}" already exists. Please use a different name.`,
        variant: "destructive",
      });
      return;
    }

    const subjectId = `${subjectNameLower.replace(/\s+/g, '-')}-${Date.now()}`;
    dispatch({
      type: 'ADD_SUBJECT',
      payload: {
        id: subjectId,
        name: subjectName,
        maxScore: 100,
      },
    });
    dispatch({ type: 'SET_SELECTED_SUBJECT', payload: subjectId });

    toast({
      title: "Subject Added",
      description: `Subject "${subjectName}" has been added successfully.`,
    });

    setNewSubjectName('');
    setSelectedImportFile(null);
    setImportMode('single');
    setIsAddSubjectOpen(false);
  };

  const handleAddStudentManual = () => {
    if (!newStudent.name.trim()) {
      toast({
        title: "Please enter student name",
        description: "Student name is required",
        variant: "destructive",
      });
      return;
    }

    dispatch({
      type: 'ADD_STUDENT',
      payload: {
        id: `student-${Date.now()}`,
        name: newStudent.name.trim(),
        rn: getNextStudentRn(),
        sex: newStudent.sex || '',
        age: newStudent.age || '',
        village: newStudent.village || '',
        kebele: newStudent.kebele || '',
        absent: newStudent.absent || '',
        conduct: newStudent.conduct || '',
        remark: newStudent.remark || '',
      },
    });

    toast({
      title: "Student Added",
      description: `Student "${newStudent.name}" has been added successfully.`,
    });

    setNewStudent(emptyStudentForm());
    setIsAddStudentOpen(false);
  };

  const handleAddStudentExcel = async () => {
    if (!studentImportFile) {
      toast({
        title: "Please select a file",
        description: "Select an Excel or CSV file to import",
        variant: "destructive",
      });
      return;
    }

    const importSemester = resolveImportSemester(subjectSemesterView);
    if (!importSemester) {
      toast({
        title: "Select a semester",
        description: "Choose 1st or 2nd semester before importing student info.",
        variant: "destructive",
      });
      return;
    }

    try {
      const jsonData = await readSpreadsheetFile(studentImportFile);
      const { payload, error, warnings } = processSpreadsheetImport(
        jsonData,
        isSeedData ? [] : students,
        isSeedData ? [] : subjects,
        { purpose: 'studentInfo', importSemester }
      );

      if (error) {
        toast({
          title: "Import Failed",
          description: error,
          variant: "destructive",
        });
        return;
      }

      dispatch({ type: 'BULK_IMPORT', payload });

      const parts: string[] = [];
      if (payload.newStudents.length > 0) parts.push(`${payload.newStudents.length} student(s) added`);
      if (payload.updatedStudents.length > 0) parts.push(`${payload.updatedStudents.length} student(s) updated`);
      if (payload.newSubjects.length > 0) parts.push(`${payload.newSubjects.length} subject(s) added`);
      if (payload.assessmentUpdates.length > 0) parts.push(`${payload.assessmentUpdates.length} score(s) imported`);

      toast({
        title: "Students Imported",
        description: [parts.join(', ') || 'Data imported successfully.', ...(warnings ?? [])]
          .filter(Boolean)
          .join(' '),
      });

      setStudentImportFile(null);
      setIsAddStudentOpen(false);
    } catch (error) {
      console.error('Import error:', error);
      toast({
        title: "Import Failed",
        description: "An error occurred while importing the file. Please check the file format.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteStudent = (studentId: string) => {
    dispatch({ type: 'DELETE_STUDENT', payload: studentId });
  };

  const semestersToShow = getSemestersToShow(subjectSemesterView);
  const showBothSemesters = subjectSemesterView === 'both';

  const handleStartEditStudent = (
    studentId: string,
    field: string,
    currentValue: unknown,
    semester: AssessmentSemester = '1st'
  ) => {
    setEditingStudent(studentId);
    setEditStudentField(field);
    setEditStudentSemester(semester);
    setEditStudentValue(String(currentValue || ''));
  };

  const handleSaveStudentField = (studentId: string) => {
    if (editStudentField.startsWith('subject-')) {
      const subjectId = editStudentField.replace('subject-', '');
      const score = parseFloat(editStudentValue) || 0;
      const scoreIndex = SCORE_INDEX[editStudentSemester];
      const existing = state.assessments.find(
        (a) => a.studentId === studentId && a.subjectId === subjectId
      );
      const scores = existing?.scores ? [...existing.scores] : Array(10).fill(0);
      scores[scoreIndex] = Math.min(Math.max(score, 0), 100);
      dispatch({
        type: 'UPDATE_ASSESSMENT',
        payload: { studentId, subjectId, scores },
      });
    } else if (['absent', 'conduct', 'remark'].includes(editStudentField)) {
      const student = students.find((s) => s.id === studentId);
      if (student) {
        const semKey = editStudentSemester === '1st' ? 'semester1' : 'semester2';
        const updated: Student = {
          ...student,
          [semKey]: {
            ...(student[semKey] ?? {}),
            [editStudentField]: editStudentValue,
          },
        };
        if (editStudentSemester === '1st') {
          updated[editStudentField as 'absent' | 'conduct' | 'remark'] = editStudentValue;
        }
        dispatch({ type: 'UPDATE_STUDENT', payload: updated });
      }
    } else {
      const student = students.find((s) => s.id === studentId);
      if (student) {
        dispatch({
          type: 'UPDATE_STUDENT',
          payload: { ...student, [editStudentField]: editStudentValue },
        });
      }
    }
    setEditingStudent(null);
  };

  const handleExportExcel = () => {
    const exportSemesters = getSemestersToShow(subjectSemesterView);
    const headerRow = [
      'RN',
      'Student Name',
      'Sex',
      'Age',
      'Village',
      'Kebele',
      ...(showBothSemesters ? ['Semester'] : []),
      ...subjects.map((s) => s.name),
      'Absent',
      'Conduct',
      'Remark',
    ];

    const ws_data = sortedStudents.flatMap((student) =>
      exportSemesters.map((semester) => {
        const semRecord = getSemesterRecord(student, semester);
        const subjectScores = subjects.map((subject) => {
          const score = getSubjectScoreDisplay(state.assessments, student.id, subject.id, semester);
          return score !== '' ? score : '';
        });

        return [
          student.rn,
          student.name,
          student.sex || '',
          student.age || '',
          student.village || '',
          student.kebele || '',
          ...(showBothSemesters ? [semester] : []),
          ...subjectScores,
          semRecord.absent ?? '',
          semRecord.conduct || '',
          semRecord.remark || '',
        ];
      })
    );

    const ws = XLSX.utils.aoa_to_sheet([headerRow, ...ws_data]);

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Students");
    XLSX.writeFile(wb, `assessments_${Date.now()}.xlsx`);

    toast({
      title: "Export Successful",
      description: "Data exported to Excel successfully.",
    });
  };

  const handlePrint = () => {
    window.print();
    toast({
      title: "Print",
      description: "Opening print dialog...",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <AppHeader />

      <div className="p-6 space-y-6">
        {/* Page Title */}
        <h2 className="text-2xl font-semibold text-primary">Continues Assessments</h2>

        {/* School Info */}
        <SchoolInfoSummary onEdit={() => setIsSchoolInfoOpen(true)} />
        <SchoolInfoDialog open={isSchoolInfoOpen} onOpenChange={setIsSchoolInfoOpen} />

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3">
          <Button 
            onClick={handleAddStudent}
            className="bg-cyan-500 hover:bg-cyan-600 text-white gap-2"
          >
            <Plus className="w-4 h-4" />
            Add student info
          </Button>
          <Button 
            onClick={() => {
              setNewSubjectName('');
              setSelectedImportFile(null);
              setImportMode('single');
              setIsAddSubjectOpen(true);
            }}
            className="bg-cyan-500 hover:bg-cyan-600 text-white gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Subject
          </Button>
          <Button 
            onClick={handleExportExcel}
            className="bg-yellow-500 hover:bg-yellow-600 text-white gap-2"
          >
            <FileDown className="w-4 h-4" />
            Export Excel
          </Button>
          <Button 
            className="bg-yellow-500 hover:bg-yellow-600 text-white gap-2"
          >
            <FileDown className="w-4 h-4" />
            Export Word
          </Button>
          <Button 
            onClick={handlePrint}
            className="bg-yellow-500 hover:bg-yellow-600 text-white gap-2"
          >
            <Printer className="w-4 h-4" />
            Print
          </Button>
        </div>

        {/* Display, Subject Filters, and Subject Semester Buttons */}
        <div className="flex flex-wrap items-center gap-6">
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium">Subject Semester:</span>
            <div className="inline-flex rounded-md border border-gray-300 dark:border-slate-600 overflow-hidden">
              {SUBJECT_SEMESTER_OPTIONS.map(({ value, label }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() =>
                    dispatch({ type: 'SET_SUBJECT_SEMESTER_VIEW', payload: value })
                  }
                  className={cn(
                    'px-4 py-1.5 text-sm font-medium transition-colors',
                    subjectSemesterView === value
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 dark:bg-slate-700 hover:bg-gray-300 dark:hover:bg-slate-600'
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-sm font-medium">Display:</span>
            <Select>
              <SelectTrigger className="w-40">
                <SelectValue defaultValue="Total(100%)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="total">Total(100%)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-sm font-medium">Subject:</span>
            <Select value={selectedSubjectId || ''} onValueChange={(value) => {
              dispatch({ type: 'SET_SELECTED_SUBJECT', payload: value });
            }}>
              <SelectTrigger className="w-40 bg-gray-200 dark:bg-slate-700 dark:text-slate-100">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {subjects.map(subject => (
                  <SelectItem key={subject.id} value={subject.id}>
                    {subject.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Subjects Section - Only display if subjects exist */}
        {subjects.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-primary">
              Subjects ({subjects.length})
            </h3>
            <div className="flex flex-wrap gap-2">
              {subjects.map(subject => (
                <div key={subject.id} className="group flex items-center gap-2 px-3 py-1 bg-gray-100 dark:bg-slate-700 rounded border border-gray-300 dark:border-slate-600 cursor-pointer transition-colors">
                  <span className="text-sm">{subject.name}</span>
                  <button
                    onClick={() => {
                      toast({
                        title: "Edit",
                        description: `Edit subject: ${subject.name}`,
                      });
                    }}
                    className="p-1 hidden group-hover:inline hover:bg-yellow-300 rounded transition-colors"
                    title="Edit subject"
                  >
                    <Edit2 className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => {
                      dispatch({
                        type: 'DELETE_SUBJECT',
                        payload: subject.id,
                      });
                      toast({
                        title: "Subject Deleted",
                        description: `Subject "${subject.name}" has been deleted.`,
                      });
                    }}
                    className="p-1 hidden group-hover:inline hover:bg-red-300 rounded transition-colors"
                    title="Delete subject"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Add Subject Dialog */}
        <Dialog open={isAddSubjectOpen} onOpenChange={(open) => {
          setIsAddSubjectOpen(open);
          if (!open) {
            setNewSubjectName('');
            setSelectedImportFile(null);
            setImportMode('single');
          }
        }}>
          <DialogContent className="bg-card max-w-2xl">
            <DialogHeader className="flex flex-row items-center justify-between pr-2">
              <DialogTitle>Add Subject</DialogTitle>
              <button
                type="button"
                onClick={() => {
                  setIsAddSubjectOpen(false);
                  setNewSubjectName('');
                  setSelectedImportFile(null);
                  setImportMode('single');
                }}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            </DialogHeader>

            <Tabs value={importMode} onValueChange={(value) => setImportMode(value as 'single' | 'multiple')} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="single">Manual Entry</TabsTrigger>
                <TabsTrigger value="multiple">Import Excel/CSV</TabsTrigger>
              </TabsList>

              {/* Tab 1: Manual Entry */}
              <TabsContent value="single" className="space-y-4 mt-4">
                <div>
                  <label className="text-sm font-semibold text-foreground block mb-2">
                    Subject Name *
                  </label>
                  <Input
                    placeholder="e.g., Amharic, Maths, Science"
                    value={newSubjectName}
                    onChange={(e) => setNewSubjectName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleAddSubjectManual();
                    }}
                    className="bg-background"
                  />
                  <p className="text-xs text-muted-foreground mt-2">
                    Enter a subject name to add it to the markbook. Each subject gets a score column for every student.
                  </p>
                </div>

                <Button 
                  type="button"
                  onClick={handleAddSubjectManual}
                  className="w-full bg-cyan-500 hover:bg-cyan-600 text-white gap-2"
                >
                  Add Subject
                </Button>
              </TabsContent>

              {/* Tab 2: Excel/CSV Import */}
              <TabsContent value="multiple" className="space-y-4 mt-4">
                <div>
                  <label className="text-sm font-semibold text-foreground block mb-2">
                    Subject Name (optional)
                  </label>
                  <Input
                    placeholder="Leave blank to use subject names from file columns"
                    value={newSubjectName}
                    onChange={(e) => setNewSubjectName(e.target.value)}
                    className="bg-background"
                  />
                </div>

                <p className="text-sm text-muted-foreground bg-muted p-3 rounded">
                  Import subject score columns only — RN is required. Score cells must be numbers (0–100).
                  <br />Student info columns (Name, Sex, Conduct, etc.) are ignored in this import.
                  <br />Example: [RN | siltigna | amharic | english | maths | science | art | behavior | hpe]
                </p>

                {selectedImportFile && (
                  <div className="bg-muted p-3 rounded flex items-center justify-between">
                    <span className="text-sm font-medium">{selectedImportFile.name}</span>
                    <button
                      onClick={() => setSelectedImportFile(null)}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}

                <input
                  ref={subjectFileInputRef}
                  type="file"
                  accept=".xlsx,.xls,.csv"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setSelectedImportFile(file);
                    }
                  }}
                  className="hidden"
                />

                <Button 
                  onClick={() => {
                    if (!selectedImportFile) {
                      subjectFileInputRef.current?.click();
                      return;
                    }
                    handleAddSubjectExcel();
                  }}
                  className="w-full bg-cyan-500 hover:bg-cyan-600 text-white gap-2"
                >
                  <Upload className="w-4 h-4" />
                  {selectedImportFile ? 'Import Excel/CSV' : 'Select & Import Excel/CSV'}
                </Button>
              </TabsContent>
            </Tabs>
          </DialogContent>
        </Dialog>

        {/* Add Student Dialog */}
        <Dialog open={isAddStudentOpen} onOpenChange={(open) => {
          setIsAddStudentOpen(open);
          if (!open) {
            setNewStudent(emptyStudentForm());
            setStudentImportFile(null);
            setStudentImportMode('single');
          }
        }}>
          <DialogContent className="bg-card max-w-2xl">
            <DialogHeader className="flex flex-row items-center justify-between pr-2">
              <DialogTitle>Add Student Information</DialogTitle>
              <button
                type="button"
                onClick={() => {
                  setIsAddStudentOpen(false);
                  setNewStudent(emptyStudentForm());
                  setStudentImportFile(null);
                  setStudentImportMode('single');
                }}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            </DialogHeader>

            <Tabs value={studentImportMode} onValueChange={(value) => setStudentImportMode(value as 'single' | 'multiple')} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="single">Manual Entry</TabsTrigger>
                <TabsTrigger value="multiple">Import Excel/CSV</TabsTrigger>
              </TabsList>

              {/* Tab 1: Manual Entry */}
              <TabsContent value="single" className="space-y-4 mt-4">
                <div>
                  <label className="text-sm font-semibold text-foreground block mb-2">
                    Student Name *
                  </label>
                  <Input
                    placeholder="e.g., Abebe Kebede"
                    value={newStudent.name}
                    onChange={(e) => setNewStudent({ ...newStudent, name: e.target.value })}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleAddStudentManual();
                    }}
                    className="bg-background"
                  />
                  <p className="text-xs text-muted-foreground mt-2">
                    Enter a student name to add a row. Sex, Age, Village, Kebele, Absent, Conduct, and Remark can be filled in later using the edit button on each row.
                  </p>
                </div>

                <Button 
                  type="button"
                  onClick={handleAddStudentManual}
                  className="w-full bg-cyan-500 hover:bg-cyan-600 text-white gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add Student
                </Button>
              </TabsContent>

              {/* Tab 2: Excel/CSV Import */}
              <TabsContent value="multiple" className="space-y-4 mt-4">
                <p className="text-sm text-muted-foreground bg-muted p-3 rounded">
                  Import student information columns only — RN is required. Cells can be text or numbers.
                  <br />Subject score columns are ignored in this import. Use Add Subject for scores.
                  <br />Example: [RN | Student Name | Sex | Age | Village | Kebele | Absent | Conduct | Remark]
                </p>

                {studentImportFile && (
                  <div className="bg-muted p-3 rounded flex items-center justify-between">
                    <span className="text-sm font-medium">{studentImportFile.name}</span>
                    <button
                      onClick={() => setStudentImportFile(null)}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}

                <input
                  ref={studentFileInputRef}
                  type="file"
                  accept=".xlsx,.xls,.csv"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setStudentImportFile(file);
                    }
                  }}
                  className="hidden"
                />

                <Button 
                  onClick={() => {
                    if (!studentImportFile) {
                      studentFileInputRef.current?.click();
                      return;
                    }
                    handleAddStudentExcel();
                  }}
                  className="w-full bg-cyan-500 hover:bg-cyan-600 text-white gap-2"
                >
                  <Upload className="w-4 h-4" />
                  {studentImportFile ? 'Import Students' : 'Select & Import Students'}
                </Button>
              </TabsContent>
            </Tabs>
          </DialogContent>
        </Dialog>

        {/* Students Table */}
        <div className="overflow-x-auto border dark:border-slate-700 rounded-lg">
          <table className="w-full">
            <thead className="bg-blue-600 dark:bg-blue-800 text-white">
              <tr>
                <th className="px-4 py-3 text-left font-semibold">RN</th>
                <th className="px-4 py-3 text-left font-semibold">Student Name</th>
                <th className="px-4 py-3 text-left font-semibold">Sex</th>
                <th className="px-4 py-3 text-left font-semibold">Age</th>
                <th className="px-4 py-3 text-left font-semibold">Village</th>
                <th className="px-4 py-3 text-left font-semibold">Kebele</th>
                {showBothSemesters && (
                  <th className="px-2 py-3 text-center font-semibold text-xs w-12">Sem</th>
                )}
                {subjects.map(subject => (
                  <th key={subject.id} className="px-4 py-3 text-left font-semibold text-xs">{subject.name}</th>
                ))}
                <th className="px-4 py-3 text-left font-semibold">Absent</th>
                <th className="px-4 py-3 text-left font-semibold">Conduct</th>
                <th className="px-4 py-3 text-left font-semibold">Remark</th>
                <th className="px-4 py-3 text-left font-semibold">Action</th>
              </tr>
            </thead>
            <tbody>
              {sortedStudents.map((student) =>
                semestersToShow.map((semester, semIndex) => {
                  const isFirstSemRow = semIndex === 0;
                  const isLastSemRow = semIndex === semestersToShow.length - 1;
                  const semRecord = getSemesterRecord(student, semester);
                  const rowBorderClass = [
                    isFirstSemRow ? 'border-t dark:border-slate-700' : '',
                    showBothSemesters && !isLastSemRow
                      ? 'border-b-2 border-gray-400 dark:border-slate-500'
                      : '',
                  ]
                    .filter(Boolean)
                    .join(' ');

                  return (
                    <tr
                      key={`${student.id}-${semester}`}
                      className={`${rowBorderClass} hover:bg-gray-50 dark:hover:bg-slate-800`}
                    >
                      {isFirstSemRow && (
                        <>
                          <td
                            className="px-4 py-3 font-medium align-top"
                            rowSpan={semestersToShow.length}
                          >
                            {student.rn}
                          </td>
                          <td className="px-4 py-3 text-left align-top" rowSpan={semestersToShow.length}>
                            {editingStudent === student.id && editStudentField === 'name' ? (
                              <input
                                type="text"
                                value={editStudentValue}
                                onChange={(e) => setEditStudentValue(e.target.value)}
                                onBlur={() => handleSaveStudentField(student.id)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') handleSaveStudentField(student.id);
                                  if (e.key === 'Escape') setEditingStudent(null);
                                }}
                                className="w-full px-2 py-1 border dark:border-slate-600 rounded outline-none bg-white dark:bg-slate-700 dark:text-slate-100"
                                autoFocus
                              />
                            ) : (
                              <span
                                onDoubleClick={() =>
                                  handleStartEditStudent(student.id, 'name', student.name)
                                }
                                className="cursor-pointer hover:text-blue-600 dark:hover:text-blue-400"
                              >
                                {student.name || '-'}
                              </span>
                            )}
                          </td>
                          {(['sex', 'age', 'village', 'kebele'] as const).map((field) => (
                            <td
                              key={field}
                              className="px-4 py-3 text-left align-top"
                              rowSpan={semestersToShow.length}
                            >
                              {editingStudent === student.id && editStudentField === field ? (
                                <input
                                  type="text"
                                  value={editStudentValue}
                                  onChange={(e) => setEditStudentValue(e.target.value)}
                                  onBlur={() => handleSaveStudentField(student.id)}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') handleSaveStudentField(student.id);
                                    if (e.key === 'Escape') setEditingStudent(null);
                                  }}
                                  className="w-full px-2 py-1 border dark:border-slate-600 rounded outline-none bg-white dark:bg-slate-700 dark:text-slate-100"
                                  autoFocus
                                />
                              ) : (
                                <span
                                  onDoubleClick={() =>
                                    handleStartEditStudent(student.id, field, student[field])
                                  }
                                  className="cursor-pointer hover:text-blue-600 dark:hover:text-blue-400"
                                >
                                  {student[field] || '-'}
                                </span>
                              )}
                            </td>
                          ))}
                        </>
                      )}

                      {showBothSemesters && (
                        <td className="px-2 py-2 text-center text-xs font-medium text-muted-foreground">
                          {semester}
                        </td>
                      )}

                      {subjects.map((subject) => {
                        const score = getSubjectScoreDisplay(
                          state.assessments,
                          student.id,
                          subject.id,
                          semester
                        );
                        const isEditing =
                          editingStudent === student.id &&
                          editStudentField === `subject-${subject.id}` &&
                          editStudentSemester === semester;

                        return (
                          <td key={`${student.id}-${subject.id}-${semester}`} className="px-4 py-2 text-center">
                            {isEditing ? (
                              <input
                                type="number"
                                min="0"
                                max="100"
                                value={editStudentValue}
                                onChange={(e) => setEditStudentValue(e.target.value)}
                                onBlur={() => handleSaveStudentField(student.id)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') handleSaveStudentField(student.id);
                                  if (e.key === 'Escape') setEditingStudent(null);
                                }}
                                className="w-full px-2 py-1 border dark:border-slate-600 rounded outline-none text-center bg-white dark:bg-slate-700 dark:text-slate-100"
                                autoFocus
                              />
                            ) : (
                              <span
                                onDoubleClick={() =>
                                  handleStartEditStudent(
                                    student.id,
                                    `subject-${subject.id}`,
                                    score ? String(score) : '',
                                    semester
                                  )
                                }
                                className="cursor-pointer hover:text-blue-600 dark:hover:text-blue-400"
                              >
                                {score !== '' ? score : '-'}
                              </span>
                            )}
                          </td>
                        );
                      })}

                      {(['absent', 'conduct', 'remark'] as const).map((field) => {
                        const value = semRecord[field];
                        const isEditing =
                          editingStudent === student.id &&
                          editStudentField === field &&
                          editStudentSemester === semester;

                        return (
                          <td key={`${student.id}-${field}-${semester}`} className="px-4 py-2 text-left">
                            {isEditing ? (
                              <input
                                type="text"
                                value={editStudentValue}
                                onChange={(e) => setEditStudentValue(e.target.value)}
                                onBlur={() => handleSaveStudentField(student.id)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') handleSaveStudentField(student.id);
                                  if (e.key === 'Escape') setEditingStudent(null);
                                }}
                                className="w-full px-2 py-1 border dark:border-slate-600 rounded outline-none bg-white dark:bg-slate-700 dark:text-slate-100"
                                autoFocus
                              />
                            ) : (
                              <span
                                onDoubleClick={() =>
                                  handleStartEditStudent(
                                    student.id,
                                    field,
                                    value || '',
                                    semester
                                  )
                                }
                                className="cursor-pointer hover:text-blue-600 dark:hover:text-blue-400"
                              >
                                {value || '-'}
                              </span>
                            )}
                          </td>
                        );
                      })}

                      {isFirstSemRow && (
                        <td
                          className="px-4 py-3 whitespace-nowrap align-top"
                          rowSpan={semestersToShow.length}
                        >
                          <div className="flex gap-2 justify-center">
                            <button
                              onClick={() =>
                                handleStartEditStudent(student.id, 'name', student.name)
                              }
                              className="px-3 py-1 bg-yellow-400 hover:bg-yellow-500 text-black rounded font-medium flex items-center gap-1"
                            >
                              <Edit2 className="w-3 h-3" />
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteStudent(student.id)}
                              className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded font-medium flex items-center gap-1"
                            >
                              <Trash2 className="w-3 h-3" />
                              Delete
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

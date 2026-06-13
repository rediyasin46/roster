import { useState, useRef } from 'react';
import { Plus, Trash2, Edit2, Upload, Printer, FileDown, X } from 'lucide-react';
import * as XLSX from 'xlsx';
import { useMarkbook } from '@/context/MarkbookContext';
import { Navigation } from '@/components/Navigation';
import { ActionButtons } from '@/components/ActionButtons';
import { EditableCell } from '@/components/EditableCell';
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
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function Assessments() {
  const { state, dispatch } = useMarkbook();
  const { schoolInfo, students, subjects, selectedSubjectId } = state;
  const { toast } = useToast();
  
  const [editingSchoolField, setEditingSchoolField] = useState<string | null>(null);
  const [editingSchoolValue, setEditingSchoolValue] = useState('');
  const [newSubjectName, setNewSubjectName] = useState('');
  const [isAddSubjectOpen, setIsAddSubjectOpen] = useState(false);
  const [isAddStudentOpen, setIsAddStudentOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<string | null>(null);
  const [editStudentField, setEditStudentField] = useState<string>('');
  const [editStudentValue, setEditStudentValue] = useState('');
  const [importMode, setImportMode] = useState<'single' | 'multiple'>('single');
  const [studentImportMode, setStudentImportMode] = useState<'single' | 'multiple'>('single');
  const [selectedImportFile, setSelectedImportFile] = useState<File | null>(null);
  const [studentImportFile, setStudentImportFile] = useState<File | null>(null);
  const [newStudent, setNewStudent] = useState({
    name: '',
    sex: '',
    age: '',
    village: '',
    kebele: '',
    absent: '',
    conduct: '',
    remark: '',
  });
  const subjectFileInputRef = useRef<HTMLInputElement>(null);
  const studentFileInputRef = useRef<HTMLInputElement>(null);

  const handleSchoolInfoEdit = (field: string, currentValue: string) => {
    setEditingSchoolField(field);
    setEditingSchoolValue(currentValue);
  };

  const handleSchoolInfoSave = (field: string) => {
    dispatch({
      type: 'SET_SCHOOL_INFO',
      payload: { [field]: editingSchoolValue },
    });
    setEditingSchoolField(null);
  };

  const handleSubjectFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !newSubjectName.trim()) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = new Uint8Array(event.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];

        if (jsonData.length < 2) {
          toast({
            title: "Import Failed",
            description: "File is empty or has no data rows.",
            variant: "destructive",
          });
          return;
        }

        // Create new subject
        const subjectId = newSubjectName.toLowerCase().replace(/\s+/g, '-') + '-' + Date.now();
        
        dispatch({
          type: 'ADD_SUBJECT',
          payload: {
            id: subjectId,
            name: newSubjectName.trim(),
            maxScore: 100,
          },
        });

        dispatch({ type: 'SET_SELECTED_SUBJECT', payload: subjectId });

        toast({
          title: "Subject Added",
          description: `Subject "${newSubjectName}" has been added successfully.`,
        });

        setNewSubjectName('');
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
    reader.readAsArrayBuffer(file);
    e.target.value = '';
  };

  const handleAddStudent = () => {
    setIsAddStudentOpen(true);
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

    const newRn = students.length + 1;
    dispatch({
      type: 'ADD_STUDENT',
      payload: {
        id: `student-${Date.now()}`,
        name: newStudent.name.trim(),
        rn: newRn,
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

    setNewStudent({
      name: '',
      sex: '',
      age: '',
      village: '',
      kebele: '',
      absent: '',
      conduct: '',
      remark: '',
    });
    setIsAddStudentOpen(false);
  };

  const handleAddStudentExcel = () => {
    if (!studentImportFile) {
      toast({
        title: "Please select a file",
        description: "Select an Excel or CSV file to import",
        variant: "destructive",
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = new Uint8Array(event.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];

        if (jsonData.length < 2) {
          toast({
            title: "Import Failed",
            description: "File is empty or has no data rows.",
            variant: "destructive",
          });
          return;
        }

        // Parse headers - find RN column FIRST
        const headers = jsonData[0].map((h: any) => String(h || '').trim());
        const rnIndex = headers.findIndex(h => h.toLowerCase().includes('rn') || h.toLowerCase().includes('roll'));
        
        if (rnIndex === -1) {
          toast({
            title: "Import Failed",
            description: "Could not find RN (Roll Number) column. First column should be RN.",
            variant: "destructive",
          });
          return;
        }

        // Build student info columns map
        const studentInfoColumns = new Set([
          'name', 'student name', 'full name', 
          'age', 
          'sex', 'gender', 
          'village', 
          'kebele', 
          'absent', 'absences',
          'conduct', 
          'remark', 'remarks',
          'year', 'class', 'grade', 'section',
          'action', 'edit', 'delete'
        ]);

        const studentInfoColMap = new Map<string, number>();
        headers.forEach((h, i) => {
          const lowerH = h.toLowerCase();
          if (studentInfoColumns.has(lowerH)) {
            studentInfoColMap.set(lowerH, i);
          }
        });

        // Get max RN from existing students to enforce class size limit
        const maxExistingRN = students.length > 0 
          ? Math.max(...students.map(s => {
              const rn = typeof s.rn === 'number' ? s.rn : parseInt(String(s.rn || 0));
              return isNaN(rn) ? 0 : rn;
            }))
          : 0;
        
        // Build set of existing RNs
        const existingRNs = new Set(students
          .map(s => {
            const rn = typeof s.rn === 'number' ? s.rn : parseInt(String(s.rn || 0));
            return isNaN(rn) ? undefined : rn;
          })
          .filter((rn): rn is number => rn !== undefined && rn !== null)
        );
        
        console.log('Existing RN values in state:', Array.from(existingRNs).sort((a, b) => a - b).slice(0, 10));
        console.log('Max existing RN:', maxExistingRN);
        console.log('Total existing students:', students.length);

        // Import students with proper RN matching
        const studentsToAdd = [];
        const studentsToUpdate = [];
        const missingColumns: string[] = [];
        
        // Track which important columns are missing
        if (studentInfoColMap.size === 0) missingColumns.push('Student Info');

        // Check if we have any data columns at all
        if (jsonData[0].length === 0) {
          toast({
            title: "Import Failed",
            description: "Could not identify any valid data columns in the Excel file.",
            variant: "destructive",
          });
          return;
        }

        for (let i = 1; i < jsonData.length; i++) {
          const row = jsonData[i];
          const rnValue = row[rnIndex];
          
          if (!rnValue && rnValue !== 0) continue;

          const rn = parseInt(String(rnValue));
          if (isNaN(rn)) continue;
          
          // Enforce RN limit: if students already exist, don't create new RN beyond max
          if (students.length > 0 && rn > maxExistingRN && !existingRNs.has(rn)) {
            console.log(`Skipping RN ${rn} - exceeds existing student limit (max: ${maxExistingRN})`);
            continue;
          }

          // Extract student info
          const name = row[studentInfoColMap.get('name') ?? studentInfoColMap.get('student name') ?? studentInfoColMap.get('full name') ?? -1] || undefined;
          const age = row[studentInfoColMap.get('age') ?? -1] || undefined;
          const sex = row[studentInfoColMap.get('sex') ?? studentInfoColMap.get('gender') ?? -1] || undefined;
          const village = row[studentInfoColMap.get('village') ?? -1] || undefined;
          const kebele = row[studentInfoColMap.get('kebele') ?? -1] || undefined;
          const absent = row[studentInfoColMap.get('absent') ?? studentInfoColMap.get('absences') ?? -1] || undefined;
          const conduct = row[studentInfoColMap.get('conduct') ?? -1] || undefined;
          const remark = row[studentInfoColMap.get('remark') ?? studentInfoColMap.get('remarks') ?? -1] || undefined;

          // Try to find existing student by RN
          let existingStudent = students.find(s => {
            const sRN = typeof s.rn === 'number' ? s.rn : parseInt(String(s.rn || 0));
            return !isNaN(sRN) && sRN === rn;
          });
          
          // Fallback: search by name if RN match fails
          if (!existingStudent && name) {
            existingStudent = students.find(s => 
              s.name && String(s.name).toLowerCase() === String(name).toLowerCase()
            );
          }

          if (existingStudent) {
            // Update existing student
            studentsToUpdate.push({
              ...existingStudent,
              name: name || existingStudent.name,
              age: age !== undefined ? age : existingStudent.age,
              sex: sex || existingStudent.sex,
              village: village || existingStudent.village,
              kebele: kebele || existingStudent.kebele,
              absent: absent !== undefined ? absent : existingStudent.absent,
              conduct: conduct || existingStudent.conduct,
              remark: remark || existingStudent.remark,
            });
            console.log(`Updating student RN ${rn} (ID: ${existingStudent.id})`);
          } else {
            // Create new student only if it truly doesn't exist
            studentsToAdd.push({
              id: `student-${rn}-${Date.now()}-${i}`,
              name: name || `-`,
              rn: rn,
              age: age,
              sex: sex,
              village: village,
              kebele: kebele,
              absent: absent,
              conduct: conduct,
              remark: remark,
            });
            console.log(`Creating new student RN ${rn}`);
          }
        }

        if (studentsToAdd.length === 0 && studentsToUpdate.length === 0) {
          toast({
            title: "Import Failed",
            description: "No valid students found in the file or all students already exist.",
            variant: "destructive",
          });
          setStudentImportFile(null);
          return;
        }

        // Dispatch updates first
        studentsToUpdate.forEach(student => {
          dispatch({
            type: 'UPDATE_STUDENT',
            payload: student,
          });
        });

        // Then dispatch new students
        studentsToAdd.forEach(student => {
          dispatch({
            type: 'ADD_STUDENT',
            payload: student,
          });
        });

        // Show success message
        let description = `${studentsToAdd.length + studentsToUpdate.length} student(s) processed successfully.`;
        if (studentsToUpdate.length > 0) {
          description += ` ${studentsToUpdate.length} updated, ${studentsToAdd.length} added.`;
        }

        toast({
          title: "Students Imported",
          description: description,
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
    reader.readAsArrayBuffer(studentImportFile);
  };

  const handleDeleteStudent = (studentId: string) => {
    dispatch({ type: 'DELETE_STUDENT', payload: studentId });
  };

  const handleStartEditStudent = (studentId: string, field: string, currentValue: any) => {
    setEditingStudent(studentId);
    setEditStudentField(field);
    setEditStudentValue(String(currentValue || ''));
  };

  const handleSaveStudentField = (studentId: string) => {
    // Handle subject score fields
    if (editStudentField.startsWith('subject-')) {
      const subjectId = editStudentField.replace('subject-', '');
      const score = parseFloat(editStudentValue) || 0;
      dispatch({
        type: 'UPDATE_ASSESSMENT',
        payload: {
          studentId: studentId,
          subjectId: subjectId,
          scores: Array(10).fill(0).map((_, i) => i === 0 ? Math.min(Math.max(score, 0), 100) : 0),
        },
      });
    } else {
      // Handle regular student fields
      const student = students.find(s => s.id === studentId);
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
    const ws_data = students.map(student => [
      student.rn,
      student.name,
      student.sex || '',
      student.age || '',
      student.village || '',
      student.kebele || '',
    ]);

    const ws = XLSX.utils.aoa_to_sheet([
      ['RN', 'Student Name', 'Sex', 'Age', 'Village', 'Kebele'],
      ...ws_data,
    ]);

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
      <div className="markbook-header flex items-center justify-between">
        <h1 className="text-2xl font-bold">Markbook</h1>
        <Navigation />
      </div>

      <div className="p-6 space-y-6">
        {/* Page Title */}
        <h2 className="text-2xl font-semibold text-primary">Continues Assessments</h2>

        {/* Editable School Info Header */}
        <div className="grid grid-cols-6 gap-3">
          <div>
            <label className="text-xs font-medium text-muted-foreground">School:</label>
            {editingSchoolField === 'school' ? (
              <input
                type="text"
                value={editingSchoolValue}
                onChange={(e) => setEditingSchoolValue(e.target.value)}
                onBlur={() => handleSchoolInfoSave('school')}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSchoolInfoSave('school');
                  if (e.key === 'Escape') setEditingSchoolField(null);
                }}
                className="w-full px-2 py-1 bg-green-100 border-0 rounded outline-none font-medium"
                autoFocus
              />
            ) : (
              <div
                onClick={() => handleSchoolInfoEdit('school', schoolInfo.school)}
                className="px-3 py-2 bg-green-100 rounded cursor-pointer hover:bg-green-200 font-medium"
              >
                {schoolInfo.school || 'Double-click to edit'}
              </div>
            )}
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground">Year:</label>
            {editingSchoolField === 'year' ? (
              <input
                type="text"
                value={editingSchoolValue}
                onChange={(e) => setEditingSchoolValue(e.target.value)}
                onBlur={() => handleSchoolInfoSave('year')}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSchoolInfoSave('year');
                  if (e.key === 'Escape') setEditingSchoolField(null);
                }}
                className="w-full px-2 py-1 bg-green-100 border-0 rounded outline-none font-medium"
                autoFocus
              />
            ) : (
              <div
                onClick={() => handleSchoolInfoEdit('year', schoolInfo.year)}
                className="px-3 py-2 bg-green-100 rounded cursor-pointer hover:bg-green-200 font-medium"
              >
                {schoolInfo.year || 'Double-click to edit'}
              </div>
            )}
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground">Semester:</label>
            {editingSchoolField === 'semester' ? (
              <input
                type="text"
                value={editingSchoolValue}
                onChange={(e) => setEditingSchoolValue(e.target.value)}
                onBlur={() => handleSchoolInfoSave('semester')}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSchoolInfoSave('semester');
                  if (e.key === 'Escape') setEditingSchoolField(null);
                }}
                className="w-full px-2 py-1 bg-green-100 border-0 rounded outline-none font-medium"
                autoFocus
              />
            ) : (
              <div
                onClick={() => handleSchoolInfoEdit('semester', schoolInfo.semester)}
                className="px-3 py-2 bg-green-100 rounded cursor-pointer hover:bg-green-200 font-medium"
              >
                {schoolInfo.semester || 'Double-click to edit'}
              </div>
            )}
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground">Grade:</label>
            {editingSchoolField === 'grade' ? (
              <input
                type="text"
                value={editingSchoolValue}
                onChange={(e) => setEditingSchoolValue(e.target.value)}
                onBlur={() => handleSchoolInfoSave('grade')}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSchoolInfoSave('grade');
                  if (e.key === 'Escape') setEditingSchoolField(null);
                }}
                className="w-full px-2 py-1 bg-green-100 border-0 rounded outline-none font-medium"
                autoFocus
              />
            ) : (
              <div
                onClick={() => handleSchoolInfoEdit('grade', schoolInfo.grade || '')}
                className="px-3 py-2 bg-green-100 rounded cursor-pointer hover:bg-green-200 font-medium"
              >
                {schoolInfo.grade || 'Double-click to edit'}
              </div>
            )}
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground">Section:</label>
            {editingSchoolField === 'section' ? (
              <input
                type="text"
                value={editingSchoolValue}
                onChange={(e) => setEditingSchoolValue(e.target.value)}
                onBlur={() => handleSchoolInfoSave('section')}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSchoolInfoSave('section');
                  if (e.key === 'Escape') setEditingSchoolField(null);
                }}
                className="w-full px-2 py-1 bg-green-100 border-0 rounded outline-none font-medium"
                autoFocus
              />
            ) : (
              <div
                onClick={() => handleSchoolInfoEdit('section', schoolInfo.section || '')}
                className="px-3 py-2 bg-green-100 rounded cursor-pointer hover:bg-green-200 font-medium"
              >
                {schoolInfo.section || 'Double-click to edit'}
              </div>
            )}
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground">Teacher:</label>
            {editingSchoolField === 'teacher' ? (
              <input
                type="text"
                value={editingSchoolValue}
                onChange={(e) => setEditingSchoolValue(e.target.value)}
                onBlur={() => handleSchoolInfoSave('teacher')}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSchoolInfoSave('teacher');
                  if (e.key === 'Escape') setEditingSchoolField(null);
                }}
                className="w-full px-2 py-1 bg-green-100 border-0 rounded outline-none font-medium"
                autoFocus
              />
            ) : (
              <div
                onClick={() => handleSchoolInfoEdit('teacher', schoolInfo.teacher)}
                className="px-3 py-2 bg-green-100 rounded cursor-pointer hover:bg-green-200 font-medium"
              >
                {schoolInfo.teacher || 'Double-click to edit'}
              </div>
            )}
          </div>
        </div>

        {/* Info Section */}
        <div className="grid grid-cols-4 gap-4">
          <div>
            <label className="text-xs font-medium text-muted-foreground">No. Subject:</label>
            <div className="px-3 py-2 bg-green-100 rounded font-medium">
              {subjects.length}
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground">No. Student:</label>
            <div className="px-3 py-2 bg-green-100 rounded font-medium">
              {students.length}
            </div>
          </div>
        </div>

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
            onClick={() => setIsAddSubjectOpen(true)}
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

        {/* Display and Subject Filters */}
        <div className="flex flex-wrap items-center gap-6">
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
              <SelectTrigger className="w-40 bg-green-200">
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
                <div key={subject.id} className="group flex items-center gap-2 px-3 py-1 bg-gray-100 rounded border border-gray-300 cursor-pointer transition-colors">
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
        <Dialog open={isAddSubjectOpen} onOpenChange={setIsAddSubjectOpen}>
          <DialogContent className="bg-card max-w-2xl">
            <DialogHeader className="flex flex-row items-center justify-between pr-2">
              <DialogTitle>Import Subject Scores</DialogTitle>
              <button
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
                    assessments.importMode
                  </label>
                  <Select value="single" disabled>
                    <SelectTrigger className="bg-background border border-primary">
                      <SelectValue />
                    </SelectTrigger>
                  </Select>
                  <p className="text-xs text-muted-foreground mt-2">assessments.singleSubjectDesc</p>
                </div>

                <div>
                  <label className="text-sm font-semibold text-foreground block mb-2">
                    assessments.subjectName
                  </label>
                  <Input
                    placeholder="Subject Name (optional - will use file name if empty)"
                    value={newSubjectName}
                    onChange={(e) => setNewSubjectName(e.target.value)}
                    className="bg-background"
                  />
                  <p className="text-xs text-muted-foreground mt-2">assessments.subjectNameHint</p>
                </div>

                <p className="text-sm text-muted-foreground bg-muted p-3 rounded">
                  Import an Excel file with standard columns: RN or Roll Number, Student Name (optional). Subject name is optional - if not provided, it will be extracted from the file name or sheet name. Rows = number of students. Additional columns can be score columns (1st–10th or total).
                </p>

                <Button 
                  onClick={() => {
                    if (newSubjectName.trim()) {
                      // Check for duplicate subjects (case-insensitive)
                      const subjectNameLower = newSubjectName.trim().toLowerCase();
                      const existingSubject = subjects.find(
                        s => s.name && s.name.toLowerCase() === subjectNameLower
                      );
                      
                      if (existingSubject) {
                        toast({
                          title: "Duplicate Subject",
                          description: `Subject "${existingSubject.name}" already exists. Please use a different name.`,
                          variant: "destructive",
                        });
                        return;
                      }

                      const subjectId = newSubjectName.toLowerCase().replace(/\s+/g, '-') + '-' + Date.now();
                      dispatch({
                        type: 'ADD_SUBJECT',
                        payload: {
                          id: subjectId,
                          name: newSubjectName.trim(),
                          maxScore: 100,
                        },
                      });
                      dispatch({ type: 'SET_SELECTED_SUBJECT', payload: subjectId });
                      toast({
                        title: "Subject Added",
                        description: `Subject "${newSubjectName}" has been added successfully.`,
                      });
                      setNewSubjectName('');
                      setSelectedImportFile(null);
                      setIsAddSubjectOpen(false);
                    } else {
                      toast({
                        title: "Please enter subject name",
                        description: "Subject name is required",
                        variant: "destructive",
                      });
                    }
                  }}
                  className="w-full bg-cyan-500 hover:bg-cyan-600 text-white gap-2"
                >
                  Add Subject
                </Button>
              </TabsContent>

              {/* Tab 2: Excel/CSV Import */}
              <TabsContent value="multiple" className="space-y-4 mt-4">
                <div>
                  <label className="text-sm font-semibold text-foreground block mb-2">
                    assessments.importMode
                  </label>
                  <Select value="multiple" disabled>
                    <SelectTrigger className="bg-background border border-primary">
                      <SelectValue />
                    </SelectTrigger>
                  </Select>
                  <p className="text-xs text-muted-foreground mt-2">assessments.multipleSubjectDesc</p>
                </div>

                <p className="text-sm text-muted-foreground bg-muted p-3 rounded">
                  Import an Excel file with RN (Roll Number), student info columns (Name, Age, Sex, Village, Kebele, etc.), followed by subject columns with scores. Example: [RN | Name | Age | Siltigna | Amharic | English | Maths | ...]. The system will automatically skip student info columns and import only subject scores.
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

                    const reader = new FileReader();
                    reader.onload = (event) => {
                      try {
                        const data = new Uint8Array(event.target?.result as ArrayBuffer);
                        const workbook = XLSX.read(data, { type: 'array' });
                        const sheetName = workbook.SheetNames[0];
                        const worksheet = workbook.Sheets[sheetName];
                        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];

                        if (jsonData.length < 2) {
                          toast({
                            title: "Import Failed",
                            description: "File is empty or has no data rows.",
                            variant: "destructive",
                          });
                          return;
                        }

                        // Parse headers
                        const headers = jsonData[0].map((h: any) => String(h).trim());
                        const rnIndex = headers.findIndex(h => h.toLowerCase().includes('rn') || h.toLowerCase().includes('roll'));
                        
                        if (rnIndex === -1) {
                          toast({
                            title: "Import Failed",
                            description: "Could not find RN (Roll Number) column in the Excel file.",
                            variant: "destructive",
                          });
                          return;
                        }

                        // Skip known student info columns and treat remaining columns as subjects
                        const studentInfoColumns = new Set([
                          'name', 'student name', 'full name', 
                          'age', 
                          'sex', 'gender', 
                          'village', 
                          'kebele', 
                          'absent', 'absences',
                          'conduct', 
                          'remark', 'remarks',
                          'year', 'class', 'grade', 'section',
                          'action', 'edit', 'delete'
                        ]);

                        // Map student info columns for extraction
                        const studentInfoColMap = new Map<string, number>();
                        headers.forEach((h, i) => {
                          const lowerH = h.toLowerCase();
                          if (studentInfoColumns.has(lowerH)) {
                            studentInfoColMap.set(lowerH, i);
                          }
                        });

                        const subjectColumns = headers
                          .map((h, i) => ({ name: h, index: i }))
                          .filter(col => {
                            if (col.index === rnIndex || col.name.trim() === '') return false;
                            return !studentInfoColumns.has(col.name.toLowerCase());
                          })
                          .slice(0, 10); // Limit to 10 subjects

                        if (subjectColumns.length === 0) {
                          // Allow import if we're just updating student info
                          if (studentInfoColMap.size === 0) {
                            toast({
                              title: "Import Failed",
                              description: "No subject columns or student info columns found. Please include subjects or student details to import.",
                              variant: "destructive",
                            });
                            return;
                          }
                          console.log('Importing student info only, no subject scores');
                        } else {
                          console.log('Importing subjects:', subjectColumns.map(s => s.name));
                        }

                        // Step 1: Parse and collect all unique subjects first
                        const uniqueSubjects = new Map<string, string>();
                        subjectColumns.forEach(subj => {
                          const subjectId = subj.name.toLowerCase().replace(/\s+/g, '-');
                          if (!uniqueSubjects.has(subjectId)) {
                            uniqueSubjects.set(subjectId, subj.name);
                          }
                        });

                        // Step 1.5: Check for duplicates (file-level and system-level, case-insensitive)
                        const fileSubjectNames = Array.from(uniqueSubjects.values());
                        const existingSubjectNamesLower = new Set(
                          state.subjects
                            .filter(s => s.name && s.name.trim())
                            .map(s => s.name.toLowerCase())
                        );
                        const conflictingNames: string[] = [];

                        fileSubjectNames.forEach((subjectName) => {
                          if (existingSubjectNamesLower.has(subjectName.toLowerCase())) {
                            conflictingNames.push(subjectName);
                          }
                        });

                        if (conflictingNames.length > 0) {
                          toast({
                            title: "Import Cancelled",
                            description: `Subjects already exist: ${conflictingNames.slice(0, 3).join(', ')}${conflictingNames.length > 3 ? '...' : ''}. Please remove duplicates and try again.`,
                            variant: "destructive",
                          });
                          setSelectedImportFile(null);
                          return;
                        }

                        // Step 2: Add all new subjects first (this creates assessments for existing students)
                        let subjectsAdded = 0;
                        const newSubjectIds = new Set<string>();
                        uniqueSubjects.forEach((subjectName, subjectId) => {
                          const existingSubject = state.subjects.find(s => s.id === subjectId);
                          if (!existingSubject) {
                            dispatch({
                              type: 'ADD_SUBJECT',
                              payload: {
                                id: subjectId,
                                name: subjectName,
                                maxScore: 100,
                              },
                            });
                            newSubjectIds.add(subjectId);
                            subjectsAdded++;
                          }
                        });

                        // Step 3: Parse student data and create mapping, also collect student info updates
                        const rnToStudentId = new Map<number, string>();
                        const newStudents: typeof students = [];
                        const studentsToUpdate: (Student & { originalRN: number })[] = [];
                        
                        // Get max RN from existing students to enforce class size limit
                        const maxExistingRN = students.length > 0 
                          ? Math.max(...students.map(s => {
                              const rn = typeof s.rn === 'number' ? s.rn : parseInt(String(s.rn || 0));
                              return isNaN(rn) ? 0 : rn;
                            }))
                          : 0;
                        
                        // Build a list of existing student RNs for easier tracking
                        const existingRNs = new Set(students
                          .map(s => {
                            const rn = typeof s.rn === 'number' ? s.rn : parseInt(String(s.rn || 0));
                            return isNaN(rn) ? undefined : rn;
                          })
                          .filter((rn): rn is number => rn !== undefined && rn !== null)
                        );
                        console.log('Existing RN values in state:', Array.from(existingRNs).sort((a, b) => a - b).slice(0, 10));
                        console.log('Max existing RN:', maxExistingRN);
                        console.log('Total existing students:', students.length);

                        for (let rowIdx = 1; rowIdx < jsonData.length; rowIdx++) {
                          const row = jsonData[rowIdx];
                          const rnValue = row[rnIndex];
                          
                          if (!rnValue && rnValue !== 0) continue;

                          const rn = parseInt(String(rnValue));
                          if (isNaN(rn) || rnToStudentId.has(rn)) continue; // Skip duplicates
                          
                          // Enforce RN limit: if students already exist, don't create new RN beyond max
                          // Only reject new RNs beyond existing limit. Existing RNs should always be allowed
                          if (students.length > 0 && rn > maxExistingRN && !existingRNs.has(rn)) {
                            console.log(`Skipping RN ${rn} - exceeds existing student limit (max: ${maxExistingRN})`);
                            continue;
                          }

                          // Extract student info from the row
                          const studentName = row[studentInfoColMap.get('name') ?? studentInfoColMap.get('student name') ?? studentInfoColMap.get('full name') ?? -1] || undefined;
                          const age = row[studentInfoColMap.get('age') ?? -1] || undefined;
                          const sex = row[studentInfoColMap.get('sex') ?? studentInfoColMap.get('gender') ?? -1] || undefined;
                          const village = row[studentInfoColMap.get('village') ?? -1] || undefined;
                          const kebele = row[studentInfoColMap.get('kebele') ?? -1] || undefined;
                          const absent = row[studentInfoColMap.get('absent') ?? studentInfoColMap.get('absences') ?? -1] || undefined;
                          const conduct = row[studentInfoColMap.get('conduct') ?? -1] || undefined;
                          const remark = row[studentInfoColMap.get('remark') ?? studentInfoColMap.get('remarks') ?? -1] || undefined;

                          // Try to find existing student by RN - search directly through state.students first
                          // Ensure RN comparison is numeric
                          let existingStudent = students.find(s => {
                            const sRN = typeof s.rn === 'number' ? s.rn : parseInt(String(s.rn || 0));
                            return !isNaN(sRN) && sRN === rn;
                          });
                          
                          if (!existingStudent && rowIdx <= 3) {
                            console.log(`Row ${rowIdx}: RN ${rn} - searching in ${students.length} students...`);
                            if (students.length > 0) {
                              console.log(`  First student RN: ${students[0].rn}, name: ${students[0].name}`);
                            }
                          }
                          
                          // Fallback: search by name if direct RN match fails
                          if (!existingStudent && studentName) {
                            existingStudent = students.find(s => 
                              s.name && String(s.name).toLowerCase() === String(studentName).toLowerCase()
                            );
                            if (existingStudent && rowIdx <= 3) {
                              console.log(`  Found by name match: "${studentName}" -> ID ${existingStudent.id}`);
                            }
                          }

                          if (existingStudent) {
                            // Update existing student with new info
                            studentsToUpdate.push({
                              ...existingStudent,
                              name: studentName || existingStudent.name,
                              age: age !== undefined ? age : existingStudent.age,
                              sex: sex || existingStudent.sex,
                              village: village || existingStudent.village,
                              kebele: kebele || existingStudent.kebele,
                              absent: absent !== undefined ? absent : existingStudent.absent,
                              conduct: conduct || existingStudent.conduct,
                              remark: remark || existingStudent.remark,
                              originalRN: rn,
                            });
                            rnToStudentId.set(rn, existingStudent.id);
                            console.log(`Updating student RN ${rn} (ID: ${existingStudent.id})`);
                          } else {
                            // Create new student only if it truly doesn't exist
                            const studentId = `student-${rn}-${Date.now()}-${rowIdx}`;
                            newStudents.push({
                              id: studentId,
                              name: studentName || `Student ${rn}`,
                              rn: rn,
                              age: age,
                              sex: sex,
                              village: village,
                              kebele: kebele,
                              absent: absent,
                              conduct: conduct,
                              remark: remark,
                            });
                            rnToStudentId.set(rn, studentId);
                            console.log(`Creating new student RN ${rn} (ID: ${studentId})`);
                          }
                        }

                        // Step 3.5: Update existing students with new info
                        studentsToUpdate.forEach(student => {
                          const { originalRN, ...updateData } = student;
                          dispatch({
                            type: 'UPDATE_STUDENT',
                            payload: updateData,
                          });
                        });

                        // Step 4: Add all new students (this creates assessments for all existing subjects including newly added ones)
                        if (newStudents.length > 0) {
                          newStudents.forEach(student => {
                            dispatch({
                              type: 'ADD_STUDENT',
                              payload: student,
                            });
                          });
                        }

                        // Step 5: Update all assessment scores with imported data
                        const assessmentsToUpdate: Assessment[] = [];
                        
                        for (let rowIdx = 1; rowIdx < jsonData.length; rowIdx++) {
                          const row = jsonData[rowIdx];
                          const rnValue = row[rnIndex];
                          
                          if (!rnValue && rnValue !== 0) continue;

                          const rn = parseInt(String(rnValue));
                          if (isNaN(rn)) continue;

                          const studentId = rnToStudentId.get(rn);
                          if (!studentId) continue;

                          // Parse scores for each subject
                          for (let subj of subjectColumns) {
                            const scoreValue = parseFloat(String(row[subj.index])) || 0;
                            const score = Math.min(Math.max(scoreValue, 0), 100);
                            const subjectId = subj.name.toLowerCase().replace(/\s+/g, '-');

                            assessmentsToUpdate.push({
                              studentId: studentId,
                              subjectId: subjectId,
                              scores: Array(10).fill(0).map((_, i) => i === 0 ? score : 0),
                            });
                          }
                        }

                        // Step 6: Dispatch all assessment updates with a delay to allow state to settle
                        setTimeout(() => {
                          assessmentsToUpdate.forEach(assessment => {
                            dispatch({
                              type: 'UPDATE_ASSESSMENT',
                              payload: assessment,
                            });
                          });

                          // Set to first subject
                          const firstSubjectId = subjectColumns[0].name.toLowerCase().replace(/\s+/g, '-');
                          dispatch({ type: 'SET_SELECTED_SUBJECT', payload: firstSubjectId });

                          toast({
                            title: "Import Successful",
                            description: `Imported ${newStudents.length} new students, updated ${studentsToUpdate.length} existing students with ${subjectColumns.length} subjects and ${assessmentsToUpdate.length} score entries.`,
                          });

                          setNewSubjectName('');
                          setSelectedImportFile(null);
                          setIsAddSubjectOpen(false);
                        }, 200);

                      } catch (error) {
                        console.error('Import error:', error);
                        toast({
                          title: "Import Failed",
                          description: "Failed to parse the file. Please check the file format.",
                          variant: "destructive",
                        });
                      }
                    };
                    reader.readAsArrayBuffer(selectedImportFile);
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
        <Dialog open={isAddStudentOpen} onOpenChange={setIsAddStudentOpen}>
          <DialogContent className="bg-card max-w-2xl">
            <DialogHeader className="flex flex-row items-center justify-between pr-2">
              <DialogTitle>Add Student Information</DialogTitle>
              <button
                onClick={() => {
                  setIsAddStudentOpen(false);
                  setNewStudent({
                    name: '',
                    sex: '',
                    age: '',
                    village: '',
                    kebele: '',
                    absent: '',
                    conduct: '',
                    remark: '',
                  });
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
                    placeholder="Enter student name"
                    value={newStudent.name}
                    onChange={(e) => setNewStudent({ ...newStudent, name: e.target.value })}
                    className="bg-background"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-semibold text-foreground block mb-2">
                      Sex
                    </label>
                    <Input
                      placeholder="e.g., M/F"
                      value={newStudent.sex}
                      onChange={(e) => setNewStudent({ ...newStudent, sex: e.target.value })}
                      className="bg-background"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-foreground block mb-2">
                      Age
                    </label>
                    <Input
                      placeholder="e.g., 15"
                      value={newStudent.age}
                      onChange={(e) => setNewStudent({ ...newStudent, age: e.target.value })}
                      className="bg-background"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-semibold text-foreground block mb-2">
                    Village
                  </label>
                  <Input
                    placeholder="Enter village name"
                    value={newStudent.village}
                    onChange={(e) => setNewStudent({ ...newStudent, village: e.target.value })}
                    className="bg-background"
                  />
                </div>

                <div>
                  <label className="text-sm font-semibold text-foreground block mb-2">
                    Kebele
                  </label>
                  <Input
                    placeholder="Enter kebele name"
                    value={newStudent.kebele}
                    onChange={(e) => setNewStudent({ ...newStudent, kebele: e.target.value })}
                    className="bg-background"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-semibold text-foreground block mb-2">
                      Absent
                    </label>
                    <Input
                      placeholder="e.g., 0"
                      value={newStudent.absent}
                      onChange={(e) => setNewStudent({ ...newStudent, absent: e.target.value })}
                      className="bg-background"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-foreground block mb-2">
                      Conduct
                    </label>
                    <Input
                      placeholder="e.g., Excellent"
                      value={newStudent.conduct}
                      onChange={(e) => setNewStudent({ ...newStudent, conduct: e.target.value })}
                      className="bg-background"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-semibold text-foreground block mb-2">
                    Remark
                  </label>
                  <Input
                    placeholder="Enter remarks"
                    value={newStudent.remark}
                    onChange={(e) => setNewStudent({ ...newStudent, remark: e.target.value })}
                    className="bg-background"
                  />
                </div>

                <Button 
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
                  Import an Excel file with the following columns: Student Name, Sex, Age, Village, Kebele, Absent, Conduct, Remark. 
                  <br />Example: [Student Name | Sex | Age | Village | Kebele | Absent | Conduct | Remark]
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
        <div className="overflow-x-auto border rounded-lg">
          <table className="w-full">
            <thead className="bg-blue-600 text-white">
              <tr>
                <th className="px-4 py-3 text-left font-semibold">RN</th>
                <th className="px-4 py-3 text-left font-semibold">Student Name</th>
                <th className="px-4 py-3 text-left font-semibold">Sex</th>
                <th className="px-4 py-3 text-left font-semibold">Age</th>
                <th className="px-4 py-3 text-left font-semibold">Village</th>
                <th className="px-4 py-3 text-left font-semibold">Kebele</th>
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
              {students.map((student) => (
                <tr key={student.id} className="border-t hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">{student.rn}</td>
                  <td className="px-4 py-3 text-left">
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
                        className="w-full px-2 py-1 border rounded outline-none"
                        autoFocus
                      />
                    ) : (
                      <span
                        onDoubleClick={() => handleStartEditStudent(student.id, 'name', student.name)}
                        className="cursor-pointer hover:text-blue-600"
                      >
                        {student.name || '-'}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-left">
                    {editingStudent === student.id && editStudentField === 'sex' ? (
                      <input
                        type="text"
                        value={editStudentValue}
                        onChange={(e) => setEditStudentValue(e.target.value)}
                        onBlur={() => handleSaveStudentField(student.id)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleSaveStudentField(student.id);
                          if (e.key === 'Escape') setEditingStudent(null);
                        }}
                        className="w-full px-2 py-1 border rounded outline-none"
                        autoFocus
                      />
                    ) : (
                      <span
                        onDoubleClick={() => handleStartEditStudent(student.id, 'sex', student.sex)}
                        className="cursor-pointer hover:text-blue-600"
                      >
                        {student.sex || '-'}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-left">
                    {editingStudent === student.id && editStudentField === 'age' ? (
                      <input
                        type="text"
                        value={editStudentValue}
                        onChange={(e) => setEditStudentValue(e.target.value)}
                        onBlur={() => handleSaveStudentField(student.id)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleSaveStudentField(student.id);
                          if (e.key === 'Escape') setEditingStudent(null);
                        }}
                        className="w-full px-2 py-1 border rounded outline-none"
                        autoFocus
                      />
                    ) : (
                      <span
                        onDoubleClick={() => handleStartEditStudent(student.id, 'age', student.age)}
                        className="cursor-pointer hover:text-blue-600"
                      >
                        {student.age || '-'}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-left">
                    {editingStudent === student.id && editStudentField === 'village' ? (
                      <input
                        type="text"
                        value={editStudentValue}
                        onChange={(e) => setEditStudentValue(e.target.value)}
                        onBlur={() => handleSaveStudentField(student.id)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleSaveStudentField(student.id);
                          if (e.key === 'Escape') setEditingStudent(null);
                        }}
                        className="w-full px-2 py-1 border rounded outline-none"
                        autoFocus
                      />
                    ) : (
                      <span
                        onDoubleClick={() => handleStartEditStudent(student.id, 'village', student.village)}
                        className="cursor-pointer hover:text-blue-600"
                      >
                        {student.village || '-'}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-left">
                    {editingStudent === student.id && editStudentField === 'kebele' ? (
                      <input
                        type="text"
                        value={editStudentValue}
                        onChange={(e) => setEditStudentValue(e.target.value)}
                        onBlur={() => handleSaveStudentField(student.id)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleSaveStudentField(student.id);
                          if (e.key === 'Escape') setEditingStudent(null);
                        }}
                        className="w-full px-2 py-1 border rounded outline-none"
                        autoFocus
                      />
                    ) : (
                      <span
                        onDoubleClick={() => handleStartEditStudent(student.id, 'kebele', student.kebele)}
                        className="cursor-pointer hover:text-blue-600"
                      >
                        {student.kebele || '-'}
                      </span>
                    )}
                  </td>
                  {subjects.map(subject => {
                    const assessment = state.assessments.find(
                      a => a.studentId === student.id && a.subjectId === subject.id
                    );
                    const score = assessment?.scores[0] || '';
                    return (
                      <td key={`${student.id}-${subject.id}`} className="px-4 py-3 text-center">
                        {editingStudent === student.id && editStudentField === `subject-${subject.id}` ? (
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
                            className="w-full px-2 py-1 border rounded outline-none text-center"
                            autoFocus
                          />
                        ) : (
                          <span
                            onDoubleClick={() => handleStartEditStudent(student.id, `subject-${subject.id}`, score ? String(score) : '')}
                            className="cursor-pointer hover:text-blue-600"
                          >
                            {score || '-'}
                          </span>
                        )}
                      </td>
                    );
                  })}
                  <td className="px-4 py-3 text-left">
                    {editingStudent === student.id && editStudentField === 'absent' ? (
                      <input
                        type="text"
                        value={editStudentValue}
                        onChange={(e) => setEditStudentValue(e.target.value)}
                        onBlur={() => handleSaveStudentField(student.id)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleSaveStudentField(student.id);
                          if (e.key === 'Escape') setEditingStudent(null);
                        }}
                        className="w-full px-2 py-1 border rounded outline-none"
                        autoFocus
                      />
                    ) : (
                      <span
                        onDoubleClick={() => handleStartEditStudent(student.id, 'absent', student.absent || '')}
                        className="cursor-pointer hover:text-blue-600"
                      >
                        {(student as any).absent || '-'}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-left">
                    {editingStudent === student.id && editStudentField === 'conduct' ? (
                      <input
                        type="text"
                        value={editStudentValue}
                        onChange={(e) => setEditStudentValue(e.target.value)}
                        onBlur={() => handleSaveStudentField(student.id)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleSaveStudentField(student.id);
                          if (e.key === 'Escape') setEditingStudent(null);
                        }}
                        className="w-full px-2 py-1 border rounded outline-none"
                        autoFocus
                      />
                    ) : (
                      <span
                        onDoubleClick={() => handleStartEditStudent(student.id, 'conduct', (student as any).conduct || '')}
                        className="cursor-pointer hover:text-blue-600"
                      >
                        {(student as any).conduct || '-'}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-left">
                    {editingStudent === student.id && editStudentField === 'remark' ? (
                      <input
                        type="text"
                        value={editStudentValue}
                        onChange={(e) => setEditStudentValue(e.target.value)}
                        onBlur={() => handleSaveStudentField(student.id)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleSaveStudentField(student.id);
                          if (e.key === 'Escape') setEditingStudent(null);
                        }}
                        className="w-full px-2 py-1 border rounded outline-none"
                        autoFocus
                      />
                    ) : (
                      <span
                        onDoubleClick={() => handleStartEditStudent(student.id, 'remark', (student as any).remark || '')}
                        className="cursor-pointer hover:text-blue-600"
                      >
                        {(student as any).remark || '-'}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex gap-2 justify-center">
                      <button
                        onClick={() => handleStartEditStudent(student.id, 'name', student.name)}
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
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

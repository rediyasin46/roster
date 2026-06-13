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
  const [editingStudent, setEditingStudent] = useState<string | null>(null);
  const [editStudentField, setEditStudentField] = useState<string>('');
  const [editStudentValue, setEditStudentValue] = useState('');
  const [importMode, setImportMode] = useState<'single' | 'multiple'>('single');
  const [selectedImportFile, setSelectedImportFile] = useState<File | null>(null);
  const subjectFileInputRef = useRef<HTMLInputElement>(null);

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
    const newRn = students.length + 1;
    dispatch({
      type: 'ADD_STUDENT',
      payload: {
        id: `student-${Date.now()}`,
        name: '',
        rn: newRn,
        sex: '',
        age: '',
        village: '',
        kebele: '',
      },
    });
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
    const student = students.find(s => s.id === studentId);
    if (student) {
      dispatch({
        type: 'UPDATE_STUDENT',
        payload: { ...student, [editStudentField]: editStudentValue },
      });
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

        {/* Subjects Section */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-primary">
            Subjects ({subjects.length})
          </h3>
          <div className="flex flex-wrap gap-2">
            {subjects.map(subject => (
              <Badge key={subject.id} variant="outline" className="px-3 py-1 bg-gray-100">
                {subject.name}
              </Badge>
            ))}
          </div>
        </div>

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
                      // Auto-extract subject name from file if not set
                      if (!newSubjectName.trim()) {
                        const fileName = file.name.split('.')[0];
                        setNewSubjectName(fileName);
                      }
                    }
                  }}
                  className="hidden"
                />

                <Button 
                  onClick={() => subjectFileInputRef.current?.click()}
                  variant="outline"
                  className="w-full gap-2"
                >
                  <FileDown className="w-4 h-4" />
                  Select Excel/CSV File
                </Button>

                <Button 
                  onClick={() => {
                    if (!selectedImportFile) {
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

                        // Create new subject
                        const finalSubjectName = newSubjectName.trim() || selectedImportFile.name.split('.')[0];
                        const subjectId = finalSubjectName.toLowerCase().replace(/\s+/g, '-') + '-' + Date.now();
                        
                        // Parse headers
                        const headers = jsonData[0].map((h: any) => String(h).trim().toLowerCase());
                        const rnIndex = headers.findIndex(h => h.includes('rn') || h.includes('roll'));
                        const nameIndex = headers.findIndex(h => h.includes('name') || h.includes('student'));
                        
                        // Find score columns (all columns after name, or all numeric columns)
                        let scoreIndices: number[] = [];
                        for (let i = 0; i < headers.length; i++) {
                          if (i !== rnIndex && i !== nameIndex) {
                            // Check if this column looks like a score column
                            const header = headers[i];
                            if (header.includes('score') || header.includes('mark') || header.match(/^\d+/) || header === '') {
                              scoreIndices.push(i);
                            }
                          }
                        }

                        // If no score columns found, use all columns after name
                        if (scoreIndices.length === 0) {
                          for (let i = Math.max(rnIndex, nameIndex) + 1; i < headers.length; i++) {
                            scoreIndices.push(i);
                          }
                        }

                        // Parse student data
                        const newStudents: typeof students = [];
                        const newAssessments: any[] = [];
                        const existingStudentIds = new Set(students.map(s => s.id));

                        for (let rowIdx = 1; rowIdx < jsonData.length; rowIdx++) {
                          const row = jsonData[rowIdx];
                          if (!row[rnIndex]) continue; // Skip empty rows

                          const rn = parseInt(String(row[rnIndex])) || rowIdx;
                          const studentName = row[nameIndex] ? String(row[nameIndex]).trim() : `Student ${rn}`;
                          const studentId = `student-${rn}-${Date.now()}`;

                          // Check if student already exists
                          const existingStudent = students.find(s => s.rn === rn);
                          const finalStudentId = existingStudent?.id || studentId;

                          // Collect scores
                          const scores: number[] = [];
                          for (let scoreIdx of scoreIndices) {
                            const scoreValue = parseFloat(String(row[scoreIdx])) || 0;
                            scores.push(Math.min(Math.max(scoreValue, 0), 100)); // Clamp to 0-100
                          }
                          // Pad scores to 10 elements
                          while (scores.length < 10) {
                            scores.push(0);
                          }

                          // Add student if doesn't exist
                          if (!existingStudent && !existingStudentIds.has(finalStudentId)) {
                            newStudents.push({
                              id: finalStudentId,
                              name: studentName,
                              rn: rn,
                            });
                            existingStudentIds.add(finalStudentId);
                          }

                          // Add assessment record
                          newAssessments.push({
                            studentId: finalStudentId,
                            subjectId: subjectId,
                            scores: scores,
                          });
                        }

                        // Dispatch all updates
                        if (newStudents.length > 0) {
                          // Add each new student (which will also add assessments for all subjects)
                          newStudents.forEach(student => {
                            dispatch({
                              type: 'ADD_STUDENT',
                              payload: student,
                            });
                          });
                        }

                        // Add subject
                        dispatch({
                          type: 'ADD_SUBJECT',
                          payload: {
                            id: subjectId,
                            name: finalSubjectName,
                            maxScore: 100,
                          },
                        });

                        // Update assessments with parsed scores
                        const updatedAssessments = [...state.assessments, ...newAssessments];
                        newAssessments.forEach(assessment => {
                          dispatch({
                            type: 'UPDATE_ASSESSMENT',
                            payload: assessment,
                          });
                        });

                        dispatch({ type: 'SET_SELECTED_SUBJECT', payload: subjectId });

                        toast({
                          title: "Import Successful",
                          description: `Subject "${finalSubjectName}" added with ${newStudents.length > 0 ? newStudents.length + ' new students and ' : ''}${newAssessments.length} assessment records.`,
                        });

                        setNewSubjectName('');
                        setSelectedImportFile(null);
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
                    reader.readAsArrayBuffer(selectedImportFile);
                  }}
                  disabled={!selectedImportFile}
                  className="w-full bg-cyan-500 hover:bg-cyan-600 text-white gap-2"
                >
                  <Upload className="w-4 h-4" />
                  Import Excel/CSV
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

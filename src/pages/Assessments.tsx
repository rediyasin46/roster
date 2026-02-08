import { useState, useRef } from 'react';
import { Plus, Trash2, Edit2, Upload } from 'lucide-react';
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

export default function Assessments() {
  const { state, dispatch, getStudentAssessment, getStudentTotal, getStudentRank } = useMarkbook();
  const { schoolInfo, students, subjects, selectedSubjectId, scoreDisplayMode } = state;
  const { toast } = useToast();
  
  const [newSubjectName, setNewSubjectName] = useState('');
  const [isAddSubjectOpen, setIsAddSubjectOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<string | null>(null);
  const [editStudentName, setEditStudentName] = useState('');
  const subjectFileInputRef = useRef<HTMLInputElement>(null);

  const selectedSubject = subjects.find(s => s.id === selectedSubjectId);
  const displayMultiplier = scoreDisplayMode === '10%' ? 1 : 10;
  const maxInputValue = scoreDisplayMode === '10%' ? 10 : 100;

  // Get subjects that have scores (any student has non-zero scores)
  const subjectsWithScores = subjects.filter(subject => {
    return students.some(student => {
      const assessment = getStudentAssessment(student.id, subject.id);
      return assessment && assessment.scores.some(s => s > 0);
    });
  });

  // Always show default subject (first one) plus subjects with scores
  const availableSubjects = subjects.length > 0 
    ? [subjects[0], ...subjectsWithScores.filter(s => s.id !== subjects[0].id)]
    : [];

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

        // Parse the imported data - expecting RN and scores
        const rows = jsonData.slice(1); // Skip header
        let importedCount = 0;
        let skippedCount = 0;

        rows.forEach((row) => {
          const rn = parseInt(row[0]);
          if (isNaN(rn)) {
            skippedCount++;
            return;
          }

          const student = students.find(s => s.rn === rn);
          if (student) {
            // Check if second column is student name (string) or score (number)
            const hasStudentName = typeof row[1] === 'string' && isNaN(parseFloat(row[1]));
            const scoreStartIndex = hasStudentName ? 2 : 1;
            
            const scores = row.slice(scoreStartIndex, scoreStartIndex + 10).map((v: any) => {
              const num = parseFloat(v);
              return isNaN(num) ? 0 : (scoreDisplayMode === '100%' ? num / 10 : num);
            });

            // Update assessment for this student and new subject
            setTimeout(() => {
              dispatch({
                type: 'UPDATE_ASSESSMENT',
                payload: {
                  studentId: student.id,
                  subjectId: subjectId,
                  scores: scores.length === 10 ? scores : [...scores, ...Array(10 - scores.length).fill(0)],
                },
              });
            }, 100);
            importedCount++;
          } else {
            skippedCount++;
          }
        });

        // Select the new subject
        setTimeout(() => {
          dispatch({ type: 'SET_SELECTED_SUBJECT', payload: subjectId });
        }, 150);

        toast({
          title: "Import Successful",
          description: `Imported ${importedCount} student scores for "${newSubjectName}". ${skippedCount > 0 ? `${skippedCount} rows skipped.` : ''}`,
        });

        setNewSubjectName('');
        setIsAddSubjectOpen(false);
      } catch (error) {
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
      },
    });
  };

  const handleDeleteStudent = (studentId: string) => {
    dispatch({ type: 'DELETE_STUDENT', payload: studentId });
  };

  const handleUpdateScore = (studentId: string, assessmentIndex: number, value: number) => {
    const assessment = getStudentAssessment(studentId, selectedSubjectId!);
    if (assessment) {
      const adjustedValue = scoreDisplayMode === '100%' ? value / 10 : value;
      const newScores = [...assessment.scores];
      newScores[assessmentIndex] = adjustedValue;
      dispatch({
        type: 'UPDATE_ASSESSMENT',
        payload: { ...assessment, scores: newScores },
      });
    }
  };

  const handleImport = (data: any[][]) => {
    const rows = data.slice(1);
    rows.forEach((row, index) => {
      const studentName = row[1] || '';
      const scores = row.slice(2, 12).map(v => {
        const num = parseFloat(v);
        return isNaN(num) ? 0 : (scoreDisplayMode === '100%' ? num / 10 : num);
      });

      const existingStudent = students[index];
      if (existingStudent) {
        dispatch({
          type: 'UPDATE_STUDENT',
          payload: { ...existingStudent, name: studentName },
        });
        const assessment = getStudentAssessment(existingStudent.id, selectedSubjectId!);
        if (assessment) {
          dispatch({
            type: 'UPDATE_ASSESSMENT',
            payload: { ...assessment, scores },
          });
        }
      } else {
        const newStudent = {
          id: `student-${Date.now()}-${index}`,
          name: studentName,
          rn: students.length + index + 1,
        };
        dispatch({ type: 'ADD_STUDENT', payload: newStudent });
        setTimeout(() => {
          dispatch({
            type: 'UPDATE_ASSESSMENT',
            payload: {
              studentId: newStudent.id,
              subjectId: selectedSubjectId!,
              scores,
            },
          });
        }, 0);
      }
    });
  };

  const getTableData = () => {
    return students.map(student => {
      const assessment = getStudentAssessment(student.id, selectedSubjectId!);
      const scores = assessment?.scores || Array(10).fill(0);
      const displayScores = scores.map(s => (s * displayMultiplier).toFixed(displayMultiplier === 1 ? 0 : 1));
      const rawTotal = getStudentTotal(student.id, selectedSubjectId!);
      const total = rawTotal * 10; // Convert to 100% scale
      const rank = getStudentRank(student.id, selectedSubjectId!);
      return [student.rn, student.name, ...displayScores, total.toFixed(0), rank];
    });
  };

  const tableHeaders = ['RN', 'Student Name', '1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th', '9th', '10th', 'Total /100%', 'Rank', 'Action'];

  const handleStartEditStudent = (studentId: string, currentName: string) => {
    setEditingStudent(studentId);
    setEditStudentName(currentName);
  };

  const handleSaveStudentName = (studentId: string) => {
    const student = students.find(s => s.id === studentId);
    if (student) {
      dispatch({
        type: 'UPDATE_STUDENT',
        payload: { ...student, name: editStudentName },
      });
    }
    setEditingStudent(null);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="markbook-header flex items-center justify-between">
        <h1 className="text-2xl font-bold">Markbook</h1>
        <Navigation />
      </div>

      <div className="p-4 space-y-4">
        {/* Page Title */}
        <h2 className="text-xl font-semibold text-primary">Continues Assessments</h2>

        {/* School Info */}
        <div className="flex flex-wrap gap-2 text-sm">
          <div className="flex">
            <span className="info-label">School</span>
            <span className="info-value">{schoolInfo.school}</span>
          </div>
          <div className="flex">
            <span className="info-label">Student no</span>
            <span className="info-value">{students.length}</span>
          </div>
          <div className="flex">
            <span className="info-label">Year</span>
            <span className="info-value">{schoolInfo.year}</span>
          </div>
          <div className="flex">
            <span className="info-label">Subject</span>
            <span className="info-value">{selectedSubject?.name || '-'} (score 0)</span>
          </div>
          <div className="flex">
            <span className="info-label">Semester</span>
            <span className="info-value">{schoolInfo.semester}</span>
          </div>
          <div className="flex">
            <span className="info-label">Teacher</span>
            <span className="info-value">{schoolInfo.teacher}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <ActionButtons
          showImport
          onImport={handleImport}
          tableData={getTableData()}
          tableHeaders={tableHeaders.slice(0, -1)}
          fileName="assessments"
        />

        {/* Subject and Score Display Toggle */}
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Subject:</span>
            <Select
              value={selectedSubjectId || ''}
              onValueChange={(value) => {
                if (value === 'add-subject') {
                  setIsAddSubjectOpen(true);
                } else {
                  dispatch({ type: 'SET_SELECTED_SUBJECT', payload: value });
                }
              }}
            >
              <SelectTrigger className="w-40 bg-[hsl(var(--success))] text-[hsl(var(--success-foreground))]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-card z-50">
                {availableSubjects.map(subject => (
                  <SelectItem key={subject.id} value={subject.id}>
                    {subject.name}
                  </SelectItem>
                ))}
                <SelectItem value="add-subject" className="text-primary font-medium">
                  <span className="flex items-center gap-2">
                    <Plus className="w-4 h-4" />
                    Add Subject
                  </span>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Display:</span>
            <Select
              value={scoreDisplayMode}
              onValueChange={(value: '10%' | '100%') => 
                dispatch({ type: 'SET_SCORE_DISPLAY_MODE', payload: value })
              }
            >
              <SelectTrigger className="w-32 score-toggle">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-card z-50">
                <SelectItem value="10%">1st-10th</SelectItem>
                <SelectItem value="100%">100% only</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Add Subject Dialog */}
        <Dialog open={isAddSubjectOpen} onOpenChange={setIsAddSubjectOpen}>
          <DialogContent className="bg-card">
            <DialogHeader>
              <DialogTitle>Import Subject Scores</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Input
                placeholder="Subject Name"
                value={newSubjectName}
                onChange={(e) => setNewSubjectName(e.target.value)}
              />
              <p className="text-sm text-muted-foreground">
                Import an Excel/CSV file with columns: RN or Roll Number, Student Name (optional) and scores by roll number
              </p>
              <input
                ref={subjectFileInputRef}
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={handleSubjectFileImport}
                className="hidden"
              />
              <Button 
                onClick={() => subjectFileInputRef.current?.click()} 
                className="w-full gap-2"
                disabled={!newSubjectName.trim()}
              >
                <Upload className="w-4 h-4" />
                Import Excel/CSV
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Data Table */}
        <div className="overflow-x-auto border rounded-lg">
          <table className="markbook-table">
            <thead>
              <tr>
                <th>RN</th>
                <th>Student Name</th>
                <th>1st</th>
                <th>2nd</th>
                <th>3rd</th>
                <th>4th</th>
                <th>5th</th>
                <th>6th</th>
                <th>7th</th>
                <th>8th</th>
                <th>9th</th>
                <th>10th</th>
                <th className="bg-[hsl(var(--table-calculated))]">Total /100%</th>
                <th className="bg-[hsl(var(--table-calculated))]">Rank</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {students.map(student => {
                const assessment = getStudentAssessment(student.id, selectedSubjectId!);
                const scores = assessment?.scores || Array(10).fill(0);
                const rawTotal = getStudentTotal(student.id, selectedSubjectId!);
                const total = rawTotal * 10; // Convert to 100% scale (10 assessments × 10 points = 100)
                const rank = getStudentRank(student.id, selectedSubjectId!);

                return (
                  <tr key={student.id}>
                    <td className="font-medium">{student.rn}</td>
                    <td className="text-left min-w-[120px]">
                      {editingStudent === student.id ? (
                        <input
                          type="text"
                          value={editStudentName}
                          onChange={(e) => setEditStudentName(e.target.value)}
                          onBlur={() => handleSaveStudentName(student.id)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleSaveStudentName(student.id);
                            if (e.key === 'Escape') setEditingStudent(null);
                          }}
                          className="w-full px-2 py-1 bg-transparent border-b-2 border-primary outline-none"
                          autoFocus
                        />
                      ) : (
                        <span 
                          onDoubleClick={() => handleStartEditStudent(student.id, student.name)}
                          className="cursor-pointer"
                        >
                          {student.name || <span className="text-muted-foreground italic">Click to add name</span>}
                        </span>
                      )}
                    </td>
                    {scores.map((score, idx) => (
                      <EditableCell
                        key={idx}
                        value={score * displayMultiplier}
                        onChange={(value) => handleUpdateScore(student.id, idx, value)}
                        maxValue={maxInputValue}
                        displayMultiplier={1}
                      />
                    ))}
                    <td className="cell-calculated">{total.toFixed(0)}</td>
                    <td className="cell-rank">{rank}</td>
                    <td className="whitespace-nowrap">
                      <div className="flex gap-1 justify-center">
                        <button
                          onClick={() => handleStartEditStudent(student.id, student.name)}
                          className="btn-edit flex items-center gap-1"
                        >
                          <Edit2 className="w-3 h-3" />
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteStudent(student.id)}
                          className="btn-delete flex items-center gap-1"
                        >
                          <Trash2 className="w-3 h-3" />
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Add Student Button */}
        <Button onClick={handleAddStudent} variant="outline" className="gap-2">
          <Plus className="w-4 h-4" />
          Add Student
        </Button>
      </div>
    </div>
  );
}

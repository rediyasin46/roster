import { useMarkbook } from '@/context/MarkbookContext';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface SchoolInfoHeaderProps {
  showClass?: boolean;
  showSubjectCount?: boolean;
  showStudentCount?: boolean;
  showSubjectDropdown?: boolean;
}

export function SchoolInfoHeader({ 
  showClass = false, 
  showSubjectCount = false,
  showStudentCount = false,
  showSubjectDropdown = false 
}: SchoolInfoHeaderProps) {
  const { state, dispatch } = useMarkbook();
  const { schoolInfo, subjects, students, selectedSubjectId } = state;

  const selectedSubject = subjects.find(s => s.id === selectedSubjectId);

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2 items-center">
        <div className="flex">
          <span className="info-label">School</span>
          <span className="info-value">{schoolInfo.school}</span>
        </div>
        <div className="flex">
          <span className="info-label">Teacher</span>
          <span className="info-value">{schoolInfo.teacher}</span>
        </div>
        <div className="flex">
          <span className="info-label">Semester</span>
          <span className="info-value">{schoolInfo.semester}</span>
        </div>
        <div className="flex">
          <span className="info-label">Year</span>
          <span className="info-value">{schoolInfo.year}</span>
        </div>
        {showSubjectDropdown && (
          <div className="flex items-center gap-2 ml-4">
            <span className="info-label">Subject</span>
            <Select
              value={selectedSubjectId || ''}
              onValueChange={(value) => dispatch({ type: 'SET_SELECTED_SUBJECT', payload: value })}
            >
              <SelectTrigger className="w-32 h-7 bg-[hsl(var(--success))] text-[hsl(var(--success-foreground))] text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-card z-50">
                {subjects.map(subject => (
                  <SelectItem key={subject.id} value={subject.id}>
                    {subject.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>
      
      {(showClass || showSubjectCount || showStudentCount) && (
        <div className="flex flex-wrap gap-2">
          {showClass && (
            <div className="flex">
              <span className="info-label">Class</span>
              <span className="info-value">{schoolInfo.class || '-'}</span>
            </div>
          )}
          {showSubjectCount && (
            <div className="flex">
              <span className="info-label">Subject Number(n)</span>
              <span className="info-value">{subjects.length}</span>
            </div>
          )}
          {showStudentCount && (
            <div className="flex">
              <span className="info-label">Students Number(n)</span>
              <span className="info-value">{students.length}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

import { useMarkbook } from '@/context/MarkbookContext';

interface SchoolInfoHeaderProps {
  showClass?: boolean;
  showSubjectCount?: boolean;
  showStudentCount?: boolean;
}

export function SchoolInfoHeader({ 
  showClass = false, 
  showSubjectCount = false,
  showStudentCount = false 
}: SchoolInfoHeaderProps) {
  const { state } = useMarkbook();
  const { schoolInfo, subjects, students } = state;

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
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

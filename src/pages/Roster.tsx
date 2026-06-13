import { useMarkbook } from '@/context/MarkbookContext';
import { AppHeader } from '@/components/AppHeader';
import { ActionButtons } from '@/components/ActionButtons';

export default function Roster() {
  const { state, getStudentTotal, getOverallTotal, getOverallAverage, getOverallRank } = useMarkbook();
  const { students, subjects, schoolInfo } = state;

  // For roster, we simulate semester data
  // In a real app, this would come from the database with semester-specific assessments
  const semesters = ['1st', '2nd'];

  const getRosterData = () => {
    return students.map(student => {
      const semesterData = semesters.map(semester => {
        const subjectScores: { [subjectId: string]: number } = {};
        subjects.forEach(subject => {
          // For demo, we use the same scores but could be semester-specific
          subjectScores[subject.id] = getStudentTotal(student.id, subject.id);
        });
        
        const total = Object.values(subjectScores).reduce((sum, s) => sum + s, 0);
        const average = subjects.length > 0 ? total / subjects.length : 0;
        
        return {
          semester,
          subjectScores,
          total,
          average,
          rank: getOverallRank(student.id), // Simplified - would need semester-specific ranking
        };
      });

      // Calculate average row
      const avgSubjectScores: { [subjectId: string]: number } = {};
      subjects.forEach(subject => {
        const semesterScores = semesterData.map(s => s.subjectScores[subject.id] || 0);
        avgSubjectScores[subject.id] = semesterScores.reduce((a, b) => a + b, 0) / semesterScores.length;
      });
      
      const avgTotal = Object.values(avgSubjectScores).reduce((sum, s) => sum + s, 0);
      const avgAverage = subjects.length > 0 ? avgTotal / subjects.length : 0;

      return {
        studentId: student.id,
        studentName: student.name,
        rn: student.rn,
        semesters: semesterData,
        averageRow: {
          semester: 'average',
          subjectScores: avgSubjectScores,
          total: avgTotal,
          average: avgAverage,
          rank: getOverallRank(student.id),
        },
      };
    });
  };

  const rosterData = getRosterData();

  const getTableData = () => {
    const rows: any[] = [];
    rosterData.forEach(data => {
      [...data.semesters, data.averageRow].forEach(semData => {
        rows.push([
          data.rn,
          data.studentName,
          semData.semester,
          ...subjects.map(s => semData.subjectScores[s.id]?.toFixed(semData.semester === 'average' ? 1 : 0) || '0'),
          semData.total.toFixed(semData.semester === 'average' ? 1 : 0),
          semData.average.toFixed(2),
          semData.rank,
        ]);
      });
    });
    return rows;
  };

  const tableHeaders = [
    'RN', 
    'Student Name', 
    'Semester',
    ...subjects.map(s => s.name), 
    'Total', 
    'Average', 
    'Rank'
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <AppHeader />

      <div className="p-4 space-y-4">
        {/* Page Title */}
        <h2 className="text-xl font-semibold text-primary">Student Roster</h2>

        {/* Action Buttons */}
        <ActionButtons
          tableData={getTableData()}
          tableHeaders={tableHeaders}
          fileName="student-roster"
        />

        {/* Data Table */}
        <div className="overflow-x-auto border rounded-lg">
          <table className="markbook-table">
            <thead>
              <tr>
                <th>RN</th>
                <th>Student Name</th>
                <th>Semester</th>
                {subjects.map(subject => (
                  <th key={subject.id} className="bg-[hsl(210,100%,70%)]">
                    {subject.name}
                  </th>
                ))}
                <th className="bg-[hsl(var(--table-calculated))]">Total</th>
                <th className="bg-[hsl(45,100%,70%)] text-foreground">Average</th>
                <th className="bg-[hsl(var(--table-calculated))]">Rank</th>
              </tr>
            </thead>
            <tbody>
              {rosterData.map(data => (
                <>
                  {[...data.semesters, data.averageRow].map((semData, semIndex) => (
                    <tr 
                      key={`${data.studentId}-${semData.semester}`}
                      className={semData.semester === 'average' ? 'bg-[hsl(210,50%,90%)]' : ''}
                    >
                      {semIndex === 0 && (
                        <>
                          <td 
                            className="font-medium align-top" 
                            rowSpan={semesters.length + 1}
                          >
                            {data.rn}
                          </td>
                          <td 
                            className="text-left align-top" 
                            rowSpan={semesters.length + 1}
                          >
                            {data.studentName}
                          </td>
                        </>
                      )}
                      <td className={semData.semester === 'average' ? 'font-medium italic' : ''}>
                        {semData.semester}
                      </td>
                      {subjects.map(subject => (
                        <td key={subject.id}>
                          {semData.subjectScores[subject.id]?.toFixed(
                            semData.semester === 'average' ? 1 : 0
                          ) || '0'}
                        </td>
                      ))}
                      <td className="cell-calculated">
                        {semData.total.toFixed(semData.semester === 'average' ? 1 : 0)}
                      </td>
                      <td className="cell-average">{semData.average.toFixed(2)}</td>
                      <td className="cell-rank">{semData.rank}</td>
                    </tr>
                  ))}
                </>
              ))}
            </tbody>
          </table>
        </div>

        {students.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <p>No students yet. Add students in the Assessments page.</p>
          </div>
        )}
      </div>
    </div>
  );
}

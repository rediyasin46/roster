import { useMarkbook } from '@/context/MarkbookContext';
import { AppHeader } from '@/components/AppHeader';
import { ActionButtons } from '@/components/ActionButtons';
import { RankData } from '@/types/markbook';

export default function Rank() {
  const { state, getStudentTotal, getOverallTotal, getOverallAverage, getOverallRank } = useMarkbook();
  const { students, subjects } = state;

  // Calculate rank data
  const rankData: RankData[] = students.map(student => {
    const subjectScores: { [subjectId: string]: number } = {};
    subjects.forEach(subject => {
      subjectScores[subject.id] = getStudentTotal(student.id, subject.id);
    });
    
    return {
      studentId: student.id,
      studentName: student.name,
      rn: student.rn,
      subjectScores,
      total: getOverallTotal(student.id),
      average: getOverallAverage(student.id),
      rank: getOverallRank(student.id),
    };
  });

  // Sort by roll number
  const sortedRankData = [...rankData].sort((a, b) => a.rn - b.rn);

  const getTableData = () => {
    return sortedRankData.map(data => [
      data.rn,
      data.studentName,
      ...subjects.map(s => data.subjectScores[s.id]?.toFixed(0) || '0'),
      data.total.toFixed(0),
      data.average.toFixed(2),
      data.rank,
    ]);
  };

  const tableHeaders = [
    'RN', 
    'Student Name', 
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
        <h2 className="text-xl font-semibold text-primary">Student Rank</h2>

        {/* Action Buttons */}
        <ActionButtons
          tableData={getTableData()}
          tableHeaders={tableHeaders}
          fileName="student-rank"
        />

        {/* Data Table */}
        <div className="overflow-x-auto border rounded-lg">
          <table className="markbook-table">
            <thead>
              <tr>
                <th>RN</th>
                <th>Student Name</th>
                {subjects.map(subject => (
                  <th key={subject.id} className="bg-[hsl(142,70%,45%)]">
                    {subject.name}
                  </th>
                ))}
                <th className="bg-[hsl(var(--table-calculated))]">Total</th>
                <th className="bg-[hsl(45,100%,70%)] text-foreground">Average</th>
                <th className="bg-[hsl(var(--table-calculated))]">Rank</th>
              </tr>
            </thead>
            <tbody>
              {sortedRankData.map(data => (
                <tr key={data.studentId}>
                  <td className="font-medium">{data.rn}</td>
                  <td className="text-left">{data.studentName}</td>
                  {subjects.map(subject => (
                    <td key={subject.id}>
                      {data.subjectScores[subject.id]?.toFixed(0) || '0'}
                    </td>
                  ))}
                  <td className="cell-calculated">{data.total.toFixed(0)}</td>
                  <td className="cell-average">{data.average.toFixed(2)}</td>
                  <td className="cell-rank">{data.rank}</td>
                </tr>
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

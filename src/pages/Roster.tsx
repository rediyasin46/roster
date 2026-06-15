import { Fragment } from 'react';
import { useMarkbook } from '@/context/MarkbookContext';
import { AppHeader } from '@/components/AppHeader';
import { ActionButtons } from '@/components/ActionButtons';
import { getSemesterSubjectScores } from '@/utils/semesterScores';

export default function Roster() {
  const {
    state,
    getSemesterTotal,
    getSemesterAverage,
    getSemesterRank,
    getSemestersWithData,
  } = useMarkbook();
  const { students, subjects, assessments } = state;

  const semesters = getSemestersWithData();
  const showAverageRow = semesters.length > 1;

  const getRosterData = () => {
    return students.map((student) => {
      const semesterData = semesters.map((semester) => {
        const subjectScores = getSemesterSubjectScores(
          assessments,
          subjects,
          student.id,
          semester
        );

        return {
          semester,
          subjectScores,
          total: getSemesterTotal(student.id, semester),
          average: getSemesterAverage(student.id, semester),
          rank: getSemesterRank(student.id, semester),
        };
      });

      const avgSubjectScores: { [subjectId: string]: number } = {};
      subjects.forEach((subject) => {
        const semesterScores = semesterData.map((s) => s.subjectScores[subject.id] || 0);
        avgSubjectScores[subject.id] =
          semesterScores.reduce((a, b) => a + b, 0) / semesterScores.length;
      });

      const avgTotal = Object.values(avgSubjectScores).reduce((sum, s) => sum + s, 0);
      const avgAverage = subjects.length > 0 ? avgTotal / subjects.length : 0;
      const avgRank =
        semesterData.reduce((sum, s) => sum + s.rank, 0) / Math.max(semesterData.length, 1);

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
          rank: Math.round(avgRank),
        },
      };
    });
  };

  const rosterData = getRosterData();
  const rowCount = semesters.length + (showAverageRow ? 1 : 0);

  const getTableData = () => {
    const rows: (string | number)[][] = [];
    rosterData.forEach((data) => {
      const rowsToExport = showAverageRow
        ? [...data.semesters, data.averageRow]
        : data.semesters;
      rowsToExport.forEach((semData) => {
        rows.push([
          data.rn,
          data.studentName,
          semData.semester,
          ...subjects.map(
            (s) =>
              semData.subjectScores[s.id]?.toFixed(
                semData.semester === 'average' ? 1 : 0
              ) || '0'
          ),
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
    ...subjects.map((s) => s.name),
    'Total',
    'Average',
    'Rank',
  ];

  const formatSemesterLabel = (semester: string) => {
    if (semester === 'average') return 'average';
    return semester;
  };

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />

      <div className="p-4 space-y-4">
        <h2 className="text-xl font-semibold text-primary">Student Roster</h2>

        <ActionButtons
          tableData={getTableData()}
          tableHeaders={tableHeaders}
          fileName="student-roster"
        />

        <div className="overflow-x-auto border rounded-lg">
          <table className="markbook-table">
            <thead>
              <tr>
                <th>RN</th>
                <th>Student Name</th>
                <th>Semester</th>
                {subjects.map((subject) => (
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
              {rosterData.map((data) => {
                const rowsToRender = showAverageRow
                  ? [...data.semesters, data.averageRow]
                  : data.semesters;

                return (
                  <Fragment key={data.studentId}>
                    {rowsToRender.map((semData, semIndex) => (
                      <tr
                        key={`${data.studentId}-${semData.semester}`}
                        className={
                          semData.semester === 'average' ? 'bg-[hsl(210,50%,90%)]' : ''
                        }
                      >
                        {semIndex === 0 && (
                          <>
                            <td className="font-medium align-top" rowSpan={rowCount}>
                              {data.rn}
                            </td>
                            <td className="text-left align-top" rowSpan={rowCount}>
                              {data.studentName}
                            </td>
                          </>
                        )}
                        <td
                          className={
                            semData.semester === 'average' ? 'font-medium italic' : ''
                          }
                        >
                          {formatSemesterLabel(semData.semester)}
                        </td>
                        {subjects.map((subject) => (
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
                  </Fragment>
                );
              })}
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

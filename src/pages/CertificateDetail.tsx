import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useMarkbook } from "@/context/MarkbookContext";

const gradeLabel = (avg: number) => {
  if (avg >= 90) return "Excellent";
  if (avg >= 80) return "Very Good";
  if (avg >= 60) return "Satisfactory";
  if (avg >= 50) return "Fair";
  return "Poor & Failure";
};

const Field = ({ label, value }: { label: string; value: string | number }) => (
  <div className="flex items-end gap-2">
    <span className="text-sm font-medium whitespace-nowrap">{label}</span>
    <span className="flex-1 border-b certificate-border border-opacity-60 px-2 pb-0.5 text-sm">
      {value || "\u00A0"}
    </span>
  </div>
);

const CertificateDetail = () => {
  const { id } = useParams();
  const {
    state,
    getStudentSemesterScore,
    getSemesterAverage,
    getSemesterRank,
    getSemestersWithData,
  } = useMarkbook();
  const { students, subjects, schoolInfo } = state;

  const student = students.find((s) => s.id === id);

  if (!student) {
    return (
      <div className="min-h-screen bg-background p-6">
        <p>Student not found.</p>
        <Button asChild variant="outline" className="mt-4">
          <Link to="/certificate"><ArrowLeft className="w-4 h-4" /> Back</Link>
        </Button>
      </div>
    );
  }

  const semestersWithData = getSemestersWithData();
  const hasFirstSemester = semestersWithData.includes('1st');
  const hasSecondSemester = semestersWithData.includes('2nd');

  const formatScore = (score: number) => (score > 0 ? score.toFixed(0) : '');

  const getSubjectAverage = (subjectId: string) => {
    const scores = semestersWithData.map((semester) =>
      getStudentSemesterScore(student.id, subjectId, semester)
    );
    if (scores.length === 0) return 0;
    return scores.reduce((sum, score) => sum + score, 0) / scores.length;
  };

  const overallAvg =
    subjects.length > 0
      ? subjects.reduce((sum, subject) => sum + getSubjectAverage(subject.id), 0) /
        subjects.length
      : 0;

  const firstSemesterAvg = hasFirstSemester ? getSemesterAverage(student.id, '1st') : 0;
  const secondSemesterAvg = hasSecondSemester ? getSemesterAverage(student.id, '2nd') : 0;
  const firstSemesterRank = hasFirstSemester ? getSemesterRank(student.id, '1st') : 0;
  const secondSemesterRank = hasSecondSemester ? getSemesterRank(student.id, '2nd') : 0;
  const overallRankDisplay =
    semestersWithData.length === 1
      ? getSemesterRank(student.id, semestersWithData[0])
      : Math.round(
          semestersWithData.reduce(
            (sum, semester) => sum + getSemesterRank(student.id, semester),
            0
          ) / semestersWithData.length
        );

  return (
    <div className="min-h-screen bg-background">
      {/* Toolbar (hidden on print) */}
      <div className="print:hidden bg-primary text-primary-foreground px-4 py-3 flex items-center justify-between mb-8">
        <Button asChild variant="secondary" size="sm">
          <Link to="/certificate"><ArrowLeft className="w-4 h-4" /> Back</Link>
        </Button>
        <h1 className="font-bold">Student Report Card</h1>
        <Button size="sm" variant="secondary" onClick={() => window.print()}>
          <Printer className="w-4 h-4" /> Print
        </Button>
      </div>

      <div className="space-y-12">
        
        {/* PAGE 1: Cover / Student Identity Information */}
        <div className="relative">
          <section className="certificate-document p-8 min-h-screen flex flex-col justify-center print:page-break-after border-4">
            <div className="text-center space-y-1 mb-8">
              <p className="text-xs">በጉ/ቶ/ቀ/መ/በስልጤ ዞን በስልጤ ዞን ያሸር ክትበት ጋር</p>
              <p className="text-xs">በማዕ/ኢ/ክ/መ/ በስልጤ ዞን ትምህርት ቤቶች ጽ/ቤት</p>
              <h2 className="font-bold text-lg">C/E/R/S/Siltie Zone Education Office</h2>
              <div className="flex justify-center my-4">
                <div className="w-16 h-16 border-2 certificate-border rounded-full flex items-center justify-center">
                  <span className="text-xs font-bold text-center">School<br/>Seal</span>
                </div>
              </div>
              <h3 className="font-bold text-2xl mt-4">የስልጤ ወጣት ካርድ</h3>
              <h3 className="font-bold text-2xl">Student Report Card</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 mt-8">
              <Field label="School Name" value={schoolInfo.school} />
              <Field label="Kebele" value={student.kebele || ""} />
              <Field label="Name of Student" value={student.name} />
              <Field label="Sex" value={student.sex || ""} />
              <Field label="Age" value={student.age || ""} />
              <Field label="Higher/Farmers Asso." value={student.village || ""} />
              <Field label="Academic Year" value={student.year || schoolInfo.year} />
              <Field label="Class" value={schoolInfo.grade || schoolInfo.class || ""} />
              <Field label="Promoted To" value="" />
              <Field label="Directors Name" value="" />
              <Field label="Signature" value="" />
            </div>
          </section>
          <div className="absolute -bottom-6 right-8 text-lg font-bold text-blue-600 print:text-blue-600">Page 1</div>
        </div>

        {/* PAGE 2: Method of Marking */}
        <div className="relative">
          <section className="certificate-document p-8 min-h-screen flex flex-col justify-center print:page-break-after print:page-break-before border-4">
            <h3 className="text-center font-bold text-xl underline mb-6">METHOD OF MARKING</h3>
            
            <div className="space-y-6 text-sm">
              <p className="text-center font-semibold">Student's achievement in each class will be assigned the following values.</p>
              
              <div className="certificate-muted p-6 rounded space-y-2">
                <p className="font-semibold">Grading Scale:</p>
                <ul className="space-y-2 ml-4">
                  <li className="flex justify-between"><span>90 - 100%</span> <span className="font-semibold">Excellent</span></li>
                  <li className="flex justify-between"><span>80 - 89%</span> <span className="font-semibold">Very Good</span></li>
                  <li className="flex justify-between"><span>60 - 79%</span> <span className="font-semibold">Satisfactory</span></li>
                  <li className="flex justify-between"><span>50 - 59%</span> <span className="font-semibold">Fair</span></li>
                  <li className="flex justify-between"><span>Below 50%</span> <span className="font-semibold">Poor & Failure</span></li>
                </ul>
              </div>

              <div className="space-y-3">
                <p className="font-semibold">Important Notes:</p>
                <p>
                  A mark zero (0%) should never be given, since it would mean no work has been done absolutely. 
                  If a student has been absent from class for whole period and has not made up any of the work 
                  he/she should be marked "AB" for absent.
                </p>
              </div>
            </div>
          </section>
          <div className="absolute -bottom-6 right-8 text-lg font-bold text-blue-600 print:text-blue-600">Page 2</div>
        </div>

        {/* PAGE 3: Subjects / Marks Table */}
        <div className="relative">
          <section className="certificate-document p-8 min-h-screen flex flex-col print:page-break-after print:page-break-before border-4">
            <h3 className="text-center font-bold text-lg mb-4">Academic Performance - All Subjects</h3>
            
            <table className="w-full border-collapse text-sm mb-6">
              <thead>
                <tr className="certificate-muted">
                  <th className="border certificate-border p-3 text-left font-bold">Subject</th>
                  <th className="border certificate-border p-3 font-bold text-center">1st Semester</th>
                  <th className="border certificate-border p-3 font-bold text-center">2nd Semester</th>
                  <th className="border certificate-border p-3 font-bold text-center">Average</th>
                </tr>
              </thead>
              <tbody>
                {subjects.map((sub) => {
                  const firstScore = hasFirstSemester
                    ? getStudentSemesterScore(student.id, sub.id, '1st')
                    : 0;
                  const secondScore = hasSecondSemester
                    ? getStudentSemesterScore(student.id, sub.id, '2nd')
                    : 0;
                  const average = getSubjectAverage(sub.id);

                  return (
                    <tr key={sub.id} className="hover:bg-blue-100/50">
                      <td className="border certificate-border p-3">{sub.name}</td>
                      <td className="border certificate-border p-3 text-center">
                        {hasFirstSemester ? formatScore(firstScore) : '-'}
                      </td>
                      <td className="border certificate-border p-3 text-center">
                        {hasSecondSemester ? formatScore(secondScore) : '-'}
                      </td>
                      <td className="border certificate-border p-3 text-center font-semibold">
                        {average > 0 ? average.toFixed(0) : ''}
                      </td>
                    </tr>
                  );
                })}
                <tr className="certificate-highlight font-semibold">
                  <td className="border certificate-border p-3 font-bold">Average</td>
                  <td className="border certificate-border p-3 text-center text-lg font-bold">
                    {hasFirstSemester ? firstSemesterAvg.toFixed(1) : '-'}
                  </td>
                  <td className="border certificate-border p-3 text-center text-lg font-bold">
                    {hasSecondSemester ? secondSemesterAvg.toFixed(1) : '-'}
                  </td>
                  <td className="border certificate-border p-3 text-center text-lg font-bold">
                    {overallAvg.toFixed(1)}
                  </td>
                </tr>
                <tr className="certificate-highlight font-semibold">
                  <td className="border certificate-border p-3 font-bold">Rank</td>
                  <td className="border certificate-border p-3 text-center text-lg font-bold">
                    {hasFirstSemester ? firstSemesterRank : '-'}
                  </td>
                  <td className="border certificate-border p-3 text-center text-lg font-bold">
                    {hasSecondSemester ? secondSemesterRank : '-'}
                  </td>
                  <td className="border certificate-border p-3 text-center text-lg font-bold">
                    {overallRankDisplay}
                  </td>
                </tr>
              </tbody>
            </table>

            <div className="mt-auto grid grid-cols-3 gap-4 text-xs">
              <div className="text-center">
                <div className="border-b certificate-border h-8 mb-2"></div>
                <p>School Seal</p>
              </div>
              <div className="text-center">
                <div className="border-b certificate-border h-8 mb-2"></div>
                <p>Director Name</p>
              </div>
              <div className="text-center">
                <div className="border-b certificate-border h-8 mb-2"></div>
                <p>Director Signature</p>
              </div>
            </div>
          </section>
          <div className="absolute -bottom-6 right-8 text-lg font-bold text-blue-600 print:text-blue-600">Page 3</div>
        </div>

        {/* PAGE 4: Remarks From Teachers */}
        <div className="relative">
          <section className="certificate-document p-8 min-h-screen flex flex-col print:page-break-before border-4">
            <h3 className="text-center font-bold text-lg mb-8">Remarks From Home — Room Teacher</h3>

            {/* First Semester */}
            <div className="mb-12">
              <h4 className="font-semibold mb-4">1st Semester</h4>
              <div className="space-y-1 mb-6">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="border-b certificate-border border-opacity-40 h-6" />
                ))}
              </div>
              <div className="grid grid-cols-2 gap-8">
                <div>
                  <p className="text-xs font-medium mb-2">Signature of Home-Room Teacher</p>
                  <div className="border-b certificate-border h-8"></div>
                </div>
                <div>
                  <p className="text-xs font-medium mb-2">Signature Of Parent or Guardian</p>
                  <div className="border-b certificate-border h-8"></div>
                </div>
              </div>
            </div>

            {/* Second Semester */}
            <div className="mt-auto">
              <h4 className="font-semibold mb-4">2nd Semester</h4>
              <div className="space-y-1 mb-6">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="border-b certificate-border border-opacity-40 h-6" />
                ))}
              </div>
              <div className="grid grid-cols-2 gap-8">
                <div>
                  <p className="text-xs font-medium mb-2">Signature of Home-Room Teacher</p>
                  <div className="border-b certificate-border h-8"></div>
                </div>
                <div>
                  <p className="text-xs font-medium mb-2">Signature Of Parent or Guardian</p>
                  <div className="border-b certificate-border h-8"></div>
                </div>
              </div>
            </div>
          </section>
          <div className="absolute -bottom-6 right-8 text-lg font-bold text-blue-600 print:text-blue-600">Page 4</div>
        </div>
      </div>
    </div>
  );
};

export default CertificateDetail;

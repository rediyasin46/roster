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
    <span className="flex-1 border-b border-foreground/60 px-2 pb-0.5 text-sm">
      {value || "\u00A0"}
    </span>
  </div>
);

const CertificateDetail = () => {
  const { id } = useParams();
  const { state, getStudentTotal, getOverallAverage, getOverallRank } = useMarkbook();
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

  const overallAvg = getOverallAverage(student.id);
  const overallRank = getOverallRank(student.id);

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Toolbar (hidden on print) */}
      <div className="print:hidden bg-primary text-primary-foreground px-4 py-3 flex items-center justify-between">
        <Button asChild variant="secondary" size="sm">
          <Link to="/certificate"><ArrowLeft className="w-4 h-4" /> Back</Link>
        </Button>
        <h1 className="font-bold">Student Report Card</h1>
        <Button size="sm" variant="secondary" onClick={() => window.print()}>
          <Printer className="w-4 h-4" /> Print
        </Button>
      </div>

      <div className="max-w-3xl mx-auto bg-card shadow print:shadow-none">
        
        {/* PAGE 1: Cover / Student Identity Information */}
        <section className="p-8 min-h-screen flex flex-col justify-center print:page-break-after">
          <div className="text-center space-y-1 mb-8">
            <p className="text-xs">በጉ/ቶ/ቀ/መ/በስልጤ ዞን በስልጤ ዞን ያሸር ክትበት ጋር</p>
            <p className="text-xs">በማዕ/ኢ/ክ/መ/ በስልጤ ዞን ትምህርት ቤቶች ጽ/ቤት</p>
            <h2 className="font-bold text-lg">C/E/R/S/Siltie Zone Education Office</h2>
            <div className="flex justify-center my-4">
              <div className="w-16 h-16 border-2 border-foreground rounded-full flex items-center justify-center">
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

        {/* PAGE 2: Method of Marking */}
        <section className="p-8 min-h-screen flex flex-col justify-center print:page-break-after print:page-break-before">
          <h3 className="text-center font-bold text-xl underline mb-6">METHOD OF MARKING</h3>
          
          <div className="space-y-6 text-sm">
            <p className="text-center font-semibold">Student's achievement in each class will be assigned the following values.</p>
            
            <div className="bg-muted p-6 rounded space-y-2">
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

        {/* PAGE 3: Subjects / Marks Table */}
        <section className="p-8 min-h-screen flex flex-col print:page-break-after print:page-break-before">
          <h3 className="text-center font-bold text-lg mb-4">Academic Performance - All Subjects</h3>
          
          <table className="w-full border-collapse text-sm mb-6">
            <thead>
              <tr className="bg-muted">
                <th className="border border-foreground p-3 text-left font-bold">Subject</th>
                <th className="border border-foreground p-3 font-bold text-center">1st Semester</th>
                <th className="border border-foreground p-3 font-bold text-center">2nd Semester</th>
                <th className="border border-foreground p-3 font-bold text-center">Average</th>
              </tr>
            </thead>
            <tbody>
              {subjects.map((sub) => {
                const total = getStudentTotal(student.id, sub.id);
                return (
                  <tr key={sub.id} className="hover:bg-muted/50">
                    <td className="border border-foreground p-3">{sub.name}</td>
                    <td className="border border-foreground p-3 text-center">{total > 0 ? total.toFixed(0) : ""}</td>
                    <td className="border border-foreground p-3 text-center"></td>
                    <td className="border border-foreground p-3 text-center font-semibold">{total > 0 ? total.toFixed(0) : ""}</td>
                  </tr>
                );
              })}
              <tr className="bg-muted font-semibold">
                <td className="border border-foreground p-3">Average</td>
                <td colSpan={3} className="border border-foreground p-3 text-center text-lg">
                  {overallAvg.toFixed(1)}
                </td>
              </tr>
              <tr className="bg-muted font-semibold">
                <td className="border border-foreground p-3">Rank</td>
                <td colSpan={3} className="border border-foreground p-3 text-center text-lg">
                  {overallRank}
                </td>
              </tr>
            </tbody>
          </table>

          <div className="mt-auto grid grid-cols-3 gap-4 text-xs">
            <div className="text-center">
              <div className="border-b border-foreground h-8 mb-2"></div>
              <p>School Seal</p>
            </div>
            <div className="text-center">
              <div className="border-b border-foreground h-8 mb-2"></div>
              <p>Director Name</p>
            </div>
            <div className="text-center">
              <div className="border-b border-foreground h-8 mb-2"></div>
              <p>Director Signature</p>
            </div>
          </div>
        </section>

        {/* PAGE 4: Remarks From Teachers */}
        <section className="p-8 min-h-screen flex flex-col print:page-break-before">
          <h3 className="text-center font-bold text-lg mb-8">Remarks From Home — Room Teacher</h3>

          {/* First Semester */}
          <div className="mb-12">
            <h4 className="font-semibold mb-4">1st Semester</h4>
            <div className="space-y-1 mb-6">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="border-b border-foreground/40 h-6" />
              ))}
            </div>
            <div className="grid grid-cols-2 gap-8">
              <div>
                <p className="text-xs font-medium mb-2">Signature of Home-Room Teacher</p>
                <div className="border-b border-foreground h-8"></div>
              </div>
              <div>
                <p className="text-xs font-medium mb-2">Signature Of Parent or Guardian</p>
                <div className="border-b border-foreground h-8"></div>
              </div>
            </div>
          </div>

          {/* Second Semester */}
          <div className="mt-auto">
            <h4 className="font-semibold mb-4">2nd Semester</h4>
            <div className="space-y-1 mb-6">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="border-b border-foreground/40 h-6" />
              ))}
            </div>
            <div className="grid grid-cols-2 gap-8">
              <div>
                <p className="text-xs font-medium mb-2">Signature of Home-Room Teacher</p>
                <div className="border-b border-foreground h-8"></div>
              </div>
              <div>
                <p className="text-xs font-medium mb-2">Signature Of Parent or Guardian</p>
                <div className="border-b border-foreground h-8"></div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default CertificateDetail;

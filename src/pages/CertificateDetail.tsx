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

      <div className="max-w-3xl mx-auto bg-card p-8 my-6 shadow print:shadow-none print:my-0 print:max-w-none">
        {/* Page 1: Cover / Identity */}
        <section className="space-y-4">
          <div className="text-center space-y-1">
            <p className="text-sm">በጉ/ቶ/ቀ/መ/በስልጤ ዞን በስልጤ ዞን ያሸር ክትበት ጋር</p>
            <p className="text-sm">በማዕ/ኢ/ክ/መ/ በስልጤ ዞን ትምህርት ቤቶች ጽ/ቤት</p>
            <h2 className="font-bold text-lg">C/E/R/S/Siltie Zone Education Office</h2>
            <h3 className="font-bold text-xl mt-2">Student Report Card</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3 mt-6">
            <Field label="School Name" value={schoolInfo.school} />
            <Field label="Kebele" value={student.kebele || ""} />
            <Field label="Name of Student" value={student.name} />
            <Field label="Sex" value={student.sex || ""} />
            <Field label="Age" value={student.age || ""} />
            <Field label="Higher/Farmers Asso." value={student.village || ""} />
            <Field label="Academic Year" value={student.year || schoolInfo.year} />
            <Field label="Class" value={schoolInfo.class || ""} />
            <Field label="Promoted To" value="" />
            <Field label="Directors Name" value="" />
            <Field label="Signature" value="" />
          </div>
        </section>

        {/* Page 2: Marks table */}
        <section className="mt-10 break-before-page">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr>
                <th className="border border-foreground p-2 text-left">Subject</th>
                <th className="border border-foreground p-2">1st Semester</th>
                <th className="border border-foreground p-2">2nd Semester</th>
                <th className="border border-foreground p-2">Average</th>
              </tr>
            </thead>
            <tbody>
              {subjects.map((sub) => {
                const total = getStudentTotal(student.id, sub.id);
                return (
                  <tr key={sub.id}>
                    <td className="border border-foreground p-2">{sub.name}</td>
                    <td className="border border-foreground p-2 text-center">{total || ""}</td>
                    <td className="border border-foreground p-2 text-center"></td>
                    <td className="border border-foreground p-2 text-center">{total || ""}</td>
                  </tr>
                );
              })}
              <tr>
                <td className="border border-foreground p-2 font-semibold">Average</td>
                <td className="border border-foreground p-2 text-center" colSpan={3}>
                  {overallAvg.toFixed(2)}
                </td>
              </tr>
              <tr>
                <td className="border border-foreground p-2 font-semibold">Rank</td>
                <td className="border border-foreground p-2 text-center" colSpan={3}>
                  {overallRank}
                </td>
              </tr>
            </tbody>
          </table>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6 text-sm">
            <Field label="School Seal" value="" />
            <Field label="Director Name" value="" />
            <Field label="Director Signature" value="" />
          </div>
        </section>

        {/* Page 3: Method of Marking */}
        <section className="mt-10 break-before-page">
          <h3 className="text-center font-bold text-lg underline">METHOD OF MARKING</h3>
          <p className="mt-4 text-sm">Student's achievement in each class will be assigned the following values.</p>
          <ul className="mt-3 pl-8 text-sm space-y-1">
            <li>90 - 100% Excellent</li>
            <li>80 - 89% Very good</li>
            <li>60 - 79% Satisfactory</li>
            <li>50 - 59% Fair</li>
            <li>Below 50% Poor & Failure</li>
          </ul>
          <p className="mt-4 text-sm">
            A mark zero (0%) should never be given, since it would mean no work has been done absolutely.
            If a student has been absent from class for whole period and has not made up any of the work
            he/she should be marked "AB" for absent.
          </p>
          <p className="mt-3 text-sm font-medium">
            This student's overall result: <span className="font-bold">{gradeLabel(overallAvg)}</span>
          </p>
        </section>

        {/* Page 4: Remarks */}
        <section className="mt-10 break-before-page">
          <h3 className="text-center font-bold text-lg">Remarks From Home — Room Teacher</h3>

          <div className="mt-6 space-y-3">
            <p className="text-sm font-medium">First Semester</p>
            {[1,2,3,4].map(i => <div key={i} className="border-b border-foreground/60 h-6" />)}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
              <Field label="Signature of Home-Room Teacher" value="" />
              <Field label="Signature Of Parent or Guardian" value="" />
            </div>
          </div>

          <div className="mt-8 space-y-3">
            <p className="text-sm font-medium">Second Semester</p>
            {[1,2,3,4].map(i => <div key={i} className="border-b border-foreground/60 h-6" />)}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
              <Field label="Signature of Home-Room Teacher" value="" />
              <Field label="Signature Of Parent or Guardian" value="" />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default CertificateDetail;

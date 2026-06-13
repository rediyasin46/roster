import { Link } from "react-router-dom";
import { Eye } from "lucide-react";
import { Navigation } from "@/components/Navigation";
import { SchoolInfoHeader } from "@/components/SchoolInfoHeader";
import { Button } from "@/components/ui/button";
import { useMarkbook } from "@/context/MarkbookContext";

const Certificate = () => {
  const { state } = useMarkbook();
  const { students, schoolInfo } = state;

  return (
    <div className="min-h-screen bg-background">
      <div className="markbook-header flex items-center justify-between">
        <h1 className="text-2xl font-bold">Markbook</h1>
        <Navigation />
      </div>

      <div className="p-4 space-y-4">
        <h2 className="text-xl font-semibold text-primary">Student Certificates</h2>
        <SchoolInfoHeader showClass showStudentCount />

        <div className="overflow-x-auto border rounded-lg">
          <table className="markbook-table">
            <thead>
              <tr>
                <th>RN</th>
                <th>Name</th>
                <th>Sex</th>
                <th>Age</th>
                <th>Village</th>
                <th>Kebele</th>
                <th>Year</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {students.map((s) => (
                <tr key={s.id}>
                  <td className="font-medium">{s.rn}</td>
                  <td className="text-left">{s.name}</td>
                  <td>{s.sex || '-'}</td>
                  <td>{s.age || '-'}</td>
                  <td>{s.village || '-'}</td>
                  <td>{s.kebele || '-'}</td>
                  <td>{s.year || schoolInfo.year}</td>
                  <td>
                    <Button asChild size="sm" variant="default">
                      <Link to={`/certificate/${s.id}`}>
                        <Eye className="w-4 h-4" />
                        View Certificate
                      </Link>
                    </Button>
                  </td>
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
};

export default Certificate;

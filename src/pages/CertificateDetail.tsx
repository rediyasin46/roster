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
              <p className="text-lg">በጉ/ቶ/ቀ/መ/በስልጤ ዞን በስልጤ ዞን ያሸር ክትበት ጋር</p>
              <p className="text-lg">በማዕ/ኢ/ክ/መ/ በስልጤ ዞን ትምህርት ቤቶች ጽ/ቤት</p>
              <h2 className="font-bold text-xl">C/E/R/S/Siltie Zone Education Office</h2>
              <div className="flex justify-center my-4">
                <div className="w-16 h-16 border-2 certificate-border rounded-full flex items-center justify-center">
                  <span className="text-xs font-bold text-center">School<br/>Seal</span>
                </div>
              </div>
              <h3 className="font-bold text-2xl mt-4">የደረሳይ ውጣት ካርድ</h3>
              <h3 className="font-bold text-xl">የተማሪው ውጤት መግለጫ</h3>
              <h3 className="font-bold text-xl">Student Report Card</h3>
            </div>

            <div className="space-y-3 text-lg">
              <div>
                <div className="flex items-end gap-2">
                  <span className="font-medium whitespace-nowrap">የመድረሳይ ሱም</span>
                  <span className="flex-1 border-b border-black pb-0.5">{schoolInfo.school || ""}</span>
                  <span className="font-medium whitespace-nowrap">ቀበሌ</span>
                </div>
                <div>School Name{schoolInfo.school || ""}</div>
              </div>
              <div>
                <div className="flex items-end gap-2">
                  <span className="font-medium whitespace-nowrap">ት/ቤቱ ስም</span>
                  <span className="flex-1 border-b border-black pb-0.5">{student.kebele || ""}</span>
                </div>
                <div>Kebele{student.kebele || ""}</div>
              </div>
              <div>
                <div className="flex items-end gap-2">
                  <span className="font-medium whitespace-nowrap">የደረሳይ ሱም</span>
                  <span className="flex-1 border-b border-black pb-0.5">{student.name || ""}</span>
                </div>
                <div>Name of Student{student.name || ""}</div>
              </div>
              <div>
                <div className="flex items-end gap-2">
                  <span className="font-medium whitespace-nowrap">የተማሪው/ዋ/ ስም</span>
                  <span className="flex-1 border-b border-black pb-0.5"></span>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-1">
                  <div className="flex items-end gap-2">
                    <span className="font-medium whitespace-nowrap">ል.ገ</span>
                    <span className="flex-1 border-b border-black pb-0.5">{student.sex || ""}</span>
                    <span className="font-medium whitespace-nowrap">ኡምር</span>
                    <span className="flex-1 border-b border-black pb-0.5">{student.age || ""}</span>
                  </div>
                  <div className="flex gap-4">
                    <span>Sex</span>
                    <span>Age</span>
                  </div>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-1">
                  <div className="flex items-end gap-2">
                    <span className="font-medium whitespace-nowrap">ከፍተኛ/ገበሬ ማህበር</span>
                    <span className="flex-1 border-b border-black pb-0.5">{student.village || ""}</span>
                    <span className="font-medium whitespace-nowrap">ቀበሌ</span>
                    <span className="flex-1 border-b border-black pb-0.5"></span>
                  </div>
                  <div className="flex gap-4">
                    <span>Higher/Farmers Asso.</span>
                    <span>Kebele</span>
                  </div>
                </div>
              </div>
              <div>
                <div className="flex items-end gap-2">
                  <span className="font-medium whitespace-nowrap">የአሸር ዘማን</span>
                  <span className="flex-1 border-b border-black pb-0.5">{student.year || schoolInfo.year || ""}</span>
                </div>
                <div>Academic Year{student.year || schoolInfo.year || ""}</div>
              </div>
              <div>
                <div className="flex items-end gap-2">
                  <span className="font-medium whitespace-nowrap">የትምህር ዘመን</span>
                  <span className="flex-1 border-b border-black pb-0.5">{student.year || schoolInfo.year || ""}</span>
                </div>
                <div>Academic Year{student.year || schoolInfo.year || ""}</div>
              </div>
              <div>
                <div className="flex items-end gap-2">
                  <span className="font-medium whitespace-nowrap">ጎልጌ</span>
                  <span className="flex-1 border-b border-black pb-0.5">{schoolInfo.grade || schoolInfo.class || ""}</span>
                </div>
                <div>Class{schoolInfo.grade || schoolInfo.class || ""}</div>
              </div>
              <div>
                <div className="flex items-end gap-2">
                  <span className="font-medium whitespace-nowrap">ክፍት</span>
                  <span className="flex-1 border-b border-black pb-0.5"></span>
                </div>
              </div>
              <div>
                <div className="flex items-end gap-2">
                  <span className="font-medium whitespace-nowrap">የ/ወደ</span>
                  <span>ጎልጌ ኤት አለፋን(ታት)ክፍል ተዘዋውራል/ለች</span>
                </div>
                <div>Promoted To</div>
              </div>
              <div className="flex gap-4">
                <div className="flex-1">
                  <div className="flex items-end gap-2">
                    <span className="font-medium whitespace-nowrap">የኡስታዚ ሱም</span>
                    <span className="flex-1 border-b border-black pb-0.5"></span>
                    <span className="font-medium whitespace-nowrap">መልከት</span>
                    <span className="flex-1 border-b border-black pb-0.5"></span>
                  </div>
                  <div className="flex gap-4">
                    <span>Directors Name</span>
                    <span>Signature</span>
                  </div>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-1">
                  <div className="flex items-end gap-2">
                    <span className="font-medium whitespace-nowrap">የርዕሰ መምህሩ ስም</span>
                    <span className="flex-1 border-b border-black pb-0.5"></span>
                    <span className="font-medium whitespace-nowrap">ፊርማ</span>
                    <span className="flex-1 border-b border-black pb-0.5"></span>
                  </div>
                </div>
              </div>
            </div>
          </section>
          <div className="absolute -bottom-6 right-8 text-lg font-bold text-blue-600 print:text-blue-600">Page 1</div>
        </div>

        {/* PAGE 2: Method of Marking */}
        <div className="relative">
          <section className="certificate-document p-8 min-h-screen flex flex-col justify-center print:page-break-after print:page-break-before border-4">
            <h3 className="text-center font-bold text-2xl underline mb-6">ማርክ ያቦት ሃለት</h3>
            <h3 className="text-center font-bold text-2xl underline mb-8">የማርክ አሰጣጥ ደንብ</h3>
            
            <div className="space-y-6 text-lg">
              <p className="text-justify">
                ትምህርት ቤቶች በመዝገብ ውስጥ የሚጽፏቸው ተማሪዎች
              </p>
              <p className="text-justify mb-6">
                የትምህርት ደረጃ በሚከተለው አይነት ይመደባል፡፡
              </p>
              
              <ul className="space-y-2 ml-8 mb-8">
                <li>90 -100% ያገኘ እጅግ በጣም ጥሩ/የረከበ ስረም ስረም ፊያን</li>
                <li>80 — 89% ያገኘ በጣም ጥሩ/የረከበ ስረም ፊያን</li>
                <li>60 — 79% ያገኘ በቂ/የረከበ ፊያን</li>
                <li>50 — 59% ያገኘ መጠነኛ/የረከበ ልከኛን</li>
                <li>50% በታች ያገኘ ዝቅተኛ/ኮሎ የረከበ ህርከተኛን</li>
              </ul>
              
              <p className="text-justify">
                ከመቶ ዜሮ (0%) ምንምጊዜ ቢሆን ለተማሪ አይሰጥም. ዜሮ መስጠት ፈጽሞ አልተማረም ማለት ነው፡፡ ተማሪው ከክፍሉ ያልተገኘ እንደሆነ አልነበረም ተብሎ ይፃፋል፡፡
              </p>

              <h3 className="text-center font-bold text-2xl underline mt-12 mb-6">METHOD OF MARKING</h3>
              
              <p className="text-justify mb-4">
                Student's achievement in each class will be assigned the following values.
              </p>

              <ul className="space-y-2 ml-8 mb-6">
                <li>90 - 100% Excellent</li>
                <li>80 – 89% Very good</li>
                <li>60 – 79% Satisfactory</li>
                <li>50 – 59% Fair</li>
                <li>Below 50% Poor & Failure</li>
              </ul>

              <p className="text-justify">
                A mark zero (0%) should never be given, since it would mean no work has should been done absolutely. If a student has been absent from class for whole period and has not made up any of the work he/she should be marked “AB” for absent
              </p>
            </div>
          </section>
          <div className="absolute -bottom-6 right-8 text-lg font-bold text-blue-600 print:text-blue-600">Page 2</div>
        </div>

        {/* PAGE 3: Subjects / Marks Table */}
        <div className="relative">
          <section className="certificate-document p-8 min-h-screen flex flex-col print:page-break-after print:page-break-before border-4">
            <table className="w-full border-collapse text-base">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-black p-2 text-left font-bold">
                    <div>የአሸር ዓይነት</div>
                    <div>የትምህርት አይነት</div>
                    <div>Subject</div>
                  </th>
                  <th className="border border-black p-2 text-center font-bold">
                    <div>አደኛ የአሸር ወከት</div>
                    <div>1ኛ የትም/ወቅት</div>
                    <div>1st Semester</div>
                  </th>
                  <th className="border border-black p-2 text-center font-bold">
                    <div>2ኛ የአሸር ወከት</div>
                    <div>2ኛየትም/ወቅት</div>
                    <div>2nd Semester</div>
                  </th>
                  <th className="border border-black p-2 text-center font-bold">
                    <div>ውጤት</div>
                    <div>አ/ውጤት</div>
                    <div>Average</div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {[
                  "አማርኛ/Amharic",
                  "ሰልጥኛ/Seltigna",
                  "እንግሊዘኛ/English",
                  "ሒሳብ/Mathematics",
                  "የአካላይንስ/ያዝጋግ ሳ/Educational science",
                  "ጀ/ሳይንስ/G.science",
                  "Career&Techniq Edu",
                  "ሀግረተሰብ ሳ/Social Study",
                  "ሲትዝሽን/ Citizenship",
                  "ስነ—አህላች/ግብረ ገብ",
                  "የእዉኔዋየልስን ስነ ሉብ (Art)",
                  "ኢንቴክኖሎጂ/ ICT",
                  "Per/nce visual art(PVA)",
                  "ጂኦግራፊ/Geography",
                  "የጅስም ማቆመሬ/Ph. Education",
                  "ጠባይ/Conduct",
                  "የቀረበት ቀን/Absent",
                  "ጠ/ውጤት/ፒ/Grad"
                ].map((subject, index) => {
                  const subjectData = subjects[index];
                  const firstScore = subjectData && hasFirstSemester
                    ? getStudentSemesterScore(student.id, subjectData.id, '1st')
                    : 0;
                  const secondScore = subjectData && hasSecondSemester
                    ? getStudentSemesterScore(student.id, subjectData.id, '2nd')
                    : 0;
                  const average = subjectData ? getSubjectAverage(subjectData.id) : 0;
                  
                  return (
                    <tr key={index}>
                      <td className="border border-black p-2">{subject}</td>
                      <td className="border border-black p-2 text-center">
                        {subjectData && hasFirstSemester ? formatScore(firstScore) : ''}
                      </td>
                      <td className="border border-black p-2 text-center">
                        {subjectData && hasSecondSemester ? formatScore(secondScore) : ''}
                      </td>
                      <td className="border border-black p-2 text-center">
                        {subjectData && average > 0 ? average.toFixed(0) : ''}
                      </td>
                    </tr>
                  );
                })}
                <tr className="font-semibold">
                  <td className="border border-black p-2 font-bold">
                    <div>አማካይ ውጤት/Average</div>
                  </td>
                  <td className="border border-black p-2 text-center font-bold">
                    {hasFirstSemester ? firstSemesterAvg.toFixed(1) : ''}
                  </td>
                  <td className="border border-black p-2 text-center font-bold">
                    {hasSecondSemester ? secondSemesterAvg.toFixed(1) : ''}
                  </td>
                  <td className="border border-black p-2 text-center font-bold">
                    {overallAvg.toFixed(1)}
                  </td>
                </tr>
                <tr className="font-semibold">
                  <td className="border border-black p-2 font-bold">
                    <div>ክፍል ደረጃ/Rank</div>
                  </td>
                  <td className="border border-black p-2 text-center font-bold">
                    {hasFirstSemester ? firstSemesterRank : ''}
                  </td>
                  <td className="border border-black p-2 text-center font-bold">
                    {hasSecondSemester ? secondSemesterRank : ''}
                  </td>
                  <td className="border border-black p-2 text-center font-bold">
                    {overallRankDisplay}
                  </td>
                </tr>
              </tbody>
            </table>

            <div className="mt-8 flex justify-between text-base">
              <div>
                <span>የት/ቤቱ ማህተም</span>________________________
              </div>
              <div>
                <span>የርዕሰ መምህሩ ስም</span>________________________
              </div>
              <div>
                <span>የርዕሰ መምህሩ ፊርማ</span>________________________
              </div>
            </div>
            <div className="flex justify-between text-base">
              <div>School Seal</div>
              <div>Director Name</div>
              <div>Director Signature</div>
            </div>
          </section>
          <div className="absolute -bottom-6 right-8 text-lg font-bold text-blue-600 print:text-blue-600">Page 3</div>
        </div>

        {/* PAGE 4: Remarks From Teachers */}
        <div className="relative">
          <section className="certificate-document p-8 min-h-screen flex flex-col print:page-break-before border-4">
            <h3 className="text-center font-bold text-2xl mb-2">
              የጎልጌይ አሸር ጌተ ሽዢ
            </h3>
            <h3 className="text-center font-bold text-2xl mb-6">
              የክፍሉ መምህር አስተያየት
            </h3>
            <h3 className="text-center font-bold text-2xl mb-8">
              Remarks From Home — Room Teacher
            </h3>

            {/* First Semester */}
            <div className="mb-10">
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold">1ኛይ የአሸር ወቅት</span>
              </div>
              <div className="flex items-center gap-2 mb-4">
                <span className="text-xl font-bold">1ኛው የትም/ወቅት</span>
                <span className="flex-1 border-b border-black"></span>
              </div>
              <div className="text-xl font-bold mb-4">First Semester</div>
              
              <div className="space-y-1 mb-8">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="border-b border-black h-6 w-full" />
                ))}
              </div>
              
              <div className="mb-4">
                <div className="text-xl font-bold">
                  የጎልጌይ ወሻይብ አሸርጌተ መልከት
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xl font-bold">የክፍሉ ኃላፊ መምህር ፊርማ</span>
                  <span className="flex-1 border-b border-black"></span>
                </div>
                <div className="text-xl font-bold">
                  Signature of Home-Room Teacher
                </div>
              </div>

              <div>
                <div className="text-xl font-bold">
                  የወጄሎ ሀገጊና ያሌቂ መልከት
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xl font-bold">የወላጅ ወይም የአሳዳጊ ፊርማ</span>
                  <span className="flex-1 border-b border-black"></span>
                </div>
                <div className="text-xl font-bold">
                  Signature Of Parent or Guardian
                </div>
              </div>
            </div>

            {/* Second Semester */}
            <div className="mt-auto">
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold">2ኛይ የአሸር ወቅት</span>
              </div>
              <div className="flex items-center gap-2 mb-4">
                <span className="text-xl font-bold">2ኛው የትም/ወቅት</span>
                <span className="flex-1 border-b border-black"></span>
                <span>:</span>
                <span className="flex-1 border-b border-black"></span>
              </div>
              <div className="text-xl font-bold mb-4">Second Semester</div>
              
              <div className="space-y-1 mb-8">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="border-b border-black h-6 w-full" />
                ))}
              </div>
              
              <div className="mb-4">
                <div className="text-xl font-bold">
                  የጎልጌይ ወሻይብ አሸርጌተ መልከት
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xl font-bold">የክፍሉ ኃላፊ መምህር ፊርማ</span>
                  <span className="flex-1 border-b border-black"></span>
                </div>
                <div className="text-xl font-bold">
                  Signature Of Home - Room Teacher
                </div>
              </div>

              <div>
                <div className="text-xl font-bold">
                  የወላጅ ወይም የአሳዳጊ ፊርማ
                </div>
                <span className="flex-1 border-b border-black"></span>
                <div className="text-xl font-bold">
                  Signature Of Parent or Guardian
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

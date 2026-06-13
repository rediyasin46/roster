import { useMemo, useState } from 'react';
import { useMarkbook } from '@/context/MarkbookContext';
import { Navigation } from '@/components/Navigation';
import { Card } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  RadarChart,
  Radar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
} from 'recharts';
import {
  Users,
  TrendingUp,
  Target,
  Award,
  AlertCircle,
  BarChart3,
  PieChart as PieChartIcon,
  TrendingDown,
} from 'lucide-react';

export default function Analysis() {
  const { state, getStudentTotal, getOverallTotal } = useMarkbook();
  const { students, subjects, assessments, schoolInfo } = state;
  const [selectedSubject, setSelectedSubject] = useState<string | null>(
    subjects.length > 0 ? subjects[0].id : null
  );

  // Calculate statistics
  const stats = useMemo(() => {
    if (students.length === 0) {
      return {
        totalStudents: 0,
        classAverage: 0,
        passRate: 0,
        topScore: 0,
        lowestScore: 0,
        passCount: 0,
        failCount: 0,
      };
    }

    const subject = selectedSubject;
    const scores = students.map(student => getStudentTotal(student.id, subject!));
    const validScores = scores.filter(s => s > 0);

    const average = validScores.length > 0 
      ? validScores.reduce((a, b) => a + b, 0) / validScores.length 
      : 0;
    
    const passCount = validScores.filter(s => s >= 50).length;
    const failCount = validScores.filter(s => s < 50).length;
    const passRate = validScores.length > 0 
      ? (passCount / validScores.length) * 100 
      : 0;

    return {
      totalStudents: students.length,
      classAverage: average,
      passRate,
      topScore: Math.max(...validScores, 0),
      lowestScore: validScores.length > 0 ? Math.min(...validScores) : 0,
      passCount,
      failCount,
    };
  }, [students, selectedSubject, getStudentTotal]);

  // Grade distribution
  const gradeDistribution = useMemo(() => {
    if (!selectedSubject || students.length === 0) return [];

    const grades = { 'A (90-100)': 0, 'B (80-89)': 0, 'C (70-79)': 0, 'D (60-69)': 0, 'F (<60)': 0 };
    
    students.forEach(student => {
      const score = getStudentTotal(student.id, selectedSubject);
      if (score >= 90) grades['A (90-100)']++;
      else if (score >= 80) grades['B (80-89)']++;
      else if (score >= 70) grades['C (70-79)']++;
      else if (score >= 60) grades['D (60-69)']++;
      else grades['F (<60)']++;
    });

    return Object.entries(grades).map(([grade, count]) => ({ grade, count }));
  }, [students, selectedSubject, getStudentTotal]);

  // Subject-wise performance
  const subjectPerformance = useMemo(() => {
    if (students.length === 0) return [];

    return subjects.map(subject => {
      const scores = students.map(student => getStudentTotal(student.id, subject.id));
      const validScores = scores.filter(s => s > 0);
      const average = validScores.length > 0
        ? validScores.reduce((a, b) => a + b, 0) / validScores.length
        : 0;
      return {
        name: subject.name,
        average: Math.round(average),
        total: Math.round(validScores.reduce((a, b) => a + b, 0)),
      };
    });
  }, [students, subjects, getStudentTotal]);

  // Top 5 and Bottom 5 students
  const topAndBottomStudents = useMemo(() => {
    if (!selectedSubject || students.length === 0) {
      return { top: [], bottom: [] };
    }

    const studentScores = students
      .map(student => ({
        name: student.name,
        rn: student.rn,
        score: getStudentTotal(student.id, selectedSubject),
      }))
      .filter(s => s.score > 0)
      .sort((a, b) => b.score - a.score);

    return {
      top: studentScores.slice(0, 5),
      bottom: studentScores.slice(-5).reverse(),
    };
  }, [students, selectedSubject, getStudentTotal]);

  // Pass/Fail data
  const passFailData = useMemo(() => [
    { name: 'Passed', value: stats.passCount, fill: '#10b981' },
    { name: 'Failed', value: stats.failCount, fill: '#ef4444' },
  ], [stats]);

  // Gender breakdown
  const genderBreakdown = useMemo(() => {
    if (!selectedSubject || students.length === 0) return [];

    const genders: { [key: string]: { count: number; totalScore: number } } = {};
    
    students.forEach(student => {
      const gender = student.sex || 'Unknown';
      const score = getStudentTotal(student.id, selectedSubject);
      
      if (!genders[gender]) {
        genders[gender] = { count: 0, totalScore: 0 };
      }
      genders[gender].count++;
      genders[gender].totalScore += score;
    });

    return Object.entries(genders).map(([gender, data]) => ({
      gender,
      average: Math.round(data.totalScore / data.count),
      count: data.count,
    }));
  }, [students, selectedSubject, getStudentTotal]);

  const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#06b6d4'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Performance Analytics</h1>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{schoolInfo.school} • {schoolInfo.year}</p>
          </div>
          <Navigation />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Filter Section */}
        <div className="flex gap-4 items-end">
          <div className="flex-1">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Select Subject
            </label>
            <Select value={selectedSubject || ''} onValueChange={setSelectedSubject}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {subjects.map(subject => (
                  <SelectItem key={subject.id} value={subject.id}>
                    {subject.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Overview Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-900/40 rounded-3xl shadow-sm p-6 border border-blue-200 dark:border-blue-700/50 hover:shadow-lg transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-700 dark:text-blue-300">Total Students</p>
                <p className="text-2xl font-bold text-blue-900 dark:text-blue-100 mt-2">{stats.totalStudents}</p>
              </div>
              <div className="bg-blue-200 dark:bg-blue-800 p-4 rounded-full">
                <Users className="w-6 h-6 text-blue-700 dark:text-blue-300" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-900/20 dark:to-indigo-900/40 rounded-3xl shadow-sm p-6 border border-indigo-200 dark:border-indigo-700/50 hover:shadow-lg transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-indigo-700 dark:text-indigo-300">Class Average</p>
                <p className="text-2xl font-bold text-indigo-900 dark:text-indigo-100 mt-2">{stats.classAverage.toFixed(1)}</p>
              </div>
              <div className="bg-indigo-200 dark:bg-indigo-800 p-4 rounded-full">
                <BarChart3 className="w-6 h-6 text-indigo-700 dark:text-indigo-300" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-900/40 rounded-3xl shadow-sm p-6 border border-green-200 dark:border-green-700/50 hover:shadow-lg transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-700 dark:text-green-300">Pass Rate</p>
                <p className="text-2xl font-bold text-green-900 dark:text-green-100 mt-2">{stats.passRate.toFixed(1)}%</p>
              </div>
              <div className="bg-green-200 dark:bg-green-800 p-4 rounded-full">
                <Target className="w-6 h-6 text-green-700 dark:text-green-300" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-900/40 rounded-3xl shadow-sm p-6 border border-amber-200 dark:border-amber-700/50 hover:shadow-lg transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-amber-700 dark:text-amber-300">Top Score</p>
                <p className="text-2xl font-bold text-amber-900 dark:text-amber-100 mt-2">{stats.topScore.toFixed(0)}</p>
              </div>
              <div className="bg-amber-200 dark:bg-amber-800 p-4 rounded-full">
                <Award className="w-6 h-6 text-amber-700 dark:text-amber-300" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-900/40 rounded-3xl shadow-sm p-6 border border-red-200 dark:border-red-700/50 hover:shadow-lg transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-red-700 dark:text-red-300">Lowest Score</p>
                <p className="text-2xl font-bold text-red-900 dark:text-red-100 mt-2">{stats.lowestScore.toFixed(0)}</p>
              </div>
              <div className="bg-red-200 dark:bg-red-800 p-4 rounded-full">
                <AlertCircle className="w-6 h-6 text-red-700 dark:text-red-300" />
              </div>
            </div>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Grade Distribution */}
          <Card className="bg-white dark:bg-slate-800 p-6 shadow-sm border-slate-200 dark:border-slate-700">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-6">Grade Distribution</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={gradeDistribution}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="grade" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1f2937',
                    border: 'none',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                  }}
                  labelStyle={{ color: '#f3f4f6' }}
                />
                <Bar dataKey="count" fill="#3b82f6" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          {/* Subject-wise Performance */}
          <Card className="bg-white dark:bg-slate-800 p-6 shadow-sm border-slate-200 dark:border-slate-700">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-6">Subject Performance</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={subjectPerformance}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" stroke="#6b7280" angle={-45} textAnchor="end" height={100} />
                <YAxis stroke="#6b7280" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1f2937',
                    border: 'none',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                  }}
                  labelStyle={{ color: '#f3f4f6' }}
                />
                <Bar dataKey="average" fill="#8b5cf6" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          {/* Performance Radar */}
          {subjectPerformance.length > 2 && (
            <Card className="bg-white dark:bg-slate-800 p-6 shadow-sm border-slate-200 dark:border-slate-700">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-6">Performance Radar</h2>
              <ResponsiveContainer width="100%" height={300}>
                <RadarChart data={subjectPerformance}>
                  <PolarGrid stroke="#e2e8f0" />
                  <PolarAngleAxis dataKey="name" stroke="#6b7280" />
                  <PolarRadiusAxis stroke="#6b7280" />
                  <Radar
                    name="Average Score"
                    dataKey="average"
                    stroke="#ec4899"
                    fill="#ec4899"
                    fillOpacity={0.6}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1f2937',
                      border: 'none',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                    }}
                    labelStyle={{ color: '#f3f4f6' }}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </Card>
          )}

          {/* Pass/Fail Distribution */}
          <Card className="bg-white dark:bg-slate-800 p-6 shadow-sm border-slate-200 dark:border-slate-700">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-6">Pass/Fail Distribution</h2>
            {stats.passCount + stats.failCount > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={passFailData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value, percent }) =>
                      `${name}: ${value} (${(percent * 100).toFixed(0)}%)`
                    }
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {passFailData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1f2937',
                      border: 'none',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                    }}
                    labelStyle={{ color: '#f3f4f6' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-slate-500 dark:text-slate-400">
                No data available
              </div>
            )}
          </Card>

          {/* Gender Breakdown */}
          {genderBreakdown.length > 0 && (
            <Card className="bg-white dark:bg-slate-800 p-6 shadow-sm border-slate-200 dark:border-slate-700">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-6">Gender Performance</h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={genderBreakdown}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="gender" stroke="#6b7280" />
                  <YAxis stroke="#6b7280" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1f2937',
                      border: 'none',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                    }}
                    labelStyle={{ color: '#f3f4f6' }}
                  />
                  <Legend />
                  <Bar dataKey="average" fill="#06b6d4" name="Average Score" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          )}
        </div>

        {/* Top and Bottom Students Tables */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Top 5 Students */}
          <Card className="bg-white dark:bg-slate-800 p-6 shadow-sm border-slate-200 dark:border-slate-700">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-600" />
              Top 5 Students
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-700">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700 dark:text-slate-300">Rank</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700 dark:text-slate-300">Name</th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-slate-700 dark:text-slate-300">Score</th>
                  </tr>
                </thead>
                <tbody>
                  {topAndBottomStudents.top.map((student, idx) => (
                    <tr
                      key={idx}
                      className="border-b border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50"
                    >
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-green-100 dark:bg-green-900/30 text-sm font-semibold text-green-700 dark:text-green-400">
                          {idx + 1}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm text-slate-900 dark:text-white">{student.name || `Student ${student.rn}`}</td>
                      <td className="py-3 px-4 text-right text-sm font-semibold text-slate-900 dark:text-white">{student.score.toFixed(0)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Bottom 5 Students */}
          <Card className="bg-white dark:bg-slate-800 p-6 shadow-sm border-slate-200 dark:border-slate-700">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
              <TrendingDown className="w-5 h-5 text-red-600" />
              Bottom 5 Students
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-700">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700 dark:text-slate-300">Rank</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700 dark:text-slate-300">Name</th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-slate-700 dark:text-slate-300">Score</th>
                  </tr>
                </thead>
                <tbody>
                  {topAndBottomStudents.bottom.map((student, idx) => (
                    <tr
                      key={idx}
                      className="border-b border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50"
                    >
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-red-100 dark:bg-red-900/30 text-sm font-semibold text-red-700 dark:text-red-400">
                          {idx + 1}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm text-slate-900 dark:text-white">{student.name || `Student ${student.rn}`}</td>
                      <td className="py-3 px-4 text-right text-sm font-semibold text-slate-900 dark:text-white">{student.score.toFixed(0)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

import XLSX from 'xlsx';

// Student info data - RN + name, age, village, kebele
const data = [
  ['RN', 'Name', 'Age', 'Village', 'Kebele'],
  [1, 'Ahmed Ali', 12, 'Kebele 1', 'West'],
  [2, 'Fatima Hassan', 12, 'Kebele 2', 'East'],
  [3, 'Mohammed Ibrahim', 13, 'Kebele 3', 'North'],
  [4, 'Aisha Mohamed', 12, 'Kebele 4', 'South'],
  [5, 'Hassan Yusuf', 13, 'Kebele 1', 'West'],
  [6, 'Zainab Ahmed', 12, 'Kebele 2', 'East'],
  [7, 'Karim Abdullah', 13, 'Kebele 3', 'North'],
  [8, 'Leila Hassan', 12, 'Kebele 4', 'South'],
  [9, 'Omar Ali', 12, 'Kebele 1', 'West'],
  [10, 'Noor Ahmed', 13, 'Kebele 2', 'East'],
];

const workbook = XLSX.utils.book_new();
const worksheet = XLSX.utils.aoa_to_sheet(data);
XLSX.utils.book_append_sheet(workbook, worksheet, 'Students');
XLSX.writeFile(workbook, 'test_student_info.xlsx');

console.log('Test student info file created: test_student_info.xlsx');

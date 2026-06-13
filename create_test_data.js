import XLSX from 'xlsx';

// Sample data based on the provided CSV
const data = [
  ['RN', 'siltigna', 'amharic', 'english', 'maths', 'science', 'art', 'behavior', 'hpe'],
  [1, 85, 60, 52, 54, 89, 56, 83, 89],
  [2, 94, 77, 75, 80, 95, 65, 92, 82],
  [3, 82, 67, 55, 66, 82, 76, 85, 84],
  [4, 89, 84, 90, 85, 94, 82, 98, 97],
  [5, 82, 72, 60, 56, 79, 61, 90, 83],
  [6, 90, 71, 53, 58, 84, 80, 89, 89],
  [7, 89, 79, 65, 68, 86, 80, 88, 95],
  [8, 92, 80, 58, 83, 86, 64, 91, 86],
  [9, 87, 65, 70, 70, 89, 82, 84, 78],
  [10, 33, 36, 54, 46, 72, 30, 78, 70],
];

const workbook = XLSX.utils.book_new();
const worksheet = XLSX.utils.aoa_to_sheet(data);
XLSX.utils.book_append_sheet(workbook, worksheet, 'Students');
XLSX.writeFile(workbook, 'test_import.xlsx');

console.log('Test data file created: test_import.xlsx');

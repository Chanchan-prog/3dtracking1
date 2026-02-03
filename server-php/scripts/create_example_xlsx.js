// Run from server-php: node scripts/create_example_xlsx.js
// Requires: npm install xlsx (or run from project with xlsx)
const fs = require('fs');
const path = require('path');

const rows = [
  ['Campus', 'Code', 'Subject Name', 'Section Name', 'Lect Units', 'Lab Units', 'Units', 'Lect Hrs', 'Lab Hrs', 'Total Hrs', 'Enrolled Count', 'Schedule', 'Final Faculty'],
  ['room1_balay', 'ITE202', 'SAMPLE_NAME (PROGRAMMING1)', 'BSITE1-01', 7, 0, 7, 3, 0, 3, '', 'Mon 8:00 AM - 9:30 AM; Tue 8:00 AM - 9:30 AM', 'Jessie James Parajes'],
  ['room2_balay', 'ITE202', 'SAMPLE_NAME (PROGRAMMING1)', 'BSITE1-01', 7, 0, 7, 3, 0, 3, '', 'Mon 8:00 AM - 9:30 AM; Tue 8:00 AM - 9:30 AM', 'Jessie James Parajes'],
  ['room1_balay', 'ITE202', 'SAMPLE_NAME (PROGRAMMING1)', 'BSITE1-01', 7, 0, 7, 3, 0, 3, '', 'Wed 10:00 AM - 11:30 AM; Thu 10:00 AM - 11:30 AM', 'Sandy Jean Panong'],
];

try {
  const XLSX = require('xlsx');
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet(rows);
  XLSX.utils.book_append_sheet(wb, ws, 'Schedules');
  const out = path.join(__dirname, '..', 'example_class_schedule_same_time_diff_day.xlsx');
  XLSX.writeFile(wb, out);
  console.log('Created', out);
} catch (e) {
  const csvPath = path.join(__dirname, '..', 'example_class_schedule_same_time_diff_day.csv');
  fs.writeFileSync(csvPath, rows.map(r => r.map(c => c.includes(',') ? '"' + c + '"' : c).join(',')).join('\n'), 'utf8');
  console.log('xlsx not available. Wrote CSV for import:', csvPath);
}

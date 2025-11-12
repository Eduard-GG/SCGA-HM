import * as XLSX from 'xlsx';

export function exportToExcel(
  data: unknown[],
  filename: string,
  sheetName: string = 'Sheet1'
) {
  // Convert data to worksheet
  const worksheet = XLSX.utils.json_to_sheet(data);

  // Create workbook
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

  // Write file
  XLSX.writeFile(workbook, filename);
}
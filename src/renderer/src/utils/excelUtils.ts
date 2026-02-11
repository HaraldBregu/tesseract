import * as XLSX from 'xlsx';

const generateExcelBuffer = (header: string[], data: Record<string, string>[]) => {
    const ws = XLSX.utils.json_to_sheet(data, { header });
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1'); // 'Sheet1' is the sheet name
    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    return excelBuffer;
};

export {
    generateExcelBuffer
}
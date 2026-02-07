import { Upload, Download, FileText, Printer } from 'lucide-react';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { Document, Packer, Table, TableRow, TableCell, Paragraph, WidthType, BorderStyle } from 'docx';
import { useRef } from 'react';

interface ActionButtonsProps {
  showImport?: boolean;
  onImport?: (data: any[][]) => void;
  tableData: any[][];
  tableHeaders: string[];
  fileName: string;
}

export function ActionButtons({ 
  showImport = false, 
  onImport, 
  tableData, 
  tableHeaders,
  fileName 
}: ActionButtonsProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const data = new Uint8Array(event.target?.result as ArrayBuffer);
      const workbook = XLSX.read(data, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];
      onImport?.(jsonData);
    };
    reader.readAsArrayBuffer(file);
    e.target.value = '';
  };

  const exportToExcel = () => {
    const ws = XLSX.utils.aoa_to_sheet([tableHeaders, ...tableData]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    saveAs(blob, `${fileName}.xlsx`);
  };

  const exportToWord = async () => {
    const tableRows = [
      new TableRow({
        children: tableHeaders.map(header => 
          new TableCell({
            children: [new Paragraph({ text: header })],
            width: { size: 100 / tableHeaders.length, type: WidthType.PERCENTAGE },
            borders: {
              top: { style: BorderStyle.SINGLE, size: 1 },
              bottom: { style: BorderStyle.SINGLE, size: 1 },
              left: { style: BorderStyle.SINGLE, size: 1 },
              right: { style: BorderStyle.SINGLE, size: 1 },
            },
          })
        ),
      }),
      ...tableData.map(row => 
        new TableRow({
          children: row.map(cell => 
            new TableCell({
              children: [new Paragraph({ text: String(cell ?? '') })],
              borders: {
                top: { style: BorderStyle.SINGLE, size: 1 },
                bottom: { style: BorderStyle.SINGLE, size: 1 },
                left: { style: BorderStyle.SINGLE, size: 1 },
                right: { style: BorderStyle.SINGLE, size: 1 },
              },
            })
          ),
        })
      ),
    ];

    const doc = new Document({
      sections: [{
        children: [
          new Table({
            rows: tableRows,
            width: { size: 100, type: WidthType.PERCENTAGE },
          }),
        ],
      }],
    });

    const blob = await Packer.toBlob(doc);
    saveAs(blob, `${fileName}.docx`);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="flex flex-wrap gap-2">
      <input
        ref={fileInputRef}
        type="file"
        accept=".xlsx,.xls"
        onChange={handleFileChange}
        className="hidden"
      />
      
      {showImport && (
        <button onClick={handleImportClick} className="btn-action btn-import flex items-center gap-2">
          <Upload className="w-4 h-4" />
          Import Excel
        </button>
      )}
      
      <button onClick={exportToExcel} className="btn-action btn-export flex items-center gap-2">
        <Download className="w-4 h-4" />
        Export Excel
      </button>
      
      <button onClick={exportToWord} className="btn-action btn-export flex items-center gap-2">
        <FileText className="w-4 h-4" />
        Export Word
      </button>
      
      <button onClick={handlePrint} className="btn-action bg-muted text-foreground hover:opacity-90 flex items-center gap-2">
        <Printer className="w-4 h-4" />
        Print
      </button>
      
      
    </div>
  );
}

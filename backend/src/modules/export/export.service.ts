import { Injectable } from '@nestjs/common';
import * as ExcelJS from 'exceljs';
import PDFDocument from 'pdfkit';

export interface ExportColumn {
  header: string;
  key: string;
  width?: number;
}

@Injectable()
export class ExportService {
  async generateExcel(
    columns: ExportColumn[],
    data: any[],
  ): Promise<Buffer> {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Exportación');

    worksheet.columns = columns.map((col) => ({
      header: col.header,
      key: col.key,
      width: col.width || 20,
    }));

    // Header styling
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE0E0E0' },
    };

    data.forEach((row) => {
      worksheet.addRow(row);
    });

    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
  }

  async generatePdf(
    title: string,
    columns: ExportColumn[],
    data: any[],
  ): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ margin: 40, size: 'A4', layout: 'landscape', bufferPages: true });
      const buffers: Buffer[] = [];

      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => {
        resolve(Buffer.concat(buffers));
      });
      doc.on('error', reject);

      // Header
      this.renderPdfHeader(doc, title);

      // Simular tabla básica
      const startX = 40;
      let currentY = 110;
      
      const columnWidth = (doc.page.width - 80) / columns.length;

      // Draw Headers
      doc.font('Helvetica-Bold').fontSize(10);
      columns.forEach((col, i) => {
        doc.text(col.header, startX + i * columnWidth, currentY, { width: columnWidth, align: 'left' });
      });

      currentY += 15;
      doc.moveTo(startX, currentY).lineTo(doc.page.width - 40, currentY).stroke('#CBD5E1');
      currentY += 15;

      // Draw Rows
      doc.fillColor('#0F172A').font('Helvetica').fontSize(9);
      data.forEach((row) => {
        let maxRowHeight = 15;
        
        // Add new page if necessary
        if (currentY > doc.page.height - 70) {
          doc.addPage();
          currentY = 50;
          
          // Re-draw headers
          doc.font('Helvetica-Bold').fontSize(10);
          columns.forEach((col, i) => {
            doc.text(col.header, startX + i * columnWidth, currentY, { width: columnWidth, align: 'left' });
          });
          currentY += 15;
          doc.moveTo(startX, currentY).lineTo(doc.page.width - 40, currentY).stroke('#CBD5E1');
          currentY += 15;
          doc.fillColor('#0F172A').font('Helvetica').fontSize(9);
        }

        columns.forEach((col, i) => {
          const text = String(row[col.key] || '');
          doc.text(text, startX + i * columnWidth, currentY, { width: columnWidth - 10, align: 'left' });
        });
        currentY += 20;
      });

      this.renderPdfFooter(doc);
      doc.end();
    });
  }

  private renderPdfHeader(doc: PDFKit.PDFDocument, title: string) {
    doc.rect(0, 0, doc.page.width, 20).fill('#1E293B');
    doc.fillColor('#0F172A').fontSize(16).font('Helvetica-Bold');
    doc.text('NexoCaja - Sistema de Caja Comunitaria', 40, 40);
    doc.fontSize(12).font('Helvetica').fillColor('#475569');
    doc.text(title, 40, 60);
    doc.fontSize(8).fillColor('#94A3B8');
    doc.text(`Generado el: ${new Date().toLocaleString('es-EC')}`, 40, 76);
    doc.moveTo(40, 90).lineTo(doc.page.width - 40, 90).stroke('#CBD5E1');
    doc.fillColor('#0F172A');
  }

  private renderPdfFooter(doc: PDFKit.PDFDocument) {
    const pages = doc.bufferedPageRange();
    for (let i = 0; i < pages.count; i++) {
      doc.switchToPage(i);
      doc
        .fontSize(8)
        .fillColor('#94A3B8')
        .text(
          `NexoCaja MVP © ${new Date().getFullYear()} — Página ${i + 1} de ${pages.count}`,
          0,
          doc.page.height - 30,
          { align: 'center', width: doc.page.width },
        );
    }
  }
}

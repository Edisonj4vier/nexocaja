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

  async generateCooperativeStatementPdf(statement: {
    account: {
      accountNumber: string;
      productName?: string;
      productType?: string;
      agency?: string;
      status?: string;
    };
    client: {
      fullName: string;
      identificationNumber: string;
      phone?: string;
      address?: string;
      memberCode?: string;
    };
    period: {
      startDate: string;
      endDate: string;
    };
    conciliation: {
      saldoAnterior: number;
      totalCreditos: number;
      totalDebitos: number;
      saldoActual: number;
      saldoPromedio?: number;
    };
    movements: Array<{
      date: string;
      time: string;
      transaction: string;
      detail: string;
      document: string;
      debit: number;
      credit: number;
      balance: number;
    }>;
  }): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({
        margin: 30,
        size: 'A4',
        layout: 'portrait',
        bufferPages: true,
      });
      const buffers: Buffer[] = [];

      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => resolve(Buffer.concat(buffers)));
      doc.on('error', reject);

      const pageWidth = doc.page.width; // 595.28
      const margin = 30;
      const contentWidth = pageWidth - margin * 2; // 535.28

      // 1. Top Decorative Bar
      doc.rect(0, 0, pageWidth, 8).fill('#059669'); // Emerald brand color

      // 2. Cooperative Header
      doc.fillColor('#0F172A').fontSize(15).font('Helvetica-Bold');
      doc.text('COOP. NEXOCAJA LTDA.', margin, 24);
      doc.fontSize(8.5).font('Helvetica').fillColor('#059669');
      doc.text('CAJA DE AHORRO Y CRÉDITO COMUNITARIA — Generando confianza y desarrollo', margin, 42);

      // Boxed Title "ESTADO DE CUENTA"
      const titleBoxWidth = 160;
      const titleBoxHeight = 26;
      const titleBoxX = (pageWidth - titleBoxWidth) / 2;
      doc.roundedRect(titleBoxX, 60, titleBoxWidth, titleBoxHeight, 4).lineWidth(1.5).stroke('#059669');
      doc.fillColor('#0F172A').fontSize(12).font('Helvetica-Bold');
      doc.text('ESTADO DE CUENTA', titleBoxX, 68, { width: titleBoxWidth, align: 'center' });

      // 3. Information Grid (Two rounded boxes)
      const topBoxesY = 96;
      const colWidth = (contentWidth - 12) / 2; // ~261.6
      const boxHeight = 100;

      // Left Box: Socio & Cuenta
      doc.roundedRect(margin, topBoxesY, colWidth, boxHeight, 5).lineWidth(0.8).stroke('#CBD5E1');
      doc.fillColor('#0F172A').fontSize(8).font('Helvetica-Bold');
      doc.text('INFORMACIÓN DE LA CUENTA', margin + 10, topBoxesY + 8);
      doc.moveTo(margin + 10, topBoxesY + 20).lineTo(margin + colWidth - 10, topBoxesY + 20).lineWidth(0.5).stroke('#E2E8F0');

      doc.fontSize(7.5).font('Helvetica').fillColor('#475569');
      const leftDetails = [
        { label: 'Socio:', val: statement.client.fullName },
        { label: 'Identificación:', val: statement.client.identificationNumber },
        { label: 'N° Cuenta:', val: statement.account.accountNumber },
        { label: 'Producto:', val: statement.account.productName || 'AHORROS' },
        { label: 'Teléfono:', val: statement.client.phone || 'S/N' },
        { label: 'Dirección:', val: statement.client.address || 'Quito, Ecuador' },
      ];

      let ly = topBoxesY + 24;
      leftDetails.forEach((item) => {
        doc.font('Helvetica-Bold').fillColor('#334155').text(item.label, margin + 10, ly, { width: 75 });
        doc.font('Helvetica').fillColor('#0F172A').text(item.val, margin + 85, ly, { width: colWidth - 95, ellipsis: true });
        ly += 12;
      });

      // Right Box: Conciliación
      const rightBoxX = margin + colWidth + 12;
      doc.roundedRect(rightBoxX, topBoxesY, colWidth, boxHeight, 5).lineWidth(0.8).stroke('#CBD5E1');
      doc.fillColor('#0F172A').fontSize(8).font('Helvetica-Bold');
      doc.text('CONCILIACIÓN Y CORTE', rightBoxX + 10, topBoxesY + 8);
      doc.font('Helvetica').fontSize(7).fillColor('#64748B').text(`Periodo: ${statement.period.startDate} al ${statement.period.endDate}`, rightBoxX + 120, topBoxesY + 9, { align: 'right', width: colWidth - 130 });
      doc.moveTo(rightBoxX + 10, topBoxesY + 20).lineTo(rightBoxX + colWidth - 10, topBoxesY + 20).lineWidth(0.5).stroke('#E2E8F0');

      const concDetails = [
        { label: 'SALDO ANTERIOR:', val: `$ ${Number(statement.conciliation.saldoAnterior).toFixed(2)}`, color: '#334155' },
        { label: '(+) CRÉDITOS:', val: `$ ${Number(statement.conciliation.totalCreditos).toFixed(2)}`, color: '#059669' },
        { label: '(-) DÉBITOS:', val: `$ ${Number(statement.conciliation.totalDebitos).toFixed(2)}`, color: '#DC2626' },
        { label: '(=) SALDO ACTUAL:', val: `$ ${Number(statement.conciliation.saldoActual).toFixed(2)}`, color: '#0F172A', bold: true },
      ];

      let ry = topBoxesY + 25;
      concDetails.forEach((item) => {
        doc.font(item.bold ? 'Helvetica-Bold' : 'Helvetica').fontSize(item.bold ? 8.5 : 7.5).fillColor('#475569');
        doc.text(item.label, rightBoxX + 10, ry, { width: 120 });
        doc.font(item.bold ? 'Helvetica-Bold' : 'Helvetica').fontSize(item.bold ? 8.5 : 7.5).fillColor(item.color);
        doc.text(item.val, rightBoxX + 130, ry, { width: colWidth - 140, align: 'right' });
        ry += 15;
      });

      // Security Seal Banner (Crisp Vector Graphic - zero UTF-8 font encoding artifacts)
      const bannerY = topBoxesY + boxHeight + 8;
      doc.roundedRect(margin, bannerY, contentWidth, 22, 4).fill('#F8FAFC');
      doc.roundedRect(margin, bannerY, contentWidth, 22, 4).stroke('#E2E8F0');

      // Native Vector Shield with Checkmark
      doc.save();
      const sx = margin + 15;
      const sy = bannerY + 5;
      doc.moveTo(sx - 5.5, sy)
         .lineTo(sx + 5.5, sy)
         .lineTo(sx + 5.5, sy + 4)
         .quadraticCurveTo(sx + 5.5, sy + 9.5, sx, sy + 12)
         .quadraticCurveTo(sx - 5.5, sy + 9.5, sx - 5.5, sy + 4)
         .closePath()
         .fillColor('#059669')
         .fill();

      // Checkmark inside shield
      doc.lineWidth(1.2).strokeColor('#FFFFFF').lineCap('round').lineJoin('round');
      doc.moveTo(sx - 2.8, sy + 5.5).lineTo(sx - 0.6, sy + 8).lineTo(sx + 3, sy + 3.8).stroke();
      doc.restore();

      doc.fillColor('#059669').fontSize(7.5).font('Helvetica-Bold');
      doc.text('PRODUCTO PROTEGIDO POR EL FONDO DE RESGUARDO COMUNITARIO NEXOCAJA', margin + 28, bannerY + 7);
      doc.fillColor('#64748B').fontSize(7).font('Helvetica');
      doc.text('Verificación oficial de transacciones en línea', margin + contentWidth - 185, bannerY + 7, { align: 'right', width: 175 });

      // 4. Movements Table
      let tableY = bannerY + 28;
      const columns = [
        { header: 'Fecha', width: 55, align: 'left' },
        { header: 'Hora', width: 42, align: 'left' },
        { header: 'Transacción', width: 110, align: 'left' },
        { header: 'Detalle', width: 100, align: 'left' },
        { header: 'Documento', width: 68, align: 'left' },
        { header: 'Débitos', width: 50, align: 'right' },
        { header: 'Créditos', width: 50, align: 'right' },
        { header: 'Saldo', width: 60, align: 'right' },
      ];

      const drawTableHeader = (y: number) => {
        doc.rect(margin, y, contentWidth, 18).fill('#1E293B');
        doc.fillColor('#FFFFFF').fontSize(7.5).font('Helvetica-Bold');
        let cx = margin;
        columns.forEach((col) => {
          doc.text(col.header, cx + 4, y + 5, { width: col.width - 8, align: col.align as any });
          cx += col.width;
        });
      };

      drawTableHeader(tableY);
      tableY += 18;

      // Table Rows
      doc.fontSize(7).font('Helvetica');
      statement.movements.forEach((m, idx) => {
        if (tableY > doc.page.height - 50) {
          doc.addPage();
          tableY = 40;
          drawTableHeader(tableY);
          tableY += 18;
        }

        const isEven = idx % 2 === 0;
        if (isEven) {
          doc.rect(margin, tableY, contentWidth, 16).fill('#F8FAFC');
        }

        doc.fillColor('#0F172A').font('Helvetica');
        let cx = margin;

        // Fecha
        doc.text(m.date, cx + 4, tableY + 4, { width: columns[0].width - 8 });
        cx += columns[0].width;

        // Hora
        doc.text(m.time, cx + 4, tableY + 4, { width: columns[1].width - 8 });
        cx += columns[1].width;

        // Transacción
        doc.font('Helvetica-Bold').text(m.transaction, cx + 4, tableY + 4, { width: columns[2].width - 8, ellipsis: true });
        cx += columns[2].width;

        // Detalle
        doc.font('Helvetica').fillColor('#64748B').text(m.detail || 'Ventanilla', cx + 4, tableY + 4, { width: columns[3].width - 8, ellipsis: true });
        cx += columns[3].width;

        // Documento
        doc.fillColor('#0F172A').font('Helvetica').text(m.document, cx + 4, tableY + 4, { width: columns[4].width - 8 });
        cx += columns[4].width;

        // Débitos
        doc.fillColor(m.debit > 0 ? '#DC2626' : '#94A3B8');
        doc.text(m.debit > 0 ? Number(m.debit).toFixed(2) : '0.00', cx + 4, tableY + 4, { width: columns[5].width - 8, align: 'right' });
        cx += columns[5].width;

        // Créditos
        doc.fillColor(m.credit > 0 ? '#059669' : '#94A3B8');
        doc.text(m.credit > 0 ? Number(m.credit).toFixed(2) : '0.00', cx + 4, tableY + 4, { width: columns[6].width - 8, align: 'right' });
        cx += columns[6].width;

        // Saldo
        doc.font('Helvetica-Bold').fillColor('#0F172A');
        doc.text(Number(m.balance).toFixed(2), cx + 4, tableY + 4, { width: columns[7].width - 8, align: 'right' });

        tableY += 16;
      });

      // Bottom border of table
      doc.moveTo(margin, tableY).lineTo(margin + contentWidth, tableY).lineWidth(0.5).stroke('#CBD5E1');

      // Page numbers in footer
      this.renderPdfFooter(doc);
      doc.end();
    });
  }

  async generateTransactionVoucherPdf(voucher: {
    documentNumber: string;
    type: 'DEPOSIT' | 'WITHDRAWAL';
    amount: number;
    createdAt: Date | string;
    clientName: string;
    clientDni?: string;
    accountNumber: string;
    productName?: string;
    cashierName: string;
    agency?: string;
    previousBalance: number;
    newBalance: number;
    observations?: string | null;
  }): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      // 80mm roll or compact receipt page
      const doc = new PDFDocument({
        margin: 20,
        size: [280, 520],
        bufferPages: true,
      });
      const buffers: Buffer[] = [];

      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => resolve(Buffer.concat(buffers)));
      doc.on('error', reject);

      const width = 280;
      const isDeposit = voucher.type === 'DEPOSIT';

      // Header Bar
      doc.rect(0, 0, width, 6).fill(isDeposit ? '#059669' : '#E11D48');

      // Brand Logo / Title
      doc.fillColor('#0F172A').fontSize(14).font('Helvetica-Bold');
      doc.text('NEXOCAJA', 0, 18, { align: 'center', width });
      doc.fillColor('#64748B').fontSize(7.5).font('Helvetica');
      doc.text('Caja de Ahorro y Crédito Comunitaria', 0, 34, { align: 'center', width });

      // Circular Success Badge
      const circleY = 62;
      doc.circle(width / 2, circleY, 15).fill(isDeposit ? '#059669' : '#E11D48');
      doc.save();
      doc.lineWidth(2).strokeColor('#FFFFFF').lineCap('round').lineJoin('round');
      doc.moveTo(width / 2 - 5, circleY).lineTo(width / 2 - 1, circleY + 4).lineTo(width / 2 + 5, circleY - 4).stroke();
      doc.restore();

      // Title
      doc.fillColor('#0F172A').fontSize(11).font('Helvetica-Bold');
      doc.text(isDeposit ? '¡Depósito exitoso!' : '¡Retiro exitoso!', 0, 84, { align: 'center', width });

      // Big Amount
      doc.fillColor(isDeposit ? '#059669' : '#E11D48').fontSize(22).font('Helvetica-Bold');
      doc.text(`$${Number(voucher.amount).toFixed(2)}`, 0, 102, { align: 'center', width });

      // Socio & Date
      doc.fillColor('#334155').fontSize(9).font('Helvetica-Bold');
      doc.text(`A: ${voucher.clientName}`, 20, 134, { align: 'center', width: width - 40 });
      doc.fillColor('#64748B').fontSize(7.5).font('Helvetica');
      const formattedDate = new Date(voucher.createdAt).toLocaleString('es-EC', {
        dateStyle: 'long',
        timeStyle: 'short',
      });
      doc.text(`El ${formattedDate}`, 20, 148, { align: 'center', width: width - 40 });

      // Dotted Separator
      doc.moveTo(25, 168).lineTo(width - 25, 168).dash(3, { space: 3 }).stroke('#CBD5E1');
      doc.undash();

      // Transaction Details List (Pichincha / Produbanco style)
      const details = [
        { label: 'Cuenta:', val: voucher.accountNumber },
        { label: 'Tipo de producto:', val: voucher.productName || 'Ahorros' },
        { label: 'Institución:', val: `NexoCaja - ${voucher.agency || 'Matriz'}` },
        { label: 'N. de comprobante:', val: voucher.documentNumber },
        { label: 'Operador / Cajero:', val: voucher.cashierName },
        { label: 'Saldo anterior:', val: `$${Number(voucher.previousBalance).toFixed(2)}` },
        { label: 'Saldo disponible:', val: `$${Number(voucher.newBalance).toFixed(2)}`, bold: true },
      ];

      let dy = 180;
      details.forEach((item) => {
        doc.font(item.bold ? 'Helvetica-Bold' : 'Helvetica').fontSize(7.5).fillColor('#64748B');
        doc.text(item.label, 25, dy, { width: 100 });
        doc.font(item.bold ? 'Helvetica-Bold' : 'Helvetica').fontSize(item.bold ? 8 : 7.5).fillColor('#0F172A');
        doc.text(item.val, 125, dy, { width: width - 150, align: 'right' });
        dy += 16;
      });

      // Observations if any
      if (voucher.observations) {
        doc.font('Helvetica-Oblique').fontSize(7).fillColor('#64748B');
        doc.text(`Nota: ${voucher.observations}`, 25, dy, { width: width - 50, align: 'center' });
        dy += 14;
      }

      // Verification QR note
      doc.moveTo(25, dy + 6).lineTo(width - 25, dy + 6).dash(3, { space: 3 }).stroke('#CBD5E1');
      doc.undash();

      doc.fillColor('#64748B').fontSize(7).font('Helvetica');
      doc.text('Verificar la transacción con este comprobante.', 0, dy + 16, { align: 'center', width });

      // Security hash simulation
      doc.fillColor('#94A3B8').fontSize(6).font('Courier');
      doc.text(`SEC-HASH: ${Buffer.from(voucher.documentNumber).toString('base64')}`, 0, dy + 30, { align: 'center', width });

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


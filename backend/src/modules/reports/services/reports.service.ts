import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { QueryReportDto, ReportFormat } from '../dto/query-report.dto';
import type { Response } from 'express';
import * as ExcelJS from 'exceljs';
import PDFDocument from 'pdfkit';

@Injectable()
export class ReportsService {
  constructor(private readonly prisma: PrismaService) {}

  // ----------------------------------------------------
  // 1. REPORTE DE CLIENTES
  // ----------------------------------------------------
  async getClientsReport(query: QueryReportDto, res?: Response) {
    const where: any = {};
    if (query.status && ['ACTIVE', 'INACTIVE'].includes(query.status)) {
      where.status = query.status;
    }
    if (query.startDate || query.endDate) {
      where.createdAt = {};
      if (query.startDate && !isNaN(new Date(query.startDate).getTime())) {
        where.createdAt.gte = new Date(query.startDate);
      }
      if (query.endDate && !isNaN(new Date(query.endDate).getTime())) {
        const end = new Date(query.endDate);
        end.setHours(23, 59, 59, 999);
        where.createdAt.lte = end;
      }
      if (Object.keys(where.createdAt).length === 0) {
        delete where.createdAt;
      }
    }

    const clients = await this.prisma.client.findMany({
      where,
      include: {
        accounts: true,
      },
      orderBy: { lastName: 'asc' },
    });

    const data = clients.map((c) => {
      const totalBalance = c.accounts.reduce(
        (sum, a) => sum + Number(a.balance),
        0,
      );
      return {
        id: c.id,
        identificationType: c.identificationType,
        identificationNumber: c.identificationNumber,
        fullName: `${c.firstName} ${c.lastName}`,
        phone: c.phone || '—',
        email: c.email || '—',
        status: c.status,
        accountsCount: c.accounts.length,
        totalBalance: totalBalance.toFixed(2),
        createdAt: c.createdAt.toISOString(),
      };
    });

    if (query.format === ReportFormat.XLSX && res) {
      return this.exportClientsExcel(data, res);
    }
    if (query.format === ReportFormat.PDF && res) {
      return this.exportClientsPdf(data, res);
    }

    return { total: data.length, data };
  }

  // ----------------------------------------------------
  // 2. REPORTE DE CUENTAS
  // ----------------------------------------------------
  async getAccountsReport(query: QueryReportDto, res?: Response) {
    const where: any = {};
    if (query.status && ['ACTIVE', 'INACTIVE'].includes(query.status)) {
      where.status = query.status;
    }
    if (query.startDate || query.endDate) {
      where.openedAt = {};
      if (query.startDate && !isNaN(new Date(query.startDate).getTime())) {
        where.openedAt.gte = new Date(query.startDate);
      }
      if (query.endDate && !isNaN(new Date(query.endDate).getTime())) {
        const end = new Date(query.endDate);
        end.setHours(23, 59, 59, 999);
        where.openedAt.lte = end;
      }
      if (Object.keys(where.openedAt).length === 0) {
        delete where.openedAt;
      }
    }

    const accounts = await this.prisma.account.findMany({
      where,
      include: {
        client: true,
      },
      orderBy: { openedAt: 'desc' },
    });

    const data = accounts.map((a) => ({
      id: a.id,
      accountNumber: a.accountNumber,
      clientName: a.client ? `${a.client.firstName} ${a.client.lastName}` : '—',
      clientIdentification: a.client ? a.client.identificationNumber : '—',
      balance: Number(a.balance).toFixed(2),
      status: a.status,
      openedAt: a.openedAt.toISOString(),
    }));

    if (query.format === ReportFormat.XLSX && res) {
      return this.exportAccountsExcel(data, res);
    }
    if (query.format === ReportFormat.PDF && res) {
      return this.exportAccountsPdf(data, res);
    }

    return { total: data.length, data };
  }

  // ----------------------------------------------------
  // 3. REPORTE DE MOVIMIENTOS
  // ----------------------------------------------------
  async getMovementsReport(query: QueryReportDto, res?: Response) {
    const where: any = {};
    if (query.type && ['DEPOSIT', 'WITHDRAWAL'].includes(query.type)) {
      where.type = query.type as any;
    }
    if (query.accountId) where.accountId = query.accountId;
    if (query.cashRegisterId) where.cashRegisterId = query.cashRegisterId;
    if (query.userId) where.userId = query.userId;

    if (query.startDate || query.endDate) {
      where.createdAt = {};
      if (query.startDate && !isNaN(new Date(query.startDate).getTime())) {
        where.createdAt.gte = new Date(query.startDate);
      }
      if (query.endDate && !isNaN(new Date(query.endDate).getTime())) {
        const end = new Date(query.endDate);
        end.setHours(23, 59, 59, 999);
        where.createdAt.lte = end;
      }
      if (Object.keys(where.createdAt).length === 0) {
        delete where.createdAt;
      }
    }

    const movements = await this.prisma.movement.findMany({
      where,
      include: {
        account: {
          include: { client: true },
        },
        user: true,
        cashRegister: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    let totalDeposits = 0;
    let totalWithdrawals = 0;

    const data = movements.map((m) => {
      const amountNum = Number(m.amount);
      if (m.type === 'DEPOSIT') totalDeposits += amountNum;
      if (m.type === 'WITHDRAWAL') totalWithdrawals += amountNum;

      return {
        id: m.id,
        type: m.type,
        amount: amountNum.toFixed(2),
        accountNumber: m.account?.accountNumber || '—',
        clientName: m.account?.client
          ? `${m.account.client.firstName} ${m.account.client.lastName}`
          : '—',
        cashier: m.user ? `${m.user.firstName} ${m.user.lastName}` : '—',
        observations: m.observations || '—',
        createdAt: m.createdAt.toISOString(),
      };
    });

    const summary = {
      totalMovements: data.length,
      totalDeposits: totalDeposits.toFixed(2),
      totalWithdrawals: totalWithdrawals.toFixed(2),
      netFlow: (totalDeposits - totalWithdrawals).toFixed(2),
    };

    if (query.format === ReportFormat.XLSX && res) {
      return this.exportMovementsExcel(data, summary, res);
    }
    if (query.format === ReportFormat.PDF && res) {
      return this.exportMovementsPdf(data, summary, res);
    }

    return { summary, data };
  }

  // ----------------------------------------------------
  // 4. REPORTE DE CAJAS
  // ----------------------------------------------------
  async getCashRegistersReport(query: QueryReportDto, res?: Response) {
    const where: any = {};
    if (query.status && ['OPEN', 'CLOSED'].includes(query.status)) {
      where.status = query.status as any;
    }
    if (query.userId) where.userId = query.userId;

    if (query.startDate || query.endDate) {
      where.openedAt = {};
      if (query.startDate && !isNaN(new Date(query.startDate).getTime())) {
        where.openedAt.gte = new Date(query.startDate);
      }
      if (query.endDate && !isNaN(new Date(query.endDate).getTime())) {
        const end = new Date(query.endDate);
        end.setHours(23, 59, 59, 999);
        where.openedAt.lte = end;
      }
      if (Object.keys(where.openedAt).length === 0) {
        delete where.openedAt;
      }
    }

    const registers = await this.prisma.cashRegister.findMany({
      where,
      include: {
        user: true,
        movements: true,
      },
      orderBy: { openedAt: 'desc' },
    });

    const data = registers.map((r) => {
      const deposits = r.movements
        .filter((m) => m.type === 'DEPOSIT')
        .reduce((sum, m) => sum + Number(m.amount), 0);
      const withdrawals = r.movements
        .filter((m) => m.type === 'WITHDRAWAL')
        .reduce((sum, m) => sum + Number(m.amount), 0);
      const opening = Number(r.openingBalance);
      const calculatedCurrent = opening + deposits - withdrawals;

      return {
        id: r.id,
        cashier: r.user ? `${r.user.firstName} ${r.user.lastName}` : '—',
        status: r.status,
        openingBalance: opening.toFixed(2),
        closingBalance: r.closingBalance
          ? Number(r.closingBalance).toFixed(2)
          : calculatedCurrent.toFixed(2),
        movementsCount: r.movements.length,
        openedAt: r.openedAt.toISOString(),
        closedAt: r.closedAt ? r.closedAt.toISOString() : '—',
        observations: r.observations || '—',
      };
    });

    if (query.format === ReportFormat.XLSX && res) {
      return this.exportCashRegistersExcel(data, res);
    }
    if (query.format === ReportFormat.PDF && res) {
      return this.exportCashRegistersPdf(data, res);
    }

    return { total: data.length, data };
  }

  // ====================================================
  // EXPORTADORES EXCEL (ExcelJS)
  // ====================================================

  private async exportClientsExcel(data: any[], res: Response) {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Clientes');

    sheet.columns = [
      { header: 'Tipo Doc.', key: 'identificationType', width: 12 },
      { header: 'Identificación', key: 'identificationNumber', width: 18 },
      { header: 'Nombre Completo', key: 'fullName', width: 30 },
      { header: 'Teléfono', key: 'phone', width: 15 },
      { header: 'Email', key: 'email', width: 25 },
      { header: 'Estado', key: 'status', width: 12 },
      { header: 'Cuentas', key: 'accountsCount', width: 10 },
      { header: 'Saldo Total ($)', key: 'totalBalance', width: 16 },
      { header: 'Fecha Registro', key: 'createdAt', width: 20 },
    ];

    this.styleHeaderRow(sheet);
    data.forEach((row) => sheet.addRow(row));

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="reporte_clientes_${Date.now()}.xlsx"`,
    );

    await workbook.xlsx.write(res);
    res.end();
  }

  private async exportAccountsExcel(data: any[], res: Response) {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Cuentas');

    sheet.columns = [
      { header: 'Número de Cuenta', key: 'accountNumber', width: 20 },
      { header: 'Cliente', key: 'clientName', width: 30 },
      { header: 'Identificación', key: 'clientIdentification', width: 18 },
      { header: 'Saldo ($)', key: 'balance', width: 15 },
      { header: 'Estado', key: 'status', width: 12 },
      { header: 'Fecha de Apertura', key: 'openedAt', width: 20 },
    ];

    this.styleHeaderRow(sheet);
    data.forEach((row) => sheet.addRow(row));

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="reporte_cuentas_${Date.now()}.xlsx"`,
    );

    await workbook.xlsx.write(res);
    res.end();
  }

  private async exportMovementsExcel(data: any[], summary: any, res: Response) {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Movimientos');

    // Add Summary header
    sheet.addRow(['REPORTE DE MOVIMIENTOS - NEXOCAJA']);
    sheet.addRow([
      `Total Movimientos: ${summary.totalMovements}`,
      `Total Depósitos: $${summary.totalDeposits}`,
      `Total Retiros: $${summary.totalWithdrawals}`,
      `Flujo Neto: $${summary.netFlow}`,
    ]);
    sheet.addRow([]);

    const headerRowIndex = 4;
    const headers = [
      'Tipo',
      'Monto ($)',
      'Cuenta',
      'Cliente',
      'Cajero',
      'Observaciones',
      'Fecha y Hora',
    ];
    const headerRow = sheet.addRow(headers);
    headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF1E293B' },
    };

    data.forEach((m) => {
      sheet.addRow([
        m.type === 'DEPOSIT' ? 'DEPÓSITO' : 'RETIRO',
        Number(m.amount),
        m.accountNumber,
        m.clientName,
        m.cashier,
        m.observations,
        new Date(m.createdAt).toLocaleString('es-EC'),
      ]);
    });

    sheet.columns.forEach((column) => {
      column.width = 20;
    });

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="reporte_movimientos_${Date.now()}.xlsx"`,
    );

    await workbook.xlsx.write(res);
    res.end();
  }

  private async exportCashRegistersExcel(data: any[], res: Response) {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Cajas');

    sheet.columns = [
      { header: 'Cajero / Usuario', key: 'cashier', width: 25 },
      { header: 'Estado', key: 'status', width: 12 },
      { header: 'Saldo Inicial ($)', key: 'openingBalance', width: 16 },
      { header: 'Saldo Cierre/Actual ($)', key: 'closingBalance', width: 22 },
      { header: 'N° Movimientos', key: 'movementsCount', width: 15 },
      { header: 'Apertura', key: 'openedAt', width: 20 },
      { header: 'Cierre', key: 'closedAt', width: 20 },
      { header: 'Observaciones', key: 'observations', width: 25 },
    ];

    this.styleHeaderRow(sheet);
    data.forEach((row) => sheet.addRow(row));

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="reporte_cajas_${Date.now()}.xlsx"`,
    );

    await workbook.xlsx.write(res);
    res.end();
  }

  private styleHeaderRow(sheet: ExcelJS.Worksheet) {
    const headerRow = sheet.getRow(1);
    headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF1E293B' },
    };
    headerRow.height = 24;
    headerRow.alignment = { vertical: 'middle', horizontal: 'center' };
  }

  // ====================================================
  // EXPORTADORES PDF (PDFKit)
  // ====================================================

  private exportClientsPdf(data: any[], res: Response) {
    const doc = new PDFDocument({ margin: 40, size: 'A4' });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="reporte_clientes_${Date.now()}.pdf"`,
    );

    doc.pipe(res);

    this.renderPdfHeader(doc, 'Reporte de Clientes Registrados');

    doc.fontSize(9).font('Helvetica-Bold');
    let y = 110;
    doc.text('Identificación', 40, y);
    doc.text('Nombre Completo', 150, y);
    doc.text('Teléfono', 300, y);
    doc.text('Estado', 400, y);
    doc.text('Saldo Total', 470, y, { align: 'right' });

    doc
      .moveTo(40, y + 12)
      .lineTo(555, y + 12)
      .stroke('#CBD5E1');
    y += 18;

    doc.font('Helvetica').fontSize(8);
    for (const c of data) {
      if (y > 750) {
        doc.addPage();
        y = 50;
      }
      doc.text(`${c.identificationType}: ${c.identificationNumber}`, 40, y);
      doc.text(c.fullName, 150, y);
      doc.text(c.phone, 300, y);
      doc.text(c.status, 400, y);
      doc.text(`$${c.totalBalance}`, 470, y, { align: 'right' });
      y += 15;
    }

    this.renderPdfFooter(doc);
    doc.end();
  }

  private exportAccountsPdf(data: any[], res: Response) {
    const doc = new PDFDocument({ margin: 40, size: 'A4' });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="reporte_cuentas_${Date.now()}.pdf"`,
    );

    doc.pipe(res);

    this.renderPdfHeader(doc, 'Reporte de Cuentas de Ahorro');

    doc.fontSize(9).font('Helvetica-Bold');
    let y = 110;
    doc.text('N° Cuenta', 40, y);
    doc.text('Cliente', 140, y);
    doc.text('Identificación', 300, y);
    doc.text('Estado', 410, y);
    doc.text('Saldo', 470, y, { align: 'right' });

    doc
      .moveTo(40, y + 12)
      .lineTo(555, y + 12)
      .stroke('#CBD5E1');
    y += 18;

    doc.font('Helvetica').fontSize(8);
    for (const a of data) {
      if (y > 750) {
        doc.addPage();
        y = 50;
      }
      doc.text(a.accountNumber, 40, y);
      doc.text(a.clientName, 140, y);
      doc.text(a.clientIdentification, 300, y);
      doc.text(a.status, 410, y);
      doc.text(`$${a.balance}`, 470, y, { align: 'right' });
      y += 15;
    }

    this.renderPdfFooter(doc);
    doc.end();
  }

  private exportMovementsPdf(data: any[], summary: any, res: Response) {
    const doc = new PDFDocument({ margin: 40, size: 'A4' });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="reporte_movimientos_${Date.now()}.pdf"`,
    );

    doc.pipe(res);

    this.renderPdfHeader(doc, 'Reporte de Movimientos de Caja');

    // Summary Box
    doc.rect(40, 95, 515, 30).fillAndStroke('#F8FAFC', '#E2E8F0');
    doc.fillColor('#0F172A').fontSize(8).font('Helvetica-Bold');
    doc.text(`Total Transacciones: ${summary.totalMovements}`, 50, 105);
    doc.text(`Depósitos: $${summary.totalDeposits}`, 180, 105);
    doc.text(`Retiros: $${summary.totalWithdrawals}`, 310, 105);
    doc.text(`Flujo Neto: $${summary.netFlow}`, 430, 105);

    doc.fontSize(9).font('Helvetica-Bold');
    let y = 140;
    doc.text('Fecha/Hora', 40, y);
    doc.text('Tipo', 120, y);
    doc.text('Cuenta', 180, y);
    doc.text('Cliente', 260, y);
    doc.text('Cajero', 380, y);
    doc.text('Monto', 470, y, { align: 'right' });

    doc
      .moveTo(40, y + 12)
      .lineTo(555, y + 12)
      .stroke('#CBD5E1');
    y += 18;

    doc.font('Helvetica').fontSize(8);
    for (const m of data) {
      if (y > 750) {
        doc.addPage();
        y = 50;
      }
      doc.text(new Date(m.createdAt).toLocaleDateString('es-EC'), 40, y);
      doc.text(m.type === 'DEPOSIT' ? 'DEPÓSITO' : 'RETIRO', 120, y);
      doc.text(m.accountNumber, 180, y);
      doc.text(m.clientName.substring(0, 20), 260, y);
      doc.text(m.cashier.substring(0, 16), 380, y);
      doc.text(`${m.type === 'DEPOSIT' ? '+' : '-'}$${m.amount}`, 470, y, {
        align: 'right',
      });
      y += 15;
    }

    this.renderPdfFooter(doc);
    doc.end();
  }

  private exportCashRegistersPdf(data: any[], res: Response) {
    const doc = new PDFDocument({ margin: 40, size: 'A4' });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="reporte_cajas_${Date.now()}.pdf"`,
    );

    doc.pipe(res);

    this.renderPdfHeader(doc, 'Reporte de Arqueo y Cierres de Caja');

    doc.fontSize(9).font('Helvetica-Bold');
    let y = 110;
    doc.text('Cajero / Usuario', 40, y);
    doc.text('Estado', 160, y);
    doc.text('Saldo Inicial', 230, y);
    doc.text('Saldo Cierre', 310, y);
    doc.text('Movimientos', 400, y);
    doc.text('Apertura', 470, y, { align: 'right' });

    doc
      .moveTo(40, y + 12)
      .lineTo(555, y + 12)
      .stroke('#CBD5E1');
    y += 18;

    doc.font('Helvetica').fontSize(8);
    for (const r of data) {
      if (y > 750) {
        doc.addPage();
        y = 50;
      }
      doc.text(r.cashier, 40, y);
      doc.text(r.status, 160, y);
      doc.text(`$${r.openingBalance}`, 230, y);
      doc.text(`$${r.closingBalance}`, 310, y);
      doc.text(`${r.movementsCount}`, 400, y);
      doc.text(new Date(r.openedAt).toLocaleDateString('es-EC'), 470, y, {
        align: 'right',
      });
      y += 15;
    }

    this.renderPdfFooter(doc);
    doc.end();
  }

  private renderPdfHeader(doc: PDFKit.PDFDocument, title: string) {
    doc.rect(0, 0, 595, 20).fill('#1E293B');
    doc.fillColor('#0F172A').fontSize(16).font('Helvetica-Bold');
    doc.text('NexoCaja - Sistema de Caja Comunitaria', 40, 40);
    doc.fontSize(12).font('Helvetica').fillColor('#475569');
    doc.text(title, 40, 60);
    doc.fontSize(8).fillColor('#94A3B8');
    doc.text(`Generado el: ${new Date().toLocaleString('es-EC')}`, 40, 76);
    doc.moveTo(40, 90).lineTo(555, 90).stroke('#CBD5E1');
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
          40,
          790,
          { align: 'center', width: 515 },
        );
    }
  }
}

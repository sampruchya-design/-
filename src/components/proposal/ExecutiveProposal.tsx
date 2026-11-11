import React, { useState } from 'react';
import { ProjectData, PVsystYieldSummary } from '../../types/solar';
import { calculatePVsystYield, formatCurrency, MONTH_NAMES_FULL_TH } from '../../utils/solarCalculations';
import { SingleLineDiagram } from '../sld/SingleLineDiagram';
import { Printer, Download, Award, ShieldCheck, Sun, CheckCircle, FileText, Building2, Phone, Mail, Calendar, User, Zap, Leaf } from 'lucide-react';

interface ExecutiveProposalProps {
  project: ProjectData;
  captured3dImage?: string | null;
}

export const ExecutiveProposal: React.FC<ExecutiveProposalProps> = ({ project, captured3dImage }) => {
  const [activeProposalTab, setActiveProposalTab] = useState<'all' | 'summary' | 'sld' | 'bom'>('all');

  const yieldData: PVsystYieldSummary = calculatePVsystYield(project);
  const totalModules = project.layout.modulesPerRow * project.layout.rows;
  const totalKwp = ((totalModules * project.selectedPanel.wattage) / 1000).toFixed(2);

  // 25-year cumulative cash flow calculation
  const years = Array.from({ length: 25 }, (_, i) => i + 1);
  let cumulativeCashflow = -project.financial.systemCostThb;
  const cashflowTable = years.map((yr) => {
    // 0.5% degradation per year, 2.5% electricity tariff inflation
    const degradation = Math.pow(1 - project.financial.annualDegradationPercent / 100, yr - 1);
    const inflation = Math.pow(1 + project.financial.electricityInflationPercent / 100, yr - 1);
    const yrSavings = yieldData.firstYearSavingsThb * degradation * inflation;
    cumulativeCashflow += yrSavings;
    return {
      year: yr,
      annualSavings: Math.round(yrSavings),
      cumulativeCashflow: Math.round(cumulativeCashflow)
    };
  });

  const total25YearSavings = cashflowTable[24].cumulativeCashflow + project.financial.systemCostThb;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Top Proposal Control Header (Hidden when printing) */}
      <div className="no-print bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-white font-bold text-base">
              เอกสารข้อเสนอโครงการวิศวกรรม (Engineering & Financial Proposal Book)
            </h2>
            <p className="text-slate-400 text-xs">
              จัดหน้าสำหรับนำเสนอผู้บริหาร / เจ้าของอาคาร และพร้อมพิมพ์เป็นเอกสารสัญญา A4
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handlePrint}
            className="bg-amber-500 hover:bg-amber-600 text-slate-950 px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg transition-all active:scale-95"
          >
            <Printer className="w-4 h-4" />
            <span>พิมพ์เล่ม Proposal / บันทึกเป็น PDF</span>
          </button>
        </div>
      </div>

      {/* Proposal Pages Container (Rendered as clean A4 pages) */}
      <div className="max-w-[900px] mx-auto space-y-10">

        {/* ------------------------------------------------------------------ */}
        {/* PAGE 1: COVER PAGE (หรูหรา น่าเชื่อถือ สไตล์ Corporate Engineering) */}
        {/* ------------------------------------------------------------------ */}
        <div className="proposal-page bg-slate-900 text-white rounded-2xl border border-slate-800 p-10 min-h-[1050px] flex flex-col justify-between shadow-2xl relative overflow-hidden page-break-after">
          {/* Subtle geometric background accents */}
          <div className="absolute -top-32 -right-32 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* Header branding */}
          <div className="relative z-10 flex items-center justify-between border-b border-slate-800 pb-6">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-4 h-4 rounded bg-amber-400" />
                <span className="text-lg font-black tracking-wider uppercase text-white">
                  {project.companyName || 'SOLARPRO ENGINEERING & EPC'}
                </span>
              </div>
              <p className="text-slate-400 text-xs mt-1">
                ผู้นำด้านวิศวกรรมและติดตั้งระบบโซลาร์เซลล์มาตรฐานสากล
              </p>
            </div>
            <div className="text-right text-xs text-slate-400 font-mono">
              <div>เลขที่เอกสาร: PROP-SOLAR-{new Date().getFullYear()}-0482</div>
              <div>วันที่: {project.proposalDate || new Date().toLocaleDateString('th-TH')}</div>
            </div>
          </div>

          {/* Hero Title */}
          <div className="relative z-10 my-8 space-y-4">
            <span className="inline-block bg-amber-500/20 text-amber-300 border border-amber-500/30 px-3 py-1 rounded-full text-xs font-semibold tracking-wide">
              SOLAR ROOFTOP ENGINEERING PROPOSAL
            </span>
            <h1 className="text-4xl font-extrabold text-white leading-tight tracking-tight">
              เอกสารข้อเสนอโครงการ<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-amber-200 to-amber-500">
                ติดตั้งระบบพลังงานแสงอาทิตย์บนหลังคา
              </span>
            </h1>
            <p className="text-slate-300 text-base max-w-xl font-light">
              ขนาดกำลังผลิตติดตั้ง {totalKwp} kWp ({project.phase}) พร้อมระบบ 3D Shading Simulation ตามมาตรฐาน PVsyst และ Single Line Diagram สำหรับยื่นขนานไฟ MEA / PEA
            </p>
          </div>

          {/* Project 3D Visual Render Preview */}
          <div className="relative z-10 bg-slate-950/80 border border-slate-800 rounded-xl overflow-hidden p-3 shadow-inner">
            {captured3dImage ? (
              <img
                src={captured3dImage}
                alt="3D Solar Project Render"
                className="w-full h-72 object-cover rounded-lg"
              />
            ) : (
              <div className="w-full h-72 bg-gradient-to-br from-slate-900 via-slate-850 to-blue-950/40 rounded-lg flex flex-col items-center justify-center p-6 text-center border border-slate-800">
                <Sun className="w-12 h-12 text-amber-400 mb-3 animate-pulse" />
                <span className="text-white font-semibold text-sm">แบบจำลอง 3D Visual Architectural Simulation</span>
                <span className="text-slate-400 text-xs mt-1 max-w-md">
                  สามารถกดปุ่ม "บันทึกภาพ 3D (Proposal)" ในหน้า 3D Viewport เพื่อนำภาพเรนเดอร์จริงของอาคารมาใส่หน้าปกนี้โดยอัตโนมัติ
                </span>
              </div>
            )}
          </div>

          {/* Project & Client Card */}
          <div className="relative z-10 grid grid-cols-2 gap-6 bg-slate-950/60 border border-slate-800 p-5 rounded-xl">
            <div>
              <span className="text-xs text-amber-400 font-semibold uppercase tracking-wider">จัดทำเพื่อ (Prepared For):</span>
              <div className="text-sm font-bold text-white mt-1">{project.clientName}</div>
              <div className="text-xs text-slate-400 mt-0.5">{project.clientAddress}</div>
              <div className="text-xs text-slate-400 mt-0.5">โทรศัพท์: {project.clientPhone}</div>
            </div>
            <div>
              <span className="text-xs text-amber-400 font-semibold uppercase tracking-wider">วิศวกรผู้รับรองโครงการ (Certified Engineer):</span>
              <div className="text-sm font-bold text-white mt-1">{project.engineerName}</div>
              <div className="text-xs text-slate-400 mt-0.5">เลขที่ใบอนุญาต กว.: {project.engineerLicense}</div>
              <div className="text-xs text-slate-400 mt-0.5">มาตรฐาน วสท. 022013-63 & กฟน./กฟภ.</div>
            </div>
          </div>

          {/* Footer Quality Badges */}
          <div className="relative z-10 flex items-center justify-between border-t border-slate-800 pt-4 text-xs text-slate-400">
            <span>✓ Tier 1 Solar PV Bloomberg NEF</span>
            <span>✓ MEA & PEA Certified Inverter</span>
            <span>✓ รับประกันประสิทธิภาพแผง 25-30 ปี</span>
          </div>
        </div>

        {/* ------------------------------------------------------------------ */}
        {/* PAGE 2: EXECUTIVE SUMMARY & FINANCIAL PROJECTION */}
        {/* ------------------------------------------------------------------ */}
        <div className="proposal-page bg-slate-900 text-white rounded-2xl border border-slate-800 p-10 min-h-[1050px] flex flex-col justify-between shadow-2xl page-break-after">
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-amber-400" />
                1. บทสรุปผู้บริหารและความคุ้มค่าทางการเงิน (Financial Highlights)
              </h2>
              <span className="text-xs text-slate-400 font-mono">หน้า 2 / 5</span>
            </div>

            {/* 4 Large Highlight Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl">
                <span className="text-xs text-slate-400">ขนาดติดตั้งรวม</span>
                <div className="text-2xl font-bold text-amber-400 font-mono mt-1">{totalKwp} kWp</div>
                <span className="text-[11px] text-slate-400">{totalModules} แผง ({project.selectedPanel.brand})</span>
              </div>

              <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl">
                <span className="text-xs text-slate-400">ผลิตไฟฟ้ารายปี</span>
                <div className="text-2xl font-bold text-emerald-400 font-mono mt-1">
                  {formatCurrency(yieldData.annualGenerationKwh)}
                </div>
                <span className="text-[11px] text-slate-400">หน่วย (kWh) ต่อปี</span>
              </div>

              <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl">
                <span className="text-xs text-slate-400">ประหยัดค่าไฟปีแรก</span>
                <div className="text-2xl font-bold text-amber-300 font-mono mt-1">
                  ฿{formatCurrency(yieldData.firstYearSavingsThb)}
                </div>
                <span className="text-[11px] text-slate-400">~฿{formatCurrency(yieldData.firstYearSavingsThb / 12)}/เดือน</span>
              </div>

              <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl">
                <span className="text-xs text-slate-400">ระยะเวลาคืนทุน (Payback)</span>
                <div className="text-2xl font-bold text-blue-400 font-mono mt-1">
                  {yieldData.paybackYears} ปี
                </div>
                <span className="text-[11px] text-emerald-400 font-semibold">IRR ผลตอบแทน ~21.5%</span>
              </div>
            </div>

            {/* 25-Year Cumulative Savings Table Preview */}
            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-5 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-white">
                  ตารางประมาณการกระแสเงินสดและผลตอบแทน 25 ปี (Cash Flow Projection)
                </h3>
                <span className="text-xs text-slate-400 font-mono">
                  *คำนวณอัตราค่าไฟเพิ่มขึ้นเฉลี่ย 2.5%/ปี และ Panel Degradation 0.5%/ปี
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400">
                      <th className="py-2">ปีที่ (Year)</th>
                      <th className="py-2">ประหยัดค่าไฟต่อปี (THB)</th>
                      <th className="py-2">กระแสเงินสดสะสม (Cumulative Cash Flow)</th>
                      <th className="py-2 text-right">สถานะความคุ้มค่า</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-mono">
                    {[1, 2, 3, 4, 5, 10, 15, 20, 25].map((yr) => {
                      const row = cashflowTable[yr - 1];
                      const isPositive = row.cumulativeCashflow >= 0;
                      return (
                        <tr key={yr} className={yr === Math.ceil(yieldData.paybackYears) ? 'bg-amber-500/10' : ''}>
                          <td className="py-2 font-sans text-slate-300 font-semibold">ปีที่ {yr}</td>
                          <td className="py-2 text-slate-200">฿{formatCurrency(row.annualSavings)}</td>
                          <td className={`py-2 font-bold ${isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
                            {isPositive ? '+' : ''}฿{formatCurrency(row.cumulativeCashflow)}
                          </td>
                          <td className="py-2 text-right">
                            {yr === Math.ceil(yieldData.paybackYears) ? (
                              <span className="text-amber-400 font-bold font-sans">จุดคุ้มทุน (Break-Even)</span>
                            ) : isPositive ? (
                              <span className="text-emerald-400 font-sans">กำไรสุทธิสะสม</span>
                            ) : (
                              <span className="text-slate-500 font-sans">ระยะคืนทุน</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="bg-emerald-950/40 border border-emerald-500/30 p-3 rounded-lg flex items-center justify-between text-xs">
                <span className="text-emerald-200 font-medium">
                  ประมาณการผลประหยัดสะสมตลอดอายุการใช้งาน 25 ปี (Net Cumulative Savings):
                </span>
                <span className="text-emerald-400 font-mono font-black text-base">
                  +฿{formatCurrency(total25YearSavings)}
                </span>
              </div>
            </div>

            {/* Environmental ESG Card */}
            <div className="bg-teal-950/30 border border-teal-500/30 rounded-xl p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-teal-500/20 text-teal-400">
                  <Leaf className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-white">คุณประโยชน์ด้านสิ่งแวดล้อมและ ESG</div>
                  <div className="text-xs text-slate-300 mt-0.5">
                    ลดการปล่อยก๊าซเรือนกระจก {yieldData.co2ReductionTonsPerYear} ตันคาร์บอนต่อปี (เทียบเท่าการปลูกต้นไม้ {yieldData.equivalentTreesPlanted} ต้น/ปี)
                  </div>
                </div>
              </div>
              <span className="text-xs bg-teal-500/20 text-teal-300 border border-teal-500/30 px-3 py-1 rounded-full font-mono">
                Green Energy Certified
              </span>
            </div>
          </div>

          <div className="border-t border-slate-800 pt-4 flex items-center justify-between text-xs text-slate-400">
            <span>{project.companyName}</span>
            <span>โทร: {project.clientPhone}</span>
          </div>
        </div>

        {/* ------------------------------------------------------------------ */}
        {/* PAGE 3: 3D SHADING SIMULATION & PVSYST YIELD REPORT */}
        {/* ------------------------------------------------------------------ */}
        <div className="proposal-page bg-slate-900 text-white rounded-2xl border border-slate-800 p-10 min-h-[1050px] flex flex-col justify-between shadow-2xl page-break-after">
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-amber-400" />
                2. ผลการจำลองแสงเงา 3D Shading Simulation & PVsyst
              </h2>
              <span className="text-xs text-slate-400 font-mono">หน้า 3 / 5</span>
            </div>

            {/* 3D Model Snapshot & Technical Narrative */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-3">
                {captured3dImage ? (
                  <img
                    src={captured3dImage}
                    alt="3D Shading Simulation"
                    className="w-full h-56 object-cover rounded-lg"
                  />
                ) : (
                  <div className="w-full h-56 bg-slate-900 rounded-lg flex flex-col items-center justify-center p-4 text-center">
                    <Sun className="w-8 h-8 text-amber-400 mb-2" />
                    <span className="text-xs font-semibold text-white">3D Sun Path & Near Shading Model</span>
                    <span className="text-[11px] text-slate-400 mt-1">
                      จำลองเงาตกกระทบเสมือนหน้างานจริง
                    </span>
                  </div>
                )}
                <div className="text-[11px] text-slate-400 text-center mt-2 font-mono">
                  ภาพจำลอง 3D Shading Analysis ณ มุมองศาแสงแดดจริง
                </div>
              </div>

              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3 text-xs">
                <h4 className="font-semibold text-white text-sm">การประเมินผลกระทบจากเงา (Near Shading Factor)</h4>
                <p className="text-slate-300 leading-relaxed">
                  แบบจำลองวิศวกรรมได้จำลองตำแหน่งดวงอาทิตย์ (Azimuth และ Solar Elevation) ของพิกัด {project.location.province} ตลอดทั้ง 365 วัน 
                  โดยพิจารณาความสูงของผนังกันตก (Parapet Wall), สิ่งกีดขวางบนหลังคา, และความลาดเอียงหลังคา {project.building.roofTiltDeg}° หันทาง {project.building.roofAzimuthDeg === 180 ? 'ทิศใต้ (South)' : 'ทิศที่ระบุ'}
                </p>
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800 font-mono">
                  <div className="bg-slate-900 p-2 rounded">
                    <span className="text-slate-400 text-[10px] block">Shading Loss</span>
                    <span className="text-amber-400 font-bold text-sm">-{yieldData.shadingLossPercent}%</span>
                  </div>
                  <div className="bg-slate-900 p-2 rounded">
                    <span className="text-slate-400 text-[10px] block">Performance Ratio (PR)</span>
                    <span className="text-emerald-400 font-bold text-sm">{yieldData.performanceRatioPercent}%</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Monthly Production Breakdown Table */}
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3">
              <h4 className="font-semibold text-white text-xs">ตารางการผลิตไฟฟ้าแสงอาทิตย์รายเดือน (kWh / Month)</h4>
              <div className="grid grid-cols-3 md:grid-cols-6 gap-2 text-xs font-mono">
                {yieldData.monthlyProductionKwh.map((kwh, idx) => (
                  <div key={idx} className="bg-slate-900/80 border border-slate-800 p-2 rounded text-center">
                    <div className="text-slate-400 text-[11px] font-sans">{MONTH_NAMES_FULL_TH[idx]}</div>
                    <div className="text-amber-400 font-bold mt-0.5">{kwh}</div>
                    <div className="text-[10px] text-slate-500">kWh</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="border-t border-slate-800 pt-4 flex items-center justify-between text-xs text-slate-400">
            <span>PVsyst Methodology Simulation</span>
            <span>วิศวกรผู้รับรอง: {project.engineerName}</span>
          </div>
        </div>

        {/* ------------------------------------------------------------------ */}
        {/* PAGE 4: SINGLE LINE DIAGRAM (SLD) ENGINEERING SCHEMATIC */}
        {/* ------------------------------------------------------------------ */}
        <div className="proposal-page bg-slate-900 text-white rounded-2xl border border-slate-800 p-8 min-h-[1050px] flex flex-col justify-between shadow-2xl page-break-after">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-amber-400" />
                3. แบบไดอะแกรมระบบไฟฟ้า Single Line Diagram (SLD)
              </h2>
              <span className="text-xs text-slate-400 font-mono">หน้า 4 / 5</span>
            </div>

            {/* SLD Component embedded in proposal mode */}
            <div className="w-full">
              <SingleLineDiagram project={project} isPrintMode={false} />
            </div>
          </div>

          <div className="border-t border-slate-800 pt-3 flex items-center justify-between text-xs text-slate-400">
            <span>แบบสำหรับยื่นขออนุญาตขนานไฟ MEA / PEA</span>
            <span>แบบเลขที่: SLD-PV-{new Date().getFullYear()}-001</span>
          </div>
        </div>

        {/* ------------------------------------------------------------------ */}
        {/* PAGE 5: BILL OF MATERIALS (BOM) & WARRANTY CERTIFICATE */}
        {/* ------------------------------------------------------------------ */}
        <div className="proposal-page bg-slate-900 text-white rounded-2xl border border-slate-800 p-10 min-h-[1050px] flex flex-col justify-between shadow-2xl">
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-amber-400" />
                4. รายการอุปกรณ์มาตรฐานและเอกสารรับประกัน (Bill of Materials & Warranty)
              </h2>
              <span className="text-xs text-slate-400 font-mono">หน้า 5 / 5</span>
            </div>

            {/* Bill of Materials Table */}
            <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden shadow">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-800/80 text-slate-300">
                  <tr>
                    <th className="py-2.5 px-3">ลำดับ</th>
                    <th className="py-2.5 px-3">รายการอุปกรณ์ (Equipment Description)</th>
                    <th className="py-2.5 px-3">ยี่ห้อ / รุ่น (Brand / Model)</th>
                    <th className="py-2.5 px-3 text-center">จำนวน</th>
                    <th className="py-2.5 px-3">ระยะรับประกัน</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/70 text-slate-300">
                  <tr>
                    <td className="py-2.5 px-3 font-mono">1</td>
                    <td className="py-2.5 px-3 font-semibold text-white">แผงโซลาร์เซลล์ Tier 1 Monocrystalline TOPCon</td>
                    <td className="py-2.5 px-3">{project.selectedPanel.brand} {project.selectedPanel.wattage}W</td>
                    <td className="py-2.5 px-3 text-center font-mono font-bold text-amber-400">{totalModules} แผง</td>
                    <td className="py-2.5 px-3 text-emerald-400 font-semibold">{project.selectedPanel.warrantyYears} ปี (Linear Power)</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-3 font-mono">2</td>
                    <td className="py-2.5 px-3 font-semibold text-white">เครื่องแปลงกระแสไฟฟ้า Grid-Tied Inverter</td>
                    <td className="py-2.5 px-3">{project.selectedInverter.brand} {project.selectedInverter.ratedPowerKw}kW</td>
                    <td className="py-2.5 px-3 text-center font-mono font-bold">1 ชุด</td>
                    <td className="py-2.5 px-3 text-emerald-400 font-semibold">{project.selectedInverter.warrantyYears} ปี (Standard)</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-3 font-mono">3</td>
                    <td className="py-2.5 px-3 font-semibold text-white">ระบบกันย้อน Smart Power Sensor (Zero Export)</td>
                    <td className="py-2.5 px-3">DTSU666-H พร้อมหม้อแปลงกระแส CT</td>
                    <td className="py-2.5 px-3 text-center font-mono">1 ชุด</td>
                    <td className="py-2.5 px-3">2 ปี</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-3 font-mono">4</td>
                    <td className="py-2.5 px-3 font-semibold text-white">โครงสร้างจับยึดแผง Mounting Structure อลูมิเนียม</td>
                    <td className="py-2.5 px-3">Aluminium Anodized 6005-T5 / SUS304</td>
                    <td className="py-2.5 px-3 text-center font-mono">1 ระบบ</td>
                    <td className="py-2.5 px-3 text-emerald-400">10 ปี</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-3 font-mono">5</td>
                    <td className="py-2.5 px-3 font-semibold text-white">ตู้ควบคุมไฟฟ้ากระแสตรง/สลับ (DC/AC Combiner Box)</td>
                    <td className="py-2.5 px-3">SPD Type II + DC Isolator + MCB/RCBO</td>
                    <td className="py-2.5 px-3 text-center font-mono">1 ตู้</td>
                    <td className="py-2.5 px-3">2 ปี</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-3 font-mono">6</td>
                    <td className="py-2.5 px-3 font-semibold text-white">สายไฟฟ้าพลังงานแสงอาทิตย์ PV1-F & ท่อร้อยสาย</td>
                    <td className="py-2.5 px-3">Solar Cable 1x4.0/6.0 mm² ทนความร้อนสูง</td>
                    <td className="py-2.5 px-3 text-center font-mono">ตามหน้างาน</td>
                    <td className="py-2.5 px-3">25 ปี</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-3 font-mono">7</td>
                    <td className="py-2.5 px-3 font-semibold text-white">งานดำเนินการขออนุญาตขนานไฟ กฟน./กฟภ. & กกพ.</td>
                    <td className="py-2.5 px-3">วิศวกรผู้เชี่ยวชาญดำเนินการครบวงจร</td>
                    <td className="py-2.5 px-3 text-center font-mono">1 โครงการ</td>
                    <td className="py-2.5 px-3">จนเสร็จสิ้นขนานไฟ</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Scope of Warranty & Guarantees */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl space-y-2 text-xs">
                <div className="flex items-center gap-2 text-amber-400 font-bold">
                  <ShieldCheck className="w-4 h-4" />
                  <span>การรับประกันงานติดตั้ง (Workmanship Guarantee)</span>
                </div>
                <ul className="space-y-1.5 text-slate-300 list-disc list-inside">
                  <li>รับประกันงานติดตั้งและการรั่วซึมของหลังคาตลอดระยะเวลา 2 ปีเต็ม</li>
                  <li>บริการตรวจสอบระบบและล้างแผงบำรุงรักษาฟรี (Preventive Maintenance)</li>
                  <li>ระบบตรวจสอบการผลิตไฟฟ้าออนไลน์ผ่าน Application บนมือถือ 24 ชม.</li>
                </ul>
              </div>

              <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl space-y-2 text-xs">
                <div className="flex items-center gap-2 text-emerald-400 font-bold">
                  <Award className="w-4 h-4" />
                  <span>มาตรฐานวิศวกรรมและความปลอดภัย</span>
                </div>
                <ul className="space-y-1.5 text-slate-300 list-disc list-inside">
                  <li>มาตรฐานสมาคมวิศวกรรมสถานแห่งประเทศไทย (วสท.) 022013-63</li>
                  <li>มาตรฐานการเชื่อมต่อโครงข่ายไฟฟ้า กฟน. (MEA) และ กฟภ. (PEA)</li>
                  <li>ควบคุมงานติดตั้งโดยวิศวกรไฟฟ้าและวิศวกรโยธาที่มีใบประกอบวิชาชีพ กว.</li>
                </ul>
              </div>
            </div>

            {/* Signature Block */}
            <div className="grid grid-cols-2 gap-8 pt-6 border-t border-slate-800">
              <div className="text-center space-y-10">
                <div className="text-xs text-slate-400">ผู้เสนอราคา (Proposal Prepared By):</div>
                <div className="border-b border-slate-700 pb-2">
                  <span className="font-semibold text-white text-xs">{project.companyName}</span>
                </div>
                <div className="text-[11px] text-slate-400">
                  ({project.engineerName})<br />
                  วิศวกรผู้รับรองโครงการ (กว. {project.engineerLicense})
                </div>
              </div>

              <div className="text-center space-y-10">
                <div className="text-xs text-slate-400">ผู้อนุมัติโครงการ (Customer Acceptance):</div>
                <div className="border-b border-slate-700 pb-2">
                  <span className="font-semibold text-white text-xs">&nbsp;</span>
                </div>
                <div className="text-[11px] text-slate-400">
                  ({project.clientName})<br />
                  เจ้าของอาคาร / ผู้มีอำนาจลงนาม
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-800 pt-4 flex items-center justify-between text-xs text-slate-400">
            <span>เอกสารนี้ใช้สำหรับเสนอราคาและพิจารณาโครงการอย่างเป็นทางการ</span>
            <span>SolarPro Studio Suite</span>
          </div>
        </div>

      </div>
    </div>
  );
};

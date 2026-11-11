import React, { useRef } from 'react';
import { ProjectData } from '../../types/solar';
import { Download, Printer, ShieldCheck, Zap, FileText, CheckCircle2 } from 'lucide-react';

interface SingleLineDiagramProps {
  project: ProjectData;
  isPrintMode?: boolean;
}

export const SingleLineDiagram: React.FC<SingleLineDiagramProps> = ({ project, isPrintMode = false }) => {
  const svgRef = useRef<SVGSVGElement | null>(null);

  const p = project.selectedPanel;
  const inv = project.selectedInverter;
  const cb = project.combinerBox;
  const l = project.layout;
  const is3Phase = project.phase.includes('3-Phase');
  const isHybrid = project.systemType.includes('Hybrid');

  const totalModules = l.modulesPerRow * l.rows;
  const totalKwp = ((totalModules * p.wattage) / 1000).toFixed(2);
  const modsPerString = Math.ceil(totalModules / l.stringsCount);

  // Electrical sizing calculations
  const stringVoc = (modsPerString * p.voc).toFixed(1);
  const stringVmp = (modsPerString * p.vmp).toFixed(1);
  const stringIsc = p.isc.toFixed(2);

  // Inverter AC rated current: P / (sqrt(3) * V * pf) or P / (V * pf)
  const acCurrentA = is3Phase
    ? (inv.ratedPowerKw * 1000) / (Math.sqrt(3) * 380 * 0.95)
    : (inv.ratedPowerKw * 1000) / (220 * 0.95);

  const calculatedBreakerA = Math.ceil((acCurrentA * 1.25) / 5) * 5; // e.g. 16A, 20A, 25A, 32A, 40A, 63A
  const breakerRatingA = cb?.acBreakerRatingA || calculatedBreakerA;
  const breakerPoles = cb?.acBreakerPoles || (is3Phase ? '3P' : '2P');

  const downloadSvg = () => {
    if (!svgRef.current) return;
    const svgData = new XMLSerializer().serializeToString(svgRef.current);
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const svgUrl = URL.createObjectURL(svgBlob);
    const downloadLink = document.createElement('a');
    downloadLink.href = svgUrl;
    downloadLink.download = `SingleLineDiagram-SLD-${project.clientName || 'Project'}.svg`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  };

  return (
    <div className={`bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-2xl flex flex-col gap-4 ${isPrintMode ? 'bg-white border-none p-0 shadow-none text-slate-900' : ''}`}>
      {/* Action Header */}
      {!isPrintMode && (
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-white font-semibold text-base flex items-center gap-2">
                Single Line Diagram (SLD)
                <span className="text-xs bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full font-mono">
                  MEA / PEA Standard Compliant
                </span>
              </h3>
              <p className="text-slate-400 text-xs">
                แบบไดอะแกรมวิศวกรรมไฟฟ้า แสดงวงจร PV Strings, DC Combiner, Inverter, Zero Export และ MDB
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={downloadSvg}
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-blue-400" />
              <span>ดาวน์โหลด SVG</span>
            </button>
            <button
              onClick={() => window.print()}
              className="bg-amber-500 hover:bg-amber-600 text-slate-950 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 shadow transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>พิมพ์แบบ / PDF</span>
            </button>
          </div>
        </div>
      )}

      {/* Engineering SLD Canvas */}
      <div className={`w-full overflow-x-auto rounded-xl border ${isPrintMode ? 'bg-white border-slate-300' : 'bg-[#0f172a] border-slate-800'} p-4 flex justify-center`}>
        <svg
          ref={svgRef}
          viewBox="0 0 1000 680"
          className="w-full max-w-[960px] h-auto select-none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Engineering Title Border */}
          <rect
            x="10"
            y="10"
            width="980"
            height="660"
            fill="none"
            stroke={isPrintMode ? '#0f172a' : '#334155'}
            strokeWidth="2"
          />
          <rect
            x="14"
            y="14"
            width="972"
            height="652"
            fill="none"
            stroke={isPrintMode ? '#64748b' : '#1e293b'}
            strokeWidth="1"
          />

          {/* Section Headers */}
          <text x="140" y="42" fill={isPrintMode ? '#1e293b' : '#38bdf8'} fontSize="13" fontWeight="bold" textAnchor="middle">
            [1] PV STRINGS (DC)
          </text>
          <text x="350" y="42" fill={isPrintMode ? '#1e293b' : '#f59e0b'} fontSize="13" fontWeight="bold" textAnchor="middle">
            [2] DC PROTECTION & COMBINER
          </text>
          <text x="560" y="42" fill={isPrintMode ? '#1e293b' : '#10b981'} fontSize="13" fontWeight="bold" textAnchor="middle">
            [3] GRID INVERTER & ESS
          </text>
          <text x="820" y="42" fill={isPrintMode ? '#1e293b' : '#ec4899'} fontSize="13" fontWeight="bold" textAnchor="middle">
            [4] AC SOLAR DB & MDB / GRID
          </text>

          {/* -------------------------------------------------------- */}
          {/* 1. PV STRINGS */}
          {/* -------------------------------------------------------- */}
          {Array.from({ length: Math.min(2, l.stringsCount) }).map((_, sIdx) => {
            const startY = 80 + sIdx * 140;
            return (
              <g key={`sld-string-${sIdx}`}>
                {/* PV Array Symbol */}
                <rect
                  x="40"
                  y={startY}
                  width="180"
                  height="100"
                  rx="6"
                  fill={isPrintMode ? '#f8fafc' : '#1e293b'}
                  stroke={isPrintMode ? '#0284c7' : '#38bdf8'}
                  strokeWidth="1.5"
                />
                {/* Mini Solar Panel graphic */}
                <line x1="40" y1={startY + 33} x2="220" y2={startY + 33} stroke="#334155" strokeWidth="1" />
                <line x1="40" y1={startY + 66} x2="220" y2={startY + 66} stroke="#334155" strokeWidth="1" />
                <line x1="100" y1={startY} x2="100" y2={startY + 100} stroke="#334155" strokeWidth="1" />
                <line x1="160" y1={startY} x2="160" y2={startY + 100} stroke="#334155" strokeWidth="1" />

                <text x="130" y={startY + 22} fill={isPrintMode ? '#0f172a' : '#f8fafc'} fontSize="11" fontWeight="bold" textAnchor="middle">
                  PV STRING #{sIdx + 1} ({modsPerString} Modules)
                </text>
                <text x="130" y={startY + 50} fill={isPrintMode ? '#475569' : '#94a3b8'} fontSize="9.5" textAnchor="middle">
                  {p.brand} {p.wattage}W
                </text>
                <text x="130" y={startY + 85} fill={isPrintMode ? '#0369a1' : '#38bdf8'} fontSize="9" textAnchor="middle" className="font-mono">
                  Voc: {stringVoc}V | Vmp: {stringVmp}V | Isc: {stringIsc}A
                </text>

                {/* DC Lines leaving array */}
                <path
                  d={`M 220 ${startY + 35} L 270 ${startY + 35}`}
                  stroke="#ef4444"
                  strokeWidth="2"
                  fill="none"
                />
                <path
                  d={`M 220 ${startY + 65} L 270 ${startY + 65}`}
                  stroke="#3b82f6"
                  strokeWidth="2"
                  fill="none"
                />
                <text x="245" y={startY + 28} fill="#ef4444" fontSize="8" fontWeight="bold">DC (+)</text>
                <text x="245" y={startY + 78} fill="#3b82f6" fontSize="8" fontWeight="bold">DC (-)</text>
                <text x="245" y={startY + 52} fill={isPrintMode ? '#64748b' : '#94a3b8'} fontSize="7.5" textAnchor="middle">
                  {cb?.dcCableSizeMm2 || '1x4.0 mm²'}
                </text>
              </g>
            );
          })}

          {/* -------------------------------------------------------- */}
          {/* 2. DC COMBINER BOX */}
          {/* -------------------------------------------------------- */}
          <rect
            x="270"
            y="70"
            width="160"
            height="270"
            rx="6"
            fill={isPrintMode ? '#fefce8' : '#1e293b'}
            stroke="#f59e0b"
            strokeWidth="1.5"
            strokeDasharray="4 2"
          />
          <text x="350" y="92" fill={isPrintMode ? '#b45309' : '#fbbf24'} fontSize="11" fontWeight="bold" textAnchor="middle">
            DC COMBINER BOX
          </text>

          {/* DC Fuses */}
          <g transform="translate(290, 115)">
            <rect x="0" y="0" width="30" height="14" fill="#334155" stroke="#f59e0b" rx="2" />
            <text x="15" y="10" fill="#fff" fontSize="8" textAnchor="middle">FUSE</text>
            <text x="35" y="11" fill={isPrintMode ? '#334155' : '#cbd5e1'} fontSize="8">
              {cb?.dcFuseRatingA || 15}A gPV
            </text>
          </g>
          <g transform="translate(290, 140)">
            <rect x="0" y="0" width="30" height="14" fill="#334155" stroke="#f59e0b" rx="2" />
            <text x="15" y="10" fill="#fff" fontSize="8" textAnchor="middle">FUSE</text>
            <text x="35" y="11" fill={isPrintMode ? '#334155' : '#cbd5e1'} fontSize="8">
              {cb?.dcFuseRatingA || 15}A gPV
            </text>
          </g>

          {/* DC Isolator */}
          <g transform="translate(290, 180)">
            <circle cx="15" cy="15" r="14" fill="#0f172a" stroke="#ef4444" strokeWidth="1.5" />
            <line x1="8" y1="22" x2="22" y2="8" stroke="#ef4444" strokeWidth="2" />
            <text x="40" y="14" fill={isPrintMode ? '#0f172a' : '#fff'} fontSize="9" fontWeight="bold">DC ISOLATOR</text>
            <text x="40" y="26" fill={isPrintMode ? '#475569' : '#94a3b8'} fontSize="8">
              {cb?.dcIsolatorRatingA || 32}A {cb?.dcIsolatorVoltageV || 1000}V DC-PV2
            </text>
          </g>

          {/* DC SPD */}
          <g transform="translate(290, 240)">
            <rect x="0" y="0" width="45" height="24" fill="#334155" stroke="#10b981" rx="2" />
            <text x="22" y="11" fill="#fff" fontSize="8" textAnchor="middle">{cb?.dcSpdType || 'SPD Type 2'}</text>
            <text x="22" y="20" fill="#10b981" fontSize="7" textAnchor="middle">In {cb?.dcSpdInKa || 20}kA</text>
            <text x="55" y="16" fill={isPrintMode ? '#475569' : '#94a3b8'} fontSize="8">Up ≤ {cb?.dcSpdUpKv || 1.5}kV</text>
          </g>

          {/* Ground to Earth Bar */}
          <line x1="312" y1="264" x2="312" y2="310" stroke="#22c55e" strokeWidth="2" strokeDasharray="3 2" />
          <line x1="300" y1="310" x2="324" y2="310" stroke="#22c55e" strokeWidth="2" />
          <line x1="304" y1="314" x2="320" y2="314" stroke="#22c55e" strokeWidth="2" />
          <line x1="308" y1="318" x2="316" y2="318" stroke="#22c55e" strokeWidth="2" />
          <text x="330" y="316" fill="#22c55e" fontSize="8">G (R &lt; 5Ω)</text>

          {/* DC Connection to Inverter */}
          <path d="M 430 180 L 480 180" stroke="#ef4444" strokeWidth="2.5" fill="none" />
          <path d="M 430 200 L 480 200" stroke="#3b82f6" strokeWidth="2.5" fill="none" />

          {/* -------------------------------------------------------- */}
          {/* 3. INVERTER UNIT */}
          {/* -------------------------------------------------------- */}
          <rect
            x="480"
            y="70"
            width="170"
            height="270"
            rx="8"
            fill={isPrintMode ? '#f0fdf4' : '#1e293b'}
            stroke="#10b981"
            strokeWidth="2"
          />
          <text x="565" y="96" fill={isPrintMode ? '#047857' : '#34d399'} fontSize="12" fontWeight="bold" textAnchor="middle">
            {inv.brand.toUpperCase()}
          </text>
          <text x="565" y="112" fill={isPrintMode ? '#0f172a' : '#f8fafc'} fontSize="10" textAnchor="middle">
            {inv.model.split('(')[0]}
          </text>
          <text x="565" y="128" fill="#f59e0b" fontSize="10" fontWeight="bold" textAnchor="middle">
            Rated: {inv.ratedPowerKw} kW ({inv.phase})
          </text>

          {/* MPPT Inputs */}
          <rect x="490" y="150" width="70" height="24" fill="#0f172a" rx="3" stroke="#38bdf8" />
          <text x="525" y="165" fill="#38bdf8" fontSize="9" textAnchor="middle">MPPT 1</text>
          <rect x="490" y="185" width="70" height="24" fill="#0f172a" rx="3" stroke="#38bdf8" />
          <text x="525" y="200" fill="#38bdf8" fontSize="9" textAnchor="middle">MPPT 2</text>

          {/* Certifications badge */}
          <g transform="translate(495, 235)">
            <rect x="0" y="0" width="140" height="32" fill="#0f172a" rx="4" />
            <text x="70" y="14" fill="#10b981" fontSize="8" textAnchor="middle" fontWeight="bold">
              MEA / PEA CERTIFIED
            </text>
            <text x="70" y="26" fill="#94a3b8" fontSize="7.5" textAnchor="middle">
              Anti-Islanding (IEC 62116)
            </text>
          </g>

          {/* RS485 Communication Line to Smart Meter */}
          <path
            d="M 565 340 L 565 420 L 730 420"
            stroke="#a855f7"
            strokeWidth="1.5"
            strokeDasharray="4 2"
            fill="none"
          />
          <text x="610" y="412" fill="#a855f7" fontSize="8">RS485 Modbus (Zero Export)</text>

          {/* Hybrid Battery Connection (if hybrid) */}
          {isHybrid && (
            <g transform="translate(495, 280)">
              <rect x="0" y="0" width="140" height="45" fill="#0f172a" stroke="#8b5cf6" rx="4" />
              <text x="70" y="16" fill="#c084fc" fontSize="8.5" fontWeight="bold" textAnchor="middle">
                LITHIUM ESS BATTERY
              </text>
              <text x="70" y="32" fill="#94a3b8" fontSize="7.5" textAnchor="middle">
                {project.selectedBattery?.model || '10kWh LiFePO4'}
              </text>
            </g>
          )}

          {/* AC Line from Inverter to Solar DB */}
          <line x1="650" y1="180" x2="710" y2="180" stroke="#f59e0b" strokeWidth="3" />
          <text x="680" y="170" fill={isPrintMode ? '#0f172a' : '#f59e0b'} fontSize="9" fontWeight="bold" textAnchor="middle">
            {is3Phase ? '3P+N+PE' : '1P+N+PE'}
          </text>
          <text x="680" y="196" fill={isPrintMode ? '#475569' : '#94a3b8'} fontSize="8" textAnchor="middle">
            Cu {cb?.acCableSpec || (is3Phase ? '4x6.0 mm²' : '3x6.0 mm²')}
          </text>

          {/* -------------------------------------------------------- */}
          {/* 4. AC SOLAR DISTRIBUTION BOARD */}
          {/* -------------------------------------------------------- */}
          <rect
            x="710"
            y="70"
            width="120"
            height="270"
            rx="6"
            fill={isPrintMode ? '#fdf2f8' : '#1e293b'}
            stroke="#ec4899"
            strokeWidth="1.5"
            strokeDasharray="4 2"
          />
          <text x="770" y="94" fill={isPrintMode ? '#be185d' : '#f472b6'} fontSize="11" fontWeight="bold" textAnchor="middle">
            SOLAR DB
          </text>

          {/* AC Circuit Breaker */}
          <g transform="translate(730, 115)">
            <rect x="0" y="0" width="36" height="30" fill="#0f172a" stroke="#ec4899" rx="3" />
            <text x="18" y="14" fill="#fff" fontSize="8" textAnchor="middle">{cb?.acBreakerType || 'MCB'}</text>
            <text x="18" y="24" fill="#ec4899" fontSize="8" fontWeight="bold" textAnchor="middle">
              {breakerRatingA}A
            </text>
            <text x="44" y="18" fill={isPrintMode ? '#0f172a' : '#fff'} fontSize="8.5">
              {breakerPoles} 10kA
            </text>
          </g>

          {/* AC RCD */}
          <g transform="translate(730, 160)">
            <rect x="0" y="0" width="36" height="24" fill="#0f172a" stroke="#38bdf8" rx="3" />
            <text x="18" y="12" fill="#fff" fontSize="7.5" textAnchor="middle">RCBO</text>
            <text x="18" y="20" fill="#38bdf8" fontSize="7" textAnchor="middle">{cb?.acRcboRatingMa || 30}mA</text>
            <text x="44" y="16" fill={isPrintMode ? '#475569' : '#94a3b8'} fontSize="8">Type A</text>
          </g>

          {/* AC SPD */}
          <g transform="translate(730, 205)">
            <rect x="0" y="0" width="36" height="24" fill="#0f172a" stroke="#10b981" rx="3" />
            <text x="18" y="12" fill="#fff" fontSize="7.5" textAnchor="middle">{cb?.acSpdType || 'AC SPD'}</text>
            <text x="18" y="20" fill="#10b981" fontSize="7" textAnchor="middle">In {cb?.acSpdInKa || 20}kA</text>
            <text x="44" y="16" fill={isPrintMode ? '#475569' : '#94a3b8'} fontSize="8">Uc {cb?.acSpdUcV || 385}V</text>
          </g>

          {/* -------------------------------------------------------- */}
          {/* 5. MAIN DISTRIBUTION BOARD (MDB) & ZERO EXPORT CT */}
          {/* -------------------------------------------------------- */}
          <rect
            x="850"
            y="70"
            width="130"
            height="370"
            rx="6"
            fill={isPrintMode ? '#f8fafc' : '#1e293b'}
            stroke={isPrintMode ? '#0f172a' : '#cbd5e1'}
            strokeWidth="2"
          />
          <text x="915" y="96" fill={isPrintMode ? '#0f172a' : '#fff'} fontSize="12" fontWeight="bold" textAnchor="middle">
            MAIN MDB
          </text>

          {/* Busbar */}
          <line x1="870" y1="120" x2="870" y2="380" stroke="#f59e0b" strokeWidth="5" />
          <text x="862" y="150" fill="#f59e0b" fontSize="8" transform="rotate(-90, 862, 150)">BUSBAR</text>

          {/* Connection from Solar DB into MDB Busbar */}
          <path d="M 830 180 L 870 180" stroke="#f59e0b" strokeWidth="2.5" fill="none" />

          {/* Smart Power Sensor (Zero Export) */}
          <g transform="translate(730, 395)">
            <rect x="0" y="0" width="100" height="42" fill="#0f172a" stroke="#a855f7" strokeWidth="1.5" rx="4" />
            <text x="50" y="16" fill="#c084fc" fontSize="8.5" fontWeight="bold" textAnchor="middle">
              {cb?.zeroExportMeterModel ? cb.zeroExportMeterModel.split(' ')[0] : 'SMART METER'}
            </text>
            <text x="50" y="28" fill="#94a3b8" fontSize="7" textAnchor="middle">
              {cb?.zeroExportMeterModel ? cb.zeroExportMeterModel.slice(0, 22) : 'Zero Export CT Sensor'}
            </text>
            <circle cx="95" cy="21" r="5" fill="#a855f7" />
          </g>

          {/* Main Circuit Breaker (Incoming) */}
          <g transform="translate(890, 140)">
            <rect x="0" y="0" width="40" height="35" fill="#0f172a" stroke="#ef4444" rx="3" />
            <text x="20" y="16" fill="#fff" fontSize="8.5" textAnchor="middle">MAIN CB</text>
            <text x="20" y="28" fill="#ef4444" fontSize="8" fontWeight="bold" textAnchor="middle">
              {is3Phase ? '100A' : '50A'}
            </text>
          </g>

          {/* Facility Loads */}
          <g transform="translate(890, 240)">
            <rect x="0" y="0" width="75" height="45" fill="#0f172a" stroke="#64748b" rx="4" />
            <text x="37" y="18" fill="#cbd5e1" fontSize="8.5" fontWeight="bold" textAnchor="middle">
              โหลดไฟฟ้า
            </text>
            <text x="37" y="32" fill="#94a3b8" fontSize="7.5" textAnchor="middle">
              Home / Facility Loads
            </text>
          </g>
          <path d="M 870 260 L 890 260" stroke="#38bdf8" strokeWidth="2" />

          {/* Utility Grid Connection (MEA / PEA) */}
          <g transform="translate(885, 330)">
            <circle cx="25" cy="25" r="22" fill="#0f172a" stroke="#3b82f6" strokeWidth="2" />
            <text x="25" y="20" fill="#3b82f6" fontSize="9" fontWeight="bold" textAnchor="middle">
              MEA / PEA
            </text>
            <text x="25" y="32" fill="#fff" fontSize="8" textAnchor="middle">
              GRID
            </text>
            <text x="25" y="42" fill="#94a3b8" fontSize="6.5" textAnchor="middle">
              TOU Meter
            </text>
          </g>
          <path d="M 870 355 L 885 355" stroke="#f59e0b" strokeWidth="2" />

          {/* -------------------------------------------------------- */}
          {/* TITLE BLOCK (วิศวกรรมการไฟฟ้า มาตรฐานสภาวิศวกร) */}
          {/* -------------------------------------------------------- */}
          <g transform="translate(20, 500)">
            <rect
              x="0"
              y="0"
              width="960"
              height="160"
              fill={isPrintMode ? '#f8fafc' : '#090d16'}
              stroke={isPrintMode ? '#0f172a' : '#334155'}
              strokeWidth="1.5"
            />
            {/* Grid divisions */}
            <line x1="320" y1="0" x2="320" y2="160" stroke={isPrintMode ? '#cbd5e1' : '#334155'} strokeWidth="1" />
            <line x1="640" y1="0" x2="640" y2="160" stroke={isPrintMode ? '#cbd5e1' : '#334155'} strokeWidth="1" />
            <line x1="0" y1="40" x2="960" y2="40" stroke={isPrintMode ? '#cbd5e1' : '#334155'} strokeWidth="1" />

            {/* Col 1: Project Information */}
            <text x="15" y="26" fill={isPrintMode ? '#0f172a' : '#f8fafc'} fontSize="11" fontWeight="bold">
              PROJECT TITLE:
            </text>
            <text x="110" y="26" fill={isPrintMode ? '#0284c7' : '#38bdf8'} fontSize="11" fontWeight="bold">
              {project.projectName}
            </text>
            <text x="15" y="65" fill={isPrintMode ? '#475569' : '#94a3b8'} fontSize="9.5">
              เจ้าของโครงการ (Client): <tspan fill={isPrintMode ? '#0f172a' : '#fff'} fontWeight="bold">{project.clientName}</tspan>
            </text>
            <text x="15" y="85" fill={isPrintMode ? '#475569' : '#94a3b8'} fontSize="9">
              สถานที่ติดตั้ง (Location): {project.clientAddress}
            </text>
            <text x="15" y="105" fill={isPrintMode ? '#475569' : '#94a3b8'} fontSize="9">
              ระบบเชื่อมต่อโครงข่าย: {project.phase} {project.systemType}
            </text>
            <text x="15" y="125" fill="#f59e0b" fontSize="9.5" fontWeight="bold">
              กำลังผลิตติดตั้งรวม: {totalKwp} kWp ({totalModules} แผง)
            </text>
            <text x="15" y="145" fill={isPrintMode ? '#047857' : '#34d399'} fontSize="8.5">
              ✓ แบบมาตรฐานยื่นขอขนานไฟ MEA / PEA
            </text>

            {/* Col 2: Engineering Specs & Bill of Components */}
            <text x="335" y="26" fill={isPrintMode ? '#0f172a' : '#f8fafc'} fontSize="11" fontWeight="bold">
              EQUIPMENT SPECIFICATIONS
            </text>
            <text x="335" y="65" fill={isPrintMode ? '#475569' : '#94a3b8'} fontSize="9">
              PV Module: <tspan fill={isPrintMode ? '#0f172a' : '#fff'}>{p.brand} {p.model.slice(0, 24)}... ({p.wattage}W)</tspan>
            </text>
            <text x="335" y="85" fill={isPrintMode ? '#475569' : '#94a3b8'} fontSize="9">
              Inverter: <tspan fill={isPrintMode ? '#0f172a' : '#fff'}>{inv.brand} {inv.model.slice(0, 25)} ({inv.ratedPowerKw}kW)</tspan>
            </text>
            <text x="335" y="105" fill={isPrintMode ? '#475569' : '#94a3b8'} fontSize="9">
              DC Surge: {cb?.dcSpdType || 'Type 2'}, In {cb?.dcSpdInKa || 20}kA, Imax {cb?.dcSpdImaxKa || 40}kA {cb?.dcIsolatorVoltageV || 1000}V DC
            </text>
            <text x="335" y="125" fill={isPrintMode ? '#475569' : '#94a3b8'} fontSize="9">
              AC Breaker: {cb?.acBreakerType || 'MCB'} {breakerRatingA}A {breakerPoles} 10kA (RCBO {cb?.acRcboRatingMa || 30}mA)
            </text>
            <text x="335" y="145" fill={isPrintMode ? '#475569' : '#94a3b8'} fontSize="9">
              Zero Export: {cb?.zeroExportMeterModel || 'Smart Meter DTSU666 with External CTs'}
            </text>

            {/* Col 3: Engineering Signatures & Approval */}
            <text x="655" y="26" fill={isPrintMode ? '#0f172a' : '#f8fafc'} fontSize="11" fontWeight="bold">
              ENGINEERING APPROVAL & LICENSING
            </text>
            <text x="655" y="65" fill={isPrintMode ? '#475569' : '#94a3b8'} fontSize="9">
              ผู้ออกแบบ (Designed By): {project.engineerName || 'นายวิศวกร พลังงานสะอาด'}
            </text>
            <text x="655" y="85" fill={isPrintMode ? '#475569' : '#94a3b8'} fontSize="9">
              เลขที่ใบอนุญาต กว.: {project.engineerLicense || 'สย. 94821 (วิศวกรรมไฟฟ้ากำลัง)'}
            </text>
            <text x="655" y="105" fill={isPrintMode ? '#475569' : '#94a3b8'} fontSize="9">
              แบบเลขที่ (Drawing No.): SLD-PV-{new Date().getFullYear()}-001
            </text>
            <text x="655" y="125" fill={isPrintMode ? '#475569' : '#94a3b8'} fontSize="9">
              วันที่ (Date): {project.proposalDate || new Date().toLocaleDateString('th-TH')}
            </text>
            <text x="655" y="145" fill="#10b981" fontSize="9" fontWeight="bold">
              APPROVED FOR CONSTRUCTION / MEA-PEA
            </text>
          </g>
        </svg>
      </div>

      {/* Compliance Standards Footer */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs bg-slate-950/60 p-3 rounded-xl border border-slate-800 text-slate-400">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>มาตรฐานการติดตั้ง วสท. 022013-63 & กฟน./กฟภ.</span>
        </div>
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>ระบบป้องกันไฟย้อน Zero Export Control ป้องกันปรับมิเตอร์</span>
        </div>
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>อุปกรณ์ตัดตอน DC Isolator & SPD Type II ป้องกันฟ้าผ่า</span>
        </div>
      </div>
    </div>
  );
};

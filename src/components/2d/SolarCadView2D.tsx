import React, { useState } from 'react';
import { ProjectData } from '../../types/solar';
import { Compass, Grid, ZoomIn, ZoomOut, Maximize2, ShieldCheck, Ruler, ArrowRight, Layers, Sliders } from 'lucide-react';

interface SolarCadView2DProps {
  project: ProjectData;
  onUpdateLayout: (newLayout: ProjectData['layout']) => void;
}

export const SolarCadView2D: React.FC<SolarCadView2DProps> = ({ project, onUpdateLayout }) => {
  const [zoom, setZoom] = useState<number>(1);
  const [showStrings, setShowStrings] = useState<boolean>(true);
  const [showSetbacks, setShowSetbacks] = useState<boolean>(true);
  const [showDimensions, setShowDimensions] = useState<boolean>(true);

  const b = project.building;
  const l = project.layout;
  const p = project.selectedPanel;

  // Scale: 1 meter = 32 pixels base
  const scale = 32 * zoom;

  const roofW = b.widthM * scale;
  const roofL = b.lengthM * scale;

  const panelW = (l.orientation === 'Portrait' ? p.width / 1000 : p.length / 1000) * scale;
  const panelL = (l.orientation === 'Portrait' ? p.length / 1000 : p.width / 1000) * scale;

  const gapX = 0.05 * scale;
  const gapY = l.rowSpacingM * scale;

  const arrayTotalW = l.modulesPerRow * panelW + (l.modulesPerRow - 1) * gapX;
  const arrayTotalL = l.rows * panelL + (l.rows - 1) * gapY;

  const totalModules = l.modulesPerRow * l.rows;
  const totalCapacityKwp = ((totalModules * p.wattage) / 1000).toFixed(2);

  // Setback distance in meters
  const setbackM = 0.6;
  const setbackPx = setbackM * scale;

  const handleRowChange = (delta: number) => {
    const newRows = Math.max(1, Math.min(15, l.rows + delta));
    onUpdateLayout({
      ...l,
      rows: newRows,
      modulesPerString: Math.ceil((l.modulesPerRow * newRows) / l.stringsCount)
    });
  };

  const handleColChange = (delta: number) => {
    const newCols = Math.max(1, Math.min(25, l.modulesPerRow + delta));
    onUpdateLayout({
      ...l,
      modulesPerRow: newCols,
      modulesPerString: Math.ceil((newCols * l.rows) / l.stringsCount)
    });
  };

  const handleOrientationToggle = () => {
    onUpdateLayout({
      ...l,
      orientation: l.orientation === 'Portrait' ? 'Landscape' : 'Portrait'
    });
  };

  const handleStringCountChange = (count: number) => {
    onUpdateLayout({
      ...l,
      stringsCount: count,
      modulesPerString: Math.ceil(totalModules / count)
    });
  };

  // Color mapping for electrical strings
  const stringColors = [
    { bg: 'fill-blue-600/30', border: 'stroke-blue-400', text: 'text-blue-300', dot: 'bg-blue-400' },
    { bg: 'fill-emerald-600/30', border: 'stroke-emerald-400', text: 'text-emerald-300', dot: 'bg-emerald-400' },
    { bg: 'fill-purple-600/30', border: 'stroke-purple-400', text: 'text-purple-300', dot: 'bg-purple-400' },
    { bg: 'fill-amber-600/30', border: 'stroke-amber-400', text: 'text-amber-300', dot: 'bg-amber-400' }
  ];

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-2xl flex flex-col gap-4">
      {/* CAD Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
            <Ruler className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-white font-semibold text-base flex items-center gap-2">
              2D Architectural Roof Plan & Module CAD
              <span className="text-xs font-normal text-slate-400">(มาตราส่วน 1:{Math.round(100 / zoom)})</span>
            </h3>
            <p className="text-slate-400 text-xs">
              คำนวณระยะร่น Walkway ทางเดินเซอร์วิส และจัดสาย String วงจรไฟฟ้ากระแสตรง (DC)
            </p>
          </div>
        </div>

        {/* CAD View Options */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowStrings(!showStrings)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
              showStrings ? 'bg-blue-500/20 border-blue-500/40 text-blue-300' : 'bg-slate-800 border-slate-700 text-slate-400'
            }`}
          >
            วงจร Strings
          </button>
          <button
            onClick={() => setShowSetbacks(!showSetbacks)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
              showSetbacks ? 'bg-amber-500/20 border-amber-500/40 text-amber-300' : 'bg-slate-800 border-slate-700 text-slate-400'
            }`}
          >
            ระยะร่น Walkway (0.6m)
          </button>
          <button
            onClick={() => setShowDimensions(!showDimensions)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
              showDimensions ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300' : 'bg-slate-800 border-slate-700 text-slate-400'
            }`}
          >
            เส้นบอกขนาด (Dims)
          </button>
          <div className="flex items-center border border-slate-700 rounded-lg overflow-hidden ml-2">
            <button
              onClick={() => setZoom(Math.max(0.6, zoom - 0.15))}
              className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300"
              title="ย่อขนาด"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="px-2 text-xs font-mono text-slate-300 bg-slate-800">
              {Math.round(zoom * 100)}%
            </span>
            <button
              onClick={() => setZoom(Math.min(1.8, zoom + 0.15))}
              className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300"
              title="ขยายขนาด"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Interactive CAD Canvas Area */}
      <div className="relative w-full h-[540px] bg-slate-950 rounded-xl border border-slate-800/90 overflow-auto flex items-center justify-center p-8">
        {/* Background Engineering CAD Grid */}
        <div
          className="absolute inset-0 opacity-15 pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(circle, #38bdf8 1px, transparent 1px)`,
            backgroundSize: `${scale}px ${scale}px`
          }}
        />

        {/* Compass Rose */}
        <div className="absolute top-4 right-4 z-10 bg-slate-900/90 border border-slate-700/80 px-3 py-2 rounded-xl text-center shadow-lg pointer-events-none">
          <div className="flex items-center justify-center gap-1 text-rose-400 font-bold text-xs">
            <Compass className="w-4 h-4 animate-spin-slow" />
            <span>TRUE NORTH</span>
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">
            หันหลังคา: {b.roofAzimuthDeg}° {b.roofAzimuthDeg === 180 ? '(ทิศใต้ตรง - ดีที่สุด)' : ''}
          </div>
        </div>

        {/* SVG CAD Drawing */}
        <svg
          width={Math.max(roofW + 160, arrayTotalW + 180)}
          height={Math.max(roofL + 160, arrayTotalL + 180)}
          className="overflow-visible select-none"
        >
          <g transform={`translate(80, 80)`}>
            {/* Building Roof Outer Boundary */}
            <rect
              x={0}
              y={0}
              width={roofW}
              height={roofL}
              fill="#1e293b"
              stroke="#64748b"
              strokeWidth={3}
              rx={4}
            />

            {/* Pitched Roof Ridge line (if gable roof) */}
            {!b.roofType.includes('Concrete Slab') && (
              <>
                <line
                  x1={0}
                  y1={roofL / 2}
                  x2={roofW}
                  y2={roofL / 2}
                  stroke="#94a3b8"
                  strokeWidth={2}
                  strokeDasharray="6 4"
                />
                <text
                  x={roofW / 2}
                  y={roofL / 2 - 8}
                  fill="#94a3b8"
                  fontSize={11}
                  textAnchor="middle"
                  className="font-mono"
                >
                  ▲ สันหลังคา (Ridge line)
                </text>
              </>
            )}

            {/* Safety Setback Perimeter (Walkway) */}
            {showSetbacks && (
              <rect
                x={setbackPx}
                y={setbackPx}
                width={Math.max(10, roofW - setbackPx * 2)}
                height={Math.max(10, roofL - setbackPx * 2)}
                fill="none"
                stroke="#f59e0b"
                strokeWidth={1.5}
                strokeDasharray="4 4"
              />
            )}

            {/* Rooftop Obstacles */}
            {b.hasObstacles && b.obstacleType === 'AC Units' && (
              <g transform={`translate(${roofW * 0.15}, ${roofL * 0.15})`}>
                <rect x={0} y={0} width={1.4 * scale} height={0.6 * scale} fill="#475569" stroke="#94a3b8" strokeWidth={1} />
                <text x={0.7 * scale} y={0.35 * scale} fill="#f1f5f9" fontSize={9} textAnchor="middle">AC-1</text>
              </g>
            )}
            {b.hasObstacles && b.obstacleType === 'Water Tank' && (
              <g transform={`translate(${roofW * 0.12}, ${roofL * 0.12})`}>
                <circle cx={0.8 * scale} cy={0.8 * scale} r={0.8 * scale} fill="#475569" stroke="#38bdf8" strokeWidth={1.5} />
                <text x={0.8 * scale} y={0.85 * scale} fill="#f1f5f9" fontSize={9} textAnchor="middle">ถังน้ำ</text>
              </g>
            )}

            {/* Solar Modules Array */}
            <g transform={`translate(${(roofW - arrayTotalW) / 2}, ${(roofL - arrayTotalL) / 2})`}>
              {Array.from({ length: l.rows }).map((_, r) => (
                <g key={`row-${r}`}>
                  {Array.from({ length: l.modulesPerRow }).map((_, c) => {
                    const moduleIndex = r * l.modulesPerRow + c;
                    const stringIndex = Math.min(
                      l.stringsCount - 1,
                      Math.floor(moduleIndex / l.modulesPerString)
                    );
                    const colorStyle = stringColors[stringIndex % stringColors.length];

                    const x = c * (panelW + gapX);
                    const y = r * (panelL + gapY);

                    return (
                      <g key={`mod-${r}-${c}`}>
                        {/* Module body */}
                        <rect
                          x={x}
                          y={y}
                          width={panelW}
                          height={panelL}
                          className={`${showStrings ? colorStyle.bg : 'fill-slate-800'} ${
                            showStrings ? colorStyle.border : 'stroke-slate-500'
                          } transition-colors`}
                          strokeWidth={1.2}
                          rx={2}
                        />
                        {/* Wafer divider */}
                        <line
                          x1={x}
                          y1={y + panelL / 2}
                          x2={x + panelW}
                          y2={y + panelL / 2}
                          stroke="#475569"
                          strokeWidth={0.8}
                        />
                        {/* Module Label */}
                        <text
                          x={x + panelW / 2}
                          y={y + panelL / 2 + 3}
                          fill="#f8fafc"
                          fontSize={Math.max(8, Math.min(11, 10 * zoom))}
                          textAnchor="middle"
                          className="font-mono font-medium pointer-events-none"
                        >
                          {showStrings ? `S${stringIndex + 1}-${c + 1}` : `#${moduleIndex + 1}`}
                        </text>
                      </g>
                    );
                  })}
                </g>
              ))}
            </g>

            {/* Dimension Callouts */}
            {showDimensions && (
              <>
                {/* Roof Width Top */}
                <g transform="translate(0, -25)">
                  <line x1={0} y1={0} x2={roofW} y2={0} stroke="#38bdf8" strokeWidth={1.5} />
                  <line x1={0} y1={-5} x2={0} y2={5} stroke="#38bdf8" strokeWidth={1.5} />
                  <line x1={roofW} y1={-5} x2={roofW} y2={5} stroke="#38bdf8" strokeWidth={1.5} />
                  <text
                    x={roofW / 2}
                    y={-8}
                    fill="#38bdf8"
                    fontSize={11}
                    textAnchor="middle"
                    className="font-mono font-bold"
                  >
                    ความกว้างหลังคา: {b.widthM.toFixed(1)} ม.
                  </text>
                </g>

                {/* Roof Length Right */}
                <g transform={`translate(${roofW + 25}, 0)`}>
                  <line x1={0} y1={0} x2={0} y2={roofL} stroke="#38bdf8" strokeWidth={1.5} />
                  <line x1={-5} y1={0} x2={5} y2={0} stroke="#38bdf8" strokeWidth={1.5} />
                  <line x1={-5} y1={roofL} x2={5} y2={roofL} stroke="#38bdf8" strokeWidth={1.5} />
                  <text
                    x={14}
                    y={roofL / 2}
                    fill="#38bdf8"
                    fontSize={11}
                    textAnchor="middle"
                    transform={`rotate(90, 14, ${roofL / 2})`}
                    className="font-mono font-bold"
                  >
                    ความยาวหลังคา: {b.lengthM.toFixed(1)} ม.
                  </text>
                </g>

                {/* Array Dimensions Bottom */}
                <g transform={`translate(${(roofW - arrayTotalW) / 2}, ${roofL + 25})`}>
                  <line x1={0} y1={0} x2={arrayTotalW} y2={0} stroke="#f59e0b" strokeWidth={1.5} />
                  <line x1={0} y1={-5} x2={0} y2={5} stroke="#f59e0b" strokeWidth={1.5} />
                  <line x1={arrayTotalW} y1={-5} x2={arrayTotalW} y2={5} stroke="#f59e0b" strokeWidth={1.5} />
                  <text
                    x={arrayTotalW / 2}
                    y={16}
                    fill="#f59e0b"
                    fontSize={11}
                    textAnchor="middle"
                    className="font-mono font-bold"
                  >
                    ขนาดแผงโซลาร์: {((arrayTotalW / scale)).toFixed(2)} ม. × {((arrayTotalL / scale)).toFixed(2)} ม.
                  </text>
                </g>
              </>
            )}
          </g>
        </svg>
      </div>

      {/* Interactive Array Config Controls */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 bg-slate-950/60 border border-slate-800 p-3.5 rounded-xl">
        {/* Module Counts */}
        <div className="space-y-1">
          <span className="text-xs text-slate-400">จำนวนแผง (Rows × Columns)</span>
          <div className="flex items-center gap-2">
            <div className="flex items-center bg-slate-800 border border-slate-700 rounded-lg px-2 py-1">
              <span className="text-xs text-slate-400 mr-2">แถว:</span>
              <button
                onClick={() => handleRowChange(-1)}
                className="w-5 h-5 flex items-center justify-center bg-slate-700 hover:bg-slate-600 rounded text-white text-xs font-bold"
              >
                -
              </button>
              <span className="w-7 text-center font-mono font-bold text-white text-xs">{l.rows}</span>
              <button
                onClick={() => handleRowChange(1)}
                className="w-5 h-5 flex items-center justify-center bg-slate-700 hover:bg-slate-600 rounded text-white text-xs font-bold"
              >
                +
              </button>
            </div>
            <div className="flex items-center bg-slate-800 border border-slate-700 rounded-lg px-2 py-1">
              <span className="text-xs text-slate-400 mr-2">คอลัมน์:</span>
              <button
                onClick={() => handleColChange(-1)}
                className="w-5 h-5 flex items-center justify-center bg-slate-700 hover:bg-slate-600 rounded text-white text-xs font-bold"
              >
                -
              </button>
              <span className="w-7 text-center font-mono font-bold text-white text-xs">{l.modulesPerRow}</span>
              <button
                onClick={() => handleColChange(1)}
                className="w-5 h-5 flex items-center justify-center bg-slate-700 hover:bg-slate-600 rounded text-white text-xs font-bold"
              >
                +
              </button>
            </div>
          </div>
        </div>

        {/* Orientation */}
        <div className="space-y-1">
          <span className="text-xs text-slate-400">การวางแผง (Orientation)</span>
          <button
            onClick={handleOrientationToggle}
            className="w-full bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white flex items-center justify-between"
          >
            <span>{l.orientation === 'Portrait' ? 'แนวตั้ง (Portrait)' : 'แนวนอน (Landscape)'}</span>
            <span className="text-amber-400 text-[10px]">คลิกเปลี่ยน</span>
          </button>
        </div>

        {/* Strings Allocation */}
        <div className="space-y-1">
          <span className="text-xs text-slate-400">การจัดวงจร (DC Strings)</span>
          <div className="grid grid-cols-3 gap-1">
            {[1, 2, 3].map((s) => (
              <button
                key={s}
                onClick={() => handleStringCountChange(s)}
                className={`py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                  l.stringsCount === s
                    ? 'bg-blue-600 border-blue-400 text-white font-bold'
                    : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {s} String{s > 1 ? 's' : ''}
              </button>
            ))}
          </div>
        </div>

        {/* Summary Spec */}
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-2 flex flex-col justify-center">
          <div className="flex justify-between text-xs">
            <span className="text-slate-400">กำลังผลิตรวม:</span>
            <span className="text-amber-400 font-bold font-mono">{totalCapacityKwp} kWp</span>
          </div>
          <div className="flex justify-between text-xs mt-1">
            <span className="text-slate-400">จำนวนแผง:</span>
            <span className="text-white font-mono">{totalModules} แผง ({p.wattage}W)</span>
          </div>
        </div>
      </div>

      {/* String Legends */}
      {showStrings && (
        <div className="flex flex-wrap items-center gap-4 text-xs bg-slate-950/40 p-2.5 rounded-xl border border-slate-800/80">
          <span className="text-slate-400 font-medium">ผังวงจรไฟฟ้า:</span>
          {Array.from({ length: l.stringsCount }).map((_, idx) => (
            <div key={idx} className="flex items-center gap-1.5">
              <span className={`w-3 h-3 rounded-sm ${stringColors[idx % stringColors.length].dot}`} />
              <span className="text-slate-300 font-mono">
                String #{idx + 1}: {Math.ceil(totalModules / l.stringsCount)} Modules (Vmp ≈{' '}
                {(Math.ceil(totalModules / l.stringsCount) * p.vmp).toFixed(1)}V)
              </span>
            </div>
          ))}
          <span className="text-emerald-400 text-[11px] ml-auto font-mono">
            ✓ แรงดันอยู่ในช่วง MPPT ({project.selectedInverter.mpptVoltageRange[0]}-{project.selectedInverter.mpptVoltageRange[1]}V)
          </span>
        </div>
      )}
    </div>
  );
};

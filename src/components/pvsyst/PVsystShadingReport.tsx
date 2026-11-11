import React, { useState } from 'react';
import { ProjectData, PVsystYieldSummary } from '../../types/solar';
import { calculatePVsystYield, calculateSunPosition, estimateShadingPoint, MONTH_NAMES_TH, MONTH_NAMES_FULL_TH, formatCurrency } from '../../utils/solarCalculations';
import { Sun, BarChart3, TrendingDown, Layers, Zap, Award, Sparkles, AlertTriangle, Leaf, Calendar } from 'lucide-react';

interface PVsystShadingReportProps {
  project: ProjectData;
  isPrintMode?: boolean;
}

export const PVsystShadingReport: React.FC<PVsystShadingReportProps> = ({ project, isPrintMode = false }) => {
  const [selectedMonth, setSelectedMonth] = useState<number>(3); // April

  const yieldData: PVsystYieldSummary = calculatePVsystYield(project);
  const totalKwp = ((project.layout.modulesPerRow * project.layout.rows * project.selectedPanel.wattage) / 1000).toFixed(2);

  // Hourly profile for the selected month (06:00 to 18:00)
  const hourlyData = Array.from({ length: 13 }).map((_, i) => {
    const hour = 6 + i;
    return estimateShadingPoint(project, selectedMonth, hour);
  });

  const maxMonthYield = Math.max(...yieldData.monthlyProductionKwh, 1000);

  return (
    <div className={`space-y-6 ${isPrintMode ? 'text-slate-900 bg-white' : 'text-slate-100'}`}>
      {/* Header Banner */}
      {!isPrintMode && (
        <div className="bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30">
                <Sun className="w-5 h-5" />
              </span>
              <h2 className="text-xl font-bold text-white tracking-wide">
                PVsyst 3D Shading & Yield Simulation Engine
              </h2>
              <span className="text-xs bg-blue-500/20 text-blue-300 border border-blue-500/30 px-2.5 py-0.5 rounded-full font-mono">
                P50 / P90 Probability Model
              </span>
            </div>
            <p className="text-slate-400 text-xs max-w-2xl">
              รายงานผลการจำลองการผลิตพลังงานไฟฟ้าแสงอาทิตย์และวิเคราะห์ผลกระทบของเงาตกกระทบ (3D Near Shading Analysis) ตามระเบียบวิธีสากล PVsyst
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-xs text-slate-400">Performance Ratio (PR)</div>
              <div className="text-2xl font-black text-emerald-400 font-mono">
                {yieldData.performanceRatioPercent}%
              </div>
            </div>
            <div className="text-right border-l border-slate-700 pl-4">
              <div className="text-xs text-slate-400">Specific Yield</div>
              <div className="text-2xl font-black text-amber-400 font-mono">
                {yieldData.specificYieldKwhKwp} <span className="text-xs font-normal text-slate-400">kWh/kWp/yr</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4 Key Executive Performance KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow">
          <span className="text-xs text-slate-400 font-medium">ผลผลิตพลังงานไฟฟ้ารายปี</span>
          <div className="text-2xl font-bold text-white font-mono mt-1">
            {formatCurrency(yieldData.annualGenerationKwh)}{' '}
            <span className="text-xs font-normal text-slate-400">kWh/ปี</span>
          </div>
          <span className="text-[11px] text-emerald-400 mt-1 block">
            เฉลี่ย {(yieldData.annualGenerationKwh / 365).toFixed(1)} หน่วย/วัน
          </span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow">
          <span className="text-xs text-slate-400 font-medium">มูลค่าประหยัดค่าไฟปีแรก</span>
          <div className="text-2xl font-bold text-emerald-400 font-mono mt-1">
            ฿{formatCurrency(yieldData.firstYearSavingsThb)}
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">
            เฉลี่ย ~฿{formatCurrency(yieldData.firstYearSavingsThb / 12)} /เดือน
          </span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow">
          <span className="text-xs text-slate-400 font-medium">การสูญเสียจากเงา (Shading Loss)</span>
          <div className="text-2xl font-bold text-amber-400 font-mono mt-1">
            {yieldData.shadingLossPercent}%
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">
            {project.building.obstacleType !== 'None' ? `สิ่งกีดขวาง: ${project.building.obstacleType}` : 'เงาจากสิ่งแวดล้อมต่ำมาก'}
          </span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow">
          <span className="text-xs text-slate-400 font-medium">ลดคาร์บอนฟุตพริ้นท์ (ESG)</span>
          <div className="text-2xl font-bold text-teal-400 font-mono mt-1">
            {yieldData.co2ReductionTonsPerYear}{' '}
            <span className="text-xs font-normal text-slate-400">ตัน CO₂/ปี</span>
          </div>
          <span className="text-[11px] text-teal-300 mt-1 flex items-center gap-1">
            <Leaf className="w-3 h-3" />
            เทียบเท่าปลูกต้นไม้ {yieldData.equivalentTreesPlanted} ต้น
          </span>
        </div>
      </div>

      {/* Monthly Generation Bar Chart (PVsyst standard) */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-2xl">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-amber-400" />
            <h3 className="text-white font-semibold text-base">
              การผลิตพลังงานไฟฟ้ารายเดือน (Monthly Energy Generation)
            </h3>
          </div>
          <div className="flex items-center gap-4 text-xs font-mono text-slate-400">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 bg-amber-500 rounded-sm" />
              พลังงานที่ส่งเข้าระบบอาคาร (kWh)
            </span>
          </div>
        </div>

        <div className="h-64 flex items-end justify-between gap-2 pt-6 pb-2 px-2 border-b border-slate-800">
          {yieldData.monthlyProductionKwh.map((kwh, idx) => {
            const heightPercent = Math.max(12, (kwh / maxMonthYield) * 100);
            const isSel = idx === selectedMonth;
            return (
              <div
                key={idx}
                onClick={() => setSelectedMonth(idx)}
                className="flex-1 flex flex-col items-center gap-2 group cursor-pointer"
              >
                <span className="text-[10px] font-mono text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity">
                  {kwh}
                </span>
                <div className="w-full relative flex items-end justify-center h-48">
                  <div
                    style={{ height: `${heightPercent}%` }}
                    className={`w-full max-w-[40px] rounded-t-lg transition-all ${
                      isSel
                        ? 'bg-gradient-to-t from-amber-600 to-amber-400 shadow-lg shadow-amber-500/20'
                        : 'bg-gradient-to-t from-blue-700/70 to-blue-500/70 group-hover:from-amber-600/80 group-hover:to-amber-400/80'
                    }`}
                  />
                </div>
                <span className={`text-xs font-medium ${isSel ? 'text-amber-400 font-bold' : 'text-slate-400'}`}>
                  {MONTH_NAMES_TH[idx]}
                </span>
              </div>
            );
          })}
        </div>
        <p className="text-right text-xs text-slate-500 mt-2 font-mono">
          *คลิกที่แท่งแต่ละเดือนเพื่อดูการจำลองเงารายชั่วโมงด้านล่าง
        </p>
      </div>

      {/* PVsyst Loss Waterfall / Sankey Loss Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-2xl">
          <div className="flex items-center gap-2 mb-4">
            <TrendingDown className="w-5 h-5 text-rose-400" />
            <h3 className="text-white font-semibold text-base">
              PVsyst Loss Diagram (แผนภูมิการสูญเสียในระบบ)
            </h3>
          </div>

          <div className="space-y-3 font-mono text-xs">
            <div className="flex justify-between items-center p-2 rounded-lg bg-slate-800/80 text-white">
              <span className="font-sans">ความเข้มแสงระนาบพื้นราบ (GHI Global Horizontal)</span>
              <span className="font-bold text-amber-300">{project.location.annualGhiKwhM2} kWh/m²</span>
            </div>

            <div className="flex justify-between items-center p-2 rounded-lg bg-slate-950/60 text-slate-300 pl-4 border-l-2 border-emerald-500">
              <span className="font-sans">+ การเพิ่มขึ้นจากมุมเอียงแผง (Tilt Gain {project.layout.panelTiltDeg}°)</span>
              <span className="text-emerald-400">+3.8%</span>
            </div>

            <div className="flex justify-between items-center p-2 rounded-lg bg-slate-950/60 text-slate-300 pl-4 border-l-2 border-rose-500">
              <span className="font-sans">- การสูญเสียจากเงาตกกระทบ (3D Near Shading Loss)</span>
              <span className="text-rose-400">-{yieldData.shadingLossPercent}%</span>
            </div>

            <div className="flex justify-between items-center p-2 rounded-lg bg-slate-950/60 text-slate-300 pl-4 border-l-2 border-rose-500">
              <span className="font-sans">- การสูญเสียจากมุมตกกระทบ (IAM Fresnel Factor)</span>
              <span className="text-rose-400">-1.8%</span>
            </div>

            <div className="flex justify-between items-center p-2 rounded-lg bg-slate-950/60 text-slate-300 pl-4 border-l-2 border-rose-500">
              <span className="font-sans">- การสูญเสียจากอุณหภูมิผิวแผงร้อน (Temp Coefficient)</span>
              <span className="text-rose-400">-{yieldData.temperatureLossPercent}%</span>
            </div>

            <div className="flex justify-between items-center p-2 rounded-lg bg-slate-950/60 text-slate-300 pl-4 border-l-2 border-rose-500">
              <span className="font-sans">- การสูญเสียจากฝุ่นละอองและคราบสกปรก (Soiling Loss)</span>
              <span className="text-rose-400">-2.5%</span>
            </div>

            <div className="flex justify-between items-center p-2 rounded-lg bg-slate-950/60 text-slate-300 pl-4 border-l-2 border-rose-500">
              <span className="font-sans">- การสูญเสียสายไฟกระแสตรง/สลับ (Ohmic Wiring Loss)</span>
              <span className="text-rose-400">-{yieldData.cablingLossPercent}%</span>
            </div>

            <div className="flex justify-between items-center p-2 rounded-lg bg-slate-950/60 text-slate-300 pl-4 border-l-2 border-rose-500">
              <span className="font-sans">- ประสิทธิภาพการแปลงไฟ Inverter ({project.selectedInverter.brand})</span>
              <span className="text-rose-400">-{yieldData.inverterLossPercent}%</span>
            </div>

            <div className="flex justify-between items-center p-3 rounded-xl bg-emerald-950/60 border border-emerald-500/30 text-white font-bold text-sm">
              <span className="font-sans text-emerald-300">ประสิทธิภาพสุทธิของระบบ (Performance Ratio - PR)</span>
              <span className="text-emerald-400">{yieldData.performanceRatioPercent}%</span>
            </div>
          </div>
        </div>

        {/* Hourly Solar Shading Matrix for Selected Month */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-2xl">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-400" />
              <h3 className="text-white font-semibold text-base">
                จำลองเงารายชั่วโมง: เดือน {MONTH_NAMES_FULL_TH[selectedMonth]}
              </h3>
            </div>
            <span className="text-xs bg-slate-800 text-slate-300 px-2.5 py-1 rounded-lg font-mono">
              Lat: {project.location.latitude.toFixed(2)}° N
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400">
                  <th className="py-2">เวลา</th>
                  <th className="py-2">มุมเงย (Alt)</th>
                  <th className="py-2">มุมทิศ (Az)</th>
                  <th className="py-2">ความเข้มแสง</th>
                  <th className="py-2 text-right">Shading Factor</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {hourlyData.map((pt) => (
                  <tr key={pt.hour} className="hover:bg-slate-800/40">
                    <td className="py-2 text-slate-300 font-semibold">{String(pt.hour).padStart(2, '0')}:00 น.</td>
                    <td className="py-2 text-slate-300">{pt.sunAltitudeDeg}°</td>
                    <td className="py-2 text-slate-400">{pt.sunAzimuthDeg}°</td>
                    <td className="py-2 text-slate-300">{pt.irradianceWm2} W/m²</td>
                    <td className="py-2 text-right">
                      <span
                        className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                          pt.shadingLossPercent > 20
                            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                            : pt.shadingLossPercent > 5
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        }`}
                      >
                        {pt.shadingLossPercent > 0 ? `-${pt.shadingLossPercent}%` : '0% (ไม่มีเงา)'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-[11px] text-slate-500 mt-3">
            *แบบจำลองคำนวณเงาตกกระทบจากผนังกันตก (Parapet Wall), เครื่องปรับอากาศ, และต้นไม้ใกล้เคียงตามหลักตรีโกณมิติแสงอาทิตย์
          </p>
        </div>
      </div>
    </div>
  );
};

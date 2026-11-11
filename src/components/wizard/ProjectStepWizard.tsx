import React, { useState } from 'react';
import { ProjectData, SystemType, SystemPhase, RoofType, CombinerBoxSpec, SolarPanelSpec, InverterSpec } from '../../types/solar';
import { SOLAR_PANELS, INVERTERS, BATTERIES, THAILAND_LOCATIONS, DEFAULT_PROJECT_PRESETS, DEFAULT_COMBINER_BOX } from '../../data/solarEquipment';
import { CheckCircle2, ChevronRight, ChevronLeft, MapPin, Building, Zap, Layers, Cpu, Shield, Sparkles, HelpCircle, Wrench, Sliders, Box } from 'lucide-react';

interface ProjectStepWizardProps {
  project: ProjectData;
  activeStep: number;
  onStepChange: (step: number) => void;
  onUpdateProject: (updated: ProjectData) => void;
  onApplyPreset: (presetKey: string) => void;
  onNavigateTab: (tab: 'design' | 'pvsyst' | 'sld' | 'boq' | 'proposal') => void;
}

export const ProjectStepWizard: React.FC<ProjectStepWizardProps> = ({
  project,
  activeStep,
  onStepChange,
  onUpdateProject,
  onApplyPreset,
  onNavigateTab
}) => {
  const steps = [
    { num: 1, title: '1. ขนาด & ระบบติดตั้ง', subtitle: 'ความต้องการ & กำลังผลิต' },
    { num: 2, title: '2. Location & อาคาร', subtitle: 'พิกัดแสงแดด & หลังคา' },
    { num: 3, title: '3. แผง PV & Inverter', subtitle: 'เลือกอุปกรณ์ Tier 1' },
    { num: 4, title: '4. Concept Design', subtitle: 'สรุปการออกแบบเบื้องต้น' }
  ];

  const totalModules = project.layout.modulesPerRow * project.layout.rows;
  const totalKwp = ((totalModules * project.selectedPanel.wattage) / 1000).toFixed(2);
  const dcAcRatio = (parseFloat(totalKwp) / project.selectedInverter.ratedPowerKw).toFixed(2);

  const [equipmentMode, setEquipmentMode] = useState<'preset' | 'diy'>('preset');
  const [diyTab, setDiyTab] = useState<'panel' | 'inverter' | 'combiner'>('panel');

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-6">
      {/* Wizard Step Stepper */}
      <div className="border-b border-slate-800 pb-5">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {steps.map((st) => {
            const isCurrent = activeStep === st.num;
            const isCompleted = activeStep > st.num;
            return (
              <button
                key={st.num}
                onClick={() => onStepChange(st.num)}
                className={`text-left p-3 rounded-xl border transition-all ${
                  isCurrent
                    ? 'bg-amber-500/10 border-amber-500/50 shadow-md ring-1 ring-amber-500/30'
                    : isCompleted
                    ? 'bg-slate-800/80 border-emerald-500/30 hover:bg-slate-800'
                    : 'bg-slate-950/40 border-slate-800 hover:bg-slate-800/40'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                      isCurrent
                        ? 'bg-amber-500 text-slate-950'
                        : isCompleted
                        ? 'bg-emerald-500 text-slate-950'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    ขั้นที่ {st.num}
                  </span>
                  {isCompleted && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                </div>
                <div className="mt-2">
                  <div className={`text-xs font-semibold ${isCurrent ? 'text-amber-400' : 'text-slate-200'}`}>
                    {st.title}
                  </div>
                  <div className="text-[11px] text-slate-400">{st.subtitle}</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Quick Project Presets Bar */}
      <div className="bg-slate-950/60 border border-slate-800 p-3 rounded-xl flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span className="text-xs font-medium text-slate-300">เลือกเทมเพลตโครงการสำเร็จรูป (Quick Presets):</span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => onApplyPreset('residential5kwp')}
            className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium border border-slate-700 transition-colors"
          >
            🏠 บ้านเดี่ยว 5 kWp (1-Phase)
          </button>
          <button
            onClick={() => onApplyPreset('luxuryVilla10kwp')}
            className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium border border-slate-700 transition-colors"
          >
            🏡 Luxury Villa 10 kWp (3-Phase)
          </button>
          <button
            onClick={() => onApplyPreset('hybridEss12kwp')}
            className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium border border-slate-700 transition-colors"
          >
            🔋 ไฮบริดพร้อมแบต 12 kWp + 15kWh ESS
          </button>
        </div>
      </div>

      {/* ============================================================ */}
      {/* STEP 1: รายละเอียด & ขนาดการติดตั้ง */}
      {/* ============================================================ */}
      {activeStep === 1 && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300">ชื่อโครงการ (Project Name)</label>
              <input
                type="text"
                value={project.projectName}
                onChange={(e) => onUpdateProject({ ...project, projectName: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300">ชื่อลูกค้า / เจ้าของบ้าน (Client Name)</label>
              <input
                type="text"
                value={project.clientName}
                onChange={(e) => onUpdateProject({ ...project, clientName: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300">เบอร์โทรศัพท์ลูกค้า (Phone Number)</label>
              <input
                type="text"
                value={project.clientPhone}
                onChange={(e) => onUpdateProject({ ...project, clientPhone: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300">ที่อยู่หน้างาน / สถานที่ติดตั้ง (Address)</label>
              <input
                type="text"
                value={project.clientAddress}
                onChange={(e) => onUpdateProject({ ...project, clientAddress: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-slate-800">
            {/* System Type */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300">ประเภทระบบ (System Type)</label>
              <select
                value={project.systemType}
                onChange={(e) => onUpdateProject({ ...project, systemType: e.target.value as SystemType })}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
              >
                <option value="On-Grid">On-Grid (เชื่อมต่อสายส่ง MEA/PEA ยอดนิยมสุด)</option>
                <option value="Hybrid (with Battery ESS)">Hybrid (ระบบกักเก็บพลังงานแบตเตอรี่ สำรองไฟ)</option>
                <option value="Off-Grid">Off-Grid (อิสระ ไม่ต่อสายส่ง)</option>
              </select>
            </div>

            {/* Electrical Phase */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300">ระบบไฟในอาคาร (Electrical Phase)</label>
              <select
                value={project.phase}
                onChange={(e) => onUpdateProject({ ...project, phase: e.target.value as SystemPhase })}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
              >
                <option value="1-Phase (220V)">1 เฟส 220V (บ้านพักอาศัยทั่วไป)</option>
                <option value="3-Phase (380V)">3 เฟส 380V (บ้านขนาดใหญ่ / อาคารพาณิชย์)</option>
              </select>
            </div>

            {/* Target Capacity kWp */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300">เป้าหมายกำลังผลิต (kWp Target)</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  step="0.5"
                  value={project.targetCapacityKwp}
                  onChange={(e) => onUpdateProject({ ...project, targetCapacityKwp: parseFloat(e.target.value) || 5 })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-amber-500 font-mono"
                />
                <span className="text-xs text-slate-400">kWp</span>
              </div>
            </div>
          </div>

          {/* Installer Company info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-slate-800">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300">ชื่อบริษัทผู้ติดตั้ง (EPC Company)</label>
              <input
                type="text"
                value={project.companyName}
                onChange={(e) => onUpdateProject({ ...project, companyName: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300">ชื่อวิศวกรผู้รับรองแบบ (Engineer)</label>
              <input
                type="text"
                value={project.engineerName}
                onChange={(e) => onUpdateProject({ ...project, engineerName: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300">เลขที่ใบอนุญาต กว. (License No.)</label>
              <input
                type="text"
                value={project.engineerLicense}
                onChange={(e) => onUpdateProject({ ...project, engineerLicense: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* STEP 2: Location สถานที่ & ระบุอาคาร */}
      {/* ============================================================ */}
      {activeStep === 2 && (
        <div className="space-y-6">
          {/* Location Selector */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-rose-400" />
              ตำแหน่งโครงการ & ฐานข้อมูลรังสีดวงอาทิตย์ (Solar Irradiation Database)
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
              {THAILAND_LOCATIONS.map((loc) => {
                const isSelected = project.location.province === loc.province;
                return (
                  <button
                    key={loc.province}
                    onClick={() => onUpdateProject({ ...project, location: loc })}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      isSelected
                        ? 'bg-amber-500/15 border-amber-500 text-white shadow-md'
                        : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:bg-slate-800/60'
                    }`}
                  >
                    <div className="font-semibold text-xs">{loc.province}</div>
                    <div className="text-[11px] text-slate-400 mt-1 font-mono">
                      GHI: {loc.annualGhiKwhM2} kWh/m²
                    </div>
                    <div className="text-[10px] text-amber-400 font-mono">
                      PSH: {loc.peakSunHoursAvg} ชม./วัน
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Building Dimensions & Roof Architecture */}
          <div className="pt-4 border-t border-slate-800 space-y-4">
            <div className="flex items-center gap-2">
              <Building className="w-4 h-4 text-blue-400" />
              <h4 className="text-sm font-semibold text-white">ข้อมูลขนาดอาคารและประเภทหลังคา</h4>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs text-slate-300">ประเภทหลังคา (Roof Type)</label>
                <select
                  value={project.building.roofType}
                  onChange={(e) =>
                    onUpdateProject({
                      ...project,
                      building: { ...project.building, roofType: e.target.value as RoofType }
                    })
                  }
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                >
                  <option value="CPAC Tile / Concrete Tile">กระเบื้องซีแพค / คอนกรีต (CPAC Tile)</option>
                  <option value="Metal Sheet (Kliplok/Seam)">เมทัลชีท Kliplok / Standing Seam</option>
                  <option value="Metal Sheet (Trapezoidal/Screw)">เมทัลชีท ลอนมาตรฐาน (Screw Fix)</option>
                  <option value="Concrete Slab (Flat Deck)">ดาดฟ้าคอนกรีต (Flat Concrete Deck)</option>
                  <option value="Solar Carport">โครงหลังคาที่จอดรถ (Solar Carport)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs text-slate-300">ความกว้างอาคาร (กว้าง ตะวันออก-ตก)</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={project.building.widthM}
                    onChange={(e) =>
                      onUpdateProject({
                        ...project,
                        building: { ...project.building, widthM: parseFloat(e.target.value) || 10 }
                      })
                    }
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono"
                  />
                  <span className="text-xs text-slate-400">เมตร</span>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs text-slate-300">ความยาวอาคาร (ยาว เหนือ-ใต้)</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={project.building.lengthM}
                    onChange={(e) =>
                      onUpdateProject({
                        ...project,
                        building: { ...project.building, lengthM: parseFloat(e.target.value) || 8 }
                      })
                    }
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono"
                  />
                  <span className="text-xs text-slate-400">เมตร</span>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs text-slate-300">ความสูงอาคาร (Building Height)</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={project.building.heightM}
                    onChange={(e) =>
                      onUpdateProject({
                        ...project,
                        building: { ...project.building, heightM: parseFloat(e.target.value) || 6 }
                      })
                    }
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono"
                  />
                  <span className="text-xs text-slate-400">เมตร</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              <div className="space-y-1.5">
                <label className="text-xs text-slate-300">มุมเอียงหลังคา (Roof Tilt Angle)</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="0"
                    max="45"
                    value={project.building.roofTiltDeg}
                    onChange={(e) => {
                      const tilt = parseFloat(e.target.value) || 12;
                      onUpdateProject({
                        ...project,
                        building: { ...project.building, roofTiltDeg: tilt },
                        layout: { ...project.layout, panelTiltDeg: tilt }
                      });
                    }}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono"
                  />
                  <span className="text-xs text-slate-400">องศา</span>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs text-slate-300">ทิศทางหันหลังคา (Azimuth)</label>
                <select
                  value={project.building.roofAzimuthDeg}
                  onChange={(e) => {
                    const az = parseInt(e.target.value);
                    onUpdateProject({
                      ...project,
                      building: { ...project.building, roofAzimuthDeg: az },
                      layout: { ...project.layout, panelAzimuthDeg: az }
                    });
                  }}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                >
                  <option value={180}>ทิศใต้ 180° (South - ผลิตไฟได้ดีที่สุดในไทย)</option>
                  <option value={90}>ทิศตะวันออก 90° (East - แดดช่วงเช้า)</option>
                  <option value={270}>ทิศตะวันตก 270° (West - แดดช่วงบ่าย)</option>
                  <option value={0}>ทิศเหนือ 0° (North - ไม่แนะนำสำหรับไทย)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs text-slate-300">สิ่งกีดขวางจำลองเงา (Shading Obstacles)</label>
                <select
                  value={project.building.obstacleType}
                  onChange={(e) =>
                    onUpdateProject({
                      ...project,
                      building: {
                        ...project.building,
                        hasObstacles: e.target.value !== 'None',
                        obstacleType: e.target.value as any
                      }
                    })
                  }
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                >
                  <option value="AC Units">คอมเพรสเซอร์แอร์บนหลังคา (AC Outdoor)</option>
                  <option value="Trees Nearby">มีต้นไม้ใหญ่ใกล้เคียง (Trees)</option>
                  <option value="Water Tank">ถังเก็บน้ำ / หอคอย (Water Tank)</option>
                  <option value="None">ไม่มีสิ่งกีดขวาง (โล่งแจ้งสมบูรณ์)</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* STEP 3: แผง PV & Inverter และอุปกรณ์ที่ใช้ (พร้อมโหมด DIY) */}
      {/* ============================================================ */}
      {activeStep === 3 && (
        <div className="space-y-6">
          {/* Mode Switcher: Presets vs DIY Mode */}
          <div className="bg-slate-950 p-1.5 rounded-2xl border border-slate-800 flex items-center justify-between gap-2 shadow-inner">
            <button
              onClick={() => setEquipmentMode('preset')}
              className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                equipmentMode === 'preset'
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-lg'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>เลือกจากแบรนด์มาตรฐาน Tier 1 (Standard Presets)</span>
            </button>
            <button
              onClick={() => setEquipmentMode('diy')}
              className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                equipmentMode === 'diy'
                  ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-bold shadow-lg'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <Wrench className="w-4 h-4" />
              <span>🛠️ โหมด DIY กำหนดสเปกเอง (Custom Panel / Inverter / AC-DC Combiner)</span>
            </button>
          </div>

          {/* -------------------------------------------------------- */}
          {/* (A) PRESET MODE */}
          {/* -------------------------------------------------------- */}
          {equipmentMode === 'preset' ? (
            <div className="space-y-6">
              {/* Select Solar Panels */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-white flex items-center gap-2">
                    <Layers className="w-4 h-4 text-amber-400" />
                    เลือกแผงโซลาร์เซลล์ Tier 1 (Solar Photovoltaic Modules)
                  </label>
                  <span className="text-[11px] text-emerald-400">รับประกันประสิทธิภาพ 25-30 ปี</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {SOLAR_PANELS.map((p) => {
                    const isSelected = project.selectedPanel.id === p.id;
                    return (
                      <div
                        key={p.id}
                        onClick={() => onUpdateProject({ ...project, selectedPanel: p })}
                        className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-amber-500/10 border-amber-500 shadow-md ring-1 ring-amber-500/30'
                            : 'bg-slate-950/60 border-slate-800 hover:bg-slate-800/40'
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="text-[10px] uppercase font-bold text-amber-400">{p.brand}</span>
                            <div className="text-xs font-bold text-white mt-0.5">{p.model}</div>
                          </div>
                          <span className="text-base font-black text-amber-300 font-mono">{p.wattage}W</span>
                        </div>
                        <div className="grid grid-cols-3 gap-2 mt-2 pt-2 border-t border-slate-800 text-[11px] text-slate-400 font-mono">
                          <div>Eff: {p.efficiency}%</div>
                          <div>Vmp: {p.vmp}V</div>
                          <div>Imp: {p.imp}A</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Select Inverters */}
              <div className="space-y-3 pt-4 border-t border-slate-800">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-white flex items-center gap-2">
                    <Cpu className="w-4 h-4 text-emerald-400" />
                    เลือกเครื่องแปลงกระแสไฟฟ้า (Grid-Tied / Hybrid Inverters)
                  </label>
                  <span className="text-[11px] text-emerald-400">ผ่านการรับรอง MEA / PEA</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {INVERTERS.map((inv) => {
                    const isSelected = project.selectedInverter.id === inv.id;
                    return (
                      <div
                        key={inv.id}
                        onClick={() => onUpdateProject({ ...project, selectedInverter: inv })}
                        className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-emerald-500/10 border-emerald-500 shadow-md ring-1 ring-emerald-500/30'
                            : 'bg-slate-950/60 border-slate-800 hover:bg-slate-800/40'
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="text-[10px] uppercase font-bold text-emerald-400">{inv.brand}</span>
                            <div className="text-xs font-bold text-white mt-0.5">{inv.model}</div>
                          </div>
                          <span className="text-base font-black text-emerald-300 font-mono">{inv.ratedPowerKw} kW</span>
                        </div>
                        <div className="grid grid-cols-3 gap-2 mt-2 pt-2 border-t border-slate-800 text-[11px] text-slate-400 font-mono">
                          <div>{inv.phase}</div>
                          <div>MPPT: {inv.mpptCount}</div>
                          <div>Eff: {inv.euroEfficiency}%</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Current Combiner Box Overview */}
              <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 flex flex-wrap items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <div className="text-xs font-bold text-white flex items-center gap-2">
                    <Box className="w-4 h-4 text-blue-400" />
                    <span>ตู้คอมไบเนอร์ AC / DC ปัจจุบัน:</span>
                  </div>
                  <p className="text-[11px] text-slate-400 font-mono">
                    DC Fuse {project.combinerBox.dcFuseRatingA}A • DC Isolator {project.combinerBox.dcIsolatorRatingA}A • AC {project.combinerBox.acBreakerType} {project.combinerBox.acBreakerRatingA}A ({project.combinerBox.acBreakerPoles}) • {project.combinerBox.zeroExportMeterModel}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setEquipmentMode('diy');
                    setDiyTab('combiner');
                  }}
                  className="px-3 py-1.5 bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors"
                >
                  <Wrench className="w-3.5 h-3.5" />
                  <span>ปรับแต่งตู้คอมไบเนอร์ AC/DC แบบ DIY</span>
                </button>
              </div>
            </div>
          ) : (
            /* -------------------------------------------------------- */
            /* (B) DIY CUSTOMIZATION MODE */
            /* -------------------------------------------------------- */
            <div className="space-y-6">
              {/* DIY Sub-Tabs */}
              <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
                <button
                  onClick={() => setDiyTab('panel')}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-colors ${
                    diyTab === 'panel'
                      ? 'bg-amber-500 text-slate-950 font-bold shadow'
                      : 'bg-slate-950 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>1. แผงโซลาร์เซลล์ DIY (PV Module)</span>
                </button>

                <button
                  onClick={() => setDiyTab('inverter')}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-colors ${
                    diyTab === 'inverter'
                      ? 'bg-amber-500 text-slate-950 font-bold shadow'
                      : 'bg-slate-950 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <Cpu className="w-3.5 h-3.5" />
                  <span>2. อินเวอร์เตอร์ DIY (Inverter)</span>
                </button>

                <button
                  onClick={() => setDiyTab('combiner')}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-colors ${
                    diyTab === 'combiner'
                      ? 'bg-amber-500 text-slate-950 font-bold shadow'
                      : 'bg-slate-950 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <Box className="w-3.5 h-3.5" />
                  <span>3. ตู้คอมไบเนอร์ AC/DC & อุปกรณ์ป้องกัน</span>
                </button>
              </div>

              {/* ----------------- SUB-TAB 1: DIY SOLAR PANEL ----------------- */}
              {diyTab === 'panel' && (
                <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-5 space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400">
                        <Layers className="w-4 h-4" />
                      </span>
                      <h4 className="text-sm font-bold text-white">กำหนดสเปกแผงโซลาร์เซลล์แบบ DIY (Custom PV Module)</h4>
                    </div>
                    <span className="text-xs text-amber-400 font-mono font-bold">
                      กำลังไฟ: {project.selectedPanel.wattage}W | Eff: {project.selectedPanel.efficiency}%
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs text-slate-300">ยี่ห้อ / แบรนด์แผง (Brand)</label>
                      <input
                        type="text"
                        value={project.selectedPanel.brand}
                        onChange={(e) =>
                          onUpdateProject({
                            ...project,
                            selectedPanel: { ...project.selectedPanel, brand: e.target.value }
                          })
                        }
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                        placeholder="เช่น Jinko, Canadian, Longi, Custom"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs text-slate-300">ชื่อรุ่นแผง (Model Name)</label>
                      <input
                        type="text"
                        value={project.selectedPanel.model}
                        onChange={(e) =>
                          onUpdateProject({
                            ...project,
                            selectedPanel: { ...project.selectedPanel, model: e.target.value }
                          })
                        }
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                        placeholder="เช่น Tiger Neo N-Type TOPCon"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs text-slate-300">กำลังวัตต์ต่อแผง (Pmax Wattage)</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          value={project.selectedPanel.wattage}
                          onChange={(e) =>
                            onUpdateProject({
                              ...project,
                              selectedPanel: {
                                ...project.selectedPanel,
                                wattage: parseFloat(e.target.value) || 585
                              }
                            })
                          }
                          className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono font-bold text-amber-300"
                        />
                        <span className="text-xs text-slate-400">Watt</span>
                      </div>
                    </div>
                  </div>

                  {/* Electrical Parameters */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-3 border-t border-slate-800/80">
                    <div className="space-y-1">
                      <label className="text-xs text-slate-300">แรงดัน Vmp (V)</label>
                      <input
                        type="number"
                        step="0.01"
                        value={project.selectedPanel.vmp}
                        onChange={(e) =>
                          onUpdateProject({
                            ...project,
                            selectedPanel: {
                              ...project.selectedPanel,
                              vmp: parseFloat(e.target.value) || 42.6
                            }
                          })
                        }
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white font-mono"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs text-slate-300">กระแส Imp (A)</label>
                      <input
                        type="number"
                        step="0.01"
                        value={project.selectedPanel.imp}
                        onChange={(e) =>
                          onUpdateProject({
                            ...project,
                            selectedPanel: {
                              ...project.selectedPanel,
                              imp: parseFloat(e.target.value) || 13.7
                            }
                          })
                        }
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white font-mono"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs text-slate-300">แรงดันเปิดวงจร Voc (V)</label>
                      <input
                        type="number"
                        step="0.01"
                        value={project.selectedPanel.voc}
                        onChange={(e) =>
                          onUpdateProject({
                            ...project,
                            selectedPanel: {
                              ...project.selectedPanel,
                              voc: parseFloat(e.target.value) || 51.2
                            }
                          })
                        }
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white font-mono"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs text-slate-300">กระแสลัดวงจร Isc (A)</label>
                      <input
                        type="number"
                        step="0.01"
                        value={project.selectedPanel.isc}
                        onChange={(e) =>
                          onUpdateProject({
                            ...project,
                            selectedPanel: {
                              ...project.selectedPanel,
                              isc: parseFloat(e.target.value) || 14.5
                            }
                          })
                        }
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white font-mono"
                      />
                    </div>
                  </div>

                  {/* Physical Dimensions */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-3 border-t border-slate-800/80">
                    <div className="space-y-1">
                      <label className="text-xs text-slate-300">ความยาวแผง (Length mm)</label>
                      <input
                        type="number"
                        value={project.selectedPanel.length}
                        onChange={(e) =>
                          onUpdateProject({
                            ...project,
                            selectedPanel: {
                              ...project.selectedPanel,
                              length: parseFloat(e.target.value) || 2278
                            }
                          })
                        }
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white font-mono"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs text-slate-300">ความกว้างแผง (Width mm)</label>
                      <input
                        type="number"
                        value={project.selectedPanel.width}
                        onChange={(e) =>
                          onUpdateProject({
                            ...project,
                            selectedPanel: {
                              ...project.selectedPanel,
                              width: parseFloat(e.target.value) || 1134
                            }
                          })
                        }
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white font-mono"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs text-slate-300">ประสิทธิภาพแผง Efficiency (%)</label>
                      <input
                        type="number"
                        step="0.1"
                        value={project.selectedPanel.efficiency}
                        onChange={(e) =>
                          onUpdateProject({
                            ...project,
                            selectedPanel: {
                              ...project.selectedPanel,
                              efficiency: parseFloat(e.target.value) || 22.5
                            }
                          })
                        }
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white font-mono"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs text-slate-300">ระยะรับประกัน (ปี)</label>
                      <input
                        type="number"
                        value={project.selectedPanel.warrantyYears}
                        onChange={(e) =>
                          onUpdateProject({
                            ...project,
                            selectedPanel: {
                              ...project.selectedPanel,
                              warrantyYears: parseInt(e.target.value) || 30
                            }
                          })
                        }
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white font-mono"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* ----------------- SUB-TAB 2: DIY INVERTER ----------------- */}
              {diyTab === 'inverter' && (
                <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-5 space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400">
                        <Cpu className="w-4 h-4" />
                      </span>
                      <h4 className="text-sm font-bold text-white">กำหนดสเปกเครื่องแปลงกระแสไฟฟ้า DIY (Custom Inverter)</h4>
                    </div>
                    <span className="text-xs text-emerald-400 font-mono font-bold">
                      พิกัดกำลัง: {project.selectedInverter.ratedPowerKw} kW ({project.selectedInverter.phase})
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs text-slate-300">ยี่ห้ออินเวอร์เตอร์ (Brand)</label>
                      <input
                        type="text"
                        value={project.selectedInverter.brand}
                        onChange={(e) =>
                          onUpdateProject({
                            ...project,
                            selectedInverter: { ...project.selectedInverter, brand: e.target.value }
                          })
                        }
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                        placeholder="เช่น Huawei, Sungrow, Deye, Growatt, Solis"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs text-slate-300">ชื่อรุ่นอินเวอร์เตอร์ (Model Name)</label>
                      <input
                        type="text"
                        value={project.selectedInverter.model}
                        onChange={(e) =>
                          onUpdateProject({
                            ...project,
                            selectedInverter: { ...project.selectedInverter, model: e.target.value }
                          })
                        }
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                        placeholder="เช่น SUN2000-10KTL-M1"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs text-slate-300">กำลังผลิตพิกัด (Rated Power kW)</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          step="0.5"
                          value={project.selectedInverter.ratedPowerKw}
                          onChange={(e) =>
                            onUpdateProject({
                              ...project,
                              selectedInverter: {
                                ...project.selectedInverter,
                                ratedPowerKw: parseFloat(e.target.value) || 5.0
                              }
                            })
                          }
                          className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono font-bold text-emerald-300"
                        />
                        <span className="text-xs text-slate-400">kW</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-3 border-t border-slate-800/80">
                    <div className="space-y-1">
                      <label className="text-xs text-slate-300">ระบบไฟฟ้า (Phase)</label>
                      <select
                        value={project.selectedInverter.phase}
                        onChange={(e) =>
                          onUpdateProject({
                            ...project,
                            phase: e.target.value as SystemPhase,
                            selectedInverter: {
                              ...project.selectedInverter,
                              phase: e.target.value as SystemPhase
                            }
                          })
                        }
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                      >
                        <option value="1-Phase (220V)">1-Phase 220V</option>
                        <option value="3-Phase (380V)">3-Phase 380V</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs text-slate-300">จำนวนช่องต่อ MPPT</label>
                      <select
                        value={project.selectedInverter.mpptCount}
                        onChange={(e) =>
                          onUpdateProject({
                            ...project,
                            selectedInverter: {
                              ...project.selectedInverter,
                              mpptCount: parseInt(e.target.value) || 2
                            }
                          })
                        }
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                      >
                        <option value={1}>1 MPPT</option>
                        <option value={2}>2 MPPTs</option>
                        <option value={3}>3 MPPTs</option>
                        <option value={4}>4 MPPTs</option>
                        <option value={6}>6 MPPTs</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs text-slate-300">แรงดันสูงสุด Max DC Voltage (V)</label>
                      <input
                        type="number"
                        value={project.selectedInverter.maxDcVoltage}
                        onChange={(e) =>
                          onUpdateProject({
                            ...project,
                            selectedInverter: {
                              ...project.selectedInverter,
                              maxDcVoltage: parseInt(e.target.value) || 1100
                            }
                          })
                        }
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-3 border-t border-slate-800/80">
                    <div className="space-y-1">
                      <label className="text-xs text-slate-300">ช่วงแรงดัน MPPT Vmin - Vmax (V)</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          value={project.selectedInverter.mpptVoltageRange[0]}
                          onChange={(e) =>
                            onUpdateProject({
                              ...project,
                              selectedInverter: {
                                ...project.selectedInverter,
                                mpptVoltageRange: [
                                  parseInt(e.target.value) || 160,
                                  project.selectedInverter.mpptVoltageRange[1]
                                ]
                              }
                            })
                          }
                          className="w-full bg-slate-900 border border-slate-700 rounded-xl px-2 py-1.5 text-xs text-white font-mono"
                          placeholder="Min V"
                        />
                        <span className="text-slate-400">-</span>
                        <input
                          type="number"
                          value={project.selectedInverter.mpptVoltageRange[1]}
                          onChange={(e) =>
                            onUpdateProject({
                              ...project,
                              selectedInverter: {
                                ...project.selectedInverter,
                                mpptVoltageRange: [
                                  project.selectedInverter.mpptVoltageRange[0],
                                  parseInt(e.target.value) || 1000
                                ]
                              }
                            })
                          }
                          className="w-full bg-slate-900 border border-slate-700 rounded-xl px-2 py-1.5 text-xs text-white font-mono"
                          placeholder="Max V"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs text-slate-300">ประสิทธิภาพ Euro Efficiency (%)</label>
                      <input
                        type="number"
                        step="0.1"
                        value={project.selectedInverter.euroEfficiency}
                        onChange={(e) =>
                          onUpdateProject({
                            ...project,
                            selectedInverter: {
                              ...project.selectedInverter,
                              euroEfficiency: parseFloat(e.target.value) || 98.1
                            }
                          })
                        }
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white font-mono"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs text-slate-300">ระยะรับประกัน Inverter (ปี)</label>
                      <input
                        type="number"
                        value={project.selectedInverter.warrantyYears}
                        onChange={(e) =>
                          onUpdateProject({
                            ...project,
                            selectedInverter: {
                              ...project.selectedInverter,
                              warrantyYears: parseInt(e.target.value) || 10
                            }
                          })
                        }
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white font-mono"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* ----------------- SUB-TAB 3: DIY COMBINER BOX ----------------- */}
              {diyTab === 'combiner' && (
                <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-5 space-y-6">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="p-1.5 rounded-lg bg-blue-500/20 text-blue-400">
                        <Box className="w-4 h-4" />
                      </span>
                      <div>
                        <h4 className="text-sm font-bold text-white">
                          กำหนดสเปกตู้คอมไบเนอร์ AC / DC และอุปกรณ์ป้องกันไฟฟ้า (Protection Devices)
                        </h4>
                        <p className="text-[11px] text-slate-400">
                          สเปกทั้งหมดจะไปปรากฏบน Single Line Diagram (SLD) และใบเสนอราคา (BOM) โดยอัตโนมัติ
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* 1. DC Combiner Box Specs */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider">
                      <span>[1] ตู้คอมไบเนอร์ฝั่งไฟฟ้ากระแสตรง (DC Combiner Box)</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-slate-900/90 border border-slate-800 p-4 rounded-xl">
                      <div className="space-y-1">
                        <label className="text-xs text-slate-300">ฟิวส์ DC Fuse (gPV)</label>
                        <select
                          value={project.combinerBox.dcFuseRatingA}
                          onChange={(e) =>
                            onUpdateProject({
                              ...project,
                              combinerBox: {
                                ...project.combinerBox,
                                dcFuseRatingA: parseInt(e.target.value) || 15
                              }
                            })
                          }
                          className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono"
                        >
                          <option value={10}>10A gPV 1000V</option>
                          <option value={15}>15A gPV 1000V (มาตรฐาน)</option>
                          <option value={20}>20A gPV 1000V</option>
                          <option value={25}>25A gPV 1000V</option>
                          <option value={30}>30A gPV 1000V</option>
                          <option value={32}>32A gPV 1500V</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs text-slate-300">สวิตช์ตัดตอน DC Isolator</label>
                        <select
                          value={project.combinerBox.dcIsolatorRatingA}
                          onChange={(e) =>
                            onUpdateProject({
                              ...project,
                              combinerBox: {
                                ...project.combinerBox,
                                dcIsolatorRatingA: parseInt(e.target.value) || 32
                              }
                            })
                          }
                          className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono"
                        >
                          <option value={16}>16A 1000V DC-PV2</option>
                          <option value={25}>25A 1000V DC-PV2</option>
                          <option value={32}>32A 1000V DC-PV2 (มาตรฐาน)</option>
                          <option value={40}>40A 1000V DC-PV2</option>
                          <option value={63}>63A 1500V DC-PV2</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs text-slate-300">อุปกรณ์ป้องกันเสิร์จ DC SPD</label>
                        <select
                          value={project.combinerBox.dcSpdType}
                          onChange={(e) =>
                            onUpdateProject({
                              ...project,
                              combinerBox: {
                                ...project.combinerBox,
                                dcSpdType: e.target.value
                              }
                            })
                          }
                          className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                        >
                          <option value="Type 2 (DC)">Type 2 (In 20kA, Imax 40kA)</option>
                          <option value="Type 1+2 (DC)">Type 1+2 (In 20kA, Imax 50kA)</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs text-slate-300">ขนาดสายไฟโซลาร์ DC Cable</label>
                        <select
                          value={project.combinerBox.dcCableSizeMm2}
                          onChange={(e) =>
                            onUpdateProject({
                              ...project,
                              combinerBox: {
                                ...project.combinerBox,
                                dcCableSizeMm2: e.target.value
                              }
                            })
                          }
                          className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono"
                        >
                          <option value="1x4.0 mm²">1x4.0 mm² PV1-F (มาตรฐาน)</option>
                          <option value="1x6.0 mm²">1x6.0 mm² PV1-F (ระยะไกล)</option>
                          <option value="1x10.0 mm²">1x10.0 mm² PV1-F (Heavy Duty)</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* 2. AC Solar Sub-DB Specs */}
                  <div className="space-y-3 pt-2">
                    <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider">
                      <span>[2] ตู้ควบคุมไฟฟ้ากระแสสลับ (AC Solar Sub-DB) & กันย้อน Zero Export</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-slate-900/90 border border-slate-800 p-4 rounded-xl">
                      <div className="space-y-1">
                        <label className="text-xs text-slate-300">เบรกเกอร์ AC Breaker</label>
                        <div className="flex items-center gap-1.5">
                          <select
                            value={project.combinerBox.acBreakerType}
                            onChange={(e) =>
                              onUpdateProject({
                                ...project,
                                combinerBox: {
                                  ...project.combinerBox,
                                  acBreakerType: e.target.value
                                }
                              })
                            }
                            className="bg-slate-950 border border-slate-700 rounded-xl px-2 py-2 text-xs text-white font-mono"
                          >
                            <option value="MCB">MCB</option>
                            <option value="MCCB">MCCB</option>
                          </select>
                          <select
                            value={project.combinerBox.acBreakerRatingA}
                            onChange={(e) =>
                              onUpdateProject({
                                ...project,
                                combinerBox: {
                                  ...project.combinerBox,
                                  acBreakerRatingA: parseInt(e.target.value) || 32
                                }
                              })
                            }
                            className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-2 py-2 text-xs text-white font-mono"
                          >
                            <option value={16}>16A</option>
                            <option value={20}>20A</option>
                            <option value={25}>25A</option>
                            <option value={32}>32A</option>
                            <option value={40}>40A</option>
                            <option value={50}>50A</option>
                            <option value={63}>63A</option>
                            <option value={80}>80A</option>
                            <option value={100}>100A</option>
                            <option value={125}>125A</option>
                          </select>
                          <select
                            value={project.combinerBox.acBreakerPoles}
                            onChange={(e) =>
                              onUpdateProject({
                                ...project,
                                combinerBox: {
                                  ...project.combinerBox,
                                  acBreakerPoles: e.target.value
                                }
                              })
                            }
                            className="bg-slate-950 border border-slate-700 rounded-xl px-2 py-2 text-xs text-white font-mono"
                          >
                            <option value="2P">2P (1-Phase)</option>
                            <option value="3P">3P (3-Phase)</option>
                            <option value="4P">4P (3P+N)</option>
                          </select>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs text-slate-300">อุปกรณ์ตัดไฟรั่ว AC RCBO</label>
                        <select
                          value={project.combinerBox.acRcboRatingMa}
                          onChange={(e) =>
                            onUpdateProject({
                              ...project,
                              combinerBox: {
                                ...project.combinerBox,
                                acRcboRatingMa: parseInt(e.target.value) || 30
                              }
                            })
                          }
                          className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono"
                        >
                          <option value={30}>30mA (Type A - มาตรฐานที่อยู่อาศัย)</option>
                          <option value={100}>100mA (Type A - เชิงพาณิชย์)</option>
                          <option value={300}>300mA (Type B - ป้องกันอัคคีภัย)</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs text-slate-300">อุปกรณ์ป้องกันเสิร์จ AC SPD</label>
                        <select
                          value={project.combinerBox.acSpdUcV}
                          onChange={(e) =>
                            onUpdateProject({
                              ...project,
                              combinerBox: {
                                ...project.combinerBox,
                                acSpdUcV: parseInt(e.target.value) || 385
                              }
                            })
                          }
                          className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono"
                        >
                          <option value={275}>Type 2 (Uc 275V - 1 Phase)</option>
                          <option value={385}>Type 2 (Uc 385V - 3 Phase มาตรฐาน)</option>
                          <option value={420}>Type 2 (Uc 420V - ทนไฟกระชากสูง)</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs text-slate-300">ขนาดสายส่งไฟฟ้า AC Cable</label>
                        <select
                          value={project.combinerBox.acCableSpec}
                          onChange={(e) =>
                            onUpdateProject({
                              ...project,
                              combinerBox: {
                                ...project.combinerBox,
                                acCableSpec: e.target.value
                              }
                            })
                          }
                          className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono"
                        >
                          <option value="3x6.0 mm² Cu/XLPE">3x6.0 mm² Cu/XLPE (1-Phase 5kW)</option>
                          <option value="3x10.0 mm² Cu/XLPE">3x10.0 mm² Cu/XLPE (1-Phase 8kW)</option>
                          <option value="4x6.0 mm² Cu/XLPE">4x6.0 mm² Cu/XLPE (3-Phase 10kW)</option>
                          <option value="4x10.0 mm² Cu/XLPE">4x10.0 mm² Cu/XLPE (3-Phase 15kW)</option>
                          <option value="4x16.0 mm² Cu/XLPE">4x16.0 mm² Cu/XLPE (3-Phase 20kW)</option>
                          <option value="4x25.0 mm² Cu/XLPE">4x25.0 mm² Cu/XLPE (3-Phase 30kW)</option>
                          <option value="4x35.0 mm² Cu/XLPE">4x35.0 mm² Cu/XLPE (3-Phase 50kW)</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* 3. Smart Meter / Zero Export */}
                  <div className="space-y-2 pt-2">
                    <label className="text-xs text-slate-300">มิเตอร์กันย้อน Smart Power Sensor (Zero Export)</label>
                    <input
                      type="text"
                      value={project.combinerBox.zeroExportMeterModel}
                      onChange={(e) =>
                        onUpdateProject({
                          ...project,
                          combinerBox: {
                            ...project.combinerBox,
                            zeroExportMeterModel: e.target.value
                          }
                        })
                      }
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono"
                      placeholder="เช่น DTSU666-H (3-Phase with External CTs)"
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Battery ESS (if Hybrid) */}
          {project.systemType.includes('Hybrid') && (
            <div className="space-y-3 pt-4 border-t border-slate-800">
              <label className="text-xs font-semibold text-white flex items-center gap-2">
                <Zap className="w-4 h-4 text-purple-400" />
                เลือกระบบแบตเตอรี่สำรองไฟ (Lithium LiFePO4 Battery ESS)
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {BATTERIES.map((bat) => {
                  const isSelected = project.selectedBattery?.id === bat.id;
                  return (
                    <div
                      key={bat.id}
                      onClick={() => onUpdateProject({ ...project, selectedBattery: bat })}
                      className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-purple-500/10 border-purple-500 shadow-md'
                          : 'bg-slate-950/60 border-slate-800 hover:bg-slate-800/40'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="text-[10px] uppercase font-bold text-purple-400">{bat.brand}</span>
                          <div className="text-xs font-bold text-white mt-0.5">{bat.model}</div>
                        </div>
                        <span className="text-base font-black text-purple-300 font-mono">{bat.capacityKwh} kWh</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ============================================================ */}
      {/* STEP 4: Concept Design & สรุปโครงการ */}
      {/* ============================================================ */}
      {activeStep === 4 && (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-blue-950/40 via-slate-900 to-amber-950/30 border border-slate-800 rounded-2xl p-5">
            <h4 className="text-base font-bold text-white mb-2 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              สรุป Concept Design และสเปกระบบวิศวกรรม
            </h4>
            <p className="text-slate-400 text-xs">
              ระบบพร้อมสำหรับการจำลองแสงเงา 3D Shading Simulation, จัดแบบ CAD 2D, สร้าง Single Line Diagram และจัดทำเล่ม Proposal เสนองาน
            </p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-5">
              <div className="bg-slate-900/90 border border-slate-800 p-3.5 rounded-xl">
                <span className="text-xs text-slate-400">กำลังผลิตรวม PV</span>
                <div className="text-2xl font-bold text-amber-400 font-mono mt-1">{totalKwp} kWp</div>
                <span className="text-[11px] text-slate-400">{totalModules} แผง ({project.selectedPanel.wattage}W)</span>
              </div>

              <div className="bg-slate-900/90 border border-slate-800 p-3.5 rounded-xl">
                <span className="text-xs text-slate-400">อินเวอร์เตอร์ (Inverter)</span>
                <div className="text-2xl font-bold text-emerald-400 font-mono mt-1">
                  {project.selectedInverter.ratedPowerKw} kW
                </div>
                <span className="text-[11px] text-slate-400">DC/AC Ratio: {dcAcRatio}</span>
              </div>

              <div className="bg-slate-900/90 border border-slate-800 p-3.5 rounded-xl">
                <span className="text-xs text-slate-400">ระบบเชื่อมต่อ</span>
                <div className="text-lg font-bold text-white mt-1">{project.phase}</div>
                <span className="text-[11px] text-slate-400">{project.systemType}</span>
              </div>

              <div className="bg-slate-900/90 border border-slate-800 p-3.5 rounded-xl">
                <span className="text-xs text-slate-400">งบประมาณโครงการ (CAPEX)</span>
                <div className="text-2xl font-bold text-white font-mono mt-1">
                  ฿{project.financial.systemCostThb.toLocaleString()}
                </div>
                <span className="text-[11px] text-emerald-400">ROI คืนทุน ~4.5-5.5 ปี</span>
              </div>
            </div>
          </div>

          {/* Quick Direct Actions to Design, Simulation, SLD, BOQ, Proposal */}
          <div className="space-y-3">
            <span className="text-xs font-semibold text-slate-300">เลือกดูผลลัพธ์การออกแบบ:</span>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              <button
                onClick={() => onNavigateTab('design')}
                className="p-3.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl border border-slate-700 text-left transition-colors flex flex-col justify-between"
              >
                <div className="text-amber-400 font-bold text-xs">โมเดล 3D & 2D CAD</div>
                <div className="text-slate-400 text-[11px] mt-1">ดูแบบหลังคาและจัดวางแผง</div>
              </button>

              <button
                onClick={() => onNavigateTab('pvsyst')}
                className="p-3.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl border border-slate-700 text-left transition-colors flex flex-col justify-between"
              >
                <div className="text-amber-400 font-bold text-xs">3D Shading & PVsyst</div>
                <div className="text-slate-400 text-[11px] mt-1">วิเคราะห์เงา & ผลิตไฟ</div>
              </button>

              <button
                onClick={() => onNavigateTab('sld')}
                className="p-3.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl border border-slate-700 text-left transition-colors flex flex-col justify-between"
              >
                <div className="text-amber-400 font-bold text-xs">Single Line Diagram</div>
                <div className="text-slate-400 text-[11px] mt-1">แบบไดอะแกรมวิศวกรรมไฟฟ้า</div>
              </button>

              <button
                onClick={() => onNavigateTab('boq')}
                className="p-3.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl border border-emerald-500/40 text-left transition-colors flex flex-col justify-between"
              >
                <div className="text-emerald-400 font-bold text-xs">ถอดแบบ BOQ & ราคา</div>
                <div className="text-slate-400 text-[11px] mt-1">บัญชีปริมาณวัสดุ & Excel</div>
              </button>

              <button
                onClick={() => onNavigateTab('proposal')}
                className="p-3.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl text-left transition-colors flex flex-col justify-between shadow-lg"
              >
                <div className="text-slate-950 font-bold text-xs">📑 เล่ม Proposal เสนองาน</div>
                <div className="text-slate-900 text-[11px] mt-1">พิมพ์หรือส่งให้ลูกค้าทันที</div>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Buttons Prev / Next */}
      <div className="flex items-center justify-between pt-4 border-t border-slate-800">
        <button
          onClick={() => onStepChange(Math.max(1, activeStep - 1))}
          disabled={activeStep === 1}
          className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          ย้อนกลับ
        </button>

        {activeStep < 4 ? (
          <button
            onClick={() => onStepChange(activeStep + 1)}
            className="px-5 py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-600 text-slate-950 flex items-center gap-1.5 shadow transition-colors"
          >
            ขั้นตอนถัดไป
            <ChevronRight className="w-4 h-4" />
          </button>
        ) : (
          <button
            onClick={() => onNavigateTab('proposal')}
            className="px-6 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 shadow-lg flex items-center gap-2"
          >
            ดูเล่ม Proposal เสนองาน
            <ChevronRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};

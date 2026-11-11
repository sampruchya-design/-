import React from 'react';
import { ProjectData, SystemType, SystemPhase, RoofType } from '../../types/solar';
import { SOLAR_PANELS, INVERTERS, BATTERIES, THAILAND_LOCATIONS, DEFAULT_PROJECT_PRESETS } from '../../data/solarEquipment';
import { CheckCircle2, ChevronRight, ChevronLeft, MapPin, Building, Zap, Layers, Cpu, Shield, Sparkles, HelpCircle } from 'lucide-react';

interface ProjectStepWizardProps {
  project: ProjectData;
  activeStep: number;
  onStepChange: (step: number) => void;
  onUpdateProject: (updated: ProjectData) => void;
  onApplyPreset: (presetKey: string) => void;
  onNavigateTab: (tab: 'design' | 'pvsyst' | 'sld' | 'proposal') => void;
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
      {/* STEP 3: แผง PV & Inverter และอุปกรณ์ที่ใช้ */}
      {/* ============================================================ */}
      {activeStep === 3 && (
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

          {/* Quick Direct Actions to Design, Simulation, SLD, Proposal */}
          <div className="space-y-3">
            <span className="text-xs font-semibold text-slate-300">เลือกดูผลลัพธ์การออกแบบ:</span>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
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

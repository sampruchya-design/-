/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ProjectData } from './types/solar';
import { SOLAR_PANELS, INVERTERS, THAILAND_LOCATIONS, DEFAULT_PROJECT_PRESETS, DEFAULT_COMBINER_BOX } from './data/solarEquipment';
import { HeaderNav, ActiveTab } from './components/HeaderNav';
import { SolarScene3D } from './components/3d/SolarScene3D';
import { SolarCadView2D } from './components/2d/SolarCadView2D';
import { SingleLineDiagram } from './components/sld/SingleLineDiagram';
import { PVsystShadingReport } from './components/pvsyst/PVsystShadingReport';
import { ExecutiveProposal } from './components/proposal/ExecutiveProposal';
import { ProjectStepWizard } from './components/wizard/ProjectStepWizard';
import { Box, Layers, Sun, Zap, FileText, Settings, Sparkles, CheckCircle2, ChevronRight, Ruler, Eye } from 'lucide-react';

export default function App() {
  // Initialize default project with realistic Thai rooftop configuration
  const [project, setProject] = useState<ProjectData>({
    id: 'proj-001',
    projectName: 'โครงการติดตั้งระบบโซลาร์เซลล์ บ้านพักอาศัย (Residential 5.26 kWp)',
    clientName: 'คุณสมชาย วงศ์สวัสดิ์',
    clientAddress: '88/19 หมู่บ้านนันทวัน ถ.ราชพฤกษ์ บางกรวย นนทบุรี',
    clientPhone: '081-987-6543',
    companyName: 'SolarPro Engineering Co., Ltd.',
    engineerName: 'นายวิศวกร พลังงานสะอาด',
    engineerLicense: 'สย. 94821 (วิศวกรรมไฟฟ้ากำลัง)',
    proposalDate: new Date().toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' }),
    systemType: 'On-Grid',
    phase: '1-Phase (220V)',
    targetCapacityKwp: 5.26,
    location: THAILAND_LOCATIONS[0], // Bangkok
    building: {
      name: 'บ้านเดี่ยว 2 ชั้น หลังคาซีแพคโมเนีย',
      widthM: 10,
      lengthM: 8,
      heightM: 6.5,
      roofType: 'CPAC Tile / Concrete Tile',
      roofTiltDeg: 15,
      roofAzimuthDeg: 180, // Facing South
      parapetHeightM: 0.2,
      hasObstacles: true,
      obstacleType: 'AC Units',
      treeDistanceM: 8,
      treeHeightM: 6
    },
    selectedPanel: SOLAR_PANELS[0], // Jinko 585W TOPCon
    selectedInverter: INVERTERS[0], // Huawei 5kW 1-Phase
    combinerBox: {
      ...DEFAULT_COMBINER_BOX,
      acBreakerPoles: '2P',
      acBreakerRatingA: 32,
      acCableSpec: '3x6.0 mm² Cu/XLPE'
    },
    layout: {
      modulesPerRow: 3,
      rows: 3,
      orientation: 'Portrait',
      rowSpacingM: 0.1,
      panelTiltDeg: 15,
      panelAzimuthDeg: 180,
      stringsCount: 1,
      modulesPerString: 9
    },
    financial: {
      systemCostThb: 179000,
      electricityRateThbPerUnit: 4.70,
      touOnPeakRateThb: 5.15,
      touOffPeakRateThb: 2.63,
      useTouRate: false,
      onPeakSharePercent: 75,
      annualDegradationPercent: 0.5,
      electricityInflationPercent: 2.5,
      omCostAnnualThb: 1500
    },
    notes: 'แบบสำหรับยื่นขอขนานไฟ MEA / PEA และคำนวณเงาตกกระทบตามมาตรฐาน PVsyst'
  });

  const [activeTab, setActiveTab] = useState<ActiveTab>('design');
  const [designSubTab, setDesignSubTab] = useState<'3d' | '2d' | 'both'>('3d');
  const [activeWizardStep, setActiveWizardStep] = useState<number>(1);
  const [captured3dImage, setCaptured3dImage] = useState<string | null>(null);
  const [showGuideModal, setShowGuideModal] = useState<boolean>(false);

  // Apply project presets
  const handleApplyPreset = (presetKey: string) => {
    const preset = DEFAULT_PROJECT_PRESETS[presetKey];
    if (preset) {
      setProject((prev) => ({
        ...prev,
        ...preset,
        selectedInverter:
          preset.systemType === 'Hybrid (with Battery ESS)'
            ? INVERTERS[4] // Deye Hybrid
            : preset.phase === '3-Phase (380V)'
            ? INVERTERS[1] // Huawei 10kW
            : INVERTERS[0] // Huawei 5kW
      }));
    }
  };

  const handleCaptureSnapshot = (dataUrl: string) => {
    setCaptured3dImage(dataUrl);
    // Notify user gently
    alert('บันทึกภาพเรนเดอร์ 3D ลงในเล่ม Proposal เรียบร้อยแล้ว! สามารถคลิกแท็บ "เล่ม Proposal เสนองาน" เพื่อดูผลงานได้ทันที');
  };

  const totalModules = project.layout.modulesPerRow * project.layout.rows;
  const totalKwp = ((totalModules * project.selectedPanel.wattage) / 1000).toFixed(2);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-amber-500 selection:text-slate-950">
      {/* Top Engineering Nav Header */}
      <HeaderNav
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        project={project}
        onPrintProposal={() => {
          setActiveTab('proposal');
          setTimeout(() => window.print(), 300);
        }}
      />

      {/* Main Workspace Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 lg:p-6 space-y-6">

        {/* Quick Guide & Preset Quick Bar */}
        <div className="no-print bg-gradient-to-r from-blue-950/60 via-slate-900 to-amber-950/40 border border-slate-800 rounded-2xl p-4 shadow-xl flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <Sparkles className="w-4 h-4" />
            </span>
            <div>
              <div className="text-white text-xs font-bold flex items-center gap-2">
                วิธีใช้งาน SolarPro Studio 3D ใน 3 นาที
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full font-mono">
                  พร้อมใช้งานจริง
                </span>
              </div>
              <p className="text-slate-400 text-[11px] mt-0.5">
                เลือกแม่แบบโครงการด่วนด้านขวา หรือกดดูขั้นตอนการใช้งานเพื่อนำเสนอลูกค้า
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowGuideModal(true)}
              className="bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/30 px-3 py-1.5 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-colors shadow"
            >
              <span>📖 เปิดคู่มือการใช้งาน</span>
            </button>
            <button
              onClick={() => handleApplyPreset('residential5kwp')}
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-3 py-1.5 rounded-xl text-xs font-medium transition-colors"
            >
              5 kWp บ้านเดี่ยว
            </button>
            <button
              onClick={() => handleApplyPreset('luxuryVilla10kwp')}
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-3 py-1.5 rounded-xl text-xs font-medium transition-colors"
            >
              10 kWp วิลล่า 3 เฟส
            </button>
            <button
              onClick={() => handleApplyPreset('hybridEss12kwp')}
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-3 py-1.5 rounded-xl text-xs font-medium transition-colors"
            >
              12 kWp ไฮบริด+แบต
            </button>
          </div>
        </div>

        {/* ------------------------------------------------------------- */}
        {/* TAB 1: 2D & 3D CAD DESIGN (โมเดลหน้างานจริง) */}
        {/* ------------------------------------------------------------- */}
        {activeTab === 'design' && (
          <div className="space-y-4">
            {/* Design Viewport Switcher */}
            <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900 border border-slate-800 p-3 rounded-2xl">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-300">โหมดมุมมองงานออกแบบ:</span>
                <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800">
                  <button
                    onClick={() => setDesignSubTab('3d')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      designSubTab === '3d'
                        ? 'bg-amber-500 text-slate-950 font-bold shadow'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Box className="w-3.5 h-3.5" />
                    <span>โมเดล 3D เสมือนจริง & Shading</span>
                  </button>
                  <button
                    onClick={() => setDesignSubTab('2d')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      designSubTab === '2d'
                        ? 'bg-amber-500 text-slate-950 font-bold shadow'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Ruler className="w-3.5 h-3.5" />
                    <span>ผังหลังคา 2D CAD & สาย String</span>
                  </button>
                  <button
                    onClick={() => setDesignSubTab('both')}
                    className={`hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      designSubTab === 'both'
                        ? 'bg-amber-500 text-slate-950 font-bold shadow'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>แสดงคู่ขนาน (Split View)</span>
                  </button>
                </div>
              </div>

              {/* Quick Spec Pills */}
              <div className="flex items-center gap-3 text-xs font-mono text-slate-300">
                <span className="bg-slate-800/80 px-2.5 py-1 rounded-lg border border-slate-700">
                  อาคาร: {project.building.widthM} × {project.building.lengthM} ม. (สูง {project.building.heightM} ม.)
                </span>
                <span className="bg-slate-800/80 px-2.5 py-1 rounded-lg border border-slate-700">
                  มุมเอียง: {project.layout.panelTiltDeg}° (ทิศใต้ {project.layout.panelAzimuthDeg}°)
                </span>
              </div>
            </div>

            {/* Split or Single Viewport */}
            {designSubTab === 'both' ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <SolarScene3D project={project} onCaptureSnapshot={handleCaptureSnapshot} />
                </div>
                <div>
                  <SolarCadView2D
                    project={project}
                    onUpdateLayout={(newLayout) => setProject({ ...project, layout: newLayout })}
                  />
                </div>
              </div>
            ) : designSubTab === '3d' ? (
              <SolarScene3D project={project} onCaptureSnapshot={handleCaptureSnapshot} />
            ) : (
              <SolarCadView2D
                project={project}
                onUpdateLayout={(newLayout) => setProject({ ...project, layout: newLayout })}
              />
            )}
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* TAB 2: 3D SHADING SIMULATION & PVSYST YIELD */}
        {/* ------------------------------------------------------------- */}
        {activeTab === 'pvsyst' && (
          <div className="space-y-6">
            <PVsystShadingReport project={project} />
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* TAB 3: SINGLE LINE DIAGRAM (SLD) */}
        {/* ------------------------------------------------------------- */}
        {activeTab === 'sld' && (
          <div className="space-y-6">
            <SingleLineDiagram project={project} />
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* TAB 4: EXECUTIVE PROPOSAL BOOK */}
        {/* ------------------------------------------------------------- */}
        {activeTab === 'proposal' && (
          <div className="space-y-6">
            <ExecutiveProposal project={project} captured3dImage={captured3dImage} />
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* TAB 5: 4-STEP WIZARD */}
        {/* ------------------------------------------------------------- */}
        {activeTab === 'wizard' && (
          <div className="space-y-6">
            <ProjectStepWizard
              project={project}
              activeStep={activeWizardStep}
              onStepChange={setActiveWizardStep}
              onUpdateProject={setProject}
              onApplyPreset={handleApplyPreset}
              onNavigateTab={(tab) => setActiveTab(tab)}
            />
          </div>
        )}

      </main>

      {/* Footer */}
      <footer className="no-print bg-slate-900 border-t border-slate-800 py-6 px-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-slate-400">
            <Sun className="w-4 h-4 text-amber-400" />
            <span className="font-semibold text-slate-300">SolarPro Studio Suite</span>
            <span>—</span>
            <span>ระบบออกแบบเขียนแบบ 2D/3D, 3D Shading Simulation, Single Line Diagram & เล่ม Proposal</span>
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <span>มาตรฐาน วสท. 022013-63</span>
            <span>•</span>
            <span>ระเบียบ กฟน. & กฟภ.</span>
            <span>•</span>
            <span>PVsyst Methodology</span>
          </div>
        </div>
      </footer>
      {/* Guide Modal */}
      {showGuideModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-5 text-slate-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-amber-500/20 text-amber-400">
                  <Sparkles className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="text-base font-bold text-white">คู่มือการใช้งาน SolarPro Studio 3D</h3>
                  <p className="text-xs text-slate-400">วิธีออกแบบ จำลองเงา และทำเล่มเสนอราคาใน 5 ขั้นตอน</p>
                </div>
              </div>
              <button
                onClick={() => setShowGuideModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 text-sm font-bold"
              >
                ✕ ปิด
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="flex gap-3 p-3 bg-slate-950/80 border border-slate-800 rounded-xl">
                <span className="w-6 h-6 rounded-full bg-amber-500 text-slate-950 font-bold flex items-center justify-center shrink-0">1</span>
                <div>
                  <span className="font-bold text-amber-400 text-sm block">เลือกเทมเพลต หรือกรอกข้อมูลในแท็บ "ข้อมูล 4 ขั้นตอน"</span>
                  <p className="text-slate-300 mt-1">
                    สามารถคลิกแม่แบบสำเร็จรูป เช่น บ้านเดี่ยว 5 kWp, วิลล่า 10 kWp 3 เฟส หรือระบุชื่อลูกค้า ขนาดอาคาร และเลือกแผง Tier 1 (Jinko/LONGi) และ Inverter (Huawei/Sungrow)
                  </p>
                </div>
              </div>

              <div className="flex gap-3 p-3 bg-slate-950/80 border border-slate-800 rounded-xl">
                <span className="w-6 h-6 rounded-full bg-amber-500 text-slate-950 font-bold flex items-center justify-center shrink-0">2</span>
                <div>
                  <span className="font-bold text-amber-400 text-sm block">ส่องดูโมเดล 3D และจำลองเงาแสงอาทิตย์ (3D Shading)</span>
                  <p className="text-slate-300 mt-1">
                    ในแท็บ "โมเดล 2D / 3D CAD" ใช้เมาส์หมุนดูตัวบ้านเสมือนจริง ลากสไลเดอร์เวลา 06:00 - 18:00 น. หรือกดปุ่ม Play เพื่อดูเงาต้นไม้/ผนังกันตกทอดทับแผง
                  </p>
                </div>
              </div>

              <div className="flex gap-3 p-3 bg-slate-950/80 border border-slate-800 rounded-xl">
                <span className="w-6 h-6 rounded-full bg-amber-500 text-slate-950 font-bold flex items-center justify-center shrink-0">3</span>
                <div>
                  <span className="font-bold text-amber-400 text-sm block">ปรับจัดวางแผงในผัง 2D CAD</span>
                  <p className="text-slate-300 mt-1">
                    สลับไปมุมมอง "ผังหลังคา 2D CAD" เพื่อเพิ่มหรือลดจำนวนแผง, เปลี่ยนแนวตั้ง/แนวนอน, ตรวจสอบระยะร่นทางเดิน Walkway 0.6 ม. และจัดวงจรสตริง (Strings)
                  </p>
                </div>
              </div>

              <div className="flex gap-3 p-3 bg-slate-950/80 border border-slate-800 rounded-xl">
                <span className="w-6 h-6 rounded-full bg-amber-500 text-slate-950 font-bold flex items-center justify-center shrink-0">4</span>
                <div>
                  <span className="font-bold text-amber-400 text-sm block">ตรวจสอบแบบ Single Line Diagram (SLD) ยื่น กฟน./กฟภ.</span>
                  <p className="text-slate-300 mt-1">
                    ในแท็บ "Single Line Diagram" ระบบสร้างแบบวงจรไฟฟ้ามาตรฐานวิศวกรรมให้โดยอัตโนมัติ มีสเปกฟิวส์, DC Isolator, SPD Type II, Inverter, Smart Meter กันย้อน และ MDB
                  </p>
                </div>
              </div>

              <div className="flex gap-3 p-3 bg-slate-950/80 border border-slate-800 rounded-xl">
                <span className="w-6 h-6 rounded-full bg-amber-500 text-slate-950 font-bold flex items-center justify-center shrink-0">5</span>
                <div>
                  <span className="font-bold text-amber-400 text-sm block">บันทึกภาพ 3D และพิมพ์เล่ม Proposal เสนองาน</span>
                  <p className="text-slate-300 mt-1">
                    ในหน้า 3D กดปุ่ม "บันทึกภาพ 3D (Proposal)" เพื่อนำภาพเรนเดอร์หน้างานไปใส่หน้าปก แล้วคลิกแท็บ "เล่ม Proposal เสนองาน" จากนั้นกด "พิมพ์ Proposal (PDF)" เพื่อเซฟเป็นไฟล์ PDF นำเสนอลูกค้าได้ทันที
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
              <span className="text-[11px] text-slate-400">SolarPro Studio 3D • มาตรฐาน PVsyst & วสท.</span>
              <button
                onClick={() => setShowGuideModal(false)}
                className="px-5 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl text-xs shadow-lg transition-colors"
              >
                เข้าใจแล้ว เริ่มใช้งานเลย
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

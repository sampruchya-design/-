import React from 'react';
import { ProjectData } from '../types/solar';
import { Sun, Box, Zap, FileText, Settings, Printer, Download, Sparkles } from 'lucide-react';

export type ActiveTab = 'design' | 'pvsyst' | 'sld' | 'proposal' | 'wizard';

interface HeaderNavProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  project: ProjectData;
  onPrintProposal: () => void;
}

export const HeaderNav: React.FC<HeaderNavProps> = ({
  activeTab,
  onSelectTab,
  project,
  onPrintProposal
}) => {
  const totalModules = project.layout.modulesPerRow * project.layout.rows;
  const totalKwp = ((totalModules * project.selectedPanel.wattage) / 1000).toFixed(2);

  const navItems = [
    { id: 'design' as ActiveTab, label: 'โมเดล 2D / 3D CAD', icon: Box, badge: 'หน้างานจริง' },
    { id: 'pvsyst' as ActiveTab, label: '3D Shading & PVsyst', icon: Sun, badge: 'จำลองเงา' },
    { id: 'sld' as ActiveTab, label: 'Single Line Diagram', icon: Zap, badge: 'กฟน./กฟภ.' },
    { id: 'proposal' as ActiveTab, label: 'เล่ม Proposal เสนองาน', icon: FileText, badge: 'เสนอลูกค้า' },
    { id: 'wizard' as ActiveTab, label: 'ข้อมูล 4 ขั้นตอน', icon: Settings, badge: 'ตั้งค่า' }
  ];

  return (
    <header className="no-print bg-slate-900/90 backdrop-blur-md border-b border-slate-800 sticky top-0 z-50 px-4 lg:px-8 py-3">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
        {/* Brand & Capacity Telemetry */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-300 flex items-center justify-center text-slate-950 font-black shadow-lg shadow-amber-500/20">
            <Sun className="w-6 h-6 fill-slate-950" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-white font-extrabold text-base tracking-wide flex items-center gap-1.5">
                SolarPro Studio
                <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/40 px-1.5 py-0.2 rounded font-mono">
                  3D & CAD
                </span>
              </h1>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
              <span className="text-amber-400 font-mono font-bold">{totalKwp} kWp</span>
              <span>•</span>
              <span className="text-slate-300 truncate max-w-[180px] md:max-w-xs">{project.clientName}</span>
              <span>•</span>
              <span className="text-emerald-400 font-mono text-[11px]">{project.phase}</span>
            </div>
          </div>
        </div>

        {/* Center Navigation Tabs */}
        <nav className="flex items-center bg-slate-950/80 p-1 rounded-xl border border-slate-800 overflow-x-auto max-w-full">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-amber-500 text-slate-950 font-bold shadow-md'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-slate-950' : 'text-amber-400'}`} />
                <span>{item.label}</span>
                {item.badge && !isActive && (
                  <span className="text-[10px] text-slate-400 bg-slate-800 px-1.5 py-0.2 rounded">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Right CTA */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => onSelectTab('wizard')}
            className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
            title="เริ่มออกแบบตาม 4 ขั้นตอน"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>เริ่มต้นออกแบบ 4 ขั้นตอน</span>
          </button>

          <button
            onClick={onPrintProposal}
            className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-amber-500/10 transition-all active:scale-95"
            title="พิมพ์หรือบันทึกเป็น PDF"
          >
            <Printer className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">พิมพ์ Proposal (PDF)</span>
            <span className="sm:hidden">Proposal</span>
          </button>
        </div>
      </div>
    </header>
  );
};

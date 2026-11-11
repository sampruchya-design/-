import React, { useState, useEffect } from 'react';
import { ProjectData, BoqItem } from '../../types/solar';
import { generateDefaultBoq, calculateBoqSummary, exportBoqToCsv, BOQ_CATEGORIES } from '../../utils/boqGenerator';
import { formatCurrency } from '../../utils/solarCalculations';
import { 
  FileSpreadsheet, 
  Download, 
  Printer, 
  Plus, 
  RotateCcw, 
  Save, 
  CheckCircle2, 
  Sparkles, 
  Trash2, 
  Layers, 
  DollarSign, 
  Zap, 
  Hammer, 
  Calculator,
  ShieldCheck,
  ChevronDown
} from 'lucide-react';

interface SolarBoqViewProps {
  project: ProjectData;
  onUpdateProject: (updatedProject: ProjectData) => void;
  onNavigateToProposal?: () => void;
}

export const SolarBoqView: React.FC<SolarBoqViewProps> = ({
  project,
  onUpdateProject,
  onNavigateToProposal
}) => {
  // Use project's existing BOQ or generate defaults
  const [items, setItems] = useState<BoqItem[]>(() => {
    return project.boqItems && project.boqItems.length > 0
      ? project.boqItems
      : generateDefaultBoq(project);
  });

  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [notification, setNotification] = useState<string | null>(null);

  // New item modal form state
  const [newItemCategory, setNewItemCategory] = useState<BoqItem['category']>('1. งานแผงเซลล์แสงอาทิตย์และอุปกรณ์หลัก');
  const [newItemDesc, setNewItemDesc] = useState<string>('');
  const [newItemBrand, setNewItemBrand] = useState<string>('');
  const [newItemQty, setNewItemQty] = useState<number>(1);
  const [newItemUnit, setNewItemUnit] = useState<string>('ชุด');
  const [newItemMaterialPrice, setNewItemMaterialPrice] = useState<number>(0);
  const [newItemLaborPrice, setNewItemLaborPrice] = useState<number>(0);
  const [newItemNotes, setNewItemNotes] = useState<string>('');

  const totalModules = project.layout.modulesPerRow * project.layout.rows;
  const totalKwp = Number(((totalModules * project.selectedPanel.wattage) / 1000).toFixed(2));
  const summary = calculateBoqSummary(items, totalKwp);

  // Sync to parent when items change
  const handleSaveToProject = (newItems: BoqItem[]) => {
    setItems(newItems);
    const newSummary = calculateBoqSummary(newItems, totalKwp);
    onUpdateProject({
      ...project,
      boqItems: newItems,
      financial: {
        ...project.financial,
        systemCostThb: newSummary.grandTotal
      }
    });
  };

  const showToast = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3500);
  };

  // Reset to auto-takeoff
  const handleResetToDefault = () => {
    if (confirm('คุณต้องการรีเซ็ตตาราง BOQ กลับเป็นค่ามาตรฐานที่คำนวณจากขนาดโครงการปัจจุบันหรือไม่?')) {
      const defaultItems = generateDefaultBoq(project);
      handleSaveToProject(defaultItems);
      showToast('รีเซ็ตตาราง BOQ ตามสเปกโครงการเรียบร้อยแล้ว');
    }
  };

  // Item field editing
  const handleUpdateItem = (
    id: string,
    field: 'quantity' | 'materialUnitPrice' | 'laborUnitPrice' | 'description' | 'brandModel',
    val: number | string
  ) => {
    const updated = items.map((it) => {
      if (it.id !== id) return it;
      const copy = { ...it, [field]: val };
      copy.materialTotal = Math.round(copy.quantity * copy.materialUnitPrice);
      copy.laborTotal = Math.round(copy.quantity * copy.laborUnitPrice);
      copy.totalPrice = copy.materialTotal + copy.laborTotal;
      return copy;
    });
    handleSaveToProject(updated);
  };

  // Delete item
  const handleDeleteItem = (id: string) => {
    const updated = items.filter((it) => it.id !== id);
    handleSaveToProject(updated);
    showToast('ลบรายการเรียบร้อยแล้ว');
  };

  // Add custom item
  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemDesc) return;

    const materialTotal = Math.round(newItemQty * newItemMaterialPrice);
    const laborTotal = Math.round(newItemQty * newItemLaborPrice);
    const totalPrice = materialTotal + laborTotal;

    const newItem: BoqItem = {
      id: `custom-${Date.now()}`,
      category: newItemCategory,
      itemCode: `C.${items.length + 1}`,
      description: newItemDesc,
      brandModel: newItemBrand || '-',
      quantity: newItemQty,
      unit: newItemUnit || 'ชุด',
      materialUnitPrice: newItemMaterialPrice,
      laborUnitPrice: newItemLaborPrice,
      materialTotal,
      laborTotal,
      totalPrice,
      notes: newItemNotes,
      isCustom: true
    };

    const updated = [...items, newItem];
    handleSaveToProject(updated);
    setShowAddModal(false);
    setNewItemDesc('');
    setNewItemBrand('');
    setNewItemQty(1);
    setNewItemMaterialPrice(0);
    setNewItemLaborPrice(0);
    setNewItemNotes('');
    showToast('เพิ่มรายการวัสดุใหม่เรียบร้อยแล้ว');
  };

  // Sync to proposal price
  const handleSyncToProposal = () => {
    onUpdateProject({
      ...project,
      boqItems: items,
      financial: {
        ...project.financial,
        systemCostThb: summary.grandTotal
      }
    });
    showToast(`อัปเดตราคากลางเล่ม Proposal เป็น ${formatCurrency(summary.grandTotal)} แล้ว`);
    if (onNavigateToProposal) {
      setTimeout(() => onNavigateToProposal(), 600);
    }
  };

  const filteredItems = selectedCategoryFilter === 'all'
    ? items
    : items.filter((i) => i.category === selectedCategoryFilter);

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {notification && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-500 text-slate-950 font-bold px-4 py-2.5 rounded-xl shadow-2xl flex items-center gap-2 text-xs animate-bounce">
          <CheckCircle2 className="w-4 h-4" />
          <span>{notification}</span>
        </div>
      )}

      {/* Top Header Card */}
      <div className="no-print bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 shadow">
            <FileSpreadsheet className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-white font-extrabold text-lg">
                บัญชีแสดงปริมาณวัสดุและราคา (BOQ - Bill of Quantities)
              </h2>
              <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2 py-0.5 rounded-full font-mono">
                วสท. & MEA/PEA
              </span>
            </div>
            <p className="text-slate-400 text-xs mt-0.5">
              ถอดแบบปริมาณอุปกรณ์จริงอัตโนมัติตามขนาดติดตั้ง {totalKwp} kWp ({totalModules} แผง) สามารถแก้ไขราคาต่อหน่วย และส่งออกไฟล์ Excel/PDF ได้ทันที
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => exportBoqToCsv(items, project)}
            className="bg-emerald-600 hover:bg-emerald-500 text-white px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow transition-all active:scale-95"
            title="ดาวน์โหลดเป็นไฟล์ Excel (CSV) พร้อมเปิดใน Microsoft Excel ได้ทันที"
          >
            <Download className="w-4 h-4" />
            <span>ดาวน์โหลด Excel (CSV)</span>
          </button>

          <button
            onClick={() => window.print()}
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all"
            title="พิมพ์หน้ารายการ BOQ หรือบันทึกเป็น PDF"
          >
            <Printer className="w-4 h-4 text-amber-400" />
            <span>พิมพ์ BOQ (PDF)</span>
          </button>

          <button
            onClick={() => setShowAddModal(true)}
            className="bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/30 px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>เพิ่มรายการวัสดุ</span>
          </button>

          <button
            onClick={handleResetToDefault}
            className="bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white border border-slate-700 p-2 rounded-xl text-xs transition-all"
            title="คืนค่ามาตรฐานที่คำนวณจากระบบ"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <button
            onClick={handleSyncToProposal}
            className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-amber-500/10 transition-all active:scale-95"
            title="บันทึกราคานี้ไปยังเล่ม Proposal เสนองาน"
          >
            <Save className="w-4 h-4" />
            <span>บันทึกลง Proposal</span>
          </button>
        </div>
      </div>

      {/* KPI Financial Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl shadow">
          <div className="text-[11px] text-slate-400 font-medium">ขนาดกำลังผลิตติดตั้ง</div>
          <div className="text-lg font-extrabold text-amber-400 font-mono mt-1">
            {totalKwp} <span className="text-xs font-sans text-slate-300">kWp</span>
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">{totalModules} แผง ({project.phase})</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl shadow">
          <div className="text-[11px] text-slate-400 font-medium">รวมค่าวัสดุและอุปกรณ์</div>
          <div className="text-lg font-extrabold text-white font-mono mt-1">
            {formatCurrency(summary.totalMaterial)}
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">
            {summary.subtotal > 0 ? ((summary.totalMaterial / summary.subtotal) * 100).toFixed(0) : 0}% ของต้นทุน
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl shadow">
          <div className="text-[11px] text-slate-400 font-medium">รวมค่าแรงและวิศวกรรม</div>
          <div className="text-lg font-extrabold text-emerald-400 font-mono mt-1">
            {formatCurrency(summary.totalLabor)}
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">
            {summary.subtotal > 0 ? ((summary.totalLabor / summary.subtotal) * 100).toFixed(0) : 0}% ของต้นทุน
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl shadow">
          <div className="text-[11px] text-slate-400 font-medium">ยอดรวมก่อนภาษี (Subtotal)</div>
          <div className="text-lg font-extrabold text-slate-200 font-mono mt-1">
            {formatCurrency(summary.subtotal)}
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">รวมค่าของ + ค่าแรง</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl shadow">
          <div className="text-[11px] text-slate-400 font-medium">ภาษีมูลค่าเพิ่ม VAT 7%</div>
          <div className="text-lg font-extrabold text-slate-300 font-mono mt-1">
            {formatCurrency(summary.vat7Percent)}
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">ตามระเบียบกรมสรรพากร</div>
        </div>

        <div className="bg-gradient-to-br from-amber-500/15 via-slate-900 to-amber-950/30 border border-amber-500/40 p-3.5 rounded-xl shadow">
          <div className="text-[11px] text-amber-300 font-bold">รวมราคาสุทธิตลอดโครงการ</div>
          <div className="text-lg font-black text-amber-400 font-mono mt-1">
            {formatCurrency(summary.grandTotal)}
          </div>
          <div className="text-[10px] text-amber-300/80 font-mono mt-0.5">
            เฉลี่ย {summary.costPerWp} บ./Wp
          </div>
        </div>
      </div>

      {/* Category Cost Breakdown Progress */}
      <div className="no-print bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow space-y-3">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-slate-300 flex items-center gap-1.5">
            <Layers className="w-4 h-4 text-amber-400" />
            สัดส่วนมูลค่าโครงการตามหมวดงาน (Cost Breakdown):
          </span>
          <span className="text-slate-400 font-mono">
            ยอดรวมสุทธิ {formatCurrency(summary.grandTotal)}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5">
          {summary.categoryBreakdown.map((cat, idx) => (
            <div key={idx} className="bg-slate-950/60 border border-slate-800/80 p-2.5 rounded-xl text-xs space-y-1.5">
              <div className="flex justify-between items-start gap-2">
                <span className="font-semibold text-slate-300 truncate text-[11px]" title={cat.category}>
                  {cat.category}
                </span>
                <span className="text-amber-400 font-mono font-bold shrink-0">{cat.percentage}%</span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-amber-500 to-emerald-400 h-1.5 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, Math.max(3, cat.percentage))}%` }}
                />
              </div>
              <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                <span>ค่าของ: {formatCurrency(cat.materialTotal)}</span>
                <span>ค่าแรง: {formatCurrency(cat.laborTotal)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Category Filter Pills */}
      <div className="no-print flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        <button
          onClick={() => setSelectedCategoryFilter('all')}
          className={`px-3 py-1.5 rounded-xl font-medium whitespace-nowrap transition-all ${
            selectedCategoryFilter === 'all'
              ? 'bg-amber-500 text-slate-950 font-bold shadow'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          ทั้งหมดทุกหมวด ({items.length} รายการ)
        </button>
        {BOQ_CATEGORIES.map((cat, idx) => {
          const count = items.filter((i) => i.category === cat).length;
          return (
            <button
              key={idx}
              onClick={() => setSelectedCategoryFilter(cat)}
              className={`px-3 py-1.5 rounded-xl font-medium whitespace-nowrap transition-all ${
                selectedCategoryFilter === cat
                  ? 'bg-amber-500 text-slate-950 font-bold shadow'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              หมวด {idx + 1} ({count})
            </button>
          );
        })}
      </div>

      {/* Main BOQ Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
        {/* Printable Official Header */}
        <div className="p-5 border-b border-slate-800 bg-slate-950/60 flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded bg-amber-400" />
              <h3 className="text-white font-bold text-sm">
                ตารางบัญชีแสดงปริมาณวัสดุและราคา — {project.projectName}
              </h3>
            </div>
            <div className="text-xs text-slate-400 mt-1 flex flex-wrap gap-x-4 gap-y-1">
              <span>เจ้าของโครงการ: <strong className="text-slate-200">{project.clientName}</strong></span>
              <span>สถานที่: <strong className="text-slate-200">{project.clientAddress}</strong></span>
              <span>ระบบ: <strong className="text-amber-400">{totalKwp} kWp ({project.phase})</strong></span>
              <span>วันที่: <strong className="text-slate-200">{project.proposalDate}</strong></span>
            </div>
          </div>
          <div className="text-right text-xs text-slate-400 font-mono">
            <div>มาตรฐาน วสท. 022013-63</div>
            <div className="text-emerald-400 font-semibold">กว. {project.engineerLicense}</div>
          </div>
        </div>

        {/* Scrollable Table View */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-300 border-b border-slate-800 uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-3 w-12 text-center">ลำดับ</th>
                <th className="py-3 px-3 min-w-[240px]">รายการวัสดุและอุปกรณ์ (Description)</th>
                <th className="py-3 px-3 min-w-[150px]">ยี่ห้อ / สเปก</th>
                <th className="py-3 px-2 w-20 text-center">จำนวน</th>
                <th className="py-3 px-2 w-16 text-center">หน่วย</th>
                <th className="py-3 px-2 w-28 text-right">วัสดุ/หน่วย (บ.)</th>
                <th className="py-3 px-2 w-28 text-right">รวมค่าวัสดุ (บ.)</th>
                <th className="py-3 px-2 w-24 text-right">ค่าแรง/หน่วย</th>
                <th className="py-3 px-2 w-28 text-right">รวมค่าแรง (บ.)</th>
                <th className="py-3 px-3 w-32 text-right">รวมเป็นเงิน (บ.)</th>
                <th className="py-3 px-2 w-10 text-center no-print"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/70">
              {BOQ_CATEGORIES.map((category) => {
                const categoryItems = filteredItems.filter((i) => i.category === category);
                if (categoryItems.length === 0) return null;

                const catMatTotal = categoryItems.reduce((acc, i) => acc + i.materialTotal, 0);
                const catLabTotal = categoryItems.reduce((acc, i) => acc + i.laborTotal, 0);
                const catGrandTotal = catMatTotal + catLabTotal;

                return (
                  <React.Fragment key={category}>
                    {/* Category Header Row */}
                    <tr className="bg-slate-850/90 font-bold text-amber-300 border-t border-slate-700/80">
                      <td colSpan={6} className="py-2.5 px-3">
                        <span className="flex items-center gap-2">
                          <span className="w-1.5 h-3.5 bg-amber-400 rounded-sm" />
                          <span>{category}</span>
                        </span>
                      </td>
                      <td className="py-2.5 px-2 text-right font-mono text-white text-[11px]">
                        {formatCurrency(catMatTotal)}
                      </td>
                      <td className="py-2.5 px-2"></td>
                      <td className="py-2.5 px-2 text-right font-mono text-emerald-400 text-[11px]">
                        {formatCurrency(catLabTotal)}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono text-amber-400 text-xs font-black">
                        {formatCurrency(catGrandTotal)}
                      </td>
                      <td className="no-print"></td>
                    </tr>

                    {/* Category Items Rows */}
                    {categoryItems.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-800/40 transition-colors group">
                        <td className="py-2.5 px-3 text-center font-mono text-slate-400 text-[11px]">
                          {item.itemCode}
                        </td>
                        <td className="py-2.5 px-3">
                          <div className="font-semibold text-white leading-snug">
                            {item.description}
                          </div>
                          {item.notes && (
                            <div className="text-[10px] text-slate-400 mt-0.5 font-light">
                              {item.notes}
                            </div>
                          )}
                        </td>
                        <td className="py-2.5 px-3 text-slate-300">
                          <span className="text-[11px] font-mono">{item.brandModel}</span>
                        </td>
                        <td className="py-2.5 px-2 text-center">
                          <input
                            type="number"
                            min="0"
                            value={item.quantity}
                            onChange={(e) => handleUpdateItem(item.id, 'quantity', Math.max(0, Number(e.target.value)))}
                            className="no-print w-16 bg-slate-950 border border-slate-700 rounded px-1.5 py-1 text-center font-mono text-white text-xs focus:border-amber-400 outline-none"
                          />
                          <span className="print-only font-mono">{item.quantity}</span>
                        </td>
                        <td className="py-2.5 px-2 text-center text-slate-400 text-[11px]">
                          {item.unit}
                        </td>
                        <td className="py-2.5 px-2 text-right">
                          <input
                            type="number"
                            min="0"
                            step="10"
                            value={item.materialUnitPrice}
                            onChange={(e) => handleUpdateItem(item.id, 'materialUnitPrice', Math.max(0, Number(e.target.value)))}
                            className="no-print w-24 bg-slate-950 border border-slate-700 rounded px-1.5 py-1 text-right font-mono text-slate-200 text-xs focus:border-amber-400 outline-none"
                          />
                          <span className="print-only font-mono">{formatCurrency(item.materialUnitPrice)}</span>
                        </td>
                        <td className="py-2.5 px-2 text-right font-mono text-slate-200">
                          {formatCurrency(item.materialTotal)}
                        </td>
                        <td className="py-2.5 px-2 text-right">
                          <input
                            type="number"
                            min="0"
                            step="10"
                            value={item.laborUnitPrice}
                            onChange={(e) => handleUpdateItem(item.id, 'laborUnitPrice', Math.max(0, Number(e.target.value)))}
                            className="no-print w-20 bg-slate-950 border border-slate-700 rounded px-1.5 py-1 text-right font-mono text-emerald-300 text-xs focus:border-emerald-400 outline-none"
                          />
                          <span className="print-only font-mono">{formatCurrency(item.laborUnitPrice)}</span>
                        </td>
                        <td className="py-2.5 px-2 text-right font-mono text-emerald-400">
                          {formatCurrency(item.laborTotal)}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono font-bold text-amber-300">
                          {formatCurrency(item.totalPrice)}
                        </td>
                        <td className="py-2.5 px-2 text-center no-print">
                          {item.isCustom && (
                            <button
                              onClick={() => handleDeleteItem(item.id)}
                              className="text-slate-500 hover:text-red-400 transition-colors p-1"
                              title="ลบรายการ"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </React.Fragment>
                );
              })}
            </tbody>

            {/* Table Footer Totals */}
            <tfoot className="bg-slate-950 border-t-2 border-slate-700 font-bold text-xs divide-y divide-slate-800">
              <tr>
                <td colSpan={6} className="py-3 px-3 text-right text-slate-300">
                  รวมค่าวัสดุและอุปกรณ์ทั้งหมด (Total Material Cost):
                </td>
                <td className="py-3 px-2 text-right font-mono text-white text-sm">
                  {formatCurrency(summary.totalMaterial)}
                </td>
                <td colSpan={3} className="py-3 px-3 text-slate-400 text-right">บาท</td>
                <td className="no-print"></td>
              </tr>
              <tr>
                <td colSpan={8} className="py-3 px-3 text-right text-slate-300">
                  รวมค่าแรงงานและบริการวิศวกรรมทั้งหมด (Total Labor Cost):
                </td>
                <td className="py-3 px-2 text-right font-mono text-emerald-400 text-sm">
                  {formatCurrency(summary.totalLabor)}
                </td>
                <td className="py-3 px-3 text-slate-400 text-right">บาท</td>
                <td className="no-print"></td>
              </tr>
              <tr className="bg-slate-900/80">
                <td colSpan={8} className="py-3 px-3 text-right text-white">
                  รวมเงินค่าวัสดุและค่าแรงก่อนภาษี (Subtotal):
                </td>
                <td colSpan={2} className="py-3 px-3 text-right font-mono text-white text-base">
                  {formatCurrency(summary.subtotal)} บาท
                </td>
                <td className="no-print"></td>
              </tr>
              <tr>
                <td colSpan={8} className="py-3 px-3 text-right text-slate-400">
                  ภาษีมูลค่าเพิ่ม (VAT 7%):
                </td>
                <td colSpan={2} className="py-3 px-3 text-right font-mono text-slate-300">
                  {formatCurrency(summary.vat7Percent)} บาท
                </td>
                <td className="no-print"></td>
              </tr>
              <tr className="bg-gradient-to-r from-amber-500/10 via-slate-900 to-amber-500/20 text-amber-400">
                <td colSpan={6} className="py-4 px-3 text-right text-sm">
                  <div className="font-extrabold text-white">รวมราคาสุทธิตลอดโครงการ (Grand Total):</div>
                  <div className="text-[11px] font-normal text-slate-400">
                    อัตราต้นทุนเฉลี่ย: <strong className="text-amber-400">{summary.costPerWp} บาท/วัตต์พีค</strong>
                  </div>
                </td>
                <td colSpan={4} className="py-4 px-3 text-right font-mono font-black text-xl text-amber-400">
                  {formatCurrency(summary.grandTotal)} <span className="text-xs font-sans text-slate-300">บาท</span>
                </td>
                <td className="no-print"></td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Engineering Certification & Approval Signatures */}
        <div className="p-6 bg-slate-950/80 border-t border-slate-800 grid grid-cols-1 md:grid-cols-2 gap-8 text-xs text-slate-300">
          <div className="border border-slate-800 p-4 rounded-xl space-y-4">
            <div className="flex items-center gap-2 text-amber-400 font-bold">
              <ShieldCheck className="w-4 h-4" />
              <span>ผู้จัดทำและวิศวกรผู้รับรองแบบ (Engineer Certification)</span>
            </div>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              ขอรับรองว่าปริมาณวัสดุ อุปกรณ์ รายการคำนวณโครงสร้าง และระบบไฟฟ้ากระแสตรง/สลับ เป็นไปตามมาตรฐานสมาคมวิศวกรรมสถานแห่งประเทศไทย (วสท. 022013-63) และระเบียบการเชื่อมต่อโครงข่ายไฟฟ้า กฟน./กฟภ.
            </p>
            <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
              <div>
                <div className="font-bold text-white">{project.engineerName}</div>
                <div className="text-[11px] text-slate-400">ใบอนุญาต กว. เลขที่ {project.engineerLicense}</div>
              </div>
              <div className="text-right text-[11px] text-slate-400">
                {project.companyName}
              </div>
            </div>
          </div>

          <div className="border border-slate-800 p-4 rounded-xl space-y-4">
            <div className="flex items-center gap-2 text-emerald-400 font-bold">
              <CheckCircle2 className="w-4 h-4" />
              <span>เจ้าของโครงการ / ผู้มีอำนาจลงนาม (Customer Acceptance)</span>
            </div>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              ตกลงอนุมัติรายการวัสดุและปริมาณงานตามตารางบัญชีแสดงปริมาณวัสดุและราคา (BOQ) ฉบับนี้ เพื่อใช้ในการจัดซื้อและดำเนินการติดตั้งระบบพลังงานแสงอาทิตย์บนหลังคาต่อไป
            </p>
            <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
              <div>
                <div className="font-bold text-white">{project.clientName}</div>
                <div className="text-[11px] text-slate-400">ผู้สั่งจ้าง / ผู้มีอำนาจลงนาม</div>
              </div>
              <div className="text-right text-[11px] text-slate-400">
                วันที่: ___________________
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add Item Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 text-slate-100">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-base text-white flex items-center gap-2">
                <Plus className="w-4 h-4 text-amber-400" />
                <span>เพิ่มรายการวัสดุ / อุปกรณ์ใหม่ (Add BOQ Item)</span>
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddItem} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">หมวดงาน:</label>
                <select
                  value={newItemCategory}
                  onChange={(e) => setNewItemCategory(e.target.value as BoqItem['category'])}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white outline-none focus:border-amber-400"
                >
                  {BOQ_CATEGORIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">ชื่อรายการวัสดุและรายละเอียด:</label>
                <input
                  type="text"
                  required
                  placeholder="เช่น สายไฟ THW-G 1x16 sq.mm หรือ กล้องวงจรปิด Solar CCTV"
                  value={newItemDesc}
                  onChange={(e) => setNewItemDesc(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white outline-none focus:border-amber-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">ยี่ห้อ / รุ่น:</label>
                  <input
                    type="text"
                    placeholder="เช่น Yazaki / BCC / Hikvision"
                    value={newItemBrand}
                    onChange={(e) => setNewItemBrand(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white outline-none focus:border-amber-400"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-slate-400 mb-1">จำนวน:</label>
                    <input
                      type="number"
                      min="1"
                      required
                      value={newItemQty}
                      onChange={(e) => setNewItemQty(Number(e.target.value))}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white outline-none focus:border-amber-400 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1">หน่วย:</label>
                    <input
                      type="text"
                      placeholder="ชุด/เมตร"
                      value={newItemUnit}
                      onChange={(e) => setNewItemUnit(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white outline-none focus:border-amber-400"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">ราคาวัสดุ / หน่วย (บาท):</label>
                  <input
                    type="number"
                    min="0"
                    value={newItemMaterialPrice}
                    onChange={(e) => setNewItemMaterialPrice(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white outline-none focus:border-amber-400 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">ค่าแรง / หน่วย (บาท):</label>
                  <input
                    type="number"
                    min="0"
                    value={newItemLaborPrice}
                    onChange={(e) => setNewItemLaborPrice(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white outline-none focus:border-amber-400 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">หมายเหตุ / ข้อมูลจำเพาะ:</label>
                <input
                  type="text"
                  placeholder="เช่น มอก. 11-2553 หรือ มาตรฐานติดตั้งเฉพาะจุด"
                  value={newItemNotes}
                  onChange={(e) => setNewItemNotes(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white outline-none focus:border-amber-400"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold shadow"
                >
                  เพิ่มรายการลงใน BOQ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

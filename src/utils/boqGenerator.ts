import { ProjectData, BoqItem } from '../types/solar';

export const BOQ_CATEGORIES = [
  '1. งานแผงเซลล์แสงอาทิตย์และอุปกรณ์หลัก',
  '2. งานโครงสร้างจับยึดแผงโซลาร์เซลล์ (Mounting)',
  '3. งานระบบไฟฟ้ากระแสตรง (DC Electrical & Protection)',
  '4. งานระบบไฟฟ้ากระแสสลับ (AC Electrical & Grid Connection)',
  '5. งานระบบต่อลงดินและความปลอดภัย (Grounding & Safety)',
  '6. งานบริการวิศวกรรม ติดตั้ง และขออนุญาตขนานไฟ'
] as const;

/**
 * Generate standard Thai engineering BOQ based on project capacity and building specs
 */
export function generateDefaultBoq(project: ProjectData): BoqItem[] {
  const totalModules = project.layout.modulesPerRow * project.layout.rows;
  const totalKwp = (totalModules * project.selectedPanel.wattage) / 1000;
  const stringsCount = Math.max(1, project.layout.stringsCount || 1);
  const rows = Math.max(1, project.layout.rows);
  const modulesPerRow = Math.max(1, project.layout.modulesPerRow);

  // Roof specific mounting hardware
  let roofHookDesc = 'CPAC Tile Hook SUS304 สำหรับกระเบื้องซีแพค';
  let roofHookUnitPrice = 180;
  if (project.building.roofType.includes('Kliplok')) {
    roofHookDesc = 'Kliplok Clamp 700/406 อลูมิเนียมอโนไดซ์ ไม่เจาะหลังคา';
    roofHookUnitPrice = 195;
  } else if (project.building.roofType.includes('Trapezoidal')) {
    roofHookDesc = 'L-Feet Aluminium ชุดจับยึดพร้อมยางกันซึม EPDM';
    roofHookUnitPrice = 120;
  } else if (project.building.roofType.includes('Concrete Slab')) {
    roofHookDesc = 'ชุดขาวางปรับองศา Aluminium Tilt Leg 10°-15° พร้อม Ballast';
    roofHookUnitPrice = 450;
  } else if (project.building.roofType.includes('Carport')) {
    roofHookDesc = 'ชุดแคลมป์ยึดโครงสร้างที่จอดรถ Solar Carport';
    roofHookUnitPrice = 250;
  }

  // Cable lengths based on building dimensions
  const dcCableLengthM = Math.round((project.building.heightM + project.building.lengthM + 12) * 2 * stringsCount);
  const acCableLengthM = Math.round(project.building.heightM + 15);
  const conduitLengthM = Math.round(project.building.heightM + project.building.lengthM + 8);

  // Clamps calculation
  const endClampsQty = rows * 4;
  const midClampsQty = Math.max(0, (modulesPerRow - 1) * rows * 2);
  const roofHooksQty = Math.ceil(totalModules * 2.2);
  const railsCount = Math.ceil((modulesPerRow * (project.selectedPanel.width / 1000) * 2 * rows) / 4.2);

  // Panel market pricing ~10-12 THB/W for Tier 1 TOPCon
  const panelMaterialUnitPrice = Math.round(project.selectedPanel.wattage * 7.5);
  const panelLaborUnitPrice = 350;

  // Inverter market pricing
  const inverterMaterialPrice = Math.round(project.selectedInverter.ratedPowerKw * 5800 + (project.selectedInverter.phase.includes('3-Phase') ? 12000 : 6000));
  const inverterLaborPrice = 3000;

  const rawItems: Omit<BoqItem, 'materialTotal' | 'laborTotal' | 'totalPrice'>[] = [
    // -------------------------------------------------------------
    // หมวด 1: แผงและอุปกรณ์หลัก
    // -------------------------------------------------------------
    {
      id: 'boq-1-1',
      category: '1. งานแผงเซลล์แสงอาทิตย์และอุปกรณ์หลัก',
      itemCode: '1.1',
      description: `แผงโซลาร์เซลล์ Tier 1 Monocrystalline N-Type TOPCon ขนาด ${project.selectedPanel.wattage}W`,
      brandModel: `${project.selectedPanel.brand} ${project.selectedPanel.model}`,
      quantity: totalModules,
      unit: 'แผง',
      materialUnitPrice: panelMaterialUnitPrice,
      laborUnitPrice: panelLaborUnitPrice,
      notes: `รับประกันประสิทธิภาพ ${project.selectedPanel.warrantyYears} ปี (Linear Power Output)`
    },
    {
      id: 'boq-1-2',
      category: '1. งานแผงเซลล์แสงอาทิตย์และอุปกรณ์หลัก',
      itemCode: '1.2',
      description: `เครื่องแปลงกระแสไฟฟ้า Grid-Tied Inverter ขนาด ${project.selectedInverter.ratedPowerKw}kW (${project.selectedInverter.phase})`,
      brandModel: `${project.selectedInverter.brand} ${project.selectedInverter.model}`,
      quantity: 1,
      unit: 'เครื่อง',
      materialUnitPrice: inverterMaterialPrice,
      laborUnitPrice: inverterLaborPrice,
      notes: `MEA/PEA Approved List, รับประกันเครื่อง ${project.selectedInverter.warrantyYears} ปี`
    },
    {
      id: 'boq-1-3',
      category: '1. งานแผงเซลล์แสงอาทิตย์และอุปกรณ์หลัก',
      itemCode: '1.3',
      description: `อุปกรณ์ตรวจวัดพลังงานและระบบกันย้อน (Smart Power Sensor Zero Export) พร้อม CT`,
      brandModel: project.combinerBox?.zeroExportMeterModel || 'Smart Meter Zero Export',
      quantity: 1,
      unit: 'ชุด',
      materialUnitPrice: project.phase.includes('3-Phase') ? 6500 : 4200,
      laborUnitPrice: 800,
      notes: 'ควบคุมการจ่ายไฟไม่ให้ไหลย้อนกลับเสาไฟฟ้าตามกฎหมาย กฟน./กฟภ.'
    },
    {
      id: 'boq-1-4',
      category: '1. งานแผงเซลล์แสงอาทิตย์และอุปกรณ์หลัก',
      itemCode: '1.4',
      description: `อุปกรณ์เชื่อมต่อเครือข่ายและระบบมอนิเตอร์ออนไลน์ (Smart Dongle WLAN/4G)`,
      brandModel: 'WiFi/LAN Monitoring Module',
      quantity: 1,
      unit: 'ชุด',
      materialUnitPrice: 2500,
      laborUnitPrice: 500,
      notes: 'ดูการผลิตไฟฟ้าผ่าน Mobile App แบบ Real-time ตลอด 24 ชม.'
    },

    // -------------------------------------------------------------
    // หมวด 2: โครงสร้างจับยึด (Mounting)
    // -------------------------------------------------------------
    {
      id: 'boq-2-1',
      category: '2. งานโครงสร้างจับยึดแผงโซลาร์เซลล์ (Mounting)',
      itemCode: '2.1',
      description: `รางอลูมิเนียมมาตรฐาน (Aluminium Mounting Rail 6005-T5) ความยาว 4.2 ม.`,
      brandModel: 'Solar Mounting Rail AL6005-T5 Anodized',
      quantity: railsCount,
      unit: 'ท่อน',
      materialUnitPrice: 750,
      laborUnitPrice: 150,
      notes: 'ชุบผิว Anodized ทนการกัดกร่อน รับแรงลมมาตรฐานวิศวกรรม'
    },
    {
      id: 'boq-2-2',
      category: '2. งานโครงสร้างจับยึดแผงโซลาร์เซลล์ (Mounting)',
      itemCode: '2.2',
      description: `อุปกรณ์ยึดหลังคา (${roofHookDesc})`,
      brandModel: 'Roof Fixture Bracket SUS304 / AL6005',
      quantity: roofHooksQty,
      unit: 'ตัว',
      materialUnitPrice: roofHookUnitPrice,
      laborUnitPrice: 60,
      notes: 'อุปกรณ์จับยึดมาตรฐานสอดคล้องกับประเภทหลังคา ไม่ทำให้หลังคารั่ว'
    },
    {
      id: 'boq-2-3',
      category: '2. งานโครงสร้างจับยึดแผงโซลาร์เซลล์ (Mounting)',
      itemCode: '2.3',
      description: `ตัวล็อคกลางแผง (Aluminium Mid Clamp) สลักเกลียวสแตนเลส SUS304`,
      brandModel: 'Mid Clamp 30/35mm AL6005-T5',
      quantity: midClampsQty,
      unit: 'ตัว',
      materialUnitPrice: 45,
      laborUnitPrice: 20,
      notes: 'สำหรับแคลมป์ยึดระหว่างแผงโซลาร์'
    },
    {
      id: 'boq-2-4',
      category: '2. งานโครงสร้างจับยึดแผงโซลาร์เซลล์ (Mounting)',
      itemCode: '2.4',
      description: `ตัวล็อคปลายแผง (Aluminium End Clamp) สลักเกลียวสแตนเลส SUS304`,
      brandModel: 'End Clamp 30/35mm AL6005-T5',
      quantity: endClampsQty,
      unit: 'ตัว',
      materialUnitPrice: 45,
      laborUnitPrice: 20,
      notes: 'สำหรับแคลมป์ยึดริมแถว'
    },
    {
      id: 'boq-2-5',
      category: '2. งานโครงสร้างจับยึดแผงโซลาร์เซลล์ (Mounting)',
      itemCode: '2.5',
      description: `ชุดต่อประกบราง (Rail Splice Kit) และคลิปจัดสายไฟ (Solar Cable Clips)`,
      brandModel: 'AL Rail Joint + SUS Cable Clips',
      quantity: 1,
      unit: 'ชุด',
      materialUnitPrice: 1200,
      laborUnitPrice: 400,
      notes: 'อุปกรณ์ประกอบรางและจัดเก็บสายไฟใต้แผงให้เรียบร้อย'
    },

    // -------------------------------------------------------------
    // หมวด 3: ระบบไฟฟ้ากระแสตรง (DC)
    // -------------------------------------------------------------
    {
      id: 'boq-3-1',
      category: '3. งานระบบไฟฟ้ากระแสตรง (DC Electrical & Protection)',
      itemCode: '3.1',
      description: `ตู้ควบคุมไฟฟ้ากระแสตรงภายนอกอาคาร (DC Combiner Box IP65)`,
      brandModel: `DC Box IP65 (${stringsCount} String In / Out)`,
      quantity: 1,
      unit: 'ตู้',
      materialUnitPrice: 3800 + stringsCount * 1200,
      laborUnitPrice: 1500,
      notes: 'กล่องกันน้ำกันฝุ่น IP65 พร้อมราง DIN Rail'
    },
    {
      id: 'boq-3-2',
      category: '3. งานระบบไฟฟ้ากระแสตรง (DC Electrical & Protection)',
      itemCode: '3.2',
      description: `ฟิวส์ป้องกันไฟฟ้ากระแสตรง DC Fuse gPV 1000V/1500V (${project.combinerBox?.dcFuseRatingA || 15}A) พร้อมฐานฟิวส์`,
      brandModel: `gPV Solar Fuse ${project.combinerBox?.dcFuseRatingA || 15}A 1000Vdc`,
      quantity: stringsCount * 2,
      unit: 'ชุด',
      materialUnitPrice: 280,
      laborUnitPrice: 80,
      notes: 'ติดตั้งขั้วบวก (+) และขั้วลบ (-) ตัดวงจรเมื่อเกิดกระแสเกิน'
    },
    {
      id: 'boq-3-3',
      category: '3. งานระบบไฟฟ้ากระแสตรง (DC Electrical & Protection)',
      itemCode: '3.3',
      description: `สวิตช์ตัดวงจรไฟฟ้ากระแสตรง (DC Isolator Switch ${project.combinerBox?.dcIsolatorRatingA || 32}A 1000V)`,
      brandModel: `DC Isolator 4P ${project.combinerBox?.dcIsolatorRatingA || 32}A 1000Vdc`,
      quantity: Math.max(1, stringsCount),
      unit: 'ตัว',
      materialUnitPrice: 1250,
      laborUnitPrice: 300,
      notes: 'สวิตช์ปลดวงจร DC สำหรับงานซ่อมบำรุงตามมาตรฐานความปลอดภัย'
    },
    {
      id: 'boq-3-4',
      category: '3. งานระบบไฟฟ้ากระแสตรง (DC Electrical & Protection)',
      itemCode: '3.4',
      description: `อุปกรณ์ป้องกันฟ้าผ่าและแรงดันเกินชั่วขณะ DC SPD (${project.combinerBox?.dcSpdType || 'Type 2'} 1000Vdc)`,
      brandModel: `DC Surge Protective Device In: ${project.combinerBox?.dcSpdInKa || 20}kA Imax: ${project.combinerBox?.dcSpdImaxKa || 40}kA`,
      quantity: Math.max(1, stringsCount),
      unit: 'ตัว',
      materialUnitPrice: 1450,
      laborUnitPrice: 250,
      notes: 'ป้องกันไฟกระชากจากฟ้าผ่าและแรงดันเหนี่ยวนำในระบบ DC'
    },
    {
      id: 'boq-3-5',
      category: '3. งานระบบไฟฟ้ากระแสตรง (DC Electrical & Protection)',
      itemCode: '3.5',
      description: `สายไฟฟ้าสำหรับโซลาร์เซลล์โดยเฉพาะ (Solar Cable PV1-F/H1Z2Z2-K ${project.combinerBox?.dcCableSizeMm2 || '1x4.0 mm²'}) แกนเดี่ยวทองแดงเคลือบดีบุก ทน UV`,
      brandModel: 'TÜV Certified Solar Cable 1500Vdc',
      quantity: dcCableLengthM,
      unit: 'เมตร',
      materialUnitPrice: 42,
      laborUnitPrice: 18,
      notes: 'ทนความร้อน 120°C ทนรังสี UV และมีฉนวน 2 ชั้น'
    },
    {
      id: 'boq-3-6',
      category: '3. งานระบบไฟฟ้ากระแสตรง (DC Electrical & Protection)',
      itemCode: '3.6',
      description: `หัวต่อสายไฟพลังงานแสงอาทิตย์กันน้ำ (MC4 Solar Connector IP68)`,
      brandModel: 'MC4 IP68 1500Vdc 30A (Male/Female)',
      quantity: stringsCount * 4 + 4,
      unit: 'คู่',
      materialUnitPrice: 90,
      laborUnitPrice: 40,
      notes: 'ข้อต่อกันน้ำและล็อกแน่นหนา ป้องกันการเกิด Arc ไฟฟ้า'
    },
    {
      id: 'boq-3-7',
      category: '3. งานระบบไฟฟ้ากระแสตรง (DC Electrical & Protection)',
      itemCode: '3.7',
      description: `ท่อร้อยสายไฟฟ้าเหล็กชุบสังกะสี EMT/IMC และท่อ HDPE พร้อมอุปกรณ์ Fitting`,
      brandModel: 'Conduit EMT / Flexible Metallic & Fitting',
      quantity: conduitLengthM,
      unit: 'เมตร',
      materialUnitPrice: 110,
      laborUnitPrice: 65,
      notes: 'ร้อยท่อสายไฟแข็งแรงทนทาน ป้องกันสัตว์กัดแทะและทนแดด'
    },

    // -------------------------------------------------------------
    // หมวด 4: ระบบไฟฟ้ากระแสสลับ (AC)
    // -------------------------------------------------------------
    {
      id: 'boq-4-1',
      category: '4. งานระบบไฟฟ้ากระแสสลับ (AC Electrical & Grid Connection)',
      itemCode: '4.1',
      description: `ตู้จ่ายไฟย่อยพลังงานแสงอาทิตย์ (AC Solar Distribution Board / Sub-DB)`,
      brandModel: `AC Solar Panel Board IP40/IP54 with Din Rail`,
      quantity: 1,
      unit: 'ตู้',
      materialUnitPrice: 3200,
      laborUnitPrice: 1200,
      notes: 'ตู้ควบคุมจุดเชื่อมขนานไฟฟ้าเข้า Main Distribution Board (MDB)'
    },
    {
      id: 'boq-4-2',
      category: '4. งานระบบไฟฟ้ากระแสสลับ (AC Electrical & Grid Connection)',
      itemCode: '4.2',
      description: `เซอร์กิตเบรกเกอร์ AC (${project.combinerBox?.acBreakerType || 'MCB'} ${project.combinerBox?.acBreakerRatingA || 32}A ${project.combinerBox?.acBreakerPoles || '2P'} Icu ≥ 10kA)`,
      brandModel: `IEC/EN 60947-2 Circuit Breaker ${project.combinerBox?.acBreakerRatingA || 32}A`,
      quantity: 1,
      unit: 'ตัว',
      materialUnitPrice: project.phase.includes('3-Phase') ? 2200 : 950,
      laborUnitPrice: 300,
      notes: 'ตัดกระแสไฟฟ้าลัดวงจรและโอเวอร์โหลดฝั่ง AC'
    },
    {
      id: 'boq-4-3',
      category: '4. งานระบบไฟฟ้ากระแสสลับ (AC Electrical & Grid Connection)',
      itemCode: '4.3',
      description: `อุปกรณ์ตัดไฟรั่วลงดิน (RCBO/RCD 30mA หรือ Type B Residual Current Device)`,
      brandModel: `RCBO 30mA ${project.combinerBox?.acBreakerPoles || '2P'} 10kA`,
      quantity: 1,
      unit: 'ตัว',
      materialUnitPrice: project.phase.includes('3-Phase') ? 3500 : 1600,
      laborUnitPrice: 300,
      notes: 'มาตรฐานความปลอดภัยป้องกันไฟรั่วตามระเบียบ กฟน. / กฟภ.'
    },
    {
      id: 'boq-4-4',
      category: '4. งานระบบไฟฟ้ากระแสสลับ (AC Electrical & Grid Connection)',
      itemCode: '4.4',
      description: `อุปกรณ์ป้องกันไฟกระชากทางไฟฟ้า AC SPD (${project.combinerBox?.acSpdType || 'Type 2'} Uc 385V)`,
      brandModel: `AC Surge Protector In: ${project.combinerBox?.acSpdInKa || 20}kA Imax: ${project.combinerBox?.acSpdImaxKa || 40}kA`,
      quantity: 1,
      unit: 'ชุด',
      materialUnitPrice: project.phase.includes('3-Phase') ? 2600 : 1400,
      laborUnitPrice: 250,
      notes: 'ป้องกันแรงดันเกินจากฟ้าผ่าและสวิตชิ่งในระบบสายส่งของการไฟฟ้า'
    },
    {
      id: 'boq-4-5',
      category: '4. งานระบบไฟฟ้ากระแสสลับ (AC Electrical & Grid Connection)',
      itemCode: '4.5',
      description: `สายไฟฟ้ากำลัง AC (${project.combinerBox?.acCableSpec || 'Cu/XLPE 0.6/1kV'}) เดินจาก Inverter ถึง MDB`,
      brandModel: `IEC01 / 60227 IEC 10 (THW / NYY / CV)`,
      quantity: acCableLengthM,
      unit: 'เมตร',
      materialUnitPrice: project.phase.includes('3-Phase') ? 140 : 85,
      laborUnitPrice: 40,
      notes: 'สายทองแดงฉนวนทนความร้อนสูง ขนาดสอดคล้องตามมาตรฐาน วสท.'
    },

    // -------------------------------------------------------------
    // หมวด 5: ระบบต่อลงดินและความปลอดภัย (Grounding)
    // -------------------------------------------------------------
    {
      id: 'boq-5-1',
      category: '5. งานระบบต่อลงดินและความปลอดภัย (Grounding & Safety)',
      itemCode: '5.1',
      description: `แท่งหลักดินทองแดงชุบ Copper Bonded Ground Rod ขนาด 5/8 นิ้ว ยาว 2.40 ม.`,
      brandModel: 'Copper Bonded Ground Rod UL Listed 5/8" x 2.4m',
      quantity: totalKwp > 10 ? 2 : 1,
      unit: 'ต้น',
      materialUnitPrice: 680,
      laborUnitPrice: 750,
      notes: 'ตอกลงดินลึกไม่น้อยกว่า 2.4 ม. ค่าความต้านทานดิน R < 5 โอห์ม'
    },
    {
      id: 'boq-5-2',
      category: '5. งานระบบต่อลงดินและความปลอดภัย (Grounding & Safety)',
      itemCode: '5.2',
      description: `บ่อตรวจเช็คค่าความต้านทานดิน (Ground Inspection Pit) พร้อมฝาปิด`,
      brandModel: 'Heavy Duty Ground Earth Pit & Cover',
      quantity: 1,
      unit: 'บ่อ',
      materialUnitPrice: 450,
      laborUnitPrice: 400,
      notes: 'สำหรับวัดและตรวจสอบค่า Earth Resistance ประจำปี'
    },
    {
      id: 'boq-5-3',
      category: '5. งานระบบต่อลงดินและความปลอดภัย (Grounding & Safety)',
      itemCode: '5.3',
      description: `สายต่อลงดินทองแดงเปลือย (Bare Copper 16-25 mm²) และสาย THW-G`,
      brandModel: 'Annealed Bare Copper & Green/Yellow Cable',
      quantity: Math.round(project.building.heightM + 12),
      unit: 'เมตร',
      materialUnitPrice: 65,
      laborUnitPrice: 25,
      notes: 'เชื่อมต่อโครงแผง, รางอลูมิเนียม, ตู้ไฟ และ Inverter เข้ากับหลักดิน'
    },
    {
      id: 'boq-5-4',
      category: '5. งานระบบต่อลงดินและความปลอดภัย (Grounding & Safety)',
      itemCode: '5.4',
      description: `คลิปเชื่อมต่อสายดินระหว่างรางและแผง (Grounding Lug & Grounding Clip)`,
      brandModel: 'SUS304 Earthing Clip & Lug Kit',
      quantity: Math.ceil(totalModules * 1.2),
      unit: 'ชุด',
      materialUnitPrice: 35,
      laborUnitPrice: 15,
      notes: 'เชื่อมพันธะทางไฟฟ้า (Equipotential Bonding) ป้องกันไฟดูด'
    },

    // -------------------------------------------------------------
    // หมวด 6: บริการวิศวกรรม ค่าแรง และขออนุญาต (Engineering & Permitting)
    // -------------------------------------------------------------
    {
      id: 'boq-6-1',
      category: '6. งานบริการวิศวกรรม ติดตั้ง และขออนุญาตขนานไฟ',
      itemCode: '6.1',
      description: `ค่าแรงงานติดตั้งโครงสร้างทางกล แผงโซลาร์เซลล์ และระบบกันรั่วซึม (Mechanical Installation)`,
      brandModel: 'ทีมช่างชำนาญการติดตั้งบนหลังคาที่ผ่านการอบรมทำงานบนที่สูง',
      quantity: 1,
      unit: 'เหมา',
      materialUnitPrice: 0,
      laborUnitPrice: Math.round(totalKwp * 1200 + 3500),
      notes: 'รวมอุปกรณ์ Safety Harness, เชือกนิรภัย และทำความสะอาดพื้นที่หลังติดตั้ง'
    },
    {
      id: 'boq-6-2',
      category: '6. งานบริการวิศวกรรม ติดตั้ง และขออนุญาตขนานไฟ',
      itemCode: '6.2',
      description: `ค่าแรงงานเดินสายไฟฟ้า ติดตั้ง Inverter ตู้ควบคุม และระบบกราวด์ (Electrical Installation)`,
      brandModel: 'ช่างไฟฟ้ามาตรฐานคุณวุฒิวิชาชีพ',
      quantity: 1,
      unit: 'เหมา',
      materialUnitPrice: 0,
      laborUnitPrice: Math.round(totalKwp * 1000 + 3000),
      notes: 'ติดตั้งตามมาตรฐาน วสท. 022013-63 พร้อมตรวจวัดค่าฉนวนและขั้วไฟฟ้า'
    },
    {
      id: 'boq-6-3',
      category: '6. งานบริการวิศวกรรม ติดตั้ง และขออนุญาตขนานไฟ',
      itemCode: '6.3',
      description: `งานทดสอบระบบและเริ่มการเดินเครื่องเชิงพาณิชย์ (Testing & Commissioning) พร้อมแอปมอนิเตอร์`,
      brandModel: 'Solar PV Performance Testing & App Handover',
      quantity: 1,
      unit: 'โครงการ',
      materialUnitPrice: 500,
      laborUnitPrice: 2500,
      notes: 'ส่งมอบระบบ ตรวจสอบค่ากำลังผลิตจริง และสอนการใช้งานผ่านมือถือ'
    },
    {
      id: 'boq-6-4',
      category: '6. งานบริการวิศวกรรม ติดตั้ง และขออนุญาตขนานไฟ',
      itemCode: '6.4',
      description: `ค่าดำเนินการขออนุญาตขนานไฟ กฟน. (MEA) หรือ กฟภ. (PEA) และแจ้ง กกพ. ครบวงจร`,
      brandModel: 'One-Stop Service Grid Interconnection & ERC License',
      quantity: 1,
      unit: 'โครงการ',
      materialUnitPrice: 3000,
      laborUnitPrice: 5500,
      notes: 'จัดเตรียมเอกสาร ยื่นคำร้อง และประสานเจ้าหน้าที่การไฟฟ้าเข้ามาตรวจสอบมิเตอร์'
    },
    {
      id: 'boq-6-5',
      category: '6. งานบริการวิศวกรรม ติดตั้ง และขออนุญาตขนานไฟ',
      itemCode: '6.5',
      description: `ค่าจัดทำแบบวิศวกรรม และวิศวกรผู้ได้รับใบอนุญาต กว. ลงนามรับรองโครงสร้างและระบบไฟฟ้า`,
      brandModel: `วศ.บ. ไฟฟ้ากำลัง / วศ.บ. โยธา (กว. เลขที่ ${project.engineerLicense || 'สย. 94821'})`,
      quantity: 1,
      unit: 'ชุด',
      materialUnitPrice: 1000,
      laborUnitPrice: 4500,
      notes: 'รายการคำนวณโครงสร้างและระบบไฟฟ้าตามแบบมาตรฐานสำหรับยื่นราชการ'
    }
  ];

  // Calculate totals for each item
  return rawItems.map((item) => {
    const materialTotal = Math.round(item.quantity * item.materialUnitPrice);
    const laborTotal = Math.round(item.quantity * item.laborUnitPrice);
    const totalPrice = materialTotal + laborTotal;
    return {
      ...item,
      materialTotal,
      laborTotal,
      totalPrice
    };
  });
}

/**
 * Calculate BOQ Financial Summary
 */
export interface BoqSummary {
  totalMaterial: number;
  totalLabor: number;
  subtotal: number;
  vat7Percent: number;
  grandTotal: number;
  costPerWp: number;
  categoryBreakdown: {
    category: string;
    materialTotal: number;
    laborTotal: number;
    grandTotal: number;
    percentage: number;
  }[];
}

export function calculateBoqSummary(items: BoqItem[], totalKwp: number): BoqSummary {
  let totalMaterial = 0;
  let totalLabor = 0;

  const categoryMap = new Map<string, { material: number; labor: number }>();

  BOQ_CATEGORIES.forEach((cat) => {
    categoryMap.set(cat, { material: 0, labor: 0 });
  });

  items.forEach((item) => {
    totalMaterial += item.materialTotal;
    totalLabor += item.laborTotal;

    const catData = categoryMap.get(item.category) || { material: 0, labor: 0 };
    catData.material += item.materialTotal;
    catData.labor += item.laborTotal;
    categoryMap.set(item.category, catData);
  });

  const subtotal = totalMaterial + totalLabor;
  const vat7Percent = Math.round(subtotal * 0.07);
  const grandTotal = subtotal + vat7Percent;
  const totalWatts = Math.max(1, totalKwp * 1000);
  const costPerWp = Number((grandTotal / totalWatts).toFixed(2));

  const categoryBreakdown = BOQ_CATEGORIES.map((cat) => {
    const data = categoryMap.get(cat) || { material: 0, labor: 0 };
    const catTotal = data.material + data.labor;
    const percentage = subtotal > 0 ? Number(((catTotal / subtotal) * 100).toFixed(1)) : 0;
    return {
      category: cat,
      materialTotal: data.material,
      laborTotal: data.labor,
      grandTotal: catTotal,
      percentage
    };
  });

  return {
    totalMaterial,
    totalLabor,
    subtotal,
    vat7Percent,
    grandTotal,
    costPerWp,
    categoryBreakdown
  };
}

/**
 * Export BOQ items to CSV with Thai UTF-8 BOM for Microsoft Excel compatibility
 */
export function exportBoqToCsv(items: BoqItem[], project: ProjectData): void {
  const totalModules = project.layout.modulesPerRow * project.layout.rows;
  const totalKwp = ((totalModules * project.selectedPanel.wattage) / 1000).toFixed(2);
  const summary = calculateBoqSummary(items, Number(totalKwp));

  const rows: string[][] = [];

  // Header information
  rows.push(['บัญชีแสดงปริมาณวัสดุและราคา (BILL OF QUANTITIES - BOQ)']);
  rows.push([`โครงการ: ${project.projectName}`]);
  rows.push([`เจ้าของอาคาร: ${project.clientName}`, `สถานที่ติดตั้ง: ${project.clientAddress}`]);
  rows.push([`ขนาดกำลังผลิตติดตั้ง: ${totalKwp} kWp (${project.phase})`, `วันที่เสนอราคา: ${project.proposalDate}`]);
  rows.push([`บริษัทผู้จัดทำ: ${project.companyName}`, `วิศวกรผู้รับรอง: ${project.engineerName} (${project.engineerLicense})`]);
  rows.push([]);

  // Column Headers
  rows.push([
    'หมวด/ลำดับ',
    'รายการวัสดุและอุปกรณ์ (Description)',
    'ยี่ห้อ / สเปก (Brand / Model)',
    'จำนวน',
    'หน่วย',
    'ราคาวัสดุ/หน่วย (บาท)',
    'รวมค่าวัสดุ (บาท)',
    'ค่าแรง/หน่วย (บาท)',
    'รวมค่าแรง (บาท)',
    'รวมเป็นเงิน (บาท)',
    'หมายเหตุ'
  ]);

  // Group by category
  BOQ_CATEGORIES.forEach((cat) => {
    const catItems = items.filter((i) => i.category === cat);
    if (catItems.length === 0) return;

    // Category title row
    rows.push([cat, '', '', '', '', '', '', '', '', '', '']);

    catItems.forEach((item) => {
      rows.push([
        item.itemCode,
        `"${item.description.replace(/"/g, '""')}"`,
        `"${item.brandModel.replace(/"/g, '""')}"`,
        item.quantity.toString(),
        item.unit,
        item.materialUnitPrice.toString(),
        item.materialTotal.toString(),
        item.laborUnitPrice.toString(),
        item.laborTotal.toString(),
        item.totalPrice.toString(),
        `"${(item.notes || '').replace(/"/g, '""')}"`
      ]);
    });
  });

  // Summary rows
  rows.push([]);
  rows.push(['', '', 'รวมค่าวัสดุทั้งหมด (Total Material Cost)', '', '', '', summary.totalMaterial.toString(), '', '', '', 'บาท']);
  rows.push(['', '', 'รวมค่าแรงติดตั้งทั้งหมด (Total Labor Cost)', '', '', '', '', '', summary.totalLabor.toString(), '', 'บาท']);
  rows.push(['', '', 'รวมเงินค่าวัสดุและค่าแรง (Subtotal)', '', '', '', '', '', '', summary.subtotal.toString(), 'บาท']);
  rows.push(['', '', 'ภาษีมูลค่าเพิ่ม (VAT 7%)', '', '', '', '', '', '', summary.vat7Percent.toString(), 'บาท']);
  rows.push(['', '', 'รวมราคาสุทธิตลอดโครงการ (Grand Total)', '', '', '', '', '', '', summary.grandTotal.toString(), 'บาท']);
  rows.push(['', '', `ต้นทุนเฉลี่ยต่อวัตต์ (THB / Watt Peak)`, '', '', '', '', '', '', `${summary.costPerWp} บาท/Wp`, '']);

  // Convert to CSV string with UTF-8 Byte Order Mark (\uFEFF)
  const csvContent = '\uFEFF' + rows.map((r) => r.join(',')).join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `BOQ_${project.projectName.replace(/\s+/g, '_')}_${totalKwp}kWp.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

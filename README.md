# SolarPro Studio 3D & Proposal Suite ☀️⚡

> **ระบบเว็บแอปพลิเคชันออกแบบเขียนแบบวิศวกรรมโซลาร์เซลล์ 2D/3D เสมือนหน้างานจริง พร้อม 3D Shading Simulation (สไตล์ PVsyst), Single Line Diagram (SLD) มาตรฐาน กฟน./กฟภ. และเล่ม Proposal เสนองานฉบับผู้บริหาร**

[![System](https://img.shields.io/badge/System-SolarPro_Studio-amber.svg)](https://ais-pre-urrtqroajtacqa2a2tdfan-601280664095.asia-east1.run.app)
[![Standard](https://img.shields.io/badge/Standards-EIT_022013--63_|_MEA_|_PEA-emerald.svg)](#)
[![Simulation](https://img.shields.io/badge/Simulation-PVsyst_P50/P90_Standard-blue.svg)](#)
[![License](https://img.shields.io/badge/License-Apache_2.0-slate.svg)](#)

---

## 📌 สารบัญ (Table of Contents)
1. [ภาพรวมโครงการ (Overview)](#-ภาพรวมโครงการ-overview)
2. [ลิงก์เข้าใช้งานและแชร์ (Live Links)](#-ลิงก์เข้าใช้งานและแชร์-live-links)
3. [ฟังก์ชันเด่นระดับมืออาชีพ (Key Features)](#-ฟังก์ชันเด่นระดับมืออาชีพ-key-features)
4. [ขั้นตอนการทำงาน 4 ขั้นตอน (4-Step Workflow)](#-ขั้นตอนการทำงาน-4-ขั้นตอน-4-step-workflow)
5. [ทฤษฎีและการคำนวณทางวิศวกรรม (Engineering & Algorithms)](#-ทฤษฎีและการคำนวณทางวิศวกรรม-engineering--algorithms)
6. [มาตรฐานแบบไฟฟ้า Single Line Diagram (SLD Standards)](#-มาตรฐานแบบไฟฟ้า-single-line-diagram-sld-standards)
7. [โครงสร้างเล่ม Proposal เสนองาน (Proposal Book Structure)](#-โครงสร้างเล่ม-proposal-เสนองาน-proposal-book-structure)
8. [โครงสร้างโค้ดและสถาปัตยกรรม (Project Structure)](#-โครงสร้างโค้ดและสถาปัตยกรรม-project-structure)
9. [การติดตั้งและรันในสภาพแวดล้อม Development (Local Setup)](#-การติดตั้งและรันในสภาพแวดล้อม-development-local-setup)

---

## 🌟 ภาพรวมโครงการ (Overview)

**SolarPro Studio 3D & Proposal Suite** ถูกพัฒนาขึ้นเพื่อแก้ปัญหาของบริษัทผู้รับเหมาและวิศวกร EPC โซลาร์เซลล์ ที่ต้องการซอฟต์แวร์ที่ตอบโจทย์ตั้งแต่:
1. **ออกแบบและจัดวางแผง 2D / 3D เสมือนหน้างานจริง**
2. **จำลองแสงเงาตกกระทบ (3D Near Shading Simulation)** จากผนังกันตก ดาดฟ้า อาคารข้างเคียง และต้นไม้
3. **ประเมินผลผลิตพลังงานไฟฟ้า (PVsyst Methodology)** ที่แม่นยำตามพิกัดภูมิอากาศของประเทศไทย
4. **สร้างแบบวงจรไฟฟ้า Single Line Diagram (SLD)** สำหรับยื่นขออนุญาตขนานไฟ กฟน. (MEA) และ กฟภ. (PEA)
5. **สร้างเล่มข้อเสนอโครงการ (Executive Proposal Book)** รูปเล่มหรูหรา น่าเชื่อถือ พร้อมพิมพ์เป็น PDF ยื่นเสนอลูกค้าหรือผู้บริหารได้ทันที

---

## 🔗 ลิงก์เข้าใช้งานและแชร์ (Live Links)

- **ลิงก์สาธารณะสำหรับแชร์ให้ผู้อื่นใช้งาน (Shared URL)**:  
  👉 [https://ais-pre-urrtqroajtacqa2a2tdfan-601280664095.asia-east1.run.app](https://ais-pre-urrtqroajtacqa2a2tdfan-601280664095.asia-east1.run.app)
- **สภาพแวดล้อม Development**:  
  👉 [https://ais-dev-urrtqroajtacqa2a2tdfan-601280664095.asia-east1.run.app](https://ais-dev-urrtqroajtacqa2a2tdfan-601280664095.asia-east1.run.app)

*(สามารถเปิดใช้งานได้บนคอมพิวเตอร์, แล็ปท็อป, แท็บเล็ต iPad และสมาร์ตโฟน โดยไม่ต้องติดตั้งโปรแกรมเพิ่มเติม)*

---

## 🚀 ฟังก์ชันเด่นระดับมืออาชีพ (Key Features)

### 1. โมเดล 3D เสมือนหน้างานจริง & Shading Simulation (Three.js WebGL)
- **โมเดลสถาปัตยกรรมหลังคาจริง**:
  - หลังคาซีแพคโมเนีย / กระเบื้องคอนกรีต (CPAC Tile)
  - หลังคาเมทัลชีท Kliplok / Standing Seam และลอนมาตรฐาน (Trapezoidal Screw Fix)
  - ดาดฟ้าคอนกรีต (Flat Concrete Deck) พร้อมผนังกันตก (Parapet Wall)
  - โครงหลังคาโรงจอดรถ (Solar Carport)
- **PBR Photorealistic Materials**: พื้นผิวเซลล์แสงอาทิตย์สี Dark Monocrystalline Blue พร้อมเส้นสายบัสบาร์ (Busbars) และเฟรมอะลูมิเนียมเคลือบเงา
- **สิ่งกีดขวางจำลองเงา (Shading Obstacles)**: คอมเพรสเซอร์แอร์บนหลังคา (Outdoor AC Units), ถังเก็บน้ำ, ปล่องท่อ และต้นไม้ใหญ่
- **ระบบจำลองดวงอาทิตย์ (Dynamic Sun Path)**:
  - สไลเดอร์เวลา 06:00 - 18:00 น. หรือกดปุ่มเล่นแอนิเมชัน (Play)
  - เลือกเดือน ม.ค. - ธ.ค. เพื่อจำลองมุมองศาแสงแดดจริงตามฤดูกาล
  - ปรับมุมกล้องได้อิสระ: Isometric, Top Roof Plan, มองจากทิศใต้, และ **Sun-Eye View** (มุมมองสายตาจากดวงอาทิตย์)
  - ปุ่ม **"📷 บันทึกภาพ 3D (Proposal)"** บันทึกภาพเรนเดอร์หน้างานไปวางบนหน้าปกเล่ม Proposal โดยอัตโนมัติ

### 2. ผังหลังคา 2D Architectural CAD Layout
- มาตราส่วนเสมือนจริง พร้อมเส้นบอกขนาด (Dimensions: กว้าง × ยาว อาคาร และขนาดแผง)
- เส้นระยะร่นเพื่อความปลอดภัยและทางเดินเซอร์วิส (Safety Walkway Clearance 0.6 เมตร)
- การจัดวงจรสตริงไฟฟ้ากระแสตรง (DC Strings Allocation) แยกโค้ดสี S1, S2 พร้อมคำนวณแรงดัน Vmp, Voc รวม
- สลับการวางแผงแนวตั้ง (Portrait) หรือแนวนอน (Landscape) ได้ในคลิกเดียว

### 3. PVsyst Energy Yield & Loss Breakdown
- **PVsyst Loss Diagram (แผนภูมิการสูญเสีย)**:
  - Global Horizontal Irradiation (GHI)
  - Tilt Gain จากองศาเอียงหลังคา
  - 3D Near Shading Loss จากผนังกันตกและสิ่งกีดขวาง
  - Incidence Angle Modifier (IAM Fresnel Factor)
  - Temperature Coefficient Loss (ผลกระทบจากความร้อนของแผงในไทย)
  - Inverter Efficiency & Ohmic Wiring Loss
- **Performance Ratio (PR)** คำนวณจริงอยู่ที่ 78% - 82%
- กราฟแท่งผลผลิตพลังงานไฟฟ้ารายเดือน (Monthly Production kWh)
- ตารางมุมเงย (Elevation) และมุมทิศ (Azimuth) ละเอียดรายชั่วโมง

### 4. Single Line Diagram (SLD) มาตรฐาน กฟน. / กฟภ.
- ไดอะแกรมวิศวกรรมไฟฟ้าแบบเวกเตอร์คมชัดสูง (SVG)
- วงจร DC: PV Strings, DC Cable PV1-F, ฟิวส์ 15A gPV, DC Isolator 32A 1000V, DC SPD Type II, สายกราวด์ ($R < 5\,\Omega$)
- Inverter: พิกัดกำลัง kW, MPPT 1 / MPPT 2, ใบรับรอง Anti-Islanding (IEC 62116)
- วงจร AC: Solar DB, MCB/MCCB, RCBO 30mA Type A, AC SPD Type II
- ระบบกันย้อน: Smart Power Sensor (DTSU666-H) พร้อมหม้อแปลงกระแส (CT) และสายสัญญาณ RS485 Modbus
- ตู้ MDB, Main Circuit Breaker, โหลดอาคาร และระบบเชื่อมต่อสายส่ง MEA/PEA
- ตาราง **Engineering Title Block** พร้อมชื่อวิศวกรผู้รับรองแบบและเลขที่ใบอนุญาต กว.

### 5. เล่ม Proposal เสนองานฉบับสมบูรณ์ (Executive Proposal Book)
- จัดหน้าขนาดกระดาษ **A4 พร้อมพิมพ์เป็น PDF** สวยงามระดับงานประมูลราชการและเอกชน
  - **หน้า 1**: หน้าปกหรูหรา พร้อมภาพเรนเดอร์ 3D จริง, ตราสัญลักษณ์มาตรฐาน และข้อมูลผู้รับเหมา/ลูกค้า
  - **หน้า 2**: บทสรุปผู้บริหารและความคุ้มค่าทางการเงิน (CAPEX, ค่าไฟที่ประหยัดได้, ระยะเวลาคืนทุน Payback ~4-5 ปี, กระแสเงินสดสะสม 25 ปี, ตัวเลข ESG ลดก๊าซเรือนกระจก CO₂)
  - **หน้า 3**: รายงานผลการจำลองแสงเงา 3D Shading Simulation & PVsyst
  - **หน้า 4**: แบบ Single Line Diagram (SLD) วิศวกรรมไฟฟ้า
  - **หน้า 5**: รายการอุปกรณ์มาตรฐาน (Bill of Materials), ใบรับประกันงานติดตั้ง 2 ปี, ประกันประสิทธิภาพแผง 25-30 ปี, ประกัน Inverter 5-10 ปี พร้อมช่องลงนามอนุมัติโครงการ

---

## 🛠️ ขั้นตอนการทำงาน 4 ขั้นตอน (4-Step Workflow)

ตามที่ระบุในข้อกำหนดการทำงาน ระบบได้แบ่งเป็น 4 ขั้นตอนที่ใช้งานง่าย:

```
[ขั้นที่ 1: ขนาด & ระบบติดตั้ง] ➔ [ขั้นที่ 2: Location & อาคาร] ➔ [ขั้นที่ 3: แผง PV & Inverter] ➔ [ขั้นที่ 4: Concept Design]
```

| ขั้นตอน | รายละเอียดข้อมูลที่ป้อน | ผลลัพธ์ที่ได้ |
|---|---|---|
| **1. ขนาด & ระบบติดตั้ง** | ชื่อโครงการ, ลูกค้า, เบอร์โทร, ระบบ On-Grid/Hybrid, 1-Phase 220V หรือ 3-Phase 380V, กำลังผลิตเป้าหมาย (kWp) | ข้อมูลหัวตารางโครงการ และค่าพิกัดไฟฟ้าพื้นฐาน |
| **2. Location & อาคาร** | เลือกจังหวัดในไทย (กทม., ชลบุรี, ระยอง ฯลฯ), ขนาดอาคาร กว้าง×ยาว×สูง, หลังคาซีแพค/เมทัลชีท/ดาดฟ้า, มุมเอียง, ทิศหันหลังคา และสิ่งกีดขวาง | ฐานข้อมูลแสงแดด GHI & PSH และโครงสร้างโมเดล 3D |
| **3. แผง PV & Inverter** | เลือกแผง Tier 1 (Jinko, LONGi, JA Solar, Canadian Solar) และ Inverter (Huawei, Sungrow, Deye) | ค่าคำนวณทางไฟฟ้า Voc, Vmp, Imp, Isc และพิกัดป้องกัน |
| **4. Concept Design** | ตรวจสอบอัตราส่วน DC/AC Ratio, จำนวนแผงรวม, สรุปงบประมาณเบื้องต้น | พร้อมส่งออกไปแสดงผลใน 3D/2D, SLD และ Proposal ทันที |

---

## 📐 ทฤษฎีและการคำนวณทางวิศวกรรม (Engineering & Algorithms)

### 1. ตำแหน่งดวงอาทิตย์ (Solar Geometry)
- **Solar Declination ($\delta$)**:
  $$\delta = 23.45^\circ \cdot \sin\left(\frac{360^\circ}{365} (284 + n)\right)$$
  *(โดย $n$ คือลำดับวันที่ในรอบปี 1..365)*
- **Hour Angle ($\omega$)**:
  $$\omega = 15^\circ \cdot (Hour - 12)$$
- **Solar Altitude / Elevation Angle ($\alpha$)**:
  $$\sin \alpha = \sin \phi \sin \delta + \cos \phi \cos \delta \cos \omega$$
  *(โดย $\phi$ คือละติจูดของสถานที่ติดตั้ง เช่น กรุงเทพฯ $13.75^\circ\,\text{N}$)*
- **Solar Azimuth Angle ($\gamma$)**:
  $$\cos \gamma = \frac{\sin \alpha \sin \phi - \sin \delta}{\cos \alpha \cos \phi}$$

### 2. การจำลองผลผลิตไฟฟ้า (PVsyst Methodology)
- **พลังงานไฟฟ้ารายเดือน ($E_{month}$)**:
  $$E_{month} = P_{dc} \times (\text{GHI}_{daily} \times \text{Days}) \times \text{PR}$$
- **Performance Ratio (PR)**:
  $$\text{PR} = (1 - L_{shading}) \times (1 - L_{temp}) \times (1 - L_{inv}) \times (1 - L_{cable}) \times (1 - L_{soiling}) \times F_{orientation}$$
  - $L_{shading}$: การสูญเสียจากเงาคำนวณจริงจากความสูงผนังกันตกและสิ่งกีดขวาง (~2.2% - 8.5%)
  - $L_{temp}$: การสูญเสียจากความร้อน $(T_{cell} - 25^\circ\text{C}) \times \gamma_{Pmax} \approx 27 \times (-0.30\%/^\circ\text{C}) \approx 8.1\%$
  - $L_{inv}$: การสูญเสียของ Inverter ตาม Euro Efficiency (~1.5% - 2.5%)
  - $L_{cable}$: การสูญเสียในสายไฟ DC/AC (~1.2% - 2.2%)

### 3. ผลประโยชน์ด้านสิ่งแวดล้อม (ESG Carbon Offsets)
- ค่าสัมประสิทธิ์การปล่อยก๊าซเรือนกระจกของสายส่งไฟฟ้าไทย (EPPO/TGO Grid Emission Factor): **$0.505\,\text{kg CO}_2\text{e} / \text{kWh}$**
- ต้นไม้โตเต็มวัย 1 ต้นดูดซับก๊าซคาร์บอนไดออกไซด์เฉลี่ย **$11\,\text{kg CO}_2 / \text{ปี}$**

---

## ⚡ มาตรฐานแบบไฟฟ้า Single Line Diagram (SLD Standards)

แบบ Single Line Diagram ในระบบถูกออกแบบให้สอดคล้องกับระเบียบการขนานไฟของการไฟฟ้าไทย:
1. **มาตรฐาน วสท. 022013-63**: มาตรฐานการติดตั้งทางไฟฟ้าสำหรับประเทศไทย (ระบบผลิตไฟฟ้าจากพลังงานแสงอาทิตย์บนหลังคา)
2. **ระเบียบการไฟฟ้านครหลวง (MEA)** และ **การไฟฟ้าส่วนภูมิภาค (PEA)**:
   - สวิตช์ตัดตอนด้านไฟตรง (DC Disconnector / Load Break Switch) ทนพิกัด DC-PV2
   - อุปกรณ์ป้องกันเสิร์จ (Surge Protective Device - SPD Type II) ทั้งด้าน DC และ AC
   - ระบบควบคุมกำลังไฟฟ้าไหลย้อน (Zero Export Controller) ผ่าน Smart Power Sensor พร้อมหม้อแปลงกระแส (CT)
   - อุปกรณ์ตรวจจับเกาะกระแสไฟฟ้า (Anti-Islanding Protection) ตามมาตรฐานสากล IEC 62116 / IEEE 1547

---

## 📑 โครงสร้างเล่ม Proposal เสนองาน (Proposal Book Structure)

เมื่อกดปุ่ม **"พิมพ์ Proposal (PDF)"** เอกสารจะถูกจัดหน้า A4 5 หน้าพร้อมเซฟเป็น PDF ได้ทันที:

```
├── หน้า 1: หน้าปกหรูหรา (Cover Page)
│   ├── ตราสัญลักษณ์และชื่อบริษัท EPC
│   ├── เลขที่เอกสารอ้างอิงและวันที่เสนอราคา
│   ├── ภาพจำลอง 3D Visual Architectural Render หน้างานจริง
│   └── ข้อมูลลูกค้าและวิศวกรผู้รับรองโครงการ
│
├── หน้า 2: บทสรุปผู้บริหาร & การเงิน (Executive Summary & Financials)
│   ├── 4 การ์ดตัวชี้วัดหลัก: กำลังผลิต, ผลิตไฟฟ้ารายปี, ประหยัดปีแรก, คืนทุน (ปี)
│   ├── ตารางกระแสเงินสดสะสม 25 ปี (25-Year Cash Flow Projection)
│   └── คุณประโยชน์ด้านสิ่งแวดล้อม ESG (ตัน CO₂/ปี & เทียบเท่าต้นไม้)
│
├── หน้า 3: รายงาน 3D Shading Simulation & PVsyst
│   ├── ภาพมุมมอง Shading Analysis พร้อมมุมตกกระทบ
│   ├── สรุปค่า Shading Loss % และ Performance Ratio %
│   └── ตารางประมาณการผลผลิตไฟฟ้ารายเดือน (ม.ค. - ธ.ค.)
│
├── หน้า 4: แบบไดอะแกรมไฟฟ้า Single Line Diagram (SLD)
│   ├── ผังวงจร DC Strings, DC Combiner, Inverter, Solar DB, Smart Meter, MDB
│   └── ตารางรับรองแบบวิศวกรรม (Engineering Title Block) พร้อมเลขที่ กว.
│
└── หน้า 5: รายการอุปกรณ์ (BOM) & เงื่อนไขการรับประกัน
    ├── ตาราง Bill of Materials: แผง Tier 1, Inverter, โครงสร้าง, สายไฟ, ตู้ไฟ
    ├── เงื่อนไขรับประกันงานติดตั้ง 2 ปี และประกันแผง 25-30 ปี
    └── ช่องลงนามอนุมัติของผู้เสนอราคาและผู้ว่าจ้าง
```

---

## 📁 โครงสร้างโค้ดและสถาปัตยกรรม (Project Structure)

```
solarpro-studio/
├── index.html                           # HTML Entry point พร้อม Font Prompt & Inter
├── metadata.json                        # ข้อมูลและ Capabilities ของแอป
├── package.json                         # Dependencies (Three.js, React, Tailwind, Lucide)
├── tsconfig.json                        # TypeScript Configuration
├── vite.config.ts                       # Vite Build Configuration
├── src/
│   ├── main.tsx                         # React 19 Client Entry
│   ├── App.tsx                          # Main Container, Tab Router & Guide Modal
│   ├── index.css                        # Tailwind CSS 4 & Media Print Rules สำหรับ A4
│   ├── types/
│   │   └── solar.ts                     # Data Models (Panels, Inverters, Building, SLD)
│   ├── data/
│   │   └── solarEquipment.ts            # ข้อมูลแผง Tier 1, Inverter, แบตเตอรี่, พิกัดรังสีแดดในไทย
│   ├── utils/
│   │   └── solarCalculations.ts         # อัลกอริทึมมุมแดด, PVsyst Loss Engine, และการเงิน
│   └── components/
│       ├── HeaderNav.tsx                # แถบเมนูด้านบน สลับแท็บ และปุ่มพิมพ์ Proposal
│       ├── 3d/
│       │   └── SolarScene3D.tsx         # Three.js 3D Viewport, Sun Path Arc & Shading
│       ├── 2d/
│       │   └── SolarCadView2D.tsx       # 2D Architectural CAD Roof Layout & String Plan
│       ├── sld/
│       │   └── SingleLineDiagram.tsx    # SVG Single Line Diagram มาตรฐาน กฟน./กฟภ.
│       ├── pvsyst/
│       │   └── PVsystShadingReport.tsx  # รายงานกราฟแท่งและ Loss Waterfall สไตล์ PVsyst
│       ├── wizard/
│       │   └── ProjectStepWizard.tsx    # วิซาร์ด 4 ขั้นตอนการทำงาน
│       └── proposal/
│           └── ExecutiveProposal.tsx    # เล่ม Proposal เสนองาน 5 หน้า พร้อมพิมพ์ PDF
```

---

## 💻 การติดตั้งและรันในสภาพแวดล้อม Development (Local Setup)

```bash
# 1. ติดตั้ง Dependencies
npm install

# 2. เริ่มต้นรัน Dev Server บน Port 3000
npm run dev

# 3. ตรวจสอบ Type และ Lint
npm run lint

# 4. บิลด์สำหรับ Production
npm run build
```

---

## 🏆 สร้างความน่าเชื่อถือให้กับบริษัท (Enterprise Quality)

ด้วย SolarPro Studio 3D วิศวกรและทีมฝ่ายขายสามารถ:
- สรุปตัวเลขผลผลิตพลังงานไฟฟ้าที่อ้างอิงหลักการคำนวณจริงของ **PVsyst** ทำให้ลูกค้ามั่นใจในตัวเลขผลตอบแทน
- แสดงภาพจำลอง **3D เสมือนจริง** ของหลังคาบ้านลูกค้าจริง ทำให้ลูกค้าเห็นภาพก่อนตัดสินใจเซ็นสัญญา
- มี **Single Line Diagram** ที่ถูกต้องตามหลักวิศวกรรมไฟฟ้า ช่วยลดเวลาในการเขียนแบบยื่นขนานไฟ
- ส่งมอบ **เล่ม Proposal ที่จัดหน้าเรียบร้อย สวยงาม และน่าเชื่อถือ** เพิ่มอัตราการปิดการขาย (Conversion Rate) ได้ทันที

---
*จัดทำขึ้นเพื่อการออกแบบวิศวกรรมพลังงานสะอาดระดับมืออาชีพ*

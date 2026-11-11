import { SolarPanelSpec, InverterSpec, BatterySpec, LocationData, ProjectData } from '../types/solar';

export const SOLAR_PANELS: SolarPanelSpec[] = [
  {
    id: 'jinko-585',
    brand: 'Jinko Solar',
    model: 'Tiger Neo N-Type TOPCon JKM585N-72HL4-BDV',
    wattage: 585,
    efficiency: 22.65,
    length: 2278,
    width: 1134,
    thickness: 30,
    vmp: 42.61,
    imp: 13.73,
    voc: 51.15,
    isc: 14.48,
    tempCoeffPmax: -0.30,
    warrantyYears: 30
  },
  {
    id: 'longi-580',
    brand: 'LONGi Solar',
    model: 'Hi-MO 6 Explorer LR5-72HTH-580M',
    wattage: 580,
    efficiency: 22.45,
    length: 2278,
    width: 1134,
    thickness: 35,
    vmp: 44.06,
    imp: 13.17,
    voc: 52.21,
    isc: 14.09,
    tempCoeffPmax: -0.29,
    warrantyYears: 25
  },
  {
    id: 'ja-585',
    brand: 'JA Solar',
    model: 'DeepBlue 4.0 Pro JAM72D40-585/GB',
    wattage: 585,
    efficiency: 22.6,
    length: 2278,
    width: 1134,
    thickness: 30,
    vmp: 43.14,
    imp: 13.56,
    voc: 51.52,
    isc: 14.36,
    tempCoeffPmax: -0.30,
    warrantyYears: 30
  },
  {
    id: 'canadian-600',
    brand: 'Canadian Solar',
    model: 'HiKu7 BiHiKu CS7N-600MB-AG',
    wattage: 600,
    efficiency: 21.2,
    length: 2384,
    width: 1303,
    thickness: 35,
    vmp: 35.1,
    imp: 17.1,
    voc: 41.5,
    isc: 18.52,
    tempCoeffPmax: -0.34,
    warrantyYears: 25
  },
  {
    id: 'jinko-440-compact',
    brand: 'Jinko Solar',
    model: 'Tiger Neo 54HL4R-V 440W (All Black Residential)',
    wattage: 440,
    efficiency: 22.02,
    length: 1762,
    width: 1134,
    thickness: 30,
    vmp: 32.81,
    imp: 13.41,
    voc: 39.38,
    isc: 13.86,
    tempCoeffPmax: -0.29,
    warrantyYears: 30
  }
];

export const INVERTERS: InverterSpec[] = [
  {
    id: 'huawei-5ktl',
    brand: 'Huawei',
    model: 'SUN2000-5KTL-L1 (Smart PV Optimizer Ready)',
    ratedPowerKw: 5.0,
    phase: '1-Phase (220V)',
    mpptCount: 2,
    maxDcVoltage: 600,
    mpptVoltageRange: [90, 560],
    maxEfficiency: 98.4,
    euroEfficiency: 97.7,
    hasZeroExport: true,
    warrantyYears: 10
  },
  {
    id: 'huawei-10ktl-m1',
    brand: 'Huawei',
    model: 'SUN2000-10KTL-M1 (High Efficiency 3-Phase)',
    ratedPowerKw: 10.0,
    phase: '3-Phase (380V)',
    mpptCount: 2,
    maxDcVoltage: 1100,
    mpptVoltageRange: [160, 980],
    maxEfficiency: 98.6,
    euroEfficiency: 98.1,
    hasZeroExport: true,
    warrantyYears: 10
  },
  {
    id: 'sungrow-sg5',
    brand: 'Sungrow',
    model: 'SG5.0RS-ADA (Residential 1-Phase)',
    ratedPowerKw: 5.0,
    phase: '1-Phase (220V)',
    mpptCount: 2,
    maxDcVoltage: 600,
    mpptVoltageRange: [100, 560],
    maxEfficiency: 98.4,
    euroEfficiency: 97.5,
    hasZeroExport: true,
    warrantyYears: 10
  },
  {
    id: 'sungrow-sg10rt',
    brand: 'Sungrow',
    model: 'SG10RT-Multi-MPPT (3-Phase)',
    ratedPowerKw: 10.0,
    phase: '3-Phase (380V)',
    mpptCount: 2,
    maxDcVoltage: 1100,
    mpptVoltageRange: [160, 1000],
    maxEfficiency: 98.5,
    euroEfficiency: 97.9,
    hasZeroExport: true,
    warrantyYears: 10
  },
  {
    id: 'deye-hybrid-12k',
    brand: 'Deye',
    model: 'SUN-12K-SG04LP3-EU Hybrid (Energy Storage)',
    ratedPowerKw: 12.0,
    phase: '3-Phase (380V)',
    mpptCount: 2,
    maxDcVoltage: 800,
    mpptVoltageRange: [200, 650],
    maxEfficiency: 97.6,
    euroEfficiency: 97.0,
    hasZeroExport: true,
    warrantyYears: 5
  },
  {
    id: 'huawei-50ktl',
    brand: 'Huawei',
    model: 'SUN2000-50KTL-M3 (Commercial Rooftop)',
    ratedPowerKw: 50.0,
    phase: '3-Phase (380V)',
    mpptCount: 4,
    maxDcVoltage: 1100,
    mpptVoltageRange: [200, 1000],
    maxEfficiency: 98.5,
    euroEfficiency: 98.0,
    hasZeroExport: true,
    warrantyYears: 10
  }
];

export const BATTERIES: BatterySpec[] = [
  {
    id: 'huawei-luna-10',
    brand: 'Huawei',
    model: 'LUNA2000-10-S0 Smart String ESS',
    capacityKwh: 10,
    voltageV: 400,
    usableCapacityKwh: 10,
    maxDischargeKw: 5.0,
    chemistry: 'Lithium Iron Phosphate (LiFePO4)'
  },
  {
    id: 'deye-bos-15',
    brand: 'Deye',
    model: 'BOS-G High Voltage LiFePO4 Rack',
    capacityKwh: 15.3,
    voltageV: 307,
    usableCapacityKwh: 13.8,
    maxDischargeKw: 7.5,
    chemistry: 'Lithium Iron Phosphate (LiFePO4)'
  }
];

export const THAILAND_LOCATIONS: LocationData[] = [
  {
    province: 'กรุงเทพมหานคร (Bangkok)',
    region: 'ภาคกลาง',
    latitude: 13.7563,
    longitude: 100.5018,
    annualGhiKwhM2: 1845,
    peakSunHoursAvg: 5.05,
    monthlyGhi: [4.9, 5.4, 5.7, 5.8, 5.1, 4.7, 4.6, 4.5, 4.4, 4.7, 5.1, 4.9]
  },
  {
    province: 'ชลบุรี (Chonburi / EEC)',
    region: 'ภาคตะวันออก',
    latitude: 13.3611,
    longitude: 100.9847,
    annualGhiKwhM2: 1890,
    peakSunHoursAvg: 5.18,
    monthlyGhi: [5.0, 5.5, 5.8, 5.9, 5.2, 4.8, 4.7, 4.6, 4.5, 4.8, 5.2, 5.1]
  },
  {
    province: 'ระยอง (Rayong Industrial)',
    region: 'ภาคตะวันออก',
    latitude: 12.6815,
    longitude: 101.2816,
    annualGhiKwhM2: 1910,
    peakSunHoursAvg: 5.23,
    monthlyGhi: [5.1, 5.6, 5.9, 6.0, 5.3, 4.9, 4.8, 4.7, 4.6, 4.9, 5.3, 5.2]
  },
  {
    province: 'นครราชสีมา (Nakhon Ratchasima)',
    region: 'ภาคตะวันออกเฉียงเหนือ',
    latitude: 14.9799,
    longitude: 102.0978,
    annualGhiKwhM2: 1925,
    peakSunHoursAvg: 5.27,
    monthlyGhi: [5.2, 5.7, 6.0, 6.1, 5.3, 4.9, 4.8, 4.7, 4.6, 5.0, 5.4, 5.2]
  },
  {
    province: 'เชียงใหม่ (Chiang Mai)',
    region: 'ภาคเหนือ',
    latitude: 18.7883,
    longitude: 98.9853,
    annualGhiKwhM2: 1780,
    peakSunHoursAvg: 4.88,
    monthlyGhi: [4.8, 5.5, 6.1, 6.0, 5.2, 4.4, 4.3, 4.2, 4.3, 4.6, 4.8, 4.6]
  },
  {
    province: 'ขอนแก่น (Khon Kaen)',
    region: 'ภาคตะวันออกเฉียงเหนือ',
    latitude: 16.4322,
    longitude: 102.8236,
    annualGhiKwhM2: 1905,
    peakSunHoursAvg: 5.22,
    monthlyGhi: [5.1, 5.6, 5.9, 6.0, 5.3, 4.9, 4.7, 4.6, 4.5, 4.9, 5.3, 5.1]
  },
  {
    province: 'ภูเก็ต (Phuket)',
    region: 'ภาคใต้',
    latitude: 7.8804,
    longitude: 98.3923,
    annualGhiKwhM2: 1820,
    peakSunHoursAvg: 4.98,
    monthlyGhi: [5.3, 5.7, 5.6, 5.4, 4.7, 4.4, 4.5, 4.4, 4.2, 4.4, 4.6, 4.9]
  },
  {
    province: 'สงขลา / หาดใหญ่ (Songkhla)',
    region: 'ภาคใต้',
    latitude: 7.1990,
    longitude: 100.5950,
    annualGhiKwhM2: 1810,
    peakSunHoursAvg: 4.95,
    monthlyGhi: [5.0, 5.4, 5.6, 5.5, 4.8, 4.6, 4.6, 4.6, 4.5, 4.4, 4.2, 4.6]
  }
];

export const DEFAULT_COMBINER_BOX = {
  dcFuseRatingA: 15,
  dcFuseVoltageV: 1000,
  dcIsolatorRatingA: 32,
  dcIsolatorVoltageV: 1000,
  dcSpdType: 'Type 2 (DC)',
  dcSpdInKa: 20,
  dcSpdImaxKa: 40,
  dcSpdUpKv: 1.5,
  dcCableSizeMm2: '1x4.0 mm²',
  acBreakerType: 'MCB',
  acBreakerRatingA: 32,
  acBreakerPoles: '2P',
  acRcboRatingMa: 30,
  acSpdType: 'Type 2 (AC)',
  acSpdInKa: 20,
  acSpdImaxKa: 40,
  acSpdUcV: 385,
  acCableSpec: '3x6.0 mm² Cu/XLPE',
  zeroExportMeterModel: 'DTSU666-H (Smart Power Sensor with CTs)'
};

export const DEFAULT_PROJECT_PRESETS: { [key: string]: Partial<ProjectData> } = {
  residential5kwp: {
    projectName: 'โครงการติดตั้งระบบโซลาร์เซลล์ บ้านพักอาศัย (Residential 5.26 kWp)',
    clientName: 'คุณสมชาย วงศ์สวัสดิ์',
    clientAddress: '88/19 หมู่บ้านนันทวัน ถ.ราชพฤกษ์ บางกรวย นนทบุรี',
    clientPhone: '081-987-6543',
    systemType: 'On-Grid',
    phase: '1-Phase (220V)',
    targetCapacityKwp: 5.26,
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
    }
  },
  luxuryVilla10kwp: {
    projectName: 'โครงการติดตั้งระบบโซลาร์เซลล์ Luxury Villa (10.53 kWp 3-Phase)',
    clientName: 'คุณกิตติศักดิ์ เจริญกิจพาณิชย์',
    clientAddress: '249/15 โครงการ The Grand พระราม 2 กรุงเทพฯ',
    clientPhone: '089-123-4567',
    systemType: 'On-Grid',
    phase: '3-Phase (380V)',
    targetCapacityKwp: 10.53,
    building: {
      name: 'อาคารวิลล่าพักอาศัย หลังคาเมทัลชีท Kliplok',
      widthM: 14,
      lengthM: 10,
      heightM: 7.2,
      roofType: 'Metal Sheet (Kliplok/Seam)',
      roofTiltDeg: 12,
      roofAzimuthDeg: 175,
      parapetHeightM: 0.3,
      hasObstacles: true,
      obstacleType: 'AC Units',
      treeDistanceM: 10,
      treeHeightM: 8
    },
    combinerBox: {
      ...DEFAULT_COMBINER_BOX,
      dcFuseRatingA: 20,
      acBreakerPoles: '3P',
      acBreakerRatingA: 25,
      acCableSpec: '4x6.0 mm² Cu/XLPE',
      zeroExportMeterModel: 'DTSU666-H (3-Phase)'
    },
    layout: {
      modulesPerRow: 6,
      rows: 3,
      orientation: 'Portrait',
      rowSpacingM: 0.15,
      panelTiltDeg: 12,
      panelAzimuthDeg: 175,
      stringsCount: 2,
      modulesPerString: 9
    },
    financial: {
      systemCostThb: 319000,
      electricityRateThbPerUnit: 4.75,
      touOnPeakRateThb: 5.25,
      touOffPeakRateThb: 2.65,
      useTouRate: true,
      onPeakSharePercent: 80,
      annualDegradationPercent: 0.5,
      electricityInflationPercent: 2.5,
      omCostAnnualThb: 3000
    }
  },
  hybridEss12kwp: {
    projectName: 'โครงการ Hybrid Solar ESS สำรองไฟ 24 ชม. (12.28 kWp + 15kWh ESS)',
    clientName: 'แพทย์หญิง ปิยาภรณ์ เลิศวิริยะ',
    clientAddress: '155/3 ต.หนองปรือ อ.บางละมุง พัทยา ชลบุรี',
    clientPhone: '082-555-8899',
    systemType: 'Hybrid (with Battery ESS)',
    phase: '3-Phase (380V)',
    targetCapacityKwp: 12.28,
    building: {
      name: 'อาคารคลินิกและที่พักอาศัย หลังคาดาดฟ้าคอนกรีต',
      widthM: 16,
      lengthM: 12,
      heightM: 9.0,
      roofType: 'Concrete Slab (Flat Deck)',
      roofTiltDeg: 10,
      roofAzimuthDeg: 180,
      parapetHeightM: 0.8,
      hasObstacles: true,
      obstacleType: 'Water Tank',
      treeDistanceM: 12,
      treeHeightM: 5
    },
    combinerBox: {
      ...DEFAULT_COMBINER_BOX,
      dcFuseRatingA: 20,
      acBreakerPoles: '3P',
      acBreakerRatingA: 32,
      acCableSpec: '4x10.0 mm² Cu/XLPE',
      zeroExportMeterModel: 'DTSU666-H (3-Phase with Backup CT)'
    },
    layout: {
      modulesPerRow: 7,
      rows: 3,
      orientation: 'Portrait',
      rowSpacingM: 0.8,
      panelTiltDeg: 10,
      panelAzimuthDeg: 180,
      stringsCount: 2,
      modulesPerString: 11
    },
    financial: {
      systemCostThb: 569000,
      electricityRateThbPerUnit: 4.80,
      touOnPeakRateThb: 5.30,
      touOffPeakRateThb: 2.65,
      useTouRate: true,
      onPeakSharePercent: 85,
      annualDegradationPercent: 0.5,
      electricityInflationPercent: 2.5,
      omCostAnnualThb: 4500
    }
  }
};

export type SystemPhase = '1-Phase (220V)' | '3-Phase (380V)';

export type SystemType = 'On-Grid' | 'Hybrid (with Battery ESS)' | 'Off-Grid';

export type RoofType = 
  | 'Metal Sheet (Kliplok/Seam)' 
  | 'Metal Sheet (Trapezoidal/Screw)' 
  | 'CPAC Tile / Concrete Tile' 
  | 'Ceramic / Flat Tile' 
  | 'Concrete Slab (Flat Deck)' 
  | 'Solar Carport';

export interface SolarPanelSpec {
  id: string;
  brand: string;
  model: string;
  wattage: number; // Watts
  efficiency: number; // percentage, e.g. 22.6%
  length: number; // mm
  width: number; // mm
  thickness: number; // mm
  vmp: number; // Volts at max power
  imp: number; // Amps at max power
  voc: number; // Open circuit voltage
  isc: number; // Short circuit current
  tempCoeffPmax: number; // %/°C e.g. -0.30%/°C
  warrantyYears: number; // Performance warranty
}

export interface InverterSpec {
  id: string;
  brand: string;
  model: string;
  ratedPowerKw: number; // kW
  phase: SystemPhase;
  mpptCount: number;
  maxDcVoltage: number; // Volts
  mpptVoltageRange: [number, number]; // [min, max] V
  maxEfficiency: number; // e.g. 98.6%
  euroEfficiency: number; // e.g. 98.1%
  hasZeroExport: boolean;
  warrantyYears: number;
}

export interface BatterySpec {
  id: string;
  brand: string;
  model: string;
  capacityKwh: number;
  voltageV: number;
  usableCapacityKwh: number;
  maxDischargeKw: number;
  chemistry: string;
}

export interface LocationData {
  province: string;
  region: string;
  latitude: number;
  longitude: number;
  annualGhiKwhM2: number; // Global Horizontal Irradiation kWh/m2/year
  peakSunHoursAvg: number; // hours/day
  monthlyGhi: number[]; // 12 months kWh/m2/day
}

export interface BuildingConfig {
  name: string;
  widthM: number; // East-West width in meters
  lengthM: number; // North-South length in meters
  heightM: number; // Building height in meters
  roofType: RoofType;
  roofTiltDeg: number; // degrees (e.g. 10°-15°)
  roofAzimuthDeg: number; // 0 = North, 90 = East, 180 = South, 270 = West
  parapetHeightM: number; // roof parapet wall height
  hasObstacles: boolean;
  obstacleType: 'AC Units' | 'Chimney/Vent' | 'Water Tank' | 'Trees Nearby' | 'None';
  treeDistanceM: number;
  treeHeightM: number;
}

export interface ArrayLayoutConfig {
  modulesPerRow: number;
  rows: number;
  orientation: 'Portrait' | 'Landscape';
  rowSpacingM: number;
  panelTiltDeg: number; // usually matches roof or custom tilt
  panelAzimuthDeg: number;
  stringsCount: number;
  modulesPerString: number;
}

export interface FinancialConfig {
  systemCostThb: number;
  electricityRateThbPerUnit: number; // e.g. 4.70 THB/kWh
  touOnPeakRateThb: number; // e.g. 5.15
  touOffPeakRateThb: number; // e.g. 2.63
  useTouRate: boolean;
  onPeakSharePercent: number; // e.g. 70% daytime
  annualDegradationPercent: number; // e.g. 0.5%
  electricityInflationPercent: number; // e.g. 2.5%
  omCostAnnualThb: number;
}

export interface CombinerBoxSpec {
  dcFuseRatingA: number; // e.g. 15, 20, 25, 30, 32 A
  dcFuseVoltageV: number; // e.g. 1000, 1500 V
  dcIsolatorRatingA: number; // e.g. 25, 32, 40, 63 A
  dcIsolatorVoltageV: number; // e.g. 1000, 1500 V
  dcSpdType: string; // e.g. "Type 2"
  dcSpdInKa: number; // e.g. 20 kA
  dcSpdImaxKa: number; // e.g. 40 kA
  dcSpdUpKv: number; // e.g. 1.5 kV
  dcCableSizeMm2: string; // e.g. "1x4.0 mm²"

  acBreakerType: string; // "MCB" | "MCCB"
  acBreakerRatingA: number; // e.g. 16, 20, 25, 32, 40, 63 A
  acBreakerPoles: string; // "2P" | "3P" | "4P"
  acRcboRatingMa: number; // e.g. 30, 100, 300 mA
  acSpdType: string; // e.g. "Type 2"
  acSpdInKa: number; // e.g. 20 kA
  acSpdImaxKa: number; // e.g. 40 kA
  acSpdUcV: number; // e.g. 385V
  acCableSpec: string; // e.g. "4x6.0 mm²"
  zeroExportMeterModel: string; // e.g. "DTSU666-H"
}

export interface ProjectData {
  id: string;
  projectName: string;
  clientName: string;
  clientAddress: string;
  clientPhone: string;
  companyName: string;
  engineerName: string;
  engineerLicense: string;
  proposalDate: string;
  systemType: SystemType;
  phase: SystemPhase;
  targetCapacityKwp: number;
  location: LocationData;
  building: BuildingConfig;
  selectedPanel: SolarPanelSpec;
  selectedInverter: InverterSpec;
  selectedBattery?: BatterySpec;
  combinerBox: CombinerBoxSpec;
  layout: ArrayLayoutConfig;
  financial: FinancialConfig;
  notes: string;
}

export interface ShadingSimulationPoint {
  hour: number; // 6 to 18
  month: number; // 1 to 12
  sunAltitudeDeg: number;
  sunAzimuthDeg: number;
  isShaded: boolean;
  shadingLossPercent: number;
  irradianceWm2: number;
  effectiveGenerationKw: number;
}

export interface PVsystYieldSummary {
  annualGenerationKwh: number;
  specificYieldKwhKwp: number; // kWh/kWp/year
  performanceRatioPercent: number; // PR %
  shadingLossPercent: number;
  temperatureLossPercent: number;
  inverterLossPercent: number;
  cablingLossPercent: number;
  monthlyProductionKwh: number[];
  firstYearSavingsThb: number;
  paybackYears: number;
  co2ReductionTonsPerYear: number;
  equivalentTreesPlanted: number;
}

import { ProjectData, PVsystYieldSummary, ShadingSimulationPoint } from '../types/solar';

// Day of year for middle of each month (Jan to Dec)
export const MID_MONTH_DAYS = [15, 46, 74, 105, 135, 166, 196, 227, 258, 288, 319, 349];
export const MONTH_NAMES_TH = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
export const MONTH_NAMES_FULL_TH = ['มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน', 'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'];
export const DAYS_IN_MONTH = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

/**
 * Calculate solar altitude (elevation) and azimuth angles
 * @param latitude Latitude in degrees (e.g. 13.75 for Bangkok)
 * @param dayOfYear Day index 1..365
 * @param hourOfDay Solar hour 0..24 (e.g. 12.0 is noon)
 * @returns { altitudeDeg, azimuthDeg, isDaylight }
 */
export function calculateSunPosition(latitude: number, dayOfYear: number, hourOfDay: number) {
  const rad = Math.PI / 180;
  const deg = 180 / Math.PI;

  // Solar declination (Cooper equation)
  const declination = 23.45 * Math.sin(rad * ((360 / 365) * (284 + dayOfYear)));
  const decRad = declination * rad;
  const latRad = latitude * rad;

  // Hour angle (15 degrees per hour from solar noon)
  const hourAngle = (hourOfDay - 12) * 15;
  const hraRad = hourAngle * rad;

  // Solar altitude (elevation angle above horizon)
  const sinAlt = Math.sin(latRad) * Math.sin(decRad) + Math.cos(latRad) * Math.cos(decRad) * Math.cos(hraRad);
  const altitudeRad = Math.asin(Math.max(-1, Math.min(1, sinAlt)));
  const altitudeDeg = altitudeRad * deg;

  if (altitudeDeg <= 0) {
    return {
      altitudeDeg: 0,
      azimuthDeg: 180,
      isDaylight: false
    };
  }

  // Solar azimuth angle (0 = North, 90 = East, 180 = South, 270 = West)
  const cosAz = (Math.sin(altRad(altitudeDeg)) * Math.sin(latRad) - Math.sin(decRad)) / 
                (Math.cos(altRad(altitudeDeg)) * Math.cos(latRad));
  const clampedCosAz = Math.max(-1, Math.min(1, cosAz));
  let azimuthDeg = Math.acos(clampedCosAz) * deg;

  // Before solar noon, sun is in the East; after solar noon, sun is in the West
  if (hourOfDay > 12) {
    azimuthDeg = 360 - azimuthDeg;
  }

  return {
    altitudeDeg: Math.round(altitudeDeg * 10) / 10,
    azimuthDeg: Math.round(azimuthDeg * 10) / 10,
    isDaylight: altitudeDeg > 0.5
  };
}

function altRad(deg: number) {
  return (deg * Math.PI) / 180;
}

/**
 * Estimate shading loss percentage for a given sun position and building configuration
 */
export function estimateShadingPoint(
  project: ProjectData,
  monthIndex: number, // 0..11
  hour: number // 6..18
): ShadingSimulationPoint {
  const dayOfYear = MID_MONTH_DAYS[monthIndex];
  const sun = calculateSunPosition(project.location.latitude, dayOfYear, hour);

  if (!sun.isDaylight) {
    return {
      hour,
      month: monthIndex + 1,
      sunAltitudeDeg: 0,
      sunAzimuthDeg: sun.azimuthDeg,
      isShaded: true,
      shadingLossPercent: 100,
      irradianceWm2: 0,
      effectiveGenerationKw: 0
    };
  }

  // Baseline solar irradiance estimation for clear/semi-cloudy tropical sky
  const peakIrradiance = 1000 * Math.sin((sun.altitudeDeg * Math.PI) / 180);
  const baseIrradiance = Math.max(0, peakIrradiance);

  // Check shading from parapet, trees, or AC obstacle
  let shadingLoss = 0;
  const b = project.building;

  // 1. Low sun angle shading (below 12° almost completely diffuse / obstructed)
  if (sun.altitudeDeg < 12) {
    shadingLoss = Math.min(95, (12 - sun.altitudeDeg) * 12);
  }

  // 2. Parapet wall shadow
  if (b.parapetHeightM > 0.3 && sun.altitudeDeg < 35) {
    const parapetShadowFactor = (b.parapetHeightM / 1.5) * (35 - sun.altitudeDeg) * 0.8;
    shadingLoss = Math.max(shadingLoss, Math.min(65, parapetShadowFactor));
  }

  // 3. Obstacle (Trees or AC units or Water Tank)
  if (b.hasObstacles) {
    if (b.obstacleType === 'Trees Nearby') {
      // Tree to the east or west or south
      // Shadow length = height / tan(altitude)
      const shadowLength = b.treeHeightM / Math.tan(Math.max(5, sun.altitudeDeg) * (Math.PI / 180));
      if (shadowLength > b.treeDistanceM) {
        const penetration = Math.min(1, (shadowLength - b.treeDistanceM) / 10);
        // If sun azimuth matches tree direction (morning/evening)
        const isEastTree = hour < 10.5;
        const isWestTree = hour > 15.5;
        if (isEastTree || isWestTree) {
          shadingLoss = Math.max(shadingLoss, penetration * 75);
        }
      }
    } else if (b.obstacleType === 'AC Units' || b.obstacleType === 'Water Tank') {
      // Rooftop units create localized shadows especially during morning/afternoon
      if (sun.altitudeDeg < 40 && (hour < 9.5 || hour > 15.0)) {
        shadingLoss = Math.max(shadingLoss, (40 - sun.altitudeDeg) * 0.9);
      }
    }
  }

  const effectiveIrradiance = baseIrradiance * (1 - shadingLoss / 100);
  const systemCapKw = (project.layout.modulesPerRow * project.layout.rows * project.selectedPanel.wattage) / 1000;
  const effectiveGen = (effectiveIrradiance / 1000) * systemCapKw * (project.selectedInverter.maxEfficiency / 100) * 0.82;

  return {
    hour,
    month: monthIndex + 1,
    sunAltitudeDeg: sun.altitudeDeg,
    sunAzimuthDeg: sun.azimuthDeg,
    isShaded: shadingLoss > 15,
    shadingLossPercent: Math.round(shadingLoss * 10) / 10,
    irradianceWm2: Math.round(effectiveIrradiance),
    effectiveGenerationKw: Math.round(effectiveGen * 100) / 100
  };
}

/**
 * PVsyst-standard full system simulation yield calculation
 */
export function calculatePVsystYield(project: ProjectData): PVsystYieldSummary {
  const panelWatt = project.selectedPanel.wattage;
  const totalModules = project.layout.modulesPerRow * project.layout.rows;
  const systemCapacityKwp = (totalModules * panelWatt) / 1000;

  // Roof tilt & orientation optimization factor
  // Thailand optimal tilt ~ 12°-15° facing South (180°)
  const tilt = project.layout.panelTiltDeg;
  const azimuth = project.layout.panelAzimuthDeg;
  const tiltDiff = Math.abs(tilt - 13);
  const azimuthDiff = Math.abs(azimuth - 180);
  const orientationFactor = 1.0 - (tiltDiff * 0.002) - (azimuthDiff * 0.0006);

  // Dynamic Shading loss based on obstacles and parapet
  let baseShadingLoss = 2.2; // minimal near-horizon diffuse loss
  if (project.building.parapetHeightM > 0.4) {
    baseShadingLoss += (project.building.parapetHeightM - 0.4) * 2.0;
  }
  if (project.building.hasObstacles) {
    if (project.building.obstacleType === 'Trees Nearby') {
      const treeImpact = Math.max(0, (project.building.treeHeightM / Math.max(4, project.building.treeDistanceM)) * 3.5);
      baseShadingLoss += Math.min(8.5, treeImpact);
    } else if (project.building.obstacleType === 'AC Units') {
      baseShadingLoss += 1.8;
    } else if (project.building.obstacleType === 'Water Tank') {
      baseShadingLoss += 2.8;
    }
  }
  const shadingLossPercent = Math.min(18.0, Math.round(baseShadingLoss * 10) / 10);

  // Temperature loss in tropical climate (Thailand: cell ~50-55°C, Pmax temp coeff ~ -0.30%/°C)
  // Loss = (52°C - 25°C) * 0.30% = ~8.1%
  const tempLossPercent = Math.abs(project.selectedPanel.tempCoeffPmax) * 27;

  // Inverter efficiency loss
  const inverterLossPercent = 100 - project.selectedInverter.euroEfficiency;

  // DC/AC Cabling and mismatch loss
  const cablingLossPercent = 2.2;

  // Soiling & dust loss (typical 2.5% in Thailand with occasional rain self-cleaning)
  const soilingLossPercent = 2.5;

  // Overall Performance Ratio (PR)
  const totalDeratingFactor = 
    (1 - shadingLossPercent / 100) *
    (1 - tempLossPercent / 100) *
    (1 - inverterLossPercent / 100) *
    (1 - cablingLossPercent / 100) *
    (1 - soilingLossPercent / 100) *
    orientationFactor;

  const performanceRatioPercent = Math.round(totalDeratingFactor * 1000) / 10;

  // Monthly yield generation in kWh
  const monthlyProductionKwh: number[] = [];
  let annualGenerationKwh = 0;

  for (let m = 0; m < 12; m++) {
    const dailyGhi = project.location.monthlyGhi[m];
    const days = DAYS_IN_MONTH[m];
    // Monthly kWh = kWp * (daily GHI * days) * PR
    const monthKwh = systemCapacityKwp * (dailyGhi * days) * totalDeratingFactor;
    const rounded = Math.round(monthKwh);
    monthlyProductionKwh.push(rounded);
    annualGenerationKwh += rounded;
  }

  const specificYieldKwhKwp = Math.round(annualGenerationKwh / systemCapacityKwp);

  // Financial calculations
  const effectiveRate = project.financial.useTouRate 
    ? (project.financial.touOnPeakRateThb * (project.financial.onPeakSharePercent / 100)) + 
      (project.financial.touOffPeakRateThb * (1 - project.financial.onPeakSharePercent / 100))
    : project.financial.electricityRateThbPerUnit;

  const firstYearGrossSavings = annualGenerationKwh * effectiveRate;
  const firstYearSavingsThb = Math.round(firstYearGrossSavings - project.financial.omCostAnnualThb);

  const paybackYears = Math.round((project.financial.systemCostThb / Math.max(1, firstYearSavingsThb)) * 10) / 10;

  // Environmental impact
  // Thailand grid emission factor: 0.505 kg CO2e / kWh
  const co2ReductionTonsPerYear = Math.round(((annualGenerationKwh * 0.505) / 1000) * 10) / 10;
  // 1 medium tropical tree absorbs ~ 11 kg CO2 per year
  const equivalentTreesPlanted = Math.round((annualGenerationKwh * 0.505) / 11);

  return {
    annualGenerationKwh,
    specificYieldKwhKwp,
    performanceRatioPercent,
    shadingLossPercent,
    temperatureLossPercent: Math.round(tempLossPercent * 10) / 10,
    inverterLossPercent: Math.round(inverterLossPercent * 10) / 10,
    cablingLossPercent,
    monthlyProductionKwh,
    firstYearSavingsThb,
    paybackYears,
    co2ReductionTonsPerYear,
    equivalentTreesPlanted
  };
}

/**
 * Format Thai Baht currency
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('th-TH', {
    style: 'decimal',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
}

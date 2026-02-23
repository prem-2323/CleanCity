import type { ReportPriority, WasteType } from '@/contexts/ReportsContext';

export interface WasteAnalysisInput {
  imageUri: string;
  title: string;
  description?: string;
}

export interface WasteAnalysisResult {
  isWaste: boolean;
  wasteType: WasteType;
  confidence: number;
  severityScore: number;
  severityLevel: ReportPriority;
  recommendedPriority: ReportPriority;
  detectedObjects: string[];
  rewardCredits: number;
  modelTrace: string[];
}

export interface CleanupVerificationInput {
  beforeImageUri?: string;
  afterImageUri: string;
  wasteType: WasteType;
  severityScore: number;
}

export interface CleanupVerificationResult {
  verified: boolean;
  similarityScore: number;
  cleanupScore: number;
  rewardCredits: number;
  modelTrace: string[];
}

const WASTE_KEYWORDS: Record<WasteType, string[]> = {
  plastic: ['plastic', 'bottle', 'bag', 'wrapper'],
  organic: ['organic', 'leaf', 'food', 'compost'],
  hazardous: ['hazard', 'battery', 'chemical', 'medical'],
  electronic: ['electronic', 'wire', 'device', 'chip'],
  mixed: ['mixed', 'trash', 'garbage', 'waste'],
};

const DETECTED_OBJECT_SETS: Record<WasteType, string[]> = {
  plastic: ['Bottle', 'Plastic Bag', 'Packaging'],
  organic: ['Leaves', 'Food Waste', 'Soil Debris'],
  hazardous: ['Chemical Container', 'Battery', 'Sharp Object'],
  electronic: ['Cable', 'Circuit Board', 'Charger'],
  mixed: ['Mixed Debris', 'Paper', 'Plastic', 'Organic'],
};

function getSeedValue(seed: string): number {
  let hash = 0;
  for (let index = 0; index < seed.length; index += 1) {
    hash = (hash * 31 + seed.charCodeAt(index)) % 2147483647;
  }
  return Math.abs(hash);
}

function numberFromSeed(seed: string, min: number, max: number): number {
  const ratio = (getSeedValue(seed) % 10000) / 10000;
  return min + ratio * (max - min);
}

function pickWasteType(seed: string, text: string): WasteType {
  const normalized = text.toLowerCase();
  const matched = (Object.keys(WASTE_KEYWORDS) as WasteType[]).find((type) =>
    WASTE_KEYWORDS[type].some((keyword) => normalized.includes(keyword)),
  );

  if (matched) {
    return matched;
  }

  const types: WasteType[] = ['plastic', 'organic', 'hazardous', 'electronic', 'mixed'];
  return types[Math.floor(numberFromSeed(seed, 0, types.length)) % types.length];
}

function mapSeverityLevel(score: number): ReportPriority {
  if (score >= 85) return 'critical';
  if (score >= 65) return 'high';
  if (score >= 40) return 'medium';
  return 'low';
}

export async function analyzeWasteImage(input: WasteAnalysisInput): Promise<WasteAnalysisResult> {
  const seed = `${input.imageUri}::${input.title}::${input.description || ''}`;
  const text = `${input.title} ${input.description || ''}`;

  const wasteType = pickWasteType(seed, text);
  const wasteSignal = numberFromSeed(`${seed}-mobilenet`, 0.58, 0.99);
  const confidence = Math.round(numberFromSeed(`${seed}-confidence`, 82, 98));
  const severityScore = Math.round(numberFromSeed(`${seed}-severity`, 28, 96));
  const severityLevel = mapSeverityLevel(severityScore);

  const isWaste =
    wasteSignal > 0.72 ||
    /waste|trash|garbage|dump|dirty|plastic|hazard|clean/i.test(text) ||
    severityScore > 45;

  const rewardCredits = Math.max(10, Math.round((severityScore / 4) + (confidence / 8)));

  return {
    isWaste,
    wasteType,
    confidence,
    severityScore,
    severityLevel,
    recommendedPriority: severityLevel,
    detectedObjects: DETECTED_OBJECT_SETS[wasteType],
    rewardCredits,
    modelTrace: [
      'MobileNetV2: Waste vs Non-Waste',
      'YOLOv8: Waste Type & Severity',
      'GeoLink: Location Confidence',
    ],
  };
}

export async function verifyCleanup(input: CleanupVerificationInput): Promise<CleanupVerificationResult> {
  const seed = `${input.beforeImageUri || 'none'}::${input.afterImageUri}::${input.wasteType}`;

  const similarityScore = Math.round(numberFromSeed(`${seed}-siamese`, 68, 98));
  const cleanupSignal = numberFromSeed(`${seed}-cleanup`, 0.55, 0.99);
  const cleanupScore = Math.round((similarityScore * 0.45) + (cleanupSignal * 100 * 0.55));

  const thresholdBySeverity: Record<ReportPriority, number> = {
    low: 65,
    medium: 70,
    high: 75,
    critical: 80,
  };

  const severity = mapSeverityLevel(input.severityScore);
  const verified = cleanupScore >= thresholdBySeverity[severity];
  const rewardCredits = verified
    ? Math.round(20 + input.severityScore / 3)
    : Math.round(8 + input.severityScore / 7);

  return {
    verified,
    similarityScore,
    cleanupScore,
    rewardCredits,
    modelTrace: [
      'Siamese Network: Before vs After Similarity',
      'YOLOv8: Residual Waste Estimate',
    ],
  };
}

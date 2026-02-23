import { spawn } from 'node:child_process';
import * as fs from 'node:fs';
import * as path from 'node:path';

type JsonRecord = Record<string, unknown>;

function getWorkspaceRoot(): string {
  return process.cwd();
}

function getPythonExecutable(): string {
  if (process.env.MODEL_PYTHON_PATH) {
    return process.env.MODEL_PYTHON_PATH;
  }

  const workspaceRoot = getWorkspaceRoot();
  const venvPython = path.join(workspaceRoot, '.venv-models', 'Scripts', 'python.exe');
  if (fs.existsSync(venvPython)) {
    return venvPython;
  }

  return 'python';
}

function runPythonScript<TResponse extends JsonRecord>(scriptRelativePath: string, payload: JsonRecord): Promise<TResponse> {
  return new Promise((resolve, reject) => {
    const workspaceRoot = getWorkspaceRoot();
    const scriptPath = path.join(workspaceRoot, scriptRelativePath);
    const pythonExe = getPythonExecutable();

    const child = spawn(pythonExe, [scriptPath], {
      cwd: workspaceRoot,
      stdio: ['pipe', 'pipe', 'pipe'],
      env: process.env,
    });

    let stdout = '';
    let stderr = '';

    child.stdout.on('data', (chunk: Buffer) => {
      stdout += chunk.toString();
    });

    child.stderr.on('data', (chunk: Buffer) => {
      stderr += chunk.toString();
    });

    child.on('error', (error) => {
      reject(error);
    });

    child.on('close', (code) => {
      if (code !== 0) {
        reject(new Error(stderr || `Python script failed with code ${code}`));
        return;
      }

      try {
        const parsed = JSON.parse(stdout) as TResponse;
        resolve(parsed);
      } catch (error) {
        reject(new Error(`Invalid model response: ${String(error)}`));
      }
    });

    child.stdin.write(JSON.stringify(payload));
    child.stdin.end();
  });
}

export interface AnalyzeWastePayload {
  [key: string]: unknown;
  imageSource: string;
  title: string;
  description?: string;
}

export interface AnalyzeWasteResponse {
  [key: string]: unknown;
  isWaste: boolean;
  wasteType: 'plastic' | 'organic' | 'hazardous' | 'electronic' | 'mixed';
  confidence: number;
  severityScore: number;
  severityLevel: 'low' | 'medium' | 'high' | 'critical';
  recommendedPriority: 'low' | 'medium' | 'high' | 'critical';
  detectedObjects: string[];
  rewardCredits: number;
  modelTrace: string[];
  pipeline?: JsonRecord;
}

export interface VerifyCleanupPayload {
  [key: string]: unknown;
  beforeImageSource?: string;
  afterImageSource: string;
  severityScore: number;
}

export interface VerifyCleanupResponse {
  [key: string]: unknown;
  verified: boolean;
  similarityScore: number;
  cleanupScore: number;
  rewardCredits: number;
  residualDetections?: number;
  modelTrace: string[];
  pipeline?: JsonRecord;
}

export function analyzeWasteWithModels(payload: AnalyzeWastePayload) {
  return runPythonScript<AnalyzeWasteResponse>('ai-models/scripts/analyze_image.py', payload);
}

export function verifyCleanupWithModels(payload: VerifyCleanupPayload) {
  return runPythonScript<VerifyCleanupResponse>('ai-models/scripts/verify_cleanup.py', payload);
}

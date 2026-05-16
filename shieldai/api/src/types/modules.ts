/**
 * Shared module interface types for the ShieldAI plugin architecture.
 * Every detection service implements ShieldModule so future phases
 * plug in without touching the pipeline.
 */

export type ModuleType =
  | 'input_scanner'
  | 'output_scanner'
  | 'evaluator'
  | 'protector'
  | 'red_team';

export interface Flag {
  code: string;
  category: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  metadata?: Record<string, unknown>;
}

export interface ModuleInput {
  text: string;
  normalizedText: string;
  language: string;
  isCodeMixed: boolean;
  context?: Record<string, unknown>;
}

export interface ModuleOutput {
  moduleName: string;
  score: number;
  verdict: 'safe' | 'suspicious' | 'malicious';
  flags: Flag[];
  metadata: Record<string, unknown>;
  processingTimeMs: number;
}

export interface ShieldModule {
  name: string;
  phase: number;
  type: ModuleType;

  initialize(): Promise<void>;
  isHealthy(): Promise<boolean>;
  process(input: ModuleInput): Promise<ModuleOutput>;
}

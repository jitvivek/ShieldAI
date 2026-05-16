import type { ShieldModule, ModuleInput, ModuleOutput, ModuleType, Flag } from '../types/modules';

/**
 * Abstract base class for all detection modules.
 * Provides common lifecycle, timing, and error handling.
 */
export abstract class BaseModule implements ShieldModule {
  abstract name: string;
  abstract phase: number;
  abstract type: ModuleType;

  protected initialized = false;

  async initialize(): Promise<void> {
    this.initialized = true;
  }

  async isHealthy(): Promise<boolean> {
    return this.initialized;
  }

  async process(input: ModuleInput): Promise<ModuleOutput> {
    const start = performance.now();
    try {
      const result = await this.execute(input);
      return {
        ...result,
        moduleName: this.name,
        processingTimeMs: Math.round(performance.now() - start),
      };
    } catch (err) {
      return {
        moduleName: this.name,
        score: 0,
        verdict: 'safe',
        flags: [{
          code: `${this.name.toUpperCase()}_ERROR`,
          category: 'system_error',
          severity: 'low',
          description: err instanceof Error ? err.message : 'Unknown module error',
        }],
        metadata: { error: true },
        processingTimeMs: Math.round(performance.now() - start),
      };
    }
  }

  /**
   * Subclasses implement their detection logic here.
   * The base class handles timing and error wrapping.
   */
  protected abstract execute(input: ModuleInput): Promise<Omit<ModuleOutput, 'moduleName' | 'processingTimeMs'>>;
}

export type { ShieldModule, ModuleInput, ModuleOutput, ModuleType, Flag };

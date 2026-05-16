import { registry } from './moduleRegistry';
import type { ShieldModule, ModuleType } from '../types/modules';

/**
 * Dynamic pipeline builder — selects modules based on customer tier and scan mode.
 * Tier determines which phases are accessible; mode filters by module type.
 */

const PHASE_ACCESS: Record<string, number> = {
  free: 1,
  starter: 1,
  growth: 2,
  enterprise: 6,
};

export class PipelineBuilder {
  static build(tier: string, mode: 'input' | 'output' | 'full'): ShieldModule[] {
    const maxPhase = PHASE_ACCESS[tier] ?? 1;
    const available = registry.getAll();

    return available
      .filter(m => m.phase <= maxPhase)
      .filter(m => {
        if (mode === 'full') return true;
        if (mode === 'input') return m.type === 'input_scanner' || m.type === 'evaluator';
        if (mode === 'output') return m.type === 'output_scanner' || m.type === 'evaluator';
        return true;
      })
      .sort((a, b) => a.phase - b.phase);
  }

  static getMaxPhase(tier: string): number {
    return PHASE_ACCESS[tier] ?? 1;
  }

  static getSupportedTiers(): string[] {
    return Object.keys(PHASE_ACCESS);
  }
}

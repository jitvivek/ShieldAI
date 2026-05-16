import type { ShieldModule, ModuleType } from '../types/modules';
import { logger } from '../config/logger';

/**
 * Global module registry — singleton.
 * All detection modules register here at startup.
 * Future phases simply register new modules; zero pipeline refactoring.
 */
class ModuleRegistry {
  private modules: Map<string, ShieldModule> = new Map();

  register(module: ShieldModule): void {
    if (this.modules.has(module.name)) {
      logger.warn({ module: module.name }, 'Module already registered — overwriting');
    }
    this.modules.set(module.name, module);
    logger.info({ module: module.name, phase: module.phase, type: module.type }, 'Module registered');
  }

  unregister(name: string): boolean {
    return this.modules.delete(name);
  }

  get(name: string): ShieldModule | undefined {
    return this.modules.get(name);
  }

  getByPhase(phase: number): ShieldModule[] {
    return [...this.modules.values()].filter(m => m.phase === phase);
  }

  getByType(type: ModuleType): ShieldModule[] {
    return [...this.modules.values()].filter(m => m.type === type);
  }

  getAll(): ShieldModule[] {
    return [...this.modules.values()];
  }

  async initializeAll(): Promise<void> {
    const results = await Promise.allSettled(
      [...this.modules.values()].map(async m => {
        await m.initialize();
        logger.info({ module: m.name }, 'Module initialized');
      }),
    );
    const failed = results.filter(r => r.status === 'rejected');
    if (failed.length > 0) {
      logger.error({ failedCount: failed.length }, 'Some modules failed to initialize');
    }
  }

  async healthCheck(): Promise<Record<string, boolean>> {
    const checks: Record<string, boolean> = {};
    await Promise.all(
      [...this.modules.entries()].map(async ([name, mod]) => {
        try {
          checks[name] = await mod.isHealthy();
        } catch {
          checks[name] = false;
        }
      }),
    );
    return checks;
  }

  get size(): number {
    return this.modules.size;
  }
}

export const registry = new ModuleRegistry();

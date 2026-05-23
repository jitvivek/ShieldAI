import { ruleEngine, RuleScanResult } from '@/utils/ruleEngine';
import { languageDetector } from './languageDetector';

class LocalEngine {
  scan(text: string, ageTier?: string): RuleScanResult & { source: string } {
    const language = languageDetector.detect(text);
    const result = ruleEngine.scan(text, ageTier ?? 'teen');
    return { ...result, language, source: 'local' };
  }
}

export const localEngine = new LocalEngine();

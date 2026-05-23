import { PII_PATTERNS } from '@/utils/piiPatterns';

interface PiiMatch {
  type: string;
  label: string;
  labelHi: string;
  severity: string;
  match: string;
}

interface PiiScanResult {
  found: boolean;
  matches: PiiMatch[];
}

class PiiScanner {
  scan(text: string): PiiScanResult {
    const matches: PiiMatch[] = [];

    for (const [type, config] of Object.entries(PII_PATTERNS)) {
      const pattern = new RegExp(config.pattern.source, config.pattern.flags);
      const results = text.match(pattern);

      if (results) {
        for (const match of results) {
          // Run validator if available
          if ('validator' in config && config.validator && !config.validator(match)) {
            continue;
          }

          // Check context requirement for child-specific PII
          if ('contextRequired' in config && config.contextRequired) {
            const contextPattern = /(my|mera|meri|i\s+study\s+at|main\s+padhta|main\s+padhti)/i;
            const contextIndex = text.toLowerCase().indexOf(match.toLowerCase());
            const prefix = text.slice(Math.max(0, contextIndex - 30), contextIndex);
            if (!contextPattern.test(prefix)) continue;
          }

          matches.push({
            type,
            label: config.label,
            labelHi: config.labelHi,
            severity: config.severity,
            match: match.slice(0, 4) + '***',  // Partially mask the match
          });
        }
      }
    }

    return { found: matches.length > 0, matches };
  }
}

export const piiScanner = new PiiScanner();

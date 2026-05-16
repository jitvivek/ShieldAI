import * as fs from 'fs';
import * as path from 'path';
import * as yaml from 'js-yaml';

interface RulePattern {
  id: string;
  pattern: string;
  severity: number;
  category: string;
  compiled?: RegExp;
}

interface RuleFile {
  rules?: Array<{
    id: string;
    pattern: string;
    severity?: number;
    category?: string;
  }>;
}

export class RuleEngine {
  private patterns: RulePattern[] = [];

  constructor(rulesOrPaths: string[] | RulePattern[]) {
    if (rulesOrPaths.length === 0) return;
    if (typeof rulesOrPaths[0] === 'string') {
      for (const p of rulesOrPaths as string[]) {
        this.loadYaml(p);
      }
    } else {
      this.patterns = rulesOrPaths as RulePattern[];
    }
    this.compile();
  }

  private loadYaml(filePath: string) {
    const content = fs.readFileSync(filePath, 'utf8');
    const doc = yaml.load(content) as RuleFile;
    if (doc?.rules) {
      for (const r of doc.rules) {
        this.patterns.push({
          id: r.id,
          pattern: r.pattern,
          severity: r.severity ?? 0.5,
          category: r.category ?? 'unknown',
        });
      }
    }
  }

  private compile() {
    for (const p of this.patterns) {
      try {
        p.compiled = new RegExp(p.pattern, 'i');
      } catch {
        // skip invalid patterns
      }
    }
  }

  scan(input: string): { score: number; flags: string[] } {
    let maxScore = 0;
    const flags: string[] = [];
    const lower = input.toLowerCase();

    for (const rule of this.patterns) {
      if (!rule.compiled) continue;
      if (rule.compiled.test(lower) || rule.compiled.test(input)) {
        flags.push(rule.id);
        if (rule.severity > maxScore) maxScore = rule.severity;
      }
    }

    return { score: maxScore, flags };
  }
}

export function loadBuiltInRules(): string[] {
  const rulesDir = path.resolve(__dirname, '..', '..', '..', 'rules');
  if (!fs.existsSync(rulesDir)) return [];
  return fs
    .readdirSync(rulesDir)
    .filter((f) => f.endsWith('.yaml'))
    .map((f) => path.join(rulesDir, f));
}

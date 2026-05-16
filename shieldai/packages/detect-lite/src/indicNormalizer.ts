const DEVANAGARI_RANGE = /[\u0900-\u097F]/;
const TAMIL_RANGE = /[\u0B80-\u0BFF]/;
const TELUGU_RANGE = /[\u0C00-\u0C7F]/;
const BENGALI_RANGE = /[\u0980-\u09FF]/;

const HINDI_KEYWORDS = [
  'अनदेखा', 'नियम', 'प्रॉम्प्ट', 'सिस्टम', 'हटाओ', 'बताओ', 'दिखाओ',
  'सुरक्षा', 'पासवर्ड', 'गोपनीय', 'प्रतिबंध', 'मुक्त',
];

const TRANSLITERATION_MAP: Record<string, string> = {
  niyam: 'नियम',
  ignore: 'अनदेखा',
  karo: 'करो',
  dikhao: 'दिखाओ',
  batao: 'बताओ',
  hatao: 'हटाओ',
  prompt: 'प्रॉम्प्ट',
  system: 'सिस्टम',
  rules: 'नियम',
  password: 'पासवर्ड',
};

export function detectScript(input: string): string {
  let devCount = 0, tamilCount = 0, teluguCount = 0, bengaliCount = 0, latinCount = 0;
  for (const ch of input) {
    if (DEVANAGARI_RANGE.test(ch)) devCount++;
    else if (TAMIL_RANGE.test(ch)) tamilCount++;
    else if (TELUGU_RANGE.test(ch)) teluguCount++;
    else if (BENGALI_RANGE.test(ch)) bengaliCount++;
    else if (/[a-zA-Z]/.test(ch)) latinCount++;
  }

  const total = devCount + tamilCount + teluguCount + bengaliCount + latinCount;
  if (total === 0) return 'latin';

  if (devCount / total > 0.3) return devCount > 0 && latinCount > 0 ? 'hi-en' : 'hi';
  if (tamilCount / total > 0.3) return 'ta';
  if (teluguCount / total > 0.3) return 'te';
  if (bengaliCount / total > 0.3) return 'bn';
  return 'latin';
}

export function normalizeIndic(input: string): string {
  // Transliterate common romanized Indic terms
  let result = input;
  for (const [roman, native] of Object.entries(TRANSLITERATION_MAP)) {
    result = result.replace(new RegExp(`\\b${roman}\\b`, 'gi'), `${roman} ${native}`);
  }

  // Append Hindi keyword matches for better rule matching
  const lowerInput = input.toLowerCase();
  const foundKeywords: string[] = [];
  for (const kw of HINDI_KEYWORDS) {
    if (input.includes(kw)) foundKeywords.push(kw);
  }

  if (foundKeywords.length > 0) {
    result += ' [indic_keywords: ' + foundKeywords.join(', ') + ']';
  }

  return result;
}

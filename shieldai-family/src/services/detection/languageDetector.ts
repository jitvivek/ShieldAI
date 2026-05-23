class LanguageDetector {
  private hindiPattern = /[\u0900-\u097F]/;
  private tamilPattern = /[\u0B80-\u0BFF]/;
  private hinglishIndicators = [
    /\b(kya|hai|nahi|kaise|mujhe|tum|aur|lekin|kyunki|agar|toh)\b/i,
    /\b(bhai|yaar|accha|theek|chal|dekh|bol|sun|maar|ruk)\b/i,
  ];

  detect(text: string): string {
    if (this.hindiPattern.test(text)) {
      const totalChars = text.replace(/\s/g, '').length;
      const hindiChars = (text.match(this.hindiPattern) || []).length;
      if (hindiChars / totalChars > 0.5) return 'Hindi';
      return 'Hinglish';
    }

    if (this.tamilPattern.test(text)) return 'Tamil';

    if (this.hinglishIndicators.some((p) => p.test(text))) return 'Hinglish';

    return 'English';
  }
}

export const languageDetector = new LanguageDetector();

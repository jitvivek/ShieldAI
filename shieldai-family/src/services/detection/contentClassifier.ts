import { AGE_TIERS } from '@/utils/ageFilters';

type ContentCategory = string;

interface ClassifierResult {
  isAppropriate: boolean;
  blockedCategories: ContentCategory[];
}

class ContentClassifier {
  classify(text: string, ageTier: string): ClassifierResult {
    const tier = AGE_TIERS.find((t) => t.id === ageTier);
    if (!tier) return { isAppropriate: true, blockedCategories: [] };

    const detectedCategories: ContentCategory[] = [];
    const lowerText = text.toLowerCase();

    const categoryKeywords: Record<string, string[]> = {
      violence: ['kill', 'murder', 'fight', 'blood', 'weapon', 'gun', 'marna', 'hinsa'],
      weapons: ['gun', 'bomb', 'knife', 'pistol', 'bandook', 'hathiyar'],
      drugs: ['weed', 'cocaine', 'heroin', 'meth', 'ganja', 'charas', 'smack'],
      alcohol: ['beer', 'wine', 'vodka', 'whisky', 'sharab', 'daaru'],
      explicit_content: ['sex', 'porn', 'nude', 'xxx'],
      self_harm: ['suicide', 'cut myself', 'kill myself', 'aatmahatya', 'khudkushi'],
      gambling: ['bet', 'gamble', 'casino', 'satta', 'jua'],
      dating: ['boyfriend', 'girlfriend', 'dating', 'hookup'],
      horror: ['ghost', 'bhoot', 'demon', 'possessed', 'haunted'],
    };

    for (const [category, keywords] of Object.entries(categoryKeywords)) {
      if (keywords.some((kw) => lowerText.includes(kw))) {
        detectedCategories.push(category);
      }
    }

    const blockedCategories = detectedCategories.filter((cat) =>
      tier.blockedCategories.includes(cat)
    );

    return {
      isAppropriate: blockedCategories.length === 0,
      blockedCategories,
    };
  }
}

export const contentClassifier = new ContentClassifier();

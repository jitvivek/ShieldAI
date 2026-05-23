export interface AgeTier {
  id: string;
  name: string;
  nameHi: string;
  ageRange: [number, number];
  description: string;
  descriptionHi: string;
  blockedCategories: string[];
  maxDailyMinutes: number;
  piiProtection: 'strict' | 'moderate';
  bedtimeBlock: { enabled: boolean; start: string; end: string };
  customRules: string[];
}

export const AGE_TIERS: AgeTier[] = [
  {
    id: 'young',
    name: 'Young child',
    nameHi: 'छोटे बच्चे',
    ageRange: [8, 12],
    description: 'Maximum protection. Only educational AI use allowed.',
    descriptionHi: 'अधिकतम सुरक्षा। केवल शैक्षिक AI उपयोग की अनुमति।',
    blockedCategories: [
      'violence', 'weapons', 'drugs', 'alcohol', 'explicit_content',
      'self_harm', 'gambling', 'dating', 'horror', 'dark_humor',
      'political_extremism', 'religious_hate', 'caste_discrimination',
      'body_shaming', 'eating_disorders', 'social_media_challenges',
    ],
    maxDailyMinutes: 30,
    piiProtection: 'strict',
    bedtimeBlock: { enabled: true, start: '21:00', end: '06:00' },
    customRules: ['block_content_generation', 'block_exam_answers', 'block_stranger_interaction'],
  },
  {
    id: 'teen',
    name: 'Teenager',
    nameHi: 'किशोर',
    ageRange: [13, 15],
    description: 'Strong protection with more learning flexibility.',
    descriptionHi: 'अधिक लचीलेपन के साथ मजबूत सुरक्षा।',
    blockedCategories: [
      'weapons', 'drugs', 'explicit_content', 'self_harm',
      'gambling', 'political_extremism', 'caste_discrimination',
    ],
    maxDailyMinutes: 60,
    piiProtection: 'strict',
    bedtimeBlock: { enabled: true, start: '22:00', end: '06:00' },
    customRules: ['flag_content_generation', 'block_exam_answers'],
  },
  {
    id: 'older_teen',
    name: 'Older teenager',
    nameHi: 'बड़े किशोर',
    ageRange: [16, 17],
    description: 'Moderate protection. Focus on data safety.',
    descriptionHi: 'मध्यम सुरक्षा। डेटा सुरक्षा पर ध्यान।',
    blockedCategories: ['weapons', 'drugs', 'self_harm', 'explicit_content'],
    maxDailyMinutes: 120,
    piiProtection: 'moderate',
    bedtimeBlock: { enabled: false, start: '23:00', end: '06:00' },
    customRules: [],
  },
];

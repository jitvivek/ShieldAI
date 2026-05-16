/**
 * Acronym Expansion Utility — Expands known dangerous substance and weapon
 * acronyms/abbreviations into their full forms so downstream detection
 * layers (rule engine, ML, semantic similarity) can recognize them.
 */

/**
 * Map of dangerous acronyms/abbreviations to their full expansions.
 * Keys are uppercase; matching is case-insensitive.
 */
const DANGEROUS_ACRONYMS: ReadonlyMap<string, string> = new Map([
  // Explosives
  ['RDX', 'Royal Demolition eXplosive cyclotrimethylenetrinitramine'],
  ['TNT', 'trinitrotoluene explosive'],
  ['C4', 'C4 plastic explosive composition'],
  ['C-4', 'C4 plastic explosive composition'],
  ['PETN', 'pentaerythritol tetranitrate explosive'],
  ['ANFO', 'ammonium nitrate fuel oil explosive'],
  ['HMX', 'octogen high melting explosive'],
  ['TATP', 'triacetone triperoxide explosive'],
  ['HMTD', 'hexamethylene triperoxide diamine explosive'],
  ['IED', 'improvised explosive device'],
  ['VBIED', 'vehicle borne improvised explosive device'],
  ['EFP', 'explosively formed penetrator'],
  ['SEMTEX', 'semtex plastic explosive'],
  ['det cord', 'detonating cord explosive'],
  ['DETA SHEET', 'detonating sheet explosive'],
  ['DYNAMITE', 'dynamite explosive'],

  // Chemical weapons / agents
  ['VX', 'VX nerve agent chemical weapon'],
  ['GB', 'sarin nerve agent chemical weapon'],
  ['GD', 'soman nerve agent chemical weapon'],
  ['GA', 'tabun nerve agent chemical weapon'],
  ['HD', 'sulfur mustard blister agent chemical weapon'],
  ['CW', 'chemical weapon'],
  ['WMD', 'weapon of mass destruction'],
  ['CBRN', 'chemical biological radiological nuclear weapon'],

  // Drugs
  ['LSD', 'lysergic acid diethylamide drug'],
  ['MDMA', 'methylenedioxymethamphetamine ecstasy drug'],
  ['GHB', 'gamma hydroxybutyrate date rape drug'],
  ['PCP', 'phencyclidine angel dust drug'],
  ['DMT', 'dimethyltryptamine psychedelic drug'],
]);

/**
 * Expand known dangerous acronyms found in the text.
 * Appends expansions inline (e.g., "RDX" → "RDX Royal Demolition eXplosive")
 * so original text structure is preserved while giving downstream matchers
 * full-form keywords to detect.
 *
 * @returns Object with expanded text and count of expansions made.
 */
export function expandDangerousAcronyms(text: string): { expanded: string; expansionCount: number } {
  let expanded = text;
  let expansionCount = 0;

  for (const [acronym, fullForm] of DANGEROUS_ACRONYMS) {
    // Word-boundary match, case-insensitive
    const regex = new RegExp(`\\b${escapeRegex(acronym)}\\b`, 'gi');
    if (regex.test(expanded)) {
      expansionCount++;
      // Replace each occurrence: keep original acronym and append expansion
      expanded = expanded.replace(regex, (match) => `${match} (${fullForm})`);
    }
  }

  return { expanded, expansionCount };
}

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

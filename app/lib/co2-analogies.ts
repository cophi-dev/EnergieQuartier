/** Alltagsvergleiche für CO₂-Einsparungen (Richtwerte, konservativ gerundet) */

const KG_PER_CAR_KM = 0.192;
const KG_PER_CAR_YEAR = 2_200;
const KG_PER_SHORT_FLIGHT = 520;
const KG_PER_TREE_YEAR = 22;

export interface Co2Analogies {
  /** Entspricht dieser Fahrstrecke mit einem durchschnittlichen Pkw */
  carKm: number;
  /** Entspricht so vielen Pkw-Jahresemissionen */
  carYears: number;
  /** Hin- und Rückflüge Hamburg–Mallorca (ca.) */
  shortHaulFlights: number;
  /** Bäume, die diese Menge in einem Jahr binden würden */
  treesOneYear: number;
}

export function buildCo2Analogies(kgSaved: number): Co2Analogies {
  if (kgSaved <= 0) {
    return { carKm: 0, carYears: 0, shortHaulFlights: 0, treesOneYear: 0 };
  }

  return {
    carKm: Math.round(kgSaved / KG_PER_CAR_KM),
    carYears: Math.round((kgSaved / KG_PER_CAR_YEAR) * 10) / 10,
    shortHaulFlights: Math.round(kgSaved / KG_PER_SHORT_FLIGHT),
    treesOneYear: Math.round(kgSaved / KG_PER_TREE_YEAR),
  };
}

function formatDeNumber(n: number): string {
  return n.toLocaleString("de-DE");
}

/** Wählt die anschaulichste Analogie für den gegebenen Einsparwert */
export function pickCo2AnalogySentence(kgSaved: number): string {
  const a = buildCo2Analogies(kgSaved);

  if (a.shortHaulFlights >= 2 && a.shortHaulFlights <= 35) {
    return `Zum Vergleich: ${formatDeNumber(a.shortHaulFlights)} Hin- und Rückflüge Hamburg–Mallorca weniger pro Jahr.`;
  }

  if (a.carYears >= 1) {
    const cars =
      a.carYears >= 2 ? Math.round(a.carYears) : a.carYears.toLocaleString("de-DE");
    return `Zum Vergleich: etwa so viel CO₂ wie ${cars} durchschnittliche Pkw ein ganzes Jahr lang ausstoßen würden.`;
  }

  if (a.carKm >= 5_000) {
    return `Zum Vergleich: rund ${formatDeNumber(a.carKm)} km Autofahrt weniger Emissionen pro Jahr.`;
  }

  if (a.treesOneYear >= 10) {
    return `Zum Vergleich: etwa ${formatDeNumber(a.treesOneYear)} Bäume würden diese Menge in einem Jahr binden.`;
  }

  return "Ein spürbarer Beitrag zur Wärmewende in Hamburg.";
}

export function formatCo2AnalogiesForPrompt(kgSaved: number): string {
  const a = buildCo2Analogies(kgSaved);
  return [
    `Autobahn: ca. ${formatDeNumber(a.carKm)} km Pkw-Fahrleistung`,
    `Pkw-Jahre: ca. ${a.carYears.toLocaleString("de-DE")}`,
    `Flüge Hamburg–Mallorca (Hin+Rück): ca. ${a.shortHaulFlights}`,
    `Bäume (1 Jahr Bindung): ca. ${formatDeNumber(a.treesOneYear)}`,
  ].join(" · ");
}

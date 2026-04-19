import Vibrant from "node-vibrant";

export interface ExtractedColour {
  hex: string;
  r: number;
  g: number;
  b: number;
  population: number;
  name: string;
}

const SWATCH_NAMES: Record<string, string> = {
  Vibrant: "Vibrant",
  Muted: "Muted",
  DarkVibrant: "Dark Vibrant",
  DarkMuted: "Dark Muted",
  LightVibrant: "Light Vibrant",
  LightMuted: "Light Muted",
};

export async function extractColours(
  imageUrl: string
): Promise<ExtractedColour[]> {
  try {
    const palette = await Vibrant.from(imageUrl).getPalette();
    const colours: ExtractedColour[] = [];

    for (const [swatchKey, swatch] of Object.entries(palette)) {
      if (!swatch) continue;

      const [r, g, b] = swatch.rgb;
      colours.push({
        hex: swatch.hex,
        r: Math.round(r),
        g: Math.round(g),
        b: Math.round(b),
        population: swatch.population,
        name: SWATCH_NAMES[swatchKey] ?? swatchKey,
      });
    }

    return colours.sort((a, b) => b.population - a.population);
  } catch (error) {
    console.error("Failed to extract colours:", error);
    return [];
  }
}

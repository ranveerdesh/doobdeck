import sharp from "sharp";

export interface ExtractedColour {
  hex: string;
  r: number;
  g: number;
  b: number;
  population: number;
  name: string;
}

const DEFAULT_MAX_COLOURS = 6;
const SAMPLE_SIZE = 48;
const BUCKET_SIZE = 32;

const SWATCH_NAMES: Record<string, string> = {
  Vibrant: "Vibrant",
  Muted: "Muted",
  DarkVibrant: "Dark Vibrant",
  DarkMuted: "Dark Muted",
  LightVibrant: "Light Vibrant",
  LightMuted: "Light Muted",
};

function toHex(r: number, g: number, b: number): string {
  return `#${[r, g, b]
    .map((value) => value.toString(16).padStart(2, "0"))
    .join("")}`;
}

function clamp(value: number): number {
  return Math.max(0, Math.min(255, value));
}

function buildPaletteFromPixels(data: Buffer, maxColours = DEFAULT_MAX_COLOURS): ExtractedColour[] {
  const buckets = new Map<
    string,
    { r: number; g: number; b: number; count: number }
  >();

  for (let index = 0; index < data.length; index += 3) {
    const r = data[index] ?? 0;
    const g = data[index + 1] ?? 0;
    const b = data[index + 2] ?? 0;

    // Skip near-transparent/black-ish noise that can dominate edge pixels.
    if (r < 8 && g < 8 && b < 8) {
      continue;
    }

    const bucketR = Math.floor(r / BUCKET_SIZE) * BUCKET_SIZE;
    const bucketG = Math.floor(g / BUCKET_SIZE) * BUCKET_SIZE;
    const bucketB = Math.floor(b / BUCKET_SIZE) * BUCKET_SIZE;
    const key = `${bucketR},${bucketG},${bucketB}`;
    const existing = buckets.get(key);

    if (existing) {
      existing.r += r;
      existing.g += g;
      existing.b += b;
      existing.count += 1;
    } else {
      buckets.set(key, { r, g, b, count: 1 });
    }
  }

  return [...buckets.entries()]
    .map(([key, bucket]) => {
      const [bucketR, bucketG, bucketB] = key.split(",").map(Number);
      const count = bucket.count;
      const averageR = clamp(Math.round(bucket.r / count));
      const averageG = clamp(Math.round(bucket.g / count));
      const averageB = clamp(Math.round(bucket.b / count));
      const hex = toHex(averageR, averageG, averageB);

      return {
        hex,
        r: averageR,
        g: averageG,
        b: averageB,
        population: count,
        name: `${SWATCH_NAMES.Vibrant}-${bucketR}-${bucketG}-${bucketB}`,
      } satisfies ExtractedColour;
    })
    .sort((a, b) => b.population - a.population)
    .slice(0, maxColours);
}

export async function extractColoursFromBuffer(
  imageBuffer: Buffer,
  maxColours = DEFAULT_MAX_COLOURS
): Promise<ExtractedColour[]> {
  try {
    const { data, info } = await sharp(imageBuffer)
      .ensureAlpha()
      .removeAlpha()
      .resize(SAMPLE_SIZE, SAMPLE_SIZE, {
        fit: "inside",
        withoutEnlargement: true,
      })
      .raw()
      .toBuffer({ resolveWithObject: true });

    const channelCount = info.channels;
    const rgbData = Buffer.alloc(Math.floor(data.length / channelCount) * 3);

    for (let inputIndex = 0, outputIndex = 0; inputIndex < data.length; inputIndex += channelCount) {
      rgbData[outputIndex++] = data[inputIndex] ?? 0;
      rgbData[outputIndex++] = data[inputIndex + 1] ?? 0;
      rgbData[outputIndex++] = data[inputIndex + 2] ?? 0;
    }

    return buildPaletteFromPixels(rgbData, maxColours);
  } catch (error) {
    console.error("Failed to extract colours from buffer:", error);
    return [];
  }
}

export async function extractColours(imageUrl: string): Promise<ExtractedColour[]> {
  try {
    const response = await fetch(imageUrl);
    if (!response.ok) {
      return [];
    }
    const arrayBuffer = await response.arrayBuffer();
    return extractColoursFromBuffer(Buffer.from(arrayBuffer));
  } catch (error) {
    console.error("Failed to extract colours:", error);
    return [];
  }
}

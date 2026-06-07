import { cloudinary } from "@/lib/cloudinary";

interface CloudinaryStorageSummary {
  usedBytes: number;
  limitBytes: number;
  remainingBytes: number;
  usagePercent: number;
}

const FREE_PLAN_STORAGE_LIMIT_BYTES = 25 * 1024 * 1024 * 1024;

function toNumber(value: unknown): number {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return 0;
}

function pickStorageBlock(payload: Record<string, unknown>): Record<string, unknown> {
  const candidates = [
    payload.storage,
    payload.usage,
    payload.resources,
    payload.transformations,
  ];

  for (const candidate of candidates) {
    if (candidate && typeof candidate === "object") {
      return candidate as Record<string, unknown>;
    }
  }

  return {};
}

function readFirstNumber(...values: unknown[]): number | null {
  for (const value of values) {
    if (value === null || value === undefined) continue;
    const parsed = toNumber(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return null;
}

async function getCloudinaryStorageSummary(): Promise<CloudinaryStorageSummary | null> {
  try {
    const usage = (await cloudinary.api.usage()) as Record<string, unknown>;
    const storage = pickStorageBlock(usage);

    const usedBytes = readFirstNumber(
      storage.usage,
      storage.used,
      storage.used_bytes,
      storage.bytes,
      storage.consumed,
      usage.storage_usage
    );

    const explicitLimitBytes = readFirstNumber(
      storage.limit,
      storage.allowed,
      storage.total,
      storage.max,
      storage.quota,
      usage.storage_limit
    );

    const envLimitBytes = readFirstNumber(process.env.CLOUDINARY_STORAGE_LIMIT_BYTES);
    const planName = typeof usage.plan === "string" ? usage.plan.toLowerCase() : "";
    const inferredPlanLimitBytes = planName === "free" ? FREE_PLAN_STORAGE_LIMIT_BYTES : null;
    const limitBytes = explicitLimitBytes ?? envLimitBytes ?? inferredPlanLimitBytes;

    if (usedBytes === null || limitBytes === null || limitBytes <= 0) {
      return null;
    }

    const clampedUsedBytes = Math.max(0, usedBytes);
    const remainingBytes = Math.max(0, limitBytes - clampedUsedBytes);
    const usagePercent = Math.min(100, Math.max(0, (clampedUsedBytes / limitBytes) * 100));

    return {
      usedBytes: clampedUsedBytes,
      limitBytes,
      remainingBytes,
      usagePercent,
    };
  } catch {
    return null;
  }
}

export { getCloudinaryStorageSummary };
export type { CloudinaryStorageSummary };
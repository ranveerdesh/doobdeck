import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { cloudinary } from "@/lib/cloudinary";
import { extractColoursFromBuffer } from "@/lib/colours";

const ACCEPTED_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);
const MAX_SIZE_BYTES = 10 * 1024 * 1024; // 10MB

function parseJsonArray(value: FormDataEntryValue | null): string[] {
  if (typeof value !== "string" || !value.trim()) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed)
      ? parsed.filter((item) => typeof item === "string" && item.trim().length > 0)
      : [];
  } catch {
    return [];
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = session.user.id;

    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (!ACCEPTED_TYPES.has(file.type)) {
      return NextResponse.json(
        { error: "Only JPEG, PNG, WebP, and GIF images are accepted" },
        { status: 400 }
      );
    }

    if (file.size > MAX_SIZE_BYTES) {
      return NextResponse.json(
        { error: "Image must be smaller than 10MB" },
        { status: 400 }
      );
    }

    const title = (formData.get("title") as string) || undefined;

    const filmName = (formData.get("filmName") as string) || "";
    if (!filmName.trim()) {
      return NextResponse.json({ error: "Film name is required" }, { status: 400 });
    }

    const director = (formData.get("director") as string) || undefined;
    const cinematographer = (formData.get("cinematographer") as string) || undefined;
    const editor = (formData.get("editor") as string) || undefined;
    const actor = (formData.get("actor") as string) || undefined;
    const releaseDateRaw = formData.get("releaseDate") as string;
    const releaseDate = releaseDateRaw ? new Date(releaseDateRaw) : undefined;
    const description = (formData.get("description") as string) || undefined;
    const notes = (formData.get("notes") as string) || undefined;
    const shotType = (formData.get("shotType") as string) || undefined;
    const aspectRatio = (formData.get("aspectRatio") as string) || undefined;
    const resolution = (formData.get("resolution") as string) || undefined;
    const composition = (formData.get("composition") as string) || undefined;
    const lighting = (formData.get("lighting") as string) || undefined;
    const interiorExterior = (formData.get("interiorExterior") as string) || undefined;
    const timeOfDay = (formData.get("timeOfDay") as string) || undefined;
    const lensSize = (formData.get("lensSize") as string) || undefined;
    const lensType = (formData.get("lensType") as string) || undefined;
    const opticalFormat = (formData.get("opticalFormat") as string) || undefined;
    const colour = (formData.get("colour") as string) || undefined;
    const set = (formData.get("set") as string) || undefined;
    const folderId = (formData.get("folderId") as string) || undefined;
    const categoryId = (formData.get("categoryId") as string) || "";
    if (!categoryId.trim()) {
      return NextResponse.json({ error: "Category is required" }, { status: 400 });
    }
    const collaborator = parseJsonArray(formData.get("collaborator"));
    const tagsRaw = formData.get("tags") as string;
    const tags: string[] = tagsRaw ? JSON.parse(tagsRaw) : [];
    const colourTags = parseJsonArray(formData.get("colourTags"));

    // Validate folder/category ownership in parallel
    const [folder, category] = await Promise.all([
      folderId
        ? prisma.folder.findFirst({ where: { id: folderId, userId }, select: { id: true } })
        : null,
      prisma.category.findFirst({ where: { id: categoryId, userId }, select: { id: true } }),
    ]);
    if (folderId && !folder) {
      return NextResponse.json({ error: "Folder not found" }, { status: 404 });
    }
    if (!category) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 });
    }

    // Convert file to buffer for upload
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const tagNames = tags.map((n) => n.toLowerCase());

    // Cloudinary upload, colour extraction, and tag processing are all
    // independent — run them in parallel to cut total upload latency.
    const [uploadResult, extractedColours, tagRecords] = await Promise.all([
      new Promise<{ secure_url: string; public_id: string }>((resolve, reject) => {
        cloudinary.uploader
          .upload_stream(
            {
              folder: "doobdeck",
              resource_type: "image",
              transformation: [{ quality: "auto", fetch_format: "auto" }],
            },
            (error, result) => {
              if (error || !result) reject(error ?? new Error("Upload failed"));
              else resolve(result);
            }
          )
          .end(buffer);
      }),
      extractColoursFromBuffer(buffer),
      (async () => {
        if (tagNames.length === 0) return [];
        await prisma.tag.createMany({
          data: tagNames.map((name) => ({ name, userId })),
          skipDuplicates: true,
        });
        return prisma.tag.findMany({
          where: { userId, name: { in: tagNames } },
          select: { id: true },
        });
      })(),
    ]);
    const still = await prisma.still.create({
      data: {
        title: title?.trim() || undefined,
        filmName: filmName.trim(),
        director,
        cinematographer,
        editor,
        actor,
        releaseDate,
        description,
        notes,
        shotType,
        aspectRatio,
        resolution,
        composition,
        lighting,
        interiorExterior,
        timeOfDay,
        lensSize,
        lensType,
        opticalFormat,
        colour,
        set,
        colourTags,
        collaborator,
        imageUrl: uploadResult.secure_url,
        imagePublicId: uploadResult.public_id,
        userId,
        folderId,
        categoryId,
        tags: {
          create: tagRecords.map((tag) => ({ tagId: tag.id })),
        },
        colours: {
          create: extractedColours.map((c) => ({
            hex: c.hex,
            r: c.r,
            g: c.g,
            b: c.b,
            population: c.population,
            name: c.name,
          })),
        },
      },
      include: {
        folder: { select: { id: true, name: true } },
        category: { select: { id: true, name: true } },
        tags: { include: { tag: true } },
        colours: { orderBy: { population: "desc" } },
      },
    });

    return NextResponse.json({ data: still }, { status: 201 });
  } catch (error) {
    console.error("[POST /api/upload]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

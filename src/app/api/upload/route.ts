import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { cloudinary } from "@/lib/cloudinary";

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

    const title = formData.get("title") as string;
    if (!title?.trim()) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

    // Parse optional fields
    const filmName = (formData.get("filmName") as string) || "";
    if (!filmName.trim()) {
      return NextResponse.json({ error: "Film name is required" }, { status: 400 });
    }

    const director = (formData.get("director") as string) || undefined;
    const cinematographer = (formData.get("cinematographer") as string) || undefined;
    const editor = (formData.get("editor") as string) || undefined;
    const actor = (formData.get("actor") as string) || undefined;
    const yearRaw = formData.get("year") as string;
    const year = yearRaw ? parseInt(yearRaw, 10) : undefined;
    const description = (formData.get("description") as string) || undefined;
    const notes = (formData.get("notes") as string) || undefined;
    const shotType = (formData.get("shotType") as string) || undefined;
    const aspectRatio = (formData.get("aspectRatio") as string) || undefined;
    const frameSize = (formData.get("frameSize") as string) || undefined;
    const composition = (formData.get("composition") as string) || undefined;
    const lighting = (formData.get("lighting") as string) || undefined;
    const interiorExterior = (formData.get("interiorExterior") as string) || undefined;
    const timeOfDay = (formData.get("timeOfDay") as string) || undefined;
    const lensSize = (formData.get("lensSize") as string) || undefined;
    const set = (formData.get("set") as string) || undefined;
    const folderId = (formData.get("folderId") as string) || "";
    const categoryId = (formData.get("categoryId") as string) || "";
    if (!folderId.trim()) {
      return NextResponse.json({ error: "Folder is required" }, { status: 400 });
    }
    if (!categoryId.trim()) {
      return NextResponse.json({ error: "Category is required" }, { status: 400 });
    }
    if (!interiorExterior?.trim()) {
      return NextResponse.json({ error: "Interior / Exterior is required" }, { status: 400 });
    }
    if (!timeOfDay?.trim()) {
      return NextResponse.json({ error: "Time of Day is required" }, { status: 400 });
    }
    if (!lensSize?.trim()) {
      return NextResponse.json({ error: "Lens Size is required" }, { status: 400 });
    }
    const tagsRaw = formData.get("tags") as string;
    const tags: string[] = tagsRaw ? JSON.parse(tagsRaw) : [];
    const colourTags = parseJsonArray(formData.get("colourTags"));

    // Validate folder/category ownership
    if (folderId) {
      const folder = await prisma.folder.findUnique({ where: { id: folderId } });
      if (!folder || folder.userId !== userId) {
        return NextResponse.json({ error: "Folder not found" }, { status: 404 });
      }
    }
    if (categoryId) {
      const category = await prisma.category.findUnique({ where: { id: categoryId } });
      if (!category || category.userId !== userId) {
        return NextResponse.json({ error: "Category not found" }, { status: 404 });
      }
    }

    // Convert file to buffer for upload
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Upload to Cloudinary
    const uploadResult = await new Promise<{
      secure_url: string;
      public_id: string;
    }>((resolve, reject) => {
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
    });

    // TODO: Re-enable palette extraction when node-vibrant integration is stable.
    const extractedColours: Array<{
      hex: string;
      r: number;
      g: number;
      b: number;
      population: number;
      name: string;
    }> = [];

    // Upsert tags
    const tagRecords = await Promise.all(
      tags.map((name) =>
        prisma.tag.upsert({
          where: { userId_name: { userId, name: name.toLowerCase() } },
          create: { name: name.toLowerCase(), userId },
          update: {},
        })
      )
    );

    // Create still with colours
    const still = await prisma.still.create({
      data: {
        title: title.trim(),
        filmName: filmName.trim(),
        director,
        cinematographer,
        editor,
        actor,
        year: year && !isNaN(year) ? year : undefined,
        description,
        notes,
        shotType,
        aspectRatio,
        frameSize,
        composition,
        lighting,
        interiorExterior,
        timeOfDay,
        lensSize,
        set,
        colourTags,
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

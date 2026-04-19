import type { Still, Folder, Category, Tag, Colour, User } from "@prisma/client";

// Re-export Prisma types
export type { Still, Folder, Category, Tag, Colour, User };

// Extended types with relations
export type StillWithRelations = Still & {
  folder: Folder | null;
  category: Category | null;
  tags: Array<{
    tag: Tag;
  }>;
  colours: Colour[];
};

export type StillSummary = Pick<
  Still,
  | "id"
  | "title"
  | "filmName"
  | "director"
  | "year"
  | "imageUrl"
  | "createdAt"
  | "userId"
  | "folderId"
  | "categoryId"
> & {
  folder: Pick<Folder, "id" | "name"> | null;
  category: Pick<Category, "id" | "name"> | null;
  tags: Array<{ tag: Pick<Tag, "id" | "name"> }>;
  colours: Pick<Colour, "id" | "hex" | "name" | "population">[];
};

export type FolderWithCount = Folder & {
  _count: {
    stills: number;
  };
};

export type CategoryWithCount = Category & {
  _count: {
    stills: number;
  };
};

export type TagWithCount = Tag & {
  _count: {
    stills: number;
  };
};

export interface DashboardStats {
  totalStills: number;
  totalFolders: number;
  totalCategories: number;
  recentStills: StillSummary[];
}

export interface ApiResponse<T = unknown> {
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasMore: boolean;
  };
}

export interface UploadResult {
  imageUrl: string;
  imagePublicId: string;
  colours: ExtractedColour[];
}

export interface ExtractedColour {
  hex: string;
  r: number;
  g: number;
  b: number;
  population: number;
  name: string;
}

export interface SearchFilters {
  q?: string;
  folderId?: string;
  categoryId?: string;
  tag?: string;
  page?: number;
  limit?: number;
}

// Auth types
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      name?: string | null;
    };
  }
}

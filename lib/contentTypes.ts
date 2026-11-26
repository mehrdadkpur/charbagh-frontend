export type BlogStatus = 1 | 2 | 3;

export interface CmsBlog {
  id: string;
  userId: string;
  categoryId: string;
  firstName: string;
  lastName: string;
  title: string;
  text: string;
  imageUrl: string | null;
  status: BlogStatus;
  createdAt: string;
  updatedAt: string | null;
}

export interface CmsCategory {
  id: string;
  name: string;
  description: string | null;
  isActive: boolean;
}

export type GalleryStatus = 1 | 2 | 3;
export type GalleryMediaType = 1 | 2;

export interface CmsGallery {
  id: string;
  title: string;
  description: string | null;
  coverImageUrl: string | null;
  status: GalleryStatus;
}

export interface CmsGalleryItem {
  id: string;
  galleryId: string;
  mediaType: GalleryMediaType;
  title: string | null;
  description: string | null;
  fileUrl: string;
  thumbnailUrl: string | null;
  sortOrder: number;
}

export interface CmsContact {
  id: string;
  fullName: string;
  mobile: string;
  status: 1 | 2 | 3 | 4;
  createdAt: string;
  updatedAt: string | null;
}

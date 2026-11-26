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


export interface PublicBook {
  id: string;
  instrumentId: string;
  title: string;
  englishTitle: string | null;
  author: string | null;
  publisher: string | null;
  volume: number | null;
  level: number;
  coverImageUrl: string | null;
  displayOrder: number;
  isActive: boolean;
}

export interface PublicTeacher {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  email: string | null;
  profileImageUrl: string | null;
  personnelCode: string;
  employmentDate: string;
  education: number | null;
  experienceYears: number | null;
  biography: string | null;
  status: number;
}

export interface PublicInstrument {
  id: string;
  instrumentCategoryId: string;
  name: string;
  englishName: string | null;
  description: string | null;
  displayOrder: number;
  imageUrl: string | null;
  isActive: boolean;
}

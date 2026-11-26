"use client";

import { useParams } from "next/navigation";
import GalleryItemForm from "@/app/ui/components/Admin/Content/GalleryItemForm";

export default function EditPhotoForm() {
  const params = useParams<{ id: string }>();
  return <GalleryItemForm mediaType={1} itemId={params.id} />;
}

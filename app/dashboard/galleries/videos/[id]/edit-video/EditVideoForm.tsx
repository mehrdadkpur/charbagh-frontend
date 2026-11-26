"use client";

import { useParams } from "next/navigation";
import GalleryItemForm from "@/app/ui/components/Admin/Content/GalleryItemForm";

export default function EditVideoForm() {
  const params = useParams<{ id: string }>();
  return <GalleryItemForm mediaType={2} itemId={params.id} />;
}

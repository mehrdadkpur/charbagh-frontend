import GalleryItemManager from "@/app/ui/components/Admin/Content/GalleryItemManager";

export default function PhotosPage() {
  return <GalleryItemManager mediaType={1} title="تصاویر گالری" basePath="/dashboard/galleries/photos" />;
}

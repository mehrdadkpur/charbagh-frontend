"use client";

import { useParams } from "next/navigation";
import BlogForm from "@/app/ui/components/Admin/Content/BlogForm";

export default function EditBlogPage() {
  const params = useParams<{ id: string }>();
  return <BlogForm blogId={params.id} />;
}

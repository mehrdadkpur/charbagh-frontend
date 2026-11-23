// app/dashboard/teachers/[id]/edit/page.tsx

import EditStudent from "./EditStudent";

interface EditStudentPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditStudentPage({
  params,
}: EditStudentPageProps) {
  const { id } = await params;

  return <EditStudent studentId={id} />;
}
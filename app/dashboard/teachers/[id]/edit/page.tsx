// app/dashboard/teachers/[id]/edit/page.tsx

import EditTeacher from "./EditTeacher";

interface EditTeacherPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditTeacherPage({
  params,
}: EditTeacherPageProps) {
  const { id } = await params;

  return <EditTeacher teacherId={id} />;
}
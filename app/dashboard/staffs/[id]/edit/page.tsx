import EditStaff from "./EditStaff";

interface EditStaffPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditStaffPage({
  params,
}: EditStaffPageProps) {
  const { id } = await params;

  return <EditStaff staffId={id} />;
}
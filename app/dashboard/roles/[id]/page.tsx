import RoleDetails from "./RoleDetails";

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function RoleDetailsPage({ params }: PageProps) {
  const { id } = await params;

  return <RoleDetails roleId={id} />;
}
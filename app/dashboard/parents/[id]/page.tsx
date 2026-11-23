import ParentDetails from "./ParentDetails";

interface ParentDetailsPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function ParentDetailsPage({
  params,
}: ParentDetailsPageProps) {
  const { id } = await params;

  return <ParentDetails parentId={id} />;
}
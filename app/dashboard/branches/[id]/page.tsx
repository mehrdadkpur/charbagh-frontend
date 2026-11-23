import BranchDetails from "./BranchDetails";

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function BranchDetailsPage({ params }: PageProps) {
  const { id } = await params;

  return <BranchDetails branchId={id} />;
}
import StudentDetails from "./StudentDetails";

interface StudentDetailsPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function StudentDetailsPage({
  params,
}: StudentDetailsPageProps) {
  const { id } = await params;

  return <StudentDetails studentId={id} />;
}
import StaffDeatails from "./StaffDetails";

interface StaffDetailsPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function StaffDetailsPage({ params}: StaffDetailsPageProps) {
  const { id } = await params;

  return <StaffDeatails staffId={id} />;
}
'use client';

import { useEffect, useState } from "react";
import { fetchAdminInstrument } from "@/lib/requests";
import { useParams } from "next/navigation";
import { Instrument } from "@/lib/types";
import Loading from "@/app/loading";
import ErrorHandling from "@/app/ui/components/ErrorHandling";
import ViewInstrument from "./ViewInstrument";

const Page = () => {
  const [instrument, setInstrument] = useState<Instrument | null >(null);
  const [instrumentLoading, setInstrumentLoading] = useState(true);

  const { instrumentId } = useParams();

  useEffect(() => {
    const loadInstrument = async () => {
      try {
        const data = await fetchAdminInstrument(instrumentId as string);
        setInstrument(data);
      } catch (err) {
        console.error((err as Error).message);
      } finally {
        setInstrumentLoading(false);
      }
    };
  
    loadInstrument();
  }, [instrumentId]);
  
  if ( instrumentLoading) return <Loading />;
  if (!instrument) return <ErrorHandling />;

  return (
    <div className="container space-y-6">
      <ViewInstrument instrument={instrument} setInstrument={setInstrument} />
    </div>
  );
};

export default Page;


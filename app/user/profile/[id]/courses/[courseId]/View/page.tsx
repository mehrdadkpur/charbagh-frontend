'use client';

import { useEffect, useState } from "react";
import ViewCourse from "./ViewCourse";
import { fetchInstrument, fetchProfileCourse } from "@/lib/requests";
import { useParams } from "next/navigation";
import { ICourse, Instrument } from "@/lib/types";
import Loading from "@/app/loading";
import ErrorHandling from "@/app/ui/components/ErrorHandling";

const Page = () => {
  const [course, setCourse] = useState<ICourse | null >(null);
  const [instrument, setInstrument] = useState<Instrument>();
  const [courseLoading, setCourseLoading] = useState(true);
  const [instrumentLoading, setInstrumentLoading] = useState(true);

  const { courseId } = useParams();

  useEffect(() => {
    const loadCourse = async () => {
      if (!courseId) return;
      try {
        const data = await fetchProfileCourse(courseId as string);
        setCourse(data);
      } catch (err) {
        console.error((err as Error).message);
      } finally {
        setCourseLoading(false);
      }
    };
  
    loadCourse();
  }, [courseId]);
  
  useEffect(() => {
    const loadInstrument = async () => {
      if (!course?.instrumentId) return;
      try {
        const data = await fetchInstrument(course.instrumentId);
        setInstrument(data);
      } catch (err) {
        console.error((err as Error).message);
      } finally {
        setInstrumentLoading(false);
      }
    };
  
    loadInstrument();
  }, [course?.instrumentId]);
  

  if (courseLoading || instrumentLoading) return <Loading />;
  if (!course || !instrument) return <ErrorHandling />;

  return (
    <div className="container w-[480px] md:w-2xl lg:w-3xl xl:w-4xl p-6 space-y-6">
      <ViewCourse course={course} instrumentName = {instrument.instrument_name} setCourse={setCourse} />
    </div>
  );
};

export default Page;


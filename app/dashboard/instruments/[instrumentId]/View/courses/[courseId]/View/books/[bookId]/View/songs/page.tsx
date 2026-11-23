'use client';

import { useEffect, useState } from "react";
import { fetchInstrument, fetchProfileBook, fetchProfileCourse } from "@/lib/requests";
import { useParams } from "next/navigation";
import { IBook, ICourse, Instrument, ISong } from "@/lib/types";
import Loading from "@/app/loading";
import ErrorHandling from "@/app/ui/components/ErrorHandling";
import ViewSongs from "./ViewSongs";

const Page = () => {
  const [course, setCourse] = useState<ICourse | null >(null);
  const [book, setBook] = useState<IBook>();
  const [instrument, setInstrument] = useState<Instrument | null>(null);
  const [songs, setSongs] = useState<ISong[] >([]);
  const [courseLoading, setCourseLoading] = useState(true);
  const [bookLoading, setBookLoading] = useState(true);
  const [instrumentLoading, setInstrumentLoading] = useState(true);

  const { courseId , bookId  } = useParams();

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
    const loadBook = async () => {
      if (!bookId) return;
      try {
        const data = await fetchProfileBook(bookId as string);
        setBook(data);
        setSongs(data.songs);
      } catch (err) {
        console.error((err as Error).message);
      } finally {
        setBookLoading(false);
      }
    };
  
    loadBook();
  }, [bookId]);

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

  if (courseLoading || bookLoading || instrumentLoading) return <Loading />;
  if (!course || !book || !instrument) return <ErrorHandling />;

  return (
    <div className="container p-6 space-y-6">
      <ViewSongs instrument = {instrument} course={course} book = {book} songs = {songs} setSongs={setSongs} />
    </div>
  );
};

export default Page;


'use client';

import { useEffect, useState } from "react";
import ViewBook from "./ViewBook";
import { fetchProfileBook, fetchProfileCourse } from "@/lib/requests";
import { useParams } from "next/navigation";
import { IBook, ICourse } from "@/lib/types";
import Loading from "@/app/loading";
import ErrorHandling from "@/app/ui/components/ErrorHandling";

const Page = () => {
  const [course, setCourse] = useState<ICourse | null >(null);
  const [book, setBook] = useState<IBook | null >(null);
  const [courseLoading, setCourseLoading] = useState(true);
  const [bookLoading, setBookLoading] = useState(true);

  const { courseId , bookId } = useParams();

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
      if (book) return;
      try {
        const data = await fetchProfileBook(bookId as string);
        setBook(data);
      } catch (err) {
        console.error((err as Error).message);
      } finally {
        setBookLoading(false);
      }
    };
  
    loadBook();
  }, [bookId]);
  

  if (courseLoading || bookLoading) return <Loading />;
  if (!course || !book) return <ErrorHandling />;

  return (
    <div className="container w-[480px] md:w-2xl lg:w-3xl xl:w-4xl p-6 space-y-6">
      <ViewBook course={course} book={book} setBook={setBook} />
    </div>
  );
};

export default Page;


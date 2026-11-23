'use client';

import { useEffect, useState } from "react";

import { fetchProfileCourse } from "@/lib/requests";
import { useParams } from "next/navigation";
import { IBook, ICourse } from "@/lib/types";
import Loading from "@/app/loading";
import ErrorHandling from "@/app/ui/components/ErrorHandling";
import CourseBooks from "./CourseBooks";

const Page = () => {
  const [books, setBooks] = useState<IBook[]>();
  const [course, setCourse] = useState<ICourse | null>(null);
  const [bookLoading, setBookLoading] = useState(true);

  const { courseId } = useParams();

  useEffect(() => {
    const loadBooks = async () => {
      if (!courseId) return;
      try {
        const data = await fetchProfileCourse(courseId as string);
        setCourse(data);
        setBooks(data.books);
        
      } catch (err) {
        console.error((err as Error).message);
      } finally {
        setBookLoading(false);
      }
    };
  
    loadBooks();
  }, [courseId]);

  if (bookLoading) return <Loading />
  if (!books || !course) return <ErrorHandling />
  
  return (
    <div className="container p-6 space-y-6">
      <CourseBooks course={course} books={books} />
    </div>
  );
};

export default Page;


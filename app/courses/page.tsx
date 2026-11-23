import { fetchBooks } from '@/lib/requests';
import CourseCard from '../ui/components/CourseCard';
import RoutesHeader from '../ui/components/RoutesHeader';
import Image from 'next/image';
import { ICourse } from '@/lib/types';   

export const metadata = {
    title: 'آموزشگاه چهارباغ |دوره ها',
    description: 'این صفحه دوره های آموزشی آموزشگاه موسیقی چهارباغ است.',
  };

const Books =async () => {
    const books = await fetchBooks();
    return ( 
            <div className="relative w-full bg-[#F6F4EE] md:z-50 dark:bg-gray-900 ">
                <RoutesHeader pageTitle={'دوره ها '} boldText={'دوره های آموزشی'} Highlight={'موسیقی'}/>
                <div className="container">
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-10 md:gap-8 justify-items-center my-16">
                        {books&& books?.map((course:ICourse)=>(
                            <CourseCard key={course.id} course={course}/>
                        ))}
                    </div>
                </div>
                <div>
                    <Image width={1920} height={134} src="/images/shapes/footer-1.png" alt="shape" />
                </div>
            </div>
     );
}
 
export default Books;
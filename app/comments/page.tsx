import RoutesHeader from "@/app/ui/components/RoutesHeader";
import { fetchComments } from "@/lib/requests";
import Image from "next/image";
import CommentCard from "../ui/components/CommentCard";
import { IComment } from "@/lib/types";

export const metadata = {
    title: 'آموزشگاه موسیقی چهارباغ |نطرات',
    description: 'این صفحه نظرات هنرجویان و اساتید و مدرسین آموزشگاه موسیقی چهارباغ است.',
  };

const Comments = async () => {
    const comments = await fetchComments();
    
    return ( 
        <section>
            <div className="w-full bg-[#F6F4EE]">
                <RoutesHeader pageTitle={"نظرات شما"} boldText={"نظرات فارغ التحصیلان و"} Highlight={"هنرجوبان"}/>
                <div className="container">
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-10 md:gap-8 justify-items-center my-16">
                        {comments&& comments?.map((comment:IComment)=>(
                            <CommentCard key={comment.id} comment={comment}/>
                        ))}
                    </div>
                </div>
                <div>
                    <Image width={1920} height={134} src="/images/shapes/footer-1.png" alt="footer" />
                </div>
            </div>
        </section>
     );
}
 
export default Comments;
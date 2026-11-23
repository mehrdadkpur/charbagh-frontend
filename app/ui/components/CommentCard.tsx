'use client'

import { ShamsiDate } from "@/lib/shamsiDate"
import { IComment } from "@/lib/types"
import Image from "next/image"

const CommentCard = ({ comment }: { comment: IComment }) => (
  
  <div className=" w-[400px] py-4 bg-white rounded-xl flex justify-center items-center flex-col gap-y-6 ">
      <div className=" w-30 h-30 "> 
          <Image width={120} height={120} className="rounded-full" src={comment.user.user_img} alt="img" /> 
      </div>
      <div className="text-greenDark text-sm font-DanaDemiBold">{comment.user.firstname}{" "} {comment.user.lastname}</div>
      <div className="text-[#018A75] text-lg font-DanaMedium">{comment.user.roles.map((role)=> role.role_description)}</div>
      <div className="text-[#018A75] text-lg font-DanaMedium">{ShamsiDate(comment.comment_date)}</div>
      <div className="w-[85%] text-greenDark/75 text-base font-Dana text-center">{comment.comment_text}</div>
      <div className="w-8 h-8">  
          <Image width={32} height={24} src="/images/comments/quote.png" alt="quote" /> 
      </div>
  </div>
)
export default CommentCard;
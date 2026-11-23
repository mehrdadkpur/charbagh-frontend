
import EditProfileForm from "./EditProfileForm";

const EditTeacher = () => {

    return ( 
      <section className="flex mt-2 text-gray-900 dark:text-gray-50 text-nowrap bg-gray-50 dark:bg-gray-900">
        <div className=" container flex justify-center items-center flex-col gap-y-2 ">
          <div className="w-full p-2 rounded-lg font-DanaDemiBold text-center">
              <p> ویرایش پروفایل </p>
          </div>
          <div className="w-full px-20 py-10 rounded-lg">
              <EditProfileForm/> 
          </div>
        </div>
      </section>
     );
}
 
export default EditTeacher;
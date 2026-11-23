
import AddUserForm from "./AddTeacher";

const AddUser = () => {

    return ( 
        <section className="flex mt-2">
        <div className=" container flex justify-center items-center flex-col gap-y-2 ">
          <div className="w-full p-2 text-center rounded-lg font-DanaDemiBold">
              <p> افزودن کاربر  جدید </p>
          </div>
          <div className="w-full px-20 py-10 rounded-lg">
              <AddUserForm/> 
          </div>
        </div>
      </section>
     );
}
 
export default AddUser;
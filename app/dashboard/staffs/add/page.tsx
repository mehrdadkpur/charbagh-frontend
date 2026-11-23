
import AddStaffForm from "./AddStaff";

const AddStaff = () => {

    return ( 
        <section className="flex mt-2">
        <div className=" container flex justify-center items-center flex-col gap-y-2 ">
          <div className="w-full p-2 text-center rounded-lg font-DanaDemiBold">
              <p> افزودن کارمند جدید </p>
          </div>
          <div className="w-full px-20 py-10 rounded-lg">
              <AddStaffForm/> 
          </div>
        </div>
      </section>
     );
}
 
export default AddStaff;
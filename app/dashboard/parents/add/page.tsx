
import AddParentForm from "./AddParent";

const AddParent = () => {

    return ( 
        <section className="flex mt-2">
        <div className=" container flex justify-center items-center flex-col gap-y-2 ">
          <div className="w-full px-20 py-10 rounded-lg">
              <AddParentForm/> 
          </div>
        </div>
      </section>
     );
}
 
export default AddParent;
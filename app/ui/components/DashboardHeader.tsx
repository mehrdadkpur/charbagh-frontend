import Profile from "./ProfileNav";

const DashboardHeader = () => {

    return ( 
        <section className="flex justify-end pl-10 items-center pt-5 z-0 bg-transparent dark:bg-gray-900 dark:text-gray-50 " >                                                       
            <Profile/>
          </section>
     );
}
 
export default DashboardHeader;
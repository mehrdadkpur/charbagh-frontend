import Profile from "./ProfileNav";

const DashboardHeader = () => {
  return (
    <section className="flex w-full min-w-0 items-center justify-end py-2 md:py-5 md:pl-10 z-0 bg-transparent dark:bg-gray-900 dark:text-gray-50">
      <Profile />
    </section>
  );
};

export default DashboardHeader;

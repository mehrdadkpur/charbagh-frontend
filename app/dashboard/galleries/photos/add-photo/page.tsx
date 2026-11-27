import AddPhotoForm from "./AddPhotoForm";

export default function AddPhoto() {
  return (
    <main dir="rtl" className="mx-auto mt-4 w-full max-w-4xl px-3 pb-8 sm:px-6">
      <header className="mb-5 text-center">
        <h1 className="text-xl font-bold text-gray-900 dark:text-white sm:text-2xl">افزودن عکس جدید</h1>
      </header>
      <div className="w-full min-w-0">
        <AddPhotoForm />
      </div>
    </main>
  );
}

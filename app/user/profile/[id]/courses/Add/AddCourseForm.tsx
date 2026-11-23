"use client"

import Link from "next/link"
import { useState, ChangeEvent, FormEvent, useEffect } from "react"
import { useParams, useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import {ICourse, Instrument } from "@/lib/types"
import { API_BASE_URL } from "@/lib/config"
import UploadInput from "@/app/ui/components/UploadInput"
import ShamsiDatePicker from "@/app/ui/components/ShamsiDatePicker"
import { fetchProfileInstruments } from "@/lib/requests"
import Swal from "sweetalert2"

const AddCourseForm = () => {
  const router = useRouter();
  const { id } = useParams();
  const teacherId = id;

  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [imagePreview, setImagePreview] = useState("/images/avatar.png")
  const [instruments, setInstruments] = useState<Instrument[]>([]);
  const [loading, setLoading] = useState(false);
  const [fields, setFields] = useState<ICourse>({
    id: "",
    course_name: "",
    course_description: "",
    course_img: "",
    instrumentId: "",
    books: [],
    courseUserRole:1,
    start_course_date:"",
    status:0,
    students:[],
    teacher:"",
    teacherId:id as string
  })

  useEffect(() => {
    const loadInstruments = async () => {
      const data = await fetchProfileInstruments();
      setInstruments(data);
    };
    loadInstruments();
  }, []);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target
    setFields(prev => ({ ...prev, [name]: value }))
  }

  const handleStartCourseDateChange = (gregorianDate: string) => {
    setFields(prev => ({ ...prev, start_course_date: gregorianDate }));
  };

  const handlePhotoSelect = (e: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (!selectedFile) return

    setFile(selectedFile)

    const reader = new FileReader()
    reader.onloadend = () => setImagePreview(reader.result as string)
    reader.readAsDataURL(selectedFile)
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
  
    if (!fields.instrumentId) {
      toast.error("لطفاً یک ساز انتخاب کنید");
      setLoading(false);
      return;
    }
   
    if (!file) {
      toast.error("لطفاً یک عکس انتخاب کنید");
      return;
    }

    const formData = new FormData();
    formData.append("Course_name", fields.course_name);
    formData.append("File", file);
    formData.append("Course_description", fields.course_description);
    formData.append("Status", "0");
    formData.append("InstrumentId", fields.instrumentId);
    if(teacherId)formData.append("TeacherId", teacherId?.toString());
    formData.append("Start_course_date", fields.start_course_date.toString());

  
    try {
      const response = await fetch(`${API_BASE_URL}/api/Profile/add-course`, {
        method: "POST",
        body:formData
      });
  
      if (response.ok) {
        await Swal.fire({
          title: '🎉 موفقیت آمیز!',
          text: 'دوره با موفقیت ثبت شد.',
          icon: 'success',
          confirmButtonText: 'باشه',
          confirmButtonColor: '#10B981',
        });
        router.push(`/user/profile/${id}/courses`);
        router.refresh();
      } else {
        toast.error( "خطایی رخ داده است");
      }
    } catch (error) {
      toast.error("خطا در ثبت دوره");
      console.error("Course submit error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <form
        onSubmit={handleSubmit}
        className="bg-white dark:bg-gray-900 w-full max-w-xl rounded-2xl p-6 space-y-5 shadow-xl"
      >
        <h2 className="text-lg font-bold text-center">
          افزودن دوره جدید
        </h2>

        <input
          name="course_name"
          value={fields.course_name}
          onChange={handleChange}
          placeholder="نام دوره"
          className="w-full p-3 border rounded-lg bg-gray-50 dark:bg-gray-800"
          required
        />
        <div className="w-full">
          <select
              name="instrumentId"
              className="w-full p-3 border rounded-lg bg-gray-50 dark:bg-gray-800"
              required
              value={fields.instrumentId}
              onChange={handleChange}
          >
              <option value="">انتخاب ساز</option>
              {instruments && instruments.map((instrument) => (
              <option key={instrument.id} value={instrument.id}>
                  {instrument.instrument_name}
              </option>
              ))}

          </select>
            </div>    
        <textarea
          name="course_description"
          value={fields.course_description}
          onChange={handleChange}
          placeholder="توضیحات دوره"
          className="w-full p-3 border rounded-lg bg-gray-50 dark:bg-gray-800 min-h-[120px]"
          required
        />
        <div className="flex flex-col gap-y-2">
          تاریخ شروع دوره:
          <ShamsiDatePicker initialDate={fields.start_course_date || new Date()} onChange={handleStartCourseDateChange}/>   
        </div>
        <UploadInput
          uploadedImage={imagePreview}
          handleImageUpload={handlePhotoSelect}
          uploading={uploading}
        />

        <div className="flex justify-end gap-3 pt-4">
          <Link
            href={`/user/profile/${id}/courses`}
            className="px-4 py-2 bg-gray-300 rounded-lg"
          >
            انصراف
          </Link>

          <button
            type="submit"
            className="px-5 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            ذخیره دوره
          </button>
        </div>
      </form>
    </div>
  )
}

export default AddCourseForm

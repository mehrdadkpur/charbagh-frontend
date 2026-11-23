'use client';
import { useState, useEffect, FormEvent, ChangeEvent } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { validateForm } from '@/lib/ValidateForm';
import Loading from '@/app/loading';
import toast from 'react-hot-toast';
import { IUser } from '@/lib/types';
import { fetchUser } from '@/lib/requests';
import { API_BASE_URL } from '@/lib/config';
import ShamsiDatePicker from '@/app/ui/components/ShamsiDatePicker';
import Link from 'next/link';
import Image from 'next/image';

const shallowEqual = (a: any, b: any, keys: string[]) => {
  for (const k of keys) {
    const va = (a as any)[k] ?? '';
    const vb = (b as any)[k] ?? '';
    if (Array.isArray(va) || Array.isArray(vb)) {
      if (JSON.stringify(va) !== JSON.stringify(vb)) return false;
    } else if (va !== vb) return false;
  }
  return true;
};
const EditProfileForm = () => {
  const { id } = useParams();
  const router = useRouter();

  const emptyUser: IUser = {
    id: "",
    firstname: "",
    lastname: "",
    birthdate: new Date().toISOString().split('T')[0],
    gender: 0,
    nationality_number: "",
    identity_number: 0,
    registry_date: new Date().toISOString().split('T')[0],
    mobile: "",
    email: "",
    address: "",
    password: "",
    status: 0,
    user_img: "",
    bio: "",
    roles: [],
    courses: []
  };

  const [fields, setFields] = useState<IUser>(emptyUser);
  const [originalFields, setOriginalFields] = useState<IUser | null>(null);

  const [initialDates, setInitialDates] = useState({
    birthdate: new Date(),
    registry_date: new Date()
  });
  const [file, setFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        if (!id) return;
        const data = await fetchUser(id as string);

        const formattedData = {
          ...data,
          birthdate: data.birthdate ? new Date(data.birthdate).toISOString().split('T')[0] : '',
          registry_date: data.registry_date ? new Date(data.registry_date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
        };

        setFields({...formattedData, password: ""});
        setOriginalFields({...formattedData,password: ""});
        
        setInitialDates({
          birthdate: new Date(data.birthdate || new Date()),
          registry_date: new Date(data.registry_date || new Date())
        });
        setImagePreview(`${data.user_img}` || '/images/avatar.png');
      } catch (error) {
        console.error('Error fetching user:', error);
        toast.error('خطا در دریافت اطلاعات کاربر');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFields(prev => ({ ...prev, [name]: value }));
  };

  const handleBirthDateChange = (gregorianDate: string) => {
    setFields(prev => ({ ...prev, birthdate: gregorianDate }));
  };

  const handlePhotoSelect = (e: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(selectedFile);
};

  const hasEdits = () => {
    if (!originalFields) return true;
    
    const keysToCheck = ['mobile', 'email', 'address', 'bio', 'birthdate', 'password', 'user_img'];
    if (file) return true;
    if (fields.password && fields.password.trim() !== '') return true;
    return !shallowEqual(fields, originalFields, keysToCheck);
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validateForm(fields.nationality_number ?? '', fields.mobile ?? '', fields.email ?? '')) {
      return;
    }
    if (!hasEdits()) {
      toast('تغییری در اطلاعات انجام نشده است');
      return;
    }

    const formData = new FormData();
    formData.append('birthdate', fields.birthdate ?? '');
    formData.append('mobile', fields.mobile ?? '');
    formData.append('email', fields.email ?? '');
    formData.append('address', fields.address ?? '');
    formData.append('bio', fields.bio ?? '');
    formData.append('nationality_number', fields.nationality_number ?? '');

    if (file) {
      formData.append('File', file);
    }

    if (fields.password && fields.password.trim()) {
      formData.append('password', fields.password.trim());
    }

    setUploading(true);
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/User/update-user-profile/${id}`, {
        method: 'PUT',
        body: formData
      });

      if (response.status === 409) {
        toast.error('این کد ملی قبلا ثبت شده است');
        return;
      }

      if (response.ok) {
        toast.success('پروفایل با موفقیت ویرایش شد');
        router.push('/user/profile');
      } else {
        const text = await response.text().catch(() => null);
        console.error('Submit failed:', text || response.status);
        toast.error('خطا در ثبت اطلاعات');
      }
    } catch (err) {
      console.error('Form submission error:', err);
      toast.error('خطا در ثبت اطلاعات');
    } finally {
      setUploading(false);
      setLoading(false);
    }
  };

  if (loading) return <Loading />;

  return (
    <form onSubmit={handleSubmit} className="max-w-4xl mx-auto bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6 space-y-6 font-Dana">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
        <div className="relative">
          <div className="w-28 h-28 rounded-full overflow-hidden ring-2 ring-sky-500 dark:ring-sky-700 shadow-lg bg-gray-100">
            <Image priority width={112} height={112} src={`${imagePreview}` || '/uploads/images/profiles/avatar.png'} alt="پروفایل" className="w-full h-full object-cover" />
          </div>
          <label className="absolute -bottom-2 left-1/2 -translate-x-1/2">
            <span className="cursor-pointer inline-flex items-center gap-2 px-3 py-1 rounded-md bg-sky-600 text-white text-xs shadow hover:bg-sky-700 transition">
              تغییر عکس
              <input type="file" accept="image/*" className="hidden" onChange={handlePhotoSelect} />
            </span>
          </label>
        </div>

        <div className="flex-1 text-right">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">{fields.firstname} {fields.lastname}</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{fields.email}</p>
          <div className="mt-4 flex flex-wrap gap-3">
          </div>
        </div>
      </div>
      {/* Grid inputs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* firstname & lastname (disabled) */}
        <div className="w-full flex items-center gap-x-3">
          <label className="w-1/3 text-sm text-gray-600 dark:text-gray-300">نام</label>
          <input
            name="firstname"
            value={fields.firstname}
            onChange={handleChange}
            disabled
            className="w-2/3 h-12 px-3 border border-gray-200 dark:border-gray-700 rounded-md bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-100"
          />
        </div>
        <div className="w-full flex items-center gap-x-3">
          <label className="w-1/3 text-sm text-gray-600 dark:text-gray-300">نام خانوادگی</label>
          <input
            name="lastname"
            value={fields.lastname}
            onChange={handleChange}
            disabled
            className="w-2/3 h-12 px-3 border border-gray-200 dark:border-gray-700 rounded-md bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-100"
          />
        </div>
        {/* mobile */}
        <div className="w-full flex items-center gap-x-3">
          <label className="w-1/3 text-sm text-gray-600 dark:text-gray-300">موبایل</label>
          <input
            name="mobile"
            value={fields.mobile}
            onChange={handleChange}
            className="w-2/3 h-12 px-3 border border-gray-200 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-sky-500"
            placeholder="مثال: 0912xxxxxxx"
          />
        </div>
        {/* email */}
        <div className="w-full flex items-center gap-x-3">
          <label className="w-1/3 text-sm text-gray-600 dark:text-gray-300">ایمیل</label>
          <input
            name="email"
            type="email"
            value={fields.email}
            onChange={handleChange}
            className="w-2/3 h-12 px-3 border border-gray-200 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-sky-500"
            placeholder="you@example.com"
          />
        </div>
        {/* address */}
        <div className="w-full flex items-center gap-x-3">
          <label className="w-1/3 text-sm text-gray-600 dark:text-gray-300">آدرس</label>
          <input
            name="address"
            value={fields.address}
            onChange={handleChange}
            className="w-2/3 h-12 px-3 border border-gray-200 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-sky-500"
            placeholder="آدرس محل سکونت"
          />
        </div>
        {/* bio */}
        <div className="w-full flex items-center gap-x-3">
          <label className="w-1/3 text-sm text-gray-600 dark:text-gray-300">بیوگرافی</label>
          <textarea
            name="bio"
            rows={10}
            required
            cols={10}
            value={fields.bio}
            onChange={handleChange}
            className="w-2/3 h-48 px-3 border border-gray-200 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-sky-500"
            placeholder="چند کلمه درباره خودتان"
          />
        </div>
        {/* password (optional) */}
        <div className="w-full flex items-center gap-x-3">
          <label className="w-1/3 text-sm text-gray-600 dark:text-gray-300">رمز عبور (اختیاری)</label>
          <input
            name="password"
            type="password"
            value={fields.password ?? ""}
            onChange={handleChange}
            className="w-2/3 h-12 px-3 border border-gray-200 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-sky-500"
            placeholder="اگر می‌خواهید رمز را تغییر دهید وارد کنید"
          />
        </div>
        {/* birthdate aligned */}
        <div className="w-full flex items-center gap-x-3">
          <label className="w-1/3 text-sm text-gray-600 dark:text-gray-300">تاریخ تولد</label>
          <div className="w-2/3">
            <ShamsiDatePicker onChange={handleBirthDateChange} initialDate={initialDates.birthdate} />
          </div>
        </div>
        {/* identity / nationality (read only if present) */}
        <div className="w-full flex items-center gap-x-3">
          <label className="w-1/3 text-sm text-gray-600 dark:text-gray-300">شماره ملی</label>
          <input
            name="nationality_number"
            value={fields.nationality_number}
            onChange={handleChange}
            disabled
            className="w-2/3 h-12 px-3 border border-gray-200 dark:border-gray-700 rounded-md bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-100"
          />
        </div>
        <div className="w-full flex items-center gap-x-3">
          <label className="w-1/3 text-sm text-gray-600 dark:text-gray-300">شماره شناسایی</label>
          <input
            name="identity_number"
            value={fields.identity_number}
            onChange={handleChange}
            disabled
            className="w-2/3 h-12 px-3 border border-gray-200 dark:border-gray-700 rounded-md bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-100"
          />
        </div>
      </div>
      {/* Actions */}
      <div className="flex items-center justify-center gap-4 mt-4">
        <button
          type="submit"
          disabled={loading || uploading}
          className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-md shadow transition disabled:opacity-60"
        >
          {loading ? 'در حال ثبت...' : 'ثبت تغییرات'}
        </button>
        <Link href="/user/profile" className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-md shadow">
          انصراف
        </Link>
      </div>
    </form>
  );
};

export default EditProfileForm;

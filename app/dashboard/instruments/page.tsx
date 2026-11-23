"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Swal from "sweetalert2";

import AddButton from "@/app/ui/components/AddButton";
import Loading from "@/app/loading";
import { Instrument } from "@/lib/types";
import { API_BASE_URL } from "@/lib/config";
import { fetchAdminInstruments } from "@/lib/requests";
import { InstrumentStatusHelper } from "@/helper/StatusHelper";

import { X } from "lucide-react";
import InstrumentCard from "@/app/ui/components/InstrumentCard";

const Instruments = () => {
  const [instruments, setInstruments] = useState<Instrument[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await fetchAdminInstruments();        
        setInstruments(data);
      } catch (err) {
        console.error("Error fetching instruments:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleDeleteConfirm = async (instrumentId: string) => {
    const result = await Swal.fire({
      title: "آیا مطمئن هستید؟",
      text: "این عملیات قابل بازگشت نیست!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#2563eb",
      confirmButtonText: "بله، حذف کن",
      cancelButtonText: "لغو",
    });

    if (!result.isConfirmed) return;

    try {
      const res = await fetch(
        `${API_BASE_URL}/api/Admin/delete-instrument/${instrumentId}`,
        { method: "DELETE" }
      );

      if (!res.ok) throw new Error();

      setInstruments(prev => prev.filter(i => i.id !== instrumentId));
      await Swal.fire("حذف شد!", "ساز با موفقیت حذف شد.", "success");
    } catch {
      await Swal.fire("خطا", "خطا در حذف ساز.", "error");
    }
  };

  if (loading) return <Loading />;

  console.log(instruments);
  

  return (
    <div className="container mt-10 p-4 font-Dana">
      {/* Header */}
      <div className="flex justify-between items-center mb-10">
        <h1 className="text-2xl font-bold">سازها</h1>
        <AddButton name="ساز" route="/dashboard/instruments/add-instrument" />
      </div>

      {/* Empty state */}
      {instruments.length === 0 ? (
        <div className="flex items-center justify-center h-96 text-lg text-gray-500">
          هنوز سازی ثبت نشده است.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {instruments.map(instrument => (
            <div
              key={instrument.id}
              className="relative group rounded-xl border border-gray-400 bg-white dark:bg-gray-800 shadow-sm hover:shadow-lg transition"
            >
              {/* Delete Button */}
              <button
                onClick={() => handleDeleteConfirm(instrument.id)}
                className="absolute top-3 right-3 z-10 hidden group-hover:flex items-center justify-center w-8 h-8 rounded-full bg-red-100 text-red-600 hover:bg-red-600 hover:text-white transition"
                aria-label="حذف ساز"
              >
                <X size={18} />
              </button>

              <Link
                href={`/dashboard/instruments/${instrument.id}/View`}
                className="block p-4"
              >
                <InstrumentCard instrument={instrument} key={instrument.id}/>


                <div className="text-sm text-gray-600 dark:text-gray-300 space-y-2">

                  <div className="flex justify-between items-center">
                    <span>وضعیت</span>
                    <span className="px-2 py-0.5 rounded-md text-xs bg-green-100 text-green-700">
                      {InstrumentStatusHelper(instrument.isActive)}
                    </span>
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>
      )}

      {/* Back */}
      <div className="flex justify-center mt-12">
        <Link
          href="/dashboard"
          className="px-6 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm transition"
        >
          بازگشت
        </Link>
      </div>
    </div>
  );
};

export default Instruments;

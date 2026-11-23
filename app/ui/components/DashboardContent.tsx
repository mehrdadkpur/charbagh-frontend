'use client'

import { useEffect, useState } from 'react'
import StatCard from '@/app/ui/components/DashboardStats'
import { fetchStats } from '@/lib/requests'
import toast from 'react-hot-toast'
import { IStats } from '@/lib/types'
import dynamic from 'next/dynamic'

const Chart = dynamic(() => import('react-apexcharts'), { ssr: false })

const StatsPage = () => {
  const [stats, setStats] = useState<IStats | null>(null)
  
  useEffect(() => {
    const getStats = async () => {
      try {
        const data = await fetchStats()
        setStats(data)
      } catch {
        toast.error('خطا در دریافت آمار')
      }
    }
    getStats()
  }, [])

  const chartOptions: any = {
    chart: { type: 'line', toolbar: { show: false } },
    stroke: { curve: 'smooth' },
    xaxis: { categories: ['فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور'] },
    colors: ['#2563eb', '#16a34a'],
    legend: { position: 'top' },
  };
  
  const chartSeries = [
    { name: 'کاربران', data: [10, 25, 40, 55, 70, 90] },
    { name: 'دوره‌ها', data: [5, 15, 20, 30, 45, 60] },
  ]
  
  return (
    <div className="p-6 space-y-8 bg-gray-50 dark:bg-gray-900 min-h-screen">
      {/* Header */}
      <header>
        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">آمار کلی سیستم</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">نمای کلی از کاربران، دوره‌ها و محتوا</p>
      </header>
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="شعبات" count={stats?.totalBranches ?? 0} icon="👨‍💼" />
        <StatCard title="کاربران" count={stats?.totalUsers ?? 0} icon="👨‍💼" />
        <StatCard title="اساتید" count={stats?.totalTeachers ?? 0} icon="👩‍🏫" />
        <StatCard title="هنرجویان" count={stats?.totalStudents ?? 0} icon="🎓" />
        <StatCard title="کارمندان" count={stats?.totalStaffs ?? 0} icon="📚" />
        <StatCard title="کتاب ها" count={stats?.totalBooks ?? 0} icon="📚" />
        <StatCard title="بلاگ‌ها" count={stats?.totalBlogs ?? 0} icon="📰" />
        <StatCard title="سازها" count={stats?.totalInstruments ?? 0} icon="🎸" />
      </div>
      {/* Chart */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-4">
        <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-4">روند رشد</h2>
        <Chart options={chartOptions} series={chartSeries} type="line" height={300} />
      </div>
    </div>
  )
}

export default StatsPage

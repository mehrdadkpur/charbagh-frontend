import dynamic from 'next/dynamic'
import Header from '@/app/ui/main-page/Header'

const AnnouncementBannerCarousel = dynamic(() => import('@/app/ui/main-page/AnnouncementBannerCarousel'))
const Books = dynamic(() => import('@/app/ui/main-page/Books'))
const Instruments = dynamic(() => import('@/app/ui/main-page/Instruments'))
const Teachers = dynamic(() => import('@/app/ui/main-page/Teachers'))
const Achievements = dynamic(() => import('@/app/ui/main-page/Achivements'))
const Blogs = dynamic(() => import('@/app/ui/main-page/Blogs'))
const Contact = dynamic(() => import('@/app/ui/main-page/Contact'))

export default function MainPage() {
    return (
        <main className="overflow-hidden">
            <Header />
            <AnnouncementBannerCarousel />
            <Books />
            <Instruments />
            <Teachers />
            <Achievements />
            <Blogs />
            <Contact />
        </main>
    )
}

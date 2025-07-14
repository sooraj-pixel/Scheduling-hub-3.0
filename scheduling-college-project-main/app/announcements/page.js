'use client'
import AnnounceContent from '@/components/AnnounceContent'
import Layout from '@/components/design/Layout'
import { useUserRole } from '@/components/UserContext';
import { notFound } from 'next/navigation';

const Announcements = () => {
  const { role } = useUserRole();

  if (role !== 1) {
    return notFound(); // Triggers Next.js's built-in 404 page
  }
  return (
    <Layout>
      <AnnounceContent buttons={true} />
    </Layout>
  )
}

export default Announcements
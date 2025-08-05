'use client';
import React, { useEffect, useState } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import Layout from '@/components/design/Layout';
import Section from '@/components/Section';
import { useUserRole, useUserEmail } from '@/components/UserContext';

const localizer = momentLocalizer(moment);

const MySchedule = () => {
  const { role } = useUserRole();
  const { email } = useUserEmail();

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!email) return;

      try {
        setLoading(true);
        const res = await fetch(`/api/schedule/instructor?email=${email}`);
        const result = await res.json();
        const rows = result?.data || [];

        const formattedEvents = rows.map((item, idx) => ({
          id: idx,
          title: item.course_name || item.code || "Schedule",
          start: new Date(item.start_date),
          end: new Date(item.end_date),
        }));

        setEvents(formattedEvents);
      } catch (err) {
        console.error('❌ Failed to load instructor schedule:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [email]); // <-- Runs again when email is updated

  if (role !== 2) {
    return <div className="p-10 text-red-600 text-xl">Access Denied</div>;
  }

  return (
    <Layout>
      <Section title="My Schedule">
        <div className="h-[80vh]">
          {loading ? (
            <div className="text-center text-gray-500 mt-10">Loading schedule...</div>
          ) : (
            <Calendar
              localizer={localizer}
              events={events}
              startAccessor="start"
              endAccessor="end"
              style={{ height: '100%', width: '100%' }}
              views={['month', 'week', 'day', 'agenda']}
              defaultView="month"
              popup
            />
          )}
        </div>
      </Section>
    </Layout>
  );
};

export default MySchedule;

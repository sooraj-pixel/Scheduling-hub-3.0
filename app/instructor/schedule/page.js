'use client';

import React, { useEffect, useState } from 'react';
import { Calendar, Views, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import Layout from '@/components/design/Layout';
import Section from '@/components/Section';
import { useUserRole } from '@/components/UserContext';

const localizer = momentLocalizer(moment);

export default function InstructorSchedule() {
  // 👇 get both role and email from a single hook
  const { role, email } = useUserRole();

  const [events, setEvents]               = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);

  // controlled calendar navigation & view
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView]               = useState(Views.MONTH);

  useEffect(() => {
    if (!email) return;
    (async () => {
      const res      = await fetch(`/api/schedule/instructor?email=${email}`);
      const { data } = await res.json();
      // flatten if nested
      const flat = Array.isArray(data[0]) ? data.flat() : data;
      setEvents(
        flat.map(item => ({
          id:    item.id,
          title: item.course_name || item.code || 'Class',
          start: new Date(item.start_date),
          end:   new Date(item.end_date),
          _raw:  item
        }))
      );
    })();
  }, [email]);

  if (role !== 2) {
    // only instructors may view
    return <div className="p-10 text-red-600">Access Denied</div>;
  }

  return (
    <Layout>
      <Section title="My Schedule">
        <div className="h-[80vh]">
          <Calendar
            localizer={localizer}
            events={events}
            startAccessor="start"
            endAccessor="end"
            date={currentDate}
            onNavigate={setCurrentDate}
            view={view}
            onView={setView}
            views={['month','week','day','agenda']}
            defaultView={Views.MONTH}
            style={{ height: '100%' }}
            popup
            onSelectEvent={evt => setSelectedEvent(evt)}
          />
        </div>

        {/* Modal */}
        {selectedEvent && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            onClick={() => setSelectedEvent(null)}
          >
            <div
              className="bg-white p-6 rounded-lg shadow-xl w-full max-w-lg"
              onClick={e => e.stopPropagation()}
            >
              <h2 className="text-2xl font-bold mb-4">
                {selectedEvent.title}
              </h2>
              <dl className="grid grid-cols-2 gap-x-6 gap-y-3 mb-6">
                {[
                  ['Code',       selectedEvent._raw.code],
                  ['Session',    selectedEvent._raw.session],
                  ['Dates',      `${moment(selectedEvent.start).format('LL')} → ${moment(selectedEvent.end).format('LL')}`],
                  ['Days',       selectedEvent._raw.days],
                  ['Time',       `${selectedEvent._raw.start_time} - ${selectedEvent._raw.end_time}`],
                  ['Campus',     selectedEvent._raw.campus],
                  ['Delivery',   selectedEvent._raw.delivery],
                  ['Room',       selectedEvent._raw.room_no],
                  ['Instructor', selectedEvent._raw.instructor],
                ].map(([label, val]) => (
                  <React.Fragment key={label}>
                    <dt className="font-semibold">{label}</dt>
                    <dd>{val || '-'}</dd>
                  </React.Fragment>
                ))}
              </dl>
              <button
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                onClick={() => setSelectedEvent(null)}
              >
                Close
              </button>
            </div>
          </div>
        )}
      </Section>
    </Layout>
  );
}

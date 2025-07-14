// components/InstructorCalendarView.js
'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css'; // Default styles for react-big-calendar
import { useUserRole } from '@/components/UserContext'; // To get instructor's email
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import ScheduleForm from '@/components/forms/ScheduleForm';
import { Button } from "@/components/ui/button";

const localizer = momentLocalizer(moment);

// Receive modal states and handlers as props
const InstructorCalendarView = ({
    showEditModal,
    setShowEditModal,
    selectedEventDetails,
    setSelectedEventDetails,
    showAddModal,
    setShowAddModal,
    newScheduleDefaults,
    setNewScheduleDefaults,
    onEventClick,
    onSlotSelect,
    onFormSuccess,
    onFormClose,
    refreshTrigger // This prop triggers refetch
}) => {
  const { userName, role } = useUserRole();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // State to explicitly control the calendar's displayed date
  const [currentCalendarDate, setCurrentCalendarDate] = useState(new Date());
  // State to explicitly control the calendar's current view (month, week, day, agenda)
  const [currentCalendarView, setCurrentCalendarView] = useState('month'); // Default to 'month' view


  // DEBUG: Log component mount/unmount - this should now happen less frequently on interaction
  useEffect(() => {
    console.log("InstructorCalendarView mounted.");
    return () => {
      console.log("InstructorCalendarView unmounted.");
    };
  }, []);


  const defaultDate = useMemo(() => {
    // This memo is primarily for the calendar's defaultDate prop if we used it,
    // but we're now controlling `date` with `currentCalendarDate` state.
    // Keeping it here for consistency but its direct impact on initial view is minimal now.
    if (events.length > 0 && events[0].start) {
        return new Date(events[0].start);
    }
    return new Date();
  }, [events]);


  const fetchInstructorSchedules = useCallback(async () => {
    if (!userName || role !== 2) {
      setLoading(false);
      if (role !== 2) {
        // Parent handles this message
      } else {
        console.warn("InstructorCalendarView: No user email found to fetch schedules.");
      }
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const encodedInstructorEmail = encodeURIComponent(userName);
      // ADDED CACHE-BUSTING PARAMETER: Ensures fresh data is always fetched
      const cacheBuster = new Date().getTime(); 
      const res = await fetch(`/api/schedule/instructor?instructorName=${encodedInstructorEmail}&_t=${cacheBuster}`);

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || `HTTP error! status: ${res.status}`);
      }

      const result = await res.json();
      
      console.log("InstructorCalendarView: Raw schedule data from API:", result.data);

      const calendarEvents = result.data.map(schedule => {
        const hasStartDateTime = schedule.start_date && schedule.start_time;
        const hasEndDateTime = schedule.end_date && schedule.end_time;

        if (!hasStartDateTime || !hasEndDateTime) {
          console.warn("InstructorCalendarView: Skipping event due to missing start/end date/time fields:", schedule);
          return null;
        }

        const startDateOnly = schedule.start_date.split('T')[0];
        const endDateOnly = schedule.end_date.split('T')[0];

        const eventStartDateTimeString = `${startDateOnly} ${schedule.start_time}`;
        const eventEndDateTimeString = `${endDateOnly} ${schedule.end_time}`;

        const parsedStart = moment(eventStartDateTimeString, "YYYY-MM-DD HH:mm:ss");
        const parsedEnd = moment(eventEndDateTimeString, "YYYY-MM-DD HH:mm:ss");

        if (!parsedStart.isValid() || !parsedEnd.isValid()) {
          console.warn("InstructorCalendarView: Skipping event due to invalid date/time format after parsing:", schedule, "Attempted Start String:", eventStartDateTimeString, "Attempted End String:", eventEndDateTimeString);
          return null;
        }

        // MODIFIED: Force end date to be same as start date if different, but ONLY for month view logic.
        // This makes multi-day events render as single-day blocks in month view.
        // The original parsedEnd is still available in event.resource if full duration is needed.
        const displayEnd = parsedStart.isSame(parsedEnd, 'day') ? parsedEnd.toDate() : parsedStart.toDate();


        return {
          id: schedule.id,
          title: schedule.course_name,
          start: parsedStart.toDate(),
          end: displayEnd, // Use the displayEnd date for calendar rendering
          allDay: false,
          resource: schedule // Keep original schedule data for full details in modal
        };
      }).filter(event => event !== null);
      
      setEvents(calendarEvents);

      // MODIFIED: Always set currentCalendarDate to today when events are fetched,
      // regardless of the earliest event date.
      setCurrentCalendarDate(new Date()); 

    } catch (err) {
      console.error("InstructorCalendarView: Failed to fetch schedules:", err);
      setError("Failed to load schedules. Please check your network or try again.");
    } finally {
      setLoading(false);
    }
  }, [userName, role, refreshTrigger]); // refreshTrigger is a dependency for useCallback, so fetchInstructorSchedules changes when refreshTrigger changes.


  useEffect(() => {
    // This useEffect will run when fetchInstructorSchedules (the function reference) changes.
    // And fetchInstructorSchedules changes when its dependencies (userName, role, refreshTrigger) change.
    // So, incrementing refreshTrigger in the parent will correctly trigger this.
    fetchInstructorSchedules();
  }, [fetchInstructorSchedules]);


  // Handler for when an event is selected/clicked (delegated to parent)
  const handleSelectEvent = useCallback((event) => {
    console.log("Calendar Event selected (passing to parent):", event);
    onEventClick(event.resource);
  }, [onEventClick]);

  // Handler for when a time slot is selected (delegated to parent)
  const handleCalendarSelectSlot = useCallback(({ start, end }) => {
    console.log("Calendar Slot selected (passing to parent):", { start, end });
    onSlotSelect({ start, end });
  }, [onSlotSelect]);

  // Handler for calendar navigation (Today, Back, Next)
  const handleCalendarNavigate = useCallback((newDate, view, action) => {
    console.log("handleCalendarNavigate triggered. New date:", newDate, "View:", view, "Action:", action);
    setCurrentCalendarDate(newDate);
  }, []);

  // Handler for view changes (Month, Week, Day, Agenda)
  const handleCalendarViewChange = useCallback((newView) => {
    console.log("handleCalendarViewChange triggered. New view:", newView);
    setCurrentCalendarView(newView);
  }, []);


  // Define a set of appealing colors for events
  const eventColors = ['#4285F4', '#EA4335', '#FBBC05', '#34A853', '#7B1FA2', '#00796B', '#D84315']; // Google-like colors

  // Custom event styling (makes events more visible and wraps text)
  const eventPropGetter = useCallback((event, start, end, isSelected) => {
    // Determine color based on event ID for variety
    const colorIndex = event.id % eventColors.length;
    const backgroundColor = eventColors[colorIndex];

    const style = {
      backgroundColor: backgroundColor,
      borderRadius: '3px',
      opacity: 0.9,
      color: 'white',
      border: '0px',
      display: 'block',
      whiteSpace: 'normal',
      wordWrap: 'break-word',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      // REDUCED PADDING & FONT SIZE FOR MORE COMPACT LOOK
      padding: '0.5px 2px', // Very minimal padding
      fontSize: '0.60rem', // Even smaller font size
      lineHeight: '1.0', // Tighter line height
      minHeight: '16px', // Ensure a minimum height for smaller events
      cursor: 'pointer',
      boxSizing: 'border-box',
    };
    return {
      style: style,
    };
  }, []);

  // Custom Event component to render event content
  const CustomEvent = useCallback(({ event }) => (
    <div
      title={event.title}
      className="text-center" // Removed w-full h-full
      onClick={() => handleSelectEvent(event)}
      style={{ cursor: 'pointer' }}
    >
      {/* Time displayed first, then title on next line if needed */}
      <span className="block text-xs opacity-80 leading-none mb-0.5">{moment(event.start).format('HH:mm')}</span>
      <strong className="block leading-tight">{event.title}</strong>
      {/* react-big-calendar automatically handles '+X more' for overflow events */}
    </div>
  ), [handleSelectEvent]);


  if (loading) {
    return <div className="text-center py-4 text-gray-600">Loading calendar...</div>;
  }

  if (error) {
    return <div className="text-center py-4 text-red-600">Error: {error}</div>;
  }

  if (!loading && !error && events.length === 0) {
    return <div className="text-center py-4 text-gray-600">No schedules to display in calendar view for this instructor.</div>;
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow-md mt-5" style={{ height: '700px' }}>
      <h2 className="text-2xl font-bold mb-4 text-gray-800">Your Schedule (Calendar View)</h2>

      <Calendar
        key="instructor-calendar" // Stable key for the Calendar component
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        style={{ height: '100%' }}
        views={['month', 'week', 'day', 'agenda']}
        defaultView="month" // This sets the initial view
        date={currentCalendarDate} // CONTROLLED component: use 'date' prop
        onNavigate={handleCalendarNavigate} // CONTROLLED: update date state on navigate
        view={currentCalendarView} // CONTROLLED component: use 'view' prop
        onView={handleCalendarViewChange} // CONTROLLED: update view state on view change
        eventPropGetter={eventPropGetter}
        onSelectEvent={handleSelectEvent}
        onSelectSlot={handleCalendarSelectSlot}
        selectable
        components={{
          event: CustomEvent,
        }}
      />

      {/* Event Details/Edit Dialog - now controlled by parent's state */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="sm:max-w-3xl overflow-y-auto max-h-[90vh] bg-white border border-gray-300 shadow-xl z-[9999]" aria-describedby={undefined}>
            {console.log("DialogContent for Edit Modal is rendering. showEditModal:", showEditModal)}
            <DialogHeader>
                <DialogTitle>Edit Schedule Details</DialogTitle>
            </DialogHeader>
            {selectedEventDetails && (
                <ScheduleForm
                    currentSchedule={selectedEventDetails}
                    isEditing={true}
                    onClose={onFormClose}
                    onSuccess={onFormSuccess}
                />
            )}
        </DialogContent>
      </Dialog>

      {/* Add New Schedule Dialog - now controlled by parent's state */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent className="sm:max-w-3xl overflow-y-auto max-h-[90vh] bg-white border border-gray-300 shadow-xl z-[9999]" aria-describedby={undefined}>
            {console.log("DialogContent for Add Modal is rendering. showAddModal:", showAddModal)}
            <DialogHeader>
                <DialogTitle>Add New Schedule</DialogTitle>
            </DialogHeader>
            {newScheduleDefaults && (
                <ScheduleForm
                    currentSchedule={newScheduleDefaults}
                    isEditing={false}
                    onClose={onFormClose}
                    onSuccess={onFormSuccess}
                />
            )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default InstructorCalendarView;

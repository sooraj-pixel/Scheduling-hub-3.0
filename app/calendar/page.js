'use client';

import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import withDragAndDrop from 'react-big-calendar/lib/addons/dragAndDrop'; // Import drag and drop
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import 'react-big-calendar/lib/addons/dragAndDrop/styles.css'; // Import drag and drop styles
import Navbar from '@/components/Navbar'; // Assuming Navbar.js is in src/components or components
import { Sun, Moon, PlusCircle, Bell, Share2 } from 'lucide-react'; // Import new icons

const localizer = momentLocalizer(moment);
const DragAndDropCalendar = withDragAndDrop(Calendar); // Wrap Calendar with drag and drop

const CustomEvent = ({ event }) => {
  // Check if the event's end time is before the current time
  const isPastEvent = moment(event.end).isBefore(moment());

  return (
    <div
      style={{
        backgroundColor: isPastEvent ? 'red' : event.color, // Changed: Background color is red if it's a past event
        padding: '2px 5px',
        borderRadius: '4px',
        fontSize: '0.75rem',
        lineHeight: '1rem',
        color: 'black',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
        fontWeight: '500',
        // Apply strikethrough if it's a past event
        textDecoration: isPastEvent ? 'line-through' : 'none',
        opacity: isPastEvent ? 0.7 : 1, // Optionally make past events slightly faded
      }}
    >
      {event.title}
    </div>
  );
};

export default function CalendarPage() {
  // Dark Mode State and Persistence (Reverted for now to address errors)
  // The 'dark' class and localStorage logic are removed from here.
  // If you want to re-implement dark mode, it's best to use a dedicated theme provider or a simpler class toggle.
  const [darkMode, setDarkMode] = useState(false); // Default to false, no persistence for now

  // Toggle dark mode function (kept for future re-implementation if desired)
  const toggleDarkMode = useCallback(() => {
    setDarkMode(prevMode => !prevMode);
    // You would add logic here to toggle a class on document.documentElement
    // and save to localStorage if you re-implement dark mode.
  }, []);

  // Changed initial state to new Date() to show today's date
  const [currentDate, setCurrentDate] = useState(new Date());
  const [scheduledEvents, setScheduledEvents] = useState([]);
  const [myTodoEvents, setMyTodoEvents] = useState([]);
  const [activeView, setActiveView] = useState('month');

  // Event creation/edit modal states
  const [showEventModal, setShowEventModal] = useState(false);
  const [selectedDateForEvent, setSelectedDateForEvent] = useState(null);
  const [editingEvent, setEditingEvent] = useState(null);

  // Active step in the event modal: 1 for Event Details, 2 for Reminders, 3 for Share
  const [currentStep, setCurrentStep] = useState(1);

  // Event form inputs states
  const [tempEventTitle, setTempEventTitle] = useState('');
  const [tempEventFrom, setTempEventFrom] = useState('09:00');
  const [tempEventTo, setTempEventTo] = useState('10:00');
  // NEW: Location fields
  const [tempLocationType, setTempLocationType] = useState('In Person'); // 'In Person' or 'Online'
  const [tempInPersonLocation, setTempInPersonLocation] = useState('');
  const [tempOnlineMeetingLink, setTempOnlineMeetingLink] = useState('');

  const [selectedCalendar, setSelectedCalendar] = useState('My To Do Events');
  // Changed default color to blue
  const [tempEventColor, setTempEventColor] = useState('#3b82f6');
  // States for event-specific email and reminder checkbox
  const [tempEventRecipientEmail, setTempEventRecipientEmail] = useState('');
  const [tempEnableEventReminder, setTempEnableEventReminder] = useState(false);

  // New state for time validation error message
  const [timeValidationError, setTimeValidationError] = useState('');

  // New state for search query
  const [searchQuery, setSearchQuery] = useState('');

  // States for subscription modals
  const [showSubscriptionPrompt, setShowSubscriptionPrompt] = useState(false);
  const [showSubscriptionForm, setShowSubscriptionForm] = useState(false);

  // New states for subscription form inputs
  const [subFirstName, setSubFirstName] = useState('');
  const [subLastName, setSubLastName] = useState('');
  const [subEmail, setSubEmail] = useState('');
  const [subPhoneNumber, setSubPhoneNumber] = useState('');
  const [subNotificationTime, setSubNotificationTime] = useState('15');

  // NEW: State for event sharing recipient emails (comma-separated)
  const [tempShareRecipientEmails, setTempShareRecipientEmails] = useState('');

  // States for "Courses" button and custom subjects
  const [showCoursesDropdown, setShowCoursesDropdown] = useState(false);
  const [showAddSubjectModal, setShowAddSubjectModal] = useState(false);
  const [newSubjectName, setNewSubjectName] = useState('');
  const [customSubjects, setCustomSubjects] = useState([]);


  // Re-introduced visibleCalendars state, with specific types set to true
  const [visibleCalendars, setVisibleCalendars] = useState({
    'Community Sponsored Project': true,
    'Mobile and Windows Store Development': true,
    'My To Do Events': true,
    'BE NCT Ready': true, // Keep these in state for filtering, but not in legend checkboxes
    'NCT Library': true, // Keep these in state for filtering, but not in legend checkboxes
    'NCT Student Activities': true, // Keep these in state for filtering, but not in legend checkboxes
    'Schedule': true, // Keep these in state for filtering, but not in legend checkboxes
  });

  // Updated allCalendarTypes to only include those that should appear in the dropdown/legend
  // This now includes custom subjects added by the user
  const allCalendarTypes = useMemo(() => {
    const baseTypes = [
      'My To Do Events',
      'Community Sponsored Project',
      'Mobile and Windows Store Development',
    ];
    return [...baseTypes, ...customSubjects];
  }, [customSubjects]);

  // Defined a set of primary event colors
  const eventColorOptions = useMemo(() => ([
    { name: 'Blue', hex: '#3b82f6' },
    { name: 'Green', hex: '#22c55e' },
    { name: 'Yellow', hex: '#eab308' },
    { name: 'Orange', hex: '#f97316' },
    { name: 'Purple', hex: '#8b5cf6' }, // Keeping an extra color for versatility
  ]), []);

  const components = useMemo(() => ({ event: CustomEvent }), []);

  // NEW: State to control visibility of past events in My To Do list
  const [showPastMyTodoEvents, setShowPastMyTodoEvents] = useState(false);

  // NEW: State to control animation visibility and message
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);
  const [animationMessage, setAnimationMessage] = useState('');
  // NEW: State for animation background color
  const [animationColor, setAnimationColor] = useState('#22c55e'); // Default to green


  // Function to reset all modal form fields and editing state
  const resetModalForm = useCallback(() => {
    setTempEventTitle('');
    setTempEventFrom('09:00');
    setTempEventTo('10:00');
    setTempLocationType('In Person'); // Reset location type
    setTempInPersonLocation(''); // Reset in-person location
    setTempOnlineMeetingLink(''); // Reset online link
    setSelectedCalendar('My To Do Events');
    setTempEventColor('#3b82f6'); // Reset default color to blue
    setTempEventRecipientEmail('');
    setTempEnableEventReminder(false);
    setTempShareRecipientEmails(''); // Reset sharing emails
    setEditingEvent(null);
    setShowEventModal(false);
    setTimeValidationError(''); // Clear validation error on reset
    setCurrentStep(1); // Reset to first step
  }, []);

  // Function to reset subscription form fields
  const resetSubscriptionForm = useCallback(() => {
    setSubFirstName('');
    setSubLastName('');
    setSubEmail('');
    setSubPhoneNumber('');
    setSubNotificationTime('15');
    setShowSubscriptionForm(false);
    setShowSubscriptionPrompt(false);
  }, []);

  // Effect to fetch initial scheduled events from /api/schedule
  useEffect(() => {
    const fetchScheduledEvents = async () => {
      try {
        const res = await fetch('/api/schedule');
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);

        const result = await res.json();
        const rawScheduleData = (result && Array.isArray(result.data) && result.data.length > 0)
                                ? result.data[0]
                                : [];
        // console.log('Fetched Raw Scheduled Data:', rawScheduleData); // Debugging log

        const transformedEvents = rawScheduleData
          .map((item) => {
            const {
              term,
              date,
              start_time,
              end_time,
              course_name,
              instructor_name,
            } = item;

            const startDateTimeString = `${date}T${start_time}`;
            const endDateTimeString = `${date}T${end_time}`;

            const startMoment = moment(startDateTimeString);
            const endMoment = moment(endDateTimeString);

            let eventColor = '#fca5a5'; // default (Light Red)
            let calendarName = 'Schedule'; // Default calendar for scheduled events

            if (course_name?.includes('Community Sponsored Project')) {
              eventColor = '#60a5fa'; // Blue-400
              calendarName = 'Community Sponsored Project';
            } else if (course_name?.includes('Mobile and Windows Store Development')) {
              eventColor = '#a78bfa'; // Purple-400
              calendarName = 'Mobile and Windows Store Development';
            } else if (instructor_name?.includes('Fahad Hasan Siam')) {
              eventColor = '#8b5cf6'; // Changed to Purple-500 based on image
              // Events by Fahad Hasan Siam will now fall under 'Schedule' or 'My To Do Events' if user-created
              // No specific calendar type for 'Fahad Hasan Siam (Personal)' from scheduled events
            } else if (instructor_name?.includes('Rakesh Vellanki')) {
              eventColor = '#fbbf24'; // Amber-400
              // Events by Rakesh Vellanki will now fall under 'Schedule'
            } else if (term?.includes('BE NCT Ready')) {
              eventColor = '#9ca3af'; // Changed to Gray-4400 based on image
              calendarName = 'BE NCT Ready';
            }
            else if (course_name?.includes('Network Security and Large Data Solutions')) {
                eventColor = '#86efac';
            } else if (course_name?.includes('Statistics for Computer Programmers')) {
                eventColor = '#fca5a5';
            } else if (course_name?.includes('Social Issues') || course_name?.includes('Equity, Diversity and Inclusion in Canada') || course_name?.includes('Positive Psychology') || course_name?.includes('Current Events - The World')) {
                eventColor = '#c084fc';
            } else if (course_name?.includes('Graphically-Driven Project Planning and Design')) {
                eventColor = '#fcd34d';
            } else if (course_name?.includes('Rapid Application Development (RAD) Client-Server Project')) {
                eventColor = '#a5f38a';
            } else if (course_name?.includes('Operating System Administration & Networking Fundamentals')) {
                eventColor = '#bbf7d0';
            } else if (course_name?.includes('Design Patterns for Enterprise Development')) {
                eventColor = '#e879f9';
            } else if (course_name?.includes('NCT Library')) {
                eventColor = '#1f2937';
                calendarName = 'NCT Library';
            } else if (course_name?.includes('NCT Student Activities')) {
                eventColor = '#d1d5db';
                calendarName = 'NCT Student Activities';
            }


            if (startMoment.isValid() && endMoment.isValid()) {
              return {
                title: `${moment(start_time, 'HH:mm:ss').format('h:mma')} ${course_name} - ${instructor_name || ''}`,
                start: startMoment.toDate(),
                end: endMoment.toDate(),
                color: eventColor,
                allDay: false,
                calendar: calendarName, // Use mapped calendarName
              };
            }
            return null;
          })
          .filter(Boolean);

        setScheduledEvents(transformedEvents);
        // console.log('Fetched Raw Scheduled Data:', transformedEvents); // Debugging log

      } catch (error) {
        console.error('Failed to fetch or process schedule data:', error);
      }
    };

    fetchScheduledEvents();
  }, []);

  // Effect to fetch user-created 'My To Do' events from the backend database
  const fetchMyTodoEventsFromDb = useCallback(async () => {
    try {
      const response = await fetch('http://localhost:5000/api/events');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      // console.log('Fetched Raw My To Do Events Data:', data); // Debugging log

      const myTodoDbEvents = data.map(item => {
          const startMoment = moment(item.start_time);
          const endMoment = moment(item.end_time);

          // Parse location string back into type and value
          let parsedLocationType = 'In Person';
          let parsedInPersonLocation = '';
          let parsedOnlineMeetingLink = '';
          if (item.location) {
              if (item.location.startsWith('In Person: ')) {
                  parsedLocationType = 'In Person';
                  parsedInPersonLocation = item.location.replace('In Person: ', '');
              } else if (item.location.startsWith('Online: ')) {
                  parsedLocationType = 'Online';
                  parsedOnlineMeetingLink = item.location.replace('Online: ', '');
              } else {
                  // Fallback for old data or unformatted data
                  parsedLocationType = 'In Person';
                  parsedInPersonLocation = item.location;
              }
          }

          return {
              id: item.id,
              title: item.title,
              start: startMoment.isValid() ? startMoment.toDate() : new Date(), // Fallback for invalid date
              end: endMoment.isValid() ? endMoment.toDate() : new Date(), // Fallback for invalid date
              color: item.color || '#3b82f6', // Use new default color
              allDay: false,
              calendar: item.calendar_type,
              location: item.location || '', // Keep original for display if needed
              locationType: parsedLocationType, // New field for internal state
              inPersonLocation: parsedInPersonLocation, // New field for internal state
              onlineMeetingLink: parsedOnlineMeetingLink, // New field for internal state
              event_recipient_email: item.event_recipient_email || '',
              enable_event_reminder: item.enable_event_reminder === 1 ? true : false,
          };
      }).filter(Boolean); // Filter out any nulls from invalid dates if they somehow slip through

      setMyTodoEvents(myTodoDbEvents);
      // console.log('Fetched My To Do Events (transformed):', myTodoDbEvents); // Debugging log
    } catch (error) {
      console.error('Failed to fetch user-created events from backend:', error);
    }
  }, []);

  useEffect(() => {
    fetchMyTodoEventsFromDb();
  }, [fetchMyTodoEventsFromDb]);

  const handleNavigate = useCallback((newDate) => setCurrentDate(newDate), []);
  const handleView = useCallback((newView) => setActiveView(newView), []);

  const handleSelectSlot = useCallback(
    ({ start, end }) => {
      resetModalForm(); // Always reset for a new event
      setSelectedDateForEvent(start);
      setShowEventModal(true);
      setCurrentStep(1); // Always start at the first step for new event
      setTempEventFrom(moment(start).format('HH:mm'));
      setTempEventTo(moment(end).format('HH:mm'));
      setTempEventColor('#3b82f6'); // Default color for new events
      setTempEventRecipientEmail(''); // Default empty for new events
      setTempEnableEventReminder(false); // Default unchecked for new events
      setTempLocationType('In Person'); // Default to In Person for new events
      setTempInPersonLocation('');
      setTempOnlineMeetingLink('');
      setTempShareRecipientEmails(''); // Reset sharing emails for new event
      setTimeValidationError(''); // Clear validation error on new slot selection
    },
    [resetModalForm]
  );

  const handleSelectEvent = useCallback(
    (event) => {
      setEditingEvent(event);
      setSelectedDateForEvent(event.start);
      // Clean up title from time prefix if present
      setTempEventTitle(event.title.includes(moment(event.start).format('h:mma')) ? event.title.replace(`${moment(event.start).format('h:mma')} `, '') : event.title);
      setTempEventFrom(moment(event.start).format('HH:mm'));
      setTempEventTo(moment(event.end).format('HH:mm'));
      setSelectedCalendar(event.calendar);
      setTempEventColor(event.color || '#3b82f6'); // Use new default color
      setTempEventRecipientEmail(event.event_recipient_email || '');
      setTempEnableEventReminder(event.enable_event_reminder || false);

      // Set new location-specific states
      setTempLocationType(event.locationType || 'In Person');
      setTempInPersonLocation(event.inPersonLocation || '');
      setTempOnlineMeetingLink(event.onlineMeetingLink || '');
      setTempShareRecipientEmails(event.shared_with_emails || ''); // Load existing shared emails
      setTimeValidationError(''); // Clear validation error when editing an event

      setShowEventModal(true);
      setCurrentStep(1); // Always start at the first step when editing
    },
    []
  );

  // New: handleEventDrop function for drag and drop
  const handleEventDrop = useCallback(
    ({ event, start, end, isAllDay }) => {
      // Only allow drag and drop for 'My To Do Events'
      if (event.calendar !== 'My To Do Events') {
        alert("Only 'My To Do Events' can be dragged and dropped.");
        return;
      }

      // Create a new event object with updated start and end times
      const updatedEvent = {
        ...event,
        start: start,
        end: end,
        allDay: isAllDay,
      };

      // Update the editing event state to reflect the new position
      setEditingEvent(updatedEvent);
      setSelectedDateForEvent(start); // Set the selected date to the new start date

      // Pre-fill the modal inputs with the updated event data
      setTempEventTitle(updatedEvent.title.includes(moment(updatedEvent.start).format('h:mma')) ? updatedEvent.title.replace(`${moment(updatedEvent.start).format('h:mma')} `, '') : updatedEvent.title);
      setTempEventFrom(moment(updatedEvent.start).format('HH:mm'));
      setTempEventTo(moment(updatedEvent.end).format('HH:mm'));
      setSelectedCalendar(updatedEvent.calendar);
      setTempEventColor(updatedEvent.color || '#3b82f6');
      setTempEventRecipientEmail(updatedEvent.event_recipient_email || '');
      setTempEnableEventReminder(updatedEvent.enable_event_reminder || false);

      // Set new location-specific states from the updated event
      setTempLocationType(updatedEvent.locationType || 'In Person');
      setTempInPersonLocation(updatedEvent.inPersonLocation || '');
      setTempOnlineMeetingLink(updatedEvent.onlineMeetingLink || '');
      setTempShareRecipientEmails(updatedEvent.shared_with_emails || ''); // Load existing shared emails
      setTimeValidationError(''); // Clear validation error when dragging

      setShowEventModal(true); // Show the modal
      setCurrentStep(1); // Ensure modal opens at the first step
    },
    []
  );


  const handleSubmitEvent = useCallback(
    async (e) => {
      e.preventDefault();

      // Perform validation only for the current step's fields
      if (currentStep === 1) { // Event Details validation
        if (!tempEventTitle || !selectedDateForEvent || !tempEventFrom || !tempEventTo) {
          setTimeValidationError('Please fill in all required event details (Title, Date, From, To).');
          return;
        }
        const startDateTimeString = `${moment(selectedDateForEvent).format('YYYY-MM-DD')}T${tempEventFrom}`;
        const now = moment();
        const eventStartTime = moment(startDateTimeString);
        const isToday = moment(selectedDateForEvent).isSame(now, 'day');

        if (isToday && eventStartTime.isBefore(now)) {
          setTimeValidationError('Please select a future time for today\'s event.');
          return;
        } else {
          setTimeValidationError('');
        }

        if (tempLocationType === 'In Person' && !tempInPersonLocation) {
          setTimeValidationError('Please provide an In Person Location.');
          return;
        }
        if (tempLocationType === 'Online' && !tempOnlineMeetingLink) {
          setTimeValidationError('Please provide an Online Meeting Link.');
          return;
        }
      } else if (currentStep === 2) { // Reminders validation
        if (!tempEventRecipientEmail) {
          alert('Please provide a Recipient Email for reminders.');
          return;
        }
      }

      // If it's not the final step, just move to the next step
      if (currentStep < 3) {
        setCurrentStep(prev => prev + 1);
        return;
      }

      // Only proceed with API call if it's the final step (Step 3: Share)
      let finalLocation = '';
      if (tempLocationType === 'In Person') {
        finalLocation = `In Person: ${tempInPersonLocation}`;
      } else if (tempLocationType === 'Online') {
        finalLocation = `Online: ${tempOnlineMeetingLink}`;
      }

      const startDateTimeString = `${moment(selectedDateForEvent).format('YYYY-MM-DD')}T${tempEventFrom}`;
      const endDateTimeString = `${moment(selectedDateForEvent).format('YYYY-MM-DD')}T${tempEventTo}`;

      const eventDataToSend = {
        title: tempEventTitle,
        start_time: moment(startDateTimeString).format('YYYY-MM-DD HH:mm:ss'),
        end_time: moment(endDateTimeString).format('YYYY-MM-DD HH:mm:ss'),
        color: tempEventColor,
        calendar_type: selectedCalendar,
        location: finalLocation, // Use the dynamically created location string
        event_recipient_email: tempEventRecipientEmail,
        enable_event_reminder: tempEnableEventReminder,
      };

      try {
        let response;
        let eventId = editingEvent ? editingEvent.id : null;

        if (editingEvent) {
          response = await fetch(`http://localhost:5000/api/events/${eventId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(eventDataToSend),
          });
          setAnimationMessage('Event Updated Successfully!');
          setAnimationColor(tempEventColor); // Set color to selected event color
        } else {
          response = await fetch('http://localhost:5000/api/events', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(eventDataToSend),
          });
          const newEvent = await response.json();
          eventId = newEvent.id; // Get the ID of the newly created event
          setAnimationMessage('Event Added Successfully!');
          setAnimationColor(tempEventColor); // Set color to selected event color
        }

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        // Handle event sharing if emails are provided (only on final submit)
        if (tempShareRecipientEmails && eventId) {
          const shareEmailsArray = tempShareRecipientEmails.split(',').map(email => email.trim()).filter(email => email.length > 0);
          if (shareEmailsArray.length > 0) {
            const shareResponse = await fetch(`http://localhost:5000/api/events/${eventId}/share`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ recipientEmails: shareEmailsArray }),
            });

            if (!shareResponse.ok) {
              console.error('Error sharing event:', await shareResponse.json());
              // alert('Event saved, but failed to share event. Please check console for details.'); // Removed alert for smoother flow
            } else {
              console.log('Event shared successfully!');
            }
          }
        }

        await fetchMyTodoEventsFromDb();
        resetModalForm();
        setShowSuccessAnimation(true); // Trigger animation on success
        setTimeout(() => {
          setShowSuccessAnimation(false); // Hide animation after 2 seconds
          setAnimationMessage(''); // Clear message
          setAnimationColor('#22c55e'); // Reset color to default green (for next animation)
        }, 2000);

      } catch (error) {
        console.error('Error saving/updating event:', error);
        alert(`Could not save/update event: ${error.message}. Please check the console for details.`);
      }
    },
    [tempEventTitle, selectedDateForEvent, tempEventFrom, tempEventTo, selectedCalendar, tempLocationType, tempInPersonLocation, tempOnlineMeetingLink, tempEventColor, tempEventRecipientEmail, tempEnableEventReminder, tempShareRecipientEmails, editingEvent, fetchMyTodoEventsFromDb, resetModalForm, currentStep]
  );

  const handleDeleteEvent = useCallback(async () => {
    if (!editingEvent || !editingEvent.id) {
      alert('No event selected for deletion.');
      return;
    }

    if (!window.confirm(`Are you sure you want to delete "${editingEvent.title}"?`)) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/events/${editingEvent.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      await fetchMyTodoEventsFromDb();
      resetModalForm();
      setAnimationMessage('Event Deleted Successfully!'); // Set message for deletion
      setAnimationColor('#ef4444'); // Red for delete (Tailwind red-500)
      setShowSuccessAnimation(true); // Trigger animation on success
      setTimeout(() => {
        setShowSuccessAnimation(false); // Hide animation after 2 seconds
        setAnimationMessage(''); // Clear message
        setAnimationColor('#22c55e'); // Reset color to default green
      }, 2000);

    } catch (error) {
      console.error('Error deleting event:', error);
      alert(`Could not delete event: ${error.message}. Please check the console for details.`);
    }
  }, [editingEvent, fetchMyTodoEventsFromDb, resetModalForm]);


  // Handle bell icon click to open subscription prompt
  const handleBellClick = useCallback(() => {
    setShowSubscriptionPrompt(true);
  }, []);

  // Handle subscription form submission
  const handleSubmitSubscription = useCallback(async (e) => {
    e.preventDefault();

    if (!subFirstName || !subLastName || !subEmail || !subNotificationTime) {
      alert('Please fill in all required subscription fields.');
      return;
    }

    const subscriptionData = {
      firstName: subFirstName,
      lastName: subLastName,
      email: subEmail,
      phoneNumber: subPhoneNumber,
      notificationTime: subNotificationTime,
    };

    try {
      const response = await fetch('http://localhost:5000/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(subscriptionData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const result = await response.json();
      console.log('Subscription successful:', result);
      alert('Subscription successful! You will receive reminders as configured.');
      resetSubscriptionForm();
    } catch (error) {
      console.error('Error subscribing:', error);
      alert(`Could not subscribe: ${error.message}. Please check the console for details.`);
    }
  }, [subFirstName, subLastName, subEmail, subPhoneNumber, subNotificationTime, resetSubscriptionForm]);


  // Re-introduced handleCalendarToggle
  const handleCalendarToggle = useCallback((calendarName) => {
    setVisibleCalendars((prev) => ({
      ...prev,
      [calendarName]: !prev[calendarName],
    }));
  }, []);

  // Combine fetched events (scheduled) and user-created (myTodo) events
  const allEvents = useMemo(() => {
    const lowerCaseSearchQuery = searchQuery.toLowerCase();

    const filteredScheduledEvents = scheduledEvents.filter(event => {
      // Filter based on visibleCalendars
      const isVisible = visibleCalendars[event.calendar];
      const matchesTitle = event.title.toLowerCase().includes(lowerCaseSearchQuery);
      const matchesLocation = event.location && event.location.toLowerCase().includes(lowerCaseSearchQuery);

      const isMatch = isVisible && (matchesTitle || matchesLocation);
      return isMatch;
    });

    const filteredMyTodoEvents = myTodoEvents.filter(event => {
      // Filter based on visibleCalendars
      const isVisible = visibleCalendars[event.calendar];
      const matchesTitle = event.title.toLowerCase().includes(lowerCaseSearchQuery);
      const matchesLocation = event.location && event.location.toLowerCase().includes(lowerCaseSearchQuery);

      const isMatch = isVisible && (matchesTitle || matchesLocation);
      return isMatch;
    });

    const combinedFilteredEvents = [...filteredScheduledEvents, ...filteredMyTodoEvents];
    return combinedFilteredEvents;
  }, [scheduledEvents, myTodoEvents, visibleCalendars, searchQuery]); // Added visibleCalendars back to dependencies

  // Filter upcoming My To Do events for display (always only future/current)
  const upcomingMyTodoEvents = useMemo(() => {
    return myTodoEvents.filter(event => moment(event.end).isSameOrAfter(moment(), 'day'))
                       .sort((a, b) => a.start - b.start);
  }, [myTodoEvents]);

  // All My To Do events, sorted, for when "View Previous Events" is toggled
  const allMyTodoEventsSorted = useMemo(() => {
    return myTodoEvents.slice().sort((a, b) => a.start - b.start); // Use slice to avoid mutating original array
  }, [myTodoEvents]);

  // Check if there are any past events to show the "View Previous Events" button
  const hasPastMyTodoEvents = useMemo(() => {
    return myTodoEvents.some(event => moment(event.end).isBefore(moment()));
  }, [myTodoEvents]);

  // Events to actually display in the list based on the toggle
  const eventsToDisplayInList = showPastMyTodoEvents ? allMyTodoEventsSorted : upcomingMyTodoEvents;


  return (
    <div className="flex h-screen bg-gradient-to-br from-indigo-50 to-purple-50 font-sans text-gray-800 transition-colors duration-300">
      {/* Navbar (Sidebar) */}
      <Navbar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col p-8 overflow-hidden">
        <header className="flex justify-between items-center bg-[#36454F] p-5 rounded-xl shadow-lg mb-8 border-b border-gray-100">
          <h1 className="text-2xl font-bold text-white">Calendar Overview</h1>
          <div className="flex items-center space-x-4">
            {/* Only the Subscription button (bell icon) remains */}
            <button
              className="p-2 text-red-600 hover:text-indigo-600 rounded-full hover:bg-gray-100 transition duration-200"
              onClick={handleBellClick}
            >
              🔔𝚜𝚞𝚋𝚜𝚌𝚛𝚒𝚋𝚎
            </button>

            {/* Search and Dark Mode Toggle */}
            <input
              type="text"
              placeholder="Search events..."
              className="px-4 py-2 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-400 transition duration-200"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                // console.log('Search input changed:', e.target.value); // Debugging log
              }}
            />
            <button
                onClick={toggleDarkMode}
                className="p-2 text-gray-600 hover:text-indigo-600 rounded-full hover:bg-gray-100 transition duration-200"
                aria-label="Toggle dark mode"
            >
                {darkMode ? (
                    <Sun className="w-5 h-5 transition-transform duration-300 transform rotate-45" />
                ) : (
                    <Moon className="w-5 h-5 transition-transform duration-300 transform -rotate-45" />
                )}
            </button>
          </div>
        </header>

        {/* Search feedback message */}
        {searchQuery && (
          <div className="mb-4 text-center text-gray-600">
            Searching for: "{searchQuery}" - Found {allEvents.length} events.
          </div>
        )}

        <div className="flex-1 flex space-x-8 overflow-hidden">
          {/* Calendar Section */}
          <div className="flex-grow bg-white p-8 rounded-xl shadow-xl flex flex-col">
            <div className="rbc-toolbar flex justify-between items-center mb-6">
              {/* This is the built-in RBL calendar header, which provides navigation and view buttons */}
              {/* We will remove the custom navigation buttons below to avoid duplication */}
              <div className="flex items-center space-x-3">
                <span className="text-3xl font-extrabold text-gray-900">
                  {moment(currentDate).format('MMMMYYYY')}
                </span>
                {/* Removed custom navigation buttons to avoid duplication */}
              </div>
              {/* The rbc-btn-group for views is part of the default RBL toolbar and is kept */}
            </div>

            <div className="flex-grow">
              <DragAndDropCalendar
                localizer={localizer}
                events={allEvents}
                startAccessor="start"
                endAccessor="end"
                style={{ height: '100%' }}
                selectable
                resizable // Enable resizing of events
                onEventResize={handleEventDrop} // Use handleEventDrop for resize as well
                onEventDrop={handleEventDrop} // Handle event drag and drop
                onSelectSlot={handleSelectSlot}
                onSelectEvent={handleSelectEvent}
                onNavigate={handleNavigate}
                onView={handleView}
                view={activeView}
                date={currentDate}
                components={components}
                // Only 'My To Do Events' are draggable
                draggableAccessor={(event) => event.calendar === 'My To Do Events'}
              />
            </div>
          </div>

          {/* Sidebar for My To Do Events and Calendar Legend */}
          <div className="w-1/4 bg-white p-6 rounded-xl shadow-xl flex flex-col space-y-6 overflow-y-auto">
            {/* My To Do Events List */}
            <div className="flex-1">
              <h2 className="text-xl font-bold text-gray-900 mb-4 border-b pb-2">My To Do Events</h2>
              <div className="space-y-3">
                {eventsToDisplayInList.length > 0 ? (
                  eventsToDisplayInList.map((event) => (
                    <div
                      key={event.id}
                      className="p-3 rounded-lg shadow-sm flex items-center justify-between cursor-pointer"
                      style={{ backgroundColor: event.color, color: 'black' }}
                      onClick={() => handleSelectEvent(event)}
                    >
                      <div>
                        <p className="font-semibold">{event.title}</p>
                        <p className="text-sm">
                          {moment(event.start).format('MMM D,YYYY h:mma')} -{' '}
                          {moment(event.end).format('h:mma')}
                        </p>
                      </div>
                      {moment(event.end).isBefore(moment()) && (
                        <span className="text-xs text-gray-700 italic">Completed</span>
                      )}
                    </div>
                  ))
                ) : (
                  // Show message only if there are no upcoming events AND we are not currently showing past events
                  upcomingMyTodoEvents.length === 0 && !showPastMyTodoEvents && (
                    <p className="text-gray-500 text-sm italic">Currently, you do not have any upcoming events.</p>
                  )
                )}
              </div>
              {hasPastMyTodoEvents && ( // Only show button if there are past events
                <button
                  onClick={() => setShowPastMyTodoEvents(prev => !prev)}
                  className="mt-4 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition duration-200 w-full"
                >
                  {showPastMyTodoEvents ? 'Hide Previous Events' : 'View Previous Events'}
                </button>
              )}
            </div>

            {/* Calendar Legend */}
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-4 border-b pb-2">Calendar Legend</h2>
              <div className="space-y-3">
                {/* My To Do Events checkbox */}
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id={`calendar-My To Do Events`}
                    checked={visibleCalendars['My To Do Events']}
                    onChange={() => handleCalendarToggle('My To Do Events')}
                    className="form-checkbox h-5 w-5 text-indigo-600 rounded focus:ring-indigo-500 cursor-pointer"
                  />
                  <label htmlFor={`calendar-My To Do Events`} className="ml-3 text-gray-700">
                    My To Do Events
                  </label>
                </div>

                {/* Courses Button and Add Subject Icon */}
                <div className="flex items-center justify-between">
                  <button
                    onClick={() => setShowCoursesDropdown(prev => !prev)}
                    className="px-4 py-2 bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200 transition duration-200 flex items-center"
                  >
                    Courses
                    <span className="ml-2">{showCoursesDropdown ? '▲' : '▼'}</span> {/* Arrow indicator */}
                  </button>
                  <button
                    onClick={() => setShowAddSubjectModal(true)}
                    className="p-2 bg-green-100 text-green-700 rounded-full hover:bg-green-200 transition duration-200"
                    title="Add Custom Subject"
                  >
                    +
                  </button>
                </div>

                {/* Conditional rendering for Course checkboxes */}
                {showCoursesDropdown && (
                  <div className="ml-6 space-y-3 mt-2">
                    {/* Hardcoded course types */}
                    {['Community Sponsored Project', 'Mobile and Windows Store Development'].map((calendarName) => (
                      <div key={calendarName} className="flex items-center">
                        <input
                          type="checkbox"
                          id={`calendar-${calendarName}`}
                          checked={visibleCalendars[calendarName]}
                          onChange={() => handleCalendarToggle(calendarName)}
                          className="form-checkbox h-5 w-5 text-indigo-600 rounded focus:ring-indigo-500 cursor-pointer"
                        />
                        <label htmlFor={`calendar-${calendarName}`} className="ml-3 text-gray-700">
                          {calendarName}
                        </label>
                      </div>
                    ))}
                    {/* Dynamically added custom subjects */}
                    {customSubjects.map((subject) => (
                      <div key={subject} className="flex items-center">
                        <input
                          type="checkbox"
                          id={`calendar-${subject}`}
                          checked={visibleCalendars[subject]}
                          onChange={() => handleCalendarToggle(subject)}
                          className="form-checkbox h-5 w-5 text-indigo-600 rounded focus:ring-indigo-500 cursor-pointer"
                        />
                        <label htmlFor={`calendar-${subject}`} className="ml-3 text-gray-700">
                          {subject} (Custom)
                        </label>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Event Modal */}
      {showEventModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
            {/* Progress Indicator - Now clickable buttons */}
            <div className="flex justify-between items-center mb-6 text-gray-500 text-sm font-semibold">
              <button
                type="button"
                onClick={() => setCurrentStep(1)}
                className={`flex-1 text-center px-2 py-1 rounded-md transition-colors duration-200 ${currentStep === 1 ? 'bg-indigo-100 text-indigo-700' : 'hover:bg-gray-100'}`}
              >
                1. Event Details
              </button>
              <div className="w-4 h-px bg-gray-300 mx-2"></div> {/* Separator */}
              <button
                type="button"
                onClick={() => setCurrentStep(2)}
                className={`flex-1 text-center px-2 py-1 rounded-md transition-colors duration-200 ${currentStep === 2 ? 'bg-indigo-100 text-indigo-700' : 'hover:bg-gray-100'}`}
              >
                2. Set Reminders
              </button>
              <div className="w-4 h-px bg-gray-300 mx-2"></div> {/* Separator */}
              <button
                type="button"
                onClick={() => setCurrentStep(3)}
                className={`flex-1 text-center px-2 py-1 rounded-md transition-colors duration-200 ${currentStep === 3 ? 'bg-indigo-100 text-indigo-700' : 'hover:bg-gray-100'}`}
              >
                3. Collaborate with Others
              </button>
            </div>

            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
              {currentStep === 1 && (editingEvent ? 'Edit Event' : 'Add New Event')}
              {currentStep === 2 && 'Set Reminders'}
              {currentStep === 3 && 'Collaborate with Others'}
            </h2>

            <form onSubmit={handleSubmitEvent}>
              {/* Step 1: Event Details */}
              {currentStep === 1 && (
                <>
                  <div className="mb-4">
                    <label htmlFor="eventTitle" className="block text-sm font-medium text-gray-700 mb-2">
                      Event Title:
                    </label>
                    <input
                      type="text"
                      id="eventTitle"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 transition duration-200"
                      value={tempEventTitle}
                      onChange={(e) => setTempEventTitle(e.target.value)}
                      required
                    />
                  </div>

                  <div className="mb-4">
                    <label htmlFor="eventDate" className="block text-sm font-medium text-gray-700 mb-2">
                      Date:
                    </label>
                    <input
                      type="date"
                      id="eventDate"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 transition duration-200"
                      value={selectedDateForEvent ? moment(selectedDateForEvent).format('YYYY-MM-DD') : ''}
                      onChange={(e) => setSelectedDateForEvent(moment(e.target.value).toDate())}
                      required
                    />
                  </div>

                  <div className="flex space-x-4 mb-4">
                    <div className="flex-1">
                      <label htmlFor="eventFrom" className="block text-sm font-medium text-gray-700 mb-2">
                        From:
                      </label>
                      <input
                        type="time"
                        id="eventFrom"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 transition duration-200"
                        value={tempEventFrom}
                        onChange={(e) => setTempEventFrom(e.target.value)}
                        required
                      />
                    </div>
                    <div className="flex-1">
                      <label htmlFor="eventTo" className="block text-sm font-medium text-gray-700 mb-2">
                        To:
                      </label>
                      <input
                        type="time"
                        id="eventTo"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 transition duration-200"
                        value={tempEventTo}
                        onChange={(e) => setTempEventTo(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  {timeValidationError && (
                    <p className="text-red-500 text-sm mb-4">{timeValidationError}</p>
                  )}

                  {/* Location Type Selection */}
                  <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                          Location Type:
                      </label>
                      <div className="flex space-x-4">
                          <label className="inline-flex items-center">
                              <input
                                  type="radio"
                                  className="form-radio text-indigo-600"
                                  name="locationType"
                                  value="In Person"
                                  checked={tempLocationType === 'In Person'}
                                  onChange={() => setTempLocationType('In Person')}
                              />
                              <span className="ml-2 text-gray-700">In Person</span>
                          </label>
                          <label className="inline-flex items-center">
                              <input
                                  type="radio"
                                  className="form-radio text-indigo-600"
                                  name="locationType"
                                  value="Online"
                                  checked={tempLocationType === 'Online'}
                                  onChange={() => setTempLocationType('Online')}
                              />
                              <span className="ml-2 text-gray-700">Online</span>
                          </label>
                      </div>
                  </div>

                  {/* Conditional Location Input */}
                  {tempLocationType === 'In Person' && (
                      <div className="mb-4">
                          <label htmlFor="inPersonLocation" className="block text-sm font-medium text-gray-700 mb-2">
                              In Person Location:
                          </label>
                          <input
                              type="text"
                              id="inPersonLocation"
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 transition duration-200"
                              value={tempInPersonLocation}
                              onChange={(e) => setTempInPersonLocation(e.target.value)}
                              required={tempLocationType === 'In Person'}
                          />
                      </div>
                  )}

                  {tempLocationType === 'Online' && (
                      <div className="mb-4">
                          <label htmlFor="onlineMeetingLink" className="block text-sm font-medium text-gray-700 mb-2">
                              Online Meeting Link:
                          </label>
                          <input
                              type="url"
                              id="onlineMeetingLink"
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 transition duration-200"
                              value={tempOnlineMeetingLink}
                              onChange={(e) => setTempOnlineMeetingLink(e.target.value)}
                              placeholder="e.g., https://meet.google.com/abc-xyz"
                              required={tempLocationType === 'Online'}
                          />
                      </div>
                  )}

                  <div className="mb-4">
                    <label htmlFor="eventColor" className="block text-sm font-medium text-gray-700 mb-2">
                      Event Color:
                    </label>
                    <div className="flex space-x-2">
                      {eventColorOptions.map((color) => (
                        <button
                          key={color.hex}
                          type="button"
                          className={`w-8 h-8 rounded-full border-2 ${tempEventColor === color.hex ? 'border-indigo-600 ring-2 ring-indigo-300' : 'border-gray-300'}`}
                          style={{ backgroundColor: color.hex }}
                          onClick={() => setTempEventColor(color.hex)}
                          title={color.name}
                        ></button>
                      ))}
                    </div>
                  </div>

                  <div className="mb-6">
                    <label htmlFor="eventCalendarType" className="block text-sm font-medium text-gray-700 mb-2">
                      Calendar Type:
                    </label>
                    <select
                      id="eventCalendarType"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 transition duration-200"
                      value={selectedCalendar}
                      onChange={(e) => setSelectedCalendar(e.target.value)}
                      required
                    >
                      {/* Filtered calendar types for event creation/editing */}
                      {allCalendarTypes.filter(type => !['BE NCT Ready', 'NCT Library', 'NCT Student Activities', 'Schedule'].includes(type)).map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                  </div>
                </>
              )}

              {/* Step 2: Reminders */}
              {currentStep === 2 && (
                <>
                  <div className="mb-4">
                    <label htmlFor="eventRecipientEmail" className="block text-sm font-medium text-gray-700 mb-2">
                      Recipient Email:
                    </label>
                    <input
                      type="email"
                      id="eventRecipientEmail"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 transition duration-200"
                      value={tempEventRecipientEmail}
                      onChange={(e) => setTempEventRecipientEmail(e.target.value)}
                      required
                    />
                  </div>

                  <div className="mb-6 flex items-center">
                    <input
                      type="checkbox"
                      id="enableEventReminder"
                      className="form-checkbox h-5 w-5 text-indigo-600 rounded focus:ring-indigo-500 cursor-pointer"
                      checked={tempEnableEventReminder}
                      onChange={(e) => setTempEnableEventReminder(e.target.checked)}
                    />
                    <label htmlFor="enableEventReminder" className="ml-2 text-sm font-medium text-gray-700">
                      Enable Reminder for this Event
                    </label>
                  </div>
                </>
              )}

              {/* Step 3: Share */}
              {currentStep === 3 && (
                <>
                  <div className="mb-4">
                    <label htmlFor="shareRecipientEmails" className="block text-sm font-medium text-gray-700 mb-2">
                      Share with Emails (comma-separated):
                    </label>
                    <textarea
                      id="shareRecipientEmails"
                      rows="3"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 transition duration-200"
                      value={tempShareRecipientEmails}
                      onChange={(e) => setTempShareRecipientEmails(e.target.value)}
                      placeholder="e.g., user1@example.com, user2@example.com"
                    ></textarea>
                  </div>
                  <p className="text-sm text-gray-600 mb-6">
                    Invitations will be sent to these email addresses. Sharing is optional.
                  </p>
                </>
              )}

              <div className="flex justify-end space-x-4">
                {editingEvent && currentStep === 1 && ( // Show delete only on first step if editing
                  <button
                    type="button"
                    onClick={handleDeleteEvent}
                    className="px-6 py-2 bg-red-500 text-white font-semibold rounded-lg shadow-md hover:bg-red-600 transition duration-200"
                  >
                    Delete
                  </button>
                )}
                {currentStep > 1 && ( // Show back button from step 2 onwards
                  <button
                    type="button"
                    onClick={() => setCurrentStep(prev => prev - 1)}
                    className="px-6 py-2 border border-gray-300 text-gray-700 font-semibold rounded-lg shadow-md hover:bg-gray-100 transition duration-200"
                  >
                    Back
                  </button>
                )}
                <button
                  type="button"
                  onClick={resetModalForm}
                  className="px-6 py-2 border border-gray-300 text-gray-700 font-semibold rounded-lg shadow-md hover:bg-gray-100 transition duration-200"
                >
                  Cancel
                </button>
                {currentStep < 3 ? ( // Show Next button until the last step
                  <button
                    type="submit" // Use type="submit" to trigger validation and then step change
                    className="px-6 py-2 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 transition duration-200"
                  >
                    Next
                  </button>
                ) : ( // Show Add/Save button on the last step
                  <button
                    type="submit"
                    className="px-6 py-2 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 transition duration-200"
                  >
                    {editingEvent ? 'Save Changes' : 'Add Event'}
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Subscription Prompt Modal */}
      {showSubscriptionPrompt && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm p-6 max-h-[90vh] overflow-y-auto"> {/* Added max-h and overflow-y-auto */}
            <h2 className="text-xl font-bold text-gray-900 mb-4">Subscribe to Reminders?</h2>
            <p className="text-gray-700 mb-6">
              Get notifications for your events and important announcements!
            </p>
            <div className="flex justify-center space-x-4">
              <button
                onClick={() => setShowSubscriptionPrompt(false)}
                className="px-6 py-2 border border-gray-300 text-gray-700 font-semibold rounded-lg shadow-md hover:bg-gray-100 transition duration-200"
              >
                No, Thanks
              </button>
              <button
                onClick={() => {
                  setShowSubscriptionPrompt(false);
                  setShowSubscriptionForm(true);
                }}
                className="px-6 py-2 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 transition duration-200"
                >
                Subscribe Now
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Subscription Form Modal */}
      {showSubscriptionForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto"> {/* Added max-h and overflow-y-auto */}
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
              Subscribe to Reminders
            </h2>
            <form onSubmit={handleSubmitSubscription}>
              <div className="mb-4">
                <label htmlFor="subFirstName" className="block text-sm font-medium text-gray-700 mb-2">
                  First Name:
                </label>
                <input
                  type="text"
                  id="subFirstName"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 transition duration-200"
                  value={subFirstName}
                  onChange={(e) => setSubFirstName(e.target.value)}
                  required
                />
              </div>
              <div className="mb-4">
                <label htmlFor="subLastName" className="block text-sm font-medium text-gray-700 mb-2">
                  Last Name:
                </label>
                <input
                  type="text"
                  id="subLastName"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 transition duration-200"
                  value={subLastName}
                  onChange={(e) => setSubLastName(e.target.value)}
                  required
                />
              </div>
              <div className="mb-4">
                <label htmlFor="subEmail" className="block text-sm font-medium text-gray-700 mb-2">
                  Email:
                </label>
                <input
                  type="email"
                  id="subEmail"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 transition duration-200"
                  value={subEmail}
                  onChange={(e) => setSubEmail(e.target.value)}
                  required
                />
              </div>
              <div className="mb-4">
                <label htmlFor="subPhoneNumber" className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number (Optional):
                </label>
                <input
                  type="tel"
                  id="subPhoneNumber"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 transition duration-200"
                  value={subPhoneNumber}
                  onChange={(e) => setSubPhoneNumber(e.target.value)}
                />
              </div>
              <div className="mb-6">
                <label htmlFor="subNotificationTime" className="block text-sm font-medium text-gray-700 mb-2">
                  Notify Me (minutes before event):
                </label>
                <select
                  id="subNotificationTime"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 transition duration-200"
                  value={subNotificationTime}
                  onChange={(e) => setSubNotificationTime(e.target.value)}
                  required
                >
                  <option value="5">5 minutes</option>
                  <option value="15">15 minutes</option>
                  <option value="30">30 minutes</option>
                  <option value="60">1 hour</option>
                </select>
              </div>
              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={resetSubscriptionForm}
                  className="px-6 py-2 border border-gray-300 text-gray-700 font-semibold rounded-lg shadow-md hover:bg-gray-100 transition duration-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 transition duration-200"
                >
                  Confirm Subscription
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Subject Modal */}
      {showAddSubjectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Add New Subject</h2>
            <form onSubmit={(e) => {
              e.preventDefault();
              if (newSubjectName.trim()) {
                setCustomSubjects(prev => [...prev, newSubjectName.trim()]);
                // Ensure new custom subject is visible by default
                setVisibleCalendars(prev => ({ ...prev, [newSubjectName.trim()]: true }));
                setNewSubjectName('');
                setShowAddSubjectModal(false);
              } else {
                alert('Subject name cannot be empty.');
              }
            }}>
              <div className="mb-4">
                <label htmlFor="newSubjectName" className="block text-sm font-medium text-gray-700 mb-2">
                  Subject Name:
                </label>
                <input
                  type="text"
                  id="newSubjectName"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 transition duration-200"
                  value={newSubjectName}
                  onChange={(e) => setNewSubjectName(e.target.value)}
                  required
                />
              </div>
              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => {
                    setNewSubjectName('');
                    setShowAddSubjectModal(false);
                  }}
                  className="px-6 py-2 border border-gray-300 text-gray-700 font-semibold rounded-lg shadow-md hover:bg-gray-100 transition duration-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 transition duration-200"
                >
                  Add Subject
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Success Animation */}
      {showSuccessAnimation && (
        <div className="fixed inset-0 flex items-center justify-center z-[1000]">
          <div className="text-white rounded-full p-6 shadow-lg flex flex-col items-center justify-center animate-pop-fade"
               style={{ width: '150px', height: '150px', backgroundColor: animationColor }}> {/* Use animationColor here */}
            <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
            </svg>
            {animationMessage && (
              <p className="mt-2 text-sm font-bold text-center font-sans"> {/* Added text with styling */}
                {animationMessage}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Inline styles for animation keyframes */}
      <style jsx>{`
        @keyframes pop-fade {
          0% {
            transform: scale(0.5);
            opacity: 0;
          }
          50% {
            transform: scale(1.1);
            opacity: 1;
          }
          100% {
            transform: scale(1);
            opacity: 0;
          }
        }
        .animate-pop-fade {
          animation: pop-fade 2s ease-out forwards;
        }
      `}</style>
    </div>
  );
}

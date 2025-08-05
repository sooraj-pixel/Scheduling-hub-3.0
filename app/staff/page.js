'use client'
import Layout from '@/components/design/Layout'
import Section from '@/components/Section'
import React, { useEffect, useState, useRef, useMemo, useCallback } from 'react'
import UploadButton from '@/components/UploadButton'
import { useUserRole } from '@/components/UserContext'
import { notFound } from 'next/navigation'

// FullCalendar Imports
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'

// shadcn/ui Components
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

// Lucide React Icon (Assuming these are still desired and part of your setup)
import { Search, CalendarIcon } from 'lucide-react'

// XLSX for Excel export (kept as per previous request)
import * as XLSX from 'xlsx'

// Import moment.js (already used for FullCalendar)
import moment from 'moment';


const Staff = () => {
    const { role } = useUserRole()
    const [scheduleData, setScheduleData] = useState([]) // Raw data from API
    const [view, setView] = useState('dayGridMonth') // default view for FullCalendar
    const [calendarEvents, setCalendarEvents] = useState([]) // Events formatted for FullCalendar
    const [overlapWarnings, setOverlapWarnings] = useState([]) // Stores all detected overlaps
    const [searchInstructor, setSearchInstructor] = useState('') // For the search input field
    const calendarRef = useRef(null) // Ref to access FullCalendar's API
    // State to store the currently visible date range of the calendar for filtering
    const [currentCalendarRange, setCurrentCalendarRange] = useState({ start: null, end: null });
    // State for the date picker selected date (using string for native input type="date")
    const [selectedDateInput, setSelectedDateInput] = useState(new Date().toISOString().split('T')[0]);

    // NEW STATE: To toggle between list view and calendar view
    const [showCalendarView, setShowCalendarView] = useState(false);

    // Grouped data for the original list view
    const groupByDate = (data) => {
        return data.reduce((acc, item) => {
            // Use moment for robust date parsing
            const dateMoment = moment(item.start_date);
            const dateKey = dateMoment.isValid() ? dateMoment.format("YYYY-MM-DD") : 'Unknown Date'; // Extract YYYY-MM-DD
            if (!acc[dateKey]) {
                acc[dateKey] = [];
            }
            acc[dateKey].push(item);
            return acc;
        }, {});
    };
    const scheduleByWeek = useMemo(() => groupByDate(scheduleData), [scheduleData]);

    // Filtered events for FullCalendar based on search instructor
    const filteredCalendarEvents = useMemo(() => {
        if (!searchInstructor) {
            return calendarEvents;
        }
        const lowerCaseSearch = searchInstructor.toLowerCase();
        return calendarEvents.filter(event =>
            event.extendedProps.staffName && event.extendedProps.staffName.toLowerCase().includes(lowerCaseSearch)
        );
    }, [calendarEvents, searchInstructor]);


    // Effect to navigate FullCalendar when a date is selected from the picker input
    useEffect(() => {
        if (calendarRef.current && selectedDateInput) {
            setTimeout(() => {
                calendarRef.current.getApi().gotoDate(selectedDateInput);
            }, 0);
        }
    }, [selectedDateInput]);
    
    // Role check (assuming role 1 is authorized)
    // This block now renders a custom "Access Denied" message instead of calling notFound()
    if (role !== 1 && role !== undefined) {
        return (
            <Layout>
                <Section title={"Access Denied"}>
                    <div className="flex flex-col items-center justify-center h-full py-20 text-center">
                        <h2 className="text-3xl font-bold text-gray-800 mb-4">Permission Denied</h2>
                        <p className="text-gray-600 mb-6">You do not have the necessary permissions to view this page.</p>
                        <p className="text-sm text-gray-500">
                            Your current role: <span className="font-semibold">{role === null ? 'Not Logged In' : role}</span>.
                            This page requires role: <span className="font-semibold">1 (Staff)</span>.
                        </p>
                    </div>
                </Section>
            </Layout>
        );
    }

    // Fetch schedule data on component mount
    useEffect(() => {
        getSchedule()
    }, [])

    // Re-detect overlaps whenever scheduleData changes
    useEffect(() => {
        if (scheduleData.length > 0) {
            detectOverlaps(scheduleData);
        } else {
            setOverlapWarnings([]);
        }
    }, [scheduleData]);

    const getSchedule = async () => {
        try {
            const res = await fetch('/api/upload/staff')
            if (!res.ok) {
                // FIX: Corrected template literal syntax
                throw new Error(`HTTP error! status: ${res.status}`);
            }
            const result = await res.json()

            console.log("Raw API Result for schedule:", result);
            
            setScheduleData(result); // Keep raw data for list view

            // Transform to FullCalendar format
            const formattedEvents = result.map((item) => {
                // ADDED DEBUGGING: Log raw date strings
                console.log("Processing item:", item);
                console.log("Raw start_date from API:", item.start_date);
                console.log("Raw end_date from API:", item.end_date);

                // Use moment for robust date parsing with explicit format
                // Assuming MySQL DATETIME comes as "YYYY-MM-DD HH:mm:ss"
                const startMoment = moment(item.start_date, 'YYYY-MM-DD HH:mm:ss'); 
                let endMoment = moment(item.end_date, 'YYYY-MM-DD HH:mm:ss'); 
                
                // ADDED DEBUGGING: Log moment validity
                console.log("startMoment isValid:", startMoment.isValid(), "Value:", startMoment.toISOString());
                console.log("endMoment isValid:", endMoment.isValid(), "Value:", endMoment.toISOString());

                if (!startMoment.isValid()) {
                    console.warn("Skipping event for FullCalendar formatting due to invalid start date string:", item, item.start_date);
                    return null;
                }

                if (!endMoment.isValid()) {
                    console.warn("Skipping event for FullCalendar formatting due to invalid end date string:", item, item.end_date);
                    // Fallback to 1-hour duration if end date is invalid
                    endMoment = startMoment.clone().add(1, 'hour'); 
                }
                
                // Determine the staff name for display. Robust extraction.
                let staffDisplayName = 'Unknown Staff';
                if (item.title && typeof item.title === 'string' && item.title.trim() !== '') {
                    if (item.title.includes('Onsite:')) {
                        staffDisplayName = item.title.replace('Onsite: ', '').trim();
                    } else { // If title exists but doesn't have "Onsite:", use it directly
                        staffDisplayName = item.title.trim();
                    }
                } else if (item.name && typeof item.name === 'string' && item.name.trim() !== '') {
                    staffDisplayName = item.name.trim();
                } else if (item.team && typeof item.team === 'string' && item.team.trim() !== '') {
                    staffDisplayName = item.team.trim(); // Fallback to 'team' if 'name' not found
                }

                return {
                    id: item.id || `${startMoment.toISOString()}-${staffDisplayName}`, // Fallback ID
                    title: `Onsite: ${staffDisplayName}`, // FullCalendar event title
                    start: startMoment.toDate(), // FullCalendar expects Date objects
                    end: endMoment.toDate(),     // FullCalendar expects Date objects
                    allDay: false,              // Set to false to show time and allow stacking
                    extendedProps: {
                        staffName: staffDisplayName, // Pass extracted staff name for eventContent
                        originalItem: item, // Keep original item for easy reference
                    },
                    color: '#3788d8', // Changed to a shade of blue for events
                    textColor: '#ffffff',
                };
            }).filter(Boolean); // Filter out any null entries from invalid data

            console.log("Formatted Calendar Events for FullCalendar (after mapping):", formattedEvents);
            setCalendarEvents(formattedEvents);

        } catch (error) {
            console.error("Failed to fetch schedule:", error);
        }
    }

    // Function to detect overlaps
    const detectOverlaps = useCallback((data) => {
        const conflicts = [];
        // Sort events by their actual start datetime for accurate overlap checking
        const sortedEvents = [...data].sort((a, b) => {
            // Use moment for robust date parsing and comparison
            const dateA = moment(a.start_date, 'YYYY-MM-DD HH:mm:ss');
            const dateB = moment(b.start_date, 'YYYY-MM-DD HH:mm:ss');
            return dateA.diff(dateB);
        });

        const staffBookings = new Map();
        const dayBookings = new Map();

        sortedEvents.forEach(event => {
            // Use moment for robust date parsing with explicit format
            const eventStart = moment(event.start_date, 'YYYY-MM-DD HH:mm:ss'); 
            const eventEnd = moment(event.end_date, 'YYYY-MM-DD HH:mm:ss');

            if (!eventStart.isValid() || !eventEnd.isValid()) {
                console.warn("Skipping event for overlap detection due to invalid date/time:", event);
                return;
            }

            // Safely extract staffName for conflict detection
            let staffName = 'Unknown Staff';
            if (event.title && typeof event.title === 'string' && event.title.trim() !== '') {
                if (event.title.includes('Onsite:')) {
                    staffName = event.title.replace('Onsite: ', '').trim();
                } else {
                    staffName = event.title.trim();
                }
            } else if (event.name && typeof event.name === 'string' && event.name.trim() !== '') {
                staffName = event.name.trim();
            } else if (event.team && typeof event.team === 'string' && event.team.trim() !== '') {
                staffName = event.team.trim();
            }

            // --- Check for Staff Conflicts ---
            if (!staffBookings.has(staffName)) {
                staffBookings.set(staffName, []);
            }
            const currentStaffBookings = staffBookings.get(staffName);

            for (const existingBooking of currentStaffBookings) {
                // Check for actual time overlap. An overlap occurs if (start1 < end2) and (start2 < end1)
                if (eventStart.isBefore(existingBooking.end) && existingBooking.start.isBefore(eventEnd)) {
                    const conflictKey = `staff-${staffName}-${eventStart.toISOString()}-${existingBooking.start.toISOString()}`; // More precise key
                    if (!conflicts.some(c => c.conflictKey === conflictKey)) { // Check only the generated key
                         conflicts.push({
                            type: 'staff_double_booking',
                            message: `Double booking for ${staffName} on ${eventStart.format('L')} from ${eventStart.format('LT')} to ${eventEnd.format('LT')}.`,
                            involvedStaff: [staffName],
                            details: [
                                { id: event.id, staff: staffName, start: eventStart.toISOString(), end: eventEnd.toISOString() }, 
                                { id: existingBooking.id, staff: existingBooking.staff, start: existingBooking.start.toISOString(), end: existingBooking.end.toISOString() }
                            ],
                            conflictKey: conflictKey
                        });
                    }
                }
            }
            currentStaffBookings.push({
                id: event.id, staff: staffName, start: eventStart, end: eventEnd, originalItem: event // Store original item with parsed moments
            });

            // --- Check for General Overlap ---
            const dateKey = eventStart.format('YYYY-MM-DD');
            if (!dayBookings.has(dateKey)) {
                dayBookings.set(dateKey, []);
            }
            const currentDayBookings = dayBookings.get(dateKey);

            for (const existingBooking of currentDayBookings) {
                // Only consider overlap if different events and they actually overlap in time
                if (event.id !== existingBooking.id && eventStart.isBefore(existingBooking.end) && existingBooking.start.isBefore(eventEnd)) {
                    const involvedStaffNames = [...new Set([staffName, existingBooking.staff])];
                    const conflictKey = `general-${dateKey}-${eventStart.toISOString()}-${existingBooking.start.toISOString()}-${involvedStaffNames.sort().join('-')}`;

                    const alreadyAdded = conflicts.some(c => c.conflictKey === conflictKey);
                    if (!alreadyAdded) {
                        conflicts.push({
                            type: 'general_overlap',
                            message: `General overlap detected on ${eventStart.format('L')}: ${staffName} from ${eventStart.format('LT')} to ${eventEnd.format('LT')} and ${existingBooking.staff} from ${existingBooking.start.format('LT')} to ${existingBooking.end.format('LT')}.`,
                            involvedStaff: involvedStaffNames,
                            details: [
                                { id: event.id, staff: staffName, start: eventStart.toISOString(), end: eventEnd.toISOString() },
                                { id: existingBooking.id, staff: existingBooking.staff, start: existingBooking.start.toISOString(), end: existingBooking.end.toISOString() }
                            ],
                            conflictKey: conflictKey
                        });
                    }
                }
            }
            currentDayBookings.push({
                id: event.id, staff: staffName, start: eventStart, end: eventEnd, originalItem: event
            });
        });
        setOverlapWarnings(conflicts);
        console.log("Detected Overlaps (full list):", conflicts);
    }, []);

    // Filter overlap warnings based on the current calendar view range
    const displayedOverlapWarnings = useMemo(() => {
        if (!currentCalendarRange.start || !currentCalendarRange.end || overlapWarnings.length === 0) {
            return [];
        }

        const viewStart = moment(currentCalendarRange.start);
        const viewEnd = moment(currentCalendarRange.end);

        return overlapWarnings.filter(warn => {
            return warn.details.some(detail => {
                const eventStart = moment(detail.start);
                const eventEnd = moment(detail.end);
                const overlaps = (eventStart.isBefore(viewEnd) && viewStart.isBefore(eventEnd));
                return overlaps;
            });
        });
    }, [overlapWarnings, currentCalendarRange]);


    const OverlapWarningDisplay = () => {
        if (displayedOverlapWarnings.length === 0) {
            return null;
        }

        const staffInConflict = new Set();
        displayedOverlapWarnings.forEach(warning => {
            warning.involvedStaff.forEach(staff => staffInConflict.add(staff));
        });

        const staffList = Array.from(staffInConflict).sort().map(name => `Onsite: ${name}`).join(', ');

        return (
            <div className="bg-yellow-100 text-yellow-800 px-4 py-2 rounded-md mb-6 font-semibold border-l-4 border-yellow-500 shadow-md">
                <p className="flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-triangle-alert"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>
                    Warning: Double booking or overlap detected with: {staffList}.
                </p>
                 <ul className="list-disc pl-8 mt-3 text-sm text-yellow-700">
                    {displayedOverlapWarnings.map((warn, index) => (
                        <li key={index} className="mb-1">
                            {warn.message}
                            {warn.details && (
                                <span className="ml-2 text-gray-700 font-normal">
                                    (
                                    {warn.details.map((d, i) => (
                                        <span key={i}>
                                            {d.staff} {moment(d.start).format('LT')} - {moment(d.end).format('LT')}
                                            {i < warn.details.length - 1 ? ' vs ' : ''}
                                        </span>
                                    ))}
                                    )
                                </span>
                            )}
                        </li>
                    ))}
                </ul>
            </div>
        );
    };

    const handleTodayClick = useCallback(() => {
        if (calendarRef.current) {
            calendarRef.current.getApi().today();
        }
    }, []);

    const handlePrevClick = useCallback(() => {
        if (calendarRef.current) {
            calendarRef.current.getApi().prev();
        }
    }, []);

    const handleNextClick = useCallback(() => {
        if (calendarRef.current) {
            calendarRef.current.getApi().next();
        }
    }, []);

    const renderEventContent = useCallback((eventInfo) => {
        // Use moment for robust date parsing
        const eventStart = moment(eventInfo.event.start);
        const eventEnd = moment(eventInfo.event.end);
        
        if (!eventStart.isValid() || !eventEnd.isValid()) {
            console.warn("Invalid event dates, returning null for event content:", eventInfo.event);
            return null;
        }
        const startTime = eventStart.format('h:mmA');
        const endTime = eventEnd.format('h:mmA');
        let staffName = eventInfo.event.extendedProps.staffName;

        // If staffName is not found or is our default 'Unknown Staff', use a clearer placeholder
        if (!staffName || staffName.trim() === '' || staffName === 'Unknown Staff') {
            staffName = '(No Instructor)';
            console.warn(`Event ID ${eventInfo.event.id}: Using placeholder for staff name. Original data: ${JSON.stringify(eventInfo.event.extendedProps.originalItem)}`);
        }

        const backgroundColorClass = 'bg-blue-600';

        // Using native title attribute for tooltip instead of tippy.js
        const titleContent = `
            ${staffName}
            Time: ${startTime} - ${endTime}
            Date: ${eventStart.format('L')}
            Team: ${eventInfo.event.extendedProps.originalItem?.team || 'N/A'}
        `;

        return (
            <div 
                className={`flex flex-col justify-center items-start text-sm py-0.5 px-1 ${backgroundColorClass} text-white rounded-sm overflow-hidden text-ellipsis h-full w-full`} 
                style={{ whiteSpace: 'normal', minWidth: '80px', minHeight: '30px' }}
                title={titleContent} // Using native title attribute
            >
                <span className="font-semibold">{staffName}</span>
                <span className="text-xs">{startTime} - {endTime}</span>
            </div>
        );
    }, []);

    // Removed useEffect for Tippy.js tooltips as it's no longer used.

    const [calendarTitle, setCalendarTitle] = useState('Loading...');

    // Effect to update the calendar title when view or events change
    useEffect(() => {
        if (calendarRef.current) {
            const calendarApi = calendarRef.current.getApi();
            const updateTitleAndRange = () => {
                const currentView = calendarApi.view.type;
                const currentDate = calendarApi.getDate();
                let title = '';

                if (currentView === 'dayGridMonth') {
                    title = moment(currentDate).format('MMMM YYYY');
                } else if (currentView === 'timeGridWeek') {
                    const start = moment(calendarApi.view.currentStart);
                    const end = moment(calendarApi.view.currentEnd);
                    title = `${start.format('MMM D')} - ${end.format('MMM D, YYYY')}`;
                } else if (currentView === 'timeGridDay') {
                    title = moment(currentDate).format('dddd, MMMM D, YYYY');
                }
                setCalendarTitle(title);

                setCurrentCalendarRange({
                    start: calendarApi.view.currentStart,
                    end: calendarApi.view.currentEnd
                });
            };
            updateTitleAndRange();
        }
    }, [view, calendarEvents]);


    // ✅ Excel export function (kept as it uses the XLSX package)
    const handleDownloadExcel = () => {
        const dataToExport = showCalendarView
            ? filteredCalendarEvents.map(event => ({ // Use filteredCalendarEvents for calendar view export
                Date: moment(event.start).format('YYYY-MM-DD'),
                Name: event.extendedProps.staffName || 'Unknown',
                Team: event.extendedProps.originalItem?.team || 'N/A', // Add team to calendar export
                StartTime: moment(event.start).format('HH:mm'),
                EndTime: moment(event.end).format('HH:mm'),
            }))
            : Object.entries(scheduleByWeek).flatMap(([date, items]) => // Use scheduleByWeek for list view export
                items.map(item => ({
                    Date: date,
                    Team: item.team || '-',
                    Name: item.name || item.title?.replace('Onsite: ', '') || '-',
                    StartTime: moment(item.start_date).format('HH:mm'),
                    EndTime: moment(item.end_date).format('HH:mm'),
                }))
            );

        const worksheet = XLSX.utils.json_to_sheet(dataToExport);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Staff Schedule');
        XLSX.writeFile(workbook, 'Staff_Schedule.xlsx');
    };


    return (
        <Layout>
            <Section title={'Staff Onsite Working Schedule'}>
                {role === 1 && (
                    <div className="mb-6 flex justify-between items-center">
                        <UploadButton apiEndPoint={"staff"} getData={getSchedule} />
                        <Button
                            onClick={() => setShowCalendarView(!showCalendarView)}
                            className="px-6 py-2 rounded-md shadow-md hover:shadow-lg transition-all duration-200 ease-in-out"
                        >
                            {showCalendarView ? 'Show List View' : 'Show Calendar View'}
                        </Button>
                    </div>
                )}

                {showCalendarView ? (
                    /* FullCalendar View */
                    <div className="bg-white p-6 rounded-lg shadow-xl border border-gray-200">
                        {/* Top Bar: Search and Date Input */}
                        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
                            <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:max-w-xs"> {/* Group search and date picker */}
                                <div className="relative flex items-center w-full sm:max-w-xs">
                                    <Input
                                        type="text"
                                        placeholder="Search Instructor"
                                        className="pr-10 border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-md shadow-sm"
                                        value={searchInstructor}
                                        onChange={(e) => setSearchInstructor(e.target.value)}
                                    />
                                    <Search className="absolute right-3 h-5 w-5 text-gray-400" />
                                </div>
                                <div className="relative flex items-center w-full sm:w-auto">
                                    <Input
                                        type="date"
                                        value={selectedDateInput}
                                        onChange={(e) => setSelectedDateInput(e.target.value)}
                                        className="pr-8 border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-md shadow-sm"
                                    />
                                    <CalendarIcon className="absolute right-3 h-5 w-5 text-gray-400 pointer-events-none" />
                                </div>
                            </div>
                            {/* View Buttons (Month, Week, Day) */}
                            <div className="flex space-x-2 flex-wrap justify-center sm:justify-end">
                                <Button
                                    variant={view === 'timeGridDay' ? 'default' : 'outline'}
                                    onClick={() => setView('timeGridDay')}
                                    className="min-w-[80px]"
                                >
                                    Day
                                </Button>
                                <Button
                                    variant={view === 'timeGridWeek' ? 'default' : 'outline'}
                                    onClick={() => setView('timeGridWeek')}
                                    className="min-w-[80px]"
                                >
                                    Week
                                </Button>
                                <Button
                                    variant={view === 'dayGridMonth' ? 'default' : 'default'}
                                    onClick={() => setView('dayGridMonth')}
                                    className="min-w-[80px]"
                                >
                                    Month
                                </Button>
                            </div>
                        </div>

                        {/* Overlap Warning Display */}
                        <OverlapWarningDisplay />

                        {/* FullCalendar Container */}
                        <div className="fullcalendar-container bg-gray-50 p-4 rounded-lg shadow-inner border border-gray-100">
                            {/* Custom Calendar Header Navigation */}
                            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-4">
                                <div className="flex space-x-2 flex-wrap justify-center sm:justify-start">
                                    <Button
                                        variant={view === 'dayGridMonth' ? 'default' : 'ghost'}
                                        onClick={() => setView('dayGridMonth')}
                                        size="sm"
                                    >
                                        Month
                                    </Button>
                                    <Button
                                        variant={view === 'timeGridWeek' ? 'default' : 'ghost'}
                                        onClick={() => setView('timeGridWeek')}
                                        size="sm"
                                    >
                                        Week
                                    </Button>
                                    <Button
                                        variant={view === 'timeGridDay' ? 'default' : 'ghost'}
                                        onClick={() => setView('timeGridDay')}
                                        size="sm"
                                    >
                                        Day
                                    </Button>
                                </div>
                                <div className="flex items-center space-x-4 flex-wrap justify-center sm:justify-end">
                                    <Button variant="outline" onClick={handleTodayClick} size="sm">
                                        Today
                                    </Button>
                                    <div className="flex items-center space-x-1">
                                        <Button variant="ghost" onClick={handlePrevClick} size="icon">
                                            &lt;
                                        </Button>
                                        <span className="font-semibold text-lg text-gray-800 min-w-[150px] text-center">
                                            {calendarTitle}
                                        </span>
                                        <Button variant="ghost" onClick={handleNextClick} size="icon">
                                            &gt;
                                        </Button>
                                    </div>
                                </div>
                            </div>

                            <FullCalendar
                                key={view}
                                ref={calendarRef}
                                plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                                initialView={view}
                                events={filteredCalendarEvents}
                                height="auto"
                                headerToolbar={false}
                                eventContent={renderEventContent}
                                eventOverlap={false}
                                slotMinTime="08:00:00"
                                slotMaxTime="20:00:00"
                                timeZone="local"
                                allDaySlot={true} 
                                allDayText={''}
                                forceEventDuration={true}
                                defaultAllDayEventDuration={{ hour: 1 }}
                                
                                datesSet={(dateInfo) => {
                                    if (calendarRef.current) {
                                        const calendarApi = calendarRef.current.getApi();
                                        const currentView = calendarApi.view.type;
                                        const currentDate = calendarApi.getDate();
                                        let title = '';

                                        if (currentView === 'dayGridMonth') {
                                            title = moment(currentDate).format('MMMM YYYY');
                                        } else if (currentView === 'timeGridWeek') {
                                            const start = moment(calendarApi.view.currentStart);
                                            const end = moment(calendarApi.view.currentEnd);
                                            title = `${start.format('MMM D')} - ${end.format('MMM D, YYYY')}`;
                                        } else if (currentView === 'timeGridDay') {
                                            title = moment(currentDate).format('dddd, MMMM D, YYYY');
                                        }
                                        setCalendarTitle(title);

                                        setCurrentCalendarRange({
                                            start: calendarApi.view.currentStart,
                                            end: calendarApi.view.currentEnd
                                        });
                                    }
                                }}
                            />
                        </div>
                    </div>
                ) : (
                    /* Original List View */
                    <div className="p-6 bg-white rounded-lg shadow-xl border border-gray-200">
                        {Object.entries(scheduleByWeek).length === 0 ? (
                            <p className="text-center text-gray-500 py-8">No schedule data available. Please upload a schedule.</p>
                        ) : (
                            Object.entries(scheduleByWeek).map(([date, schedules]) => {
                                // FIX: Use moment for robust date parsing for displayDate
                                const displayDate = moment(date); 
                                const dayName = displayDate.format("dddd"); // Format day name

                                return (
                                    <div key={date} className="bg-gray-50 shadow-md rounded-lg p-6 mb-6 border border-gray-100">
                                        <h2 className="text-xl font-bold mb-4 text-gray-800">
                                            Date: {displayDate.format('L')} ({dayName}) {/* Format date for display */}
                                        </h2>

                                        <div className="overflow-x-auto">
                                            <table className="min-w-full divide-y divide-gray-200">
                                                <thead className="bg-gray-100">
                                                    <tr>
                                                        <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider rounded-tl-lg">
                                                            Team
                                                        </th>
                                                        <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                                            Name
                                                        </th>
                                                        <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider rounded-tr-lg">
                                                            Time
                                                        </th>
                                                    </tr>
                                                </thead>
                                                <tbody className="bg-white divide-y divide-gray-200">
                                                    {schedules.map((schedule, index) => {
                                                        // FIX: Use moment for robust date parsing and formatting
                                                        const eventStart = moment(schedule.start_date);
                                                        const eventEnd = moment(schedule.end_date);

                                                        let startTime = 'Invalid Time';
                                                        let endTime = 'Invalid Time';

                                                        if (eventStart.isValid()) {
                                                            startTime = eventStart.format('h:mmA'); // Format to e.g., "9:00AM"
                                                        } else {
                                                            console.warn("Invalid start date encountered for table display:", schedule.start_date);
                                                        }

                                                        if (eventEnd.isValid()) {
                                                            endTime = eventEnd.format('h:mmA'); // Format to e.g., "5:00PM"
                                                        } else {
                                                            console.warn("Invalid end date encountered for table display:", schedule.end_date);
                                                        }
                                                        
                                                        return (
                                                            <tr key={schedule.id || index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                                    {schedule.team || 'N/A'}
                                                                </td>
                                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                                                    {schedule.name || schedule.title?.replace('Onsite: ', '').trim() || 'N/A'}
                                                                </td>
                                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                                                    {startTime} - {endTime}
                                                                </td>
                                                            </tr>
                                                        );
                                                    })}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                )}
            </Section>
        </Layout>
    )
}

export default Staff

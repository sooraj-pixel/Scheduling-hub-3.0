"use client";

import React, { useState, useCallback, useMemo, useEffect, useRef } from "react";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import * as XLSX from "xlsx";

import NoteInput from "../../components/NoteInput";

import "react-big-calendar/lib/css/react-big-calendar.css";
import "./calendar-overrides.css";

const localizer = momentLocalizer(moment);

const getRandomColor = () => {
  const lightLetters = "89ABCDEF";
  let color = "#";
  for (let i = 0; i < 6; i++) {
    color += lightLetters.charAt(Math.floor(Math.random() * lightLetters.length));
  }
  return color;
};

const CustomEvent = ({ event }) => (
  <div
    style={{
      backgroundColor: event.color,
      padding: "2px 5px",
      borderRadius: "4px",
      fontSize: "0.75rem",
      lineHeight: "1rem",
      color: "black",
      overflow: "hidden",
      wordWrap: "break-word",
      height: "auto",
      minHeight: "20px",
    }}
  >
    {event.title}
  </div>
);

export default function CalendarPage({ selectedTerm, terms = [] /* optionally pass terms */ }) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState([]);
  const [activeView, setActiveView] = useState("month");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [notes, setNotes] = useState([]);
  const [isAdmin] = useState(true);
  const fileInputRef = useRef(null);

  // Term state inside calendar (sync with prop)
  const [term, setTerm] = useState(selectedTerm || "All Terms");

  useEffect(() => {
    setTerm(selectedTerm || "All Terms");
  }, [selectedTerm]);

  const components = useMemo(() => ({ event: CustomEvent }), []);

  const saveNote = useCallback((newOrUpdatedNote) => {
    setNotes((prevNotes) => {
      const index = prevNotes.findIndex((note) => note.timestamp === newOrUpdatedNote.timestamp);
      if (index > -1) {
        const updatedNotes = [...prevNotes];
        updatedNotes[index] = newOrUpdatedNote;
        return updatedNotes;
      } else {
        return [...prevNotes, newOrUpdatedNote];
      }
    });
  }, []);

  const deleteNote = useCallback((noteTimestamp) => {
    setNotes((prevNotes) => prevNotes.filter((note) => note.timestamp !== noteTimestamp));
  }, []);

  const handleSelectSlot = useCallback((slotInfo) => {
    setCurrentDate(slotInfo.start);
    setActiveView("day");
  }, []);

  const handleFileChange = useCallback(async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("scheduleFile", file);

    try {
      const response = await fetch("/api/upload-schedule", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        alert("Schedule file uploaded successfully! Refreshing schedule...");
        fetchAndProcessSchedule(term);
      } else {
        const errorText = await response.text();
        alert(`Failed to upload file: ${errorText}`);
      }
    } catch (err) {
      console.error("Error uploading file:", err);
      alert("An error occurred during file upload.");
    }
  }, [term]);

  const handleUploadButtonClick = useCallback(() => {
    fileInputRef.current.click();
  }, []);

  // Fetch schedule data from API and transform it for calendar
  const fetchAndProcessSchedule = useCallback(
    async (filterTerm) => {
      setLoading(true);
      setError(null);
      const currentTerm = filterTerm || term || "All Terms";

      try {
        const url =
          currentTerm && currentTerm !== "All Terms"
            ? `/api/schedule?term=${encodeURIComponent(currentTerm)}`
            : "/api/schedule";

        const res = await fetch(url);
        if (!res.ok) {
          const errorBody = await res.text();
          const errorMessage = `HTTP error! Status: ${res.status}, Body: ${errorBody.substring(0, 200)}...`;
          console.error("API Response Error:", errorMessage);
          setError(`Failed to load schedule: ${res.status}`);
          setEvents([]);
          setLoading(false);
          return;
        }

        const result = await res.json();

        if (
          !result ||
          !Array.isArray(result.data) ||
          result.data.length === 0 ||
          !Array.isArray(result.data[0])
        ) {
          const msg =
            "API response structure for schedule is not as expected: 'data' or 'data[0]' missing or invalid.";
          console.error(msg, result);
          setError(msg);
          setEvents([]);
          setLoading(false);
          return;
        }

        const rawScheduleData = result.data[0];

        if (!Array.isArray(rawScheduleData)) {
          const msg = "rawScheduleData (result.data[0]) is not an array.";
          console.error(msg, rawScheduleData);
          setError(msg);
          setEvents([]);
          setLoading(false);
          return;
        }

        const transformedEvents = rawScheduleData
          .map((item) => {
            const { start_date, end_date, start_time, end_time, course_name, code, instructor } = item;

            if (!start_date || !end_date) {
              console.warn("Skipping event due to missing start/end date:", item);
              return null;
            }

            const hasSpecificTimes =
              start_time !== null && start_time !== undefined && start_time !== "" &&
              end_time !== null && end_time !== undefined && end_time !== "";

            const startTime = start_time ? String(start_time) : "00:00";
            const endTime = end_time ? String(end_time) : "23:59";

            const startMoment = moment(`${start_date}T${startTime}`, "YYYY-MM-DDTHH:mm");
            let endMoment = moment(`${start_date}T${endTime}`, "YYYY-MM-DDTHH:mm");

            if (endMoment.isBefore(startMoment)) {
              endMoment = endMoment.add(1, "day");
            }

            if (!startMoment.isValid() || !endMoment.isValid()) {
              console.warn(
                `Skipping event due to invalid date/time: Start: ${start_date} ${startTime}, End: ${start_date} ${endTime}`,
                item
              );
              return null;
            }

            return {
              title: `${moment(startTime, "HH:mm").format("h:mma")} ${course_name || "N/A"} ${
                code ? `(${code})` : ""
              } - ${instructor || ""}`,
              start: startMoment.toDate(),
              end: endMoment.toDate(),
              color: getRandomColor(),
              allDay: !hasSpecificTimes || (startTime === "00:00" && endTime === "23:59"),
            };
          })
          .filter(Boolean)
          .sort((a, b) => a.start.getTime() - b.start.getTime());

        setEvents(transformedEvents);

        if (transformedEvents.length > 0) {
          const earliestEventDate = transformedEvents.reduce(
            (minDate, event) => (event.start < minDate ? event.start : minDate),
            transformedEvents[0].start
          );
          setCurrentDate(moment(earliestEventDate).startOf("month").toDate());
        } else {
          // Default date logic based on selected term
          const yearMatch = currentTerm.match(/(\d{4})/);
          const year = yearMatch ? parseInt(yearMatch[1], 10) : new Date().getFullYear();

          let month;
          const lowerTerm = currentTerm.toLowerCase();
          if (lowerTerm.includes("winter")) month = 0;
          else if (lowerTerm.includes("spring")) month = 4;
          else if (lowerTerm.includes("fall")) month = 8;
          else month = new Date().getMonth();

          setCurrentDate(new Date(year, month, 1));
        }
      } catch (err) {
        console.error("Failed to fetch or process schedule data:", err);
        setError(`An unexpected error occurred: ${err.message}`);
        setEvents([]);
        setCurrentDate(new Date());
      }
      setLoading(false);
    },
    [term]
  );

  useEffect(() => {
    fetchAndProcessSchedule(term);
  }, [fetchAndProcessSchedule, term]);

  const handleNavigate = useCallback(
    (direction) => {
      setCurrentDate((prevDate) => {
        let newDate = moment(prevDate);
        if (activeView === "month") {
          newDate = direction === "next" ? newDate.add(1, "month") : newDate.subtract(1, "month");
        } else if (activeView === "week") {
          newDate = direction === "next" ? newDate.add(1, "week") : newDate.subtract(1, "week");
        } else if (activeView === "day") {
          newDate = direction === "next" ? newDate.add(1, "day") : newDate.subtract(1, "day");
        }
        return newDate.toDate();
      });
    },
    [activeView]
  );

  const handleView = useCallback(
    (newView) => {
      if (newView === "note" && !currentDate) {
        setCurrentDate(new Date());
      }
      setActiveView(newView);
    },
    [currentDate]
  );

  // Handle term dropdown change inside calendar (optional)
  const onTermChange = (e) => {
    setTerm(e.target.value);
  };

  const handleDownloadCalendarExcel = () => {
    if (!events || events.length === 0) {
      alert("No events to export.");
      return;
    }

    const exportData = events.map(event => ({
      Title: event.title,
      Start: moment(event.start).format("YYYY-MM-DD HH:mm"),
      End: moment(event.end).format("YYYY-MM-DD HH:mm"),
      AllDay: event.allDay ? "Yes" : "No"
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Calendar Events");

    const fileName = `calendar_schedule_${term || "all_terms"}.xlsx`;
    XLSX.writeFile(workbook, fileName);
  };

  return (
    <div className="flex h-screen bg-gray-100 font-sans text-gray-800">
      <div className="flex-1 flex flex-col p-6 overflow-hidden">
        <header className="flex justify-between items-center bg-white p-4 rounded-lg shadow-sm mb-6">
          <h1 className="text-xl font-semibold">
            {["month", "week", "day"].includes(activeView)
              ? `Master Schedule (Calendar) - ${term || "Loading..."}`
              : "Master Schedule"}
          </h1>

          {/* Optional term dropdown inside calendar */}
          {terms.length > 0 && (
            <select
              className="input mr-4"
              value={term}
              onChange={onTermChange}
            >
              <option value="All Terms">All Terms</option>
              {terms.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          )}

          <div className="flex items-center space-x-4">
            <input
              type="text"
              placeholder="Search..."
              className="p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            <button
              type="button"
              onClick={() => handleView("note")}
              className={`py-2 px-4 rounded-md font-bold ${
                activeView === "note"
                  ? "bg-blue-500 text-white"
                  : "bg-gray-200 hover:bg-gray-300 text-gray-800"
              }`}
            >
              Note
            </button>

            {isAdmin && (
              <>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
                  style={{ display: "none" }}
                />
                <button
                  type="button"
                  onClick={handleUploadButtonClick}
                  className="py-2 px-4 rounded-md font-bold bg-purple-500 text-white hover:bg-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  Upload Schedule File
                </button>
                <button
                  type="button"
                  onClick={handleDownloadCalendarExcel}
                  className="py-2 px-4 rounded-md font-bold bg-green-500 text-white hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  Download Schedule Excel
                </button>
              </>
            )}
          </div>
        </header>

        {loading && (
          <div className="text-center text-blue-600 font-semibold mb-4">
            Loading schedule...
          </div>
        )}

        <div className="flex-1 flex overflow-hidden">
          <div className="flex-1 bg-white p-6 rounded-lg shadow-lg flex flex-col">
            <div className="rbc-toolbar flex justify-between items-center mb-4">
              <div className="flex items-center space-x-2">
                <span className="text-2xl font-bold">
                  {activeView === "day"
                    ? moment(currentDate).format("dddd, MMMM D, YYYY")
                    : activeView === "week"
                    ? `${moment(currentDate).startOf("week").format("MMMM D")} - ${moment(
                        currentDate
                      )
                        .endOf("week")
                        .format("MMMM D, YYYY")}`
                    : moment(currentDate).format("MMMM YYYY")}
                </span>

                {activeView !== "note" && (
                  <div className="rbc-btn-group ml-4">
                    <button
                      type="button"
                      onClick={() => handleNavigate("prev")}
                      className="rbc-btn-group-item bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded-l"
                    >
                      &larr;
                    </button>
                    <button
                      type="button"
                      onClick={() => setCurrentDate(new Date())}
                      className="rbc-btn-group-item bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4"
                    >
                      Today
                    </button>
                    <button
                      type="button"
                      onClick={() => handleNavigate("next")}
                      className="rbc-btn-group-item bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded-r"
                    >
                      &rarr;
                    </button>
                  </div>
                )}
              </div>

              <div className="rbc-btn-group">
                <button
                  type="button"
                  onClick={() => handleView("week")}
                  className={`py-2 px-4 rounded-l font-bold ${
                    activeView === "week"
                      ? "bg-blue-500 text-white"
                      : "bg-gray-200 hover:bg-gray-300 text-gray-800"
                  }`}
                >
                  Week
                </button>
                <button
                  type="button"
                  onClick={() => handleView("month")}
                  className={`py-2 px-4 font-bold ${
                    activeView === "month"
                      ? "bg-blue-500 text-white"
                      : "bg-gray-200 hover:bg-gray-300 text-gray-800"
                  }`}
                >
                  Month
                </button>
                <button
                  type="button"
                  onClick={() => handleView("day")}
                  className={`py-2 px-4 rounded-r font-bold ${
                    activeView === "day"
                      ? "bg-blue-500 text-white"
                      : "bg-gray-200 hover:bg-gray-300 text-gray-800"
                  }`}
                >
                  Day
                </button>
              </div>
            </div>

            {error && (
              <div
                className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4"
                role="alert"
              >
                <strong className="font-bold">Error!</strong>
                <span className="block sm:inline"> {error}</span>
              </div>
            )}

            {activeView === "note" ? (
              <div className="flex-1">
                <NoteInput
                  selectedDate={currentDate}
                  notes={notes}
                  saveNote={saveNote}
                  deleteNote={deleteNote}
                  isAdmin={isAdmin}
                  onNoteActionComplete={handleView}
                />
              </div>
            ) : (
              <div className="relative" style={{ height: "calc(100vh - 180px)" }}>
                <Calendar
                  localizer={localizer}
                  events={events}
                  startAccessor="start"
                  endAccessor="end"
                  view={activeView}
                  date={currentDate}
                  onNavigate={handleNavigate}
                  onView={handleView}
                  style={{ height: "100%" }}
                  components={components}
                  toolbar={false}
                  selectable
                  onSelectSlot={handleSelectSlot}
                  popup
                  showMultiDayTimes
                  views={["month", "week", "day"]}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

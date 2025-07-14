'use client'

import { DeleteBtn, EditBtn } from '@/components/design/Icons'
import Layout from '@/components/design/Layout'
import Section from '@/components/Section'
import UploadButton from '@/components/UploadButton'
import React, { useEffect, useState, useCallback } from 'react' // Added useCallback
import * as XLSX from "xlsx";
import { Button } from "@/components/ui/button"
import {
    SheetClose,
    Sheet,
    SheetContent,
    SheetFooter,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import ScheduleForm from '@/components/forms/ScheduleForm'
import { useUserRole } from '@/components/UserContext'
import { notFound } from 'next/navigation'
import InstructorCalendarView from '@/components/InstructorCalendarView';
import moment from 'moment';

const Schedules = () => {
    const { role, userName } = useUserRole();

    // DEBUG: Log component mount/unmount for the parent component
    useEffect(() => {
        console.log("Schedules component (app/schedule/page.js) mounted.");
        return () => {
            console.log("Schedules component (app/schedule/page.js) unmounted.");
        };
    }, []);

    // Admin-specific state for schedule management
    const [scheduleData, setScheduleData] = useState([]);
    const [columns, setColumns] = useState([]);
    const [showSheet, setShowSheet] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [currentSchedule, setCurrentSchedule] = useState(null);

    // Instructor-specific modal states (HOISTED FROM InstructorCalendarView)
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedEventDetails, setSelectedEventDetails] = useState(null);
    const [showAddModal, setShowAddModal] = useState(false);
    const [newScheduleDefaults, setNewScheduleDefaults] = useState(null);
    const [refreshCalendarTrigger, setRefreshCalendarTrigger] = useState(0); // For instructor calendar refresh

    // State for admin delete confirmation modal
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [deleteId, setDeleteId] = useState(null);


    // Fetch schedules for admin role
    useEffect(() => {
        if (role === 1) {
            const fetchAllSchedules = async () => {
                try {
                    const res = await fetch('/api/schedules');
                    if (!res.ok) throw new Error('Failed to fetch all schedules');
                    const result = await res.json();
                    if (result.data && result.data.length > 0) {
                        setScheduleData(result.data);
                        setColumns(Object.keys(result.data[0] || {}));
                    } else {
                        setScheduleData([]);
                        setColumns([]);
                    }
                } catch (error) {
                    console.error("Error fetching all schedules:", error);
                }
            };
            fetchAllSchedules();
        }
    }, [role]);


    // Admin-specific handler functions
    const handleAddClick = () => {
        setIsEditing(false);
        setCurrentSchedule(null);
        setShowSheet(true);
    };

    const handleEditClick = (item) => {
        setIsEditing(true);
        setCurrentSchedule(item);
        setShowSheet(true);
    };

    const handleDeleteClick = (id) => {
        setDeleteId(id);
        setShowDeleteConfirm(true);
    };

    const confirmDelete = async () => {
        setShowDeleteConfirm(false);
        if (!deleteId) return;

        try {
            const res = await fetch('/api/schedules', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: deleteId }),
            });
            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.error || `Failed to delete schedule: status ${res.status}`);
            }
            setScheduleData(prev => prev.filter(s => s.id !== deleteId));
            console.log("Schedule deleted successfully!");
        } catch (error) {
            console.error("Error deleting schedule:", error);
            console.log("Failed to delete schedule.");
        } finally {
            setDeleteId(null);
        }
    };


    // Instructor-specific handlers passed to InstructorCalendarView (memoized with useCallback)
    const handleCalendarEventClick = useCallback((eventResource) => {
        console.log("Schedules.js: Event click received from calendar:", eventResource);
        setSelectedEventDetails(eventResource);
        setShowEditModal(true); // This should now correctly update the state in the parent
    }, []);

    const handleCalendarSlotSelect = useCallback(({ start, end }) => {
        console.log("Schedules.js: Slot select received from calendar:", { start, end });
        setNewScheduleDefaults({
            start_date: moment(start).format('YYYY-MM-DD'),
            start_time: moment(start).format('HH:mm:ss'),
            end_date: moment(end).format('YYYY-MM-DD'),
            end_time: moment(end).format('HH:mm:ss'),
            instructor: userName.split('@')[0],
            instructor_email: userName,
            // ... other default fields you might want to pre-fill for new schedules
            schedule_term: '', s_no: '', session: '', program: '', intake_id: '',
            semester: '', term: '', group_name: '', block_id: '', code: '',
            course_name: '', campus: '', delivery: '', room_no: '', credits: '',
            hours_paid_for_the_class: '', hours: '', enrolment_in_class: '',
            draft: '', schedule_draft: '', program_manager: '', capacity: '',
            additional_capacity: '', campus_address_code: '', credentails_and_qulaifications: '',
        });
        setShowAddModal(true); // This should now correctly update the state in the parent
    }, [userName]);

    const handleCalendarFormSuccess = useCallback(() => {
        console.log("Schedules.js: Calendar form success, closing modals and refreshing.");
        setShowEditModal(false);
        setShowAddModal(false);
        setSelectedEventDetails(null);
        setNewScheduleDefaults(null);
        setRefreshCalendarTrigger(prev => prev + 1); // Trigger refresh in calendar view
    }, []);

    const handleCalendarFormClose = useCallback(() => {
        console.log("Schedules.js: Calendar form close, closing modals.");
        setShowEditModal(false);
        setShowAddModal(false);
        setSelectedEventDetails(null);
        setNewScheduleDefaults(null);
    }, []);


    return (
        <Layout>
            <Section title={'Schedules'}>
                {role === 1 && ( // Admin View
                    <div className="flex flex-col gap-5">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="h2">Manage All Schedules</h2>
                            <div className="flex gap-4">
                                <UploadButton text="Upload Schedules (Admin)" />
                                <Button onClick={handleAddClick} className="btn-primary">Add New Schedule</Button>
                            </div>
                        </div>

                        {scheduleData.length > 0 ? (
                            <div className="overflow-x-auto shadow-md rounded-lg">
                                <table className="table-basic">
                                    <thead>
                                        <tr>
                                            {columns.map((col, index) => (
                                                <th key={index}>{col.replace(/_/g, ' ')}</th>
                                            ))}
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {scheduleData.map((item, idx) => (
                                            <tr key={item.id || idx}>
                                                {columns.map((col, index) => (
                                                    <td key={index}>{item[col]}</td>
                                                ))}
                                                <td>
                                                    <div className="flex gap-2">
                                                        <EditBtn onClickFunc={() => handleEditClick(item)} />
                                                        <DeleteBtn onClickFunc={() => handleDeleteClick(item.id)} />
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="text-center py-10 text-gray-600">No schedules to display.</div>
                        )}

                        {/* Admin Schedule Form Sheet (for Add/Edit) */}
                        <Sheet open={showSheet} onOpenChange={setShowSheet}>
                            <SheetContent side="right" className="w-full sm:max-w-xl overflow-y-auto">
                                <SheetHeader>
                                    <SheetTitle>{isEditing ? "Edit Schedule" : "Add New Schedule"}</SheetTitle>
                                </SheetHeader>
                                <ScheduleForm
                                    currentSchedule={currentSchedule}
                                    isEditing={isEditing}
                                    onClose={() => setShowSheet(false)}
                                    onSuccess={() => {
                                        setShowSheet(false);
                                        // Refetch admin schedules after success
                                        // This part needs a function to refresh admin table data
                                        // For now, it will simply close the sheet.
                                        // You'd ideally call fetchAllSchedules here or pass a callback.
                                    }}
                                />
                            </SheetContent>
                        </Sheet>

                        {/* Admin Confirmation Dialog for Delete */}
                        <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
                            <DialogContent aria-describedby={undefined}>
                                <DialogHeader>
                                    <DialogTitle>Confirm Deletion</DialogTitle>
                                    <DialogDescription>
                                        Are you sure you want to delete this schedule? This action cannot be reversed.
                                    </DialogDescription>
                                </DialogHeader>
                                <DialogFooter>
                                    <Button onClick={() => setShowDeleteConfirm(false)} variant="outline">Cancel</Button>
                                    <Button onClick={confirmDelete} variant="destructive">Delete</Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </div>
                )}

                {role === 2 && ( // Instructor View: Display Calendar
                    <div className="mt-5">
                        {/* InstructorCalendarView receives all its control props from here */}
                        <InstructorCalendarView
                            showEditModal={showEditModal}
                            setShowEditModal={setShowEditModal}
                            selectedEventDetails={selectedEventDetails}
                            setSelectedEventDetails={setSelectedEventDetails}
                            showAddModal={showAddModal}
                            setShowAddModal={setShowAddModal}
                            newScheduleDefaults={newScheduleDefaults}
                            setNewScheduleDefaults={setNewScheduleDefaults}
                            onEventClick={handleCalendarEventClick}
                            onSlotSelect={handleCalendarSlotSelect}
                            onFormSuccess={handleCalendarFormSuccess}
                            onFormClose={handleCalendarFormClose}
                            refreshTrigger={refreshCalendarTrigger}
                        />
                    </div>
                )}

                {/* Optional: Message for other roles or if no role */}
                {role !== 1 && role !== 2 && (
                    <div className="text-center py-10 text-gray-600">
                        You do not have permission to view schedules.
                    </div>
                )}
            </Section>
        </Layout>
    );
};

export default Schedules;

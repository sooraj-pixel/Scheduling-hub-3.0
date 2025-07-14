'use client'
import { AddBtn, DeleteBtn } from '@/components/design/Icons'
import Section from '@/components/Section'
import React, { useContext, useEffect, useState } from 'react'
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useUserRole } from '@/components/UserContext'

const AnnounceContent = ({ className, hideUsername, buttons }) => {
    const { userName, role } = useUserRole();

    const [announcements, setAnnouncements] = useState([]);
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [showPostDialog, setShowPostDialog] = useState(false);

    useEffect(() => {
        getAnnouncements()
    }, [])

    const getAnnouncements = async () => {
        const res = await fetch('/api/announcements');
        const result = await res.json();
        const data = Array.isArray(result.data) ? result.data : (result.data && result.data[0] ? result.data[0] : []);
        setAnnouncements(data);
    }

    const saveAnnouncement = async () => {
        const announcementData = { title, description }
        const res = await fetch('/api/announcements', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(announcementData),
        });
        const result = await res.json();
        console.log("Save Announcement Result:", result);

        getAnnouncements();

        setTitle("");
        setDescription("");
        setShowPostDialog(false);

        if (res.ok) {
            alert("Announcement posted successfully!");
        } else {
            alert("Failed to post announcement.");
        }
    };

    const deleteAnnouncement = async (id) => {
        let confirmDelete = confirm("Are you sure you want to delete this announcement? This action cannot be reversed.")
        if (!confirmDelete) {
            return;
        }
        const res = await fetch(`/api/announcements`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ id }),
        });

        if (res.ok) {
            alert("Announcement deleted!")
            getAnnouncements();
        } else {
            alert("Failed to delete announcement.");
        }
    };

    return (
        <Section className={className} hideUsername={hideUsername}>
            {role === 1 && buttons && <AddBtn className="absolute top-20 right-8" showForm={setShowPostDialog} text={"Post"} />}

            <Dialog open={showPostDialog} onOpenChange={setShowPostDialog}>
                <DialogContent className="sm:max-w-[625px]" aria-describedby={undefined}>
                    <DialogHeader>
                        <DialogTitle>Post New Announcement</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label className="text-right">Title</Label>
                            <Input value={title} onChange={e => setTitle(e.target.value)} className="col-span-3" />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label className="text-right">Description</Label>
                            <textarea rows={5} value={description} onChange={e => setDescription(e.target.value)} className="col-span-3 border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500" />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button className="w-1/3 mx-auto bg-blue-600 hover:bg-blue-700 text-white rounded-md" type="submit" onClick={saveAnnouncement}>
                            Post
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Announcements List */}
            <div className="mt-5">
                <h1 className="text-2xl font-bold mb-5 text-gray-800">Announcements</h1>
                {announcements?.length > 0 ? (
                    // FIX: Added 'index' to map callback and used 'item.id || index' for the key
                    announcements.map((item, index) => (
                        <div key={item.id || index} className="flex justify-between items-center px-5 py-3 border-b border-gray-200 bg-gray-50 hover:bg-gray-100 transition-colors duration-150 rounded-md mb-2">
                            <div className="w-2/3">
                                <h4 className='text-xl font-semibold text-gray-900'>{item.title}</h4>
                                <p className="text-gray-700 text-sm mt-1">{item.description}</p>
                            </div>
                            <div className="flex items-end gap-3 flex-col text-right">
                                {/* FIX: Added conditional check for item.dateCreated before splitting */}
                                <div className="text-gray-500 text-xs">
                                    Posted On: {item.dateCreated ? item.dateCreated.split('T')[0] : 'N/A'}
                                </div>
                                {role === 1 && buttons && (
                                    <DeleteBtn onClickFunc={() => deleteAnnouncement(item.id)} />
                                )}
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="text-gray-600 text-center py-10">No announcements for now.</div>
                )}
            </div>
        </Section>
    )
}

export default AnnounceContent

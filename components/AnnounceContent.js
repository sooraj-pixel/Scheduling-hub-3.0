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
    // console.log({ userName, role });

    const [announcements, setAnnouncements] = useState([]);
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [showDialog, setShowDialog] = useState(false);

    useEffect(() => {
        getAnnouncements()
    }, [])

    const getAnnouncements = async () => {
        const res = await fetch('/api/announcements');
        const result = await res.json();
        const data = result.data[0];
        // console.log(result);
        // console.log(data);
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
        // console.log(result);

        getAnnouncements();

        // Reset form
        setTitle("");
        setDescription("");
        setShowDialog(false);
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
        }
    };

    return (
        <Section className={className} hideUsername={hideUsername}>
            {role == 1 && buttons && <AddBtn className="absolute top-20 right-8" showForm={setShowDialog} text={"Post"} />}

            {/* Create new announcement form */}
            <Dialog open={showDialog} onOpenChange={setShowDialog}>
                <DialogContent className="sm:max-w-[625px]" aria-describedby={undefined}>
                    <DialogHeader>
                        <DialogTitle>Post New Announcement</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label className="text-right">
                                Title
                            </Label>
                            <Input value={title} onChange={e => setTitle(e.target.value)} className="col-span-3" />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label className="text-right">
                                Description
                            </Label>
                            <textarea rows={5} value={description} onChange={e => setDescription(e.target.value)} className="col-span-3" />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button className="w-1/3 mx-auto" type="submit" onClick={e => saveAnnouncement()}>
                            Post
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Announcements */}
            <div className="mt-5">
                <h1 className="h2 mb-5">Announcements</h1>
                {announcements?.length > 0 && announcements.map(item => (
                    <div key={item.id} className="flex justify-between px-5 py-3 border-b-2 border-slate-300">
                        <div className="w-2/3">
                            <h4 className='h4'>{item.title}</h4>
                            <p>{item.description}</p>
                        </div>
                        <div className="flex items-end gap-3 flex-col">
                            <div>Posted On: {item.dateCreated.split('T')[0]}</div>
                            {role == 1 && buttons && <DeleteBtn onClickFunc={() => deleteAnnouncement(item.id)} />}
                        </div>
                    </div>
                ))}
                {announcements.length == 0 && <div>No announcements for now.</div>}
            </div>
        </Section>
    )
}

export default AnnounceContent
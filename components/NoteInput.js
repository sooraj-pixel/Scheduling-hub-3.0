// components/NoteInput.js
import React, { useState, useEffect, useCallback } from 'react';
import moment from 'moment';

export default function NoteInput({ selectedDate, notes, saveNote, deleteNote, isAdmin, onNoteActionComplete }) {
const [noteContent, setNoteContent] = useState('');
const [editableDate, setEditableDate] = useState(moment(selectedDate).format('YYYY-MM-DD'));
const [showAddEditForm, setShowAddEditForm] = useState(false); // Controls showing add/edit form
const [currentNoteToEdit, setCurrentNoteToEdit] = useState(null); // Stores the note object being edited

// Effect to reset form state when selectedDate (from parent calendar) changes
useEffect(() => {
setShowAddEditForm(false); // Always start on the notes list view when changing dates
setCurrentNoteToEdit(null);
setNoteContent('');
setEditableDate(moment(selectedDate).format('YYYY-MM-DD'));
}, [selectedDate]);

// Effect to pre-fill the form when an existing note is selected for editing
useEffect(() => {
if (currentNoteToEdit) {
setNoteContent(currentNoteToEdit.content);
setEditableDate(moment(currentNoteToEdit.date).format('YYYY-MM-DD'));
setShowAddEditForm(true); // Automatically show the form when an edit operation starts
} else {
// If not editing, ensure content is cleared for a new note, and date defaults to selectedDate
if (!showAddEditForm) { // Only reset if not already in the "add new" flow
setNoteContent('');
setEditableDate(moment(selectedDate).format('YYYY-MM-DD'));
}
}
}, [currentNoteToEdit, selectedDate, showAddEditForm]);

// Handler for clicking the "Add Note" button (the plus sign)
const handleAddNoteClick = useCallback(() => {
setCurrentNoteToEdit(null); // Ensure we are adding a new note, not editing
setNoteContent(''); // Clear content for a fresh note
setEditableDate(moment(selectedDate).format('YYYY-MM-DD')); // Set default date to the currently selected calendar date
setShowAddEditForm(true); // Show the add note form
}, [selectedDate]);

// Handler for clicking the "Edit" button on a specific note
const handleEditNote = useCallback((note) => {
setCurrentNoteToEdit(note); // Set the note to be edited
// The useEffect above will handle setting content, date, and showing the form
}, []);

// Handler for saving a new or edited note
const handleSaveNote = useCallback(() => {
if (!noteContent.trim() || !editableDate) {
alert('Note content and date cannot be empty!');
return;
}

const newOrUpdatedNote = {
date: new Date(editableDate).toISOString(), // Use the date from the input field
content: noteContent.trim(),
// Use timestamp as a simple unique identifier. If editing, keep original.
timestamp: currentNoteToEdit ? currentNoteToEdit.timestamp : new Date().toISOString()
};

saveNote(newOrUpdatedNote); // Call the prop function to save/update the note

// Reset form states and go back to the notes list
setNoteContent('');
setEditableDate(moment(selectedDate).format('YYYY-MM-DD'));
setCurrentNoteToEdit(null);
setShowAddEditForm(false);
}, [noteContent, editableDate, currentNoteToEdit, saveNote, selectedDate]);

// Handler for canceling the add/edit form
const handleCancelForm = useCallback(() => {
setNoteContent(''); // Clear content
setEditableDate(moment(selectedDate).format('YYYY-MM-DD')); // Reset date to selectedDate
setCurrentNoteToEdit(null); // Clear editing state
setShowAddEditForm(false); // Go back to the notes list view
}, [selectedDate]);

// Handler for deleting a note
const handleDeleteClick = useCallback((noteToDelete) => {
if (window.confirm(`Are you sure you want to delete the note for ${moment(noteToDelete.date).format('MMMM Do,YYYY')}?`)) {
deleteNote(noteToDelete.timestamp); // Call the prop function to delete the note
}
}, [deleteNote]);

// Sort notes by date for consistent display (most recent first)
const sortedNotes = [...notes].sort((a, b) => new Date(a.date) - new Date(b.date));

return (
// Apply flex-grow to this main container so it takes available space
// and apply overflow-y-auto to allow it to scroll if content exceeds its flex-grow height
<div className="p-4 bg-white rounded-lg shadow-md flex flex-col flex-grow overflow-y-auto">
{/* Note Title - Made sticky so it's always visible at the top */}
<h2 className="text-xl font-bold mb-4 sticky top-0 bg-white z-10 pb-2">
{showAddEditForm ? (currentNoteToEdit ? 'Edit Note' : 'Add New Note') : 'All Notes'}
</h2>

{isAdmin && showAddEditForm ? (
// Admin: Add/Edit Note Form View
<>
{/* Form content (date input and textarea) */}
<div className="mb-4">
<label htmlFor="note-date" className="block text-sm font-medium text-gray-700 mb-1">
Select Date:
</label>
<input
type="date"
id="note-date"
className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
value={editableDate}
onChange={(e) => setEditableDate(e.target.value)}
/>
</div>

<textarea
className="w-full p-3 border border-gray-300 rounded-md mb-4 resize-y flex-grow" // flex-grow here ensures textarea takes available space
rows="6"
placeholder="Write your note here..."
value={noteContent}
onChange={(e) => setNoteContent(e.target.value)}
></textarea>

{/* Buttons - No longer mt-auto, they flow naturally after textarea */}
<div className="flex justify-end space-x-3 mt-4">
<button
onClick={handleCancelForm}
className="py-2 px-4 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400"
>
Cancel
</button>
<button
onClick={handleSaveNote}
className="py-2 px-4 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
>
Save Note
</button>
</div>
</>
) : (
// All Notes List View (for Admin and Regular User)
<>
{isAdmin && (
// Add Note button - Made sticky at the top of the scrollable list
<div className="flex justify-end mb-4 sticky top-0 bg-white z-10 pt-2">
<button
onClick={handleAddNoteClick}
className="py-2 px-4 bg-green-500 text-white rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 flex items-center"
>
<span className="text-xl mr-1">+</span> Add Note
</button>
</div>
)}

{/* This div contains the actual list of notes, and it's within the main scrollable container */}
<div className="flex-grow pr-2">
{sortedNotes.length > 0 ? (
sortedNotes.map((note) => (
<div key={note.timestamp} className="mb-3 p-3 bg-gray-50 rounded-md border border-gray-200 flex justify-between items-center">
<div>
<strong className="block text-sm text-gray-700 mb-1">
{moment(note.date).format('MMMM Do,YYYY')}
</strong>
<p className="text-gray-800">{note.content}</p>
</div>
{isAdmin && (
<div className="flex space-x-2">
<button
onClick={() => handleEditNote(note)}
className="p-2 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 text-sm"
>
Edit
</button>
<button
onClick={() => handleDeleteClick(note)}
className="p-2 bg-red-100 text-red-700 rounded-md hover:bg-red-200 text-sm"
>
Delete
</button>
</div>
)}
</div>
))
) : (
<p className="text-gray-600 text-center py-10">No notes available.</p>
)}
</div>

{/* Back to Calendar button - Made sticky at the bottom of the scrollable list */}
<div className="flex justify-end mt-4 sticky bottom-0 bg-white z-10 pt-2">
<button
onClick={() => onNoteActionComplete('month')}
className="py-2 px-4 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400"
>
Back to Calendar
</button>
</div>
</>
)}
</div>
);
}
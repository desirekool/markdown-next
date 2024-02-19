import { DateTime } from "luxon";

export const fetchNotes = async (parentId?: string) => {
  let QueryString = "";
  if (parentId) {
    QueryString += "?parent_id=" + parentId;
  }

  const res = await fetch("/api/notes" + QueryString);
  const notes = await res.json();
  const transformedNotes = notes.map((note: any) => {
    return transformJsonToNote(note);
  });

  return transformedNotes;
}

export const createNote = async () => {
  const res = await fetch("/api/notes", {
    method: "POST",
  });
  const note = await res.json();
  return transformJsonToNote(note);
}

export const updateParent = async (noteId: string, parentId: string) => {
  await fetch(`/api/notes/${noteId}/update_parent`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ parent_id: parentId }),
  });
}

const transformJsonToNote = (note: any) => {
  return {
    ...note,
    created_at: DateTime.fromISO(note.created_at),
    updated_at: DateTime.fromISO(note.updated_at),
    child_notes: note.child_notes || [],
    child_count: note.child_count || 0,
  };
}
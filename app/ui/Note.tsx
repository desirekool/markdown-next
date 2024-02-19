import { DateTime } from "luxon";
import { NoteData } from "../lib/client/types";
import NoteList from "./NoteList";
import { MouseEvent, DragEvent, useState } from "react";
import { usePathname, useSearchParams, useRouter } from "next/navigation";
import { useNoteDispatch, useNotesState } from "../contexts/notes-context";
import { fetchNotes, updateParent } from "../lib/client/api";
import clsx from "clsx";

const Note = ({ note, depth }: { note: NoteData; depth: number }) => {
  const searchParams = useSearchParams();
  const pathName = usePathname();
  const { replace } = useRouter();
  const state = useNotesState();
  const dispatch = useNoteDispatch();
  const [isTarget, setIsTarget] = useState(false);

  const handleNoteClick = (e: MouseEvent, id: string) => {
    e.stopPropagation();
    console.log("Note clicked", id);
    const params = new URLSearchParams(searchParams);
    params.set("note_id", id);
    replace(`${pathName}?${params.toString()}`);
  };

  const handleDragStart = (e: DragEvent) => {
    console.log("drag start");
    dispatch({ type: "UPDATE_CURRENT_DRAG_ID", payload: note.id });
  };
  const handleDragEnd = (e: DragEvent) => {
    console.log("drag end");
    setIsTarget(false);
  };
  const handleDrop = async (e: DragEvent) => {
    console.log("drop");
    setIsTarget(false);
    if (note.id === state.currentDragId) return;
    if (
      checkIfNoteIsDescendant(
        state.notesMap,
        state.notesMap.get(note.id)!,
        state.notesMap.get(state.currentDragId!)!
      )
    ) {
      return;
    }
    await updateParent(state.currentDragId!, note.id);    
    dispatch({
      type: "UPDATE_PARENT",
      payload: { noteId: state.currentDragId!, parentId: note.id },
    });
  };
  const handleDragOver = (e: DragEvent) => {
    console.log("drag over");
    e.preventDefault();
  };
  const handleDragEnter = (e: DragEvent) => {
    console.log("drag enter");
    e.stopPropagation();
    if (e.currentTarget === e.relatedTarget) setIsTarget(true);
  };
  const handleDragLeave = (e: DragEvent) => {
    console.log("drag leave");
    e.stopPropagation();
    if (e.currentTarget.contains(e.relatedTarget as Node)) setIsTarget(false);
  };

  const handleExpand = async (e: MouseEvent) => {
    console.log("expand");
    const childNotes = await fetchNotes(note.id);
    dispatch({
      type: "ADD_CHILD_NOTES_TO_NOTE",
      payload: { noteId: note.id, childNotes },
    });
  };

  const checkIfNoteIsDescendant = (
    notesMap: Map<string, NoteData>,
    parent: NoteData,
    child: NoteData
  ) => {
    if (parent.child_notes.length === 0) return false;
    if (parent.child_notes.includes(child)) return true;
    for (const note of parent.child_notes) {
      if (checkIfNoteIsDescendant(notesMap, notesMap.get(note.id)!, child))
        return true;
    }
    return false;
  };

  return (
    <section>
      <div
        className={clsx(
          "p-2 text-black border-2 border-slate-300 hover:border-slate-700 cursor-pointer",
          { "bg-red-300": isTarget, "bg-yellow-300": !isTarget }
        )}
        draggable
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onClick={(e) => handleNoteClick(e, note.id)}
      >
        <div>{note.title}</div>
        <div>{note.id}</div>
        <div>{note.created_at.toLocaleString(DateTime.DATETIME_SHORT)}</div>
        <div>{note.updated_at.toLocaleString(DateTime.DATETIME_SHORT)}</div>
        <div>{note.is_published ? "published" : "draft"}</div>
        <div>{note.child_count}</div>
      </div>
      {note.child_count > 0 && (
        <button className="bg-red-700 text-white p-2" onClick={handleExpand}>
          expand
        </button>
      )}
      {note.child_notes.length > 0 && (
        <NoteList notes={note.child_notes} depth={depth + 1} />
      )}
    </section>
  );
};

export default Note;

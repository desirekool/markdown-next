"use client";
import { useEffect } from "react";
import { useNoteDispatch, useNotesState } from "../contexts/notes-context";
import { fetchNotes } from "../lib/client/api";
import NoteList from "./NoteList";
import CreateNoteButton from "./CreateNoteButton";
import SortSelect from "./SortSelect";

const NoteContainer = () => {
  const state = useNotesState();
  const dispatch = useNoteDispatch();
  useEffect(() => {
    async function init() {
      const notes = await fetchNotes();
      console.log(notes);
      dispatch({ type: "SET_ROOT_NOTES", payload: notes });
    }
    init();
  }, [dispatch]);

  const handleChange = (value: string) => {
    dispatch({ type: "SORT_NOTES", payload: { sortKey: value } });
  };

  if (!state.rootNotes) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <CreateNoteButton />
      <SortSelect onChange={handleChange} />
      <NoteList notes={state.rootNotes} />
    </div>
  );
};

export default NoteContainer;

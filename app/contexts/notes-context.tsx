import {
  Dispatch,
  ReactNode,
  createContext,
  useContext,
  useReducer,
} from "react";
import { NoteData } from "../lib/client/types";

interface NotesState {
  rootNotes: NoteData[];
  currentDragId: string | null;
  notesMap: Map<string, NoteData>;
}

const initialState: NotesState = {
  rootNotes: [],
  currentDragId: null,
  notesMap: new Map(),
};

export const NotesContext = createContext({} as NotesState);
export const NotesDispatchContext = createContext({} as Dispatch<any>);

export const NotesProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(noteReducer, initialState);

  return (
    <NotesContext.Provider value={state}>
      <NotesDispatchContext.Provider value={dispatch}>
        {children}
      </NotesDispatchContext.Provider>
    </NotesContext.Provider>
  );
};

export const useNotesState = () => {
  return useContext(NotesContext);
};

export const useNoteDispatch = () => {
  return useContext(NotesDispatchContext);
};

const noteReducer = (state: NotesState, action: any): NotesState => {
  switch (action.type) {
    case "SET_ROOT_NOTES":
      return setRootNotes(state, action.payload);
    case "ADD_NEW_NOTE_TO_ROOT_NOTES":
      return addNewNoteToRootNotes(state, action.payload);
    case "SORT_NOTES":
      const newState = { ...state };
      const notes = newState.rootNotes;
      const { sortKey } = action.payload;
      sortNotes(notes, sortKey);
      newState.rootNotes = notes;
      return newState;
    case "UPDATE_CURRENT_DRAG_ID":
      return { ...state, currentDragId: action.payload };
    case "UPDATE_PARENT":
      return updateParent(state, action.payload);
    case "ADD_CHILD_NOTES_TO_NOTE":
      return AddChildNotesToNote(state, action.payload);
    case "UPDATE_NOTE":
      return updateNote(state, action.payload);
    default:
      return state;
  }
};

const setRootNotes = (state: NotesState, notes: NoteData[]) => {
  addNotesToCache(state.notesMap, notes);
  return { ...state, rootNotes: notes };
};

const addNewNoteToRootNotes = (state: NotesState, note: NoteData) => {
  addNotesToCache(state.notesMap, [note]);
  return { ...state, rootNotes: [note, ...state.rootNotes] };
};

const sortNotes = (notes: NoteData[], sortKey: string) => {
  const reverse = sortKey.startsWith("-");
  const key = reverse ? sortKey.slice(1) : sortKey;
  notes.sort((a, b) => {
    if (a[key as keyof NoteData] < b[key as keyof NoteData]) {
      return reverse ? 1 : -1;
    }
    if (a[key as keyof NoteData] > b[key as keyof NoteData]) {
      return reverse ? -1 : 1;
    }
    return 0;
  });

  notes.forEach((note) => {
    if (note.child_notes.length > 0) {
      sortNotes(note.child_notes, sortKey);
    }
  });
};

const addNotesToCache = (map: Map<string, NoteData>, notes: NoteData[]) => {
  for (const note of notes) {
    map.set(note.id, note);
  }
};

const updateParent = (state: NotesState, payload: any) => {
  const { noteId, parentId } = payload;
  const currentDraggingNote = state.notesMap.get(noteId);
  if (!currentDraggingNote) return state;
  const oldParentId = state.notesMap.get(currentDraggingNote.parent_id);
  const oldParent = state.notesMap.get(parentId);

  const newParent = state.notesMap.get(parentId);
  if (!newParent) return state;
  const newState = { ...state };
  if (oldParent) {
    oldParent.child_notes.splice(
      oldParent.child_notes.findIndex((note: NoteData) => note.id === noteId),
      1
    );
  } else {
    newState.rootNotes.splice(
      newState.rootNotes.findIndex((note: NoteData) => note.id === noteId),
      1
    );
  }

  newParent.child_notes.push(currentDraggingNote);
  currentDraggingNote.parent_id = parentId;
  return newState;
};

const AddChildNotesToNote = (state: NotesState, payload: any) => {
  const { noteId, childNotes } = payload;
  const newState = { ...state };
  const note = newState.notesMap.get(noteId);
  addNotesToCache(state.notesMap, childNotes);
  if (note) note.child_notes = childNotes;
  return newState;
};

const updateNote = (state: NotesState, note: NoteData) => {
  const newState = { ...state };
  const notes = newState.rootNotes;
  const index = notes.findIndex((n) => n.id === note.id);
  if (index > -1) {
    notes[index] = note;
  }
  return newState;
};

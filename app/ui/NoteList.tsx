import { NoteData } from "../lib/client/types";
import Note from "./Note";

const NoteList = ({
  notes,
  depth = 0,
}: {
  notes: NoteData[];
  depth?: number;
}) => {
  return (
    <div style={{ marginLeft: `${depth * 10}px` }}>
      {notes.map((note) => (
        <div key={note.id} className="my-2">
          <Note note={note} depth={depth + 1} />
        </div>
      ))}
    </div>
  );
};

export default NoteList;

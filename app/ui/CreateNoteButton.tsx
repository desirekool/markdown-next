import { useNoteDispatch } from "../contexts/notes-context";
import { createNote } from "../lib/client/api";

const CreateNoteButton = () => {
  const dispatch = useNoteDispatch();
  async function handleClick() {
    const note = await createNote();
    dispatch({ type: "ADD_NEW_NOTE_TO_ROOT_NOTES", payload: note });
  }

  return (
    <button
      onClick={handleClick}
      className="text-white block bg-red-700 p-2 my-2"
    >
      Create Note
    </button>
  );
};

export default CreateNoteButton;

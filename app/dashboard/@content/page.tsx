"use client";
import AceEditor from "react-ace";
import ReactMarkdown from "react-markdown";
import { NoteData } from "@/app/lib/client/types";
import { useSearchParams } from "next/navigation";
import { ChangeEvent, useEffect, useState } from "react";
import { fetchNote } from "@/app/lib/client/api";
import { useDebouncedCallback } from "use-debounce";

import "ace-builds/src-noconflict/mode-markdown";
import "ace-builds/src-noconflict/theme-github_dark";
import "ace-builds/src-noconflict/theme-monokai";

const Page = () => {
  const searchParams = useSearchParams();
  const noteId = searchParams.get("note_id");
  const [currentNote, setCurrentNote] = useState<NoteData | null>(null);

  const refreshNote = async (note_id: string) => {
    const note = await fetchNote(note_id);
    setCurrentNote(note);
  };

  useEffect(() => {
    console.log("noteId", noteId);
    if (noteId !== null && currentNote?.id !== noteId) {
      refreshNote(noteId);
    }
  }, [noteId, currentNote]);

  const handleUpdateNote = useDebouncedCallback(async (note: NoteData) => {
    console.log("update note", note);
    setCurrentNote(await fetchNote(note.id));
  }, 300);

  const handleTitleChange = async (e: ChangeEvent<HTMLInputElement>) => {
    console.log("content change");
    const newNote = { ...currentNote, title: e.target.value };
    setCurrentNote(newNote as NoteData);
    await handleUpdateNote(newNote as NoteData);
  };

  const handleContentChange = async (value: string) => {
    console.log("content change");
    const newNote = { ...currentNote, content: value };
    setCurrentNote(newNote as NoteData);
    await handleUpdateNote(newNote as NoteData);
  };

  const handlePublish = async () => {
    console.log("publish change");
    const newNote = {
      ...currentNote,
      is_published: !currentNote?.is_published,
    };
    setCurrentNote(newNote as NoteData);
    await handleUpdateNote(newNote as NoteData);
  };

  if (!currentNote) {
    return <div>Loading...</div>;
  }

  return (
    <section className="p-2 flex-auto w-2/3">
      {currentNote && (
        <div className="p-2">
          <input
            type="text"
            value={currentNote.title}
            className="p-2 bg-blue-700 text-yellow-300 font-bold block w-full focus:bg-red-700 "
            onChange={handleTitleChange}
          />
          <div className="flex-flex-row">
            <div className="flex-1 m-2">
              <AceEditor
                mode={"markdown"}
                theme="monokai"
                value={currentNote.content}
                onChange={handleContentChange}
                name="markdown_editor"
                editorProps={{ $blockScrolling: true }}
                width="100%"
                height="80vh"
                wrapEnabled={true}
                fontSize={"16px"}
              />
            </div>
            <div className="flex-1 m-2">
              <ReactMarkdown>{currentNote.content}</ReactMarkdown>
            </div>
            <div className="p-2 flex flex-row gap-2">
              <label>Published</label>
              <input
                type="checkbox"
                checked={currentNote.is_published}
                onChange={handlePublish}
              />
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default Page;

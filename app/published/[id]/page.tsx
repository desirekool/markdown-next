import ReactMarkdown from "react-markdown";
import { sql } from "@/app/lib/server/db";
import { DateTime } from "luxon";

import style from "@/app/dashboard/@content/markdown-styles.module.css";

const getNote = async (id: string) => {
  const result = await sql(
    "select n.*, u.username from notes n inner join users u on n.user_id = u.id where n.id = $1",
    [id]
  );
  return result.rows[0];
};

const Page = async ({ params }: { params: { id: string } }) => {
  const { id } = params;
  const note = await getNote(id);

  return (
    <div className="max-w-md m-auto my-5">
      <h1 className="text-3xl font-bold mb-3">{note.title}</h1>
      <div className="text-sm text-gray-500">Author: {note.username}</div>
      <div className="mb-3">
        Last Updated:{" "}
        {DateTime.fromJSDate(note.updated_at).toLocaleString(
          DateTime.DATETIME_SHORT
        )}
      </div>
      <ReactMarkdown className={style.markdown}>{note.content}</ReactMarkdown>
    </div>
  );
};

import Link from "next/link";
import { sql } from "@/app/lib/server/db";
import { DateTime } from "luxon";
import Search from "@/app/ui/Search";
import SortSelectServer from "@/app/ui/SortSelectServer";

const getNotes = async (query?: string, sort?: string) => {
  let sqlStr = "select * from notes where is_published = true";
  let sqlParams = [];
  if (query) {
    sqlStr += " and title ilike $1";
    sqlParams.push(`%${query}%`);
  }

  if (sort) {
    if (sort.startsWith("-")) {
      sort = sort.slice(1);
      sqlStr += ` order by ${sort} desc`;
    } else {
      sqlStr += ` order by ${sort} asc`;
    }
  } else {
    sqlStr += " order by title asc";
  }

  const result = await sql(sqlStr, sqlParams);
  return result.rows;
};

const Page = async ({
  searchParams,
}: {
  searchParams?: { query?: string; sort?: string };
}) => {
  const query = searchParams?.query;
  const sort = searchParams?.sort;
  const notes = await getNotes(query, sort);

  return (
    <div className="m-2">
      <h2 className="bg-yellow-300 text-black p-2 font-bold my-2">
        Published Notes
      </h2>
      <div className="flex flex-row text-black">
        <div className="flex flex-col m-2 gap-y-2">
          <Search />
          <SortSelectServer />
        </div>
        <div className="m-2">
          {notes.map((note) => (
            <Link href={`/published/${note.id}`} key={note.id}>
              <div>{note.title}</div>
              <div>
                Updated:&nbsp{" "}
                {note.updated_at.toLocaleString(DateTime.DATETIME_SHORT)}
              </div>
              <div>
                Created:&nbsp{" "}
                {note.updated_at.toLocaleString(DateTime.DATETIME_SHORT)}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Page;

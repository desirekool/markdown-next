import { z } from "zod";

import { sql } from "@/app/lib/server/db";
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/app/lib/server/auth";

const UpdateParentSchema = z.object({
  parent_id: z.string().uuid(),
});

export const POST = async (req: Request, { params }: { params: { id: string } }) => {
  const user = await getCurrentUser();
  const { id } = params;
  const body = await req.json();
  const result = UpdateParentSchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json(
      {
        errors: result.error.flatten().fieldErrors,
        message: "update parent bad request",
      },
      { status: 400 }
    );
  };

  const note = await sql(
    "select * from notes where user_id = $1 and id in ($2, $3)",
    [user.id, id, result.data.parent_id]
  );

  if (note.rowCount != 2) {
    return NextResponse.json({ message: "Unauthorized access to note or parent note not found", });
  }

  await sql(
    "update notes set parent_id = $1 where id = $2",
    [result.data.parent_id, id]
  );

  return NextResponse.json({ message: "Parent updated successfully" });
}
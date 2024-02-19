import { getCurrentUser } from "@/app/lib/server/auth";
import NoteContainer from "@/app/ui/NoteContainer";

const Page = async () => {
  const user = await getCurrentUser();

  return (
    <div className="overflow-auto max-h-screen p-2 flex-none w-1/3">
      <div>Signed in as: {user.username}</div>
      <div className="m-2">
        <NoteContainer />
      </div>
    </div>
  );
};

export default Page;

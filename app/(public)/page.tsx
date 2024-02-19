import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center m-auto gap-4">
      <h1 className="bg-slate-300 p-2 text-center font-bold text-black cont">
        Markdown App
      </h1>
      <div>
        <Link
          href="/login"
          className="bg-slate-700 p-2 text-center block text-white "
        >
          Log in
        </Link>
      </div>
      <div>
        <Link
          href="/signup"
          className="p-2 text-center block text-white bg-cyan-800"
        >
          Sign up
        </Link>
      </div>
    </main>
  );
}

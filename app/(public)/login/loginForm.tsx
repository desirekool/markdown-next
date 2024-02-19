"use client";
import { useFormState } from "react-dom";
import { State, login } from "./actions";

const LoginForm = () => {
  const initialState: State = { errors: {}, message: null };
  const [state, dispatch] = useFormState(login, initialState);

  return (
    <section className="flex flex-col gap-2 w-full rounded border-black p-12 text-white bg-slate-800">
      <h1 className=" p-2 font-bold text-center text-gray-300">Login</h1>
      <form className="flex flex-col gap-2" action={dispatch}>
        <div className="flex flex-col gap-2">
          <label>Username</label>
          <input
            type="text"
            placeholder="Username"
            name="username"
            id="username"
            className="bg-slate-500 p-2 text-white block rounded"
          />
          {state?.errors?.username?.map((error, index) => (
            <p key={`user-error-${index}`} className="text-red-500">
              {error}
            </p>
          ))}
        </div>
        <div className="flex flex-col gap-2">
          <label>Password</label>
          <input
            type="password"
            placeholder="Password"
            name="password"
            id="password"
            className="bg-slate-500 p-2 text-white block rounded"
          />
          {state?.errors?.password?.map((error: string, index: number) => (
            <p key={`password-error-${index}`} className="text-red-500">
              {error}
            </p>
          ))}
        </div>

        <button type="submit" className="text-white bg-black p-2 mt-3 rounded">
          Login
        </button>
        {state?.message && <p className="text-red-500">{state.message}</p>}
      </form>
    </section>
  );
};

export default LoginForm;

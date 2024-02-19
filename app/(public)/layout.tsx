import { ReactNode } from "react";

const Layout = ({ children }: { children: ReactNode }) => {
  return (
    <div className="flex min-h-screen max-w-lg items-center justify-center p-24 m-auto">
      {children}
    </div>
  );
};

export default Layout;

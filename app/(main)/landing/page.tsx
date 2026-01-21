import React from "react";
import { auth, signIn, signOut } from "@/auth";

const Landing = async () => {
  const session = await auth();
  const userEmail = session?.user?.email ?? null;

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-xl font-semibold">Landing</h1>

     

    </div>
  );
};

export default Landing;

import { NextResponse } from "next/server";
import { auth as getSessionAuth } from "@/auth";
import { getAdminAuth } from "@/lib/firebase/admin";

export const dynamic = "force-dynamic";

export const GET = async () => {
  const session = await getSessionAuth();

  const email = session?.user?.email;
  if (!email) {
    return NextResponse.json({ message: "Not signed in" }, { status: 401 });
  }

  if (!email.endsWith("@neu.edu.ph")) {
    return NextResponse.json(
      { message: "Unauthorized email domain" },
      { status: 403 }
    );
  }

  const adminAuth = getAdminAuth();

  let userRecord;
  try {
    userRecord = await adminAuth.getUserByEmail(email);
  } catch (e: unknown) {
    const code =
      typeof e === "object" && e !== null && "code" in e
        ? (e as { code?: unknown }).code
        : undefined;

    if (code === "auth/user-not-found") {
      userRecord = await adminAuth.createUser({
        email,
        emailVerified: true,
      });
    } else {
      throw e;
    }
  }

  const customToken = await adminAuth.createCustomToken(userRecord.uid);
  return NextResponse.json({ customToken });
};

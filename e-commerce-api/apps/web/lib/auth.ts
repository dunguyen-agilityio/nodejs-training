import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export async function checkAdmin() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  // TODO: Add actual role checking logic here
  // const user = await currentUser();
  // if (user?.publicMetadata?.role !== "admin") {
  //   redirect("/");
  // }
}

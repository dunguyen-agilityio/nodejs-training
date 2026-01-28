import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// export default clerkMiddleware();

const isPublicRoute = createRouteMatcher([
  "/", // Home page
  "/sign-in(.*)", // Clerk auth pages
  "/sign-up(.*)",
]);

export default clerkMiddleware(async (auth, req) => {
  if (!isPublicRoute(req)) {
    await auth.protect();
  }

  const { sessionClaims } = await auth();

  if (sessionClaims?.org_role === "org:admin" && !req.url.includes("/admin")) {
    return NextResponse.redirect(new URL("/admin", req.url));
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};

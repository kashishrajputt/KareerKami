import { clerkMiddleware } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

// Define protected routes as an array (if needed elsewhere)
const protectedRoutes = [
  "/dasboard(.*)",
  "/resume(.*)",
  "/ai-cover-letter(.*)",
  "/interview-prep(.*)",
  "/onboarding(.*)",
];

function isProtectedPath(pathname) {
  return protectedRoutes.some((route) => pathname.startsWith(route));
}

export default clerkMiddleware(async(auth, req)=> {
  const {userId, redirectToSignIn} = await auth();

  if(!userId && isProtectedPath(req.nextUrl.pathname)){
    return redirectToSignIn();
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};
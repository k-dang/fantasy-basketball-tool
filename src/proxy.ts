import { NextRequest, NextResponse } from "next/server";

export function proxy(request: NextRequest) {
  const accessToken = request.cookies.get("yahoo_access_token")?.value;
  const expiresAt = request.cookies.get("yahoo_token_expires_at")?.value;
  const { pathname } = request.nextUrl;

  const isTokenValid =
    accessToken &&
    (!expiresAt || parseInt(expiresAt) >= Math.floor(Date.now() / 1000));

  // redirect to home if user is not authenticated and on the dashboard page
  if (pathname === "/dashboard") {
    if (!isTokenValid) {
      return NextResponse.redirect(new URL("/", request.url));
    }
    return NextResponse.next();
  }

  // redirect to dashboard if user is authenticated and on the home page
  if (pathname === "/") {
    if (isTokenValid) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for the dashboard and home pages
    "/dashboard",
    "/",
  ],
};

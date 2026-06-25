import { NextResponse } from "next/server";

import type { NextRequest } from "next/server";



export function proxy(request: NextRequest) {

  const requestHeaders = new Headers(request.headers);

  const pathname = request.nextUrl.pathname;

  const hideSiteChrome =

    pathname.startsWith("/studio") || pathname.startsWith("/crm");



  requestHeaders.set(

    "x-rosecrest-hide-site-chrome",

    hideSiteChrome ? "1" : "0"

  );

  requestHeaders.set("x-pathname", pathname);



  const isPublicCrmAuthRoute =
    pathname.startsWith("/crm/login") ||
    pathname.startsWith("/crm/forgot-password") ||
    pathname.startsWith("/crm/reset-password");

  const isPublicCrmDocsRoute = pathname.startsWith("/crm/documentation");

  if (pathname.startsWith("/crm") && !isPublicCrmAuthRoute && !isPublicCrmDocsRoute) {

    const token = request.cookies.get("crm_session")?.value;

    if (!token) {

      const loginUrl = new URL("/crm/login", request.url);

      loginUrl.searchParams.set("redirect", pathname);

      return NextResponse.redirect(loginUrl);

    }

  }



  if (isPublicCrmAuthRoute) {

    const token = request.cookies.get("crm_session")?.value;

    if (token) {

      return NextResponse.redirect(new URL("/crm", request.url));

    }

  }



  return NextResponse.next({

    request: { headers: requestHeaders },

  });

}



export const config = {

  matcher: [

    "/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",

  ],

};


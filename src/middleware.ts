import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware() {
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized({ req, token }) {
        // 公开页面
        if (req.nextUrl.pathname === "/login") {
          return true;
        }
        // 需要登录的页面
        return token !== null;
      },
    },
    pages: {
      signIn: "/login",
    },
  },
);

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/writing/:path*",
    "/documents/:path*",
    "/code-review/:path*",
    "/api/ai/:path*",
  ],
};

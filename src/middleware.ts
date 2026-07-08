export { default } from "next-auth/middleware";

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/clients/:path*",
    "/projects/:path*",
    "/subscriptions/:path*",
    "/expenses/:path*",
    "/transactions/:path*",
    "/contracts/:path*",
    "/reports/:path*",
    "/notifications/:path*",
    "/activity/:path*",
    "/settings/:path*",
  ],
};

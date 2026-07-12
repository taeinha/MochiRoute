import { lazy } from "react";
import Loadable from "@/components/shared/Loadable";
import ProtectedRoute from "./ProtectedRoute";
import GuestRoute from "./GuestRoute";

const FullLayout = Loadable(lazy(() => import("@/layouts/FullLayout")));
const BlankLayout = Loadable(lazy(() => import("@/layouts/BlankLayout")));
const Home = Loadable(lazy(() => import("@/pages/Home")));
const Auth = Loadable(lazy(() => import("@/pages/Auth")));
const AuthenticatedHome = Loadable(
  lazy(() => import("@/pages/AuthenticatedHome")),
);

const Router = [
  {
    path: "/",
    element: <FullLayout />,
    children: [
      {
        path: "/",
        element: (
          <GuestRoute>
            <Home />
          </GuestRoute>
        ),
      },
      {
        path: "dashboard",
        element: (
          <ProtectedRoute>
            <AuthenticatedHome />
          </ProtectedRoute>
        ),
      },
    ],
  },
  {
    path: "/",
    element: <BlankLayout />,
    children: [
      {
        path: "login",
        element: (
          <GuestRoute>
            <Auth type="login" />
          </GuestRoute>
        ),
      },
      {
        path: "signup",
        element: (
          <GuestRoute>
            <Auth type="signup" />
          </GuestRoute>
        ),
      },
    ],
  },
];

export default Router;

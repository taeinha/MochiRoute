import { lazy } from "react";
import Loadable from "@/components/shared/Loadable";

const FullLayout = Loadable(lazy(() => import("@/layouts/FullLayout")));
const BlankLayout = Loadable(lazy(() => import("@/layouts/BlankLayout")));
const Home = Loadable(lazy(() => import("@/pages/Home")));
const Auth = Loadable(lazy(() => import("@/pages/Auth")));

const Router = [
  {
    path: "/",
    element: <FullLayout />,
    children: [
      {
        path: "/",
        element: <Home />,
      },
    ],
  },
  {
    path: "/",
    element: <BlankLayout />,
    children: [
      {
        path: "login",
        element: <Auth type="login" />,
      },
      {
        path: "signup",
        element: <Auth type="signup" />,
      },
    ],
  },
];

export default Router;

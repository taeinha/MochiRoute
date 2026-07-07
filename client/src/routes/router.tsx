import { lazy } from "react";
import Loadable from "@/components/Loadable";

const FullLayout = Loadable(lazy(() => import("@/layouts/FullLayout")));
const Home = Loadable(lazy(() => import("@/pages/Home")));

const Router = [
  {
    path: "/",
    element: <FullLayout />,
    children: [
      {
        path: "/",
        element: <Home />,
      },
      // WIP: Authentication routes
      // {
      //   path: "/login",
      //   element: <Login />,
      // },
      // {
      //   path: "/signup",
      //   element: <Signup />,
      // },
    ],
  },
];

export default Router;

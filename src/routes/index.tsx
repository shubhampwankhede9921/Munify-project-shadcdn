import { createBrowserRouter } from "react-router-dom";
import AppLayout from "@/layouts/AppLayout";
import {
  Dashboard,
  Projects,
  ProjectsActive,
  ProjectsArchived,
  ProjectsLive,
  ProjectsFunded,
  MyProjects,
  Favorites,
  ProjectDetails,
  MunicipalDetails,
  MunicipalRatings,
  MunicipalAnalysis,
  AdminProjects,
  AdminNotifications,
  AdminUsers,
  AdminReports,
  Settings,
  NotFound,
  Landing,
  Login,
  Register,
} from "@/pages";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Landing />,
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/register",
    element: <Register />,
  },
  {
    path: "/main",
    element: <AppLayout />,
    children: [
      { index: true, element: <Dashboard /> },
      { path: "projects", element: <Projects /> },
      { path: "projects/live", element: <ProjectsLive /> },
      { path: "projects/funded", element: <ProjectsFunded /> },
      { path: "projects/my", element: <MyProjects /> },
      { path: "projects/favorites", element: <Favorites /> },
      { path: "projects/active", element: <ProjectsActive /> },
      { path: "projects/archived", element: <ProjectsArchived /> },
      { path: "projects/:id", element: <ProjectDetails /> },
      { path: "municipal", element: <MunicipalDetails /> },
      { path: "municipal/ratings", element: <MunicipalRatings /> },
      { path: "municipal/analysis", element: <MunicipalAnalysis /> },
      { path: "admin/projects", element: <AdminProjects /> },
      { path: "admin/notifications", element: <AdminNotifications /> },
      { path: "admin/users", element: <AdminUsers /> },
      { path: "admin/reports", element: <AdminReports /> },
      { path: "settings", element: <Settings /> },
      { path: "*", element: <NotFound /> },
    ],
  },
  {
    path: "*",
    element: <NotFound />,
  },
]);



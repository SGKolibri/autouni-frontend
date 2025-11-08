import { createBrowserRouter, Navigate } from "react-router-dom";
import { lazy, Suspense } from "react";
import LoadingScreen from "./components/common/LoadingScreen";
import MainLayout from "./components/layout/MainLayout";
import ProtectedRoute from "./components/common/ProtectedRoutes";

// Lazy load pages
const LoginPage = lazy(() => import("../src/features/auth/LoginPage"));
const DashboardPage = lazy(
  () => import("../src/features/dashboard/DashboardPage")
);
const BuildingsPage = lazy(
  () => import("../src/features/buildings/BuildingsPage")
);
const BuildingDetailPage = lazy(
  () => import("../src/features/buildings/BuildingDetailPage")
);
const FloorDetailPage = lazy(
  () => import("../src/features/buildings/FloorDetailPage")
);
const RoomDetailPage = lazy(
  () => import("../src/features/buildings/RoomDetailPage")
);
const DevicesPage = lazy(() => import("../src/features/devices/DevicesPage"));
const EnergyPage = lazy(() => import("../src/features/energy/EnergyPage"));
const AutomationsPage = lazy(
  () => import("../src/features/automations/AutomationsPage")
);
const ReportsPage = lazy(() => import("../src/features/reports/ReportsPage"));
const SettingsPage = lazy(() => import("../src/features/settings/SettingsPage"));
const ProfilePage = lazy(() => import("../src/features/auth/ProfilePage"));
const NotFoundPage = lazy(() => import("../src/features/common/NotFoundPage"));

// Wrapper com Suspense
const SuspenseWrapper = ({ children }: { children: React.ReactNode }) => (
  <Suspense fallback={<LoadingScreen />}>{children}</Suspense>
);

export const router = createBrowserRouter([
  {
    path: "/login",
    element: (
      <SuspenseWrapper>
        <LoginPage />
      </SuspenseWrapper>
    ),
  },
  {
    path: "/",
    element: (
      <ProtectedRoute>
        <MainLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: (
          <SuspenseWrapper>
            <DashboardPage />
          </SuspenseWrapper>
        ),
      },
      {
        path: "buildings",
        element: (
          <SuspenseWrapper>
            <BuildingsPage />
          </SuspenseWrapper>
        ),
      },
      {
        path: "buildings/:buildingId",
        element: (
          <SuspenseWrapper>
            <BuildingDetailPage />
          </SuspenseWrapper>
        ),
      },
      {
        path: "floors/:floorId",
        element: (
          <SuspenseWrapper>
            <FloorDetailPage />
          </SuspenseWrapper>
        ),
      },
      {
        path: "rooms/:roomId",
        element: (
          <SuspenseWrapper>
            <RoomDetailPage />
          </SuspenseWrapper>
        ),
      },
      {
        path: "devices",
        element: (
          <SuspenseWrapper>
            <DevicesPage />
          </SuspenseWrapper>
        ),
      },
      {
        path: "energy",
        element: (
          <SuspenseWrapper>
            <EnergyPage />
          </SuspenseWrapper>
        ),
      },
      {
        path: "automations",
        element: (
          <SuspenseWrapper>
            <AutomationsPage />
          </SuspenseWrapper>
        ),
      },
      {
        path: "reports",
        element: (
          <SuspenseWrapper>
            <ReportsPage />
          </SuspenseWrapper>
        ),
      },
      {
        path: "settings",
        element: (
          <SuspenseWrapper>
            <SettingsPage />
          </SuspenseWrapper>
        ),
      },
      {
        path: "profile",
        element: (
          <SuspenseWrapper>
            <ProfilePage />
          </SuspenseWrapper>
        ),
      },
    ],
  },
  {
    path: "*",
    element: (
      <SuspenseWrapper>
        <NotFoundPage />
      </SuspenseWrapper>
    ),
  },
]);

export default router;

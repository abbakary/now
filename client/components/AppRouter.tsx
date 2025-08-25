import React from "react";
import { Routes, Route } from "react-router-dom";
import { DashboardLayout } from "./layout/DashboardLayout";
import { ProtectedRoute } from "./auth/ProtectedRoute";
import { UserRole } from "@shared/types";

// Import pages
import Dashboard from "../pages/Dashboard";
import PlaceholderPage from "../pages/PlaceholderPage";
import UnifiedCustomerManagement from "../pages/customers/UnifiedCustomerManagement";
import CustomerDetails from "../pages/customers/CustomerDetails";
import TireServices from "../pages/services/TireServices";
import CarServices from "../pages/services/CarServices";
import UnifiedServiceManagement from "../pages/services/UnifiedServiceManagement";
import TireInventory from "../pages/inventory/TireInventory";
import InvoiceManagement from "../pages/invoices/InvoiceManagement";
import SalesManagement from "../pages/sales/SalesManagement";
import NewSaleTransaction from "../pages/sales/NewSaleTransaction";
import SalesAnalytics from "../pages/sales/SalesAnalytics";
import UnifiedOrderDashboard from "../pages/orders/UnifiedOrderDashboard";
import NotFound from "../pages/NotFound";
import Login from "../pages/Login";

// Admin pages
import UserManagement from "../pages/admin/UserManagement";
import InventoryManagement from "../pages/admin/InventoryManagement";
import Settings from "../pages/admin/Settings";

// Icons for placeholders
import {
  Users,
  Search,
  UserPlus,
  Building2,
  Car,
  ShoppingCart,
  HelpCircle,
  Clock,
  UserCheck,
  FileText,
  Calendar,
  TrendingUp,
  BarChart3,
  Shield,
  Settings,
} from "lucide-react";

function WrappedPlaceholder({
  title,
  description,
  icon,
  requiredRole,
}: {
  title: string;
  description: string;
  icon: any;
  requiredRole?: UserRole | UserRole[];
}) {
  return (
    <ProtectedRoute requiredRole={requiredRole}>
      <DashboardLayout>
        <PlaceholderPage title={title} description={description} icon={icon} />
      </DashboardLayout>
    </ProtectedRoute>
  );
}

function ProtectedPage({
  children,
  requiredRole,
}: {
  children: React.ReactNode;
  requiredRole?: UserRole | UserRole[];
}) {
  return (
    <ProtectedRoute requiredRole={requiredRole}>
      <DashboardLayout>{children}</DashboardLayout>
    </ProtectedRoute>
  );
}

export const AppRouter: React.FC = () => {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<Login />} />

      {/* Protected routes - ProtectedRoute will show Login if no user */}
      <Route
        path="/"
        element={
          <ProtectedPage>
            <Dashboard />
          </ProtectedPage>
        }
      />

      {/* Customer Management Routes - Office Manager and Admin */}
      <Route
        path="/customers"
        element={
          <ProtectedPage
            requiredRole={[UserRole.ADMIN, UserRole.OFFICE_MANAGER]}
          >
            <UnifiedCustomerManagement />
          </ProtectedPage>
        }
      />
      {/* Legacy routes for backwards compatibility */}
      <Route
        path="/customers/search"
        element={
          <ProtectedPage
            requiredRole={[UserRole.ADMIN, UserRole.OFFICE_MANAGER]}
          >
            <UnifiedCustomerManagement />
          </ProtectedPage>
        }
      />
      <Route
        path="/customers/add"
        element={
          <ProtectedPage
            requiredRole={[UserRole.ADMIN, UserRole.OFFICE_MANAGER]}
          >
            <UnifiedCustomerManagement />
          </ProtectedPage>
        }
      />
      <Route
        path="/customers/types"
        element={
          <ProtectedPage
            requiredRole={[UserRole.ADMIN, UserRole.OFFICE_MANAGER]}
          >
            <UnifiedCustomerManagement />
          </ProtectedPage>
        }
      />
      {/* Customer details - keep as separate page for now */}
      <Route
        path="/customers/:customerId"
        element={
          <ProtectedPage
            requiredRole={[UserRole.ADMIN, UserRole.OFFICE_MANAGER]}
          >
            <CustomerDetails />
          </ProtectedPage>
        }
      />

      {/* Service Management Routes - All roles */}
      <Route
        path="/services"
        element={
          <ProtectedPage>
            <UnifiedServiceManagement />
          </ProtectedPage>
        }
      />
      <Route
        path="/services/car"
        element={
          <ProtectedPage>
            <CarServices />
          </ProtectedPage>
        }
      />
      <Route
        path="/services/tires"
        element={
          <ProtectedPage>
            <TireServices />
          </ProtectedPage>
        }
      />
      <Route
        path="/inventory/tires"
        element={
          <ProtectedPage
            requiredRole={[UserRole.ADMIN, UserRole.OFFICE_MANAGER]}
          >
            <TireInventory />
          </ProtectedPage>
        }
      />
      <Route
        path="/invoices"
        element={
          <ProtectedPage
            requiredRole={[UserRole.ADMIN, UserRole.OFFICE_MANAGER]}
          >
            <InvoiceManagement />
          </ProtectedPage>
        }
      />
      <Route
        path="/sales"
        element={
          <ProtectedPage>
            <SalesManagement />
          </ProtectedPage>
        }
      />
      <Route
        path="/sales/new"
        element={
          <ProtectedPage>
            <NewSaleTransaction />
          </ProtectedPage>
        }
      />
      <Route
        path="/sales/analytics"
        element={
          <ProtectedPage
            requiredRole={[UserRole.ADMIN, UserRole.OFFICE_MANAGER]}
          >
            <SalesAnalytics />
          </ProtectedPage>
        }
      />
      <Route
        path="/services/consultations"
        element={
          <WrappedPlaceholder
            title="Consultations"
            description="Manage customer consultation requests and information"
            icon={HelpCircle}
            requiredRole={[UserRole.ADMIN, UserRole.OFFICE_MANAGER]}
          />
        }
      />

      {/* Unified Order Management */}
      <Route
        path="/orders"
        element={
          <ProtectedPage>
            <UnifiedOrderDashboard />
          </ProtectedPage>
        }
      />
      <Route
        path="/orders/:orderId"
        element={
          <WrappedPlaceholder
            title="Order Details"
            description="View and manage order details"
            icon={FileText}
          />
        }
      />

      {/* Tracking Routes */}
      <Route
        path="/tracking/daily"
        element={
          <WrappedPlaceholder
            title="Daily Tracking"
            description="Monitor daily service activities and time tracking"
            icon={Calendar}
          />
        }
      />
      <Route
        path="/tracking/status"
        element={
          <WrappedPlaceholder
            title="Service Status"
            description="Track service progress and completion status"
            icon={TrendingUp}
          />
        }
      />

      {/* Reports Routes - Admin and Office Manager only */}
      <Route
        path="/reports/daily"
        element={
          <WrappedPlaceholder
            title="Daily Reports"
            description="Generate and view daily performance reports"
            icon={Calendar}
            requiredRole={[UserRole.ADMIN, UserRole.OFFICE_MANAGER]}
          />
        }
      />
      <Route
        path="/reports/weekly"
        element={
          <WrappedPlaceholder
            title="Weekly Reports"
            description="Analyze weekly trends and performance metrics"
            icon={TrendingUp}
            requiredRole={[UserRole.ADMIN, UserRole.OFFICE_MANAGER]}
          />
        }
      />
      <Route
        path="/reports/monthly"
        element={
          <WrappedPlaceholder
            title="Monthly Reports"
            description="Review monthly analytics and business insights"
            icon={BarChart3}
            requiredRole={[UserRole.ADMIN, UserRole.OFFICE_MANAGER]}
          />
        }
      />
      <Route
        path="/reports/yearly"
        element={
          <WrappedPlaceholder
            title="Yearly Reports"
            description="Comprehensive yearly analysis and growth metrics"
            icon={TrendingUp}
            requiredRole={[UserRole.ADMIN, UserRole.OFFICE_MANAGER]}
          />
        }
      />

      {/* Administration Routes - Admin only */}
      <Route
        path="/admin/users"
        element={
          <ProtectedPage requiredRole={UserRole.ADMIN}>
            <UserManagement />
          </ProtectedPage>
        }
      />
      <Route
        path="/admin/inventory"
        element={
          <ProtectedPage requiredRole={UserRole.ADMIN}>
            <InventoryManagement />
          </ProtectedPage>
        }
      />
      <Route
        path="/admin/settings"
        element={
          <ProtectedPage requiredRole={UserRole.ADMIN}>
            <Settings />
          </ProtectedPage>
        }
      />

      {/* 404 Route */}
      <Route
        path="*"
        element={
          <ProtectedRoute>
            <NotFound />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
};

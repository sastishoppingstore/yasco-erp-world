import { lazy, Suspense } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router";
import AppLayout from "./components/AppLayout";
import { Spinner } from "./components/ui/spinner";

const oldPrefixes = [
  "accounting", "inventory", "sales", "purchase", "crm", "hrm",
  "manufacturing", "projects", "helpdesk", "assets", "reports",
  "settings", "platform",
];

function OldPathRedirect() {
  const { pathname, search } = useLocation();
  const firstSegment = pathname.split("/")[1];
  if (oldPrefixes.includes(firstSegment)) {
    return <Navigate to={`/app${pathname}${search}`} replace />;
  }
  return <NotFound />;
}

const Landing = lazy(() => import("./pages/Landing"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Login = lazy(() => import("./pages/Login"));
const NotFound = lazy(() => import("./pages/NotFound"));

// SaaS Pages
const RegisterBusiness = lazy(() => import("./pages/RegisterBusiness"));
const VerifyOtp = lazy(() => import("./pages/VerifyOtp"));
const SelectPlan = lazy(() => import("./pages/SelectPlan"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const SetupWizard = lazy(() => import("./pages/SetupWizard"));
const SubscriptionPage = lazy(() => import("./pages/SubscriptionPage"));
const UpgradePlan = lazy(() => import("./pages/UpgradePlan"));
const TaxSettings = lazy(() => import("./pages/TaxSettings"));
const NotificationPreferences = lazy(() => import("./pages/NotificationPreferences"));
const FbrTaxSettings = lazy(() => import("./pages/FbrTaxSettings"));

// Super Admin Pages
const SuperAdminDashboard = lazy(() => import("./pages/SuperAdminDashboard"));
const SuperAdminPlans = lazy(() => import("./pages/SuperAdminPlans"));
const SuperAdminCompanies = lazy(() => import("./pages/SuperAdminCompanies"));
const SuperAdminSmtp = lazy(() => import("./pages/SuperAdminSmtp"));
const SuperAdminEmailTemplates = lazy(() => import("./pages/SuperAdminEmailTemplates"));

// New Module Pages
const TaskList = lazy(() => import("./pages/tasks/TaskList"));
const MeetingList = lazy(() => import("./pages/meetings/MeetingList"));

// Sync Pages
const SyncQueuePage = lazy(() => import("./pages/sync/SyncQueuePage"));
const SyncLogsPage = lazy(() => import("./pages/sync/SyncLogsPage"));
const ConflictResolutionPage = lazy(() => import("./pages/sync/ConflictResolutionPage"));
const DeviceManagementPage = lazy(() => import("./pages/sync/DeviceManagementPage"));
const OfflineSettingsPage = lazy(() => import("./pages/sync/OfflineSettingsPage"));
const LocalDatabaseStatusPage = lazy(() => import("./pages/sync/LocalDatabaseStatusPage"));

// Accounting
const AccountingPage = lazy(() => import("./pages/accounting"));
const ChartOfAccountsPage = lazy(() => import("./pages/accounting/coa"));
const JournalEntriesPage = lazy(() => import("./pages/accounting/journal-entries"));
const GeneralLedgerPage = lazy(() => import("./pages/accounting/ledger"));
const TrialBalancePage = lazy(() => import("./pages/accounting/trial-balance"));
const CostCentersPage = lazy(() => import("./pages/accounting/cost-centers"));
const AccountingSettingsPage = lazy(() => import("./pages/accounting/settings"));

// Inventory
const InventoryPage = lazy(() => import("./pages/inventory"));
const ProductsPage = lazy(() => import("./pages/inventory/products"));
const StockLevelsPage = lazy(() => import("./pages/inventory/stock"));
const WarehousesPage = lazy(() => import("./pages/inventory/warehouses"));
const StockMovementsPage = lazy(() => import("./pages/inventory/movements"));
const StockTransfersPage = lazy(() => import("./pages/inventory/transfers"));

// Sales
const SalesPage = lazy(() => import("./pages/sales"));
const CustomersPage = lazy(() => import("./pages/sales/customers"));
const InvoicesPage = lazy(() => import("./pages/sales/invoices"));
const QuotationsPage = lazy(() => import("./pages/sales/quotations"));
const SalesOrdersPage = lazy(() => import("./pages/sales/orders"));
const CreditNotesPage = lazy(() => import("./pages/sales/credit-notes"));
const CustomerPaymentsPage = lazy(() => import("./pages/sales/payments"));

// Purchase
const PurchasePage = lazy(() => import("./pages/purchase"));
const SuppliersPage = lazy(() => import("./pages/purchase/suppliers"));
const PurchaseOrdersPage = lazy(() => import("./pages/purchase/orders"));
const GRNPage = lazy(() => import("./pages/purchase/grn"));
const SupplierPaymentsPage = lazy(() => import("./pages/purchase/payments"));

// CRM
const CRMPage = lazy(() => import("./pages/crm"));
const LeadsPage = lazy(() => import("./pages/crm/leads"));
const OpportunitiesPage = lazy(() => import("./pages/crm/opportunities"));
const ActivitiesPage = lazy(() => import("./pages/crm/activities"));

// HRM
const HRMPage = lazy(() => import("./pages/hrm"));
const EmployeesPage = lazy(() => import("./pages/hrm/employees"));
const AttendancePage = lazy(() => import("./pages/hrm/attendance"));
const LeavePage = lazy(() => import("./pages/hrm/leave"));
const PayrollPage = lazy(() => import("./pages/hrm/payroll"));
const PerformancePage = lazy(() => import("./pages/hrm/performance"));

// Projects
const ProjectsLandingPage = lazy(() => import("./pages/projects"));
const ProjectsPage = lazy(() => import("./pages/projects/list"));
const TasksPage = lazy(() => import("./pages/projects/tasks"));
const TimesheetsPage = lazy(() => import("./pages/projects/timesheets"));

// Manufacturing
const ManufacturingPage = lazy(() => import("./pages/manufacturing"));
const BOMPage = lazy(() => import("./pages/manufacturing/bom"));
const WorkOrdersPage = lazy(() => import("./pages/manufacturing/work-orders"));
const ProductionPage = lazy(() => import("./pages/manufacturing/production"));

// Help Desk
const TicketsPage = lazy(() => import("./pages/helpdesk/tickets"));

// Assets
const AssetsPage = lazy(() => import("./pages/assets/list"));
const FleetPage = lazy(() => import("./pages/assets/fleet"));

// Platform
const GrowthEnginePage = lazy(() => import("./pages/platform/GrowthEngine"));
const SolutionLibraryPage = lazy(() => import("./pages/platform/SolutionLibrary"));
const SolutionPage = lazy(() => import("./pages/platform/SolutionPage"));

// Reports & Settings
const ReportsPage = lazy(() => import("./pages/reports"));
const ZatcaStatusReportPage = lazy(() => import("./pages/reports/zatca-status"));
const SettingsPage = lazy(() => import("./pages/settings"));
const CompanyLegalInformationPage = lazy(() => import("./pages/settings/company-legal-information"));
const ZatcaIntegrationPage = lazy(() => import("./pages/settings/zatca-integration"));
const ZatcaSetupHelpPage = lazy(() => import("./pages/help/zatca-setup"));

// New Modules
const POSPage = lazy(() => import("./pages/pos"));
const CashboxPage = lazy(() => import("./pages/cashbox"));
const InstallmentsPage = lazy(() => import("./pages/installments"));

// Admin Pages
const WebsiteAdminPage = lazy(() => import("./pages/admin/website"));
const MasterControlPage = lazy(() => import("./pages/admin/master-control"));

function LayoutWrapper({ children }: { children: React.ReactNode }) {
  return <AppLayout>{children}</AppLayout>;
}

export default function App() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><Spinner className="size-8" /></div>}>
    <Routes>
      {/* Public landing page */}
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<RegisterBusiness />} />
      <Route path="/verify-otp" element={<VerifyOtp />} />
      <Route path="/select-plan" element={<SelectPlan />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/help/zatca-setup" element={<ZatcaSetupHelpPage />} />

      {/* App routes (all ERP pages under /app) */}
      <Route path="/app" element={<LayoutWrapper><Dashboard /></LayoutWrapper>} />

      {/* Accounting Routes */}
      <Route path="/app/accounting" element={<LayoutWrapper><AccountingPage /></LayoutWrapper>} />
      <Route path="/app/accounting/coa" element={<LayoutWrapper><ChartOfAccountsPage /></LayoutWrapper>} />
      <Route path="/app/accounting/journal-entries" element={<LayoutWrapper><JournalEntriesPage /></LayoutWrapper>} />
      <Route path="/app/accounting/ledger" element={<LayoutWrapper><GeneralLedgerPage /></LayoutWrapper>} />
      <Route path="/app/accounting/reports" element={<LayoutWrapper><ReportsPage /></LayoutWrapper>} />
      <Route path="/app/accounting/trial-balance" element={<LayoutWrapper><TrialBalancePage /></LayoutWrapper>} />
      <Route path="/app/accounting/cost-centers" element={<LayoutWrapper><CostCentersPage /></LayoutWrapper>} />
      <Route path="/app/accounting/settings" element={<LayoutWrapper><AccountingSettingsPage /></LayoutWrapper>} />

      {/* Inventory Routes */}
      <Route path="/app/inventory" element={<LayoutWrapper><InventoryPage /></LayoutWrapper>} />
      <Route path="/app/inventory/products" element={<LayoutWrapper><ProductsPage /></LayoutWrapper>} />
      <Route path="/app/inventory/warehouses" element={<LayoutWrapper><WarehousesPage /></LayoutWrapper>} />
      <Route path="/app/inventory/stock" element={<LayoutWrapper><StockLevelsPage /></LayoutWrapper>} />
      <Route path="/app/inventory/movements" element={<LayoutWrapper><StockMovementsPage /></LayoutWrapper>} />
      <Route path="/app/inventory/transfers" element={<LayoutWrapper><StockTransfersPage /></LayoutWrapper>} />

      {/* Sales Routes */}
      <Route path="/app/sales" element={<LayoutWrapper><SalesPage /></LayoutWrapper>} />
      <Route path="/app/sales/customers" element={<LayoutWrapper><CustomersPage /></LayoutWrapper>} />
      <Route path="/app/sales/quotations" element={<LayoutWrapper><QuotationsPage /></LayoutWrapper>} />
      <Route path="/app/sales/orders" element={<LayoutWrapper><SalesOrdersPage /></LayoutWrapper>} />
      <Route path="/app/sales/invoices" element={<LayoutWrapper><InvoicesPage /></LayoutWrapper>} />
      <Route path="/app/sales/credit-notes" element={<LayoutWrapper><CreditNotesPage /></LayoutWrapper>} />
      <Route path="/app/sales/payments" element={<LayoutWrapper><CustomerPaymentsPage /></LayoutWrapper>} />

      {/* Purchase Routes */}
      <Route path="/app/purchase" element={<LayoutWrapper><PurchasePage /></LayoutWrapper>} />
      <Route path="/app/purchase/suppliers" element={<LayoutWrapper><SuppliersPage /></LayoutWrapper>} />
      <Route path="/app/purchase/orders" element={<LayoutWrapper><PurchaseOrdersPage /></LayoutWrapper>} />
      <Route path="/app/purchase/grn" element={<LayoutWrapper><GRNPage /></LayoutWrapper>} />
      <Route path="/app/purchase/payments" element={<LayoutWrapper><SupplierPaymentsPage /></LayoutWrapper>} />

      {/* CRM Routes */}
      <Route path="/app/crm" element={<LayoutWrapper><CRMPage /></LayoutWrapper>} />
      <Route path="/app/crm/leads" element={<LayoutWrapper><LeadsPage /></LayoutWrapper>} />
      <Route path="/app/crm/opportunities" element={<LayoutWrapper><OpportunitiesPage /></LayoutWrapper>} />
      <Route path="/app/crm/activities" element={<LayoutWrapper><ActivitiesPage /></LayoutWrapper>} />

      {/* HRM Routes */}
      <Route path="/app/hrm" element={<LayoutWrapper><HRMPage /></LayoutWrapper>} />
      <Route path="/app/hrm/employees" element={<LayoutWrapper><EmployeesPage /></LayoutWrapper>} />
      <Route path="/app/hrm/attendance" element={<LayoutWrapper><AttendancePage /></LayoutWrapper>} />
      <Route path="/app/hrm/leave" element={<LayoutWrapper><LeavePage /></LayoutWrapper>} />
      <Route path="/app/hrm/payroll" element={<LayoutWrapper><PayrollPage /></LayoutWrapper>} />
      <Route path="/app/hrm/performance" element={<LayoutWrapper><PerformancePage /></LayoutWrapper>} />

      {/* Manufacturing Routes */}
      <Route path="/app/manufacturing" element={<LayoutWrapper><ManufacturingPage /></LayoutWrapper>} />
      <Route path="/app/manufacturing/bom" element={<LayoutWrapper><BOMPage /></LayoutWrapper>} />
      <Route path="/app/manufacturing/work-orders" element={<LayoutWrapper><WorkOrdersPage /></LayoutWrapper>} />
      <Route path="/app/manufacturing/production" element={<LayoutWrapper><ProductionPage /></LayoutWrapper>} />

      {/* Projects Routes */}
      <Route path="/app/projects" element={<LayoutWrapper><ProjectsLandingPage /></LayoutWrapper>} />
      <Route path="/app/projects/list" element={<LayoutWrapper><ProjectsPage /></LayoutWrapper>} />
      <Route path="/app/projects/tasks" element={<LayoutWrapper><TasksPage /></LayoutWrapper>} />
      <Route path="/app/projects/timesheets" element={<LayoutWrapper><TimesheetsPage /></LayoutWrapper>} />

      {/* Help Desk */}
      <Route path="/app/helpdesk" element={<LayoutWrapper><TicketsPage /></LayoutWrapper>} />
      <Route path="/app/helpdesk/tickets" element={<LayoutWrapper><TicketsPage /></LayoutWrapper>} />

      {/* Assets & Fleet */}
      <Route path="/app/assets" element={<LayoutWrapper><AssetsPage /></LayoutWrapper>} />
      <Route path="/app/assets/list" element={<LayoutWrapper><AssetsPage /></LayoutWrapper>} />
      <Route path="/app/assets/fleet" element={<LayoutWrapper><FleetPage /></LayoutWrapper>} />

      {/* Platform */}
      <Route path="/app/platform/growth-engine" element={<LayoutWrapper><GrowthEnginePage /></LayoutWrapper>} />
      <Route path="/app/platform/solutions" element={<LayoutWrapper><SolutionLibraryPage /></LayoutWrapper>} />
      <Route path="/app/platform/solutions/:slug" element={<LayoutWrapper><SolutionPage /></LayoutWrapper>} />

      {/* Reports & Settings */}
      <Route path="/app/reports" element={<LayoutWrapper><ReportsPage /></LayoutWrapper>} />
      <Route path="/app/reports/zatca-status" element={<LayoutWrapper><ZatcaStatusReportPage /></LayoutWrapper>} />
      <Route path="/app/settings" element={<LayoutWrapper><SettingsPage /></LayoutWrapper>} />
      <Route path="/app/settings/company-legal-information" element={<LayoutWrapper><CompanyLegalInformationPage /></LayoutWrapper>} />
      <Route path="/app/settings/zatca-integration" element={<LayoutWrapper><ZatcaIntegrationPage /></LayoutWrapper>} />

      {/* Admin Pages */}
      <Route path="/app/admin/website" element={<LayoutWrapper><WebsiteAdminPage /></LayoutWrapper>} />
      <Route path="/app/admin/master-control" element={<LayoutWrapper><MasterControlPage /></LayoutWrapper>} />
      <Route path="/app/admin/super-dashboard" element={<LayoutWrapper><SuperAdminDashboard /></LayoutWrapper>} />
      <Route path="/app/admin/super-plans" element={<LayoutWrapper><SuperAdminPlans /></LayoutWrapper>} />
      <Route path="/app/admin/super-companies" element={<LayoutWrapper><SuperAdminCompanies /></LayoutWrapper>} />
      <Route path="/app/admin/super-smtp" element={<LayoutWrapper><SuperAdminSmtp /></LayoutWrapper>} />
      <Route path="/app/admin/super-email-templates" element={<LayoutWrapper><SuperAdminEmailTemplates /></LayoutWrapper>} />

      {/* New Modules */}
      <Route path="/app/pos" element={<POSPage />} />
      <Route path="/app/cashbox" element={<LayoutWrapper><CashboxPage /></LayoutWrapper>} />
      <Route path="/app/installments" element={<LayoutWrapper><InstallmentsPage /></LayoutWrapper>} />
      <Route path="/app/setup-wizard" element={<LayoutWrapper><SetupWizard /></LayoutWrapper>} />
      <Route path="/app/subscription" element={<LayoutWrapper><SubscriptionPage /></LayoutWrapper>} />
      <Route path="/app/upgrade-plan" element={<LayoutWrapper><UpgradePlan /></LayoutWrapper>} />
      <Route path="/app/tax-settings" element={<LayoutWrapper><TaxSettings /></LayoutWrapper>} />
      <Route path="/app/notifications/preferences" element={<LayoutWrapper><NotificationPreferences /></LayoutWrapper>} />
      <Route path="/app/tax-settings/fbr" element={<LayoutWrapper><FbrTaxSettings /></LayoutWrapper>} />
      <Route path="/app/tasks" element={<LayoutWrapper><TaskList /></LayoutWrapper>} />
      <Route path="/app/meetings" element={<LayoutWrapper><MeetingList /></LayoutWrapper>} />

      {/* Sync Routes */}
      <Route path="/app/sync/queue" element={<LayoutWrapper><SyncQueuePage /></LayoutWrapper>} />
      <Route path="/app/sync/logs" element={<LayoutWrapper><SyncLogsPage /></LayoutWrapper>} />
      <Route path="/app/sync/conflicts" element={<LayoutWrapper><ConflictResolutionPage /></LayoutWrapper>} />
      <Route path="/app/sync/devices" element={<LayoutWrapper><DeviceManagementPage /></LayoutWrapper>} />
      <Route path="/app/sync/settings" element={<LayoutWrapper><OfflineSettingsPage /></LayoutWrapper>} />
      <Route path="/app/sync/database-status" element={<LayoutWrapper><LocalDatabaseStatusPage /></LayoutWrapper>} />

      {/* Redirect old ERP paths to /app/ prefix */}
      <Route path="/:prefix/*" element={<OldPathRedirect />} />

      <Route path="*" element={<NotFound />} />
    </Routes>
    </Suspense>
  );
}

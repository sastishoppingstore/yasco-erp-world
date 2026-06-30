import { lazy, Suspense } from "react";
import './i18n';
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
const Impersonate = lazy(() => import("./pages/Impersonate"));

// New Module Pages
const TaskList = lazy(() => import("./pages/tasks/TaskList"));
const MeetingList = lazy(() => import("./pages/meetings/MeetingList"));

// AI Pages
const AIReportsPage = lazy(() => import("./pages/ai/AIReports"));
const AIForecastingPage = lazy(() => import("./pages/ai/AIForecasting"));
const AIChatbotPage = lazy(() => import("./pages/ai/Chatbot"));
const AIAutomationPage = lazy(() => import("./pages/ai/Automation"));
const AIVoicePage = lazy(() => import("./pages/ai/Voice"));

// BI Pages
const DashboardBuilderPage = lazy(() => import("./pages/bi/DashboardBuilder"));
const ReportBuilderPage = lazy(() => import("./pages/bi/ReportBuilder"));

// Document Pages
const DocumentRepositoryPage = lazy(() => import("./pages/documents/DocumentRepository"));
const DocumentUploadPage = lazy(() => import("./pages/documents/DocumentUpload"));
const SignatureRequestPage = lazy(() => import("./pages/documents/SignatureRequest"));
const SignaturePadPage = lazy(() => import("./pages/documents/SignaturePad"));

// Notification Pages
const SendNotificationPage = lazy(() => import("./pages/notifications/SendNotification"));
const NotificationChannelsPage = lazy(() => import("./pages/settings/notification-channels"));
const NotificationTemplatesPage = lazy(() => import("./pages/settings/notification-templates"));

// IoT Pages
const IoTDashboardPage = lazy(() => import("./pages/iot/Dashboard"));
const IoTDevicesPage = lazy(() => import("./pages/iot/Devices"));
const IoTAlertsPage = lazy(() => import("./pages/iot/Alerts"));

// Workflow Pages
const WorkflowListPage = lazy(() => import("./pages/admin/workflows/WorkflowList"));
const WorkflowEditorPage = lazy(() => import("./pages/admin/workflows/WorkflowEditor"));
const WorkflowLogsPage = lazy(() => import("./pages/admin/workflows/WorkflowLogs"));

// Plugin Pages
const PluginMarketplacePage = lazy(() => import("./pages/admin/PluginMarketplace"));
const PluginManagerPage = lazy(() => import("./pages/admin/PluginManager"));

// Compliance Pages
const DataProtectionPage = lazy(() => import("./pages/admin/compliance/DataProtection"));
const AuditExportPage = lazy(() => import("./pages/admin/compliance/AuditExport"));
const SecurityDashboardPage = lazy(() => import("./pages/admin/compliance/SecurityDashboard"));

// Mobile Pages
const MobileDashboardPage = lazy(() => import("./pages/mobile/Dashboard"));
const MobileApprovalsPage = lazy(() => import("./pages/mobile/Approvals"));
const MobileAttendancePage = lazy(() => import("./pages/mobile/Attendance"));
const MobileQuickSalesPage = lazy(() => import("./pages/mobile/QuickSales"));

// Admin Pages
const WorkflowBuilderPage = lazy(() => import("./pages/admin/WorkflowBuilder"));

// Sync Pages
function ErpRedirect() {
  const { pathname } = useLocation();
  const rest = pathname.replace(/^\/erp/, "");
  return <Navigate to={`/app${rest || ""}`} replace />;
}

function AdminRedirect() {
  const { pathname } = useLocation();
  const rest = pathname.replace(/^\/admin/, "");
  return <Navigate to={`/app/admin${rest || ""}`} replace />;
}

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
const StockAdjustmentsPage = lazy(() => import("./pages/inventory/adjustments"));
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
const PurchaseRequisitionsPage = lazy(() => import("./pages/purchase/requisitions"));
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

// Saudi-specific New Pages
const SaudiPayroll = lazy(() => import("./pages/hrm/SaudiPayroll"));
const GOSIPage = lazy(() => import("./pages/hrm/gosi"));
const WPSPage = lazy(() => import("./pages/hrm/wps"));
const EOSBPage = lazy(() => import("./pages/hrm/eosb"));
const SaudiCompliancePage = lazy(() => import("./pages/hrm/saudi-compliance"));
const BiometricSetupPage = lazy(() => import("./pages/hrm/biometric-setup"));
const FinancialStatements = lazy(() => import("./pages/reports/FinancialStatements"));
const ZatcaDashboard = lazy(() => import("./pages/reports/ZatcaDashboard"));

// New Modules
const POSPage = lazy(() => import("./pages/pos"));
const POSDashboard = lazy(() => import("./pages/pos/PosDashboard"));
const POSRestaurantPage = lazy(() => import("./pages/pos/restaurant"));
const POSPharmacyPage = lazy(() => import("./pages/pos/pharmacy"));
const POSWholesalePage = lazy(() => import("./pages/pos/wholesale"));
const POSShiftManagementPage = lazy(() => import("./pages/pos/shift-management"));
const CashboxPage = lazy(() => import("./pages/cashbox"));
const InstallmentsPage = lazy(() => import("./pages/installments"));

// Admin Pages
const WebsiteAdminPage = lazy(() => import("./pages/admin/website"));
const MasterControlPage = lazy(() => import("./pages/admin/master-control"));
const ResellerKeysPage = lazy(() => import("./pages/admin/reseller-keys"));
const LicenseApprovalPage = lazy(() => import("./pages/admin/license-approval"));
const LicenseConsolePage = lazy(() => import("./pages/admin/LicenseConsole"));
const SuperResellersPage = lazy(() => import("./pages/admin/super-resellers"));
const InvoiceSettingsPage = lazy(() => import("./pages/admin/invoice-settings"));

// ZATCA phase 2 pages
const ZatcaPhase2SetupPage = lazy(() => import("./pages/settings/zatca-phase2-setup"));

// Company Profile & Branch Management
const CompanyProfilePage = lazy(() => import("./pages/settings/CompanyProfile"));
const BranchManagementPage = lazy(() => import("./pages/branches/BranchManagement"));

// Portal pages
const PortalLayout = lazy(() => import("./pages/portal/PortalLayout"));
const PortalLogin = lazy(() => import("./pages/portal/PortalLogin"));
const PortalCustomerDashboard = lazy(() => import("./pages/portal/customer/PortalDashboard"));
const PortalCustomerInvoices = lazy(() => import("./pages/portal/customer/Invoices"));
const PortalCustomerPayments = lazy(() => import("./pages/portal/customer/Payments"));
const PortalCustomerOrders = lazy(() => import("./pages/portal/customer/Orders"));
const PortalCustomerTickets = lazy(() => import("./pages/portal/customer/SupportTickets"));
const PortalCustomerProfile = lazy(() => import("./pages/portal/customer/Profile"));
const PortalVendorDashboard = lazy(() => import("./pages/portal/vendor/PortalDashboard"));
const PortalVendorPOs = lazy(() => import("./pages/portal/vendor/PurchaseOrders"));
const PortalVendorInvoices = lazy(() => import("./pages/portal/vendor/Invoices"));
const PortalVendorPayments = lazy(() => import("./pages/portal/vendor/Payments"));
const PortalVendorProfile = lazy(() => import("./pages/portal/vendor/Profile"));
const PortalEmployeeDashboard = lazy(() => import("./pages/portal/employee/PortalDashboard"));
const PortalEmployeePayslips = lazy(() => import("./pages/portal/employee/Payslips"));
const PortalEmployeeLeave = lazy(() => import("./pages/portal/employee/LeaveRequests"));
const PortalEmployeeAttendance = lazy(() => import("./pages/portal/employee/AttendanceHistory"));
const PortalEmployeeDocuments = lazy(() => import("./pages/portal/employee/Documents"));
const PortalEmployeeProfile = lazy(() => import("./pages/portal/employee/Profile"));

// Consolidation Module Pages
const ConsolidationLayout = lazy(() => import("./pages/consolidation/ConsolidationLayout"));
const ConsolidationDashboard = lazy(() => import("./pages/consolidation"));
const GroupList = lazy(() => import("./pages/consolidation/groups/GroupList"));
const GroupDetail = lazy(() => import("./pages/consolidation/groups/GroupDetail"));
const TransactionList = lazy(() => import("./pages/consolidation/intercompany/TransactionList"));
const EntryList = lazy(() => import("./pages/consolidation/entries/EntryList"));

// IFRS 16 Module Pages
const IFRS16Layout = lazy(() => import("./pages/ifrs16/IFRS16Layout"));
const IFRS16Dashboard = lazy(() => import("./pages/ifrs16"));
const LeaseList = lazy(() => import("./pages/ifrs16/leases/LeaseList"));
const LeaseDetail = lazy(() => import("./pages/ifrs16/leases/LeaseDetail"));
const RightOfUseAssetList = lazy(() => import("./pages/ifrs16/assets/RightOfUseAssetList"));
const PaymentScheduleList = lazy(() => import("./pages/ifrs16/payments/PaymentScheduleList"));

// IFRS 15 Module Pages
const IFRS15Layout = lazy(() => import("./pages/ifrs15/IFRS15Layout"));
const IFRS15Dashboard = lazy(() => import("./pages/ifrs15"));
const ObligationList = lazy(() => import("./pages/ifrs15/obligations/ObligationList"));
const ContractAssetList = lazy(() => import("./pages/ifrs15/contracts/ContractAssetList"));
const ContractLiabilityList = lazy(() => import("./pages/ifrs15/contracts/ContractLiabilityList"));
const RecognitionScheduleList = lazy(() => import("./pages/ifrs15/schedules/RecognitionScheduleList"));
const ContractCostList = lazy(() => import("./pages/ifrs15/costs/ContractCostList"));

// EDI Pages
const EdiDashboardPage = lazy(() => import("./pages/edi"));
const EdiPartnerList = lazy(() => import("./pages/edi/partners/PartnerList"));
const EdiPartnerCreate = lazy(() => import("./pages/edi/partners/PartnerCreate"));
const EdiDocumentTypeList = lazy(() => import("./pages/edi/documents/DocumentTypeList"));
const EdiMappingList = lazy(() => import("./pages/edi/documents/MappingList"));
const EdiMappingCreate = lazy(() => import("./pages/edi/documents/MappingCreate"));
const EdiOutboundList = lazy(() => import("./pages/edi/transactions/OutboundList"));
const EdiInboundList = lazy(() => import("./pages/edi/transactions/InboundList"));
const EdiTransactionDetail = lazy(() => import("./pages/edi/transactions/TransactionDetail"));
const EdiLogViewer = lazy(() => import("./pages/edi/monitor/EdiLogViewer"));

// Webhook Pages
const WebhookDashboardPage = lazy(() => import("./pages/webhooks"));
const WebhookSubscriptionList = lazy(() => import("./pages/webhooks/subscriptions/SubscriptionList"));
const WebhookSubscriptionCreate = lazy(() => import("./pages/webhooks/subscriptions/SubscriptionCreate"));
const WebhookDeliveryLogViewer = lazy(() => import("./pages/webhooks/logs/DeliveryLogViewer"));
const WebhookApiKeyList = lazy(() => import("./pages/webhooks/keys/ApiKeyList"));
const WebhookApiKeyCreate = lazy(() => import("./pages/webhooks/keys/ApiKeyCreate"));

// OLAP Pages
const OlapDashboardPage = lazy(() => import("./pages/olap"));
const OlapCubeList = lazy(() => import("./pages/olap/cubes/CubeList"));
const OlapCubeCreate = lazy(() => import("./pages/olap/cubes/CubeCreate"));
const OlapCubeDesigner = lazy(() => import("./pages/olap/cubes/CubeDesigner"));
const OlapFactTableList = lazy(() => import("./pages/olap/facts/FactTableList"));
const OlapDimensionList = lazy(() => import("./pages/olap/dimensions/DimensionList"));
const OlapCubeQueryBuilder = lazy(() => import("./pages/olap/queries/CubeQueryBuilder"));

// ETL Pages
const EtlDashboardPage = lazy(() => import("./pages/etl"));
const EtlConnectorList = lazy(() => import("./pages/etl/connectors/ConnectorList"));
const EtlConnectorCreate = lazy(() => import("./pages/etl/connectors/ConnectorCreate"));
const EtlJobList = lazy(() => import("./pages/etl/jobs/JobList"));
const EtlJobCreate = lazy(() => import("./pages/etl/jobs/JobCreate"));
const EtlJobDesigner = lazy(() => import("./pages/etl/jobs/JobDesigner"));
const EtlJobDetail = lazy(() => import("./pages/etl/jobs/JobDetail"));
const EtlTransformationList = lazy(() => import("./pages/etl/transformations/TransformationList"));
const EtlTransformationCreate = lazy(() => import("./pages/etl/transformations/TransformationCreate"));
const EtlQualityRuleList = lazy(() => import("./pages/etl/quality/QualityRuleList"));
const EtlQualityLogViewer = lazy(() => import("./pages/etl/quality/QualityLogViewer"));

// Collaboration Pages
const CollaborationDashboardPage = lazy(() => import("./pages/collaboration"));
const CollaborationSessionList = lazy(() => import("./pages/collaboration/sessions/SessionList"));
const CollaborationSessionCreate = lazy(() => import("./pages/collaboration/sessions/SessionCreate"));
const CollaborationSessionView = lazy(() => import("./pages/collaboration/sessions/SessionView"));
const CollaborationPresenceView = lazy(() => import("./pages/collaboration/presence/PresenceView"));
const CollaborationNotificationCenter = lazy(() => import("./pages/collaboration/notifications/NotificationCenter"));

// Construction Module Pages
const ConstructionLayout = lazy(() => import("./pages/construction/ConstructionLayout"));
const ConstructionDashboard = lazy(() => import("./pages/construction"));
const WBSList = lazy(() => import("./pages/construction/wbs/WBSList"));
const WBSCreate = lazy(() => import("./pages/construction/wbs/WBSCreate"));
const WBSDetail = lazy(() => import("./pages/construction/wbs/WBSDetail"));
const BOQList = lazy(() => import("./pages/construction/boq/BOQList"));
const BOQCreate = lazy(() => import("./pages/construction/boq/BOQCreate"));
const BOQImport = lazy(() => import("./pages/construction/boq/BOQImport"));
const ContractList = lazy(() => import("./pages/construction/contracts/ContractList"));
const ContractCreate = lazy(() => import("./pages/construction/contracts/ContractCreate"));
const ContractDetail = lazy(() => import("./pages/construction/contracts/ContractDetail"));
const VariationList = lazy(() => import("./pages/construction/variations/VariationList"));
const VariationCreate = lazy(() => import("./pages/construction/variations/VariationCreate"));
const AdvancePaymentList = lazy(() => import("./pages/construction/advancePayments/AdvancePaymentList"));
const AdvancePaymentCreate = lazy(() => import("./pages/construction/advancePayments/AdvancePaymentCreate"));
const CVRList = lazy(() => import("./pages/construction/cvr/CVRList"));
const CVRCreate = lazy(() => import("./pages/construction/cvr/CVRCreate"));
const DecennialList = lazy(() => import("./pages/construction/decennial/DecennialList"));
const DailyReportList = lazy(() => import("./pages/construction/dailyReports/DailyReportList"));
const DailyReportCreate = lazy(() => import("./pages/construction/dailyReports/DailyReportCreate"));
const SubcontractorPaymentList = lazy(() => import("./pages/construction/subcontractorPayments/SubcontractorPaymentList"));
const SubcontractorManagement = lazy(() => import("./pages/construction/subcontractors/SubcontractorManagement"));
const SBCComplianceList = lazy(() => import("./pages/construction/compliance/SBCComplianceList"));
const SCAClassificationList = lazy(() => import("./pages/construction/compliance/SCAClassificationList"));
const GTPLComplianceList = lazy(() => import("./pages/construction/compliance/GTPLComplianceList"));
const HSECommitteeList = lazy(() => import("./pages/construction/hse/HSECommitteeList"));
const HeatStressList = lazy(() => import("./pages/construction/hse/HeatStressList"));
const SafetyTrainingList = lazy(() => import("./pages/construction/hse/SafetyTrainingList"));
const PPEIssueList = lazy(() => import("./pages/construction/hse/PPEIssueList"));
const EngineeringSaudizationList = lazy(() => import("./pages/construction/saudization/EngineeringSaudizationList"));
const EquipmentScheduleList = lazy(() => import("./pages/construction/equipment/EquipmentScheduleList"));
const MaterialRequirementList = lazy(() => import("./pages/construction/materials/MaterialRequirementList"));

// Vertical pages
const HealthcarePatients = lazy(() => import("./pages/verticals/healthcare/Patients"));
const HealthcareAppointments = lazy(() => import("./pages/verticals/healthcare/Appointments"));
const HealthcareDoctorRoster = lazy(() => import("./pages/verticals/healthcare/DoctorRoster"));
const HealthcareInsuranceClaims = lazy(() => import("./pages/verticals/healthcare/InsuranceClaims"));
const EducationStudents = lazy(() => import("./pages/verticals/education/Students"));
const EducationAdmissions = lazy(() => import("./pages/verticals/education/Admissions"));
const EducationFeeInvoicing = lazy(() => import("./pages/verticals/education/FeeInvoicing"));
const EducationClassSchedule = lazy(() => import("./pages/verticals/education/ClassSchedule"));
const EducationReportCards = lazy(() => import("./pages/verticals/education/ReportCards"));
const HotelRooms = lazy(() => import("./pages/verticals/hotel/Rooms"));
const HotelBookings = lazy(() => import("./pages/verticals/hotel/Bookings"));
const HotelCalendar = lazy(() => import("./pages/verticals/hotel/Calendar"));
const HotelHousekeeping = lazy(() => import("./pages/verticals/hotel/Housekeeping"));
const HotelFolioBilling = lazy(() => import("./pages/verticals/hotel/FolioBilling"));
const ConstructionProjects = lazy(() => import("./pages/verticals/construction/Projects"));
const ConstructionSubcontractors = lazy(() => import("./pages/verticals/construction/Subcontractors"));
const ConstructionEquipment = lazy(() => import("./pages/verticals/construction/Equipment"));
const ConstructionProgressBilling = lazy(() => import("./pages/verticals/construction/ProgressBilling"));
const TransportFleet = lazy(() => import("./pages/verticals/transport/Fleet"));
const TransportRoutes = lazy(() => import("./pages/verticals/transport/Routes"));
const TransportDrivers = lazy(() => import("./pages/verticals/transport/Drivers"));
const TransportMaintenance = lazy(() => import("./pages/verticals/transport/Maintenance"));
const TransportShipments = lazy(() => import("./pages/verticals/transport/Shipments"));
const RealEstateProperties = lazy(() => import("./pages/verticals/realestate/Properties"));
const RealEstateLeases = lazy(() => import("./pages/verticals/realestate/Leases"));
const RealEstateRentInvoicing = lazy(() => import("./pages/verticals/realestate/RentInvoicing"));
const RealEstateMaintenance = lazy(() => import("./pages/verticals/realestate/Maintenance"));
const RealEstateCommissions = lazy(() => import("./pages/verticals/realestate/Commissions"));
const TravelBookings = lazy(() => import("./pages/verticals/travel/Bookings"));
const TravelSuppliers = lazy(() => import("./pages/verticals/travel/Suppliers"));
const TravelItineraries = lazy(() => import("./pages/verticals/travel/Itineraries"));
const TravelReconciliation = lazy(() => import("./pages/verticals/travel/Reconciliation"));
const AviationFlights = lazy(() => import("./pages/verticals/aviation/Flights"));
const AviationCrew = lazy(() => import("./pages/verticals/aviation/Crew"));
const AviationMaintenance = lazy(() => import("./pages/verticals/aviation/Maintenance"));
const AviationParts = lazy(() => import("./pages/verticals/aviation/Parts"));

// MRP II Pages
const MrpPage = lazy(() => import("./pages/mrp"));
const MpsList = lazy(() => import("./pages/mrp/mps/MpsList"));
const MpsCreate = lazy(() => import("./pages/mrp/mps/MpsCreate"));
const CapacityList = lazy(() => import("./pages/mrp/capacity/CapacityList"));
const ResourceCreate = lazy(() => import("./pages/mrp/capacity/ResourceCreate"));
const LoadChart = lazy(() => import("./pages/mrp/capacity/LoadChart"));
const MrpRunList = lazy(() => import("./pages/mrp/mrp/MrpRunList"));
const MrpRunDetail = lazy(() => import("./pages/mrp/mrp/MrpRunDetail"));
const MrpResults = lazy(() => import("./pages/mrp/mrp/MrpResults"));
const PeggingView = lazy(() => import("./pages/mrp/pegging/PeggingView"));

// WMS Pages
const WmsPage = lazy(() => import("./pages/wms"));
const ZoneList = lazy(() => import("./pages/wms/zones/ZoneList"));
const ZoneCreate = lazy(() => import("./pages/wms/zones/ZoneCreate"));
const LocationList = lazy(() => import("./pages/wms/locations/LocationList"));
const LocationCreate = lazy(() => import("./pages/wms/locations/LocationCreate"));
const PutawayTaskList = lazy(() => import("./pages/wms/putaway/PutawayTaskList"));
const PutawayExecute = lazy(() => import("./pages/wms/putaway/PutawayExecute"));
const PickingTaskList = lazy(() => import("./pages/wms/picking/PickingTaskList"));
const WavePickingView = lazy(() => import("./pages/wms/picking/WavePickingView"));
const PickingExecute = lazy(() => import("./pages/wms/picking/PickingExecute"));
const CycleScheduleList = lazy(() => import("./pages/wms/cycleCount/ScheduleList"));
const CountExecute = lazy(() => import("./pages/wms/cycleCount/CountExecute"));
const VarianceReport = lazy(() => import("./pages/wms/cycleCount/VarianceReport"));
const TaskBoard = lazy(() => import("./pages/wms/tasks/TaskBoard"));

// SCM Pages
const ScmPage = lazy(() => import("./pages/scm"));
const EvaluationList = lazy(() => import("./pages/scm/suppliers/EvaluationList"));
const ScorecardView = lazy(() => import("./pages/scm/suppliers/ScorecardView"));
const ScmContractList = lazy(() => import("./pages/scm/suppliers/ContractList"));
const ScmContractCreate = lazy(() => import("./pages/scm/suppliers/ContractCreate"));
const RfqList = lazy(() => import("./pages/scm/rfq/RfqList"));
const RfqCreate = lazy(() => import("./pages/scm/rfq/RfqCreate"));
const RfqDetail = lazy(() => import("./pages/scm/rfq/RfqDetail"));
const BidComparisonView = lazy(() => import("./pages/scm/bids/BidComparisonView"));
const SupplierPortalConfig = lazy(() => import("./pages/scm/portal/SupplierPortalConfig"));

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

      {/* ERP shortcut - /erp redirects to /app */}
      <Route path="/erp" element={<ErpRedirect />} />
      <Route path="/erp/*" element={<ErpRedirect />} />

      {/* Admin shortcut - /admin redirects to /app/admin */}
      <Route path="/admin" element={<AdminRedirect />} />
      <Route path="/admin/*" element={<AdminRedirect />} />

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
      <Route path="/app/inventory/adjustments" element={<LayoutWrapper><StockAdjustmentsPage /></LayoutWrapper>} />
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
      <Route path="/app/purchase/requisitions" element={<LayoutWrapper><PurchaseRequisitionsPage /></LayoutWrapper>} />
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
      <Route path="/app/hrm/saudi-payroll" element={<LayoutWrapper><SaudiPayroll /></LayoutWrapper>} />
      <Route path="/app/hrm/gosi" element={<LayoutWrapper><GOSIPage /></LayoutWrapper>} />
      <Route path="/app/hrm/wps" element={<LayoutWrapper><WPSPage /></LayoutWrapper>} />
      <Route path="/app/hrm/eosb" element={<LayoutWrapper><EOSBPage /></LayoutWrapper>} />
      <Route path="/app/hrm/saudi-compliance" element={<LayoutWrapper><SaudiCompliancePage /></LayoutWrapper>} />
      <Route path="/app/hrm/biometric-setup" element={<LayoutWrapper><BiometricSetupPage /></LayoutWrapper>} />

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
      <Route path="/app/reports/financial" element={<LayoutWrapper><FinancialStatements /></LayoutWrapper>} />
      <Route path="/app/reports/zatca-dashboard" element={<LayoutWrapper><ZatcaDashboard /></LayoutWrapper>} />
      <Route path="/app/settings" element={<LayoutWrapper><SettingsPage /></LayoutWrapper>} />
      <Route path="/app/settings/company-profile" element={<LayoutWrapper><CompanyProfilePage /></LayoutWrapper>} />
      <Route path="/app/settings/company-legal-information" element={<LayoutWrapper><CompanyLegalInformationPage /></LayoutWrapper>} />
      <Route path="/app/settings/zatca-integration" element={<LayoutWrapper><ZatcaIntegrationPage /></LayoutWrapper>} />
      <Route path="/app/settings/zatca-phase2" element={<LayoutWrapper><ZatcaPhase2SetupPage /></LayoutWrapper>} />

      {/* Branch Management */}
      <Route path="/app/branches" element={<LayoutWrapper><BranchManagementPage /></LayoutWrapper>} />

      {/* Admin Pages */}
      <Route path="/app/admin/website" element={<LayoutWrapper><WebsiteAdminPage /></LayoutWrapper>} />
      <Route path="/app/admin/master-control" element={<LayoutWrapper><MasterControlPage /></LayoutWrapper>} />
      <Route path="/app/admin/super-dashboard" element={<LayoutWrapper><SuperAdminDashboard /></LayoutWrapper>} />
      <Route path="/app/admin/super-plans" element={<LayoutWrapper><SuperAdminPlans /></LayoutWrapper>} />
      <Route path="/app/admin/super-companies" element={<LayoutWrapper><SuperAdminCompanies /></LayoutWrapper>} />
      <Route path="/app/admin/super-smtp" element={<LayoutWrapper><SuperAdminSmtp /></LayoutWrapper>} />
      <Route path="/app/admin/super-email-templates" element={<LayoutWrapper><SuperAdminEmailTemplates /></LayoutWrapper>} />
      <Route path="/app/admin/impersonate" element={<LayoutWrapper><Impersonate /></LayoutWrapper>} />
      <Route path="/app/admin/super-resellers" element={<LayoutWrapper><SuperResellersPage /></LayoutWrapper>} />
      <Route path="/app/admin/reseller-keys" element={<LayoutWrapper><ResellerKeysPage /></LayoutWrapper>} />
      <Route path="/app/admin/license-approval" element={<LayoutWrapper><LicenseApprovalPage /></LayoutWrapper>} />
      <Route path="/app/admin/invoice-settings" element={<LayoutWrapper><InvoiceSettingsPage /></LayoutWrapper>} />
      <Route path="/app/admin/license-console" element={<LayoutWrapper><LicenseConsolePage /></LayoutWrapper>} />

      {/* New Modules */}
      <Route path="/app/pos" element={<LayoutWrapper><POSDashboard /></LayoutWrapper>} />
      <Route path="/app/pos/retail" element={<POSPage />} />
      <Route path="/app/pos/restaurant" element={<LayoutWrapper><POSRestaurantPage /></LayoutWrapper>} />
      <Route path="/app/pos/pharmacy" element={<LayoutWrapper><POSPharmacyPage /></LayoutWrapper>} />
      <Route path="/app/pos/wholesale" element={<LayoutWrapper><POSWholesalePage /></LayoutWrapper>} />
      <Route path="/app/pos/shift-management" element={<LayoutWrapper><POSShiftManagementPage /></LayoutWrapper>} />
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

      {/* AI Routes */}
      <Route path="/app/ai/reports" element={<LayoutWrapper><AIReportsPage /></LayoutWrapper>} />
      <Route path="/app/ai/forecasting" element={<LayoutWrapper><AIForecastingPage /></LayoutWrapper>} />
      <Route path="/app/ai/chatbot" element={<LayoutWrapper><AIChatbotPage /></LayoutWrapper>} />
      <Route path="/app/ai/automation" element={<LayoutWrapper><AIAutomationPage /></LayoutWrapper>} />
      <Route path="/app/ai/voice" element={<LayoutWrapper><AIVoicePage /></LayoutWrapper>} />

      {/* BI Routes */}
      <Route path="/app/bi/dashboards" element={<LayoutWrapper><DashboardBuilderPage /></LayoutWrapper>} />
      <Route path="/app/bi/reports" element={<LayoutWrapper><ReportBuilderPage /></LayoutWrapper>} />

      {/* Document Routes */}
      <Route path="/app/documents" element={<LayoutWrapper><DocumentRepositoryPage /></LayoutWrapper>} />
      <Route path="/app/documents/upload" element={<LayoutWrapper><DocumentUploadPage /></LayoutWrapper>} />
      <Route path="/app/documents/signatures" element={<LayoutWrapper><SignatureRequestPage /></LayoutWrapper>} />
      <Route path="/app/documents/sign/:id" element={<LayoutWrapper><SignaturePadPage /></LayoutWrapper>} />

      {/* Notification Routes */}
      <Route path="/app/notifications/send" element={<LayoutWrapper><SendNotificationPage /></LayoutWrapper>} />
      <Route path="/app/settings/notification-channels" element={<LayoutWrapper><NotificationChannelsPage /></LayoutWrapper>} />
      <Route path="/app/settings/notification-templates" element={<LayoutWrapper><NotificationTemplatesPage /></LayoutWrapper>} />

      {/* IoT Routes */}
      <Route path="/app/iot" element={<LayoutWrapper><IoTDashboardPage /></LayoutWrapper>} />
      <Route path="/app/iot/devices" element={<LayoutWrapper><IoTDevicesPage /></LayoutWrapper>} />
      <Route path="/app/iot/alerts" element={<LayoutWrapper><IoTAlertsPage /></LayoutWrapper>} />

      {/* Workflow Routes */}
      <Route path="/app/admin/workflows" element={<LayoutWrapper><WorkflowListPage /></LayoutWrapper>} />
      <Route path="/app/admin/workflows/editor" element={<LayoutWrapper><WorkflowEditorPage /></LayoutWrapper>} />
      <Route path="/app/admin/workflows/editor/:id" element={<LayoutWrapper><WorkflowEditorPage /></LayoutWrapper>} />
      <Route path="/app/admin/workflows/logs/:id" element={<LayoutWrapper><WorkflowLogsPage /></LayoutWrapper>} />
      <Route path="/app/admin/workflows/builder" element={<LayoutWrapper><WorkflowBuilderPage /></LayoutWrapper>} />

      {/* Plugin Routes */}
      <Route path="/app/admin/plugins" element={<LayoutWrapper><PluginMarketplacePage /></LayoutWrapper>} />
      <Route path="/app/admin/plugins/installed" element={<LayoutWrapper><PluginManagerPage /></LayoutWrapper>} />

      {/* Compliance Routes */}
      <Route path="/app/admin/compliance" element={<LayoutWrapper><SecurityDashboardPage /></LayoutWrapper>} />
      <Route path="/app/admin/compliance/data-protection" element={<LayoutWrapper><DataProtectionPage /></LayoutWrapper>} />
      <Route path="/app/admin/compliance/audit" element={<LayoutWrapper><AuditExportPage /></LayoutWrapper>} />
      <Route path="/app/admin/compliance/security" element={<LayoutWrapper><SecurityDashboardPage /></LayoutWrapper>} />

      {/* Mobile Routes */}
      <Route path="/app/mobile" element={<LayoutWrapper><MobileDashboardPage /></LayoutWrapper>} />
      <Route path="/app/mobile/approvals" element={<LayoutWrapper><MobileApprovalsPage /></LayoutWrapper>} />
      <Route path="/app/mobile/attendance" element={<LayoutWrapper><MobileAttendancePage /></LayoutWrapper>} />
      <Route path="/app/mobile/sales" element={<LayoutWrapper><MobileQuickSalesPage /></LayoutWrapper>} />

      {/* Portal Routes */}
      <Route path="/portal" element={<PortalLogin />} />
      <Route path="/portal/customer" element={<PortalLayout><PortalCustomerDashboard /></PortalLayout>} />
      <Route path="/portal/customer/invoices" element={<PortalLayout><PortalCustomerInvoices /></PortalLayout>} />
      <Route path="/portal/customer/payments" element={<PortalLayout><PortalCustomerPayments /></PortalLayout>} />
      <Route path="/portal/customer/orders" element={<PortalLayout><PortalCustomerOrders /></PortalLayout>} />
      <Route path="/portal/customer/tickets" element={<PortalLayout><PortalCustomerTickets /></PortalLayout>} />
      <Route path="/portal/customer/profile" element={<PortalLayout><PortalCustomerProfile /></PortalLayout>} />
      <Route path="/portal/vendor" element={<PortalLayout><PortalVendorDashboard /></PortalLayout>} />
      <Route path="/portal/vendor/pos" element={<PortalLayout><PortalVendorPOs /></PortalLayout>} />
      <Route path="/portal/vendor/invoices" element={<PortalLayout><PortalVendorInvoices /></PortalLayout>} />
      <Route path="/portal/vendor/payments" element={<PortalLayout><PortalVendorPayments /></PortalLayout>} />
      <Route path="/portal/vendor/profile" element={<PortalLayout><PortalVendorProfile /></PortalLayout>} />
      <Route path="/portal/employee" element={<PortalLayout><PortalEmployeeDashboard /></PortalLayout>} />
      <Route path="/portal/employee/payslips" element={<PortalLayout><PortalEmployeePayslips /></PortalLayout>} />
      <Route path="/portal/employee/leave" element={<PortalLayout><PortalEmployeeLeave /></PortalLayout>} />
      <Route path="/portal/employee/attendance" element={<PortalLayout><PortalEmployeeAttendance /></PortalLayout>} />
      <Route path="/portal/employee/documents" element={<PortalLayout><PortalEmployeeDocuments /></PortalLayout>} />
      <Route path="/portal/employee/profile" element={<PortalLayout><PortalEmployeeProfile /></PortalLayout>} />

      {/* Healthcare Verticals */}
      <Route path="/app/verticals/healthcare" element={<LayoutWrapper><HealthcarePatients /></LayoutWrapper>} />
      <Route path="/app/verticals/healthcare/patients" element={<LayoutWrapper><HealthcarePatients /></LayoutWrapper>} />
      <Route path="/app/verticals/healthcare/appointments" element={<LayoutWrapper><HealthcareAppointments /></LayoutWrapper>} />
      <Route path="/app/verticals/healthcare/roster" element={<LayoutWrapper><HealthcareDoctorRoster /></LayoutWrapper>} />
      <Route path="/app/verticals/healthcare/insurance-claims" element={<LayoutWrapper><HealthcareInsuranceClaims /></LayoutWrapper>} />

      {/* Education Verticals */}
      <Route path="/app/verticals/education" element={<LayoutWrapper><EducationStudents /></LayoutWrapper>} />
      <Route path="/app/verticals/education/students" element={<LayoutWrapper><EducationStudents /></LayoutWrapper>} />
      <Route path="/app/verticals/education/admissions" element={<LayoutWrapper><EducationAdmissions /></LayoutWrapper>} />
      <Route path="/app/verticals/education/fee-invoicing" element={<LayoutWrapper><EducationFeeInvoicing /></LayoutWrapper>} />
      <Route path="/app/verticals/education/schedule" element={<LayoutWrapper><EducationClassSchedule /></LayoutWrapper>} />
      <Route path="/app/verticals/education/report-cards" element={<LayoutWrapper><EducationReportCards /></LayoutWrapper>} />

      {/* Hotel Verticals */}
      <Route path="/app/verticals/hotel" element={<LayoutWrapper><HotelRooms /></LayoutWrapper>} />
      <Route path="/app/verticals/hotel/rooms" element={<LayoutWrapper><HotelRooms /></LayoutWrapper>} />
      <Route path="/app/verticals/hotel/bookings" element={<LayoutWrapper><HotelBookings /></LayoutWrapper>} />
      <Route path="/app/verticals/hotel/calendar" element={<LayoutWrapper><HotelCalendar /></LayoutWrapper>} />
      <Route path="/app/verticals/hotel/housekeeping" element={<LayoutWrapper><HotelHousekeeping /></LayoutWrapper>} />
      <Route path="/app/verticals/hotel/folio-billing" element={<LayoutWrapper><HotelFolioBilling /></LayoutWrapper>} />

      {/* Construction Verticals */}
      <Route path="/app/verticals/construction" element={<LayoutWrapper><ConstructionProjects /></LayoutWrapper>} />
      <Route path="/app/verticals/construction/projects" element={<LayoutWrapper><ConstructionProjects /></LayoutWrapper>} />
      <Route path="/app/verticals/construction/subcontractors" element={<LayoutWrapper><ConstructionSubcontractors /></LayoutWrapper>} />
      <Route path="/app/verticals/construction/equipment" element={<LayoutWrapper><ConstructionEquipment /></LayoutWrapper>} />
      <Route path="/app/verticals/construction/progress-billing" element={<LayoutWrapper><ConstructionProgressBilling /></LayoutWrapper>} />

      {/* Transport Verticals */}
      <Route path="/app/verticals/transport" element={<LayoutWrapper><TransportFleet /></LayoutWrapper>} />
      <Route path="/app/verticals/transport/fleet" element={<LayoutWrapper><TransportFleet /></LayoutWrapper>} />
      <Route path="/app/verticals/transport/routes" element={<LayoutWrapper><TransportRoutes /></LayoutWrapper>} />
      <Route path="/app/verticals/transport/drivers" element={<LayoutWrapper><TransportDrivers /></LayoutWrapper>} />
      <Route path="/app/verticals/transport/maintenance" element={<LayoutWrapper><TransportMaintenance /></LayoutWrapper>} />
      <Route path="/app/verticals/transport/shipments" element={<LayoutWrapper><TransportShipments /></LayoutWrapper>} />

      {/* Real Estate Verticals */}
      <Route path="/app/verticals/real-estate" element={<LayoutWrapper><RealEstateProperties /></LayoutWrapper>} />
      <Route path="/app/verticals/real-estate/properties" element={<LayoutWrapper><RealEstateProperties /></LayoutWrapper>} />
      <Route path="/app/verticals/real-estate/leases" element={<LayoutWrapper><RealEstateLeases /></LayoutWrapper>} />
      <Route path="/app/verticals/real-estate/rent-invoicing" element={<LayoutWrapper><RealEstateRentInvoicing /></LayoutWrapper>} />
      <Route path="/app/verticals/real-estate/maintenance" element={<LayoutWrapper><RealEstateMaintenance /></LayoutWrapper>} />
      <Route path="/app/verticals/real-estate/commissions" element={<LayoutWrapper><RealEstateCommissions /></LayoutWrapper>} />

      {/* Travel Verticals */}
      <Route path="/app/verticals/travel" element={<LayoutWrapper><TravelBookings /></LayoutWrapper>} />
      <Route path="/app/verticals/travel/bookings" element={<LayoutWrapper><TravelBookings /></LayoutWrapper>} />
      <Route path="/app/verticals/travel/suppliers" element={<LayoutWrapper><TravelSuppliers /></LayoutWrapper>} />
      <Route path="/app/verticals/travel/itineraries" element={<LayoutWrapper><TravelItineraries /></LayoutWrapper>} />
      <Route path="/app/verticals/travel/reconciliation" element={<LayoutWrapper><TravelReconciliation /></LayoutWrapper>} />

      {/* Aviation Verticals */}
      <Route path="/app/verticals/aviation" element={<LayoutWrapper><AviationFlights /></LayoutWrapper>} />
      <Route path="/app/verticals/aviation/flights" element={<LayoutWrapper><AviationFlights /></LayoutWrapper>} />
      <Route path="/app/verticals/aviation/crew" element={<LayoutWrapper><AviationCrew /></LayoutWrapper>} />
      <Route path="/app/verticals/aviation/maintenance" element={<LayoutWrapper><AviationMaintenance /></LayoutWrapper>} />
      <Route path="/app/verticals/aviation/parts" element={<LayoutWrapper><AviationParts /></LayoutWrapper>} />

      {/* Consolidation Module Routes */}
      <Route path="/app/consolidation" element={<ConsolidationLayout />}>
        <Route index element={<ConsolidationDashboard />} />
        <Route path="groups" element={<GroupList />} />
        <Route path="groups/new" element={<GroupList />} />
        <Route path="groups/:id" element={<GroupDetail />} />
        <Route path="intercompany" element={<TransactionList />} />
        <Route path="entries" element={<EntryList />} />
        <Route path="eliminations" element={<EntryList />} />
      </Route>

      {/* IFRS 16 Module Routes */}
      <Route path="/app/ifrs16" element={<IFRS16Layout />}>
        <Route index element={<IFRS16Dashboard />} />
        <Route path="leases" element={<LeaseList />} />
        <Route path="leases/new" element={<LeaseList />} />
        <Route path="leases/:id" element={<LeaseDetail />} />
        <Route path="assets" element={<RightOfUseAssetList />} />
        <Route path="payments" element={<PaymentScheduleList />} />
      </Route>

      {/* IFRS 15 Module Routes */}
      <Route path="/app/ifrs15" element={<IFRS15Layout />}>
        <Route index element={<IFRS15Dashboard />} />
        <Route path="obligations" element={<ObligationList />} />
        <Route path="obligations/new" element={<ObligationList />} />
        <Route path="contracts/assets" element={<ContractAssetList />} />
        <Route path="contracts/liabilities" element={<ContractLiabilityList />} />
        <Route path="schedules" element={<RecognitionScheduleList />} />
        <Route path="costs" element={<ContractCostList />} />
      </Route>

      {/* Construction Module Routes */}
      <Route path="/app/construction" element={<ConstructionLayout />}>
        <Route index element={<ConstructionDashboard />} />
        <Route path="wbs" element={<WBSList />} />
        <Route path="wbs/new" element={<WBSCreate />} />
        <Route path="wbs/:id" element={<WBSDetail />} />
        <Route path="boq" element={<BOQList />} />
        <Route path="boq/new" element={<BOQCreate />} />
        <Route path="boq/import" element={<BOQImport />} />
        <Route path="contracts" element={<ContractList />} />
        <Route path="contracts/new" element={<ContractCreate />} />
        <Route path="contracts/:id" element={<ContractDetail />} />
        <Route path="variations" element={<VariationList />} />
        <Route path="variations/new" element={<VariationCreate />} />
        <Route path="advance-payments" element={<AdvancePaymentList />} />
        <Route path="advance-payments/new" element={<AdvancePaymentCreate />} />
        <Route path="cvr" element={<CVRList />} />
        <Route path="cvr/new" element={<CVRCreate />} />
        <Route path="decennial" element={<DecennialList />} />
        <Route path="daily-reports" element={<DailyReportList />} />
        <Route path="daily-reports/new" element={<DailyReportCreate />} />
        <Route path="sub-payments" element={<SubcontractorPaymentList />} />
        <Route path="subcontractors" element={<SubcontractorManagement />} />
        <Route path="compliance/sbc" element={<SBCComplianceList />} />
        <Route path="compliance/sca" element={<SCAClassificationList />} />
        <Route path="compliance/gtpl" element={<GTPLComplianceList />} />
        <Route path="hse" element={<HSECommitteeList />} />
        <Route path="hse/heat-stress" element={<HeatStressList />} />
        <Route path="hse/safety-training" element={<SafetyTrainingList />} />
        <Route path="hse/ppe" element={<PPEIssueList />} />
        <Route path="saudization" element={<EngineeringSaudizationList />} />
        <Route path="equipment-schedule" element={<EquipmentScheduleList />} />
        <Route path="materials" element={<MaterialRequirementList />} />
      </Route>

      {/* EDI Routes */}
      <Route path="/app/edi" element={<LayoutWrapper><EdiDashboardPage /></LayoutWrapper>} />
      <Route path="/app/edi/partners" element={<LayoutWrapper><EdiPartnerList /></LayoutWrapper>} />
      <Route path="/app/edi/partners/new" element={<LayoutWrapper><EdiPartnerCreate /></LayoutWrapper>} />
      <Route path="/app/edi/documents" element={<LayoutWrapper><EdiDocumentTypeList /></LayoutWrapper>} />
      <Route path="/app/edi/documents/mappings" element={<LayoutWrapper><EdiMappingList /></LayoutWrapper>} />
      <Route path="/app/edi/documents/mappings/new" element={<LayoutWrapper><EdiMappingCreate /></LayoutWrapper>} />
      <Route path="/app/edi/transactions" element={<LayoutWrapper><EdiOutboundList /></LayoutWrapper>} />
      <Route path="/app/edi/transactions/inbound" element={<LayoutWrapper><EdiInboundList /></LayoutWrapper>} />
      <Route path="/app/edi/transactions/:id" element={<LayoutWrapper><EdiTransactionDetail /></LayoutWrapper>} />
      <Route path="/app/edi/monitor" element={<LayoutWrapper><EdiLogViewer /></LayoutWrapper>} />

      {/* Webhook Routes */}
      <Route path="/app/webhooks" element={<LayoutWrapper><WebhookDashboardPage /></LayoutWrapper>} />
      <Route path="/app/webhooks/subscriptions" element={<LayoutWrapper><WebhookSubscriptionList /></LayoutWrapper>} />
      <Route path="/app/webhooks/subscriptions/new" element={<LayoutWrapper><WebhookSubscriptionCreate /></LayoutWrapper>} />
      <Route path="/app/webhooks/logs" element={<LayoutWrapper><WebhookDeliveryLogViewer /></LayoutWrapper>} />
      <Route path="/app/webhooks/keys" element={<LayoutWrapper><WebhookApiKeyList /></LayoutWrapper>} />
      <Route path="/app/webhooks/keys/new" element={<LayoutWrapper><WebhookApiKeyCreate /></LayoutWrapper>} />

      {/* OLAP Routes */}
      <Route path="/app/olap" element={<LayoutWrapper><OlapDashboardPage /></LayoutWrapper>} />
      <Route path="/app/olap/cubes" element={<LayoutWrapper><OlapCubeList /></LayoutWrapper>} />
      <Route path="/app/olap/cubes/new" element={<LayoutWrapper><OlapCubeCreate /></LayoutWrapper>} />
      <Route path="/app/olap/cubes/:id" element={<LayoutWrapper><OlapCubeDesigner /></LayoutWrapper>} />
      <Route path="/app/olap/facts" element={<LayoutWrapper><OlapFactTableList /></LayoutWrapper>} />
      <Route path="/app/olap/dimensions" element={<LayoutWrapper><OlapDimensionList /></LayoutWrapper>} />
      <Route path="/app/olap/queries" element={<LayoutWrapper><OlapCubeQueryBuilder /></LayoutWrapper>} />

      {/* ETL Routes */}
      <Route path="/app/etl" element={<LayoutWrapper><EtlDashboardPage /></LayoutWrapper>} />
      <Route path="/app/etl/connectors" element={<LayoutWrapper><EtlConnectorList /></LayoutWrapper>} />
      <Route path="/app/etl/connectors/new" element={<LayoutWrapper><EtlConnectorCreate /></LayoutWrapper>} />
      <Route path="/app/etl/jobs" element={<LayoutWrapper><EtlJobList /></LayoutWrapper>} />
      <Route path="/app/etl/jobs/new" element={<LayoutWrapper><EtlJobCreate /></LayoutWrapper>} />
      <Route path="/app/etl/jobs/:id" element={<LayoutWrapper><EtlJobDetail /></LayoutWrapper>} />
      <Route path="/app/etl/jobs/:id/design" element={<LayoutWrapper><EtlJobDesigner /></LayoutWrapper>} />
      <Route path="/app/etl/transformations" element={<LayoutWrapper><EtlTransformationList /></LayoutWrapper>} />
      <Route path="/app/etl/transformations/new" element={<LayoutWrapper><EtlTransformationCreate /></LayoutWrapper>} />
      <Route path="/app/etl/quality" element={<LayoutWrapper><EtlQualityRuleList /></LayoutWrapper>} />
      <Route path="/app/etl/quality/logs" element={<LayoutWrapper><EtlQualityLogViewer /></LayoutWrapper>} />

      {/* MRP II Routes */}
      <Route path="/app/mrp" element={<LayoutWrapper><MrpPage /></LayoutWrapper>} />
      <Route path="/app/mrp/mps" element={<LayoutWrapper><MpsList /></LayoutWrapper>} />
      <Route path="/app/mrp/mps/new" element={<LayoutWrapper><MpsCreate /></LayoutWrapper>} />
      <Route path="/app/mrp/capacity" element={<LayoutWrapper><CapacityList /></LayoutWrapper>} />
      <Route path="/app/mrp/capacity/resource/new" element={<LayoutWrapper><ResourceCreate /></LayoutWrapper>} />
      <Route path="/app/mrp/capacity/chart" element={<LayoutWrapper><LoadChart /></LayoutWrapper>} />
      <Route path="/app/mrp/runs" element={<LayoutWrapper><MrpRunList /></LayoutWrapper>} />
      <Route path="/app/mrp/runs/:id" element={<LayoutWrapper><MrpRunDetail /></LayoutWrapper>} />
      <Route path="/app/mrp/results" element={<LayoutWrapper><MrpResults /></LayoutWrapper>} />
      <Route path="/app/mrp/pegging" element={<LayoutWrapper><PeggingView /></LayoutWrapper>} />

      {/* WMS Routes */}
      <Route path="/app/wms" element={<LayoutWrapper><WmsPage /></LayoutWrapper>} />
      <Route path="/app/wms/zones" element={<LayoutWrapper><ZoneList /></LayoutWrapper>} />
      <Route path="/app/wms/zones/new" element={<LayoutWrapper><ZoneCreate /></LayoutWrapper>} />
      <Route path="/app/wms/locations" element={<LayoutWrapper><LocationList /></LayoutWrapper>} />
      <Route path="/app/wms/locations/new" element={<LayoutWrapper><LocationCreate /></LayoutWrapper>} />
      <Route path="/app/wms/putaway" element={<LayoutWrapper><PutawayTaskList /></LayoutWrapper>} />
      <Route path="/app/wms/putaway/execute" element={<LayoutWrapper><PutawayExecute /></LayoutWrapper>} />
      <Route path="/app/wms/picking" element={<LayoutWrapper><PickingTaskList /></LayoutWrapper>} />
      <Route path="/app/wms/picking/wave" element={<LayoutWrapper><WavePickingView /></LayoutWrapper>} />
      <Route path="/app/wms/picking/execute" element={<LayoutWrapper><PickingExecute /></LayoutWrapper>} />
      <Route path="/app/wms/cycle-count" element={<LayoutWrapper><CycleScheduleList /></LayoutWrapper>} />
      <Route path="/app/wms/cycle-count/execute" element={<LayoutWrapper><CountExecute /></LayoutWrapper>} />
      <Route path="/app/wms/cycle-count/variance" element={<LayoutWrapper><VarianceReport /></LayoutWrapper>} />
      <Route path="/app/wms/tasks" element={<LayoutWrapper><TaskBoard /></LayoutWrapper>} />

      {/* SCM Routes */}
      <Route path="/app/scm" element={<LayoutWrapper><ScmPage /></LayoutWrapper>} />
      <Route path="/app/scm/suppliers" element={<LayoutWrapper><EvaluationList /></LayoutWrapper>} />
      <Route path="/app/scm/suppliers/scorecard" element={<LayoutWrapper><ScorecardView /></LayoutWrapper>} />
      <Route path="/app/scm/contracts" element={<LayoutWrapper><ScmContractList /></LayoutWrapper>} />
      <Route path="/app/scm/contracts/new" element={<LayoutWrapper><ScmContractCreate /></LayoutWrapper>} />
      <Route path="/app/scm/rfq" element={<LayoutWrapper><RfqList /></LayoutWrapper>} />
      <Route path="/app/scm/rfq/new" element={<LayoutWrapper><RfqCreate /></LayoutWrapper>} />
      <Route path="/app/scm/rfq/:id" element={<LayoutWrapper><RfqDetail /></LayoutWrapper>} />
      <Route path="/app/scm/bids" element={<LayoutWrapper><BidComparisonView /></LayoutWrapper>} />
      <Route path="/app/scm/portal" element={<LayoutWrapper><SupplierPortalConfig /></LayoutWrapper>} />

      {/* Collaboration Routes */}
      <Route path="/app/collaboration" element={<LayoutWrapper><CollaborationDashboardPage /></LayoutWrapper>} />
      <Route path="/app/collaboration/sessions" element={<LayoutWrapper><CollaborationSessionList /></LayoutWrapper>} />
      <Route path="/app/collaboration/sessions/new" element={<LayoutWrapper><CollaborationSessionCreate /></LayoutWrapper>} />
      <Route path="/app/collaboration/sessions/:id" element={<LayoutWrapper><CollaborationSessionView /></LayoutWrapper>} />
      <Route path="/app/collaboration/presence" element={<LayoutWrapper><CollaborationPresenceView /></LayoutWrapper>} />
      <Route path="/app/collaboration/notifications" element={<LayoutWrapper><CollaborationNotificationCenter /></LayoutWrapper>} />

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

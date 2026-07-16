import { authRouter } from "./auth-router";
import { dashboardRouter } from "./dashboardRouter";
import { accountingRouter } from "./accountingRouter";
import { inventoryRouter } from "./inventoryRouter";
import { salesRouter } from "./salesRouter";
import { purchaseRouter } from "./purchaseRouter";
import { crmRouter } from "./crmRouter";
import { hrmRouter } from "./hrmRouter";
import { manufacturingRouter } from "./manufacturingRouter";
import { projectsRouter } from "./projectsRouter";
import { helpdeskRouter } from "./helpdeskRouter";
import { assetsRouter } from "./assetsRouter";
import { settingsRouter } from "./settingsRouter";
import { posRouter } from "./posRouter";
import { posRestaurantRouter } from "./posRestaurantRouter";
import { posPharmacyRouter } from "./posPharmacyRouter";
import { posWholesaleRouter } from "./posWholesaleRouter";
import { posSharedRouter } from "./posSharedRouter";
import { cashboxRouter } from "./cashboxRouter";
import { installmentsRouter } from "./installmentsRouter";
import { reportsRouter } from "./reportsRouter";
import { websiteRouter } from "./websiteRouter";
import { localizationRouter } from "./localizationRouter";
import { taxComplianceRouter } from "./taxComplianceRouter";

import { masterRouter } from "./masterRouter";
import { zatcaRouter } from "./zatcaRouter";
import { saasRouter } from "./saasRouter";
import { registrationRouter } from "./registrationRouter";
import { superAdminRouter } from "./superAdminRouter";
import { meetingRouter } from "./meetingRouter";
import { taskRouter } from "./taskRouter";
import { notificationRouter } from "./notificationRouter";
import { emailRouter } from "./emailRouter";
import { syncRouter } from "./syncRouter";
import { syncEnhancedRouter } from "./syncEnhancedRouter";
import { licenseRouter } from "./licenseRouter";
import { licenseKeyRouter } from "./licenseKeyRouter";
import { licenseAdminRouter } from "./licenseAdminRouter";
import { invoiceThemeRouter } from "./invoiceThemeRouter";
import { documentRouter } from "./documentRouter";
import { notificationEnhancedRouter } from "./notificationEnhancedRouter";
import { iotRouter } from "./iotRouter";
import { workflowRouter } from "./workflowRouter";
import { pluginRouter } from "./pluginRouter";
import { mobileRouter } from "./mobileRouter";
import { dashboardBuilderRouter } from "./dashboardBuilderRouter";
import { reportBuilderRouter } from "./reportBuilderRouter";
import { workflowBuilderRouter } from "./workflowBuilderRouter";
import { gosiRouter } from "./gosiRouter";
import { wpsRouter } from "./wpsRouter";
import { eosbRouter } from "./eosbRouter";
import { biometricRouter } from "./biometricRouter";
import { saudiComplianceRouter } from "./saudiComplianceRouter";
import { portalAuthRouter } from "./portalAuthRouter";
import { portalCustomerRouter } from "./portalCustomerRouter";
import { portalVendorRouter } from "./portalVendorRouter";
import { portalEmployeeRouter } from "./portalEmployeeRouter";
import { healthcareRouter } from "./healthcareRouter";
import { educationRouter } from "./educationRouter";
import { hotelRouter } from "./hotelRouter";
import { constructionRouter } from "./constructionRouter";
import { transportRouter } from "./transportRouter";
import { realEstateRouter } from "./realEstateRouter";
import { travelRouter } from "./travelRouter";
import { aviationRouter } from "./aviationRouter";
import { consolidationRouter } from "./consolidationRouter";
import { ifrs16Router } from "./ifrs16Router";
import { ifrs15Router } from "./ifrs15Router";
import { mrpRouter } from "./mrpRouter";
import { wmsRouter } from "./wmsRouter";
import { scmRouter } from "./scmRouter";
import { ediRouter } from "./ediRouter";
import { webhookRouter } from "./webhookRouter";
import { olapRouter } from "./olapRouter";
import { etlRouter } from "./etlRouter";
import { wsRouter } from "./wsRouter";
import { workshopRouter } from "./workshopRouter";
import { healthcareCompleteRouter } from "./healthcareCompleteRouter";
import { workshopCompleteRouter } from "./workshopCompleteRouter";
import { nphiesRouter } from "./nphiesRouter";
import { chatRouter } from "./chatRouter";
import { createRouter, publicQuery } from "./middleware";

export const appRouter = createRouter({
  ping: publicQuery.query(() => ({ ok: true, ts: Date.now() })),
  auth: authRouter,
  dashboard: dashboardRouter,
  accounting: accountingRouter,
  inventory: inventoryRouter,
  sales: salesRouter,
  purchase: purchaseRouter,
  crm: crmRouter,
  hrm: hrmRouter,
  manufacturing: manufacturingRouter,
  projects: projectsRouter,
  helpdesk: helpdeskRouter,
  assets: assetsRouter,
  settings: settingsRouter,
  pos: posRouter,
  posRestaurant: posRestaurantRouter,
  posPharmacy: posPharmacyRouter,
  posWholesale: posWholesaleRouter,
  posShared: posSharedRouter,
  cashbox: cashboxRouter,
  installments: installmentsRouter,
  reports: reportsRouter,
  website: websiteRouter,
  localization: localizationRouter,
  taxCompliance: taxComplianceRouter,
  master: masterRouter,
  zatca: zatcaRouter,
  saas: saasRouter,
  registration: registrationRouter,
  superAdmin: superAdminRouter,
  meetings: meetingRouter,
  tasks: taskRouter,
  notifications2: notificationRouter,
  emails: emailRouter,
  sync: syncRouter,
  syncEnhanced: syncEnhancedRouter,
  license: licenseRouter,
  licenseKey: licenseKeyRouter,
  licenseAdmin: licenseAdminRouter,
  invoiceTheme: invoiceThemeRouter,
  dashboardBuilder: dashboardBuilderRouter,
  reportBuilder: reportBuilderRouter,
  documents: documentRouter,
  notificationsEnhanced: notificationEnhancedRouter,
  iot: iotRouter,
  workflows: workflowRouter,
  plugins: pluginRouter,
  mobile: mobileRouter,
  gosi: gosiRouter,
  wps: wpsRouter,
  eosb: eosbRouter,
  biometric: biometricRouter,
  saudiCompliance: saudiComplianceRouter,
  portalAuth: portalAuthRouter,
  portalCustomer: portalCustomerRouter,
  portalVendor: portalVendorRouter,
  portalEmployee: portalEmployeeRouter,
  healthcare: healthcareRouter,
  education: educationRouter,
  hotel: hotelRouter,
  construction: constructionRouter,
  transport: transportRouter,
  realEstate: realEstateRouter,
  travel: travelRouter,
  aviation: aviationRouter,
  consolidation: consolidationRouter,
  ifrs16: ifrs16Router,
  ifrs15: ifrs15Router,
  mrp: mrpRouter,
  wms: wmsRouter,
  scm: scmRouter,
  edi: ediRouter,
  webhooks: webhookRouter,
  olap: olapRouter,
  etl: etlRouter,
  ws: wsRouter,
  workshop: workshopRouter,
  nphies: nphiesRouter,
  chat: chatRouter,
});

export type AppRouter = typeof appRouter;

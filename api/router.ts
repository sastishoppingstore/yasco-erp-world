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
import { cashboxRouter } from "./cashboxRouter";
import { installmentsRouter } from "./installmentsRouter";
import { reportsRouter } from "./reportsRouter";
import { websiteRouter } from "./websiteRouter";
import { localizationRouter } from "./localizationRouter";
import { taxComplianceRouter } from "./taxComplianceRouter";
import { aiAssistantRouter } from "./aiAssistantRouter";
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
import { licenseRouter } from "./licenseRouter";
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
  cashbox: cashboxRouter,
  installments: installmentsRouter,
  reports: reportsRouter,
  website: websiteRouter,
  localization: localizationRouter,
  taxCompliance: taxComplianceRouter,
  aiAssistant: aiAssistantRouter,
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
  license: licenseRouter,
});

export type AppRouter = typeof appRouter;

import { z } from "zod";
import { createRouter, authedQuery, superAdminQuery, adminQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { v4 as uuidv4 } from "uuid";
import { pluginRegistry } from "./lib/plugins/pluginRegistry";
import { getHookDescriptions, registerPluginHook } from "./lib/plugins/hooks";

const PLUGIN_INSTALL_TABLE = "plugin_installations";

export const pluginRouter = createRouter({
  // ── Marketplace (plugin store) ──
  getStore: authedQuery.query(async () => {
    return pluginRegistry.getStore();
  }),
  getStoreItem: authedQuery.input(z.object({ name: z.string() })).query(async ({ input }) => {
    return pluginRegistry.getFromStore(input.name);
  }),

  // ── Installation ──
  install: adminQuery.input(z.object({ name: z.string() })).mutation(async ({ input, ctx }) => {
    const manifest = pluginRegistry.getFromStore(input.name);
    if (!manifest) throw new Error(`Plugin '${input.name}' not found in store`);
    const db = getDb();
    const existing = await db.execute(
      `SELECT id FROM ${PLUGIN_INSTALL_TABLE} WHERE tenant_id = ? AND plugin_name = ? LIMIT 1`,
      [ctx.user.tenantId!, input.name],
    ) as any;
    if (existing.length > 0) throw new Error("Plugin already installed");

    const now = new Date().toISOString();
    await db.execute(
      `INSERT INTO ${PLUGIN_INSTALL_TABLE} (tenant_id, plugin_name, version, manifest, is_enabled, config, installed_at)
       VALUES (?, ?, ?, ?, 1, '{}', ?)`,
      [ctx.user.tenantId!, input.name, manifest.version, JSON.stringify(manifest), now],
    );

    pluginRegistry.register(manifest);
    for (const hook of manifest.hooks) {
      registerPluginHook(input.name, hook as any, async (context: any) => {
        return { plugin: input.name, handled: true, context };
      }, 100);
    }

    return { success: true, name: input.name };
  }),
  uninstall: adminQuery.input(z.object({ name: z.string() })).mutation(async ({ input, ctx }) => {
    const db = getDb();
    await db.execute(
      `DELETE FROM ${PLUGIN_INSTALL_TABLE} WHERE tenant_id = ? AND plugin_name = ?`,
      [ctx.user.tenantId!, input.name],
    );
    pluginRegistry.unregister(input.name);
    return { success: true };
  }),
  toggle: adminQuery.input(z.object({ name: z.string(), isEnabled: z.boolean() })).mutation(async ({ input, ctx }) => {
    const db = getDb();
    await db.execute(
      `UPDATE ${PLUGIN_INSTALL_TABLE} SET is_enabled = ? WHERE tenant_id = ? AND plugin_name = ?`,
      [input.isEnabled ? 1 : 0, ctx.user.tenantId!, input.name],
    );
    if (input.isEnabled) {
      const manifest = pluginRegistry.getFromStore(input.name);
      if (manifest) pluginRegistry.register(manifest);
    } else {
      pluginRegistry.unregister(input.name);
    }
    return { success: true };
  }),
  listInstalled: authedQuery.query(async ({ ctx }) => {
    const db = getDb();
    const rows = await db.execute(
      `SELECT * FROM ${PLUGIN_INSTALL_TABLE} WHERE tenant_id = ? ORDER BY installed_at DESC`,
      [ctx.user.tenantId!],
    ) as any;
    return rows.map((r: any) => ({
      id: r.id, tenantId: r.tenant_id, pluginName: r.plugin_name,
      version: r.version,
      manifest: typeof r.manifest === "string" ? JSON.parse(r.manifest) : r.manifest,
      isEnabled: !!r.is_enabled,
      config: typeof r.config === "string" ? JSON.parse(r.config || "{}") : (r.config || {}),
      installedAt: r.installed_at,
    }));
  }),
  updateConfig: adminQuery
    .input(z.object({ name: z.string(), config: z.record(z.string(), z.any()) }))
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      await db.execute(
        `UPDATE ${PLUGIN_INSTALL_TABLE} SET config = ? WHERE tenant_id = ? AND plugin_name = ?`,
        [JSON.stringify(input.config), ctx.user.tenantId!, input.name],
      );
      return { success: true };
    }),

  // ── Hooks ──
  getHookDefinitions: authedQuery.query(() => getHookDescriptions()),
  getHookLogs: adminQuery.input(z.object({ pluginName: z.string().optional(), limit: z.number().default(50) })).query(async ({ input, ctx }) => {
    const db = getDb();
    const rows = await db.execute(
      `SELECT * FROM plugin_hook_logs WHERE tenant_id = ? ${input.pluginName ? "AND plugin_name = ?" : ""} ORDER BY created_at DESC LIMIT ?`,
      input.pluginName ? [ctx.user.tenantId!, input.pluginName, input.limit] : [ctx.user.tenantId!, input.limit],
    ) as any;
    return rows;
  }),
});

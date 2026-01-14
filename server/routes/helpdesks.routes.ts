import type { Express } from "express";
import { storage } from "../storage";
import {
  insertHelpdeskSchema,
  insertSlaStateSchema,
  insertSlaPolicySchema,
  insertEscalationRuleSchema,
  insertEscalationConditionSchema,
  insertInboundEmailConfigSchema,
} from "@shared/schema";

/**
 * Helpdesk Configuration and Management Routes
 *
 * Handles:
 * - Helpdesk CRUD operations
 * - SLA states and policies
 * - Escalation rules and conditions
 * - Inbound email configuration
 */
export function registerHelpdeskRoutes(app: Express) {
  // ============== HELPDESKS ==============

  app.get("/api/helpdesks", async (_req, res) => {
    const helpdesks = await storage.getHelpdesks();
    res.json(helpdesks);
  });

  app.get("/api/helpdesks/by-department/:departmentId", async (req, res) => {
    const helpdesk = await storage.getHelpdeskByDepartment(req.params.departmentId);
    res.json(helpdesk || null);
  });

  app.post("/api/helpdesks", async (req, res) => {
    const result = insertHelpdeskSchema.safeParse(req.body);
    if (!result.success) return res.status(400).json({ error: result.error });

    const existing = await storage.getHelpdeskByDepartment(result.data.departmentId);
    if (existing) {
      return res.json(existing);
    }

    const helpdesk = await storage.createHelpdesk(result.data);
    res.json(helpdesk);
  });

  app.patch("/api/helpdesks/:id", async (req, res) => {
    const result = insertHelpdeskSchema.partial().safeParse(req.body);
    if (!result.success) return res.status(400).json({ error: result.error });
    try {
      const helpdesk = await storage.updateHelpdesk(req.params.id, result.data);
      res.json(helpdesk);
    } catch (error: any) {
      res.status(404).json({ error: error.message });
    }
  });

  app.delete("/api/helpdesks/:id", async (req, res) => {
    await storage.deleteHelpdesk(req.params.id);
    res.sendStatus(204);
  });

  // ============== SLA STATES ==============

  app.get("/api/helpdesks/:helpdeskId/sla-states", async (req, res) => {
    const states = await storage.getSlaStates(req.params.helpdeskId);
    res.json(states);
  });

  app.post("/api/helpdesks/:helpdeskId/sla-states", async (req, res) => {
    const result = insertSlaStateSchema.safeParse({ ...req.body, helpdeskId: req.params.helpdeskId });
    if (!result.success) return res.status(400).json({ error: result.error });
    const state = await storage.createSlaState(result.data);
    res.json(state);
  });

  app.patch("/api/sla-states/:id", async (req, res) => {
    const result = insertSlaStateSchema.partial().safeParse(req.body);
    if (!result.success) return res.status(400).json({ error: result.error });
    try {
      const state = await storage.updateSlaState(req.params.id, result.data);
      res.json(state);
    } catch (error: any) {
      res.status(404).json({ error: error.message });
    }
  });

  app.delete("/api/sla-states/:id", async (req, res) => {
    await storage.deleteSlaState(req.params.id);
    res.sendStatus(204);
  });

  app.patch("/api/helpdesks/:helpdeskId/sla-states/reorder", async (req, res) => {
    const { ids } = req.body;
    if (!Array.isArray(ids)) return res.sendStatus(400);
    try {
      await Promise.all(
        ids.map((id: string, index: number) => storage.updateSlaState(id, { order: index }))
      );
      res.sendStatus(204);
    } catch (error) {
      res.sendStatus(500);
    }
  });

  // ============== SLA POLICIES ==============

  app.get("/api/helpdesks/:helpdeskId/sla-policies", async (req, res) => {
    const policies = await storage.getSlaPolicies(req.params.helpdeskId);
    res.json(policies);
  });

  app.post("/api/helpdesks/:helpdeskId/sla-policies", async (req, res) => {
    const result = insertSlaPolicySchema.safeParse({ ...req.body, helpdeskId: req.params.helpdeskId });
    if (!result.success) return res.status(400).json({ error: result.error });
    const policy = await storage.createSlaPolicy(result.data);
    res.json(policy);
  });

  app.patch("/api/sla-policies/:id", async (req, res) => {
    const result = insertSlaPolicySchema.partial().safeParse(req.body);
    if (!result.success) return res.status(400).json({ error: result.error });
    try {
      const policy = await storage.updateSlaPolicy(req.params.id, result.data);
      res.json(policy);
    } catch (error: any) {
      res.status(404).json({ error: error.message });
    }
  });

  app.delete("/api/sla-policies/:id", async (req, res) => {
    await storage.deleteSlaPolicy(req.params.id);
    res.sendStatus(204);
  });

  // ============== ESCALATION RULES ==============

  app.get("/api/helpdesks/:helpdeskId/escalation-rules", async (req, res) => {
    const rules = await storage.getEscalationRules(req.params.helpdeskId);
    res.json(rules);
  });

  app.post("/api/helpdesks/:helpdeskId/escalation-rules", async (req, res) => {
    const result = insertEscalationRuleSchema.safeParse({ ...req.body, helpdeskId: req.params.helpdeskId });
    if (!result.success) return res.status(400).json({ error: result.error });
    const rule = await storage.createEscalationRule(result.data);
    res.json(rule);
  });

  app.patch("/api/escalation-rules/:id", async (req, res) => {
    const result = insertEscalationRuleSchema.partial().safeParse(req.body);
    if (!result.success) return res.status(400).json({ error: result.error });
    try {
      const rule = await storage.updateEscalationRule(req.params.id, result.data);
      res.json(rule);
    } catch (error: any) {
      res.status(404).json({ error: error.message });
    }
  });

  app.delete("/api/escalation-rules/:id", async (req, res) => {
    await storage.deleteEscalationRule(req.params.id);
    res.sendStatus(204);
  });

  // ============== ESCALATION CONDITIONS ==============

  app.get("/api/escalation-rules/:ruleId/conditions", async (req, res) => {
    const conditions = await storage.getEscalationConditions(req.params.ruleId);
    res.json(conditions);
  });

  app.post("/api/escalation-rules/:ruleId/conditions", async (req, res) => {
    const result = insertEscalationConditionSchema.safeParse({ ...req.body, ruleId: req.params.ruleId });
    if (!result.success) return res.status(400).json({ error: result.error });
    const condition = await storage.createEscalationCondition(result.data);
    res.json(condition);
  });

  app.delete("/api/escalation-conditions/:id", async (req, res) => {
    await storage.deleteEscalationCondition(req.params.id);
    res.sendStatus(204);
  });

  // ============== INBOUND EMAIL CONFIG ==============

  app.get("/api/helpdesks/:helpdeskId/email-config", async (req, res) => {
    const config = await storage.getInboundEmailConfig(req.params.helpdeskId);
    res.json(config || null);
  });

  app.post("/api/helpdesks/:helpdeskId/email-config", async (req, res) => {
    const result = insertInboundEmailConfigSchema.safeParse({ ...req.body, helpdeskId: req.params.helpdeskId });
    if (!result.success) return res.status(400).json({ error: result.error });
    const config = await storage.createInboundEmailConfig(result.data);
    res.json(config);
  });

  app.patch("/api/email-config/:id", async (req, res) => {
    const result = insertInboundEmailConfigSchema.partial().safeParse(req.body);
    if (!result.success) return res.status(400).json({ error: result.error });
    try {
      const config = await storage.updateInboundEmailConfig(req.params.id, result.data);
      res.json(config);
    } catch (error: any) {
      res.status(404).json({ error: error.message });
    }
  });
}

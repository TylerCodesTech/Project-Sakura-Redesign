import { eq, and, asc } from "drizzle-orm";
import {
  helpdesks,
  slaStates,
  slaPolicies,
  departmentHierarchy,
  departmentManagers,
  escalationRules,
  escalationConditions,
  inboundEmailConfigs,
  tickets,
  ticketComments,
  helpdeskWebhooks,
  ticketFormCategories,
  ticketFormFields,
  type Helpdesk,
  type InsertHelpdesk,
  type SlaState,
  type InsertSlaState,
  type SlaPolicy,
  type InsertSlaPolicy,
  type DepartmentHierarchy,
  type InsertDepartmentHierarchy,
  type DepartmentManager,
  type InsertDepartmentManager,
  type EscalationRule,
  type InsertEscalationRule,
  type EscalationCondition,
  type InsertEscalationCondition,
  type InboundEmailConfig,
  type InsertInboundEmailConfig,
  type Ticket,
  type InsertTicket,
  type TicketComment,
  type InsertTicketComment,
  type HelpdeskWebhook,
  type InsertHelpdeskWebhook,
  type TicketFormCategory,
  type InsertTicketFormCategory,
  type TicketFormField,
  type InsertTicketFormField,
} from "@shared/schema";

export class DatabaseHelpdeskStorage {
  constructor(private db: any) {}

  // Helpdesk methods
  async getHelpdesks(): Promise<Helpdesk[]> {
    return this.db.select().from(helpdesks);
  }

  async getHelpdeskByDepartment(departmentId: string): Promise<Helpdesk | undefined> {
    const [helpdesk] = await this.db.select().from(helpdesks).where(eq(helpdesks.departmentId, departmentId));
    return helpdesk;
  }

  async createHelpdesk(insert: InsertHelpdesk): Promise<Helpdesk> {
    const [helpdesk] = await this.db.insert(helpdesks).values(insert).returning();

    const defaultStates = [
      { name: "Open", color: "#3b82f6", order: 0, isDefault: "true", isFinal: "false" },
      { name: "In Progress", color: "#f59e0b", order: 1, isDefault: "false", isFinal: "false" },
      { name: "Pending", color: "#8b5cf6", order: 2, isDefault: "false", isFinal: "false" },
      { name: "Resolved", color: "#10b981", order: 3, isDefault: "false", isFinal: "true" },
      { name: "Closed", color: "#6b7280", order: 4, isDefault: "false", isFinal: "true" },
    ];
    for (const state of defaultStates) {
      await this.createSlaState({ ...state, helpdeskId: helpdesk.id });
    }

    return helpdesk;
  }

  async updateHelpdesk(id: string, update: Partial<InsertHelpdesk>): Promise<Helpdesk> {
    const [helpdesk] = await this.db.update(helpdesks).set(update).where(eq(helpdesks.id, id)).returning();
    if (!helpdesk) throw new Error("Helpdesk not found");
    return helpdesk;
  }

  async deleteHelpdesk(id: string): Promise<void> {
    await this.db.delete(helpdesks).where(eq(helpdesks.id, id));
  }

  // SLA State methods
  async getSlaStates(helpdeskId: string): Promise<SlaState[]> {
    return this.db.select().from(slaStates).where(eq(slaStates.helpdeskId, helpdeskId)).orderBy(asc(slaStates.order));
  }

  async createSlaState(insert: InsertSlaState): Promise<SlaState> {
    const [state] = await this.db.insert(slaStates).values(insert).returning();
    return state;
  }

  async updateSlaState(id: string, update: Partial<InsertSlaState>): Promise<SlaState> {
    const [state] = await this.db.update(slaStates).set(update).where(eq(slaStates.id, id)).returning();
    if (!state) throw new Error("SLA State not found");
    return state;
  }

  async deleteSlaState(id: string): Promise<void> {
    await this.db.delete(slaStates).where(eq(slaStates.id, id));
  }

  // SLA Policy methods
  async getSlaPolicies(helpdeskId: string): Promise<SlaPolicy[]> {
    return this.db.select().from(slaPolicies).where(eq(slaPolicies.helpdeskId, helpdeskId));
  }

  async createSlaPolicy(insert: InsertSlaPolicy): Promise<SlaPolicy> {
    const [policy] = await this.db.insert(slaPolicies).values(insert).returning();
    return policy;
  }

  async updateSlaPolicy(id: string, update: Partial<InsertSlaPolicy>): Promise<SlaPolicy> {
    const [policy] = await this.db.update(slaPolicies).set(update).where(eq(slaPolicies.id, id)).returning();
    if (!policy) throw new Error("SLA Policy not found");
    return policy;
  }

  async deleteSlaPolicy(id: string): Promise<void> {
    await this.db.delete(slaPolicies).where(eq(slaPolicies.id, id));
  }

  // Department Hierarchy methods
  async getDepartmentHierarchy(): Promise<DepartmentHierarchy[]> {
    return this.db.select().from(departmentHierarchy);
  }

  async getChildDepartments(parentId: string): Promise<DepartmentHierarchy[]> {
    return this.db.select().from(departmentHierarchy).where(eq(departmentHierarchy.parentDepartmentId, parentId));
  }

  async createDepartmentHierarchy(insert: InsertDepartmentHierarchy): Promise<DepartmentHierarchy> {
    const [hierarchy] = await this.db.insert(departmentHierarchy).values(insert).returning();
    return hierarchy;
  }

  async deleteDepartmentHierarchy(id: string): Promise<void> {
    await this.db.delete(departmentHierarchy).where(eq(departmentHierarchy.id, id));
  }

  // Department Manager methods
  async getDepartmentManagers(departmentId: string): Promise<DepartmentManager[]> {
    return this.db.select().from(departmentManagers).where(eq(departmentManagers.departmentId, departmentId));
  }

  async createDepartmentManager(insert: InsertDepartmentManager): Promise<DepartmentManager> {
    const [manager] = await this.db.insert(departmentManagers).values(insert).returning();
    return manager;
  }

  async updateDepartmentManager(id: string, update: Partial<InsertDepartmentManager>): Promise<DepartmentManager> {
    const [manager] = await this.db.update(departmentManagers).set(update).where(eq(departmentManagers.id, id)).returning();
    if (!manager) throw new Error("Department Manager not found");
    return manager;
  }

  async deleteDepartmentManager(id: string): Promise<void> {
    await this.db.delete(departmentManagers).where(eq(departmentManagers.id, id));
  }

  // Escalation Rule methods
  async getEscalationRules(helpdeskId: string): Promise<EscalationRule[]> {
    return this.db.select().from(escalationRules).where(eq(escalationRules.helpdeskId, helpdeskId)).orderBy(asc(escalationRules.order));
  }

  async createEscalationRule(insert: InsertEscalationRule): Promise<EscalationRule> {
    const [rule] = await this.db.insert(escalationRules).values(insert).returning();
    return rule;
  }

  async updateEscalationRule(id: string, update: Partial<InsertEscalationRule>): Promise<EscalationRule> {
    const [rule] = await this.db.update(escalationRules).set(update).where(eq(escalationRules.id, id)).returning();
    if (!rule) throw new Error("Escalation Rule not found");
    return rule;
  }

  async deleteEscalationRule(id: string): Promise<void> {
    await this.db.delete(escalationRules).where(eq(escalationRules.id, id));
  }

  // Escalation Condition methods
  async getEscalationConditions(ruleId: string): Promise<EscalationCondition[]> {
    return this.db.select().from(escalationConditions).where(eq(escalationConditions.ruleId, ruleId));
  }

  async createEscalationCondition(insert: InsertEscalationCondition): Promise<EscalationCondition> {
    const [condition] = await this.db.insert(escalationConditions).values(insert).returning();
    return condition;
  }

  async deleteEscalationCondition(id: string): Promise<void> {
    await this.db.delete(escalationConditions).where(eq(escalationConditions.id, id));
  }

  // Inbound Email Config methods
  async getInboundEmailConfig(helpdeskId: string): Promise<InboundEmailConfig | undefined> {
    const [config] = await this.db.select().from(inboundEmailConfigs).where(eq(inboundEmailConfigs.helpdeskId, helpdeskId));
    return config;
  }

  async createInboundEmailConfig(insert: InsertInboundEmailConfig): Promise<InboundEmailConfig> {
    const [config] = await this.db.insert(inboundEmailConfigs).values(insert).returning();
    return config;
  }

  async updateInboundEmailConfig(id: string, update: Partial<InsertInboundEmailConfig>): Promise<InboundEmailConfig> {
    const [config] = await this.db.update(inboundEmailConfigs).set(update).where(eq(inboundEmailConfigs.id, id)).returning();
    if (!config) throw new Error("Inbound Email Config not found");
    return config;
  }

  // Ticket methods
  async getTickets(helpdeskId?: string): Promise<Ticket[]> {
    if (helpdeskId) {
      return this.db.select().from(tickets).where(eq(tickets.helpdeskId, helpdeskId));
    }
    return this.db.select().from(tickets);
  }

  async getTicket(id: string): Promise<Ticket | undefined> {
    const [ticket] = await this.db.select().from(tickets).where(eq(tickets.id, id));
    return ticket;
  }

  async createTicket(insert: InsertTicket): Promise<Ticket> {
    const [ticket] = await this.db.insert(tickets).values(insert).returning();

    // Automatically generate embedding in the background using queue
    const { embeddingQueue } = await import("../../embedding-queue");
    embeddingQueue.enqueue('ticket', ticket.id);

    return ticket;
  }

  async updateTicket(id: string, update: Partial<InsertTicket>): Promise<Ticket> {
    const [ticket] = await this.db.update(tickets).set({ ...update, updatedAt: new Date().toISOString() }).where(eq(tickets.id, id)).returning();
    if (!ticket) throw new Error("Ticket not found");

    // Regenerate embedding if title or description changed using queue
    if (update.title !== undefined || update.description !== undefined) {
      const { embeddingQueue } = await import("../../embedding-queue");
      embeddingQueue.enqueue('ticket', ticket.id);
    }

    return ticket;
  }

  // Ticket Comment methods
  async getTicketComments(ticketId: string): Promise<TicketComment[]> {
    return this.db.select().from(ticketComments).where(eq(ticketComments.ticketId, ticketId)).orderBy(asc(ticketComments.createdAt));
  }

  async createTicketComment(insert: InsertTicketComment): Promise<TicketComment> {
    const [comment] = await this.db.insert(ticketComments).values(insert).returning();
    return comment;
  }

  // Webhook methods
  async getWebhooks(helpdeskId: string): Promise<HelpdeskWebhook[]> {
    return this.db.select().from(helpdeskWebhooks).where(eq(helpdeskWebhooks.helpdeskId, helpdeskId));
  }

  async createWebhook(insert: InsertHelpdeskWebhook): Promise<HelpdeskWebhook> {
    const [webhook] = await this.db.insert(helpdeskWebhooks).values(insert).returning();
    return webhook;
  }

  async updateWebhook(id: string, update: Partial<InsertHelpdeskWebhook>): Promise<HelpdeskWebhook> {
    const [webhook] = await this.db.update(helpdeskWebhooks).set(update).where(eq(helpdeskWebhooks.id, id)).returning();
    if (!webhook) throw new Error("Webhook not found");
    return webhook;
  }

  async deleteWebhook(id: string): Promise<void> {
    await this.db.delete(helpdeskWebhooks).where(eq(helpdeskWebhooks.id, id));
  }

  // Ticket Form Category methods
  async getTicketFormCategories(helpdeskId: string): Promise<TicketFormCategory[]> {
    return this.db.select().from(ticketFormCategories).where(eq(ticketFormCategories.helpdeskId, helpdeskId)).orderBy(asc(ticketFormCategories.order));
  }

  async getTicketFormCategory(id: string): Promise<TicketFormCategory | undefined> {
    const [category] = await this.db.select().from(ticketFormCategories).where(eq(ticketFormCategories.id, id));
    return category;
  }

  async createTicketFormCategory(insert: InsertTicketFormCategory): Promise<TicketFormCategory> {
    const [category] = await this.db.insert(ticketFormCategories).values(insert).returning();
    return category;
  }

  async updateTicketFormCategory(id: string, update: Partial<InsertTicketFormCategory>): Promise<TicketFormCategory> {
    const [category] = await this.db.update(ticketFormCategories).set(update).where(eq(ticketFormCategories.id, id)).returning();
    if (!category) throw new Error("Ticket form category not found");
    return category;
  }

  async deleteTicketFormCategory(id: string): Promise<void> {
    await this.db.delete(ticketFormCategories).where(eq(ticketFormCategories.id, id));
  }

  // Ticket Form Field methods
  async getTicketFormFields(helpdeskId: string): Promise<TicketFormField[]> {
    return this.db.select().from(ticketFormFields).where(eq(ticketFormFields.helpdeskId, helpdeskId)).orderBy(asc(ticketFormFields.order));
  }

  async getTicketFormFieldsByCategory(categoryId: string): Promise<TicketFormField[]> {
    return this.db.select().from(ticketFormFields).where(eq(ticketFormFields.formCategoryId, categoryId)).orderBy(asc(ticketFormFields.order));
  }

  async createTicketFormField(insert: InsertTicketFormField): Promise<TicketFormField> {
    const [field] = await this.db.insert(ticketFormFields).values(insert).returning();
    return field;
  }

  async updateTicketFormField(id: string, update: Partial<InsertTicketFormField>): Promise<TicketFormField> {
    const [field] = await this.db.update(ticketFormFields).set(update).where(eq(ticketFormFields.id, id)).returning();
    if (!field) throw new Error("Ticket form field not found");
    return field;
  }

  async deleteTicketFormField(id: string): Promise<void> {
    await this.db.delete(ticketFormFields).where(eq(ticketFormFields.id, id));
  }
}

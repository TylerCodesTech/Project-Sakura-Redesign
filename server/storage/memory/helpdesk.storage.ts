import { randomUUID } from "crypto";
import {
  type Helpdesk, type InsertHelpdesk,
  type SlaState, type InsertSlaState,
  type SlaPolicy, type InsertSlaPolicy,
  type DepartmentHierarchy, type InsertDepartmentHierarchy,
  type DepartmentManager, type InsertDepartmentManager,
  type EscalationRule, type InsertEscalationRule,
  type EscalationCondition, type InsertEscalationCondition,
  type InboundEmailConfig, type InsertInboundEmailConfig,
  type Ticket, type InsertTicket,
  type TicketComment, type InsertTicketComment,
  type HelpdeskWebhook, type InsertHelpdeskWebhook,
  type TicketFormCategory, type InsertTicketFormCategory,
  type TicketFormField, type InsertTicketFormField,
} from "@shared/schema";

/**
 * HelpdeskStorage handles all helpdesk and ticket-related storage operations in memory.
 * This class manages Maps for helpdesks, tickets, SLA configurations, escalation rules,
 * and ticket form fields.
 */
export class HelpdeskStorage {
  private helpdesks: Map<string, Helpdesk>;
  private slaStates: Map<string, SlaState>;
  private slaPolicies: Map<string, SlaPolicy>;
  private departmentHierarchy: Map<string, DepartmentHierarchy>;
  private departmentManagers: Map<string, DepartmentManager>;
  private escalationRules: Map<string, EscalationRule>;
  private escalationConditions: Map<string, EscalationCondition>;
  private inboundEmailConfigs: Map<string, InboundEmailConfig>;
  private tickets: Map<string, Ticket>;
  private ticketComments: Map<string, TicketComment>;
  private webhooks: Map<string, HelpdeskWebhook>;
  private ticketFormCategories: Map<string, TicketFormCategory>;
  private ticketFormFields: Map<string, TicketFormField>;

  constructor() {
    this.helpdesks = new Map();
    this.slaStates = new Map();
    this.slaPolicies = new Map();
    this.departmentHierarchy = new Map();
    this.departmentManagers = new Map();
    this.escalationRules = new Map();
    this.escalationConditions = new Map();
    this.inboundEmailConfigs = new Map();
    this.tickets = new Map();
    this.ticketComments = new Map();
    this.webhooks = new Map();
    this.ticketFormCategories = new Map();
    this.ticketFormFields = new Map();
  }

  // Helpdesk methods
  async getHelpdesks(): Promise<Helpdesk[]> {
    return Array.from(this.helpdesks.values());
  }

  async getHelpdesk(id: string): Promise<Helpdesk | undefined> {
    return this.helpdesks.get(id);
  }

  async getHelpdeskByDepartment(departmentId: string): Promise<Helpdesk | undefined> {
    return Array.from(this.helpdesks.values()).find(h => h.departmentId === departmentId);
  }

  async createHelpdesk(insert: InsertHelpdesk): Promise<Helpdesk> {
    const id = randomUUID();
    const helpdesk: Helpdesk = {
      id,
      departmentId: insert.departmentId,
      name: insert.name,
      description: insert.description ?? null,
      enabled: insert.enabled ?? "true",
      publicAccess: insert.publicAccess ?? "false",
      createdAt: new Date().toISOString(),
    };
    this.helpdesks.set(id, helpdesk);

    // Create default SLA states for this helpdesk
    const defaultStates = [
      { name: "Open", color: "#3b82f6", order: 0, isDefault: "true", isFinal: "false" },
      { name: "In Progress", color: "#f59e0b", order: 1, isDefault: "false", isFinal: "false" },
      { name: "Pending", color: "#8b5cf6", order: 2, isDefault: "false", isFinal: "false" },
      { name: "Resolved", color: "#10b981", order: 3, isDefault: "false", isFinal: "true" },
      { name: "Closed", color: "#6b7280", order: 4, isDefault: "false", isFinal: "true" },
    ];
    for (const state of defaultStates) {
      await this.createSlaState({ ...state, helpdeskId: id });
    }

    return helpdesk;
  }

  async updateHelpdesk(id: string, update: Partial<InsertHelpdesk>): Promise<Helpdesk> {
    const existing = this.helpdesks.get(id);
    if (!existing) throw new Error("Helpdesk not found");
    const updated = { ...existing, ...update };
    this.helpdesks.set(id, updated);
    return updated;
  }

  async deleteHelpdesk(id: string): Promise<void> {
    this.helpdesks.delete(id);
  }

  // SLA State methods
  async getSlaStates(helpdeskId: string): Promise<SlaState[]> {
    return Array.from(this.slaStates.values())
      .filter(s => s.helpdeskId === helpdeskId)
      .sort((a, b) => a.order - b.order);
  }

  async createSlaState(insert: InsertSlaState): Promise<SlaState> {
    const id = randomUUID();
    const state: SlaState = {
      id,
      helpdeskId: insert.helpdeskId,
      name: insert.name,
      description: insert.description ?? null,
      color: insert.color ?? "#3b82f6",
      order: insert.order ?? 0,
      isFinal: insert.isFinal ?? "false",
      isDefault: insert.isDefault ?? "false",
      targetHours: insert.targetHours ?? null,
      createdAt: new Date().toISOString(),
    };
    this.slaStates.set(id, state);
    return state;
  }

  async updateSlaState(id: string, update: Partial<InsertSlaState>): Promise<SlaState> {
    const existing = this.slaStates.get(id);
    if (!existing) throw new Error("SLA State not found");
    const updated = { ...existing, ...update };
    this.slaStates.set(id, updated);
    return updated;
  }

  async deleteSlaState(id: string): Promise<void> {
    this.slaStates.delete(id);
  }

  // SLA Policy methods
  async getSlaPolicies(helpdeskId: string): Promise<SlaPolicy[]> {
    return Array.from(this.slaPolicies.values()).filter(p => p.helpdeskId === helpdeskId);
  }

  async createSlaPolicy(insert: InsertSlaPolicy): Promise<SlaPolicy> {
    const id = randomUUID();
    const policy: SlaPolicy = {
      id,
      helpdeskId: insert.helpdeskId,
      name: insert.name,
      description: insert.description ?? null,
      priority: insert.priority ?? "medium",
      firstResponseHours: insert.firstResponseHours ?? null,
      resolutionHours: insert.resolutionHours ?? null,
      enabled: insert.enabled ?? "true",
      createdAt: new Date().toISOString(),
    };
    this.slaPolicies.set(id, policy);
    return policy;
  }

  async updateSlaPolicy(id: string, update: Partial<InsertSlaPolicy>): Promise<SlaPolicy> {
    const existing = this.slaPolicies.get(id);
    if (!existing) throw new Error("SLA Policy not found");
    const updated = { ...existing, ...update };
    this.slaPolicies.set(id, updated);
    return updated;
  }

  async deleteSlaPolicy(id: string): Promise<void> {
    this.slaPolicies.delete(id);
  }

  // Department Hierarchy methods
  async getDepartmentHierarchy(): Promise<DepartmentHierarchy[]> {
    return Array.from(this.departmentHierarchy.values());
  }

  async getChildDepartments(parentId: string): Promise<DepartmentHierarchy[]> {
    return Array.from(this.departmentHierarchy.values()).filter(h => h.parentDepartmentId === parentId);
  }

  async createDepartmentHierarchy(insert: InsertDepartmentHierarchy): Promise<DepartmentHierarchy> {
    const id = randomUUID();
    const hierarchy: DepartmentHierarchy = {
      id,
      parentDepartmentId: insert.parentDepartmentId ?? null,
      childDepartmentId: insert.childDepartmentId,
      hierarchyType: insert.hierarchyType ?? "subdivision",
      createdAt: new Date().toISOString(),
    };
    this.departmentHierarchy.set(id, hierarchy);
    return hierarchy;
  }

  async updateDepartmentHierarchy(id: string, update: Partial<InsertDepartmentHierarchy>): Promise<DepartmentHierarchy> {
    const existing = this.departmentHierarchy.get(id);
    if (!existing) throw new Error("Department Hierarchy not found");
    const updated = { ...existing, ...update };
    this.departmentHierarchy.set(id, updated);
    return updated;
  }

  async deleteDepartmentHierarchy(id: string): Promise<void> {
    this.departmentHierarchy.delete(id);
  }

  // Department Manager methods
  async getDepartmentManagers(departmentId: string): Promise<DepartmentManager[]> {
    return Array.from(this.departmentManagers.values()).filter(m => m.departmentId === departmentId);
  }

  async createDepartmentManager(insert: InsertDepartmentManager): Promise<DepartmentManager> {
    const id = randomUUID();
    const manager: DepartmentManager = {
      id,
      departmentId: insert.departmentId,
      userId: insert.userId,
      role: insert.role ?? "manager",
      isPrimary: insert.isPrimary ?? "false",
      createdAt: new Date().toISOString(),
    };
    this.departmentManagers.set(id, manager);
    return manager;
  }

  async updateDepartmentManager(id: string, update: Partial<InsertDepartmentManager>): Promise<DepartmentManager> {
    const existing = this.departmentManagers.get(id);
    if (!existing) throw new Error("Department Manager not found");
    const updated = { ...existing, ...update };
    this.departmentManagers.set(id, updated);
    return updated;
  }

  async deleteDepartmentManager(id: string): Promise<void> {
    this.departmentManagers.delete(id);
  }

  // Escalation Rule methods
  async getEscalationRules(helpdeskId: string): Promise<EscalationRule[]> {
    return Array.from(this.escalationRules.values())
      .filter(r => r.helpdeskId === helpdeskId)
      .sort((a, b) => a.order - b.order);
  }

  async createEscalationRule(insert: InsertEscalationRule): Promise<EscalationRule> {
    const id = randomUUID();
    const rule: EscalationRule = {
      id,
      helpdeskId: insert.helpdeskId,
      name: insert.name,
      description: insert.description ?? null,
      triggerType: insert.triggerType ?? "time_based",
      triggerHours: insert.triggerHours ?? null,
      priority: insert.priority ?? null,
      ticketType: insert.ticketType ?? null,
      fromStateId: insert.fromStateId ?? null,
      targetDepartmentId: insert.targetDepartmentId ?? null,
      targetUserId: insert.targetUserId ?? null,
      notifyManagers: insert.notifyManagers ?? "true",
      enabled: insert.enabled ?? "true",
      order: insert.order ?? 0,
      createdAt: new Date().toISOString(),
    };
    this.escalationRules.set(id, rule);
    return rule;
  }

  async updateEscalationRule(id: string, update: Partial<InsertEscalationRule>): Promise<EscalationRule> {
    const existing = this.escalationRules.get(id);
    if (!existing) throw new Error("Escalation Rule not found");
    const updated = { ...existing, ...update };
    this.escalationRules.set(id, updated);
    return updated;
  }

  async deleteEscalationRule(id: string): Promise<void> {
    this.escalationRules.delete(id);
  }

  // Escalation Condition methods
  async getEscalationConditions(ruleId: string): Promise<EscalationCondition[]> {
    return Array.from(this.escalationConditions.values()).filter(c => c.ruleId === ruleId);
  }

  async createEscalationCondition(insert: InsertEscalationCondition): Promise<EscalationCondition> {
    const id = randomUUID();
    const condition: EscalationCondition = {
      id,
      ruleId: insert.ruleId,
      field: insert.field,
      operator: insert.operator,
      value: insert.value,
      logicOperator: insert.logicOperator ?? "and",
    };
    this.escalationConditions.set(id, condition);
    return condition;
  }

  async deleteEscalationCondition(id: string): Promise<void> {
    this.escalationConditions.delete(id);
  }

  // Inbound Email Config methods
  async getInboundEmailConfigs(helpdeskId: string): Promise<InboundEmailConfig[]> {
    return Array.from(this.inboundEmailConfigs.values()).filter(c => c.helpdeskId === helpdeskId);
  }

  async getInboundEmailConfig(helpdeskId: string): Promise<InboundEmailConfig | undefined> {
    return Array.from(this.inboundEmailConfigs.values()).find(c => c.helpdeskId === helpdeskId);
  }

  async createInboundEmailConfig(insert: InsertInboundEmailConfig): Promise<InboundEmailConfig> {
    const id = randomUUID();
    const config: InboundEmailConfig = {
      id,
      helpdeskId: insert.helpdeskId,
      emailAddress: insert.emailAddress ?? null,
      provider: insert.provider ?? "custom",
      enabled: insert.enabled ?? "false",
      autoCreateTickets: insert.autoCreateTickets ?? "true",
      defaultPriority: insert.defaultPriority ?? "medium",
      createdAt: new Date().toISOString(),
    };
    this.inboundEmailConfigs.set(id, config);
    return config;
  }

  async deleteInboundEmailConfig(id: string): Promise<void> {
    this.inboundEmailConfigs.delete(id);
  }

  // Ticket methods
  async getTickets(helpdeskId?: string): Promise<Ticket[]> {
    const all = Array.from(this.tickets.values());
    if (helpdeskId) {
      return all.filter(t => t.helpdeskId === helpdeskId);
    }
    return all;
  }

  async getTicket(id: string): Promise<Ticket | undefined> {
    return this.tickets.get(id);
  }

  async createTicket(insert: InsertTicket): Promise<Ticket> {
    const id = randomUUID();
    const ticket: Ticket = {
      id,
      helpdeskId: insert.helpdeskId,
      title: insert.title,
      description: insert.description ?? null,
      priority: insert.priority ?? "medium",
      stateId: insert.stateId ?? null,
      assignedTo: insert.assignedTo ?? null,
      createdBy: insert.createdBy,
      departmentId: insert.departmentId ?? null,
      ticketType: insert.ticketType ?? "request",
      source: insert.source ?? "web",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      embedding: null,
      embeddingUpdatedAt: null,
    };
    this.tickets.set(id, ticket);
    return ticket;
  }

  async updateTicket(id: string, update: Partial<InsertTicket>): Promise<Ticket> {
    const existing = this.tickets.get(id);
    if (!existing) throw new Error("Ticket not found");
    const updated = { ...existing, ...update, updatedAt: new Date().toISOString() };
    this.tickets.set(id, updated);
    return updated;
  }

  // Ticket Comment methods
  async getTicketComments(ticketId: string): Promise<TicketComment[]> {
    return Array.from(this.ticketComments.values())
      .filter(c => c.ticketId === ticketId)
      .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  }

  async createTicketComment(insert: InsertTicketComment): Promise<TicketComment> {
    const id = randomUUID();
    const comment: TicketComment = {
      id,
      ticketId: insert.ticketId,
      userId: insert.userId ?? null,
      content: insert.content,
      isInternal: insert.isInternal ?? "false",
      source: insert.source ?? "web",
      emailMessageId: insert.emailMessageId ?? null,
      createdAt: new Date().toISOString(),
    };
    this.ticketComments.set(id, comment);
    return comment;
  }

  // Webhook methods
  async getWebhooks(helpdeskId: string): Promise<HelpdeskWebhook[]> {
    return Array.from(this.webhooks.values()).filter(w => w.helpdeskId === helpdeskId);
  }

  async createWebhook(insert: InsertHelpdeskWebhook): Promise<HelpdeskWebhook> {
    const id = randomUUID();
    const webhook: HelpdeskWebhook = {
      id,
      helpdeskId: insert.helpdeskId,
      name: insert.name,
      url: insert.url,
      secret: insert.secret ?? null,
      events: insert.events ?? "ticket.created,ticket.updated",
      enabled: insert.enabled ?? "true",
      retryCount: insert.retryCount ?? 3,
      timeoutSeconds: insert.timeoutSeconds ?? 30,
      lastTriggeredAt: null,
      createdAt: new Date().toISOString(),
    };
    this.webhooks.set(id, webhook);
    return webhook;
  }

  async updateWebhook(id: string, update: Partial<InsertHelpdeskWebhook>): Promise<HelpdeskWebhook> {
    const existing = this.webhooks.get(id);
    if (!existing) throw new Error("Webhook not found");
    const updated = { ...existing, ...update };
    this.webhooks.set(id, updated);
    return updated;
  }

  async deleteWebhook(id: string): Promise<void> {
    this.webhooks.delete(id);
  }

  // Ticket Form Category methods
  async getTicketFormCategories(helpdeskId: string): Promise<TicketFormCategory[]> {
    return Array.from(this.ticketFormCategories.values())
      .filter(c => c.helpdeskId === helpdeskId)
      .sort((a, b) => a.order - b.order);
  }

  async getTicketFormCategory(id: string): Promise<TicketFormCategory | undefined> {
    return this.ticketFormCategories.get(id);
  }

  async createTicketFormCategory(insert: InsertTicketFormCategory): Promise<TicketFormCategory> {
    const id = randomUUID();
    const category: TicketFormCategory = {
      id,
      helpdeskId: insert.helpdeskId,
      name: insert.name,
      description: insert.description ?? null,
      icon: insert.icon ?? "layers",
      color: insert.color ?? "#3b82f6",
      order: insert.order ?? 0,
      enabled: insert.enabled ?? "true",
      createdAt: new Date().toISOString(),
    };
    this.ticketFormCategories.set(id, category);
    return category;
  }

  async updateTicketFormCategory(id: string, update: Partial<InsertTicketFormCategory>): Promise<TicketFormCategory> {
    const existing = this.ticketFormCategories.get(id);
    if (!existing) throw new Error("Ticket form category not found");
    const updated = { ...existing, ...update };
    this.ticketFormCategories.set(id, updated);
    return updated;
  }

  async deleteTicketFormCategory(id: string): Promise<void> {
    this.ticketFormCategories.delete(id);
  }

  // Ticket Form Field methods
  async getTicketFormFields(helpdeskId: string): Promise<TicketFormField[]> {
    return Array.from(this.ticketFormFields.values())
      .filter(f => f.helpdeskId === helpdeskId)
      .sort((a, b) => a.order - b.order);
  }

  async getTicketFormFieldsByCategory(categoryId: string): Promise<TicketFormField[]> {
    return Array.from(this.ticketFormFields.values())
      .filter(f => f.formCategoryId === categoryId)
      .sort((a, b) => a.order - b.order);
  }

  async createTicketFormField(insert: InsertTicketFormField): Promise<TicketFormField> {
    const id = randomUUID();
    const field: TicketFormField = {
      id,
      helpdeskId: insert.helpdeskId,
      formCategoryId: insert.formCategoryId ?? null,
      name: insert.name,
      label: insert.label,
      fieldType: insert.fieldType ?? "text",
      placeholder: insert.placeholder ?? null,
      helpText: insert.helpText ?? null,
      required: insert.required ?? "false",
      options: insert.options ?? null,
      defaultValue: insert.defaultValue ?? null,
      order: insert.order ?? 0,
      enabled: insert.enabled ?? "true",
      showOnCreate: insert.showOnCreate ?? "true",
      showOnEdit: insert.showOnEdit ?? "true",
      category: insert.category ?? null,
      conditionalField: insert.conditionalField ?? null,
      conditionalValue: insert.conditionalValue ?? null,
      minValue: insert.minValue ?? null,
      maxValue: insert.maxValue ?? null,
      validationPattern: insert.validationPattern ?? null,
      width: insert.width ?? "full",
      internalOnly: insert.internalOnly ?? "false",
      createdAt: new Date().toISOString(),
    };
    this.ticketFormFields.set(id, field);
    return field;
  }

  async updateTicketFormField(id: string, update: Partial<InsertTicketFormField>): Promise<TicketFormField> {
    const existing = this.ticketFormFields.get(id);
    if (!existing) throw new Error("Ticket form field not found");
    const updated = { ...existing, ...update };
    this.ticketFormFields.set(id, updated);
    return updated;
  }

  async deleteTicketFormField(id: string): Promise<void> {
    this.ticketFormFields.delete(id);
  }

  // Related Documents (stub - returns empty array as this may need integration with document storage)
  async getRelatedDocuments(_ticketId: string): Promise<any[]> {
    return [];
  }
}

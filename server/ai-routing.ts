import { storage } from "./storage";

interface SimilarResult {
  tickets: Array<{ id: string; title: string; similarity: number; departmentId: string | null; assignedTo: string | null }>;
  docs: Array<{ id: string; title: string; similarity: number }>;
}

interface RoutingSuggestion {
  departmentId: string | null;
  subDepartmentId: string | null;
  assigneeId: string | null;
  confidence: number;
  reason: string;
  relatedTickets: Array<{ id: string; title: string; similarity: number }>;
  relatedDocs: Array<{ id: string; title: string; similarity: number }>;
}

export async function suggestTicketRouting(
  description: string,
  similarResults: SimilarResult
): Promise<RoutingSuggestion> {
  const { tickets, docs } = similarResults;

  if (tickets.length === 0 && docs.length === 0) {
    return {
      departmentId: null,
      subDepartmentId: null,
      assigneeId: null,
      confidence: 0,
      reason: "No similar tickets or documents found for routing analysis.",
      relatedTickets: [],
      relatedDocs: docs.map(d => ({ id: d.id, title: d.title, similarity: d.similarity })),
    };
  }

  const departmentCounts = new Map<string, { count: number; totalSimilarity: number; assignees: Map<string, number> }>();
  
  for (const ticket of tickets) {
    if (ticket.departmentId) {
      const existing = departmentCounts.get(ticket.departmentId) || { 
        count: 0, 
        totalSimilarity: 0, 
        assignees: new Map() 
      };
      existing.count++;
      existing.totalSimilarity += ticket.similarity;
      
      if (ticket.assignedTo) {
        existing.assignees.set(
          ticket.assignedTo, 
          (existing.assignees.get(ticket.assignedTo) || 0) + ticket.similarity
        );
      }
      
      departmentCounts.set(ticket.departmentId, existing);
    }
  }

  let bestDepartmentId: string | null = null;
  let bestScore = 0;
  let bestAssigneeId: string | null = null;

  for (const [deptId, data] of departmentCounts.entries()) {
    const score = data.totalSimilarity / data.count * Math.log(data.count + 1);
    if (score > bestScore) {
      bestScore = score;
      bestDepartmentId = deptId;
      
      let topAssigneeScore = 0;
      for (const [assigneeId, assigneeScore] of data.assignees.entries()) {
        if (assigneeScore > topAssigneeScore) {
          topAssigneeScore = assigneeScore;
          bestAssigneeId = assigneeId;
        }
      }
    }
  }

  const hierarchy = await storage.getDepartmentHierarchy();
  let subDepartmentId: string | null = null;
  
  if (bestDepartmentId) {
    const childRelation = hierarchy.find(h => h.parentDepartmentId === bestDepartmentId);
    if (childRelation) {
      subDepartmentId = childRelation.childDepartmentId;
    }
  }

  const confidence = Math.min(0.95, tickets.length > 0 
    ? (tickets[0].similarity * 0.6 + Math.min(tickets.length / 10, 0.4))
    : 0.1);

  const topTicket = tickets[0];
  let reason = "Suggested based on ";
  if (tickets.length > 0) {
    reason += `${tickets.length} similar ticket${tickets.length > 1 ? 's' : ''}`;
    if (docs.length > 0) {
      reason += ` and ${docs.length} related document${docs.length > 1 ? 's' : ''}`;
    }
  } else if (docs.length > 0) {
    reason += `${docs.length} related document${docs.length > 1 ? 's' : ''}`;
  }

  return {
    departmentId: bestDepartmentId,
    subDepartmentId,
    assigneeId: bestAssigneeId,
    confidence,
    reason,
    relatedTickets: tickets.slice(0, 5).map(t => ({ id: t.id, title: t.title, similarity: t.similarity })),
    relatedDocs: docs.slice(0, 3).map(d => ({ id: d.id, title: d.title, similarity: d.similarity })),
  };
}

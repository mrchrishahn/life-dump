import { z } from 'zod';
import { MCP } from '@life-dump/core';

export const ProjectSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  status: z.enum(['active', 'completed', 'archived']),
  createdAt: z.string(),
  updatedAt: z.string(),
  tags: z.array(z.string()),
  metadata: z.record(z.unknown()).optional(),
});

export type Project = z.infer<typeof ProjectSchema>;

export const projectsMCP: MCP = {
  name: 'projects',
  description: 'Manages project-related activities and notifications',
  triggers: ['project.created', 'project.updated', 'project.completed'],
  actions: [
    'notify.project.status_change',
    'update.project.metrics',
    'schedule.project.review'
  ],
  conditions: [
    'project.status === "completed"',
    'project.tags.includes("urgent")',
    'project.metadata.priority === "high"'
  ]
}; 
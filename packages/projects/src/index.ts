import { McpServer, ResourceTemplate } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { db } from "./db";
import { projects, tasks } from "./db/schema";
import { eq, and, gte, lte } from "drizzle-orm";
import { fa } from "zod/v4/locales";

export const ProjectsServer = new McpServer({
  name: "projects",
  version: "1.0.0",
  capabilities: {
    resources: {},
    tools: {},
  },
});

ProjectsServer.tool(
  "createProject",
  "Create a new project",
  {
    name: z.string(),
    description: z.string().describe("The description of the project"),
  },
  async (params) => {
    const { name, description } = params;
    const project = await db
      .insert(projects)
      .values({ id: crypto.randomUUID(), name, description })
      .returning();
    return {
      content: [{ type: "text", text: `Project ${name} created successfully with id ${project[0].id}` }],
    };
  }
);

ProjectsServer.tool(
  "createTask",
  "Create a new task for a specific project",
  {
    projectId: z.string(),
    title: z.string(),
    description: z.string().optional(),
    dueDate: z.string().optional(),
  },
  async (params) => {
    const { projectId, title, description, dueDate } = params;
    const project = await db.query.projects.findFirst({
      where: eq(projects.id, projectId),
    });
    if (!project) {
      return {
        content: [{ type: "text", text: `Project with id ${projectId} not found` }],
      };
    }
    const task = await db
      .insert(tasks)
      .values({
        id: crypto.randomUUID(),
        projectId: project.id,
        title,
        description,
        dueDate,
      })
      .returning();
    return {
      content: [
        {
          type: "text",
          text: `Task ${title} (${task[0].id}) created successfully in Project ${project.name} (${project.id})`,
        },
      ],
    };
  }
);

ProjectsServer.tool(
  "createProjectWithTasks",
  "Create a new project with initial tasks",
  {
    name: z.string(),
    description: z.string(),
    tasks: z.array(
      z.object({
        title: z.string(),
        description: z.string().optional(),
        dueDate: z.string().optional(),
      })
    ),
  },
  async (params) => {
    const { name, description, tasks: tasksParams } = params;

    // Create the project
    const project = await db
      .insert(projects)
      .values({ id: crypto.randomUUID(), name, description })
      .returning()
      .get();

    // Create the tasks
    const taskValues = tasksParams.map((task) => ({
      id: crypto.randomUUID(),
      projectId: project.id,
      title: task.title,
      description: task.description,
      dueDate: task.dueDate,
    }));

    await db.insert(tasks).values(taskValues);

    return {
      content: [
        {
          type: "text",
          text: `Project ${name} created successfully with ${tasksParams.length} tasks`,
        },
      ],
    };
  }
);

ProjectsServer.tool(
  "updateTaskStatus",
  "Update the status of a task",
  {
    taskId: z.string(),
    status: z.enum(["todo", "in_progress", "done"]),
  },
  async (params) => {
    const { taskId, status } = params;

    const updatedTask = db
      .update(tasks)
      .set({
        status,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(tasks.id, taskId))
      .returning()
      .get();

    if (!updatedTask) {
      throw new Error(`Task with ID ${taskId} not found`);
    }

    return {
      content: [
        {
          type: "text",
          text: `Task status updated successfully:
        Task ID: ${updatedTask.id}
        New Status: ${updatedTask.status}
        Updated At: ${updatedTask.updatedAt}`,
        },
      ],
    };
  }
);

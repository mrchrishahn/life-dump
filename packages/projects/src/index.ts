import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { db } from "./db";
import { projects, tasks } from "./db/schema";
import { eq, and, gte, lte } from "drizzle-orm";

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
    description: z.string(),
  },
  async (params) => {
    const { name, description } = params;
    const project = await db
      .insert(projects)
      .values({ id: crypto.randomUUID(), name, description })
      .returning();
    return {
      content: [{ type: "text", text: `Project ${name} created successfully` }],
    };
  }
);

ProjectsServer.tool(
  "createTask",
  "Create a new task for a specific project",
  {
    projectName: z.string(),
    title: z.string(),
    description: z.string().optional(),
    dueDate: z.string().optional(),
  },
  async (params) => {
    const { projectName, title, description, dueDate } = params;
    const project = await db.query.projects.findFirst({
      where: eq(projects.name, projectName),
    });
    if (!project) {
      return {
        content: [{ type: "text", text: `Project ${projectName} not found` }],
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
          text: `Task ${title} created successfully in Project ${project.name}`,
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

ProjectsServer.resource("projects", "projects://all", async (url: URL) => {
  const allProjects = db.select().from(projects).all();
  return {
    contents: [
      {
        type: "text",
        uri: url.toString(),
        text: `
        All Projects:
        ${allProjects
          .map((project) =>
            [
              `Project ID: ${project.id}`,
              `Project: ${project.name}`,
              `Description: ${project.description}`,
              `Status: ${project.status}`,
              `Created: ${project.createdAt}`,
              `Updated: ${project.updatedAt}`,
              "---",
            ].join("\n")
          )
          .join("\n")}`,
      },
    ],
  };
});

ProjectsServer.tool(
  "getProjectTasks",
  "Get all tasks for a specific project",
  {
    projectId: z.string(),
  },
  async (params) => {
    const { projectId } = params;
    const projectTasks = db
      .select()
      .from(tasks)
      .where(eq(tasks.projectId, projectId))
      .all();
    return {
      content: [
        {
          type: "text",
          text: `Tasks for Project ${projectId}:
      ${projectTasks
        .map((task) =>
          [
            `Task ID: ${task.id}`,
            `Task: ${task.title}`,
            `Description: ${task.description}`,
            `Due Date: ${task.dueDate}`,
            "---",
          ].join("\n")
        )
        .join("\n")}`,
        },
      ],
    };
  }
);

ProjectsServer.tool(
  "getTasksDueInPeriod",
  "Get tasks due within a specified time period",
  {
    startDate: z.string(),
    endDate: z.string(),
  },
  async (params) => {
    const { startDate, endDate } = params;
    const tasksInPeriod = db
      .select()
      .from(tasks)
      .where(and(gte(tasks.dueDate, startDate), lte(tasks.dueDate, endDate)))
      .innerJoin(projects, eq(tasks.projectId, projects.id))
      .all();
    return {
      content: [
        {
          type: "text",
          text: `Tasks due between ${startDate} and ${endDate}:
          ${tasksInPeriod
            .map((task) =>
              [
                `Task ID: ${task.tasks.id}`,
                `Task: ${task.tasks.title}`,
                `Description: ${task.tasks.description}`,
                `Project: ${task.projects.name}`,
                `Due Date: ${task.tasks.dueDate}`,
                "---",
              ].join("\n")
            )
            .join("\n")}`,
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

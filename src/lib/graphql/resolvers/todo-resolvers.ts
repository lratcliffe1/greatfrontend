/**
 * In-memory demo data for Todo list.
 * Data flows through GraphQL as if from a real DB; swap resolvers when adding a DB.
 * Todo tasks are isolated per session (cookie) so each browser has its own list.
 */

import type { GraphQLContext } from "@/lib/graphql/types";

export type TodoTask = { id: number; label: string };

type SessionStore = { tasks: TodoTask[]; nextId: number };
const sessionsStore = new Map<string, SessionStore>();

function getSessionStore(sessionId: string): SessionStore {
	let store = sessionsStore.get(sessionId);
	if (!store) {
		store = { tasks: [], nextId: 1 };
		sessionsStore.set(sessionId, store);
	}
	return store;
}

export const todoResolvers = {
	Query: {
		tasks: (_: unknown, __: unknown, context: GraphQLContext): TodoTask[] => {
			const sessionId = context?.sessionId ?? "default";
			return [...getSessionStore(sessionId).tasks];
		},
	},
	Mutation: {
		addTask: (_: unknown, { label }: { label: string }, context: GraphQLContext): TodoTask => {
			const sessionId = context?.sessionId ?? "default";
			const store = getSessionStore(sessionId);
			const trimmed = label.trim();
			if (!trimmed) throw new Error("Label cannot be empty");
			const task: TodoTask = { id: store.nextId++, label: trimmed };
			store.tasks = [...store.tasks, task];
			return task;
		},
		removeTask: (_: unknown, { id }: { id: number }, context: GraphQLContext): boolean => {
			const sessionId = context?.sessionId ?? "default";
			const store = getSessionStore(sessionId);
			store.tasks = store.tasks.filter((t) => t.id !== id);
			return true;
		},
		clearTasks: (_: unknown, __: unknown, context: GraphQLContext): boolean => {
			const sessionId = context?.sessionId ?? "default";
			const store = getSessionStore(sessionId);
			store.tasks = [];
			store.nextId = 1;
			return true;
		},
	},
};

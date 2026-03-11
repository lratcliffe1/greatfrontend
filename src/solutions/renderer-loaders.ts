import type { ComponentType } from "react";

import type { Question } from "@/content/questions";

type RendererKey = `${Question["track"]}/${Question["path"]}`;

type RendererModule = {
	default: ComponentType;
};

export type RendererLoader = () => Promise<RendererModule>;

export const SOLUTION_RENDERER_LOADERS: Partial<Record<RendererKey, RendererLoader>> = {
	"gfe75/debounce": () => import("@/solutions/gfe75/debounce/renderer"),
	"gfe75/news-feed-facebook": () => import("@/solutions/gfe75/news-feed-facebook/renderer"),
	"gfe75/cookie-sessionstorage-localstorage": () => import("@/solutions/gfe75/cookie-sessionstorage-localstorage/renderer"),
	"gfe75/todo-list": () => import("@/solutions/gfe75/todo-list/renderer"),
	"blind75/balanced-brackets": () => import("@/solutions/blind75/balanced-brackets/renderer"),
	"blind75/find-duplicates-in-array": () => import("@/solutions/blind75/find-duplicates-in-array/renderer"),
};

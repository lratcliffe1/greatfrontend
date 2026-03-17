import type { ComponentType } from "react";

import type { Question } from "@/content/questions";

type RendererKey = `${Question["track"]}/${Question["path"]}`;

type RendererModule = {
	default: ComponentType;
};

export type RendererLoader = () => Promise<RendererModule>;

export const SOLUTION_RENDERER_LOADERS: Partial<Record<RendererKey, RendererLoader>> = {
	"gfe75/debounce": () => import("@/solutions/gfe75/01-debounce/renderer"),
	"gfe75/array-prototype-reduce": () => import("@/solutions/gfe75/02-array-prototype-reduce/renderer"),
	"gfe75/throttle": () => import("@/solutions/gfe75/05-throttle/renderer"),
	"gfe75/todo-list": () => import("@/solutions/gfe75/06-todo-list/renderer"),
	"gfe75/contact-form": () => import("@/solutions/gfe75/07-contact-form/renderer"),
	"gfe75/news-feed-facebook": () => import("@/solutions/gfe75/12-news-feed-facebook/renderer"),
	"gfe75/cookie-sessionstorage-localstorage": () => import("@/solutions/gfe75/30-cookie-sessionstorage-localstorage/renderer"),
	"gfe75/script-async-defer": () => import("@/solutions/gfe75/31-script-async-defer/renderer"),
	"blind75/balanced-brackets": () => import("@/solutions/blind75/01-balanced-brackets/renderer"),
	"blind75/find-duplicates-in-array": () => import("@/solutions/blind75/02-find-duplicates-in-array/renderer"),
	"blind75/find-missing-number-in-sequence": () => import("@/solutions/blind75/03-find-missing-number-in-sequence/renderer"),
	"blind75/maximum-product-in-contiguous-array": () => import("@/solutions/blind75/04-maximum-product-in-contiguous-array/renderer"),
	"blind75/maximum-sum-in-contiguous-array": () => import("@/solutions/blind75/05-maximum-sum-in-contiguous-array/renderer"),
	"blind75/most-common-elements": () => import("@/solutions/blind75/06-most-common-elements/renderer"),
	"blind75/array-product-excluding-current": () => import("@/solutions/blind75/07-array-product-excluding-current/renderer"),
	"blind75/end-of-array-reachable": () => import("@/solutions/blind75/08-end-of-array-reachable/renderer"),
	"blind75/find-element-in-rotated-array": () => import("@/solutions/blind75/09-find-element-in-rotated-array/renderer"),
	"blind75/smallest-element-in-rotated-sorted-array": () => import("@/solutions/blind75/10-smallest-element-in-rotated-sorted-array/renderer"),
};

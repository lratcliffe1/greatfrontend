export type Track = "gfe75" | "blind75";

export type SolutionType =
	| "ui_demo"
	| "algo_visualizer"
	| "code_and_tests"
	| "writeup";

export type QuestionStatus = "todo" | "in_progress" | "done";

export type Question = {
	id: string;
	questionNumber: number;
	slug: string;
	title: string;
	track: Track;
	category: string;
	difficulty: "Easy" | "Medium" | "Hard";
	sourceUrl: string;
	solutionType: SolutionType;
	status: QuestionStatus;
	summary: string;
	cardSummary: string;
	approach: string;
	complexity: string;
	tags: string[];
};

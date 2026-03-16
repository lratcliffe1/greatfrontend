export enum Track {
	Gfe75 = "gfe75",
	Blind75 = "blind75",
}

export enum SolutionType {
	UiDemo = "UI Demo",
	AlgoVisualizer = "Algo Visualizer",
	TimelineVisualizer = "Timeline Visualizer",
	CodeAndTests = "Code and Tests",
	Writeup = "Write Up",
	GraphQL = "GraphQL",
	Redux = "Redux",
	API = "API",
	WebStorage = "Web Storage",
}

export enum QuestionStatus {
	Todo = "todo",
	InProgress = "in_progress",
	Done = "done",
}

export enum Difficulty {
	Easy = "Easy",
	Medium = "Medium",
	Hard = "Hard",
}

export type Question = {
	id: string;
	questionNumber: number;
	path: string;
	title: string;
	track: Track;
	category: string;
	difficulty: Difficulty;
	sourceUrl: string;
	solutionTypes: SolutionType[];
	status: QuestionStatus;
	summary: string;
	cardSummary: string;
	approach: string;
	complexity: string;
};

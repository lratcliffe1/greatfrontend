import type { Question, Track } from "@/content/questions";

export type GraphQLTrack = Track;
export type GraphQLDifficulty = Question["difficulty"];
export type GraphQLQuestionStatus = Question["status"];
export type GraphQLSolutionType = Question["solutionType"];
export type GraphQLQuestion = Question;

export type QuestionsResponse = {
	questions: GraphQLQuestion[];
};

export type QuestionResponse = {
	question: GraphQLQuestion | null;
};

export type GraphQLContext = { sessionId?: string };

export type GraphQLError = {
	message: string;
};

export type GraphQLSuccessResponse<T> = {
	data: T;
	errors?: never;
};

export type GraphQLErrorResponse = {
	data?: never;
	errors: GraphQLError[];
};

export type GraphQLResponse<T> = GraphQLSuccessResponse<T> | GraphQLErrorResponse;

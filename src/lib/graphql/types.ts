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

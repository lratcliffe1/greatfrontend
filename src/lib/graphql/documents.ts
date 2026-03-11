const QUESTION_FIELDS = /* GraphQL */ `
	id
	questionNumber
	slug
	title
	track
	category
	difficulty
	sourceUrl
	solutionType
	status
	summary
	cardSummary
	approach
	complexity
	tags
`;

export const QUESTIONS_QUERY = /* GraphQL */ `
	query GetQuestions($track: String!) {
		questions(track: $track) {
			${QUESTION_FIELDS}
		}
	}
`;

export const QUESTION_QUERY = /* GraphQL */ `
	query GetQuestion($track: String!, $slug: String!) {
		question(track: $track, slug: $slug) {
			${QUESTION_FIELDS}
		}
	}
`;

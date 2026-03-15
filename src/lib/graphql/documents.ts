export const TASKS_QUERY = /* GraphQL */ `
	query GetTasks {
		tasks {
			id
			label
		}
	}
`;

export const FEED_PAGE_QUERY = /* GraphQL */ `
	query GetFeedPage($cursor: String) {
		feedPage(cursor: $cursor) {
			posts {
				id
				author
				content
				imageUrl
				createdAt
				reactions {
					like
					haha
					wow
				}
				reactionByMe
			}
			nextCursor
		}
	}
`;

export const ADD_TASK_MUTATION = /* GraphQL */ `
	mutation AddTask($label: String!) {
		addTask(label: $label) {
			id
			label
		}
	}
`;

export const REMOVE_TASK_MUTATION = /* GraphQL */ `
	mutation RemoveTask($id: Int!) {
		removeTask(id: $id)
	}
`;

export const CLEAR_TASKS_MUTATION = /* GraphQL */ `
	mutation ClearTasks {
		clearTasks
	}
`;

export const CREATE_POST_MUTATION = /* GraphQL */ `
	mutation CreatePost($content: String, $imageUrl: String) {
		createPost(content: $content, imageUrl: $imageUrl) {
			id
			author
			content
			imageUrl
			createdAt
			reactions {
				like
				haha
				wow
			}
			reactionByMe
		}
	}
`;

export const REACT_TO_POST_MUTATION = /* GraphQL */ `
	mutation ReactToPost($postId: String!, $reaction: String) {
		reactToPost(postId: $postId, reaction: $reaction) {
			id
			reactions {
				like
				haha
				wow
			}
			reactionByMe
		}
	}
`;

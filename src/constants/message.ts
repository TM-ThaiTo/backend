export const DATABASE_MESSAGE = {
    CONNECT: '🌱 Connected to database successfully!',
    DISCONNECT: '⛔️ Disconnected from the database main successfully!'
}

export const STATUS_MESSAGE = {
    USER_MESSAGE: {
        ERROR: {
            USER_NOT_FOUND: "User not found",
            LIST_USER_NOT_FOUND: "List user not found"
        }
    },
    ACCOUNT_MESSAGE: {
        ERROR: {
            ACCOUNT_NOT_FOUND: "Account not found",
            LIST_ACCOUNT_NOT_FOUND: 'List Account not found',
            EMAIL_IS_EXIST: "Email is exist",
        }
    },
    POST_MESSAGE: {
        ERROR: {
            LIST_POST_NOT_FOUND: "List post not found",
            POST_NOT_FOUND: "Post not found",
            POST_NOT_OPEN_COMMENT: "Post not open comment"
        }
    },
    COMMENT_MESSAGE: {
        ERROR: {
            MISSING_VALUE_UPDATE_COMMENT: "Missing value update comment",
            MISSING_CONTENT_COMMENT: "Missing content for comment",
            PARENT_COMMENT_NOT_FOUND: "Parent comment not found",
            COMMENT_NOT_FOUND: "Comment not found",
        }
    },
    LIKE_MESSAGE: {
        ERROR: {
            MISSING_VALUE_LIKE_POST: 'Missing value like post',
            MISSING_VALUE_DELETE_LIKE_POST: 'Missing value delete like post',
            DONT_LIKE_POST: "Don't like post",
            TOOK_LIKE_POST: "Took action to like the post",

            MISSING_VALUE_LIKE_COMMENT: "Missing value like comment",
            TOOK_LIKE_COMMENT: "There are no likes for this comment",
            DONT_LIKE_COMMENT: "Don't like post",
        }
    },
    SUCCESS: { code: 0, message: "Success" }
}

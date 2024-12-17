const version = process.env.VERSION || '/api/v1'

const Routes = {
    AUTH: `${version}/auth`,
    ACCOUNT: `${version}/account`,

    USER: `${version}/user`,
    USERADMIN: `${version}/user/admin`,

    POST: `${version}/post`,

    USERCONVERSATION: `${version}/user-conversation`,
    CONVERSATION: `${version}/conversation`,
    ADMINCONVERSATION: `${version}/conversation/admin`,
    CONVERSATIONGROUP: `${version}/conversation-group`,
    MESSAGEGROUP: `${version}/message-group`,
    MESSAGE: `${version}/message`,
    ADMINMESSAGE: `${version}/message/admin`,
    COMMENT: `${version}/comment`,
    ADMINCOMMENT: `${version}/comment/admin`,

    HIDDENWORD: `${version}/hidden-words`,
    BLOCK: `${version}/block`,

}

export default Routes;
const { app } = require("../app");
const { app_server_ip, comment_server_port } = require("../../config/network");

const server = require("http").Server(app);
const io = require("socket.io")(server);

const name = "CommentSocket";

io.of("/socket/project/comment", socket => {
	const task_id = socket.handshake.query.task_id;

	socket.join(`project-${task_id}`, () => {
		//on joining a room
	});
});

//entirely client side
// const writeCommentEvent = (task_id) => {};

const newCommentEvent = (task_id, comment) => {
	delete comment.task_id;
	delete comment.created_at;

	//sending an event to everyone because the one who is going to
	//create the comment is not going to be subscribed to this event either way
	io.of("/socket/project/comment")
		.in(`project-${task_id}`)
		.emit("new-comment-event", { data: { comment: comment } });
};

const updateCommentEvent = (task_id, comment) => {
	delete comment.task_id;
	delete comment.created_at;

	io.of("/socket/project/comment")
		.in(`project-${task_id}`)
		.emit("update-comment-event", { data: { comment: comment } });
};

const getCommentSocket = (request, response) => {
	const task_id = request.body.task_id;

	response.status(200).send({
		data: {
			socket: `http://${app_server_ip}:${comment_server_port}/socket/project/comment?task_id=${task_id}`,
			onConnection: [],
			onDisconnect: [],
			events: [
				{
					"new-comment-event": {
						type: "emit",
						description: "emitted to everyone in the same task namespace when a comment is created",
						data: {
							comment: {
								_id: "uuid",
								body: "string",
								children: "array",
								author: "object",
								updated_at: "timestamp"
							}
						}
					}
				},
				{
					"update-comment-event": {
						type: "emit",
						description: "emitted to everyone in the same task namespace when a comment is updated",
						data: {
							comment: {
								_id: "uuid",
								body: "string",
								children: "array",
								author: "object",
								updated_at: "timestamp"
							}
						}
					}
				},
				{
					"write-comment-event": {
						type: "emit/listen",
						description: "emitted to everyone in the same task namespace when a new comment is being written",
						data: {
							user: {
								_id: "uuid",
								first_name: "string",
								last_name: "string",
								image: "string"
							},
							isWriting: "bool"
						}
					}
				}
			]
		}
	});
};

server.listen(comment_server_port);

module.exports = {
	name,
	newCommentEvent,
	updateCommentEvent,
	getCommentSocket
};

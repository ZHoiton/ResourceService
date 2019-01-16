const { app } = require("../app");
const { project_server_port } = require("../../config/ports");

const server = require("http").Server(app);
const io = require("socket.io")(server);

const name = "ProjectSocket";

io.of("/socket/project", socket => {
	const project_id = socket.handshake.query.project_id;

	socket.join(`project-${project_id}`, () => {
		//on joining a room
	});
});

const taskEvent = (project_id, task) => {
	//formating the object
	delete task.description;
	delete task.checklist;
	delete task.author;
	delete task.project_id;
	delete task.created_at;
	//sending an event to everyone because the one who is going to
	//edit the task is not going to be subscribed to this event either way
	io.of("/socket/project")
		.in(`project-${project_id}`)
		.emit("task-event", { data: { task: task } });
};

const getProjectSocket = (request, response) => {
	const project_id = request.body.project_id;

	response.status(200).send({
		data: {
			socket: `http://127.0.0.1:${project_server_port}/socket/project?project_id=${project_id}`,
			onConnection: [],
			onDisconnect: [],
			events: {
				"task-event": {
					type: "emit",
					description: "emitted to everyone in the same project namespace when a task is updated or created",
					data: {
						user: {
							_id: "uuid",
							state: "string",
							name: "string",
							labels: "array",
							deadline: "timestamp",
							assignees: "array",
							updated_at: "timestamp"
						}
					}
				}
			}
		}
	});
};

server.listen(project_server_port);

module.exports = {
	name,
	taskEvent,
	getProjectSocket
};

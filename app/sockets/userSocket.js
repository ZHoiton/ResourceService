const { app } = require("../app");
const { Connection } = require("../../db/connection");
const { app_server_ip, user_server_port } = require("../../config/network");

const server = require("http").Server(app);
const io = require("socket.io")(server);

const name = "UserSocket";

const getUserSocket = (request, response) => {
	const company_id = request.body.company_id;

	const user_id = request.body.user_id;

	response.status(200).send({
		data: {
			socket: `http://${app_server_ip}:${user_server_port}/socket/user?user_id=${user_id}&company_id=${company_id}`,
			onConnection: ["status-event"],
			onDisconnect: ["status-event"],
			events: [
				{
					"status-event": {
						type: "emit",
						description: "emitted to everyone in the same company namespace that a given user status has changed",
						data: { user: { _id: "uuid", status: "string" } }
					}
				}
			]
		}
	});
};

const updateUserStatus = (socket, user_id, company_id, status) => {
	const database = Connection.client.db("resources");

	database
		.collection("users")
		.findOneAndUpdate(
			{
				_id: user_id
			},
			{
				$set: {
					status: status,
					updated_at: new Date().getTime()
				}
			},
			{ returnOriginal: false, projection: { _id: 1, status: 1 } }
		)
		.then(result => {
			socket.to(`company-${company_id}`).emit("status-event", {
				data: { user: result.value }
			});
		})
		.catch(error => {
			console.log(error);
		});
};

io.of("/socket/user", socket => {
	const company_id = socket.handshake.query.company_id;

	const user_id = socket.handshake.query.user_id;

	//on connection to the socket, add the user to his company namespace/room
	socket.join(`company-${company_id}`, () => {
		updateUserStatus(socket, user_id, company_id, "online");
	});

	//the same as on connect but inverse
	socket.on("disconnect", () => {
		updateUserStatus(socket, user_id, company_id, "offline");
	});
});

server.listen(user_server_port);

module.exports = {
	name,
	getUserSocket
};

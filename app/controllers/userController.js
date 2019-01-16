const { Connection } = require("../../db/connection");
const uuidv1 = require("uuid/v1");
const { user_server_port } = require("../../config/app-ports");

const name = "UserController";

/**
 * starts a server and attaches all the event listeners to the socket
 * @param {HTTP Server} server
 */
const _init = server => {
	const user_io = require("socket.io")(server);

	userActivityListener(user_io);

	server.listen(user_server_port);
};

/**
 * implements all the logic for when a user comes online or offline
 * @param {WebSocket} io
 */
const userActivityListener = io => {
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
};

const getUserStatusSocket = (request, response) => {
	const company_id = request.body.company_id;

	const user_id = request.body.user_id;

	response.status(200).send({
		data: {
			socket: `http://127.0.0.1:${user_server_port}/socket/user?user_id=${user_id}&company_id=${company_id}`,
			onConnection: ["status-event"],
			onDisconnect: ["status-event"],
			events: {
				"status-event": {
					type: "emit",
					description: "emitted to everyone in the same company namespace that a given user status has changed",
					data: { user: { _id: "<uuid>", status: "<string>" } }
				}
			}
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

const addUser = (request, response) => {
	// Get the documents collection
	const database = Connection.client.db("resources");

	const time_stamp = new Date().getTime();

	const is_invited = JSON.parse(request.body.is_invited);

	database.collection("users").insertOne(
		{
			_id: uuidv1(),
			auth_id: request.body.auth_id,
			user: { image: "/default/user/image" },
			is_invited: is_invited,
			registration_step: 0,
			are_details_complete: false,
			status: "offline",
			company_id: request.body.company_id,
			created_at: time_stamp,
			updated_at: time_stamp
		},
		(error, result) => {
			if (error === null) {
				return response.sendStatus(204);
			} else {
				return response.sendStatus(500);
			}
		}
	);
};

const updateUserDetails = (request, response) => {
	const database = Connection.client.db("resources");

	const details = JSON.parse(request.body.details);

	database
		.collection("users")
		.findOneAndUpdate(
			{
				auth_id: request.body.auth_id
			},
			{
				$set: {
					user: details,
					registration_step: 1,
					updated_at: new Date().getTime()
				}
			},
			{ returnOriginal: false, projection: { auth_id: 0 } }
		)
		.then(result => {
			return response.status(200).send({
				data: { user: result.value }
			});
		})
		.catch(error => {
			return response.sendStatus(404);
		});
};

const getUser = (request, response) => {
	// Get the documents collection
	const database = Connection.client.db("resources");

	database
		.collection("users")
		.findOne(
			{
				auth_id: request.body.auth_id
			},
			{ projection: { created_at: 0, updated_at: 0 } }
		)
		.then(result => {
			if (result === null) {
				return response.sendStatus(404);
			}
			delete result.auth_id;
			return response.status(200).send({
				data: {
					user: result
				}
			});
		})
		.catch(error => {
			return response.sendStatus(500);
		});
};

const removeUser = (request, response) => {
	// Get the documents collection
	const database = Connection.client.db("resources");

	database
		.collection("users")
		.deleteOne({
			auth_id: request.body.auth_id
		})
		.then(result => {
			if (result.deletedCount > 0) {
				return response.sendStatus(204);
			}
			return response.sendStatus(404);
		})
		.catch(error => {
			return response.sendStatus(500);
		});
};

const updateUserImage = (request, response) => {
	// Get the documents collection
	const database = Connection.client.db("resources");

	database
		.collection("users")
		.findOneAndUpdate(
			{
				auth_id: request.body.auth_id
			},
			{
				$set: {
					"user.image": request.body.image,
					updated_at: new Date().getTime()
				}
			},
			{ returnOriginal: false, projection: { auth_id: 0 } }
		)
		.then(result => {
			if (result.lastErrorObject.updatedExisting) {
				return response.status(200).send({
					data: {
						user: result.value
					}
				});
			}
			return response.sendStatus(404);
		})
		.catch(error => {
			return response.sendStatus(500);
		});
};

const updateUserPosition = async (request, response) => {
	// Get the documents collection
	const database = Connection.client.db("resources");

	const position = JSON.parse(request.body.position);

	database
		.collection("users")
		.findOneAndUpdate(
			{
				auth_id: request.body.auth_id
			},
			{
				$set: {
					position: position,
					updated_at: new Date().getTime()
				}
			},
			{ returnOriginal: false, projection: { auth_id: 0 } }
		)
		.then(result => {
			if (result.lastErrorObject.updatedExisting) {
				return response.status(200).send({
					data: {
						user: result.value
					}
				});
			}
			return response.sendStatus(404);
		})
		.catch(error => {
			return response.sendStatus(500);
		});
};

module.exports = {
	name,
	_init,
	addUser,
	getUser,
	removeUser,
	updateUserImage,
	updateUserDetails,
	updateUserPosition,
	getUserStatusSocket
};

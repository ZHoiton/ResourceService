const { Connection } = require("../../db/connection");
const uuidv1 = require("uuid/v1");

const name = "UserController";

const addUser = (request, response) => {
	// Get the documents collection
	const database = Connection.client.db("resources");

	database.collection("users").insertOne(
		{
			_id: uuidv1(),
			auth_id: request.body.auth_id,
			// first_name: undefined,
			// last_name: undefined,
			// description: undefined,
			// position: undefined,
			image: "/default/user/image",
			is_invited: request.body.is_invited,
			registration_step: 0,
			are_details_complete: false,
			status: "OFFLINE",
			// settings: undefined,
			company_id: request.body.company_id,
			created_at: new Date(),
			updated_at: new Date()
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

const updateUserDetails = async (request, response) => {
	const database = Connection.client.db("resources");

	database
		.collection("users")
		.findOneAndUpdate(
			{
				auth_id: parseInt(request.body.auth_id)
			},
			{
				$set: {
					first_name: request.body.first_name,
					last_name: request.body.last_name,
					description: request.body.description,
					registration_step: 1,
					updated_at: new Date()
				}
			}
		)
		.then(result => {
			if (result.lastErrorObject.updatedExisting) {
				delete result.value.auth_id;
				return response.status(200).send({
					data: { user: result.value }
				});
			}
			return response.sendStatus(404);
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
		.findOne({
			auth_id: request.body.auth_id
		})
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
					image: request.body.auth_id,
					updated_at: new Date()
				}
			}
		)
		.then(result => {
			if (result.lastErrorObject.updatedExisting) {
				return response.sendStatus(204);
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

	const position = database.collection("positions").findOne({
		position_id: request.body.position_id
	});

	if ((await position) !== null) {
		database.collection("users").updateOne(
			{
				auth_id: request.body.auth_id
			},
			{
				$set: {
					position: { name: position.name },
					updated_at: new Date()
				}
			},
			(error, result) => {
				if (error === null) {
					return response.sendStatus(204);
				} else {
					return response.sendStatus(500);
				}
			}
		);
	} else {
		return response.sendStatus(404);
	}
};

const cleanUsers = (request, response) => {
	// Get the documents collection
	const database = Connection.client.db("resources");

	const clear = database.collection("users").remove({});
	
	return response.sendStatus(204);
};

module.exports = {
	name,
	addUser,
	getUser,
	removeUser,
	updateUserImage,
	updateUserDetails,
	updateUserPosition,
	cleanUsers
};

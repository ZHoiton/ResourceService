const { Connection } = require("../../db/connection");
const uuidv1 = require("uuid/v1");

const name = "UserController";

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
	addUser,
	getUser,
	removeUser,
	updateUserImage,
	updateUserDetails,
	updateUserPosition,
};

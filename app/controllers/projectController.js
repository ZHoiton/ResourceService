const { Connection } = require("../../db/connection");
const uuidv1 = require("uuid/v1");

name = "ProjectController";

const getProject = (request, response) => {
	const database = Connection.client.db("resources");

	database
		.collection("projects")
		.findOne({
			project_id: request.body.project_id
		})
		.then(result => {
			return response.status(200).send({
				result
			});
		})
		.catch(error => {
			return response.sendStatus(404);
		});
};

const createProject = (request, response) => {
	const database = Connection.client.db("resources");

	const created_at = new Date().getTime();

	const participants = JSON.parse(request.body.participants);

	database
		.collection("projects")
		.insertOne({
			_id: uuidv1(),
			company_id: request.body.company_id,
			name: request.body.name,
			description: request.body.description,
			participants: participants,
			updated_at: created_at,
			created_at: created_at
		})
		.then(result => {
			return response.status(200).send({
				data: result.ops[0]
			});
		})
		.catch(error => {
			return response.status(500).send({
				error: "when inserting in tasks"
			});
		});
};

const deleteProject = (request, response) => {
	const database = Connection.client.db("resources");

	database
		.collection("projects")
		.deleteOne({
			_id: request.body.project_id
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

const updateParticipants = (request, response) => {
	const database = Connection.client.db("resources");

	const participants = JSON.parse(request.body.participants);

	database
		.collection("projects")
		.findOneAndUpdate(
			{
				_id: request.body.project_id
			},
			{
				$set: {
					participants: participants,
					updated_at: new Date().getTime()
				}
			},
			{ returnOriginal: false }
		)
		.then(result => {
			return response.status(200).send({
				data: result.value
			});
		})
		.catch(error => {
			return response.status(404).send({
				error: "resource not found"
			});
		});
};

const addParticipants = (request, response) => {
	const database = Connection.client.db("resources");

	const participants = JSON.parse(request.body.participants);

	database
		.collection("projects")
		.findOneAndUpdate(
			{
				_id: request.body.project_id
			},
			{
				$set: {
					updated_at: new Date().getTime()
				},
				$push: { participants: { $each: participants } }
			},
			{ returnOriginal: false }
		)
		.then(result => {
			return response.status(200).send({
				data: result.value
			});
		})
		.catch(error => {
			return response.status(404).send({
				error: "resource not found"
			});
		});
};

const removeParticipants = (request, response) => {
	const database = Connection.client.db("resources");

	//participants should be an array of id
	const participant_id = JSON.parse(request.body.participants);

	database
		.collection("projects")
		.findOneAndUpdate(
			{
				_id: request.body.project_id
			},
			{
				$pull: { participants: { _id: { $in: participant_id } } }
			},
			{ returnOriginal: false }
		)
		.then(result => {
			return response.status(200).send({
				data: result.value
			});
		})
		.catch(error => {
			return response.status(404).send({
				error: "resource not found"
			});
		});
};

const updateDescription = (request, response) => {
	const database = Connection.client.db("resources");

	database
		.collection("projects")
		.findOneAndUpdate(
			{
				_id: request.body.project_id
			},
			{
				$set: {
					description: request.body.description,
					updated_at: new Date().getTime()
				}
			},
			{ returnOriginal: false }
		)
		.then(result => {
			return response.status(200).send({
				data: result.value
			});
		})
		.catch(error => {
			return response.status(404).send({
				error: "resource not found"
			});
		});
};

const getTasks = (request, response) => {
	const database = Connection.client.db("resources");

	database
		.collection("tasks")
		.find({
			project_id: request.body.project_id
		})
		.project({
			description: 0,
			checklist: 0,
			author: 0,
			project_id: 0,
			created_at: 0
		})
		.toArray(function(error, result) {
			if (error) {
				return response.sendStatus(404);
			} else {
				return response.status(200).send({
					result
				});
			}
		});
};

module.exports = {
	name,
	createProject,
	deleteProject,
	updateParticipants,
	updateDescription,
	getTasks,
	getProject,
	addParticipants,
	removeParticipants
};

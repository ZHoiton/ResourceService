const { Connection } = require("../../db/connection");
const uuidv1 = require("uuid/v1");

const name = "TaskController";

const createTask = (request, response) => {
	const database = Connection.client.db("resources");

	const created_at = new Date().getTime();

	const user = request.body.user !== undefined ? JSON.parse(request.body.user) : undefined;

	const checklist = request.body.checklist !== undefined ? JSON.parse(request.body.checklist) : undefined;

	const assignees = request.body.assignees !== undefined ? JSON.parse(request.body.assignees) : undefined;

	const labels = request.body.labels !== undefined ? JSON.parse(request.body.labels) : undefined;

	database
		.collection("tasks")
		.insertOne({
			_id: uuidv1(),
			name: request.body.name,
			description: request.body.description,
			deadline: request.body.deadline,
			checklist: checklist,
			assignees: assignees,
			labels: labels,
			state: "open",
			author: user,
			project_id: request.body.project_id,
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

const getTask = (request, response) => {
	const database = Connection.client.db("resources");

	database
		.collection("tasks")
		.findOne({
			_id: request.body.task_id
		})
		.then(result => {
			return response.status(200).send({
				data: result
			});
		})
		.catch(error => {
			return response.status(404).send({
				error: "resource not found"
			});
		});
};

const updateState = (request, response) => {
	const database = Connection.client.db("resources");

	database
		.collection("tasks")
		.findOneAndUpdate(
			{
				_id: request.body.task_id
			},
			{
				$set: {
					state: request.body.state,
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

const updateDeadline = (request, response) => {
	const database = Connection.client.db("resources");

	database
		.collection("tasks")
		.findOneAndUpdate(
			{
				_id: request.body.task_id
			},
			{
				$set: {
					deadline: request.body.deadline,
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

const updateAssignees = (request, response) => {
	const database = Connection.client.db("resources");

	const assignees = JSON.parse(request.body.assignees);

	database
		.collection("tasks")
		.findOneAndUpdate(
			{
				_id: request.body.task_id
			},
			{
				$set: {
					assignees: assignees,
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

const addAssignees = (request, response) => {
	const database = Connection.client.db("resources");

	const assignees = JSON.parse(request.body.assignees);

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
				$push: { assignees: { $each: assignees } }
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

const removeAssignees = (request, response) => {
	const database = Connection.client.db("resources");

	//assignees should be an array of id
	const assignees_id = JSON.parse(request.body.assignees);

	database
		.collection("projects")
		.findOneAndUpdate(
			{
				_id: request.body.project_id
			},
			{
				$pull: { assignees: { _id: { $in: assignees_id } } }
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

const updateLabels = (request, response) => {
	const database = Connection.client.db("resources");

	const labels = JSON.parse(request.body.labels);

	database
		.collection("tasks")
		.findOneAndUpdate(
			{
				_id: request.body.task_id
			},
			{
				$set: {
					labels: labels,
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

const updateDescription = (request, response) => {
	const database = Connection.client.db("resources");

	database
		.collection("tasks")
		.findOneAndUpdate(
			{
				_id: request.body.task_id
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

const updateTaskAuthor = (request, response) => {
	const database = Connection.client.db("resources");

	const user = JSON.parse(request.body.user);

	database
		.collection("tasks")
		.updateMany(
			{
				"author._id": user._id
			},
			{
				$set: {
					author: user,
					updated_at: new Date().getTime()
				}
			},
			{ returnOriginal: false }
		)
		.then(result => {
			return response.status(200).send({
				data: result.ops
			});
		})
		.catch(error => {
			return response.status(404).send({
				error: "resource not found"
			});
		});
};

const getComments = (request, response) => {
	const database = Connection.client.db("resources");

	database
		.collection("comments")
		.find({
			task_id: request.body.task_id
		})
		.toArray(function(error, result) {
			if (error) {
				return response.status(404).send({
					error: "resource not found"
				});
			} else {
				return response.status(200).send({
					result
				});
			}
		});
};

const createComment = (request, response) => {
	const database = Connection.client.db("resources");

	const comment_id = uuidv1();

	const created_at = new Date().getTime();

	const user = JSON.parse(request.body.user);

	database
		.collection("comments")
		.insertOne({
			_id: comment_id,
			task_id: request.body.task_id,
			body: request.body.body,
			children: [],
			author: user,
			updated_at: created_at,
			created_at: created_at
		})
		.then(result => {
			if (request.body.reply_to !== undefined) {
				database
					.collection("comments")
					.updateOne({ _id: request.body.reply_to }, { $: { children: comment_id } })
					.then(() => {
						result.ops[0]["parent"] = request.body.reply_to;
						return response.status(200).send({
							data: result.ops[0]
						});
					})
					.catch(error => {
						return response.status(500).send({
							error: "when creating a comment"
						});
					});
			} else {
				return response.status(200).send({
					data: result.ops[0]
				});
			}
		})
		.catch(error => {
			return response.status(500).send({
				error: "when creating a comment"
			});
		});
};

const updateCommentAuthor = (request, response) => {
	const database = Connection.client.db("resources");

	const user = JSON.parse(request.body.user);

	database
		.collection("comments")
		.updateMany(
			{
				"author._id": user._id
			},
			{
				$set: {
					author: user,
					updated_at: new Date().getTime()
				}
			},
			{ returnOriginal: false }
		)
		.then(result => {
			return response.status(204).send({});
		})
		.catch(error => {
			return response.status(404).send({
				error: "resource not found"
			});
		});
};

const updateCommentBody = (request, response) => {
	const database = Connection.client.db("resources");

	database
		.collection("comments")
		.updateOne(
			{ _id: request.body.comment_id },
			{
				$set: {
					body: request.body.body,
					updated_at: new Date().getTime()
				}
			}
		)
		.then(() => {
			return response.status(200).send({
				data: result.ops[0]
			});
		})
		.catch(error => {
			return response.status(500).send({
				error: "when updating a comment/body"
			});
		});
};

const deleteComment = (request, response) => {
	const database = Connection.client.db("resources");

	database
		.collection("comments")
		.updateOne(
			{ _id: request.body.comment_id },
			{
				$set: {
					body: "<comment deleted>",
					updated_at: new Date().getTime()
				}
			}
		)
		.then(() => {
			return response.status(200).send({
				data: result.ops[0]
			});
		})
		.catch(error => {
			return response.status(500).send({
				error: "when deleting a comment/body"
			});
		});
};

module.exports = {
	name,
	createTask,
	getTask,
	updateState,
	updateDeadline,
	updateAssignees,
	addAssignees,
	removeAssignees,
	updateLabels,
	updateDescription,
	updateTaskAuthor,
	getComments,
	createComment,
	updateCommentAuthor,
	updateCommentBody,
	deleteComment
};

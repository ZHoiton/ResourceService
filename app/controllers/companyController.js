const { Connection } = require("../../db/connection");
const uuidv1 = require("uuid/v1");

const name = "CompanyController";

const addCompany = (request, response) => {
	const database = Connection.client.db("resources");

	const company_id = uuidv1();

	//updating the user which created the company
	database
		.collection("users")
		.findOneAndUpdate(
			{
				auth_id: parseInt(request.body.auth_id)
			},
			{
				$set: {
					company_id: company_id,
					position: { name: "CEO" },
					registration_step: 2,
					are_details_complete: true,
					updated_at: new Date()
				}
			}
		)
		.then(user_update_result => {
			if (user_update_result.lastErrorObject.updatedExisting) {
				//if the user is updated, add the company
				database
					.collection("companies")
					.updateOne(
						{
							owner_id: user_update_result.value._id
						},
						{
							$setOnInsert: {
								_id: company_id,
								name: request.body.name,
								description: request.body.description,
								image: "image/default/company",
								created_at: new Date(),
								updated_at: new Date()
							}
						},
						{ upsert: true }
					)
					.then(company_result => {
						if (
							company_result.message.documents[0].upserted !==
							undefined
						) {
							//if company added, find if and return it to the user, 
							//for some reason the update does not return the updated row, only the id
							database
								.collection("companies")
								.findOne({
									company_id:
										company_result.message.documents[0]
											.upserted._id
								})
								.then(result => {
									return response.status(200).send({
										data: result
									});
								})
								.catch(error => {
									return response.sendStatus(404);
								});
						} else {
							return response.sendStatus(404);
						}
					})
					.catch(error => {
						console.log("error", error);
						return response.sendStatus(500);
					});

				// delete result.value.auth_id;
				// return response.status(200).send({
				// 	data: { user: result.value }
				// });
			} else {
				return response.sendStatus(404);
			}
		})
		.catch(error => {
			return response.sendStatus(500);
		});
};

const removeCompany = async (request, response) => {
	const database = Connection.client.db("resources");

	const user = database.collection("users").findOne({
		auth_id: request.body.auth_id
	});

	if ((await user) !== null) {
		if (
			user.permitions.rights.company === "ALL" ||
			user.permitions.rights.company === "DELETE"
		)
			database.collection("companies").deleteOne(
				{
					owner_id: request.body.auth_id,
					company_id: request.body.company_id
				},
				(error, result) => {
					if (error === null) {
						if (result.deletedCount > 0) {
							return response.sendStatus(204);
						}
						return response.sendStatus(404);
					} else {
						return response.sendStatus(500);
					}
				}
			);
	}
};

const updateCompany = (request, response) => {
	const database = Connection.client.db("resources");

	database.collection("companies").updateOne(
		{
			auth_id: request.body.auth_id
		},
		{
			$set: {
				image: request.body.auth_id,
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
};

const cleanCompanies = (request, response) => {
	// Get the documents collection
	const database = Connection.client.db("resources");

	const clear = database.collection("companies").deleteMany({});

	return response.sendStatus(204);
};

const getAllCompanies = async (request, response) => {
	// Get the documents collection
	const database = Connection.client.db("resources");

	database
		.collection("companies")
		.find({})
		.toArray(function(error, result) {
			if (error) {
				return response.sendStatus(500);
			} else {
				return response.status(200).send({
					result
				});
			}
		});
};

module.exports = {
	name,
	addCompany,
	removeCompany,
	updateCompany,
	cleanCompanies,
	getAllCompanies
};

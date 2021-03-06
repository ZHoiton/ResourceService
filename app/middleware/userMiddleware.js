const joi = require("joi");

const name = "UserMiddleware";

const addUser = (request, response, next) => {
	const schema = joi.object().keys({
		auth_id: joi
			.number()
			.integer()
			.required(),
		is_invited: joi.boolean().required(),
		company_id: joi.string().optional()
	});

	const result = joi.validate(request.body, schema, { abortEarly: false });

	if (result.error === null) {
		next();
	} else {
		response.status(400).send(result.error);
	}
};

const getUser = (request, response, next) => {
	const schema = joi.object().keys({
		auth_id: joi
			.number()
			.integer()
			.required()
	});

	const result = joi.validate(request.body, schema, { abortEarly: false });

	if (result.error === null) {
		next();
	} else {
		response.status(400).send(result.error);
	}
};

const removeUser = (request, response, next) => {
	const schema = joi.object().keys({
		auth_id: joi.string().required()
	});

	const result = joi.validate(request.body, schema, { abortEarly: false });

	if (result.error === null) {
		next();
	} else {
		response.status(400).send(result.error);
	}
};

const updateUserImage = (request, response, next) => {
	const schema = joi.object().keys({
		auth_id: joi.string().required(),
		image: joi.string().required()
	});

	const result = joi.validate(request.body, schema, { abortEarly: false });

	if (result.error === null) {
		next();
	} else {
		response.status(400).send(result.error);
	}
};

const updateUserDetails = (request, response, next) => {
	const schema = joi.object().keys({
		auth_id: joi.number().integer().required(),
		first_name: joi.string().required(),
		last_name: joi.string().required(),
		description: joi.string().optional()
	});

	const result = joi.validate(request.body, schema, { abortEarly: false });

	if (result.error === null) {
		next();
	} else {
		response.status(400).send(result.error);
	}
};

const updateUserPosition = (request, response, next) => {
	const schema = joi.object().keys({
		auth_id: joi.string().required(),
		position_id: joi.string().required()
	});

	const result = joi.validate(request.body, schema, { abortEarly: false });

	if (result.error === null) {
		next();
	} else {
		response.status(400).send(result.error);
	}
};

module.exports = {
	addUser,
	getUser,
	removeUser,
    updateUserImage,
    updateUserDetails,
	updateUserPosition,
	name
};

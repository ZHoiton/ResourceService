const joi = require("joi");

const name = "CompanyMiddleware";

const addCompany = (request, response, next) => {
    const schema = joi.object().keys({
        auth_id: joi.string().required(),
        name: joi.string().required(),
        location: joi.string()
    });

    const result = joi.validate(request.body, schema, { abortEarly: false });

    if (result.error === null) {
        next();
    } else {
        response.status(400).send(result.error);
    }
};

const removeCompany = (request, response, next) => {
    const schema = joi.object().keys({
        auth_id: joi.string().required(),
        company_id: joi.string().required()
    });

    const result = joi.validate(request.body, schema, { abortEarly: false });

    if (result.error === null) {
        next();
    } else {
        response.status(400).send(result.error);
    }
};

const updateCompany = (request, response, next) => {
    const schema = joi.object().keys({
        user_id: joi.string().required(),
        company_id: joi.string().required(),
        name: joi.string().required()
    });

    const result = joi.validate(request.body, schema, { abortEarly: false });

    if (result.error === null) {
        next();
    } else {
        response.status(400).send(result.error);
    }
};

module.exports = {
    name,
    addCompany,
    removeCompany,
    updateCompany
};

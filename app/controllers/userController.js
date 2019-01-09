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
            first_name: request.body.first_name,
            last_name: request.body.last_name,
            image: undefined,
            position: undefined,
            company_id: uuidv1(),
            created_at: new Date(),
            updated_at: new Date()
        },
        (error, result) => {
            if (error === null) {
                delete result.ops[0].auth_id;
                return response.status(200).send({
                    data: {
                        user: result.ops[0]
                    }
                });
            } else {
                return response.sendStatus(500);
            }
        }
    );
};

const getUser = (request, response) => {
    // Get the documents collection
    const database = Connection.client.db("resources");

    database.collection("users").findOne(
        {
            auth_id: request.body.auth_id
        },
        (error, result) => {
            if (error === null) {
                delete result.auth_id;
                return response.status(200).send({
                    data: {
                        user: result
                    }
                });
            } else {
                return response.sendStatus(500);
            }
        }
    );
};

const removeUser = (request, response) => {
    // Get the documents collection
    const database = Connection.client.db("resources");

    database.collection("users").deleteOne(
        {
            auth_id: request.body.auth_id
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
};

const updateUserImage = (request, response) => {
    // Get the documents collection
    const database = Connection.client.db("resources");

    database.collection("users").updateOne(
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

module.exports = { name, addUser, getUser, removeUser, updateUserImage, updateUserPosition };

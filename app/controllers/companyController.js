const { Connection } = require("../../db/connection");
const { commitWithRetry, runTransactionWithRetry } = require("../../db/transaction");
const uuidv1 = require("uuid/v1");

const name = "CompanyController";

const addCompany = (request, response) => {
    client.withSession(session => runTransactionWithRetry(transaction, Connection.client, session));
};

const removeCompany = async (request, response) => {
    const database = Connection.client.db("resources");

    const user = database.collection("users").findOne({
        auth_id: request.body.auth_id
    });

    if ((await user) !== null) {
        if (user.permitions.rights.company === "ALL" || user.permitions.rights.company === "DELETE")
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

const transaction = async (client, session) => {
    const database = client.db("resources");

    session.startTransaction({
        readConcern: { level: "snapshot" },
        writeConcern: { w: "majority" }
    });

    const company_id = uuidv1();

    const rights = {
        company: "ALL",
        tasks: "ALL",
        events: "ALL",
        projects: "ALL"
    };

    const position = database.collection("positions").insertOne(
        {
            _id: uuidv1(),
            name: "CEO",
            company_id: company_id,
            rights: rights
        },
        { session }
    );

    const company = database.collection("companies").insertOne(
        {
            _id: company_id,
            name: request.body.name,
            description: request.body.description,
            image: undefined,
            owner_id: request.body.auth_id,
            created_at: new Date(),
            updated_at: new Date()
        },
        { session }
    );

    const user = database.collection("users").updateOne(
        { auth_id: request.body.auth_id },
        {
            $set: {
                company_id: company_id,
                position: { name: "CEO", rights: rights }
            }
        },
        { session }
    );

    Promise.all([position, company, user]);

    try {
        await commitWithRetry(session);
    } catch (error) {
        await session.abortTransaction();
        throw error;
    }
};

module.exports = {
    name,
    addCompany,
    removeCompany,
    updateCompany
};

const MongoClient = require("mongodb").MongoClient;

class Connection {
    static connect() {
        if (this.client) {
            return Promise.resolve(this.client);
        }
        return MongoClient.connect(
            this.url,
            this.options
        ).then(client => {
            this.client = client;
            console.log("connected");
        });
    }
}

Connection.client = null;
Connection.url = "mongodb://127.0.0.1:27017";
Connection.options = {
    bufferMaxEntries: 0,
    reconnectTries: 5000,
    useNewUrlParser: true
};

module.exports = { Connection };

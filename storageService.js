require('dotenv').config();
const { MongoClient, ServerApiVersion } = require('mongodb');

class MongoStorage {
    constructor() {
        this.uri = process.env.MONGO_DB_URI;
        this.dbName = process.env.MONGO_DB_NAME;
        this.collectionName = process.env.MONGO_DB_COLLECTION || 'node-unknown';
        this.client = new MongoClient(this.uri, {
            serverApi: {
                version: ServerApiVersion.v1,
                strict: true,
                deprecationErrors: true,
            }
        });
        this.db = null;
        this.collection = null;
    }

    async connect() {
        if (!this.db) {
            await this.client.connect();
            this.db = this.client.db(this.dbName);
            this.collection = this.db.collection(this.collectionName);
            console.log("✅ MongoDB Connected Successfully!");
        }
    }

    async getData(key) {
        await this.connect();
        const doc = await this.collection.findOne({ _id: key });
        return doc ? doc.data : null;
    }

    async saveData(key, data) {
        await this.connect();
        await this.collection.updateOne({ _id: key }, { $set: { data } }, { upsert: true });
        console.log(`✅ Saved [${key}] to MongoDB`);
    }

    async deleteData(key) {
        await this.connect();
        await this.collection.deleteOne({ _id: key });
        console.log(`✅ Deleted [${key}] from MongoDB`);
    }
}

const storage = new MongoStorage();

module.exports = {
    init: async () => await storage.connect(),

    getCredentials: async () => await storage.getData("credentials") || {},
    saveCredentials: async (data) => await storage.saveData("credentials", data),

    getFlows: async () => await storage.getData("flows") || [],
    saveFlows: async (data) => await storage.saveData("flows", data),

    getSettings: async () => await storage.getData("settings") || {},
    saveSettings: async (data) => await storage.saveData("settings", data),

    getSessions: async () => await storage.getData("sessions") || {},
    saveSessions: async (data) => await storage.saveData("sessions", data),

    getLibraryEntry: async (type, path) => await storage.getData(`library_${type}_${path}`),
    saveLibraryEntry: async (type, path, meta, body) => await storage.saveData(`library_${type}_${path}`, { meta, body }),
};
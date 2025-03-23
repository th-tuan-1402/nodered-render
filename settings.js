require('dotenv').config();

const settings = {
    uiPort: process.env.PORT || 1880,
    flowFile: process.env.FLOW_FILE || 'flows.json',
    flowFilePretty: process.env.FLOW_FILE_PRETTY === 'true',

    adminAuth: {
       type: "credentials",
       users: [{
           username: process.env.ADMIN_USERNAME || "admin",
           password: process.env.ADMIN_PASSWORD_HASH || "",
           permissions: "*"
       }]
    },

    credentialSecret: process.env.CREDENTIAL_SECRET || false,

    logging: {
        console: {
            level: process.env.LOG_LEVEL || "info",
            metrics: false,
            audit: false
        }
    },

    mqttReconnectTime: parseInt(process.env.MQTT_RECONNECT_TIME, 10) || 15000,
    serialReconnectTime: parseInt(process.env.SERIAL_RECONNECT_TIME, 10) || 15000,

    runtimeState: {
        enabled: process.env.RUNTIME_STATE_ENABLED === 'true',
        ui: process.env.RUNTIME_STATE_UI === 'true',
    },

    externalModules: {
        autoInstall: true
    }
};

const cloudStorageEnabled = process.env.CLOUD_STORAGE_ENABLED === 'true';
if (cloudStorageEnabled) {
    const _axios = require('axios');
    let axios = _axios.create({
        baseURL: process.env.CLOUD_STORAGE_HOST,
        timeout: process.env.CLOUD_STORAGE_API_TIMEOUT || 60000,
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.CLOUD_STORAGE_API_TOKEN}`
        }
    });

    settings.storageModule = {
        init: async function(runtime) {
            console.log("Custom storage initialized");
        },
        getCredentials: async function() {
            try {
                const response = await axios.get(`/auth/login`);
                return response.data;
            } catch (error) {
                console.error(error);
                
                console.warn("API error, loading local credentials.js");
                return require("fs").existsSync("credentials.js")
                    ? require("fs").readFileSync("credentials.js")
                    : {};
            }
        },
        saveCredentials: async function(credentials) {
            try {
                console.warn('new credentials', credentials);
                await axios.post(`/auth/login`, credentials);
                console.log("Credentials saved to API");
            } catch (error) {
                console.error(error);
                require("fs").writeFileSync("credentials.js", credentials);
            }
        },
        getFlows: async function() {
            try {
                const response = await axios.get(`/flows`);
                return response.data;
            } catch (error) {
                console.error(error);
                
                console.warn("API error, loading local flows.json");
                return require("fs").existsSync("flows.json")
                    ? JSON.parse(require("fs").readFileSync("flows.json"))
                    : [];
            }
        },
        saveFlows: async function(flows) {
            try {
                console.warn('new flows', flows);
                await axios.post(`/flows`, flows);
                console.log("Flows saved to API");
            } catch (error) {
                console.error(error);
                
                console.warn("API error, saving locally");
                require("fs").writeFileSync("flows.json", JSON.stringify(flows, null, 2));
            }
        },
        getSettings: async function() {
            try {
                const response = await axios.get(`/settings`);
                return response.data;
            } catch (error) {
                console.error(error);
                console.warn("API error, loading local settings.js");
                return require("fs").existsSync("settings.js")
                    ? require("fs").readFileSync("settings.js")
                    : {};
            }
        },
        saveSettings: async function(settings) {
            try {
                console.warn('new settings', settings);
                await axios.post(`/settings`, settings);
                console.log("Settings saved to API");
            } catch (error) {
                console.error(error);
                require("fs").writeFileSync("settings.js", settings);
            }
        },
        getSessions: async function() {
            try {
                const response = await axios.get(`/sessions`);
                return response.data;
            } catch (error) {
                console.error(error);
                console.warn("API error, loading local sessions.js");
                return require("fs").existsSync("sessions.js")
                    ? require("fs").readFileSync("sessions.js")
                    : {};
            }
        },
        saveSessions: async function(sessions) {
            try {
                console.warn('new sessions', sessions);
                await axios.post(`/sessions`, sessions);
                console.log("Sessions saved to API");
            } catch (error) {
                console.error(error);
                require("fs").writeFileSync("sessions.js", sessions);
            }
        },
        getLibraryEntry: async function(type, path) {
            try {
                const response = await axios.get(`/library/${type}/${path}`);
                return response.data;
            } catch (error) {
                console.error(error);
                return null;
            }
        },
        saveLibraryEntry: async function(type, path, meta, body) {
            try {
                await axios.post(`/library/${type}/${path}`, {meta, body});
                console.log("Library entry saved to API");
            } catch (error) {
                console.error(error);
            }
        }
    }
};

module.exports = settings;
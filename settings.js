require('dotenv').config();
const axios = require('axios');

module.exports = {
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

    storageModule: {
        init: async function(runtime) {
            console.log("Custom storage initialized");
        },
        getCredentials: async function() {
            try {
                const response = await axios.get(`${process.env.BACKUP_CLOUD_HOST}/credentials`);
                return response.data;
            } catch (error) {
                console.error(error);
                
                console.warn("API error, loading local credentials.js");
                return require("fs").existsSync("credentials.js")
                    ? require("fs").readFileSync("credentials.js")
                    : {};
            }
        },
        getFlows: async function() {
            try {
                const response = await axios.get(`${process.env.BACKUP_CLOUD_HOST}/flows`);
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
                await axios.post(`${process.env.BACKUP_CLOUD_HOST}/flows`, flows);
                console.log("Flows saved to API");
            } catch (error) {
                console.error(error);
                
                console.warn("API error, saving locally");
                require("fs").writeFileSync("flows.json", JSON.stringify(flows, null, 2));
            }
        },
        getSettings: async function() {
            try {
                const response = await axios.get(`${process.env.BACKUP_CLOUD_HOST}/settings`);
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
                await axios.post(`${process.env.BACKUP_CLOUD_HOST}/settings`, settings);
                console.log("Settings saved to API");
            } catch (error) {
                console.error(error);
                require("fs").writeFileSync("settings.js", settings);
            }
        }
    },

    externalModules: {
        autoInstall: true
    }
};

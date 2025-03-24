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
    const storageModule = require('./storageService.js')
    settings.storageModule = storageModule
};

module.exports = settings;
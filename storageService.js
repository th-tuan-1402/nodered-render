require('dotenv').config();
const axios = require('axios');

let axiosInstance = axios.create({
    baseURL: process.env.CLOUD_STORAGE_HOST,
    timeout: process.env.CLOUD_STORAGE_API_TIMEOUT || 60000,
    headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.CLOUD_STORAGE_API_TOKEN}`
    }
});

storageModule = {
    init: async function(runtime) {
        console.log("Custom storage initialized");
    },
    getCredentials: async function() {
        try {
            const response = await axiosInstance.get(`/auth/login`);
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
            await axiosInstance.post(`/auth/login`, credentials);
            console.log("Credentials saved to API");
        } catch (error) {
            console.error(error);
            require("fs").writeFileSync("credentials.js", credentials);
        }
    },
    getFlows: async function() {
        try {
            const response = await axiosInstance.get(`/flows`);
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
            await axiosInstance.post(`/flows`, flows);
            console.log("Flows saved to API");
        } catch (error) {
            console.error(error);
            require("fs").writeFileSync("flows.json", JSON.stringify(flows, null, 2));
        }
    },
    getSettings: async function() {
        try {
            const response = await axiosInstance.get(`/settings`);
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
            await axiosInstance.post(`/settings`, settings);
            console.log("Settings saved to API");
        } catch (error) {
            console.error(error);
            require("fs").writeFileSync("settings.js", settings);
        }
    },
    getSessions: async function() {
        try {
            const response = await axiosInstance.get(`/sessions`);
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
            await axiosInstance.post(`/sessions`, sessions);
            console.log("Sessions saved to API");
        } catch (error) {
            console.error(error);
            require("fs").writeFileSync("sessions.js", sessions);
        }
    },
    getLibraryEntry: async function(type, path) {
        try {
            const response = await axiosInstance.get(`/library/${type}/${path}`);
            return response.data;
        } catch (error) {
            console.error(error);
            return null;
        }
    },
    saveLibraryEntry: async function(type, path, meta, body) {
        try {
            await axiosInstance.post(`/library/${type}/${path}`, {meta, body});
            console.log("Library entry saved to API");
        } catch (error) {
            console.error(error);
        }
    }
};

module.exports = storageModule;
'use strict';

import fs from 'fs';
import path from 'path';
import os from 'os';

// Global config directory
const CONFIG_DIR = path.join(os.homedir(), '.nexgit');
const CONFIG_FILE = path.join(CONFIG_DIR, 'config.json');

// Read config
function getConfig() {
    try {
        if (!fs.existsSync(CONFIG_FILE)) {
            return {};
        }
        const raw = fs.readFileSync(CONFIG_FILE, 'utf8');
        return JSON.parse(raw);
    } catch (error) {
        return {};
    }
}

// Write config
function setConfig(key, value) {
    try {
        if (!fs.existsSync(CONFIG_DIR)) {
            fs.mkdirSync(CONFIG_DIR, { recursive: true });
        }
        const existing = getConfig();
        existing[key] = value;
        fs.writeFileSync(CONFIG_FILE, JSON.stringify(existing, null, 2));
        return true;
    } catch (error) {
        return false;
    }
}

// Get specific key
function get(key) {
    const config = getConfig();
    return config[key] || null;
}

// Get language
function getLanguage() {
    return get('language') || 'english';
}

export default {
    get,
    set: setConfig,
    getLanguage,
    CONFIG_DIR,
    CONFIG_FILE
};
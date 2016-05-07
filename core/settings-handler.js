/** @module SettingsHandler */

/**
 * Handles settings. Shocker, I know.
 * @constructor
 */
var SettingsHandler = function () {
    /**
     * Settings container
     * @type {{}}
     */
    this.running = this.defaults;
    
    
    this.load();
};

SettingsHandler.prototype = {
    /** Default settings */
    defaults: {
        /**
         * Notification settings.
         * sound: [bool] Whether to play a sound
         * gm: [bool] Whether to show the Greasemonkey notification
         */
        notifications: {
            /** Global overrides */
            all: {
                sound: false,
                gm: false
            },
            /** Whisper notifcations */
            whisper: {
                sound: true,
                gm: true
            },
            construction: {
                sound: true,
                gm: true
            }
        },
        features: {
            house_timer: true
        }
    },
    /**
     * Save the settings
     */
    save: function () {
        GM_setValue("settings", JSON.stringify(this.running));
        console.info(GM_info.script.name + " settings saved.");
    },
    /**
     * Load the settings
     */
    load: function () {
        this.running = $.extend(true, this.defaults, JSON.parse(GM_getValue("settings") || "{}"));
        console.debug(GM_info.script.name + " settings loaded.");
    }
};

var exp = new SettingsHandler();

module.exports = exp;
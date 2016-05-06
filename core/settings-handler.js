module.exports = function ($, GM_getValue, GM_setValue, GMInfo_script, JSON, console) {
    /**
     * Handles settings. Shocker, I know.
     * @constructor
     */
    var SettingsHandler = function () {
        /** @type SettingsHandler.defaults */
        this.settings = this.defaults;
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
        save: function () {
            GM_setValue("settings", JSON.stringify(this.settings));
            console.info(GMInfo_script.name + " settings saved.");
        },
        load: function () {
            this.settings = $.extend(true, this.defaults, JSON.parse(GM_getValue("settings") || "{}"));
            console.debug(GMInfo_script.name + " settings loaded.");
        }
    };

    return new SettingsHandler();
};
/** @module HOUSE_NOTIFICATIONS */

module.exports = {
    name: "House notifications",
    desc: "Creates toast & sound notifications when house construction and/or Harvestron finish",
    id: "HOUSE_NOTIFICATIONS",
    dependencies: {
        fn: ["parseTimeStringLong", "gh_url", "notification"],
        classes: ["AloTimer", "Interval", "SFX"]
    },
    settings: {
        desc: {
            "Construction sound": "Play a sound when construction finishes",
            "Construction toast": "Display a toast when construction finishes"
        },
        defaults: {
            "Construction sound": true,
            "Construction toast": true
        },
        demo: {
            "Construction sound": function (e, $, module) {
                module.vars.sfx.play();
            },
            "Construction toast": function (e, $, module) {
                module.dependencies.fn.notification("Construction finished", module.spec.name);
            }
        }
    },
    funcs: {
        /**
         * Opens up the house UI
         */
        click_house: function () {
            document.getElementById("header_house").click();
        },
        /**
         * Send the notification
         * @param {!Module} module
         */
        notify: function (module) {
            if (!module.vars.notified) {
                console.info("Construction finished");
                if (module.settings["Construction sound"]) {
                    module.vars.sfx.play();
                }
                if (module.settings["Construction toast"]) {
                    module.dependencies.fn.notification("Construction finished", module.spec.name, {
                        onclick: module.spec.funcs.click_house
                    });
                }
            }
            module.vars.notified = true;
        }
    },
    /**
     * 
     * @param {*|jQuery|HTMLElement} $
     * @param {Module} module
     */
    load: function ($, module) {
        function refresh() {
            $.ajax("/house.php", {global: false}).done(function (r) {
                if (typeof(r.m) !== "undefined") {
                    handle_text(r.m);
                }
            });
        }

        /**
         * Handle our house info text
         * @param {!String} text The text
         */
        function handle_text(text) {
            var interval = new module.dependencies.classes.Interval(module.spec.name);
            interval.clear();

            if (text.indexOf("available again") !== -1) { // Working
                var timer = new module.dependencies.classes.AloTimer(module.dependencies.fn.parseTimeStringLong(text));
                interval.set(function () {
                    if (timer.isFinished()) {
                        interval.clear();
                        module.spec.funcs.notify(module);
                    } else {
                        module.vars.notified = false;
                    }
                }, 1000);
            } else if (text.indexOf("are available") !== -1) { // Available
                module.spec.funcs.notify(module);
            } else {
                setTimeout(refresh, 1000); // Fuck knows - try again.
            }
        }

        module.vars = {
            /**
             * Whether the last parsing resulted in a notification
             * @type {Boolean}
             */
            notified: false,
            /**
             * Handle a global AJAX request for a house state requery
             * @param {Event} evt The triggered event
             * @param {Spec.xhr} r Our response
             * @param {Object} opts Request options
             */
            house_requery: function (evt, r, opts) {
                if (opts.url.indexOf("house") !== -1 &&
                    typeof(r.responseJSON) !== "undefined" &&
                    typeof(r.responseJSON.m) !== "undefined") {

                    handle_text(r.responseJSON.m);
                }
            },
            /**
             * SFX player
             * @type classes.SFX
             */
            sfx: new module.dependencies.classes.SFX(
                module.dependencies.fn.gh_url("res/sfx/circ_saw.wav")
            )
        };

        $(document).ajaxComplete(module.vars.house_requery);
        refresh();
    },
    /**
     * @type Spec.Module.unload
     */
    unload: function ($, module) {
        $(document).unbind("ajaxComplete", module.vars.house_requery);
    }
};
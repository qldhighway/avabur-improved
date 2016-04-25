exec_module({
    name: "Construction notifications",
    desc: "Creates toast & sound notifications when house construction finishes",
    dependencies: {
        fn: ["parseTimeStringLong", "gh_url", "notification"],
        classes: ["AloTimer", "Interval", "SFX"]
    },
    settings: {
        desc: {
            Sound: "Play a sound when construction finishes",
            toast: "Display a toast when construction finishes"
        },
        defaults: {
            sound: true,
            toast: true
        }
    },
    funcs: {
        /**
         * Send the notification
         * @param {!Module} module
         */
        notify: function (module) {
            if (!module.vars.notified) {
                if (module.settings.sound) {
                    module.vars.sfx.play();
                }
                if (module.settings.toast) {
                    module.dependencies.fn.notification("Construction finished", {title: module.spec.name});
                }
            }
            module.vars.notified = true;
        },
        /**
         * Handle our house info text
         * @param {!String} text The text
         * @param {!Module} module Our module
         */
        handle_text: function (text, module) {
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
                setTimeout(refresh, 3000); // Fuck knows - try again.
            }
        }
    },
    /**
     * @type Spec.Module.load
     */
    load: function ($, module) {
        function refresh() {
            $.post("/house.php");
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

                    module.spec.vars.handle_text(r.responseJSON.m, module);
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
        $.ajax("/house.php", {global: false}).done(function (r) {
            if (typeof(r.m) !== "undefined") {
                module.spec.vars.handle_text(r.m, module);
            }
        });
    },
    /**
     * @type Spec.Module.unload
     */
    unload: function ($, module) {
        $(document).unbind("ajaxComplete", module.vars.house_requery);
    }
});
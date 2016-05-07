// ==UserScript==
// @name           AvI Script Engine
// @namespace      org.alorel.aviscriptengine
// @author         Alorel <a.molcanovas@gmail.com>
// @homepage       https://github.com/Alorel/avabur-improved
// @description    Some welcome additions to Avabur's UI choices
// @include        https://avabur.com/game.php
// @include        http://avabur.com/game.php
// @include        https://www.avabur.com/game.php
// @include        http://www.avabur.com/game.php
// @version        0.6.7
// @icon           https://cdn.rawgit.com/Alorel/avabur-improved/0.6.3/res/img/logo-16.png
// @icon64         https://cdn.rawgit.com/Alorel/avabur-improved/0.6.3/res/img/logo-64.png
// @run-at         document-end
// @grant          GM_getValue
// @grant          GM_setValue
// @grant          GM_deleteValue
// @grant          GM_notification
// @grant          GM_listValues
// @grant          GM_xmlhttpRequest
// @grant          GM_openInTab
// @grant          GM_getResourceText
// @connect        githubusercontent.com
// @connect        github.com
// @connect        self
// @require        https://cdn.rawgit.com/Alorel/alo-timer/1.1/src/alotimer.min.js
// @require        https://cdn.rawgit.com/Alorel/console-log-html/1.1/console-log-html.min.js

// @require        https://cdn.rawgit.com/Alorel/avabur-improved/1f878fbb282667124559b3b576882fd229d2cd81/external/jalc-1.0.1.min.js
// @require        https://cdn.rawgit.com/Alorel/avabur-improved/1f878fbb282667124559b3b576882fd229d2cd81/external/buzz-1.1.10.min.js
// @require        https://cdn.rawgit.com/Alorel/avabur-improved/1f878fbb282667124559b3b576882fd229d2cd81/external/tsorter.js
// @updateURL      https://raw.githubusercontent.com/Alorel/avabur-improved/develop/avabur-improved.meta.js
// @downloadURL    https://raw.githubusercontent.com/Alorel/avabur-improved/develop/avabur-improved.user.js

// @noframes
// ==/UserScript==

(/**
 * Main script
 * @param {sessionStorage} CACHE_STORAGE
 */
    function (CACHE_STORAGE) {
    'use strict';
    require('./core/log');

    var fn = require('./core/fn');

    const MODULES = require('./modules');

    var Settings = require('./core/settings-handler');

    /** Our persistent DOM stuff */
    var $DOM = {
        /** Game modals */
        modal: {
            /** The title for modal windows */
            modal_title: $("#modalTitle"),
            /** The script settings modal */
            script_settings: null
        }
    };

    /** @type CoreData */
    var DATA = require('./core/data');

    /** Misc variables */
    var VARS = {
        /** Whether the market was opened */
        market_was_opened: false
    };

    var SFX = {
        circ_saw: new buzz.sound(fn.gh_url("res/sfx/circ_saw.wav")),
        msg_ding: new buzz.sound(fn.gh_url("res/sfx/message_ding.wav"))
    };

    /** Collection of mutation observers the script uses */
    var OBSERVERS = {
        /** Makes sure the script settings modal doesn't get nasty with the other game modals */
        script_settings: new MutationObserver(function () {
                if (!$DOM.modal.script_settings.is(":visible")) {
                    $DOM.modal.script_settings.hide();
                }
            }
        ),
        chat_whispers: new MutationObserver(
            /** @param {MutationRecord[]} records */
            function (records) {
                var sound_on = Settings.running.notifications.all.sound && Settings.running.notifications.whisper.sound;
                var gm_on = Settings.running.notifications.all.gm && Settings.running.notifications.whisper.gm;

                if (sound_on || gm_on) {
                    for (var i = 0; i < records.length; i++) {
                        var addedNodes = records[i].addedNodes;
                        if (addedNodes.length) {
                            for (var j = 0; j < addedNodes.length; j++) {
                                var text = $(addedNodes[j]).text();
                                if (text.match(/^\[[0-9]+:[0-9]+:[0-9]+]\s*Whisper from/)) {
                                    if (gm_on) {
                                        fn.notification(text);
                                    }
                                    if (sound_on) {
                                        SFX.msg_ding.play();
                                    }
                                }
                            }
                        }
                    }
                }
            }
        )
    };

    var $HANDLERS = {
        click: {
            script_menu: function () {
                $DOM.modal.modal_title.text(GM_info.script.name + " " + GM_info.script.version);
                fn.openStdModal($DOM.modal.script_settings);
            },
            delegate_click: function () {
                $($(this).data("delegate-click")).click();
            }
        },
        change: {
            settings_notification: function () {
                var $this = $(this);
                Settings.running.notifications[$this.data("notification")][$this.data("type")] = $this.is(":checked");
                Settings.save();
            },
            settings_feature: function () {
                var $this = $(this);
                Settings.running.features[$this.data("feature")] = $this.is(":checked");
                Settings.save();
            },
            module_settings_select: function () {
                $("#module-settings-container").find(">[data-module='" + $(this).val() + "']").show().siblings().hide();
            }
        },
        each: {
            sorttable: function () {
                tsorter.create($(this)[0]);
            },
            settings_notification: function () {
                var $this = $(this);

                $this.prop("checked", Settings.running.notifications[$this.data("notification")][$this.data("type")]);
            },
            settings_features: function () {
                var $this = $(this);
                $this.prop("checked", Settings.running.features[$this.data("feature")]);
            }
        }
    };

    /**
     * @type {{SFX: classes.SFX, CssManager: classes.CssManager, AloTimer: AloTimer, Request: classes.Request, Interval: classes.Interval}}
     */
    var classes = {

        /**
         * A bridge for the sound effects library
         * @param {String} url SFX URL
         * @param {Object} [opts] additional options
         * @constructor
         */
        SFX: function (url, opts) {
            /**
             * The actual player
             * @private
             * @type {buzz.sound}
             */
            this.buzz = new buzz.sound(url, opts || {});
        },
        /**
         * Manages CSS rules
         * @constructor
         */
        CssManager: function () {
            this.cssString = "";
            this.$style = null;
        },

        /**
         * An advanced timer
         * @class AloTimer
         */
        AloTimer: AloTimer,

        /**
         * Represents an AJAX request to be used with cache
         * @param {String} url The URL we're calling
         * @param {Boolean|Number} cacheTime Cache time in hours or false if the request should not be cached
         * @param {Function} [errorCallback]  A custom error callback
         * @constructor
         */
        Request: function (url, cacheTime, errorCallback) {
            /** The URL we're calling */
            this.url = url;
            /** OnError callback */
            this.errorCallback = errorCallback || classes.Request.prototype.callbacks.error.generic;

            /**
             * How long the request should be cached for
             * @type {Boolean|Number}
             */
            this.cacheTime = cacheTime || false;
        },

        /**
         * Interval manager
         * @param {String} name Interval name/ID
         * @constructor
         */
        Interval: function (name) {
            /**
             * The interval name
             * @type {String}
             */
            this.name = name;
        }
    };

    //noinspection JSCheckFunctionSignatures
    classes.Request.prototype = {
        /** Ajax callbacks container */
        callbacks: {
            /** Error callbacks */
            error: {
                /** Generic error callback */
                generic: function (xhr, textStatus, errorThrown) {
                    fn.notification("[" + textStatus + "] " + xhr.responseText);
                    console.error({
                        xhr: xhr,
                        textStatus: textStatus,
                        errorThrown: errorThrown
                    });
                }
            }
        },

        /**
         * Make a GET request
         * @returns {*|jqXHR|XMLHTTPRequest|jQuery|$}
         */
        get: function () {
            return this._generic({
                method: "GET"
            });
        },

        /**
         * To be called internally to start the request
         * @param {Object} generated params generated by the get/post methods
         * @returns {jqXHR|XMLHTTPRequest|jQuery|$}
         * @private
         */
        _generic: function (generated) {
            var methodArgs = $.extend({
                url: this.url,
                error: this.errorCallback
            }, generated || {});

            if (this.cacheTime !== false && !isNaN(this.cacheTime)) {
                methodArgs.cacheTTL = this.cacheTime;
                methodArgs.localCache = CACHE_STORAGE;
            }

            return $.ajax(this.url, methodArgs);
        },

        /**
         * Make a POST request
         * @param {Object} data Post params
         * @returns {*|jqXHR|XMLHTTPRequest|jQuery|$}
         */
        post: function (data) {
            return this._generic({
                method: "POST",
                data: data
            });
        }
    };

    classes.SFX.prototype = {

        /**
         * Play the sound. Does nothing if the global sound switch is set to false.
         * @returns {classes.SFX}
         */
        play: function () {
            if (Settings.running.notifications.all.sound) {
                this.buzz.play();
            }

            return this;
        },
        /**
         * Stop playing the sound
         * @returns {classes.SFX}
         */
        stop: function () {
            this.buzz.stop();
            return this;
        }
    };

    //noinspection JSCheckFunctionSignatures
    classes.Interval.prototype = {
        _intervals: {},
        isRunning: function () {
            return typeof(classes.Interval.prototype._intervals[this.name]) !== "undefined";
        },
        clear: function () {
            if (this.isRunning()) {
                clearInterval(classes.Interval.prototype._intervals[this.name]);
                delete classes.Interval.prototype._intervals[this.name];
                return true;
            }

            return false;
        },
        set: function (callback, frequency) {
            this.clear();
            var interval = setInterval(callback, frequency);
            classes.Interval.prototype._intervals[this.name] = interval;

            return interval;
        }
    };


    classes.CssManager.prototype = {
        setRules: function (rules) {
            var generated = [];
            for (var selector in rules) {
                if (rules.hasOwnProperty(selector)) {
                    var selectorRules = [];

                    for (var cssProp in rules[selector]) {
                        if (rules[selector].hasOwnProperty(cssProp)) {
                            selectorRules.push(cssProp + ":" + rules[selector][cssProp]);
                        }
                    }

                    if (selectorRules.length) {
                        generated.push(selector + "{" + selectorRules.join(";") + "}");
                    }
                }
            }

            if (generated.length) {
                this.cssString = generated.join("");
            }

            return this;
        },
        addToDOM: function () {
            this.removeFromDOM();
            this.$style = $('<style>' + this.cssString + '</style>');
            $("head").append(this.$style);
            return this;
        },
        removeFromDOM: function () {
            if (this.$style) {
                this.$style.remove();
            }
            this.$style = null;
            return this;
        }
    };

    (function () {
        var ON_LOAD = {
            "Loading script CSS": function () {
                $("head").append('<style>' + require("./core/css") + '</style>');
            },

            "Configuring script modal": function () {
                $DOM.modal.script_settings = $(require('./core/html')['script-settings']);
                $("#modalContent").append($DOM.modal.script_settings);
                fn.tabify($DOM.modal.script_settings);

                $DOM.modal.script_settings.find('[data-setting="notifications"]')
                    .each($HANDLERS.each.settings_notification)
                    .change($HANDLERS.change.settings_notification);

                $DOM.modal.script_settings.find('[data-setting="features"]')
                    .each($HANDLERS.each.settings_features)
                    .change($HANDLERS.change.settings_feature);

                $("#avi-module-settings-select").change($HANDLERS.change.module_settings_select);

                OBSERVERS.script_settings.observe(document.getElementById("modalWrapper"), {attributes: true});
            },
            "Registering side menu entry": function () {
                var $helpSection = $("#helpSection"),
                    $menuLink = $('<a href="javascript:;"/>')
                        .html('<li class="active">' + GM_info.script.name + " " + GM_info.script.version + '</li>')
                        .click($HANDLERS.click.script_menu);

                $helpSection.append($menuLink);
                $("#navWrapper").css("padding-top", $menuLink.height()).find("ul");
            },
            "Starting whisper monitor": function () {
                OBSERVERS.chat_whispers.observe(document.getElementById("chatMessageList"), {
                    childList: true
                });
            }
        };
        var keys = Object.keys(ON_LOAD);
        for (var i = 0; i < keys.length; i++) {
            console.debug(keys[i]);
            ON_LOAD[keys[i]]();
            delete ON_LOAD[keys[i]];
        }
        fn.check_github_for_updates();
        (new classes.Interval("gh_update")).set(fn.check_github_for_updates, 60000);


        /**
         * Represents a module
         * @param {ModuleSpec} spec The module spec
         * @constructor
         */
        var Module = function (spec) {
            /**
             * The raw module spec
             * @type {ModuleSpec}
             */
            this.spec = spec;
            /**
             * Module name
             * @type {ModuleSpec.name}
             */
            this.name = spec.name || null;
            /**
             * Load function
             * @type {ModuleLoaderFunction}
             */
            this.load = spec.load || null;

            /**
             * Module dependencies
             * @type {{
                 *  fn: {},
                 *  classes:{}
                 * }}
             */
            this.dependencies = {};

            /**
             * Module unload function
             * @type {ModuleLoaderFunction}
             */
            this.unload = spec.unload || null;

            /**
             * The module ID
             * @type {ModuleSpec.id}
             */
            this.id = spec.id || null;

            /**
             * Whether the settings are correct
             * @type {Boolean}
             */
            this.ok = true;
            /**
             * Module variables
             * @type {Spec.Module.vars}
             */
            this.vars = {};
            /**
             * Module description
             * @type {ModuleSpec.desc}
             */
            this.desc = spec.desc || null;
            /**
             * Module settings
             * @type {ModuleSpec.settings}
             */
            this.settings = false;

            if (!this.name) {
                console.error("Unable to init an unnamed module");
                this.ok = false;
            } else if (this.load === false) {
                console.error("Unable to init module " + this.name + ": loader not present");
                this.ok = false;
            } else if (typeof(Module.prototype.loaded[this.name]) !== "undefined") {
                fn.notification("Cannot load module " + this.name + " again until it is unloaded!");
                console.warn("Cannot load module " + this.name + " again until it is unloaded!");
                this.ok = false;
            } else {
                if (typeof(spec.settings) !== "undefined") {
                    this.settings = $.extend(
                        spec.settings.defaults || {},
                        JSON.parse(GM_getValue("settings:" + this.name) || "{}")
                    );
                }
            }
        };
        Module.prototype = {
            /**
             * Loaded modules
             * @type Object
             */
            loaded: {},
            /**
             * Apply the global handlers to the given context
             * @param {$|jQuery} [$context=$(document)] The context
             * @returns {Module} this
             */
            applyGlobalHandlers: function ($context) {
                $context = $context || $(document);

                $context.find(".avi-tip:not(.avi-d)").addClass("avi-d").tooltip({
                    container: "body",
                    viewport: {"selector": "body", "padding": 0}
                });
                $context.find("[data-delegate-click]").unbind("click", $HANDLERS.click.delegate_click).click($HANDLERS.click.delegate_click);
                $context.find("table.sortable:not(.avi-d)").addClass("avi-d").each($HANDLERS.each.sorttable);

                return this;
            },
            /**
             * Resolve module dependencies
             * @returns {Module} this
             * @private
             */
            resolveDependencies: function () {
                var dependencyKeys = Object.keys(this.spec.dependencies);
                if (dependencyKeys.length) {
                    for (var keyIndex = 0; keyIndex < dependencyKeys.length; keyIndex++) {
                        var dependencyCategory = this.spec.dependencies[dependencyKeys[keyIndex]], i;

                        switch (dependencyKeys[keyIndex]) {
                            case "fn":
                                this.dependencies.fn = {};
                                for (i = 0; i < dependencyCategory.length; i++) {
                                    if (typeof(fn[dependencyCategory[i]]) !== "undefined") {
                                        this.dependencies.fn[dependencyCategory[i]] = fn[dependencyCategory[i]];
                                    } else {
                                        console.error("Failed to load functional dependency " + dependencyCategory[i] + " for module " + this.name + ": no match.");
                                        this.ok = false;
                                    }
                                }
                                break;
                            case "classes":
                                this.dependencies.classes = {};
                                for (i = 0; i < dependencyCategory.length; i++) {
                                    if (typeof(classes[dependencyCategory[i]]) !== "undefined") {
                                        this.dependencies.classes[dependencyCategory[i]] = classes[dependencyCategory[i]];
                                    } else {
                                        console.error("Failed to load class dependency " + dependencyCategory[i] + " for module " + this.name + ": no match");
                                        this.ok = false;
                                    }
                                }
                                break;
                            case "vars":
                                this.dependencies.vars = {};
                                for (i = 0; i < dependencyCategory.length; i++) {
                                    if (typeof(classes[dependencyCategory[i]]) !== "undefined") {
                                        this.dependencies.vars[dependencyCategory[i]] = VARS[dependencyCategory[i]];
                                    } else {
                                        console.error("Failed to load variable dependency " + dependencyCategory[i] + " for module " + this.name + ": no match");
                                        this.ok = false;
                                    }
                                }
                                break;
                            default:
                                console.error("Failed to load dependency category " + dependencyKeys[keyIndex] + " of module " + this.name + ": unknown category");
                                this.ok = false;
                        }
                    }
                }
                return this;
            },

            /**
             * Saves the settings to disk
             * @returns {Module} this
             */
            saveSettings: function () {
                if (this.settings !== false) {
                    GM_setValue("settings:" + this.name, JSON.stringify(this.settings));
                }
                return this;
            },

            /**
             * Creates the settings UI for the module
             * @returns {Module} this
             * @private
             */
            createSettingsUI: function () {
                if (this.ok && this.settings !== false) {
                    var $select = $("#avi-module-settings-select"),
                        dis = this,
                        $container = $("#module-settings-container"),
                        $div = $('<div data-module="' + this.name + '" style="display:none"/>'),
                        $tbody = $('<tbody/>'),
                        has_desc = typeof(this.spec.settings.desc) === "object",
                        has_demo = typeof(this.spec.settings.demo) === "object",
                        $onChange = function () {
                            var $this = $(this),
                                setting = $this.attr("data-mod-setting"),
                                type = $this.attr("type"),
                                val;

                            switch (type) {
                                case "checkbox":
                                    val = $this.is(":checked");
                                    break;
                                default:
                                    val = $this.val();
                            }

                            dis.settings[setting] = val;
                            dis.saveSettings();
                        };

                    for (var key in this.settings) {
                        if (this.settings.hasOwnProperty(key)) {
                            var $tr = $("<tr/>"),
                                $valTd,
                                $demoTd;

                            switch (typeof(this.settings[key])) {
                                case "boolean":
                                    $valTd = $('<input type="checkbox"' + (this.settings[key] ? "checked" : "") + '/>');
                                    break;
                                default:
                                    console.error("Failed to create setting UI for module " + this.name +
                                        ' variable ' + key + ': the value type ' + this.settings[key] + ' is not supported');
                                    continue;
                            }

                            if (has_demo && typeof(this.spec.settings.demo[key]) === "function") {
                                const c_key = key;
                                $demoTd = $('<td/>').html(
                                    $('<a href="javascript:;">Demo</a>').click(function (evt) {
                                        dis.spec.settings.demo[c_key](evt, $, dis)
                                    })
                                );
                            } else {
                                $demoTd = '<td></td>';
                            }

                            $valTd.attr({
                                "data-mod-setting": key
                            }).on("change keyup", $onChange);

                            $tr.append(
                                '<td>' + key + '</td>',
                                $('<td/>').html($valTd),
                                '<td>' + (has_desc && typeof(this.spec.settings.desc[key]) === "string" ? this.spec.settings.desc[key] : "") + '</td>',
                                $demoTd
                            );

                            $tbody.append($tr);
                        }
                    }

                    $div.html(
                        $('<table class="table table-condensed table-bordered avi sortable"/>').append(
                            '<thead><tr><th>Feature</th><th>Setting</th><th>Description</th><th>Demo</th></tr></thead>',
                            $tbody
                        )
                    );
                    $container.append($div);

                    $select.append('<option value="' + this.name + '">' + this.name + '</option>');
                    fn.sortSelect($select[0]);
                    $select.find(">option:first").prop("selected", true);
                    $select.change();

                    console.dir({
                        divHTML: $div.html(),
                        $container: $container,
                        $select: $select
                    });
                    this.applyGlobalHandlers($div);
                }
                return this;
            },
            /**
             * Removes the settings UI
             * @returns {Module} this
             * @private
             */
            removeSettingsUI: function () {
                var $sel = $("#avi-module-settings-select");
                $sel.find('>[value=""]').remove();

                $("#module-settings-container").find(">div[data-module='']").remove();

                $sel.find(">option:first").prop("selected", true);
                $sel.change();

                return this;
            },
            /**
             * Registers the module
             * @returns {Module} this
             */
            register: function () {
                if (!this.id || Object.keys(Module.prototype.loaded).indexOf(this.id) !== -1) {
                    console.error("Cannot load module " + this.name + ': ID collision (' + this.id + ')')
                } else {
                    this.resolveDependencies();
                    if (this.ok && this.load) {
                        this.load($, this);
                        this.createSettingsUI().applyGlobalHandlers();
                        Module.prototype.loaded[this.id] = this;
                        console.debug("Loaded module " + this.name);
                    } else {
                        console.error("Failed to load module " + this.name);
                    }
                }

                return this;
            },
            /**
             * Unregisters the module
             * @returns {Module} this
             */
            unregister: function () {
                this.removeSettingsUI();
                delete Module.prototype.loaded[this.id];
                console.debug("Module " + this.name + " unloaded");
                if (this.unload) {
                    this.unload($, this);
                } else {
                    fn.notification("Module " + this.name + " unloaded. Due to this module's specifics you'll need to reload the page to see the effects.");
                }

                return this;
            }
        };
        Module.prototype.applyGlobalHandlers();

        for (var module in MODULES) {
            if (MODULES.hasOwnProperty(module)) {
                (new Module(MODULES[module])).register();
            }
        }
    })();
})(sessionStorage);
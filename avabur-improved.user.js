(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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

var is_dev = true,
    dev_hash = "1f878fbb282667124559b3b576882fd229d2cd81";
(/**
 *
 * @param $
 * @param CACHE_STORAGE
 * @param MutationObserver
 * @param buzz
 * @param AloTimer
 * @param ConsoleLogHTML
 * @param {console} console
 * @param HTMLSelectElement
 * @param {Function} require Require a module
 * @param {GM_info.script} GMInfo_script
 * @param {GM_getValue} GM_getValue x
 * @param GM_setValue
 * @param {JSON} JSON
 */
    function ($, CACHE_STORAGE, MutationObserver, buzz, AloTimer, ConsoleLogHTML, console, HTMLSelectElement, require, GMInfo_script, GM_getValue, GM_setValue, JSON) {
    'use strict';
    var fn = {
        /**
         * Flash an element once
         * @param {*|jQuery|HTMLElement} $element The element
         * @returns {*|jQuery|HTMLElement} the element
         */
        flash_once: function ($element) {
            $element.removeClass("avi-flash-once");
            setTimeout(function () {
                $element.addClass("avi-flash-once");
            }, 10);
            return $element;
        }
    };

    //node dependencies
    var FastSet = require('collections/fast-set');

    require('./core/log')($, console, MutationObserver, ConsoleLogHTML, FastSet, fn.flash_once, GMInfo_script.name);

    const MODULES = require('./modules');
    /**
     * The URL where we check for updates. This is different from @updateURL because we want it to come through
     * as a regular page load, not a request to the raw file
     */
    var UPDATE_URL = "https://github.com/Alorel/avabur-improved/blob/master/avabur-improved.user.js";

    /////////////////////////////////////////////////////
    // This is the script code. Don't change it unless //
    // you know what you're doing ;)                   //
    /////////////////////////////////////////////////////


    /** @var SettingsHandler */
    var Settings = require('./core/settings-handler')($, GM_getValue, GM_setValue, GMInfo_script, JSON, console);

    /** Our persistent DOM stuff */
    var $DOM = {
        /** Game modals */
        modal: {
            /** The outer wrapper */
            modal_wrapper: $("#modalWrapper"),
            /** The faded background for modals */
            modal_background: $("#modalBackground"),
            /** The title for modal windows */
            modal_title: $("#modalTitle"),
            /** The script settings modal */
            script_settings: null
        },
        /** Market DOM */
        market: {
            /** The market tabs */
            navlinks: $("#marketTypeSelector").find("a")
        }
    };

    /** Misc variables */
    var VARS = {
        /** Whether the market was opened */
        market_was_opened: false,
        /** A mapping of tradeskill ingredient names to their IDs */
        tradeskill_mats: {
            "Aberration Mind Source": 0,
            "Animal Eye": 10,
            "Animal Tongue": 11,
            "Animal Tooth": 12,
            "Animal Wing": 13,
            "Beast Fur": 20,
            "Beast Limb": 21,
            "Beast Tooth": 22,
            "Beast Wing": 23,
            "Bird Nest": 122,
            "Chunk of Coal": 130,
            "Chunk of Graphite": 132,
            "Construct Power": 30,
            "Copper Ore": 133,
            "Dragon Eye": 40,
            "Dragon Scale": 41,
            "Dragon Tail": 42,
            "Elemental Energy": 50,
            "Fish Fin": 112,
            "Golden Apple": 121,
            "Honeycomb": 123,
            "Humanoid Bone": 60,
            "Humanoid Flesh": 61,
            "Humanoid Limb": 62,
            "Lucky Coin": 141,
            "Magical Stone": 140,
            "Octopus Ink": 110,
            "Ooze Gel": 70,
            "Plant Branch": 80,
            "Plant Leaf": 81,
            "Plant Root": 82,
            "Plant Vine": 83,
            "Protection Stone": 142,
            "Rainbow Shard": 131,
            "Rune Stone": 143,
            "Serpent Eye": 90,
            "Serpent Tail": 91,
            "Serpent Tongue": 92,
            "Squid Tentacle": 113,
            "Turtle Shell": 111,
            "Vermin Eye": 100,
            "Vermin Tooth": 101,
            "Yellow Pollen": 120
        }
    };

    /** Misc function container */
    fn = $.extend(fn, {

        /**
         * Sort a Select element
         * @param {HTMLSelectElement} select The element to sort
         * @param {Number} [startAt=0] The first item index to sort
         */
        sortSelect: function (select, startAt) {
            if (select instanceof HTMLSelectElement) {
                if (typeof startAt === "undefined") {
                    startAt = 0;
                }

                var texts = [];

                for (var i = startAt; i < select.length; i++) {
                    texts[i] = [
                        select.options[i].text.toUpperCase(),
                        select.options[i].text,
                        select.options[i].value
                    ].join('|');
                }

                texts.sort();

                texts.forEach(function (text, index) {
                    var parts = text.split('|');

                    select.options[startAt + index].text = parts[1];
                    select.options[startAt + index].value = parts[2];
                });
            }
        },

        /**
         * Parses the long variation of the time string
         * @param {String} str The time string
         * @returns {Number} The time in ms representing this duration
         */
        parseTimeStringLong: function (str) {
            var time = 0;
            var match = str.match(/([0-9]+\s+(hours?|minutes?|seconds?))/g);

            for (var i = 0; i < match.length; i++) {
                var currentMatch = match[i].toLowerCase();
                var number = currentMatch.match(/[0-9]+/);
                var multiplier;
                if (currentMatch.indexOf("hour") !== -1) {
                    multiplier = 3600000;
                } else if (currentMatch.indexOf("minute") !== -1) {
                    multiplier = 60000;
                } else {
                    multiplier = 1000;
                }

                time += parseInt(number) * multiplier;
            }

            return time;
        },
        /**
         * Checks GitHub for script updates
         */
        check_github_for_updates: function () {
            GM_xmlhttpRequest({
                method: "GET",
                url: UPDATE_URL,
                onload: function (r) {
                    var theirVersion = r.responseText.match(/\/\/\s+@version\s+([^\n<>]+)/)[1];
                    if (fn.versionCompare(GMInfo_script.version, theirVersion) < 0) {
                        fn.notification('A new version of ' + GMInfo_script.name + ' is available! Click your ' +
                            'Greasemonkey/Tampermonkey icon, select "Check for updates" and reload the page in a few seconds.');
                    }
                }
            });
        },
        /**
         * Inserts inline SVG by AJAXing its URL
         * @param {$|jQuery} $this The element to insert the SVG into
         * @param {String} url The URL of the SVG file
         * @returns {$|jQuery} $el
         */
        svg: function ($this, url) {
            $this.html('<img src="' + fn.gh_url("res/img/ajax-loader.gif") + '" alt="Loading"/>');
            $.get(url).done(function (r) {
                $this.html($(r).find("svg"));
            });
            return $this;
        },
        /**
         * Creates a floaty notification
         * @param {String} text Text to display
         * @param {String} [title=GM_info.script.name] The notification title
         * @param {Object} [options={}] Overrides as shown here: https://tampermonkey.net/documentation.php#GM_notification
         */
        notification: function (text, title, options) {
            if (Settings.settings.notifications.all.gm) {
                GM_notification($.extend({
                    text: text,
                    title: title || GMInfo_script.name,
                    highlight: true,
                    timeout: 5000
                }, options || {}));
            }
        },
        /**
         * Opens the market
         * @param {String} type The top category name
         */
        openMarket: function (type) {
            var doOpen = function () {
                $DOM.market.navlinks.removeClass("active")
                    .filter("a:contains('" + type + "')").addClass("active").click();
            };
            if (VARS.market_was_opened) {
                fn.openStdModal("#marketWrapper");
                doOpen();
            } else {
                var $document = $(document);

                var $openCategory = function (evt, xhr, opts) {
                    if (opts.url === "market.php") {
                        $document.unbind("ajaxComplete", $openCategory);
                        VARS.market_was_opened = true;
                        doOpen();
                    }
                };

                $document.ajaxComplete($openCategory);
                $("#viewMarket").click();
            }
        },
        /**
         * Analyses the price array
         * @param {Object} arr The price array from the market
         * @returns {{low: Number, high: Number, avg:Number}}
         */
        analysePrice: function (arr) {
            var ret = {
                low: arr[0].price,
                high: arr[arr.length - 1].price
            };
            ret.avg = Math.round((parseFloat(ret.low) + parseFloat(ret.high)) / 2);
            return ret;
        },
        /**
         * Turns a raw GitHub URL into a CDN one
         * @param {String} path Path to the file
         * @param {String} [author=Alorel] The repository admin
         * @param {String} [repo=avabur-improved] The repository
         * @returns {String} The created URL
         */
        gh_url: function (path, author, repo) {
            author = author || "Alorel";
            repo = repo || "avabur-improved";

            return "https://cdn.rawgit.com/" + author + "/" + repo + "/" +
                (is_dev ? dev_hash : GMInfo_script.version) + "/" + path;
        },
        /**
         * Tabifies the div
         * @param {jQuery|$|HTMLElement|*} $container The div to tabify
         * @returns {*|jQuery|HTMLElement} $container
         */
        tabify: function ($container) {
            var $nav = $container.find(">nav>*"),
                $tabs = $container.find(">div>*"),
                $activeNav = $nav.filter(".active");

            $nav.click(function () {
                var $this = $(this);
                $tabs.filter("[data-menu='" + $this.attr("data-menu") + "']").show().siblings().hide();
                $this.addClass("active").siblings().removeClass("active");
            });

            ($activeNav.length ? $activeNav : $nav).first().click();

            return $container;
        },
        /**
         * Puts commas in large numbers
         * @param {Object|String} x The number
         * @returns {String}
         */
        numberWithCommas: function (x) {
            return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        },
        /**
         * Toggles the visibility CSS attribute of the element
         * @param {*|jQuery|HTMLElement} $el The element
         * @param {Boolean} shouldBeVisible Whether the element should be visible
         */
        toggleVisibility: function ($el, shouldBeVisible) {
            $el.css("visibility", shouldBeVisible ? "visible" : "hidden");
        },
        /**
         * Opens one of the standard modals
         * @param {String|HTMLElement|jQuery|$} item The modal to open, or its selector
         * @returns {*|jQuery|HTMLElement} The modal
         */
        openStdModal: function (item) {
            var $el;
            if (item instanceof $) {
                $el = item;
            } else if (item instanceof HTMLElement || typeof(item) === "string") {
                $el = $(item);
            } else {
                console.error("Failed to open modal: Invalid selector as shown below");
                console.error(item);
                return false;
            }

            $el.show().siblings().hide();
            $DOM.modal.modal_background.fadeIn();
            $DOM.modal.modal_wrapper.fadeIn();

            return $el;
        },
        /**
         * Compares the two versions
         * @param {String} v1 The first version
         * @param {String} v2 The second version
         * @param {{lexicographical:Boolean,zeroExtend:Boolean}} [options] Options
         * @return
         * 0 if the versions are equal
         * a negative integer iff v1 &lt; v2
         * a positive integer iff v1 &gt; v2
         * NaN if either version string is in the wrong format
         */
        versionCompare: function (v1, v2, options) {
            var lexicographical = options && options.lexicographical,
                zeroExtend = options && options.zeroExtend,
                v1parts = v1.split('.'),
                v2parts = v2.split('.');

            function isValidPart(x) {
                return (lexicographical ? /^\d+[A-Za-z]*$/ : /^\d+$/).test(x);
            }

            if (!v1parts.every(isValidPart) || !v2parts.every(isValidPart)) {
                return NaN;
            }

            if (zeroExtend) {
                while (v1parts.length < v2parts.length) v1parts.push("0");
                while (v2parts.length < v1parts.length) v2parts.push("0");
            }

            if (!lexicographical) {
                v1parts = v1parts.map(Number);
                v2parts = v2parts.map(Number);
            }

            for (var i = 0; i < v1parts.length; ++i) {
                if (v2parts.length == i) {
                    return 1;
                }

                if (v1parts[i] == v2parts[i]) {

                }
                else if (v1parts[i] > v2parts[i]) {
                    return 1;
                }
                else {
                    return -1;
                }
            }

            if (v1parts.length != v2parts.length) {
                return -1;
            }

            return 0;
        }
    });

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
                var sound_on = Settings.settings.notifications.all.sound && Settings.settings.notifications.whisper.sound;
                var gm_on = Settings.settings.notifications.all.gm && Settings.settings.notifications.whisper.gm;

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
                $DOM.modal.modal_title.text(GMInfo_script.name + " " + GMInfo_script.version);
                fn.openStdModal($DOM.modal.script_settings);
            },
            delegate_click: function () {
                $($(this).data("delegate-click")).click();
            }
        },
        change: {
            settings_notification: function () {
                var $this = $(this);
                Settings.settings.notifications[$this.data("notification")][$this.data("type")] = $this.is(":checked");
                Settings.save();
            },
            settings_feature: function () {
                var $this = $(this);
                Settings.settings.features[$this.data("feature")] = $this.is(":checked");
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

                $this.prop("checked", Settings.settings.notifications[$this.data("notification")][$this.data("type")]);
            },
            settings_features: function () {
                var $this = $(this);
                $this.prop("checked", Settings.settings.features[$this.data("feature")]);
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
            if (Settings.settings.notifications.all.sound) {
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

                OBSERVERS.script_settings.observe($DOM.modal.modal_wrapper[0], {attributes: true});
            },
            "Registering side menu entry": function () {
                var $helpSection = $("#helpSection"),
                    $menuLink = $('<a href="javascript:;"/>')
                        .html('<li class="active">' + GMInfo_script.name + " " + GMInfo_script.version + '</li>')
                        .click($HANDLERS.click.script_menu);

                $helpSection.append($menuLink);
                $("#navWrapper").css("padding-top", $menuLink.height()).find("ul");
            },
            "Starting whisper monitor": function () {
                OBSERVERS.chat_whispers.observe(document.querySelector("#chatMessageList"), {
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
})(jQuery, sessionStorage, MutationObserver, buzz, AloTimer, ConsoleLogHTML, console, HTMLSelectElement, require, GM_info.script, GM_getValue, GM_setValue, JSON);
},{"./core/css":2,"./core/html":3,"./core/log":4,"./core/settings-handler":5,"./modules":6,"collections/fast-set":8}],2:[function(require,module,exports){
module.exports=".avi-margin-auto,table.avi{margin-left:auto;margin-right:auto}.avi-highlight{animation:pulsate-inner 0.5s infinite alternate}.avi-italic{font-style:italic}.avi-flash-once{animation:pulsate-inner 0.15s 2 alternate}.avi-force-hide{display:none !important}.avi-force-block{display:block !important}.avi-table{display:table}.avi-table>*{display:table-row}.avi-table>*>*{display:table-cell;padding:2px}.avi-link{text-decoration:underline;cursor:pointer}.avi-tip{border-bottom:1px dotted}.avi-menu-shortcut{line-height:initial !important}.avi-menu-shortcut>svg{border:1px solid;padding:2px;width:24px;height:24px}table.avi{border-collapse:collapse;font-size:small;font-weight:normal;width:auto}table.avi>thead>tr>*,table.avi>tbody>tr>*{border:1px solid;padding:2px;text-align:center}ul.avi{list-style:none;-webkit-margin-before:0;-webkit-margin-after:0;-webkit-margin-start:0;-webkit-margin-end:0;-webkit-padding-start:0}.bold{font-weight:bold}.toast-item-close{cursor:pointer}.toast-item p{margin-right:25px}.popover{background-color:rgba(0,0,0,0.8);max-width:initial !important}.popover>.arrow{display:none}.avi-menu{text-align:center}.avi-menu>:not(:last-child){margin-right:5px}.avi-menu a{display:inline-block !important;width:auto}table.sortable th{cursor:pointer}table.sortable th.descend:after{content:\" \\25B4\" !important}table.sortable th.ascend:after{content:\" \\25BE\" !important}table.sortable th:not(.descent):not(.ascend):after{content:\" \\25B4\\25BE\"}#viewedClanDescription{min-height:148px}.materials{color:#DA8300}.fragments{color:#BB51D4}.avi-log-btn{padding:2px;position:fixed;left:0;bottom:0}.avi-log-btn .badge{padding:3px 3px;margin-left:2px}.avi-txt-debug{color:#0AD !important}.avi-txt-info{color:#00B000 !important}.avi-txt-warn{color:#EEE600 !important}.avi-txt-error{color:#C81423 !important}";
},{}],3:[function(require,module,exports){
module.exports={"script-settings":"<div style=\"display:none\"> <nav class=\"center\"> <a href=\"javascript:;\" data-menu=\"modules\"> <button class=\"btn btn-primary\">Modules</button> </a> <a href=\"javascript:;\" data-menu=\"global-settings\"> <button class=\"btn btn-primary\">Global settings</button> </a> <a href=\"javascript:;\" data-menu=\"module-settings\"> <button class=\"btn btn-primary\">Module settings</button> </a> <a href=\"javascript:;\" data-menu=\"about\"> <button class=\"btn btn-primary\">About</button> </a> </nav> <div class=\"mt10\"> <div data-menu=\"modules\"> <table class=\"table table-condensed table-bordered avi\"> <thead> <th>Name</th> <th>Description</th> <th> <span>Unloadable</span> <sup title=\"An unloadable module can be turned off at runtime without having to refresh the page\" class=\"avi-tip\">?</sup> </th> </thead> <tbody> </tbody> </table> </div> <div data-menu=\"module-settings\"> <select id=\"avi-module-settings-select\" style=\"margin:auto;display:block\"></select> <div id=\"module-settings-container\" class=\"mt10\"></div> </div> <div data-menu=\"global-settings\"> <table class=\"table table-condensed table-bordered avi\"> <thead> <tr> <th>Feature</th> <th>Setting</th> <th>Description</th> </tr> </thead> <tbody id=\"avi-settings\"> <tr> <td>Enable sound</td> <td> <input type=\"checkbox\" data-setting=\"notifications\" data-notification=\"all\" data-type=\"sound\"> </td> <td> No sounds will play if you untick this </td> </tr> <tr> <td>Enable toasts</td> <td> <input type=\"checkbox\" data-setting=\"notifications\" data-notification=\"all\" data-type=\"gm\"> </td> <td> No toasts will display if you untick this </td> </tr> </tbody> </table> </div> <div data-menu=\"about\"> <div class=\"avi-table avi-margin-auto\"> <div> <span>Author:</span> <a href=\"javascript:;\" class=\"profileLink\">Alorel</a> </div> <div> <span>Resources:</span> <div> <ul class=\"avi\"> <li><a href=\"https://github.com/Alorel/avabur-improved\" target=\"_blank\">Homepage</a></li> <li> <a href=\"https://github.com/Alorel/avabur-improved/issues\" target=\"_blank\"> Bugs and suggestions </a> </li> <li> <a href=\"https://github.com/Alorel/avabur-improved/releases\" target=\"_blank\"> Changelog </a> </li> <li> <a href=\"http://avabur.boards.net/thread/881\" target=\"_blank\">Forum thread</a> </li> </ul> </div> </div> </div> </div> </div> </div>"};
},{}],4:[function(require,module,exports){
/** @module CoreLog */

/**
 * Test
 * @param $
 * @param console
 * @param MutationObserver
 * @param ConsoleLogHTML
 * @param FastSet
 * @param flash_once
 * @param scriptName
 */
module.exports = function ($, console, MutationObserver, ConsoleLogHTML, FastSet, flash_once, scriptName) {
    var clear = function () {
            console.clear();
            console.debug("Console cleared");
        },
        height = "250px",
        baseSpan = $("<span class='badge'>0</span>"),
        levels = {
            log: baseSpan.clone(),
            debug: baseSpan.clone().addClass("avi-txt-debug"),
            info: baseSpan.clone().addClass("avi-txt-info"),
            warn: baseSpan.clone().addClass("avi-txt-warn"),
            error: baseSpan.clone().addClass("avi-txt-error")
        },
        ul = $("<ul class='avi' style='width:100%;overflow-y:auto;max-height:" + height + "'/>"),
        $title = $('<div/>')
            .append(
                '<span style="float:left">' + scriptName + ' log</span>',
                $('<a href="javascript:;" style="float:right">Clear</a>'),
                '<div style="clear:both"></div>'
            ),
        container = $("<div/>").append(ul),
        forEachBadges = function (lvl) {
            flash_once(levels[lvl]);
        },
        btn = $('<button class="btn btn-default avi-log-btn">Log</button>')
            .append(levels.log, levels.debug, levels.info, levels.warn, levels.error)
            .popover({
                title: $title,
                html: true,
                trigger: "click",
                container: "body",
                viewport: {"selector": "body", "padding": 0},
                template: '<div class="popover col-lg-5 col-xs-12 col-sm-9 col-md-7" role="tooltip" style="min-height:' + height + '"><div class="arrow"></div><h3 class="popover-title"></h3><div class="popover-content"></div></div>',
                placement: "auto top",
                content: container
            }).on("hidden.bs.popover", function () {
                ul.find(">.avi-italic").removeClass("avi-italic");
            }).on("shown.bs.popover", function () {
                $("#" + $(this).attr("aria-describedby")).find(">.popover-title a").click(clear);
            });

    $("body").append(btn);
    ConsoleLogHTML.connect(ul, {
        error: "avi-txt-error",
        warn: "avi-txt-warn",
        info: "avi-txt-info",
        debug: "avi-txt-debug"
    }, true, false);

    (new MutationObserver(
        /**
         * @param {MutationRecord[]} records
         */
        function (records) {
            var badgesToFlash = new FastSet();

            for (var record = 0; record < records.length; record++) {
                var mutantNode, logLevel;
                if (records[record].addedNodes.length) {
                    for (mutantNode = 0; mutantNode < records[record].addedNodes.length; mutantNode++) {
                        logLevel = $(records[record].addedNodes[mutantNode]).addClass("avi-italic small").attr("data-level");

                        badgesToFlash.add(logLevel);
                        levels[logLevel].text(parseInt(levels[logLevel].text()) + 1)
                    }
                }
                if (records[record].removedNodes.length) {
                    for (mutantNode = 0; mutantNode < records[record].removedNodes.length; mutantNode++) {
                        logLevel = $(records[record].removedNodes[mutantNode]).attr("data-level");
                        badgesToFlash.add(logLevel);
                        levels[logLevel].text(parseInt(levels[logLevel].text()) - 1);
                    }
                }
            }
            badgesToFlash.forEach(forEachBadges);
        })).observe(ul[0], {childList: true});
};
},{}],5:[function(require,module,exports){
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
},{}],6:[function(require,module,exports){
module.exports={"ACTIVITY_SHORTCUTS":{name:"Activity Shortcuts",desc:"Registers activity shortcuts on the side menu",id:"ACTIVITY_SHORTCUTS",dependencies:{fn:["gh_url","svg"]},vars:{appends:[["sword-clash","MobList","Open Battles"],["fishing","Fishing","Open Fishing"],["log","Woodcutting","Open Woodcutting"],["metal-bar","Mining","Open Mining"],["stone-block","#loadStonecutting","Open Stonecutting"]]},load:function(e,n){var s,t=n.spec.vars,i=e("<a href='javascript:;' class='avi-tip avi-menu-shortcut' style='border-bottom:none'/>"),a=e("#navWrapper").find("ul");n.vars.li=e('<li class="avi-menu"/>');for(var o=0;o<t.appends.length;o++)s=i.clone().attr({"data-delegate-click":"#load"+t.appends[o][1],title:t.appends[o][2]}),n.vars.li.append(s),n.dependencies.fn.svg(s,n.dependencies.fn.gh_url("res/svg/"+t.appends[o][0]+".svg"));a.append(n.vars.li)},unload:function(e,n){n.vars.li.remove()}},"HOUSE_NOTIFICATIONS":{name:"House notifications",desc:"Creates toast & sound notifications when house construction and/or Harvestron finish",id:"HOUSE_NOTIFICATIONS",dependencies:{fn:["parseTimeStringLong","gh_url","notification"],classes:["AloTimer","Interval","SFX"]},settings:{desc:{"Construction sound":"Play a sound when construction finishes","Construction toast":"Display a toast when construction finishes"},defaults:{"Construction sound":!0,"Construction toast":!0},demo:{"Construction sound":function(n,e,s){s.vars.sfx.play()},"Construction toast":function(n,e,s){s.dependencies.fn.notification("Construction finished",s.spec.name)}}},funcs:{click_house:function(){document.getElementById("header_house").click()},notify:function(n){n.vars.notified||(console.info("Construction finished"),n.settings["Construction sound"]&&n.vars.sfx.play(),n.settings["Construction toast"]&&n.dependencies.fn.notification("Construction finished",n.spec.name,{onclick:n.spec.funcs.click_house})),n.vars.notified=!0}},load:function(n,e){function s(){n.ajax("/house.php",{global:!1}).done(function(n){"undefined"!=typeof n.m&&o(n.m)})}function o(n){var o=new e.dependencies.classes.Interval(e.spec.name);if(o.clear(),-1!==n.indexOf("available again")){var i=new e.dependencies.classes.AloTimer(e.dependencies.fn.parseTimeStringLong(n));o.set(function(){i.isFinished()?(o.clear(),e.spec.funcs.notify(e)):e.vars.notified=!1},1e3)}else-1!==n.indexOf("are available")?e.spec.funcs.notify(e):setTimeout(s,1e3)}e.vars={notified:!1,house_requery:function(n,e,s){-1!==s.url.indexOf("house")&&"undefined"!=typeof e.responseJSON&&"undefined"!=typeof e.responseJSON.m&&o(e.responseJSON.m)},sfx:new e.dependencies.classes.SFX(e.dependencies.fn.gh_url("res/sfx/circ_saw.wav"))},n(document).ajaxComplete(e.vars.house_requery),s()},unload:function(n,e){n(document).unbind("ajaxComplete",e.vars.house_requery)}},"HOUSE_TIMERS":{name:"House timers",desc:"Shows house construction timers without the need for an alarm clock",id:"HOUSE_TIMERS",dependencies:{fn:["parseTimeStringLong"],classes:["AloTimer","CssManager","Interval"]},load:function(e,a){function n(){e.ajax("/house.php",{global:!1}).done(function(e){"undefined"!=typeof e.m&&o(e.m)})}function s(s){s.clear(),a.vars.paneSpan.addClass("avi-highlight").html(e('<span data-delegate-click="#header_house" style="cursor:pointer;text-decoration:underline;padding-right:5px">Ready!</span>')).append(e("<a href='javascript:;'>(refresh)</a>").click(n)),a.applyGlobalHandlers(a.vars.paneSpan)}function o(e){var o=new a.dependencies.classes.Interval(a.spec.name);if(o.clear(),-1!==e.indexOf("available again")){var r=new a.dependencies.classes.AloTimer(a.dependencies.fn.parseTimeStringLong(e));o.set(function(){r.isFinished()?s(o):a.vars.paneSpan.removeClass("avi-highlight").text(r.toString())},1e3)}else-1!==e.indexOf("are available")?s(o):setTimeout(n,3e3)}var r=e("<div class='col-xs-6 col-md-12'/>");a.vars={paneLabel:r.clone().addClass("col-lg-5 gold").text("Construction:"),paneSpan:e("<span>House unavailable</span>"),house_requery:function(e,a,n){-1!==n.url.indexOf("house")&&"undefined"!=typeof a.responseJSON&&"undefined"!=typeof a.responseJSON.m&&o(a.responseJSON.m)},css:(new a.dependencies.classes.CssManager).setRules({"#constructionNotifier,#houseTimerTable [data-typeid='Construction']":{display:"none !important"}}).addToDOM()},a.vars.paneSpanContainer=r.clone().addClass("col-lg-7").html(a.vars.paneSpan),e("#houseTimerInfo").addClass("avi-force-block"),e("#houseTimerTable").prepend(a.vars.paneLabel,a.vars.paneSpanContainer),e(document).ajaxComplete(a.vars.house_requery),e.ajax("/house.php",{global:!1}).done(function(e){"undefined"!=typeof e.m&&o(e.m)})},unload:function(e,a){a.vars.paneLabel.remove(),a.vars.paneSpanContainer.remove(),a.vars.css.removeFromDOM(),e(document).unbind("ajaxComplete",a.vars.house_requery),e("#houseTimerInfo").removeClass("avi-force-block"),new a.dependencies.classes.Interval(a.spec.name).clear()}},"MARKET_TOOLTIPS":{name:"Market tooltips",desc:"Performs a market price lookup when you hover a supported item",id:"MARKET_TOOLTIPS",dependencies:{fn:["analysePrice","numberWithCommas","openMarket"],classes:["Request"]},vars:{CACHE_TTL:1/3600*60,html:'<table class="avi" style="margin:auto"><thead><tr><th colspan="3">Current market price (1st page)</th></tr><tr><th>Low</th><th>Average</th><th>High</th></tr></thead><tbody><tr data-id="prices"><td></td><td></td><td></td></tr></tbody></table>'},load:function(e,r){function t(e){var t=r.dependencies.fn.analysePrice(e.l);r.vars.dom.low_currency.text(r.dependencies.fn.numberWithCommas(t.low)),r.vars.dom.avg_currency.text(r.dependencies.fn.numberWithCommas(t.avg)),r.vars.dom.high_currency.text(r.dependencies.fn.numberWithCommas(t.high))}function n(){d.click(),r.dependencies.fn.openMarket("Ingredients")}function s(){const t=e(this),n=t.text().trim();"undefined"==typeof r.spec.vars.tradeskill_mats[n]?fn.notification("Failed to lookup "+n+": ID not found"):new r.dependencies.classes.Request("/market.php",r.spec.vars.CACHE_TTL).post({type:"ingredient",page:0,q:0,ll:0,hl:0,st:r.spec.vars.tradeskill_mats[n]}).done(function(n){const s=t.attr("aria-describedby"),a=e("#"+s);if(s&&a.length){const o=r.dependencies.fn.analysePrice(n.l),c=a.find("tr[data-id=prices]>td");c.first().text(r.dependencies.fn.numberWithCommas(o.low)).next().text(r.dependencies.fn.numberWithCommas(o.avg)).next().text(r.dependencies.fn.numberWithCommas(o.high))}})}function a(){const t=e(this),a=t.text().trim(),o=e("<span>"+a+"</span>");t.html(o),o.popover({title:a,html:!0,trigger:"hover",container:"body",viewport:{selector:"body",padding:0},placement:"auto right",content:e(r.spec.vars.html)}),o.mouseenter(s).css("cursor","pointer").click(n)}var o,c=e("#currencyTooltipMarketable"),i=e("#currencyTooltip"),d=e("#modalBackground");r.vars={dom:{},clickies:e("#allThemTables").find(".currencyWithTooltip:not(:contains(Gold))"),click:{currency:function(){const t=e(this).find(">td:first").text().trim();r.dependencies.fn.openMarket(t.substring(0,t.length-1))}},observers:{currency_tooltips:new MutationObserver(function(e){if(e.length&&c.is(":visible")){const n=c.attr("class"),s=n.replace("crystals","premium").replace("materials","weapon_scraps").replace("fragments","gem_fragments");r.vars.dom.row_currency.attr("class",n),"gold"===n?o.text("N/A"):(o.text(" "),new r.dependencies.classes.Request("/market.php",r.spec.vars.CACHE_TTL).post({type:"currency",page:0,st:s}).done(t))}}),inventory_table:new MutationObserver(function(r){for(var t=0;t<r.length;t++)if(r[t].addedNodes.length){for(var n=0;n<r[t].addedNodes.length;n++)if(r[t].addedNodes[n]instanceof HTMLTableSectionElement){const s=e(r[t].addedNodes[n]);s.find("th:contains(Ingredient)").length&&s.find(">tr>[data-th=Item]").each(a);break}break}})}},r.vars.clickies.css("cursor","pointer").click(r.vars.click.currency),r.vars.dom.table_currency=e(r.spec.vars.html),r.vars.dom.row_currency=r.vars.dom.table_currency.find("tr[data-id=prices]"),o=r.vars.dom.row_currency.find(">td"),r.vars.dom.low_currency=o.first(),r.vars.dom.avg_currency=r.vars.dom.low_currency.next(),r.vars.dom.high_currency=r.vars.dom.avg_currency.next(),i.append(r.vars.dom.table_currency),r.vars.observers.currency_tooltips.observe(i[0],{attributes:!0}),r.vars.observers.inventory_table.observe(document.querySelector("#inventoryTable"),{attributes:!0,childList:!0,characterData:!0})},unload:function(e,r){if(r.vars.clickies.css("cursor","initial").unbind("click",r.vars.click.currency),"undefined"!=typeof r.vars.dom)for(var t in r.vars.dom)r.vars.dom.hasOwnProperty(t)&&(r.vars.dom[t].remove(),delete r.vars.dom[t]);if("undefined"!=typeof r.vars.observers)for(var n in r.vars.observers)r.vars.observers.hasOwnProperty(n)&&r.vars.observers[n].disconnect()}}}
},{}],7:[function(require,module,exports){
"use strict";

var Shim = require("./shim");
var GenericCollection = require("./generic-collection");
var GenericMap = require("./generic-map");
var PropertyChanges = require("./listen/property-changes");

// Burgled from https://github.com/domenic/dict

module.exports = Dict;
function Dict(values, getDefault) {
    if (!(this instanceof Dict)) {
        return new Dict(values, getDefault);
    }
    getDefault = getDefault || Function.noop;
    this.getDefault = getDefault;
    this.store = Object.create(null);
    this.length = 0;
    this.addEach(values);
}

Dict.Dict = Dict; // hack so require("dict").Dict will work in MontageJS.

Object.addEach(Dict.prototype, GenericCollection.prototype);
Object.addEach(Dict.prototype, GenericMap.prototype);
Object.addEach(Dict.prototype, PropertyChanges.prototype);

Dict.prototype.constructClone = function (values) {
    return new this.constructor(values, this.getDefault);
};

Dict.prototype.assertString = function (key) {
    if (typeof key !== "string") {
        throw new TypeError("key must be a string but Got " + key);
    }
}

Object.defineProperty(Dict.prototype,"$__proto__",{writable:true});
Object.defineProperty(Dict.prototype,"_hasProto",{
    get:function() {
        return this.hasOwnProperty("$__proto__") && typeof this._protoValue !== "undefined";
    }
});
Object.defineProperty(Dict.prototype,"_protoValue",{
    get:function() {
        return this["$__proto__"];
    },
    set: function(value) {
        this["$__proto__"] = value;
    }
});

Dict.prototype.get = function (key, defaultValue) {
    this.assertString(key);
    if (key === "__proto__") {
        if (this._hasProto) {
            return this._protoValue;
        } else if (arguments.length > 1) {
            return defaultValue;
        } else {
            return this.getDefault(key);
        }
    }
    else {
        if (key in this.store) {
            return this.store[key];
        } else if (arguments.length > 1) {
            return defaultValue;
        } else {
            return this.getDefault(key);
        }
    }
};

Dict.prototype.set = function (key, value) {
    this.assertString(key);
    var isProtoKey = (key === "__proto__");
    
    if (isProtoKey ? this._hasProto : key in this.store) { // update
        if (this.dispatchesMapChanges) {
            this.dispatchBeforeMapChange(key, isProtoKey ? this._protoValue : this.store[key]);
        }
        
        isProtoKey
            ? this._protoValue = value
            : this.store[key] = value;
        
        if (this.dispatchesMapChanges) {
            this.dispatchMapChange(key, value);
        }
        return false;
    } else { // create
        if (this.dispatchesMapChanges) {
            this.dispatchBeforeMapChange(key, undefined);
        }
        this.length++;

        isProtoKey
            ? this._protoValue = value
            : this.store[key] = value;

        if (this.dispatchesMapChanges) {
            this.dispatchMapChange(key, value);
        }
        return true;
    }
};

Dict.prototype.has = function (key) {
    this.assertString(key);
    return key === "__proto__" ? this._hasProto : key in this.store;
};

Dict.prototype["delete"] = function (key) {
    this.assertString(key);
    if (key === "__proto__") {
        if (this._hasProto) {
            if (this.dispatchesMapChanges) {
                this.dispatchBeforeMapChange(key, this._protoValue);
            }
            this._protoValue = undefined;
            this.length--;
            if (this.dispatchesMapChanges) {
                this.dispatchMapChange(key, undefined);
            }
            return true;
        }
        return false;
    }
    else {
        if (key in this.store) {
            if (this.dispatchesMapChanges) {
                this.dispatchBeforeMapChange(key, this.store[key]);
            }
            delete this.store[key];
            this.length--;
            if (this.dispatchesMapChanges) {
                this.dispatchMapChange(key, undefined);
            }
            return true;
        }
        return false;
    }
};

Dict.prototype.clear = function () {
    var key;
    if (this._hasProto) {
        if (this.dispatchesMapChanges) {
            this.dispatchBeforeMapChange("__proto__", this._protoValue);
        }
        this._protoValue = undefined;
        if (this.dispatchesMapChanges) {
            this.dispatchMapChange("__proto__", undefined);
        }
    }
    for (key in this.store) {
        if (this.dispatchesMapChanges) {
            this.dispatchBeforeMapChange(key, this.store[key]);
        }
        delete this.store[key];
        if (this.dispatchesMapChanges) {
            this.dispatchMapChange(key, undefined);
        }
    }
    this.length = 0;
};

Dict.prototype.reduce = function (callback, basis, thisp) {
    if(this._hasProto) {
        basis = callback.call(thisp, basis, "$__proto__", "__proto__", this);
    }
    var store = this.store;
    for (var key in this.store) {
        basis = callback.call(thisp, basis, store[key], key, this);
    }
    return basis;
};

Dict.prototype.reduceRight = function (callback, basis, thisp) {
    var self = this;
    var store = this.store;
    basis = Object.keys(this.store).reduceRight(function (basis, key) {
        return callback.call(thisp, basis, store[key], key, self);
    }, basis);
    
    if(this._hasProto) {
        return callback.call(thisp, basis, this._protoValue, "__proto__", self);
    }
    return basis;
};

Dict.prototype.one = function () {
    var key;
    for (key in this.store) {
        return this.store[key];
    }
    return this._protoValue;
};

Dict.prototype.toJSON = function () {
    return this.toObject();
};

},{"./generic-collection":9,"./generic-map":10,"./listen/property-changes":15,"./shim":21}],8:[function(require,module,exports){
"use strict";

var Shim = require("./shim");
var Dict = require("./dict");
var List = require("./list");
var GenericCollection = require("./generic-collection");
var GenericSet = require("./generic-set");
var TreeLog = require("./tree-log");
var PropertyChanges = require("./listen/property-changes");

var object_has = Object.prototype.hasOwnProperty;

module.exports = FastSet;

function FastSet(values, equals, hash, getDefault) {
    if (!(this instanceof FastSet)) {
        return new FastSet(values, equals, hash, getDefault);
    }
    equals = equals || Object.equals;
    hash = hash || Object.hash;
    getDefault = getDefault || Function.noop;
    this.contentEquals = equals;
    this.contentHash = hash;
    this.getDefault = getDefault;
    var self = this;
    this.buckets = new this.Buckets(null, function getDefaultBucket() {
        return new self.Bucket();
    });
    this.length = 0;
    this.addEach(values);
}

FastSet.FastSet = FastSet; // hack so require("fast-set").FastSet will work in MontageJS

Object.addEach(FastSet.prototype, GenericCollection.prototype);
Object.addEach(FastSet.prototype, GenericSet.prototype);
Object.addEach(FastSet.prototype, PropertyChanges.prototype);

FastSet.prototype.Buckets = Dict;
FastSet.prototype.Bucket = List;

FastSet.prototype.constructClone = function (values) {
    return new this.constructor(
        values,
        this.contentEquals,
        this.contentHash,
        this.getDefault
    );
};

FastSet.prototype.has = function (value) {
    var hash = this.contentHash(value);
    return this.buckets.get(hash).has(value);
};

FastSet.prototype.get = function (value, equals) {
    if (equals) {
        throw new Error("FastSet#get does not support second argument: equals");
    }
    var hash = this.contentHash(value);
    var buckets = this.buckets;
    if (buckets.has(hash)) {
        return buckets.get(hash).get(value);
    } else {
        return this.getDefault(value);
    }
};

FastSet.prototype["delete"] = function (value, equals) {
    if (equals) {
        throw new Error("FastSet#delete does not support second argument: equals");
    }
    var hash = this.contentHash(value);
    var buckets = this.buckets;
    if (buckets.has(hash)) {
        var bucket = buckets.get(hash);
        if (bucket["delete"](value)) {
            this.length--;
            if (bucket.length === 0) {
                buckets["delete"](hash);
            }
            return true;
        }
    }
    return false;
};

FastSet.prototype.clear = function () {
    this.buckets.clear();
    this.length = 0;
};

FastSet.prototype.add = function (value) {
    var hash = this.contentHash(value);
    var buckets = this.buckets;
    if (!buckets.has(hash)) {
        buckets.set(hash, new this.Bucket(null, this.contentEquals));
    }
    if (!buckets.get(hash).has(value)) {
        buckets.get(hash).add(value);
        this.length++;
        return true;
    }
    return false;
};

FastSet.prototype.reduce = function (callback, basis /*, thisp*/) {
    var thisp = arguments[2];
    var buckets = this.buckets;
    var index = 0;
    return buckets.reduce(function (basis, bucket) {
        return bucket.reduce(function (basis, value) {
            return callback.call(thisp, basis, value, index++, this);
        }, basis, this);
    }, basis, this);
};

FastSet.prototype.one = function () {
    if (this.length > 0) {
        return this.buckets.one().one();
    }
};

FastSet.prototype.iterate = function () {
    return this.buckets.values().flatten().iterate();
};

FastSet.prototype.log = function (charmap, logNode, callback, thisp) {
    charmap = charmap || TreeLog.unicodeSharp;
    logNode = logNode || this.logNode;
    if (!callback) {
        callback = console.log;
        thisp = console;
    }
    callback = callback.bind(thisp);

    var buckets = this.buckets;
    var hashes = buckets.keys();
    hashes.forEach(function (hash, index) {
        var branch;
        var leader;
        if (index === hashes.length - 1) {
            branch = charmap.fromAbove;
            leader = ' ';
        } else if (index === 0) {
            branch = charmap.branchDown;
            leader = charmap.strafe;
        } else {
            branch = charmap.fromBoth;
            leader = charmap.strafe;
        }
        var bucket = buckets.get(hash);
        callback.call(thisp, branch + charmap.through + charmap.branchDown + ' ' + hash);
        bucket.forEach(function (value, node) {
            var branch, below;
            if (node === bucket.head.prev) {
                branch = charmap.fromAbove;
                below = ' ';
            } else {
                branch = charmap.fromBoth;
                below = charmap.strafe;
            }
            var written;
            logNode(
                node,
                function (line) {
                    if (!written) {
                        callback.call(thisp, leader + ' ' + branch + charmap.through + charmap.through + line);
                        written = true;
                    } else {
                        callback.call(thisp, leader + ' ' + below + '  ' + line);
                    }
                },
                function (line) {
                    callback.call(thisp, leader + ' ' + charmap.strafe + '  ' + line);
                }
            );
        });
    });
};

FastSet.prototype.logNode = function (node, write) {
    var value = node.value;
    if (Object(value) === value) {
        JSON.stringify(value, null, 4).split("\n").forEach(function (line) {
            write(" " + line);
        });
    } else {
        write(" " + value);
    }
};


},{"./dict":7,"./generic-collection":9,"./generic-set":12,"./list":13,"./listen/property-changes":15,"./shim":21,"./tree-log":22}],9:[function(require,module,exports){
"use strict";

module.exports = GenericCollection;
function GenericCollection() {
    throw new Error("Can't construct. GenericCollection is a mixin.");
}

GenericCollection.EmptyArray = Object.freeze([]);

GenericCollection.prototype.addEach = function (values) {
    if (values && Object(values) === values) {
        if (typeof values.forEach === "function") {
            values.forEach(this.add, this);
        } else if (typeof values.length === "number") {
            // Array-like objects that do not implement forEach, ergo,
            // Arguments
            for (var i = 0; i < values.length; i++) {
                this.add(values[i], i);
            }
        } else {
            Object.keys(values).forEach(function (key) {
                this.add(values[key], key);
            }, this);
        }
    } else if (values && typeof values.length === "number") {
        // Strings
        for (var i = 0; i < values.length; i++) {
            this.add(values[i], i);
        }
    }
    return this;
};

// This is sufficiently generic for Map (since the value may be a key)
// and ordered collections (since it forwards the equals argument)
GenericCollection.prototype.deleteEach = function (values, equals) {
    values.forEach(function (value) {
        this["delete"](value, equals);
    }, this);
    return this;
};

// all of the following functions are implemented in terms of "reduce".
// some need "constructClone".

GenericCollection.prototype.forEach = function (callback /*, thisp*/) {
    var thisp = arguments[1];
    return this.reduce(function (undefined, value, key, object, depth) {
        callback.call(thisp, value, key, object, depth);
    }, undefined);
};

GenericCollection.prototype.map = function (callback /*, thisp*/) {
    var thisp = arguments[1];
    var result = [];
    this.reduce(function (undefined, value, key, object, depth) {
        result.push(callback.call(thisp, value, key, object, depth));
    }, undefined);
    return result;
};

GenericCollection.prototype.enumerate = function (start) {
    if (start == null) {
        start = 0;
    }
    var result = [];
    this.reduce(function (undefined, value) {
        result.push([start++, value]);
    }, undefined);
    return result;
};

GenericCollection.prototype.group = function (callback, thisp, equals) {
    equals = equals || Object.equals;
    var groups = [];
    var keys = [];
    this.forEach(function (value, key, object) {
        var key = callback.call(thisp, value, key, object);
        var index = keys.indexOf(key, equals);
        var group;
        if (index === -1) {
            group = [];
            groups.push([key, group]);
            keys.push(key);
        } else {
            group = groups[index][1];
        }
        group.push(value);
    });
    return groups;
};

GenericCollection.prototype.toArray = function () {
    return this.map(Function.identity);
};

// this depends on stringable keys, which apply to Array and Iterator
// because they have numeric keys and all Maps since they may use
// strings as keys.  List, Set, and SortedSet have nodes for keys, so
// toObject would not be meaningful.
GenericCollection.prototype.toObject = function () {
    var object = {};
    this.reduce(function (undefined, value, key) {
        object[key] = value;
    }, undefined);
    return object;
};

GenericCollection.prototype.filter = function (callback /*, thisp*/) {
    var thisp = arguments[1];
    var result = this.constructClone();
    this.reduce(function (undefined, value, key, object, depth) {
        if (callback.call(thisp, value, key, object, depth)) {
            result.add(value, key);
        }
    }, undefined);
    return result;
};

GenericCollection.prototype.every = function (callback /*, thisp*/) {
    var thisp = arguments[1];
    return this.reduce(function (result, value, key, object, depth) {
        return result && callback.call(thisp, value, key, object, depth);
    }, true);
};

GenericCollection.prototype.some = function (callback /*, thisp*/) {
    var thisp = arguments[1];
    return this.reduce(function (result, value, key, object, depth) {
        return result || callback.call(thisp, value, key, object, depth);
    }, false);
};

GenericCollection.prototype.all = function () {
    return this.every(Boolean);
};

GenericCollection.prototype.any = function () {
    return this.some(Boolean);
};

GenericCollection.prototype.min = function (compare) {
    compare = compare || this.contentCompare || Object.compare;
    var first = true;
    return this.reduce(function (result, value) {
        if (first) {
            first = false;
            return value;
        } else {
            return compare(value, result) < 0 ? value : result;
        }
    }, undefined);
};

GenericCollection.prototype.max = function (compare) {
    compare = compare || this.contentCompare || Object.compare;
    var first = true;
    return this.reduce(function (result, value) {
        if (first) {
            first = false;
            return value;
        } else {
            return compare(value, result) > 0 ? value : result;
        }
    }, undefined);
};

GenericCollection.prototype.sum = function (zero) {
    zero = zero === undefined ? 0 : zero;
    return this.reduce(function (a, b) {
        return a + b;
    }, zero);
};

GenericCollection.prototype.average = function (zero) {
    var sum = zero === undefined ? 0 : zero;
    var count = zero === undefined ? 0 : zero;
    this.reduce(function (undefined, value) {
        sum += value;
        count += 1;
    }, undefined);
    return sum / count;
};

GenericCollection.prototype.concat = function () {
    var result = this.constructClone(this);
    for (var i = 0; i < arguments.length; i++) {
        result.addEach(arguments[i]);
    }
    return result;
};

GenericCollection.prototype.flatten = function () {
    var self = this;
    return this.reduce(function (result, array) {
        array.forEach(function (value) {
            this.push(value);
        }, result, self);
        return result;
    }, []);
};

GenericCollection.prototype.zip = function () {
    var table = Array.prototype.slice.call(arguments);
    table.unshift(this);
    return Array.unzip(table);
}

GenericCollection.prototype.join = function (delimiter) {
    return this.reduce(function (result, string) {
        // work-around for reduce that does not support no-basis form
        if (result === void 0) {
            return string;
        } else {
            return result + delimiter + string;
        }
    }, void 0);
};

GenericCollection.prototype.sorted = function (compare, by, order) {
    compare = compare || this.contentCompare || Object.compare;
    // account for comparators generated by Function.by
    if (compare.by) {
        by = compare.by;
        compare = compare.compare || this.contentCompare || Object.compare;
    } else {
        by = by || Function.identity;
    }
    if (order === undefined)
        order = 1;
    return this.map(function (item) {
        return {
            by: by(item),
            value: item
        };
    })
    .sort(function (a, b) {
        return compare(a.by, b.by) * order;
    })
    .map(function (pair) {
        return pair.value;
    });
};

GenericCollection.prototype.reversed = function () {
    return this.constructClone(this).reverse();
};

GenericCollection.prototype.clone = function (depth, memo) {
    if (depth === undefined) {
        depth = Infinity;
    } else if (depth === 0) {
        return this;
    }
    var clone = this.constructClone();
    this.forEach(function (value, key) {
        clone.add(Object.clone(value, depth - 1, memo), key);
    }, this);
    return clone;
};

GenericCollection.prototype.only = function () {
    if (this.length === 1) {
        return this.one();
    }
};

GenericCollection.prototype.iterator = function () {
    return this.iterate.apply(this, arguments);
};

GenericCollection._sizePropertyDescriptor = {
    get: function() {
        return this.length;
    },
    enumerable: false,
    configurable: true
};

Object.defineProperty(GenericCollection.prototype,"size",GenericCollection._sizePropertyDescriptor);

require("./shim-array");

},{"./shim-array":17}],10:[function(require,module,exports){
"use strict";

var Object = require("./shim-object");
var MapChanges = require("./listen/map-changes");
var PropertyChanges = require("./listen/property-changes");

module.exports = GenericMap;
function GenericMap() {
    throw new Error("Can't construct. GenericMap is a mixin.");
}

Object.addEach(GenericMap.prototype, MapChanges.prototype);
Object.addEach(GenericMap.prototype, PropertyChanges.prototype);

// all of these methods depend on the constructor providing a `store` set

GenericMap.prototype.isMap = true;

GenericMap.prototype.addEach = function (values) {
    if (values && Object(values) === values) {
        if (typeof values.forEach === "function") {
            // copy map-alikes
            if (values.isMap === true) {
                values.forEach(function (value, key) {
                    this.set(key, value);
                }, this);
            // iterate key value pairs of other iterables
            } else {
                values.forEach(function (pair) {
                    this.set(pair[0], pair[1]);
                }, this);
            }
        } else if (typeof values.length === "number") {
            // Array-like objects that do not implement forEach, ergo,
            // Arguments
            for (var i = 0; i < values.length; i++) {
                this.add(values[i], i);
            }
        } else {
            // copy other objects as map-alikes
            Object.keys(values).forEach(function (key) {
                this.set(key, values[key]);
            }, this);
        }
    } else if (values && typeof values.length === "number") {
        // String
        for (var i = 0; i < values.length; i++) {
            this.add(values[i], i);
        }
    }
    return this;
}

GenericMap.prototype.get = function (key, defaultValue) {
    var item = this.store.get(new this.Item(key));
    if (item) {
        return item.value;
    } else if (arguments.length > 1) {
        return defaultValue;
    } else {
        return this.getDefault(key);
    }
};

GenericMap.prototype.set = function (key, value) {
    var item = new this.Item(key, value);
    var found = this.store.get(item);
    var grew = false;
    if (found) { // update
        if (this.dispatchesMapChanges) {
            this.dispatchBeforeMapChange(key, found.value);
        }
        found.value = value;
        if (this.dispatchesMapChanges) {
            this.dispatchMapChange(key, value);
        }
    } else { // create
        if (this.dispatchesMapChanges) {
            this.dispatchBeforeMapChange(key, undefined);
        }
        if (this.store.add(item)) {
            this.length++;
            grew = true;
        }
        if (this.dispatchesMapChanges) {
            this.dispatchMapChange(key, value);
        }
    }
    return grew;
};

GenericMap.prototype.add = function (value, key) {
    return this.set(key, value);
};

GenericMap.prototype.has = function (key) {
    return this.store.has(new this.Item(key));
};

GenericMap.prototype['delete'] = function (key) {
    var item = new this.Item(key);
    if (this.store.has(item)) {
        var from = this.store.get(item).value;
        if (this.dispatchesMapChanges) {
            this.dispatchBeforeMapChange(key, from);
        }
        this.store["delete"](item);
        this.length--;
        if (this.dispatchesMapChanges) {
            this.dispatchMapChange(key, undefined);
        }
        return true;
    }
    return false;
};

GenericMap.prototype.clear = function () {
    var keys;
    if (this.dispatchesMapChanges) {
        this.forEach(function (value, key) {
            this.dispatchBeforeMapChange(key, value);
        }, this);
        keys = this.keys();
    }
    this.store.clear();
    this.length = 0;
    if (this.dispatchesMapChanges) {
        keys.forEach(function (key) {
            this.dispatchMapChange(key);
        }, this);
    }
};

GenericMap.prototype.reduce = function (callback, basis, thisp) {
    return this.store.reduce(function (basis, item) {
        return callback.call(thisp, basis, item.value, item.key, this);
    }, basis, this);
};

GenericMap.prototype.reduceRight = function (callback, basis, thisp) {
    return this.store.reduceRight(function (basis, item) {
        return callback.call(thisp, basis, item.value, item.key, this);
    }, basis, this);
};

GenericMap.prototype.keys = function () {
    return this.map(function (value, key) {
        return key;
    });
};

GenericMap.prototype.values = function () {
    return this.map(Function.identity);
};

GenericMap.prototype.entries = function () {
    return this.map(function (value, key) {
        return [key, value];
    });
};

// XXX deprecated
GenericMap.prototype.items = function () {
    return this.entries();
};

GenericMap.prototype.equals = function (that, equals) {
    equals = equals || Object.equals;
    if (this === that) {
        return true;
    } else if (that && typeof that.every === "function") {
        return that.length === this.length && that.every(function (value, key) {
            return equals(this.get(key), value);
        }, this);
    } else {
        var keys = Object.keys(that);
        return keys.length === this.length && Object.keys(that).every(function (key) {
            return equals(this.get(key), that[key]);
        }, this);
    }
};

GenericMap.prototype.toJSON = function () {
    return this.entries();
};

GenericMap.prototype.Item = Item;

function Item(key, value) {
    this.key = key;
    this.value = value;
}

Item.prototype.equals = function (that) {
    return Object.equals(this.key, that.key) && Object.equals(this.value, that.value);
};

Item.prototype.compare = function (that) {
    return Object.compare(this.key, that.key);
};


},{"./listen/map-changes":14,"./listen/property-changes":15,"./shim-object":19}],11:[function(require,module,exports){

var Object = require("./shim-object");

module.exports = GenericOrder;
function GenericOrder() {
    throw new Error("Can't construct. GenericOrder is a mixin.");
}

GenericOrder.prototype.equals = function (that, equals) {
    equals = equals || this.contentEquals || Object.equals;

    if (this === that) {
        return true;
    }
    if (!that) {
        return false;
    }

    var self = this;
    return (
        this.length === that.length &&
        this.zip(that).every(function (pair) {
            return equals(pair[0], pair[1]);
        })
    );
};

GenericOrder.prototype.compare = function (that, compare) {
    compare = compare || this.contentCompare || Object.compare;

    if (this === that) {
        return 0;
    }
    if (!that) {
        return 1;
    }

    var length = Math.min(this.length, that.length);
    var comparison = this.zip(that).reduce(function (comparison, pair, index) {
        if (comparison === 0) {
            if (index >= length) {
                return comparison;
            } else {
                return compare(pair[0], pair[1]);
            }
        } else {
            return comparison;
        }
    }, 0);
    if (comparison === 0) {
        return this.length - that.length;
    }
    return comparison;
};

GenericOrder.prototype.toJSON = function () {
    return this.toArray();
};

},{"./shim-object":19}],12:[function(require,module,exports){

module.exports = GenericSet;
function GenericSet() {
    throw new Error("Can't construct. GenericSet is a mixin.");
}

GenericSet.prototype.isSet = true;

GenericSet.prototype.union = function (that) {
    var union =  this.constructClone(this);
    union.addEach(that);
    return union;
};

GenericSet.prototype.intersection = function (that) {
    return this.constructClone(this.filter(function (value) {
        return that.has(value);
    }));
};

GenericSet.prototype.difference = function (that) {
    var union =  this.constructClone(this);
    union.deleteEach(that);
    return union;
};

GenericSet.prototype.symmetricDifference = function (that) {
    var union = this.union(that);
    var intersection = this.intersection(that);
    return union.difference(intersection);
};

GenericSet.prototype.deleteAll = function (value) {
    // deleteAll is equivalent to delete for sets since they guarantee that
    // only one value exists for an equivalence class, but deleteAll returns
    // the count of deleted values instead of whether a value was deleted.
    return +this["delete"](value);
};

GenericSet.prototype.equals = function (that, equals) {
    var self = this;
    return (
        that && typeof that.reduce === "function" &&
        this.length === that.length &&
        that.reduce(function (equal, value) {
            return equal && self.has(value, equals);
        }, true)
    );
};

GenericSet.prototype.toJSON = function () {
    return this.toArray();
};

// W3C DOMTokenList API overlap (does not handle variadic arguments)

GenericSet.prototype.contains = function (value) {
    return this.has(value);
};

GenericSet.prototype.remove = function (value) {
    return this["delete"](value);
};

GenericSet.prototype.toggle = function (value) {
    if (this.has(value)) {
        this["delete"](value);
    } else {
        this.add(value);
    }
};


},{}],13:[function(require,module,exports){
"use strict";

module.exports = List;

var Shim = require("./shim");
var GenericCollection = require("./generic-collection");
var GenericOrder = require("./generic-order");
var PropertyChanges = require("./listen/property-changes");
var RangeChanges = require("./listen/range-changes");

function List(values, equals, getDefault) {
    if (!(this instanceof List)) {
        return new List(values, equals, getDefault);
    }
    var head = this.head = new this.Node();
    head.next = head;
    head.prev = head;
    this.contentEquals = equals || Object.equals;
    this.getDefault = getDefault || Function.noop;
    this.length = 0;
    this.addEach(values);
}

List.List = List; // hack so require("list").List will work in MontageJS

Object.addEach(List.prototype, GenericCollection.prototype);
Object.addEach(List.prototype, GenericOrder.prototype);
Object.addEach(List.prototype, PropertyChanges.prototype);
Object.addEach(List.prototype, RangeChanges.prototype);

List.prototype.constructClone = function (values) {
    return new this.constructor(values, this.contentEquals, this.getDefault);
};

List.prototype.find = function (value, equals, index) {
    equals = equals || this.contentEquals;
    var head = this.head;
    var at = this.scan(index, head.next);
    while (at !== head) {
        if (equals(at.value, value)) {
            return at;
        }
        at = at.next;
    }
};

List.prototype.findLast = function (value, equals, index) {
    equals = equals || this.contentEquals;
    var head = this.head;
    var at = this.scan(index, head.prev);
    while (at !== head) {
        if (equals(at.value, value)) {
            return at;
        }
        at = at.prev;
    }
};

List.prototype.has = function (value, equals) {
    return !!this.find(value, equals);
};

List.prototype.get = function (value, equals) {
    var found = this.find(value, equals);
    if (found) {
        return found.value;
    }
    return this.getDefault(value);
};

// LIFO (delete removes the most recently added equivalent value)
List.prototype["delete"] = function (value, equals) {
    var found = this.findLast(value, equals);
    if (found) {
        if (this.dispatchesRangeChanges) {
            var plus = [];
            var minus = [value];
            this.dispatchBeforeRangeChange(plus, minus, found.index);
        }
        found["delete"]();
        this.length--;
        if (this.dispatchesRangeChanges) {
            this.updateIndexes(found.next, found.index);
            this.dispatchRangeChange(plus, minus, found.index);
        }
        return true;
    }
    return false;
};

List.prototype.deleteAll = function (value, equals) {
    equals = equals || this.contentEquals;
    var head = this.head;
    var at = head.next;
    var count = 0;
    while (at !== head) {
        if (equals(value, at.value)) {
            at["delete"]();
            count++;
        }
        at = at.next;
    }
    this.length -= count;
    return count;
};

List.prototype.clear = function () {
    var plus, minus;
    if (this.dispatchesRangeChanges) {
        minus = this.toArray();
        plus = [];
        this.dispatchBeforeRangeChange(plus, minus, 0);
    }
    this.head.next = this.head.prev = this.head;
    this.length = 0;
    if (this.dispatchesRangeChanges) {
        this.dispatchRangeChange(plus, minus, 0);
    }
};

List.prototype.add = function (value) {
    var node = new this.Node(value)
    if (this.dispatchesRangeChanges) {
        node.index = this.length;
        this.dispatchBeforeRangeChange([value], [], node.index);
    }
    this.head.addBefore(node);
    this.length++;
    if (this.dispatchesRangeChanges) {
        this.dispatchRangeChange([value], [], node.index);
    }
    return true;
};

List.prototype.push = function () {
    var head = this.head;
    if (this.dispatchesRangeChanges) {
        var plus = Array.prototype.slice.call(arguments);
        var minus = []
        var index = this.length;
        this.dispatchBeforeRangeChange(plus, minus, index);
        var start = this.head.prev;
    }
    for (var i = 0; i < arguments.length; i++) {
        var value = arguments[i];
        var node = new this.Node(value);
        head.addBefore(node);
    }
    this.length += arguments.length;
    if (this.dispatchesRangeChanges) {
        this.updateIndexes(start.next, start.index === undefined ? 0 : start.index + 1);
        this.dispatchRangeChange(plus, minus, index);
    }
};

List.prototype.unshift = function () {
    if (this.dispatchesRangeChanges) {
        var plus = Array.prototype.slice.call(arguments);
        var minus = [];
        this.dispatchBeforeRangeChange(plus, minus, 0);
    }
    var at = this.head;
    for (var i = 0; i < arguments.length; i++) {
        var value = arguments[i];
        var node = new this.Node(value);
        at.addAfter(node);
        at = node;
    }
    this.length += arguments.length;
    if (this.dispatchesRangeChanges) {
        this.updateIndexes(this.head.next, 0);
        this.dispatchRangeChange(plus, minus, 0);
    }
};

List.prototype.pop = function () {
    var value;
    var head = this.head;
    if (head.prev !== head) {
        value = head.prev.value;
        if (this.dispatchesRangeChanges) {
            var plus = [];
            var minus = [value];
            var index = this.length - 1;
            this.dispatchBeforeRangeChange(plus, minus, index);
        }
        head.prev['delete']();
        this.length--;
        if (this.dispatchesRangeChanges) {
            this.dispatchRangeChange(plus, minus, index);
        }
    }
    return value;
};

List.prototype.shift = function () {
    var value;
    var head = this.head;
    if (head.prev !== head) {
        value = head.next.value;
        if (this.dispatchesRangeChanges) {
            var plus = [];
            var minus = [value];
            this.dispatchBeforeRangeChange(plus, minus, 0);
        }
        head.next['delete']();
        this.length--;
        if (this.dispatchesRangeChanges) {
            this.updateIndexes(this.head.next, 0);
            this.dispatchRangeChange(plus, minus, 0);
        }
    }
    return value;
};

List.prototype.peek = function () {
    if (this.head !== this.head.next) {
        return this.head.next.value;
    }
};

List.prototype.poke = function (value) {
    if (this.head !== this.head.next) {
        this.head.next.value = value;
    } else {
        this.push(value);
    }
};

List.prototype.one = function () {
    return this.peek();
};

// TODO
// List.prototype.indexOf = function (value) {
// };

// TODO
// List.prototype.lastIndexOf = function (value) {
// };

// an internal utility for coercing index offsets to nodes
List.prototype.scan = function (at, fallback) {
    var head = this.head;
    if (typeof at === "number") {
        var count = at;
        if (count >= 0) {
            at = head.next;
            while (count) {
                count--;
                at = at.next;
                if (at == head) {
                    break;
                }
            }
        } else {
            at = head;
            while (count < 0) {
                count++;
                at = at.prev;
                if (at == head) {
                    break;
                }
            }
        }
        return at;
    } else {
        return at || fallback;
    }
};

// at and end may both be positive or negative numbers (in which cases they
// correspond to numeric indicies, or nodes)
List.prototype.slice = function (at, end) {
    var sliced = [];
    var head = this.head;
    at = this.scan(at, head.next);
    end = this.scan(end, head);

    while (at !== end && at !== head) {
        sliced.push(at.value);
        at = at.next;
    }

    return sliced;
};

List.prototype.splice = function (at, length /*...plus*/) {
    return this.swap(at, length, Array.prototype.slice.call(arguments, 2));
};

List.prototype.swap = function (start, length, plus) {
    var initial = start;
    // start will be head if start is null or -1 (meaning from the end), but
    // will be head.next if start is 0 (meaning from the beginning)
    start = this.scan(start, this.head);
    if (length == null) {
        length = Infinity;
    }
    plus = Array.from(plus);

    // collect the minus array
    var minus = [];
    var at = start;
    while (length-- && length >= 0 && at !== this.head) {
        minus.push(at.value);
        at = at.next;
    }

    // before range change
    var index, startNode;
    if (this.dispatchesRangeChanges) {
        if (start === this.head) {
            index = this.length;
        } else if (start.prev === this.head) {
            index = 0;
        } else {
            index = start.index;
        }
        startNode = start.prev;
        this.dispatchBeforeRangeChange(plus, minus, index);
    }

    // delete minus
    var at = start;
    for (var i = 0, at = start; i < minus.length; i++, at = at.next) {
        at["delete"]();
    }
    // add plus
    if (initial == null && at === this.head) {
        at = this.head.next;
    }
    for (var i = 0; i < plus.length; i++) {
        var node = new this.Node(plus[i]);
        at.addBefore(node);
    }
    // adjust length
    this.length += plus.length - minus.length;

    // after range change
    if (this.dispatchesRangeChanges) {
        if (start === this.head) {
            this.updateIndexes(this.head.next, 0);
        } else {
            this.updateIndexes(startNode.next, startNode.index + 1);
        }
        this.dispatchRangeChange(plus, minus, index);
    }

    return minus;
};

List.prototype.reverse = function () {
    if (this.dispatchesRangeChanges) {
        var minus = this.toArray();
        var plus = minus.reversed();
        this.dispatchBeforeRangeChange(plus, minus, 0);
    }
    var at = this.head;
    do {
        var temp = at.next;
        at.next = at.prev;
        at.prev = temp;
        at = at.next;
    } while (at !== this.head);
    if (this.dispatchesRangeChanges) {
        this.dispatchRangeChange(plus, minus, 0);
    }
    return this;
};

List.prototype.sort = function () {
    this.swap(0, this.length, this.sorted());
};

// TODO account for missing basis argument
List.prototype.reduce = function (callback, basis /*, thisp*/) {
    var thisp = arguments[2];
    var head = this.head;
    var at = head.next;
    while (at !== head) {
        basis = callback.call(thisp, basis, at.value, at, this);
        at = at.next;
    }
    return basis;
};

List.prototype.reduceRight = function (callback, basis /*, thisp*/) {
    var thisp = arguments[2];
    var head = this.head;
    var at = head.prev;
    while (at !== head) {
        basis = callback.call(thisp, basis, at.value, at, this);
        at = at.prev;
    }
    return basis;
};

List.prototype.updateIndexes = function (node, index) {
    while (node !== this.head) {
        node.index = index++;
        node = node.next;
    }
};

List.prototype.makeObservable = function () {
    this.head.index = -1;
    this.updateIndexes(this.head.next, 0);
    this.dispatchesRangeChanges = true;
};

List.prototype.iterate = function () {
    return new ListIterator(this.head);
};

function ListIterator(head) {
    this.head = head;
    this.at = head.next;
};

ListIterator.prototype.__iterationObject = null;
Object.defineProperty(ListIterator.prototype,"_iterationObject", {
    get: function() {
        return this.__iterationObject || (this.__iterationObject = { done: false, value:null});
    }
});


ListIterator.prototype.next = function () {
    if (this.at === this.head) {
        this._iterationObject.done = true;
        this._iterationObject.value = void 0;
    } else {
        var value = this.at.value;
        this.at = this.at.next;
        this._iterationObject.value = value;
    }
    return this._iterationObject;
};

List.prototype.Node = Node;

function Node(value) {
    this.value = value;
    this.prev = null;
    this.next = null;
};

Node.prototype["delete"] = function () {
    this.prev.next = this.next;
    this.next.prev = this.prev;
};

Node.prototype.addBefore = function (node) {
    var prev = this.prev;
    this.prev = node;
    node.prev = prev;
    prev.next = node;
    node.next = this;
};

Node.prototype.addAfter = function (node) {
    var next = this.next;
    this.next = node;
    node.next = next;
    next.prev = node;
    node.prev = this;
};

},{"./generic-collection":9,"./generic-order":11,"./listen/property-changes":15,"./listen/range-changes":16,"./shim":21}],14:[function(require,module,exports){
"use strict";

var WeakMap = require("weak-map");
var List = require("../list");

module.exports = MapChanges;
function MapChanges() {
    throw new Error("Can't construct. MapChanges is a mixin.");
}

var object_owns = Object.prototype.hasOwnProperty;

/*
    Object map change descriptors carry information necessary for adding,
    removing, dispatching, and shorting events to listeners for map changes
    for a particular key on a particular object.  These descriptors are used
    here for shallow map changes.

    {
        willChangeListeners:Array(Function)
        changeListeners:Array(Function)
    }
*/

var mapChangeDescriptors = new WeakMap();
var Dict = null;

MapChanges.prototype.getAllMapChangeDescriptors = function () {
    if (!mapChangeDescriptors.has(this)) {
        if (!Dict) {
            Dict = require("../dict");
        }
        mapChangeDescriptors.set(this, Dict());
    }
    return mapChangeDescriptors.get(this);
};

MapChanges.prototype.getMapChangeDescriptor = function (token) {
    var tokenChangeDescriptors = this.getAllMapChangeDescriptors();
    token = token || "";
    if (!tokenChangeDescriptors.has(token)) {
        tokenChangeDescriptors.set(token, {
            willChangeListeners: new List(),
            changeListeners: new List()
        });
    }
    return tokenChangeDescriptors.get(token);
};

MapChanges.prototype.addMapChangeListener = function (listener, token, beforeChange) {
    if (!this.isObservable && this.makeObservable) {
        // for Array
        this.makeObservable();
    }
    var descriptor = this.getMapChangeDescriptor(token);
    var listeners;
    if (beforeChange) {
        listeners = descriptor.willChangeListeners;
    } else {
        listeners = descriptor.changeListeners;
    }
    listeners.push(listener);
    Object.defineProperty(this, "dispatchesMapChanges", {
        value: true,
        writable: true,
        configurable: true,
        enumerable: false
    });

    var self = this;
    return function cancelMapChangeListener() {
        if (!self) {
            // TODO throw new Error("Can't remove map change listener again");
            return;
        }
        self.removeMapChangeListener(listener, token, beforeChange);
        self = null;
    };
};

MapChanges.prototype.removeMapChangeListener = function (listener, token, beforeChange) {
    var descriptor = this.getMapChangeDescriptor(token);

    var listeners;
    if (beforeChange) {
        listeners = descriptor.willChangeListeners;
    } else {
        listeners = descriptor.changeListeners;
    }

    var node = listeners.findLast(listener);
    if (!node) {
        throw new Error("Can't remove map change listener: does not exist: token " + JSON.stringify(token));
    }
    node["delete"]();
};

MapChanges.prototype.dispatchMapChange = function (key, value, beforeChange) {
    var descriptors = this.getAllMapChangeDescriptors();
    var changeName = "Map" + (beforeChange ? "WillChange" : "Change");
    descriptors.forEach(function (descriptor, token) {

        if (descriptor.isActive) {
            return;
        } else {
            descriptor.isActive = true;
        }

        var listeners;
        if (beforeChange) {
            listeners = descriptor.willChangeListeners;
        } else {
            listeners = descriptor.changeListeners;
        }

        var tokenName = "handle" + (
            token.slice(0, 1).toUpperCase() +
            token.slice(1)
        ) + changeName;

        try {
            // dispatch to each listener
            listeners.forEach(function (listener) {
                if (listener[tokenName]) {
                    listener[tokenName](value, key, this);
                } else if (listener.call) {
                    listener.call(listener, value, key, this);
                } else {
                    throw new Error("Handler " + listener + " has no method " + tokenName + " and is not callable");
                }
            }, this);
        } finally {
            descriptor.isActive = false;
        }

    }, this);
};

MapChanges.prototype.addBeforeMapChangeListener = function (listener, token) {
    return this.addMapChangeListener(listener, token, true);
};

MapChanges.prototype.removeBeforeMapChangeListener = function (listener, token) {
    return this.removeMapChangeListener(listener, token, true);
};

MapChanges.prototype.dispatchBeforeMapChange = function (key, value) {
    return this.dispatchMapChange(key, value, true);
};


},{"../dict":7,"../list":13,"weak-map":23}],15:[function(require,module,exports){
/*
    Based in part on observable arrays from Motorola Mobility’s Montage
    Copyright (c) 2012, Motorola Mobility LLC. All Rights Reserved.
    3-Clause BSD License
    https://github.com/motorola-mobility/montage/blob/master/LICENSE.md
*/

/*
    This module is responsible for observing changes to owned properties of
    objects and changes to the content of arrays caused by method calls.
    The interface for observing array content changes establishes the methods
    necessary for any collection with observable content.
*/

require("../shim");

// objectHasOwnProperty.call(myObject, key) will be used instead of
// myObject.hasOwnProperty(key) to allow myObject have defined
// a own property called "hasOwnProperty".

var objectHasOwnProperty = Object.prototype.hasOwnProperty;

// Object property descriptors carry information necessary for adding,
// removing, dispatching, and shorting events to listeners for property changes
// for a particular key on a particular object.  These descriptors are used
// here for shallow property changes.  The current listeners are the ones
// modified by add and remove own property change listener methods.  During
// property change dispatch, we capture a snapshot of the current listeners in
// the active change listeners array.  The descriptor also keeps a memo of the
// corresponding handler method names.
//
// {
//     willChangeListeners:{current, active:Array<Function>, ...method names}
//     changeListeners:{current, active:Array<Function>, ...method names}
// }

// Maybe remove entries from this table if the corresponding object no longer
// has any property change listeners for any key.  However, the cost of
// book-keeping is probably not warranted since it would be rare for an
// observed object to no longer be observed unless it was about to be disposed
// of or reused as an observable.  The only benefit would be in avoiding bulk
// calls to dispatchOwnPropertyChange events on objects that have no listeners.

//  To observe shallow property changes for a particular key of a particular
//  object, we install a property descriptor on the object that overrides the previous
//  descriptor.  The overridden descriptors are stored in this weak map.  The
//  weak map associates an object with another object that maps property names
//  to property descriptors.
//
//  object.__overriddenPropertyDescriptors__[key]
//
//  We retain the old descriptor for various purposes.  For one, if the property
//  is no longer being observed by anyone, we revert the property descriptor to
//  the original.  For "value" descriptors, we store the actual value of the
//  descriptor on the overridden descriptor, so when the property is reverted, it
//  retains the most recently set value.  For "get" and "set" descriptors,
//  we observe then forward "get" and "set" operations to the original descriptor.

module.exports = PropertyChanges;

function PropertyChanges() {
    throw new Error("This is an abstract interface. Mix it. Don't construct it");
}

PropertyChanges.debug = true;

PropertyChanges.prototype.getOwnPropertyChangeDescriptor = function (key) {
    if (!this.__propertyChangeListeners__) {
        Object.defineProperty(this, "__propertyChangeListeners__", {
            value: {},
            enumerable: false,
            configurable: true,
            writable: true
        });
    }
    var objectPropertyChangeDescriptors = this.__propertyChangeListeners__;
    if (!objectHasOwnProperty.call(objectPropertyChangeDescriptors, key)) {
        var propertyName = String(key);

        propertyName = propertyName && propertyName[0].toUpperCase() + propertyName.slice(1);
        objectPropertyChangeDescriptors[key] = {
            willChangeListeners: {
                current: [],
                active: [],
                specificHandlerMethodName: "handle" + propertyName + "WillChange",
                genericHandlerMethodName: "handlePropertyWillChange"
            },
            changeListeners: {
                current: [],
                active: [],
                specificHandlerMethodName: "handle" + propertyName + "Change",
                genericHandlerMethodName: "handlePropertyChange"
            }
        };
    }
    return objectPropertyChangeDescriptors[key];
};

PropertyChanges.prototype.hasOwnPropertyChangeDescriptor = function (key) {
    if (!this.__propertyChangeListeners__) {
        return false;
    }
    if (!key) {
        return true;
    }
    var objectPropertyChangeDescriptors = this.__propertyChangeListeners__;
    if (!objectHasOwnProperty.call(objectPropertyChangeDescriptors, key)) {
        return false;
    }
    return true;
};

PropertyChanges.prototype.addOwnPropertyChangeListener = function (key, listener, beforeChange) {
    if (this.makeObservable && !this.isObservable) {
        this.makeObservable(); // particularly for observable arrays, for
        // their length property
    }
    var descriptor = PropertyChanges.getOwnPropertyChangeDescriptor(this, key);
    var listeners;
    if (beforeChange) {
        listeners = descriptor.willChangeListeners;
    } else {
        listeners = descriptor.changeListeners;
    }
    PropertyChanges.makePropertyObservable(this, key);
    listeners.current.push(listener);

    var self = this;
    return function cancelOwnPropertyChangeListener() {
        PropertyChanges.removeOwnPropertyChangeListener(self, key, listener, beforeChange);
        self = null;
    };
};

PropertyChanges.prototype.addBeforeOwnPropertyChangeListener = function (key, listener) {
    return PropertyChanges.addOwnPropertyChangeListener(this, key, listener, true);
};

PropertyChanges.prototype.removeOwnPropertyChangeListener = function (key, listener, beforeChange) {
    var descriptor = PropertyChanges.getOwnPropertyChangeDescriptor(this, key);

    var listeners;
    if (beforeChange) {
        listeners = descriptor.willChangeListeners;
    } else {
        listeners = descriptor.changeListeners;
    }

    var index = listeners.current.lastIndexOf(listener);
    if (index === -1) {
        throw new Error("Can't remove property change listener: does not exist: property name" + JSON.stringify(key));
    }
    listeners.current.splice(index, 1);
};

PropertyChanges.prototype.removeBeforeOwnPropertyChangeListener = function (key, listener) {
    return PropertyChanges.removeOwnPropertyChangeListener(this, key, listener, true);
};

PropertyChanges.prototype.dispatchOwnPropertyChange = function (key, value, beforeChange) {
    var descriptor = PropertyChanges.getOwnPropertyChangeDescriptor(this, key),
        listeners;

    if (!descriptor.isActive) {
        descriptor.isActive = true;
        if (beforeChange) {
            listeners = descriptor.willChangeListeners;
        } else {
            listeners = descriptor.changeListeners;
        }
        try {
            dispatchEach(listeners, key, value, this);
        } finally {
            descriptor.isActive = false;
        }
    }
};

function dispatchEach(listeners, key, value, object) {
    // copy snapshot of current listeners to active listeners
    var active = listeners.active;
    var current = listeners.current;
    var index = current.length;
    var listener, length = index, i, thisp;

    if (active.length > index) {
        active.length = index;
    }
    while (index--) {
        active[index] = current[index];
    }
    for (i = 0; i < length; i++) {
        thisp = active[i];
        //This is fixing the issue causing a regression in Montage's repetition
        if (!i || current.indexOf(thisp) >= 0) {
            listener = (
                thisp[listeners.specificHandlerMethodName] ||
                thisp[listeners.genericHandlerMethodName] ||
                thisp
            );
            if (!listener.call) {
                throw new Error("No event listener for " + listeners.specificHandlerName + " or " + listeners.genericHandlerName + " or call on " + listener);
            }
            listener.call(thisp, value, key, object);
        }

    }
}

PropertyChanges.prototype.dispatchBeforeOwnPropertyChange = function (key, listener) {
    return PropertyChanges.dispatchOwnPropertyChange(this, key, listener, true);
};

PropertyChanges.prototype.makePropertyObservable = function (key) {
    // arrays are special.  we do not support direct setting of properties
    // on an array.  instead, call .set(index, value).  this is observable.
    // 'length' property is observable for all mutating methods because
    // our overrides explicitly dispatch that change.


    var overriddenPropertyDescriptors = this.__overriddenPropertyDescriptors__;

    // memoize overridden property descriptor table
    if (!overriddenPropertyDescriptors) {
        if (Array.isArray(this)) {
            return;
        }
        if (!Object.isExtensible(this)) {
            throw new Error("Can't make property " + JSON.stringify(key) + " observable on " + this + " because object is not extensible");
        }
        overriddenPropertyDescriptors = {};
        Object.defineProperty(this, "__overriddenPropertyDescriptors__", {
            value: overriddenPropertyDescriptors,
            enumerable: false,
            writable: true,
            configurable: true
        });
    } else {
        if (objectHasOwnProperty.call(overriddenPropertyDescriptors, key)) {
            // if we have already recorded an overridden property descriptor,
            // we have already installed the observer, so short-here
            return;
        }
    }

    var state;
    if (typeof this.__state__ === "object") {
        state = this.__state__;
    } else {
        state = {};
        Object.defineProperty(this, "__state__", {
            value: state,
            writable: true,
            enumerable: false
        });
    }
    state[key] = this[key];



    // walk up the prototype chain to find a property descriptor for
    // the property name
    var overriddenDescriptor;
    var attached = this;
    do {
        overriddenDescriptor = Object.getOwnPropertyDescriptor(attached, key);
        if (overriddenDescriptor) {
            break;
        }
        attached = Object.getPrototypeOf(attached);
    } while (attached);
    // or default to an undefined value
    if (!overriddenDescriptor) {
        overriddenDescriptor = {
            value: undefined,
            enumerable: true,
            writable: true,
            configurable: true
        };
    } else {
        if (!overriddenDescriptor.configurable) {
            return;
        }
        if (!overriddenDescriptor.writable && !overriddenDescriptor.set) {
            return;
        }
    }

    // memoize the descriptor so we know not to install another layer,
    // and so we can reuse the overridden descriptor when uninstalling
    overriddenPropertyDescriptors[key] = overriddenDescriptor;


    // TODO reflect current value on a displayed property

    var propertyListener;
    // in both of these new descriptor variants, we reuse the overridden
    // descriptor to either store the current value or apply getters
    // and setters.  this is handy since we can reuse the overridden
    // descriptor if we uninstall the observer.  We even preserve the
    // assignment semantics, where we get the value from up the
    // prototype chain, and set as an owned property.
    if ('value' in overriddenDescriptor) {
        propertyListener = {
            get: function () {
                return overriddenDescriptor.value;
            },
            set: function (value) {
                var descriptor,
                    isActive;

                if (value !== overriddenDescriptor.value) {
                    descriptor = this.__propertyChangeListeners__[key];
                    isActive = descriptor.isActive;
                    if (!isActive) {
                        descriptor.isActive = true;
                        try {
                            dispatchEach(descriptor.willChangeListeners, key, overriddenDescriptor.value, this);
                        } finally {}
                    }
                    overriddenDescriptor.value = value;
                    state[key] = value;
                    if (!isActive) {
                        try {
                            dispatchEach(descriptor.changeListeners, key, value, this);
                        } finally {
                            descriptor.isActive = false;
                        }
                    }
                }
            },
            enumerable: overriddenDescriptor.enumerable,
            configurable: true
        };
    } else { // 'get' or 'set', but not necessarily both
        propertyListener = {
            get: overriddenDescriptor.get,
            set: function (value) {
                var formerValue = this[key],
                    descriptor,
                    isActive;

                overriddenDescriptor.set.call(this, value);
                value = this[key];
                if (value !== formerValue) {
                    descriptor = this.__propertyChangeListeners__[key];
                    isActive = descriptor.isActive;
                    if (!isActive) {
                        descriptor.isActive = true;
                        try {
                            dispatchEach(descriptor.willChangeListeners, key, formerValue, this);
                        } finally {}
                    }
                    state[key] = value;
                    if (!isActive) {
                        try {
                            dispatchEach(descriptor.changeListeners, key, value, this);
                        } finally {
                            descriptor.isActive = false;
                        }
                    }
                }
            },
            enumerable: overriddenDescriptor.enumerable,
            configurable: true
        };
    }

    Object.defineProperty(this, key, propertyListener);
};

// constructor functions

PropertyChanges.getOwnPropertyChangeDescriptor = function (object, key) {
    if (object.getOwnPropertyChangeDescriptor) {
        return object.getOwnPropertyChangeDescriptor(key);
    } else {
        return PropertyChanges.prototype.getOwnPropertyChangeDescriptor.call(object, key);
    }
};

PropertyChanges.hasOwnPropertyChangeDescriptor = function (object, key) {
    if (object.hasOwnPropertyChangeDescriptor) {
        return object.hasOwnPropertyChangeDescriptor(key);
    } else {
        return PropertyChanges.prototype.hasOwnPropertyChangeDescriptor.call(object, key);
    }
};

PropertyChanges.addOwnPropertyChangeListener = function (object, key, listener, beforeChange) {
    if (!Object.isObject(object)) {
    } else if (object.addOwnPropertyChangeListener) {
        return object.addOwnPropertyChangeListener(key, listener, beforeChange);
    } else {
        return PropertyChanges.prototype.addOwnPropertyChangeListener.call(object, key, listener, beforeChange);
    }
};

PropertyChanges.removeOwnPropertyChangeListener = function (object, key, listener, beforeChange) {
    if (!Object.isObject(object)) {
    } else if (object.removeOwnPropertyChangeListener) {
        return object.removeOwnPropertyChangeListener(key, listener, beforeChange);
    } else {
        return PropertyChanges.prototype.removeOwnPropertyChangeListener.call(object, key, listener, beforeChange);
    }
};

PropertyChanges.dispatchOwnPropertyChange = function (object, key, value, beforeChange) {
    if (!Object.isObject(object)) {
    } else if (object.dispatchOwnPropertyChange) {
        return object.dispatchOwnPropertyChange(key, value, beforeChange);
    } else {
        return PropertyChanges.prototype.dispatchOwnPropertyChange.call(object, key, value, beforeChange);
    }
};

PropertyChanges.addBeforeOwnPropertyChangeListener = function (object, key, listener) {
    return PropertyChanges.addOwnPropertyChangeListener(object, key, listener, true);
};

PropertyChanges.removeBeforeOwnPropertyChangeListener = function (object, key, listener) {
    return PropertyChanges.removeOwnPropertyChangeListener(object, key, listener, true);
};

PropertyChanges.dispatchBeforeOwnPropertyChange = function (object, key, value) {
    return PropertyChanges.dispatchOwnPropertyChange(object, key, value, true);
};

PropertyChanges.makePropertyObservable = function (object, key) {
    if (object.makePropertyObservable) {
        return object.makePropertyObservable(key);
    } else {
        return PropertyChanges.prototype.makePropertyObservable.call(object, key);
    }
};

},{"../shim":21}],16:[function(require,module,exports){
"use strict";

var WeakMap = require("weak-map");
var Dict = require("../dict");

var rangeChangeDescriptors = new WeakMap(); // {isActive, willChangeListeners, changeListeners}

module.exports = RangeChanges;
function RangeChanges() {
    throw new Error("Can't construct. RangeChanges is a mixin.");
}

RangeChanges.prototype.getAllRangeChangeDescriptors = function () {
    if (!rangeChangeDescriptors.has(this)) {
        rangeChangeDescriptors.set(this, Dict());
    }
    return rangeChangeDescriptors.get(this);
};

RangeChanges.prototype.getRangeChangeDescriptor = function (token) {
    var tokenChangeDescriptors = this.getAllRangeChangeDescriptors();
    token = token || "";
    if (!tokenChangeDescriptors.has(token)) {
        tokenChangeDescriptors.set(token, {
            isActive: false,
            changeListeners: [],
            willChangeListeners: []
        });
    }
    return tokenChangeDescriptors.get(token);
};

RangeChanges.prototype.addRangeChangeListener = function (listener, token, beforeChange) {
    // a concession for objects like Array that are not inherently observable
    if (!this.isObservable && this.makeObservable) {
        this.makeObservable();
    }

    var descriptor = this.getRangeChangeDescriptor(token);

    var listeners;
    if (beforeChange) {
        listeners = descriptor.willChangeListeners;
    } else {
        listeners = descriptor.changeListeners;
    }

    // even if already registered
    listeners.push(listener);
    Object.defineProperty(this, "dispatchesRangeChanges", {
        value: true,
        writable: true,
        configurable: true,
        enumerable: false
    });

    var self = this;
    return function cancelRangeChangeListener() {
        if (!self) {
            // TODO throw new Error("Range change listener " + JSON.stringify(token) + " has already been canceled");
            return;
        }
        self.removeRangeChangeListener(listener, token, beforeChange);
        self = null;
    };
};

RangeChanges.prototype.removeRangeChangeListener = function (listener, token, beforeChange) {
    var descriptor = this.getRangeChangeDescriptor(token);

    var listeners;
    if (beforeChange) {
        listeners = descriptor.willChangeListeners;
    } else {
        listeners = descriptor.changeListeners;
    }

    var index = listeners.lastIndexOf(listener);
    if (index === -1) {
        throw new Error("Can't remove range change listener: does not exist: token " + JSON.stringify(token));
    }
    listeners.splice(index, 1);
};

RangeChanges.prototype.dispatchRangeChange = function (plus, minus, index, beforeChange) {
    var descriptors = this.getAllRangeChangeDescriptors();
    var changeName = "Range" + (beforeChange ? "WillChange" : "Change");
    descriptors.forEach(function (descriptor, token) {

        if (descriptor.isActive) {
            return;
        } else {
            descriptor.isActive = true;
        }

        // before or after
        var listeners;
        if (beforeChange) {
            listeners = descriptor.willChangeListeners;
        } else {
            listeners = descriptor.changeListeners;
        }

        var tokenName = "handle" + (
            token.slice(0, 1).toUpperCase() +
            token.slice(1)
        ) + changeName;
        // notably, defaults to "handleRangeChange" or "handleRangeWillChange"
        // if token is "" (the default)

        // dispatch each listener
        try {
            listeners.slice().forEach(function (listener) {
                if (listeners.indexOf(listener) < 0) {
                    return;
                }
                if (listener[tokenName]) {
                    listener[tokenName](plus, minus, index, this, beforeChange);
                } else if (listener.call) {
                    listener.call(this, plus, minus, index, this, beforeChange);
                } else {
                    throw new Error("Handler " + listener + " has no method " + tokenName + " and is not callable");
                }
            }, this);
        } finally {
            descriptor.isActive = false;
        }
    }, this);
};

RangeChanges.prototype.addBeforeRangeChangeListener = function (listener, token) {
    return this.addRangeChangeListener(listener, token, true);
};

RangeChanges.prototype.removeBeforeRangeChangeListener = function (listener, token) {
    return this.removeRangeChangeListener(listener, token, true);
};

RangeChanges.prototype.dispatchBeforeRangeChange = function (plus, minus, index) {
    return this.dispatchRangeChange(plus, minus, index, true);
};


},{"../dict":7,"weak-map":23}],17:[function(require,module,exports){
"use strict";

/*
    Based in part on extras from Motorola Mobility’s Montage
    Copyright (c) 2012, Motorola Mobility LLC. All Rights Reserved.
    3-Clause BSD License
    https://github.com/motorola-mobility/montage/blob/master/LICENSE.md
*/

var Function = require("./shim-function");
var GenericCollection = require("./generic-collection");
var GenericOrder = require("./generic-order");
var WeakMap = require("weak-map");

module.exports = Array;

var array_splice = Array.prototype.splice;
var array_slice = Array.prototype.slice;

Array.empty = [];

if (Object.freeze) {
    Object.freeze(Array.empty);
}

Array.from = function (values) {
    var array = [];
    array.addEach(values);
    return array;
};

Array.unzip = function (table) {
    var transpose = [];
    var length = Infinity;
    // compute shortest row
    for (var i = 0; i < table.length; i++) {
        var row = table[i];
        table[i] = row.toArray();
        if (row.length < length) {
            length = row.length;
        }
    }
    for (var i = 0; i < table.length; i++) {
        var row = table[i];
        for (var j = 0; j < row.length; j++) {
            if (j < length && j in row) {
                transpose[j] = transpose[j] || [];
                transpose[j][i] = row[j];
            }
        }
    }
    return transpose;
};

function define(key, value) {
    Object.defineProperty(Array.prototype, key, {
        value: value,
        writable: true,
        configurable: true,
        enumerable: false
    });
}

define("addEach", GenericCollection.prototype.addEach);
define("deleteEach", GenericCollection.prototype.deleteEach);
define("toArray", GenericCollection.prototype.toArray);
define("toObject", GenericCollection.prototype.toObject);
define("all", GenericCollection.prototype.all);
define("any", GenericCollection.prototype.any);
define("min", GenericCollection.prototype.min);
define("max", GenericCollection.prototype.max);
define("sum", GenericCollection.prototype.sum);
define("average", GenericCollection.prototype.average);
define("only", GenericCollection.prototype.only);
define("flatten", GenericCollection.prototype.flatten);
define("zip", GenericCollection.prototype.zip);
define("enumerate", GenericCollection.prototype.enumerate);
define("group", GenericCollection.prototype.group);
define("sorted", GenericCollection.prototype.sorted);
define("reversed", GenericCollection.prototype.reversed);

define("constructClone", function (values) {
    var clone = new this.constructor();
    clone.addEach(values);
    return clone;
});

define("has", function (value, equals) {
    return this.find(value, equals) !== -1;
});

define("get", function (index, defaultValue) {
    if (+index !== index)
        throw new Error("Indicies must be numbers");
    if (!index in this) {
        return defaultValue;
    } else {
        return this[index];
    }
});

define("set", function (index, value) {
    this[index] = value;
    return true;
});

define("add", function (value) {
    this.push(value);
    return true;
});

define("delete", function (value, equals) {
    var index = this.find(value, equals);
    if (index !== -1) {
        this.splice(index, 1);
        return true;
    }
    return false;
});

define("deleteAll", function (value, equals) {
    equals = equals || this.contentEquals || Object.equals;
    var count = 0;
    for (var index = 0; index < this.length;) {
        if (equals(value, this[index])) {
            this.swap(index, 1);
            count++;
        } else {
            index++;
        }
    }
    return count;
});

define("find", function (value, equals) {
    equals = equals || this.contentEquals || Object.equals;
    for (var index = 0; index < this.length; index++) {
        if (index in this && equals(value, this[index])) {
            return index;
        }
    }
    return -1;
});

define("findLast", function (value, equals) {
    equals = equals || this.contentEquals || Object.equals;
    var index = this.length;
    do {
        index--;
        if (index in this && equals(this[index], value)) {
            return index;
        }
    } while (index > 0);
    return -1;
});

define("swap", function (start, length, plus) {
    var args, plusLength, i, j, returnValue;
    if (start > this.length) {
        this.length = start;
    }
    if (typeof plus !== "undefined") {
        args = [start, length];
        if (!Array.isArray(plus)) {
            plus = array_slice.call(plus);
        }
        i = 0;
        plusLength = plus.length;
        // 1000 is a magic number, presumed to be smaller than the remaining
        // stack length. For swaps this small, we take the fast path and just
        // use the underlying Array splice. We could measure the exact size of
        // the remaining stack using a try/catch around an unbounded recursive
        // function, but this would defeat the purpose of short-circuiting in
        // the common case.
        if (plusLength < 1000) {
            for (i; i < plusLength; i++) {
                args[i+2] = plus[i];
            }
            return array_splice.apply(this, args);
        } else {
            // Avoid maximum call stack error.
            // First delete the desired entries.
            returnValue = array_splice.apply(this, args);
            // Second batch in 1000s.
            for (i; i < plusLength;) {
                args = [start+i, 0];
                for (j = 2; j < 1002 && i < plusLength; j++, i++) {
                    args[j] = plus[i];
                }
                array_splice.apply(this, args);
            }
            return returnValue;
        }
    // using call rather than apply to cut down on transient objects
    } else if (typeof length !== "undefined") {
        return array_splice.call(this, start, length);
    }  else if (typeof start !== "undefined") {
        return array_splice.call(this, start);
    } else {
        return [];
    }
});

define("peek", function () {
    return this[0];
});

define("poke", function (value) {
    if (this.length > 0) {
        this[0] = value;
    }
});

define("peekBack", function () {
    if (this.length > 0) {
        return this[this.length - 1];
    }
});

define("pokeBack", function (value) {
    if (this.length > 0) {
        this[this.length - 1] = value;
    }
});

define("one", function () {
    for (var i in this) {
        if (Object.owns(this, i)) {
            return this[i];
        }
    }
});

if (!Array.prototype.clear) {
    define("clear", function () {
        this.length = 0;
        return this;
    });
}

define("compare", function (that, compare) {
    compare = compare || Object.compare;
    var i;
    var length;
    var lhs;
    var rhs;
    var relative;

    if (this === that) {
        return 0;
    }

    if (!that || !Array.isArray(that)) {
        return GenericOrder.prototype.compare.call(this, that, compare);
    }

    length = Math.min(this.length, that.length);

    for (i = 0; i < length; i++) {
        if (i in this) {
            if (!(i in that)) {
                return -1;
            } else {
                lhs = this[i];
                rhs = that[i];
                relative = compare(lhs, rhs);
                if (relative) {
                    return relative;
                }
            }
        } else if (i in that) {
            return 1;
        }
    }

    return this.length - that.length;
});

define("equals", function (that, equals) {
    equals = equals || Object.equals;
    var i = 0;
    var length = this.length;
    var left;
    var right;

    if (this === that) {
        return true;
    }
    if (!that || !Array.isArray(that)) {
        return GenericOrder.prototype.equals.call(this, that);
    }

    if (length !== that.length) {
        return false;
    } else {
        for (; i < length; ++i) {
            if (i in this) {
                if (!(i in that)) {
                    return false;
                }
                left = this[i];
                right = that[i];
                if (!equals(left, right)) {
                    return false;
                }
            } else {
                if (i in that) {
                    return false;
                }
            }
        }
    }
    return true;
});

define("clone", function (depth, memo) {
    if (depth == null) {
        depth = Infinity;
    } else if (depth === 0) {
        return this;
    }
    memo = memo || new WeakMap();
    if (memo.has(this)) {
        return memo.get(this);
    }
    var clone = new Array(this.length);
    memo.set(this, clone);
    for (var i in this) {
        clone[i] = Object.clone(this[i], depth - 1, memo);
    };
    return clone;
});

define("iterate", function (start, end) {
    return new ArrayIterator(this, start, end);
});

define("Iterator", ArrayIterator);

function ArrayIterator(array, start, end) {
    this.array = array;
    this.start = start == null ? 0 : start;
    this.end = end;
};
ArrayIterator.prototype.__iterationObject = null;
Object.defineProperty(ArrayIterator.prototype,"_iterationObject", {
    get: function() {
        return this.__iterationObject || (this.__iterationObject = { done: false, value:null});
    }
});

ArrayIterator.prototype.next = function () {
    if (this.start === (this.end == null ? this.array.length : this.end)) {
        this._iterationObject.done = true;
        this._iterationObject.value = void 0;
    } else {
        this._iterationObject.value = this.array[this.start++];
    }
    return this._iterationObject;
};

},{"./generic-collection":9,"./generic-order":11,"./shim-function":18,"weak-map":23}],18:[function(require,module,exports){

module.exports = Function;

/**
    A utility to reduce unnecessary allocations of <code>function () {}</code>
    in its many colorful variations.  It does nothing and returns
    <code>undefined</code> thus makes a suitable default in some circumstances.

    @function external:Function.noop
*/
Function.noop = function () {
};

/**
    A utility to reduce unnecessary allocations of <code>function (x) {return
    x}</code> in its many colorful but ultimately wasteful parameter name
    variations.

    @function external:Function.identity
    @param {Any} any value
    @returns {Any} that value
*/
Function.identity = function (value) {
    return value;
};

/**
    A utility for creating a comparator function for a particular aspect of a
    figurative class of objects.

    @function external:Function.by
    @param {Function} relation A function that accepts a value and returns a
    corresponding value to use as a representative when sorting that object.
    @param {Function} compare an alternate comparator for comparing the
    represented values.  The default is <code>Object.compare</code>, which
    does a deep, type-sensitive, polymorphic comparison.
    @returns {Function} a comparator that has been annotated with
    <code>by</code> and <code>compare</code> properties so
    <code>sorted</code> can perform a transform that reduces the need to call
    <code>by</code> on each sorted object to just once.
 */
Function.by = function (by , compare) {
    compare = compare || Object.compare;
    by = by || Function.identity;
    var compareBy = function (a, b) {
        return compare(by(a), by(b));
    };
    compareBy.compare = compare;
    compareBy.by = by;
    return compareBy;
};

// TODO document
Function.get = function (key) {
    return function (object) {
        return Object.get(object, key);
    };
};


},{}],19:[function(require,module,exports){
"use strict";

var WeakMap = require("weak-map");

module.exports = Object;

/*
    Based in part on extras from Motorola Mobility’s Montage
    Copyright (c) 2012, Motorola Mobility LLC. All Rights Reserved.
    3-Clause BSD License
    https://github.com/motorola-mobility/montage/blob/master/LICENSE.md
*/

/**
    Defines extensions to intrinsic <code>Object</code>.
    @see [Object class]{@link external:Object}
*/

/**
    A utility object to avoid unnecessary allocations of an empty object
    <code>{}</code>.  This object is frozen so it is safe to share.

    @object external:Object.empty
*/
Object.empty = Object.freeze(Object.create(null));

/**
    Returns whether the given value is an object, as opposed to a value.
    Unboxed numbers, strings, true, false, undefined, and null are not
    objects.  Arrays are objects.

    @function external:Object.isObject
    @param {Any} value
    @returns {Boolean} whether the given value is an object
*/
Object.isObject = function (object) {
    return Object(object) === object;
};

/**
    Returns the value of an any value, particularly objects that
    implement <code>valueOf</code>.

    <p>Note that, unlike the precedent of methods like
    <code>Object.equals</code> and <code>Object.compare</code> would suggest,
    this method is named <code>Object.getValueOf</code> instead of
    <code>valueOf</code>.  This is a delicate issue, but the basis of this
    decision is that the JavaScript runtime would be far more likely to
    accidentally call this method with no arguments, assuming that it would
    return the value of <code>Object</code> itself in various situations,
    whereas <code>Object.equals(Object, null)</code> protects against this case
    by noting that <code>Object</code> owns the <code>equals</code> property
    and therefore does not delegate to it.

    @function external:Object.getValueOf
    @param {Any} value a value or object wrapping a value
    @returns {Any} the primitive value of that object, if one exists, or passes
    the value through
*/
Object.getValueOf = function (value) {
    if (value && typeof value.valueOf === "function") {
        value = value.valueOf();
    }
    return value;
};

var hashMap = new WeakMap();
Object.hash = function (object) {
    if (object && typeof object.hash === "function") {
        return "" + object.hash();
    } else if (Object(object) === object) {
        if (!hashMap.has(object)) {
            hashMap.set(object, Math.random().toString(36).slice(2));
        }
        return hashMap.get(object);
    } else {
        return "" + object;
    }
};

/**
    A shorthand for <code>Object.prototype.hasOwnProperty.call(object,
    key)</code>.  Returns whether the object owns a property for the given key.
    It does not consult the prototype chain and works for any string (including
    "hasOwnProperty") except "__proto__".

    @function external:Object.owns
    @param {Object} object
    @param {String} key
    @returns {Boolean} whether the object owns a property wfor the given key.
*/
var owns = Object.prototype.hasOwnProperty;
Object.owns = function (object, key) {
    return owns.call(object, key);
};

/**
    A utility that is like Object.owns but is also useful for finding
    properties on the prototype chain, provided that they do not refer to
    methods on the Object prototype.  Works for all strings except "__proto__".

    <p>Alternately, you could use the "in" operator as long as the object
    descends from "null" instead of the Object.prototype, as with
    <code>Object.create(null)</code>.  However,
    <code>Object.create(null)</code> only works in fully compliant EcmaScript 5
    JavaScript engines and cannot be faithfully shimmed.

    <p>If the given object is an instance of a type that implements a method
    named "has", this function defers to the collection, so this method can be
    used to generically handle objects, arrays, or other collections.  In that
    case, the domain of the key depends on the instance.

    @param {Object} object
    @param {String} key
    @returns {Boolean} whether the object, or any of its prototypes except
    <code>Object.prototype</code>
    @function external:Object.has
*/
Object.has = function (object, key) {
    if (typeof object !== "object") {
        throw new Error("Object.has can't accept non-object: " + typeof object);
    }
    // forward to mapped collections that implement "has"
    if (object && typeof object.has === "function") {
        return object.has(key);
    // otherwise report whether the key is on the prototype chain,
    // as long as it is not one of the methods on object.prototype
    } else if (typeof key === "string") {
        return key in object && object[key] !== Object.prototype[key];
    } else {
        throw new Error("Key must be a string for Object.has on plain objects");
    }
};

/**
    Gets the value for a corresponding key from an object.

    <p>Uses Object.has to determine whether there is a corresponding value for
    the given key.  As such, <code>Object.get</code> is capable of retriving
    values from the prototype chain as long as they are not from the
    <code>Object.prototype</code>.

    <p>If there is no corresponding value, returns the given default, which may
    be <code>undefined</code>.

    <p>If the given object is an instance of a type that implements a method
    named "get", this function defers to the collection, so this method can be
    used to generically handle objects, arrays, or other collections.  In that
    case, the domain of the key depends on the implementation.  For a `Map`,
    for example, the key might be any object.

    @param {Object} object
    @param {String} key
    @param {Any} value a default to return, <code>undefined</code> if omitted
    @returns {Any} value for key, or default value
    @function external:Object.get
*/
Object.get = function (object, key, value) {
    if (typeof object !== "object") {
        throw new Error("Object.get can't accept non-object: " + typeof object);
    }
    // forward to mapped collections that implement "get"
    if (object && typeof object.get === "function") {
        return object.get(key, value);
    } else if (Object.has(object, key)) {
        return object[key];
    } else {
        return value;
    }
};

/**
    Sets the value for a given key on an object.

    <p>If the given object is an instance of a type that implements a method
    named "set", this function defers to the collection, so this method can be
    used to generically handle objects, arrays, or other collections.  As such,
    the key domain varies by the object type.

    @param {Object} object
    @param {String} key
    @param {Any} value
    @returns <code>undefined</code>
    @function external:Object.set
*/
Object.set = function (object, key, value) {
    if (object && typeof object.set === "function") {
        object.set(key, value);
    } else {
        object[key] = value;
    }
};

Object.addEach = function (target, source) {
    if (!source) {
    } else if (typeof source.forEach === "function" && !source.hasOwnProperty("forEach")) {
        // copy map-alikes
        if (source.isMap === true) {
            source.forEach(function (value, key) {
                target[key] = value;
            });
        // iterate key value pairs of other iterables
        } else {
            source.forEach(function (pair) {
                target[pair[0]] = pair[1];
            });
        }
    } else if (typeof source.length === "number") {
        // arguments, strings
        for (var index = 0; index < source.length; index++) {
            target[index] = source[index];
        }
    } else {
        // copy other objects as map-alikes
        Object.keys(source).forEach(function (key) {
            target[key] = source[key];
        });
    }
    return target;
};

/**
    Iterates over the owned properties of an object.

    @function external:Object.forEach
    @param {Object} object an object to iterate.
    @param {Function} callback a function to call for every key and value
    pair in the object.  Receives <code>value</code>, <code>key</code>,
    and <code>object</code> as arguments.
    @param {Object} thisp the <code>this</code> to pass through to the
    callback
*/
Object.forEach = function (object, callback, thisp) {

    var keys = Object.keys(object), i = 0, iKey;
    for(;(iKey = keys[i]);i++) {
        callback.call(thisp, object[iKey], iKey, object);
    }

};

/**
    Iterates over the owned properties of a map, constructing a new array of
    mapped values.

    @function external:Object.map
    @param {Object} object an object to iterate.
    @param {Function} callback a function to call for every key and value
    pair in the object.  Receives <code>value</code>, <code>key</code>,
    and <code>object</code> as arguments.
    @param {Object} thisp the <code>this</code> to pass through to the
    callback
    @returns {Array} the respective values returned by the callback for each
    item in the object.
*/
Object.map = function (object, callback, thisp) {
    var keys = Object.keys(object), i = 0, result = [], iKey;
    for(;(iKey = keys[i]);i++) {
        result.push(callback.call(thisp, object[iKey], iKey, object));
    }
    return result;
};

/**
    Returns the values for owned properties of an object.

    @function external:Object.map
    @param {Object} object
    @returns {Array} the respective value for each owned property of the
    object.
*/
Object.values = function (object) {
    return Object.map(object, Function.identity);
};

// TODO inline document concat
Object.concat = function () {
    var object = {};
    for (var i = 0; i < arguments.length; i++) {
        Object.addEach(object, arguments[i]);
    }
    return object;
};

Object.from = Object.concat;

/**
    Returns whether two values are identical.  Any value is identical to itself
    and only itself.  This is much more restictive than equivalence and subtly
    different than strict equality, <code>===</code> because of edge cases
    including negative zero and <code>NaN</code>.  Identity is useful for
    resolving collisions among keys in a mapping where the domain is any value.
    This method does not delgate to any method on an object and cannot be
    overridden.
    @see http://wiki.ecmascript.org/doku.php?id=harmony:egal
    @param {Any} this
    @param {Any} that
    @returns {Boolean} whether this and that are identical
    @function external:Object.is
*/
Object.is = function (x, y) {
    if (x === y) {
        // 0 === -0, but they are not identical
        return x !== 0 || 1 / x === 1 / y;
    }
    // NaN !== NaN, but they are identical.
    // NaNs are the only non-reflexive value, i.e., if x !== x,
    // then x is a NaN.
    // isNaN is broken: it converts its argument to number, so
    // isNaN("foo") => true
    return x !== x && y !== y;
};

/**
    Performs a polymorphic, type-sensitive deep equivalence comparison of any
    two values.

    <p>As a basic principle, any value is equivalent to itself (as in
    identity), any boxed version of itself (as a <code>new Number(10)</code> is
    to 10), and any deep clone of itself.

    <p>Equivalence has the following properties:

    <ul>
        <li><strong>polymorphic:</strong>
            If the given object is an instance of a type that implements a
            methods named "equals", this function defers to the method.  So,
            this function can safely compare any values regardless of type,
            including undefined, null, numbers, strings, any pair of objects
            where either implements "equals", or object literals that may even
            contain an "equals" key.
        <li><strong>type-sensitive:</strong>
            Incomparable types are not equal.  No object is equivalent to any
            array.  No string is equal to any other number.
        <li><strong>deep:</strong>
            Collections with equivalent content are equivalent, recursively.
        <li><strong>equivalence:</strong>
            Identical values and objects are equivalent, but so are collections
            that contain equivalent content.  Whether order is important varies
            by type.  For Arrays and lists, order is important.  For Objects,
            maps, and sets, order is not important.  Boxed objects are mutally
            equivalent with their unboxed values, by virtue of the standard
            <code>valueOf</code> method.
    </ul>
    @param this
    @param that
    @returns {Boolean} whether the values are deeply equivalent
    @function external:Object.equals
*/
Object.equals = function (a, b, equals, memo) {
    equals = equals || Object.equals;
    // unbox objects, but do not confuse object literals
    a = Object.getValueOf(a);
    b = Object.getValueOf(b);
    if (a === b)
        return true;
    if (Object.isObject(a)) {
        memo = memo || new WeakMap();
        if (memo.has(a)) {
            return true;
        }
        memo.set(a, true);
    }
    if (Object.isObject(a) && typeof a.equals === "function") {
        return a.equals(b, equals, memo);
    }
    // commutative
    if (Object.isObject(b) && typeof b.equals === "function") {
        return b.equals(a, equals, memo);
    }
    if (Object.isObject(a) && Object.isObject(b)) {
        if (Object.getPrototypeOf(a) === Object.prototype && Object.getPrototypeOf(b) === Object.prototype) {
            for (var name in a) {
                if (!equals(a[name], b[name], equals, memo)) {
                    return false;
                }
            }
            for (var name in b) {
                if (!(name in a) || !equals(b[name], a[name], equals, memo)) {
                    return false;
                }
            }
            return true;
        }
    }
    // NaN !== NaN, but they are equal.
    // NaNs are the only non-reflexive value, i.e., if x !== x,
    // then x is a NaN.
    // isNaN is broken: it converts its argument to number, so
    // isNaN("foo") => true
    // We have established that a !== b, but if a !== a && b !== b, they are
    // both NaN.
    if (a !== a && b !== b)
        return true;
    if (!a || !b)
        return a === b;
    return false;
};

// Because a return value of 0 from a `compare` function  may mean either
// "equals" or "is incomparable", `equals` cannot be defined in terms of
// `compare`.  However, `compare` *can* be defined in terms of `equals` and
// `lessThan`.  Again however, more often it would be desirable to implement
// all of the comparison functions in terms of compare rather than the other
// way around.

/**
    Determines the order in which any two objects should be sorted by returning
    a number that has an analogous relationship to zero as the left value to
    the right.  That is, if the left is "less than" the right, the returned
    value will be "less than" zero, where "less than" may be any other
    transitive relationship.

    <p>Arrays are compared by the first diverging values, or by length.

    <p>Any two values that are incomparable return zero.  As such,
    <code>equals</code> should not be implemented with <code>compare</code>
    since incomparability is indistinguishable from equality.

    <p>Sorts strings lexicographically.  This is not suitable for any
    particular international setting.  Different locales sort their phone books
    in very different ways, particularly regarding diacritics and ligatures.

    <p>If the given object is an instance of a type that implements a method
    named "compare", this function defers to the instance.  The method does not
    need to be an owned property to distinguish it from an object literal since
    object literals are incomparable.  Unlike <code>Object</code> however,
    <code>Array</code> implements <code>compare</code>.

    @param {Any} left
    @param {Any} right
    @returns {Number} a value having the same transitive relationship to zero
    as the left and right values.
    @function external:Object.compare
*/
Object.compare = function (a, b) {
    // unbox objects, but do not confuse object literals
    // mercifully handles the Date case
    a = Object.getValueOf(a);
    b = Object.getValueOf(b);
    if (a === b)
        return 0;
    var aType = typeof a;
    var bType = typeof b;
    if (aType === "number" && bType === "number")
        return a - b;
    if (aType === "string" && bType === "string")
        return a < b ? -Infinity : Infinity;
        // the possibility of equality elimiated above
    if (a && typeof a.compare === "function")
        return a.compare(b);
    // not commutative, the relationship is reversed
    if (b && typeof b.compare === "function")
        return -b.compare(a);
    return 0;
};

/**
    Creates a deep copy of any value.  Values, being immutable, are
    returned without alternation.  Forwards to <code>clone</code> on
    objects and arrays.

    @function external:Object.clone
    @param {Any} value a value to clone
    @param {Number} depth an optional traversal depth, defaults to infinity.
    A value of <code>0</code> means to make no clone and return the value
    directly.
    @param {Map} memo an optional memo of already visited objects to preserve
    reference cycles.  The cloned object will have the exact same shape as the
    original, but no identical objects.  Te map may be later used to associate
    all objects in the original object graph with their corresponding member of
    the cloned graph.
    @returns a copy of the value
*/
Object.clone = function (value, depth, memo) {
    value = Object.getValueOf(value);
    memo = memo || new WeakMap();
    if (depth === undefined) {
        depth = Infinity;
    } else if (depth === 0) {
        return value;
    }
    if (Object.isObject(value)) {
        if (!memo.has(value)) {
            if (value && typeof value.clone === "function") {
                memo.set(value, value.clone(depth, memo));
            } else {
                var prototype = Object.getPrototypeOf(value);
                if (prototype === null || prototype === Object.prototype) {
                    var clone = Object.create(prototype);
                    memo.set(value, clone);
                    for (var key in value) {
                        clone[key] = Object.clone(value[key], depth - 1, memo);
                    }
                } else {
                    throw new Error("Can't clone " + value);
                }
            }
        }
        return memo.get(value);
    }
    return value;
};

/**
    Removes all properties owned by this object making the object suitable for
    reuse.

    @function external:Object.clear
    @returns this
*/
Object.clear = function (object) {
    if (object && typeof object.clear === "function") {
        object.clear();
    } else {
        var keys = Object.keys(object),
            i = keys.length;
        while (i) {
            i--;
            delete object[keys[i]];
        }
    }
    return object;
};

},{"weak-map":23}],20:[function(require,module,exports){

/**
    accepts a string; returns the string with regex metacharacters escaped.
    the returned string can safely be used within a regex to match a literal
    string. escaped characters are [, ], {, }, (, ), -, *, +, ?, ., \, ^, $,
    |, #, [comma], and whitespace.
*/
if (!RegExp.escape) {
    var special = /[-[\]{}()*+?.\\^$|,#\s]/g;
    RegExp.escape = function (string) {
        return string.replace(special, "\\$&");
    };
}


},{}],21:[function(require,module,exports){

var Array = require("./shim-array");
var Object = require("./shim-object");
var Function = require("./shim-function");
var RegExp = require("./shim-regexp");


},{"./shim-array":17,"./shim-function":18,"./shim-object":19,"./shim-regexp":20}],22:[function(require,module,exports){
"use strict";

module.exports = TreeLog;

function TreeLog() {
}

TreeLog.ascii = {
    intersection: "+",
    through: "-",
    branchUp: "+",
    branchDown: "+",
    fromBelow: ".",
    fromAbove: "'",
    fromBoth: "+",
    strafe: "|"
};

TreeLog.unicodeRound = {
    intersection: "\u254b",
    through: "\u2501",
    branchUp: "\u253b",
    branchDown: "\u2533",
    fromBelow: "\u256d", // round corner
    fromAbove: "\u2570", // round corner
    fromBoth: "\u2523",
    strafe: "\u2503"
};

TreeLog.unicodeSharp = {
    intersection: "\u254b",
    through: "\u2501",
    branchUp: "\u253b",
    branchDown: "\u2533",
    fromBelow: "\u250f", // sharp corner
    fromAbove: "\u2517", // sharp corner
    fromBoth: "\u2523",
    strafe: "\u2503"
};


},{}],23:[function(require,module,exports){
// Copyright (C) 2011 Google Inc.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
// http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * @fileoverview Install a leaky WeakMap emulation on platforms that
 * don't provide a built-in one.
 *
 * <p>Assumes that an ES5 platform where, if {@code WeakMap} is
 * already present, then it conforms to the anticipated ES6
 * specification. To run this file on an ES5 or almost ES5
 * implementation where the {@code WeakMap} specification does not
 * quite conform, run <code>repairES5.js</code> first.
 *
 * <p>Even though WeakMapModule is not global, the linter thinks it
 * is, which is why it is in the overrides list below.
 *
 * <p>NOTE: Before using this WeakMap emulation in a non-SES
 * environment, see the note below about hiddenRecord.
 *
 * @author Mark S. Miller
 * @requires crypto, ArrayBuffer, Uint8Array, navigator, console
 * @overrides WeakMap, ses, Proxy
 * @overrides WeakMapModule
 */

/**
 * This {@code WeakMap} emulation is observably equivalent to the
 * ES-Harmony WeakMap, but with leakier garbage collection properties.
 *
 * <p>As with true WeakMaps, in this emulation, a key does not
 * retain maps indexed by that key and (crucially) a map does not
 * retain the keys it indexes. A map by itself also does not retain
 * the values associated with that map.
 *
 * <p>However, the values associated with a key in some map are
 * retained so long as that key is retained and those associations are
 * not overridden. For example, when used to support membranes, all
 * values exported from a given membrane will live for the lifetime
 * they would have had in the absence of an interposed membrane. Even
 * when the membrane is revoked, all objects that would have been
 * reachable in the absence of revocation will still be reachable, as
 * far as the GC can tell, even though they will no longer be relevant
 * to ongoing computation.
 *
 * <p>The API implemented here is approximately the API as implemented
 * in FF6.0a1 and agreed to by MarkM, Andreas Gal, and Dave Herman,
 * rather than the offially approved proposal page. TODO(erights):
 * upgrade the ecmascript WeakMap proposal page to explain this API
 * change and present to EcmaScript committee for their approval.
 *
 * <p>The first difference between the emulation here and that in
 * FF6.0a1 is the presence of non enumerable {@code get___, has___,
 * set___, and delete___} methods on WeakMap instances to represent
 * what would be the hidden internal properties of a primitive
 * implementation. Whereas the FF6.0a1 WeakMap.prototype methods
 * require their {@code this} to be a genuine WeakMap instance (i.e.,
 * an object of {@code [[Class]]} "WeakMap}), since there is nothing
 * unforgeable about the pseudo-internal method names used here,
 * nothing prevents these emulated prototype methods from being
 * applied to non-WeakMaps with pseudo-internal methods of the same
 * names.
 *
 * <p>Another difference is that our emulated {@code
 * WeakMap.prototype} is not itself a WeakMap. A problem with the
 * current FF6.0a1 API is that WeakMap.prototype is itself a WeakMap
 * providing ambient mutability and an ambient communications
 * channel. Thus, if a WeakMap is already present and has this
 * problem, repairES5.js wraps it in a safe wrappper in order to
 * prevent access to this channel. (See
 * PATCH_MUTABLE_FROZEN_WEAKMAP_PROTO in repairES5.js).
 */

/**
 * If this is a full <a href=
 * "http://code.google.com/p/es-lab/wiki/SecureableES5"
 * >secureable ES5</a> platform and the ES-Harmony {@code WeakMap} is
 * absent, install an approximate emulation.
 *
 * <p>If WeakMap is present but cannot store some objects, use our approximate
 * emulation as a wrapper.
 *
 * <p>If this is almost a secureable ES5 platform, then WeakMap.js
 * should be run after repairES5.js.
 *
 * <p>See {@code WeakMap} for documentation of the garbage collection
 * properties of this WeakMap emulation.
 */
(function WeakMapModule() {
  "use strict";

  if (typeof ses !== 'undefined' && ses.ok && !ses.ok()) {
    // already too broken, so give up
    return;
  }

  /**
   * In some cases (current Firefox), we must make a choice betweeen a
   * WeakMap which is capable of using all varieties of host objects as
   * keys and one which is capable of safely using proxies as keys. See
   * comments below about HostWeakMap and DoubleWeakMap for details.
   *
   * This function (which is a global, not exposed to guests) marks a
   * WeakMap as permitted to do what is necessary to index all host
   * objects, at the cost of making it unsafe for proxies.
   *
   * Do not apply this function to anything which is not a genuine
   * fresh WeakMap.
   */
  function weakMapPermitHostObjects(map) {
    // identity of function used as a secret -- good enough and cheap
    if (map.permitHostObjects___) {
      map.permitHostObjects___(weakMapPermitHostObjects);
    }
  }
  if (typeof ses !== 'undefined') {
    ses.weakMapPermitHostObjects = weakMapPermitHostObjects;
  }

  // IE 11 has no Proxy but has a broken WeakMap such that we need to patch
  // it using DoubleWeakMap; this flag tells DoubleWeakMap so.
  var doubleWeakMapCheckSilentFailure = false;

  // Check if there is already a good-enough WeakMap implementation, and if so
  // exit without replacing it.
  if (typeof WeakMap === 'function') {
    var HostWeakMap = WeakMap;
    // There is a WeakMap -- is it good enough?
    if (typeof navigator !== 'undefined' &&
        /Firefox/.test(navigator.userAgent)) {
      // We're now *assuming not*, because as of this writing (2013-05-06)
      // Firefox's WeakMaps have a miscellany of objects they won't accept, and
      // we don't want to make an exhaustive list, and testing for just one
      // will be a problem if that one is fixed alone (as they did for Event).

      // If there is a platform that we *can* reliably test on, here's how to
      // do it:
      //  var problematic = ... ;
      //  var testHostMap = new HostWeakMap();
      //  try {
      //    testHostMap.set(problematic, 1);  // Firefox 20 will throw here
      //    if (testHostMap.get(problematic) === 1) {
      //      return;
      //    }
      //  } catch (e) {}

    } else {
      // IE 11 bug: WeakMaps silently fail to store frozen objects.
      var testMap = new HostWeakMap();
      var testObject = Object.freeze({});
      testMap.set(testObject, 1);
      if (testMap.get(testObject) !== 1) {
        doubleWeakMapCheckSilentFailure = true;
        // Fall through to installing our WeakMap.
      } else {
        module.exports = WeakMap;
        return;
      }
    }
  }

  var hop = Object.prototype.hasOwnProperty;
  var gopn = Object.getOwnPropertyNames;
  var defProp = Object.defineProperty;
  var isExtensible = Object.isExtensible;

  /**
   * Security depends on HIDDEN_NAME being both <i>unguessable</i> and
   * <i>undiscoverable</i> by untrusted code.
   *
   * <p>Given the known weaknesses of Math.random() on existing
   * browsers, it does not generate unguessability we can be confident
   * of.
   *
   * <p>It is the monkey patching logic in this file that is intended
   * to ensure undiscoverability. The basic idea is that there are
   * three fundamental means of discovering properties of an object:
   * The for/in loop, Object.keys(), and Object.getOwnPropertyNames(),
   * as well as some proposed ES6 extensions that appear on our
   * whitelist. The first two only discover enumerable properties, and
   * we only use HIDDEN_NAME to name a non-enumerable property, so the
   * only remaining threat should be getOwnPropertyNames and some
   * proposed ES6 extensions that appear on our whitelist. We monkey
   * patch them to remove HIDDEN_NAME from the list of properties they
   * returns.
   *
   * <p>TODO(erights): On a platform with built-in Proxies, proxies
   * could be used to trap and thereby discover the HIDDEN_NAME, so we
   * need to monkey patch Proxy.create, Proxy.createFunction, etc, in
   * order to wrap the provided handler with the real handler which
   * filters out all traps using HIDDEN_NAME.
   *
   * <p>TODO(erights): Revisit Mike Stay's suggestion that we use an
   * encapsulated function at a not-necessarily-secret name, which
   * uses the Stiegler shared-state rights amplification pattern to
   * reveal the associated value only to the WeakMap in which this key
   * is associated with that value. Since only the key retains the
   * function, the function can also remember the key without causing
   * leakage of the key, so this doesn't violate our general gc
   * goals. In addition, because the name need not be a guarded
   * secret, we could efficiently handle cross-frame frozen keys.
   */
  var HIDDEN_NAME_PREFIX = 'weakmap:';
  var HIDDEN_NAME = HIDDEN_NAME_PREFIX + 'ident:' + Math.random() + '___';

  if (typeof crypto !== 'undefined' &&
      typeof crypto.getRandomValues === 'function' &&
      typeof ArrayBuffer === 'function' &&
      typeof Uint8Array === 'function') {
    var ab = new ArrayBuffer(25);
    var u8s = new Uint8Array(ab);
    crypto.getRandomValues(u8s);
    HIDDEN_NAME = HIDDEN_NAME_PREFIX + 'rand:' +
      Array.prototype.map.call(u8s, function(u8) {
        return (u8 % 36).toString(36);
      }).join('') + '___';
  }

  function isNotHiddenName(name) {
    return !(
        name.substr(0, HIDDEN_NAME_PREFIX.length) == HIDDEN_NAME_PREFIX &&
        name.substr(name.length - 3) === '___');
  }

  /**
   * Monkey patch getOwnPropertyNames to avoid revealing the
   * HIDDEN_NAME.
   *
   * <p>The ES5.1 spec requires each name to appear only once, but as
   * of this writing, this requirement is controversial for ES6, so we
   * made this code robust against this case. If the resulting extra
   * search turns out to be expensive, we can probably relax this once
   * ES6 is adequately supported on all major browsers, iff no browser
   * versions we support at that time have relaxed this constraint
   * without providing built-in ES6 WeakMaps.
   */
  defProp(Object, 'getOwnPropertyNames', {
    value: function fakeGetOwnPropertyNames(obj) {
      return gopn(obj).filter(isNotHiddenName);
    }
  });

  /**
   * getPropertyNames is not in ES5 but it is proposed for ES6 and
   * does appear in our whitelist, so we need to clean it too.
   */
  if ('getPropertyNames' in Object) {
    var originalGetPropertyNames = Object.getPropertyNames;
    defProp(Object, 'getPropertyNames', {
      value: function fakeGetPropertyNames(obj) {
        return originalGetPropertyNames(obj).filter(isNotHiddenName);
      }
    });
  }

  /**
   * <p>To treat objects as identity-keys with reasonable efficiency
   * on ES5 by itself (i.e., without any object-keyed collections), we
   * need to add a hidden property to such key objects when we
   * can. This raises several issues:
   * <ul>
   * <li>Arranging to add this property to objects before we lose the
   *     chance, and
   * <li>Hiding the existence of this new property from most
   *     JavaScript code.
   * <li>Preventing <i>certification theft</i>, where one object is
   *     created falsely claiming to be the key of an association
   *     actually keyed by another object.
   * <li>Preventing <i>value theft</i>, where untrusted code with
   *     access to a key object but not a weak map nevertheless
   *     obtains access to the value associated with that key in that
   *     weak map.
   * </ul>
   * We do so by
   * <ul>
   * <li>Making the name of the hidden property unguessable, so "[]"
   *     indexing, which we cannot intercept, cannot be used to access
   *     a property without knowing the name.
   * <li>Making the hidden property non-enumerable, so we need not
   *     worry about for-in loops or {@code Object.keys},
   * <li>monkey patching those reflective methods that would
   *     prevent extensions, to add this hidden property first,
   * <li>monkey patching those methods that would reveal this
   *     hidden property.
   * </ul>
   * Unfortunately, because of same-origin iframes, we cannot reliably
   * add this hidden property before an object becomes
   * non-extensible. Instead, if we encounter a non-extensible object
   * without a hidden record that we can detect (whether or not it has
   * a hidden record stored under a name secret to us), then we just
   * use the key object itself to represent its identity in a brute
   * force leaky map stored in the weak map, losing all the advantages
   * of weakness for these.
   */
  function getHiddenRecord(key) {
    if (key !== Object(key)) {
      throw new TypeError('Not an object: ' + key);
    }
    var hiddenRecord = key[HIDDEN_NAME];
    if (hiddenRecord && hiddenRecord.key === key) { return hiddenRecord; }
    if (!isExtensible(key)) {
      // Weak map must brute force, as explained in doc-comment above.
      return void 0;
    }

    // The hiddenRecord and the key point directly at each other, via
    // the "key" and HIDDEN_NAME properties respectively. The key
    // field is for quickly verifying that this hidden record is an
    // own property, not a hidden record from up the prototype chain.
    //
    // NOTE: Because this WeakMap emulation is meant only for systems like
    // SES where Object.prototype is frozen without any numeric
    // properties, it is ok to use an object literal for the hiddenRecord.
    // This has two advantages:
    // * It is much faster in a performance critical place
    // * It avoids relying on Object.create(null), which had been
    //   problematic on Chrome 28.0.1480.0. See
    //   https://code.google.com/p/google-caja/issues/detail?id=1687
    hiddenRecord = { key: key };

    // When using this WeakMap emulation on platforms where
    // Object.prototype might not be frozen and Object.create(null) is
    // reliable, use the following two commented out lines instead.
    // hiddenRecord = Object.create(null);
    // hiddenRecord.key = key;

    // Please contact us if you need this to work on platforms where
    // Object.prototype might not be frozen and
    // Object.create(null) might not be reliable.

    try {
      defProp(key, HIDDEN_NAME, {
        value: hiddenRecord,
        writable: false,
        enumerable: false,
        configurable: false
      });
      return hiddenRecord;
    } catch (error) {
      // Under some circumstances, isExtensible seems to misreport whether
      // the HIDDEN_NAME can be defined.
      // The circumstances have not been isolated, but at least affect
      // Node.js v0.10.26 on TravisCI / Linux, but not the same version of
      // Node.js on OS X.
      return void 0;
    }
  }

  /**
   * Monkey patch operations that would make their argument
   * non-extensible.
   *
   * <p>The monkey patched versions throw a TypeError if their
   * argument is not an object, so it should only be done to functions
   * that should throw a TypeError anyway if their argument is not an
   * object.
   */
  (function(){
    var oldFreeze = Object.freeze;
    defProp(Object, 'freeze', {
      value: function identifyingFreeze(obj) {
        getHiddenRecord(obj);
        return oldFreeze(obj);
      }
    });
    var oldSeal = Object.seal;
    defProp(Object, 'seal', {
      value: function identifyingSeal(obj) {
        getHiddenRecord(obj);
        return oldSeal(obj);
      }
    });
    var oldPreventExtensions = Object.preventExtensions;
    defProp(Object, 'preventExtensions', {
      value: function identifyingPreventExtensions(obj) {
        getHiddenRecord(obj);
        return oldPreventExtensions(obj);
      }
    });
  })();

  function constFunc(func) {
    func.prototype = null;
    return Object.freeze(func);
  }

  var calledAsFunctionWarningDone = false;
  function calledAsFunctionWarning() {
    // Future ES6 WeakMap is currently (2013-09-10) expected to reject WeakMap()
    // but we used to permit it and do it ourselves, so warn only.
    if (!calledAsFunctionWarningDone && typeof console !== 'undefined') {
      calledAsFunctionWarningDone = true;
      console.warn('WeakMap should be invoked as new WeakMap(), not ' +
          'WeakMap(). This will be an error in the future.');
    }
  }

  var nextId = 0;

  var OurWeakMap = function() {
    if (!(this instanceof OurWeakMap)) {  // approximate test for new ...()
      calledAsFunctionWarning();
    }

    // We are currently (12/25/2012) never encountering any prematurely
    // non-extensible keys.
    var keys = []; // brute force for prematurely non-extensible keys.
    var values = []; // brute force for corresponding values.
    var id = nextId++;

    function get___(key, opt_default) {
      var index;
      var hiddenRecord = getHiddenRecord(key);
      if (hiddenRecord) {
        return id in hiddenRecord ? hiddenRecord[id] : opt_default;
      } else {
        index = keys.indexOf(key);
        return index >= 0 ? values[index] : opt_default;
      }
    }

    function has___(key) {
      var hiddenRecord = getHiddenRecord(key);
      if (hiddenRecord) {
        return id in hiddenRecord;
      } else {
        return keys.indexOf(key) >= 0;
      }
    }

    function set___(key, value) {
      var index;
      var hiddenRecord = getHiddenRecord(key);
      if (hiddenRecord) {
        hiddenRecord[id] = value;
      } else {
        index = keys.indexOf(key);
        if (index >= 0) {
          values[index] = value;
        } else {
          // Since some browsers preemptively terminate slow turns but
          // then continue computing with presumably corrupted heap
          // state, we here defensively get keys.length first and then
          // use it to update both the values and keys arrays, keeping
          // them in sync.
          index = keys.length;
          values[index] = value;
          // If we crash here, values will be one longer than keys.
          keys[index] = key;
        }
      }
      return this;
    }

    function delete___(key) {
      var hiddenRecord = getHiddenRecord(key);
      var index, lastIndex;
      if (hiddenRecord) {
        return id in hiddenRecord && delete hiddenRecord[id];
      } else {
        index = keys.indexOf(key);
        if (index < 0) {
          return false;
        }
        // Since some browsers preemptively terminate slow turns but
        // then continue computing with potentially corrupted heap
        // state, we here defensively get keys.length first and then use
        // it to update both the keys and the values array, keeping
        // them in sync. We update the two with an order of assignments,
        // such that any prefix of these assignments will preserve the
        // key/value correspondence, either before or after the delete.
        // Note that this needs to work correctly when index === lastIndex.
        lastIndex = keys.length - 1;
        keys[index] = void 0;
        // If we crash here, there's a void 0 in the keys array, but
        // no operation will cause a "keys.indexOf(void 0)", since
        // getHiddenRecord(void 0) will always throw an error first.
        values[index] = values[lastIndex];
        // If we crash here, values[index] cannot be found here,
        // because keys[index] is void 0.
        keys[index] = keys[lastIndex];
        // If index === lastIndex and we crash here, then keys[index]
        // is still void 0, since the aliasing killed the previous key.
        keys.length = lastIndex;
        // If we crash here, keys will be one shorter than values.
        values.length = lastIndex;
        return true;
      }
    }

    return Object.create(OurWeakMap.prototype, {
      get___:    { value: constFunc(get___) },
      has___:    { value: constFunc(has___) },
      set___:    { value: constFunc(set___) },
      delete___: { value: constFunc(delete___) }
    });
  };

  OurWeakMap.prototype = Object.create(Object.prototype, {
    get: {
      /**
       * Return the value most recently associated with key, or
       * opt_default if none.
       */
      value: function get(key, opt_default) {
        return this.get___(key, opt_default);
      },
      writable: true,
      configurable: true
    },

    has: {
      /**
       * Is there a value associated with key in this WeakMap?
       */
      value: function has(key) {
        return this.has___(key);
      },
      writable: true,
      configurable: true
    },

    set: {
      /**
       * Associate value with key in this WeakMap, overwriting any
       * previous association if present.
       */
      value: function set(key, value) {
        return this.set___(key, value);
      },
      writable: true,
      configurable: true
    },

    'delete': {
      /**
       * Remove any association for key in this WeakMap, returning
       * whether there was one.
       *
       * <p>Note that the boolean return here does not work like the
       * {@code delete} operator. The {@code delete} operator returns
       * whether the deletion succeeds at bringing about a state in
       * which the deleted property is absent. The {@code delete}
       * operator therefore returns true if the property was already
       * absent, whereas this {@code delete} method returns false if
       * the association was already absent.
       */
      value: function remove(key) {
        return this.delete___(key);
      },
      writable: true,
      configurable: true
    }
  });

  if (typeof HostWeakMap === 'function') {
    (function() {
      // If we got here, then the platform has a WeakMap but we are concerned
      // that it may refuse to store some key types. Therefore, make a map
      // implementation which makes use of both as possible.

      // In this mode we are always using double maps, so we are not proxy-safe.
      // This combination does not occur in any known browser, but we had best
      // be safe.
      if (doubleWeakMapCheckSilentFailure && typeof Proxy !== 'undefined') {
        Proxy = undefined;
      }

      function DoubleWeakMap() {
        if (!(this instanceof OurWeakMap)) {  // approximate test for new ...()
          calledAsFunctionWarning();
        }

        // Preferable, truly weak map.
        var hmap = new HostWeakMap();

        // Our hidden-property-based pseudo-weak-map. Lazily initialized in the
        // 'set' implementation; thus we can avoid performing extra lookups if
        // we know all entries actually stored are entered in 'hmap'.
        var omap = undefined;

        // Hidden-property maps are not compatible with proxies because proxies
        // can observe the hidden name and either accidentally expose it or fail
        // to allow the hidden property to be set. Therefore, we do not allow
        // arbitrary WeakMaps to switch to using hidden properties, but only
        // those which need the ability, and unprivileged code is not allowed
        // to set the flag.
        //
        // (Except in doubleWeakMapCheckSilentFailure mode in which case we
        // disable proxies.)
        var enableSwitching = false;

        function dget(key, opt_default) {
          if (omap) {
            return hmap.has(key) ? hmap.get(key)
                : omap.get___(key, opt_default);
          } else {
            return hmap.get(key, opt_default);
          }
        }

        function dhas(key) {
          return hmap.has(key) || (omap ? omap.has___(key) : false);
        }

        var dset;
        if (doubleWeakMapCheckSilentFailure) {
          dset = function(key, value) {
            hmap.set(key, value);
            if (!hmap.has(key)) {
              if (!omap) { omap = new OurWeakMap(); }
              omap.set(key, value);
            }
            return this;
          };
        } else {
          dset = function(key, value) {
            if (enableSwitching) {
              try {
                hmap.set(key, value);
              } catch (e) {
                if (!omap) { omap = new OurWeakMap(); }
                omap.set___(key, value);
              }
            } else {
              hmap.set(key, value);
            }
            return this;
          };
        }

        function ddelete(key) {
          var result = !!hmap['delete'](key);
          if (omap) { return omap.delete___(key) || result; }
          return result;
        }

        return Object.create(OurWeakMap.prototype, {
          get___:    { value: constFunc(dget) },
          has___:    { value: constFunc(dhas) },
          set___:    { value: constFunc(dset) },
          delete___: { value: constFunc(ddelete) },
          permitHostObjects___: { value: constFunc(function(token) {
            if (token === weakMapPermitHostObjects) {
              enableSwitching = true;
            } else {
              throw new Error('bogus call to permitHostObjects___');
            }
          })}
        });
      }
      DoubleWeakMap.prototype = OurWeakMap.prototype;
      module.exports = DoubleWeakMap;

      // define .constructor to hide OurWeakMap ctor
      Object.defineProperty(WeakMap.prototype, 'constructor', {
        value: WeakMap,
        enumerable: false,  // as default .constructor is
        configurable: true,
        writable: true
      });
    })();
  } else {
    // There is no host WeakMap, so we must use the emulation.

    // Emulated WeakMaps are incompatible with native proxies (because proxies
    // can observe the hidden name), so we must disable Proxy usage (in
    // ArrayLike and Domado, currently).
    if (typeof Proxy !== 'undefined') {
      Proxy = undefined;
    }

    module.exports = OurWeakMap;
  }
})();

},{}]},{},[1]);

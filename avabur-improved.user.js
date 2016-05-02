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
// @require        https://cdnjs.cloudflare.com/ajax/libs/buzz/1.1.10/buzz.min.js
// @require        https://cdn.rawgit.com/Alorel/avabur-improved/0.6.7/lib/jalc-1.0.1.min.js
// @require        https://cdn.rawgit.com/Alorel/alo-timer/1.1/src/alotimer.min.js
// @require        https://cdn.rawgit.com/Alorel/console-log-html/1.1/console-log-html.min.js

// @require        https://cdn.rawgit.com/Alorel/avabur-improved/develop/lib/tsorter.js
// @updateURL      https://raw.githubusercontent.com/Alorel/avabur-improved/develop/avabur-improved.meta.js
// @downloadURL    https://raw.githubusercontent.com/Alorel/avabur-improved/develop/avabur-improved.user.js

// @resource modules    https://cdn.rawgit.com/Alorel/avabur-improved/79733f25ed9e378b17d9f8a5718e616e91c35917/modules/manifest.json
// @noframes
// ==/UserScript==

const is_dev = true,
    dev_hash = "79733f25ed9e378b17d9f8a5718e616e91c35917";
/** Create toast messages */

//Check if the user can even support the bot
if (typeof(window.sessionStorage) === "undefined") {
    alert("Your browser does not support session storage. Please download the latest version of Google Chrome.");
} else if (typeof(MutationObserver) === "undefined") {
    alert("Your browser does not support Mutation Observers. Please download the latest version of Google Chrome.");
} else {
    (function ($, CACHE_STORAGE, MutationObserver, buzz, AloTimer, ConsoleLogHTML, console) {
        'use strict';

        //Extend GM_getValue
        (function () {
            const orig = GM_getValue;
            /**
             * Get a value stored in Tampermonkey
             * @param {string} key The key
             * @param {*} [defaultValue=null] The default value
             * @returns {*} If the value is found in TM this will return that value; If it's not and defaultValue is set, the default value will be returned, otherwise NULL will be returned
             */
            GM_getValue = function (key, defaultValue) {
                if (typeof(defaultValue === "undefiend")) {
                    defaultValue = null;
                }
                var r = orig.apply(this, [key]);

                return typeof(r) === "undefined" || r === null ? defaultValue : r;
            }
        })();

        //Register log monitor
        (function () {
            const levels = {
                    log: $('<span class="badge">0</span>'),
                    debug: $('<span class="badge avi-txt-debug">0</span>'),
                    info: $('<span class="badge avi-txt-info">0</span>'),
                    warn: $('<span class="badge avi-txt-warn">0</span>'),
                    error: $('<span class="badge avi-txt-error">0</span>')
                },
                ul = $("<ul class='avi' style='width:100%;overflow-y:auto;max-height:250px'/>"),
                $title = $('<div/>')
                    .append(
                        '<span style="float:left">' + GM_info.script.name + ' log</span>',
                        $('<a href="javascript:;" style="float:right">Clear</a>').click(function () {
                            console.clear();
                            $(this).closest(".popover").remove();
                            console.debug("Console cleared");
                        }),
                        '<div style="clear:both"></div>'
                    );

            const container = $("<div/>").append(ul),
                btn = $('<button class="btn btn-default avi-log-btn">Log</button>')
                    .append(levels.log, levels.debug, levels.info, levels.warn, levels.error)
                    .popover({
                        title: $title,
                        html: true,
                        trigger: "click",
                        container: "body",
                        viewport: {"selector": "body", "padding": 0},
                        template: '<div class="popover col-lg-5 col-xs-12 col-sm-9 col-md-7" role="tooltip"><div class="arrow"></div><h3 class="popover-title"></h3><div class="popover-content"></div></div>',
                        placement: "auto top",
                        content: container
                    })
                    .on("hidden.bs.popover", function () {
                        ul.find(">.avi-italic").removeClass("avi-italic");
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
                    for (var r = 0; r < records.length; r++) {
                        var n;
                        if (records[r].addedNodes.length) {
                            for (n = 0; n < records[r].addedNodes.length; n++) {
                                const badge = levels[$(records[r].addedNodes[n]).addClass("avi-italic").attr("data-level")];
                                fn.flash_once(badge.text(parseInt(badge.text()) + 1));
                            }
                        }
                        if (records[r].removedNodes.length) {
                            for (n = 0; n < records[r].removedNodes.length; n++) {
                                const badge = levels[$(records[r].removedNodes[n]).attr("data-level")];
                                fn.flash_once(badge.text(parseInt(badge.text()) - 1));
                            }
                        }
                    }
                })).observe(ul[0], {childList: true});
        })();

        const MODULES = JSON.parse(GM_getResourceText("modules"));
        /**
         * The URL where we check for updates. This is different from @updateURL because we want it to come through
         * as a regular page load, not a request to the raw file
         */
        const UPDATE_URL = "https://github.com/Alorel/avabur-improved/blob/master/avabur-improved.user.js";

        /////////////////////////////////////////////////////
        // This is the script code. Don't change it unless //
        // you know what you're doing ;)                   //
        /////////////////////////////////////////////////////


        const SettingsHandler = function () {
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
            },
            load: function () {
                this.settings = $.extend(true, this.defaults, JSON.parse(GM_getValue("settings") || "{}"));
            }
        };

        const Settings = new SettingsHandler();

        /* /(([0-9])+\s(minutes|seconds|hours))/g
         ^ tmp - will be used for future update
         */

        /** Our persistent DOM stuff */
        const $DOM = {
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
        const VARS = {
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
        const fn = {

            /**
             * Flash an element once
             * @param {*|jQuery|HTMLElement} $element The element
             * @returns {*|jQuery|HTMLElement} the element
             */
            flash_once: function ($element) {
                $element.addClass("avi-flash-once");
                setTimeout(function () {
                    $element.removeClass("avi-flash-once");
                }, 300);
                return $element;
            },

            /**
             * Sort a Select element
             * @param {HTMLSelectElement} select The element to sort
             * @param {Number} [startAt=0] The first item index to sort
             */
            sortSelect: function (select, startAt) {
                if (select instanceof HTMLSelectElement) {
                    if (typeof startAt === 'undefined') {
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
                const match = str.match(/([0-9]+\s+(hours?|minutes?|seconds?))/g);

                for (var i = 0; i < match.length; i++) {
                    const currentMatch = match[i].toLowerCase();
                    const number = currentMatch.match(/[0-9]+/);
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
                        const theirVersion = r.responseText.match(/\/\/\s+@version\s+([^\n<>]+)/)[1];
                        if (fn.versionCompare(GM_info.script.version, theirVersion) < 0) {
                            fn.notification('A new version of ' + GM_info.script.name + ' is available! Click your ' +
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
                        title: title || GM_info.script.name,
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
                const doOpen = function () {
                    $DOM.market.navlinks.removeClass("active")
                        .filter("a:contains('" + type + "')").addClass("active").click();
                };
                if (VARS.market_was_opened) {
                    fn.openStdModal("#marketWrapper");
                    doOpen();
                } else {
                    const $document = $(document);

                    const $openCategory = function (evt, xhr, opts) {
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
                const ret = {
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
                    (is_dev ? dev_hash : GM_info.script.version) + "/" + path;
            },
            /**
             * Tabifies the div
             * @param {jQuery|$|HTMLElement|*} $container The div to tabify
             * @returns {*|jQuery|HTMLElement} $container
             */
            tabify: function ($container) {
                const $nav = $container.find(">nav>*"),
                    $tabs = $container.find(">div>*"),
                    $activeNav = $nav.filter(".active");

                $nav.click(function () {
                    const $this = $(this);
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
        };

        const SFX = {
            circ_saw: new buzz.sound(fn.gh_url("res/sfx/circ_saw.wav")),
            msg_ding: new buzz.sound(fn.gh_url("res/sfx/message_ding.wav"))
        };

        /** Collection of mutation observers the script uses */
        const OBSERVERS = {
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
                    const sound_on = Settings.settings.notifications.all.sound && Settings.settings.notifications.whisper.sound;
                    const gm_on = Settings.settings.notifications.all.gm && Settings.settings.notifications.whisper.gm;

                    if (sound_on || gm_on) {
                        for (var i = 0; i < records.length; i++) {
                            const addedNodes = records[i].addedNodes;
                            if (addedNodes.length) {
                                for (var j = 0; j < addedNodes.length; j++) {
                                    const text = $(addedNodes[j]).text();
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

        const $HANDLERS = {
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
                    const $this = $(this);
                    Settings.settings.notifications[$this.data("notification")][$this.data("type")] = $this.is(":checked");
                    Settings.save();
                },
                settings_feature: function () {
                    const $this = $(this);
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
                    const $this = $(this);

                    $this.prop("checked", Settings.settings.notifications[$this.data("notification")][$this.data("type")]);
                },
                settings_features: function () {
                    const $this = $(this);
                    $this.prop("checked", Settings.settings.features[$this.data("feature")]);
                }
            }
        };

        /**
         * @type {{SFX: classes.SFX, CssManager: classes.CssManager, AloTimer: AloTimer, Request: classes.Request, Interval: classes.Interval}}
         */
        const classes = {

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
             * @type {AloTimer}
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
                const methodArgs = $.extend({
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
                var int = setInterval(callback, frequency);
                classes.Interval.prototype._intervals[this.name] = int;

                return int;
            }
        };


        classes.CssManager.prototype = {
            setRules: function (rules) {
                const generated = [];
                for (var selector in rules) {
                    if (rules.hasOwnProperty(selector)) {
                        const selectorRules = [];

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
            const ON_LOAD = {
                "Loading script CSS": function () {
                    const urls = [fn.gh_url("res/css/avabur-improved.min.css")], $head = $("head");

                    for (var i = 0; i < urls.length; i++) {
                        $head.append("<link type='text/css' rel='stylesheet' href='" + urls[i] + "'/>");
                    }
                },
                "Configuring script modal": function () {
                    $.get(fn.gh_url("res/html/script-settings.html")).done(function (r) {
                        $DOM.modal.script_settings = $(r);
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
                    });
                },
                "Registering side menu entry": function () {
                    const $helpSection = $("#helpSection"),
                        $menuLink = $('<a href="javascript:;"/>')
                            .html('<li class="active">' + GM_info.script.name + " " + GM_info.script.version + '</li>')
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
            const keys = Object.keys(ON_LOAD);
            for (var i = 0; i < keys.length; i++) {
                console.debug(keys[i]);
                ON_LOAD[keys[i]]();
                delete ON_LOAD[keys[i]];
            }
            fn.check_github_for_updates();
            (new classes.Interval("gh_update")).set(fn.check_github_for_updates, 60000);


            /**
             * Represents a module
             * @param {Spec.Module} spec
             * @constructor
             */
            const Module = function (spec) {
                /**
                 * The raw module spec
                 * @type {Spec.Module}
                 */
                this.spec = spec;
                /**
                 * Module name
                 * @type {String|Boolean}
                 */
                this.name = spec.name || false;
                /**
                 * Load function
                 * @type {Function}
                 */
                this.load = spec.load || false;

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
                 * @type {Function}
                 */
                this.unload = spec.unload || false;

                /**
                 * The module ID
                 * @type {string}
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
                 * @type {String|null}
                 */
                this.desc = spec.desc || null;
                /**
                 * Module settings
                 * @type {Object|Boolean}
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
                    const dependencyKeys = Object.keys(this.spec.dependencies);
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
                                case "info":
                                    this.dependencies.info = GM_info;
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

            /**
             * Executes the module
             * @param {Spec.Module} module The module manifest
             */
            const exec_module = function (module) {
                const mod = new Module(module);
                mod.register();
            };

            const required_modules = [
                "activity-shortcuts",
                "house-timers",
                "market-tooltips",
                "house-notifications"
            ];

            const module_ajax_callback = function (r) {
                eval(r);
            };

            for (var j = 0; j < required_modules.length; j++) {
                $.ajax(fn.gh_url("modules/" + required_modules[j] + ".min.js"), {
                    dataType: "text"
                }).done(module_ajax_callback);
            }
        })();
    })(jQuery, window.sessionStorage, MutationObserver, buzz, AloTimer, ConsoleLogHTML, console);
}
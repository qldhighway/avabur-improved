// ==UserScript==
// @name           Avabur Improved
// @namespace      org.alorel.avaburimproved
// @author         Alorel <a.molcanovas@gmail.com>
// @homepage       https://github.com/Alorel/avabur-improved
// @description    Some welcome additions to Avabur's UI choices
// @include        https://avabur.com/game.php
// @include        http://avabur.com/game.php
// @include        https://www.avabur.com/game.php
// @include        http://www.avabur.com/game.php
// @version        0.5
// @icon           https://raw.githubusercontent.com/Alorel/avabur-improved/master/res/img/logo-16.png
// @icon64         https://raw.githubusercontent.com/Alorel/avabur-improved/master/res/img/logo-64.png
// @downloadURL    https://github.com/Alorel/avabur-improved/raw/master/avabur-improved.user.js
// @updateURL      https://github.com/Alorel/avabur-improved/raw/master/avabur-improved.user.js
// @run-at         document-end
// @grant          GM_getValue
// @grant          GM_setValue
// @grant          GM_deleteValue
// @grant          GM_notification
// @grant          GM_listValues
// @grant          GM_getResourceURL
// @grant          GM_getResourceText
// @grant          GM_xmlhttpRequest
// @connect        githubusercontent.com
// @connect        github.com
// @connect        self
// @require        https://raw.githubusercontent.com/Alorel/avabur-improved/master/lib/toastmessage/jquery.toastmessage.min.js
// @require        https://cdnjs.cloudflare.com/ajax/libs/buzz/1.1.10/buzz.min.js
// @require        https://raw.githubusercontent.com/Alorel/avabur-improved/master/lib/jalc-1.0.1.min.js
// @require        https://raw.githubusercontent.com/Alorel/alo-timer/master/src/alotimer.min.js

// @resource    css_toast               https://raw.githubusercontent.com/Alorel/avabur-improved/master/lib/toastmessage/jquery.toastmessage.min.css
// @resource    img_ajax_loader         https://raw.githubusercontent.com/Alorel/avabur-improved/master/res/img/ajax-loader.gif
// @resource    sfx_circ_saw            https://raw.githubusercontent.com/Alorel/avabur-improved/master/res/sfx/circ_saw.wav.txt
// @resource    sfx_msg_ding            https://raw.githubusercontent.com/Alorel/avabur-improved/master/res/sfx/message_ding.wav.txt

// @resource    css_script              https://raw.githubusercontent.com/Alorel/avabur-improved/master/res/css/avabur-improved.min.css?0.5
// @resource    html_house_timers       https://raw.githubusercontent.com/Alorel/avabur-improved/master/res/html/house-timers.html
// @resource    html_market_tooltip     https://raw.githubusercontent.com/Alorel/avabur-improved/master/res/html/market-tooltip.html
// @resource    html_settings_modal     https://raw.githubusercontent.com/Alorel/avabur-improved/master/res/html/script-settings.html?0.5

// @resource    test_svg https://raw.githubusercontent.com/Alorel/avabur-improved/develop/res/svg/sword-clash.svg
// @noframes
// ==/UserScript==

console.log(GM_getResourceText("test_svg"));

$("body").css("fill", "currentColor").prepend(GM_getResourceText("test_svg"));
/** Create toast messages */
const Toast = { //Tampermonkey's scoping won't let this constant be globally visible
    error: function (msg) {
        console.error(msg);
        $().toastmessage('showErrorToast', msg);
    },
    notice: function (msg) {
        $().toastmessage('showNoticeToast', msg);
    },
    success: function (msg) {
        $().toastmessage('showSuccessToast', msg);
    },
    warn: function (msg) {
        console.warn(msg);
        $().toastmessage('showWarningToast', msg);
    },
    incompatibility: function (what) {
        $().toastmessage('showToast', {
            text: "Your browser does not support " + what +
            ". Please <a href='https://www.google.co.uk/chrome/browser/desktop/' target='_blank'>" +
            "Download the latest version of Google Chrome</a>",
            sticky: true,
            position: 'top-center',
            type: 'error'
        });
    }
};

//Check if the user can even support the bot
if (typeof(window.sessionStorage) === "undefined") {
    Toast.incompatibility("Session storage");
} else if (typeof(MutationObserver) === "undefined") {
    Toast.incompatibility("MutationObserver");
} else {
    (function ($, CACHE_STORAGE, MutationObserver, buzz, AloTimer) {
        'use strict'; //https://github.com/Alorel/avabur-improved/blob/develop/avabur-improved.user.js

        ////////////////////////////////////////////////////////////////////////
        // These are the settings - you can safely change them, but they will //
        // be overwritten during script updates                               //
        ////////////////////////////////////////////////////////////////////////

        /** How long our AJAX cache is meant to last */
        const CACHE_TTL = {
            /** Resource tooltip market price lookups */
            market: 1 / 3600 * 60, //30 sec,
            /** Tradeskill material ID mapping */
            tradeskill_mats: 1
        };
        /** CSS URLs to load */
        const LOAD_CSS = [
            GM_getResourceURL("css_script"),
            GM_getResourceURL("css_toast")
        ];

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
            currency_tooltip: {
                the_tooltip: $("#currencyTooltip"),
                /** The HTML element which will be used for currency tooltip colour references */
                colour_reference: $("#currencyTooltipMarketable"),
                /** Thr row we will be colouring */
                table_row: null,
                /** The 1st page low price */
                market_low: null,
                /** The 1st page avg price */
                market_avg: null,
                /** The 1st page high price */
                market_high: null
            },
            inventory: {
                overflow_preventing_container: $("#mCSB_4_container")
            },
            /** Game modals */
            modal: {
                /** The outer wrapper */
                modal_wrapper: $("#modalWrapper"),
                /** The faded background for modals */
                modal_background: $("#modalBackground"),
                /** The title for modal windows */
                modal_title: $("#modalTitle"),
                /** The script settings modal */
                script_settings: $(GM_getResourceText("html_settings_modal"))
            },
            /** Navigation items */
            nav: {
                market: $("#viewMarket")
            },
            house_monitor: {},
            market: {
                navlinks: $("#marketTypeSelector").find("a")
            }
        };

        const SFX = {
            circ_saw: new buzz.sound(GM_getResourceText("sfx_circ_saw")),
            msg_ding: new buzz.sound(GM_getResourceText("sfx_msg_ding"))
        };

        /** AJAX spinners throughout the page */
        const $AJAX_SPINNERS = {
            /** The spinner @ the currency tooltip */
            currency_tooltip: $('<img src="' + GM_getResourceURL("img_ajax_loader") + '"/>')
        };

        const FUNCTION_PERSISTENT_VARS = {
            house_update_last_msg: null
        };

        /**
         * Interval manager
         * @param {String} name Interval name/ID
         * @constructor
         */
        const Interval = function (name) {
            this.name = name;
        };

        Interval.prototype = {
            _intervals: {},
            isRunning: function () {
                return typeof(this._intervals[this.name]) !== "undefined"
            },
            clear: function () {
                if (this.isRunning()) {
                    clearInterval(this._intervals[this.name]);
                    delete this._intervals[this.name];
                    return true;
                }

                return false;
            },
            set: function (callback, frequency) {
                this.clear();
                this._intervals[this.name] = setInterval(callback, frequency);
                return this._intervals[this.name];
            }
        };

        /** Misc function container */
        const fn = {
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
            /** @param {Interval} interval */
            house_status_update_end: function (interval) {
                interval.clear();
                $DOM.house_monitor.status.text("Ready!").addClass("avi-highlight").append(
                    $("<a href='javascript:;'> (refresh)</a>").click($HANDLERS.click.house_state_refresh)
                );
                if (Settings.settings.notifications.construction.gm && Settings.settings.notifications.all.gm) {
                    fn.notification(Demo.prototype.gm_texts.construction);
                }
                if (Settings.settings.notifications.construction.sound && Settings.settings.notifications.all.sound) {
                    SFX.circ_saw.play();
                }
            },
            handle_house_status_update: function (text) {
                if (text !== FUNCTION_PERSISTENT_VARS.house_update_last_msg) {
                    FUNCTION_PERSISTENT_VARS.house_update_last_msg = text;
                    const interval = new Interval("house_status");
                    interval.clear();

                    if (text.indexOf("available again") !== -1) { // Working
                        const timer = new AloTimer(fn.parseTimeStringLong(text));
                        interval.set(function () {
                            if (timer.isFinished()) {
                                fn.house_status_update_end(interval);
                            }
                            $DOM.house_monitor.status.removeClass("avi-highlight").text(timer.toString());
                        }, 1000);
                    } else if (text.indexOf("are available")) {
                        fn.house_status_update_end(interval);
                    } else {
                        $.post("/house.php", null, Request.prototype.callbacks.success.house_requery, "json");
                    }
                }
            },
            /**
             * Creates a floaty notification
             * @param {String} text Text to display
             * @param {Object} [options] Overrides as shown here: https://tampermonkey.net/documentation.php#GM_notification
             */
            notification: function (text, options) {
                GM_notification($.extend({
                    text: text,
                    title: GM_info.script.name,
                    highlight: true,
                    timeout: 5
                }, options || {}));
            },
            /**
             * Opens the market
             * @param {String} type The top category name
             */
            openMarket: function (type) {
                const $document = $(document);

                const $openCategory = function (evt, xhr, opts) {
                    if (opts.url === "market.php") {
                        $document.unbind("ajaxComplete", $openCategory);
                        $DOM.market.navlinks.removeClass("active")
                            .filter("a:contains('" + type + "')").addClass("active").click();
                    }
                };

                $document.ajaxComplete($openCategory);
                $DOM.nav.market.click();
            },
            analysePrice: function (arr) {
                const ret = {
                    low: arr[0].price,
                    high: arr[arr.length - 1].price
                };
                ret.avg = Math.round((parseFloat(ret.low) + parseFloat(ret.high)) / 2);
                return ret;
            },
            /**
             * Tabifies the div
             * @param {jQuery|$|HTMLElement|*} $container The div to tabify
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
            },
            /** Puts commas in large numbers */
            numberWithCommas: function (x) {
                return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
            },
            /** Toggles the visibility attribute of the element */
            toggleVisibility: function ($el, shouldBeVisible) {
                $el.css("visibility", shouldBeVisible ? "visible" : "hidden");
            },
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
            },
            /**
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

        /**
         * Represents an AJAX request to be used with cache
         * @param {String} url The URL we're calling
         * @param {Boolean|Number} cacheTime Cache time in hours or false if the request should not be cached
         * @param {Function} [errorCallback]  A custom error callback
         * @constructor
         */
        const Request = function (url, cacheTime, errorCallback) {
            /** The URL we're calling */
            this.url = url;
            /** OnError callback */
            this.errorCallback = errorCallback || Request.prototype.callbacks.error.generic;

            /**
             * How long the request should be cached for
             * @type {Boolean|Number}
             */
            this.cacheTime = cacheTime || false;
        };

        Request.prototype = {
            /** Ajax callbacks container */
            callbacks: {
                /** Successful AJAX callbacks */
                success: {
                    /** Successful callback for the currency tooltip market info lookup */
                    currency_tooltip: function (r) {
                        const analysis = fn.analysePrice(r.l);

                        fn.toggleVisibility($AJAX_SPINNERS.currency_tooltip, false);
                        $DOM.currency_tooltip.market_low.text(fn.numberWithCommas(analysis.low));
                        $DOM.currency_tooltip.market_avg.text(fn.numberWithCommas(analysis.avg));
                        $DOM.currency_tooltip.market_high.text(fn.numberWithCommas(analysis.high));
                    },
                    house_requery: function (evt, r, opts) {
                        if (opts.url.indexOf("house") !== -1 && typeof(r.responseJSON.m) !== "undefined") {
                            fn.handle_house_status_update(r.responseJSON.m);
                        }
                    },
                    house_state_refresh: function (r) {
                        fn.handle_house_status_update(r.m);
                    }
                },
                /** Error callbacks */
                error: {
                    /** Generic error callback */
                    generic: function (xhr, textStatus, errorThrown) {
                        Toast.error("[" + textStatus + "] " + xhr.responseText);
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

        /** Collection of mutation observers the script uses */
        const OBSERVERS = {
            /** Mutation observer for the currency page tooltip */
            currency_tooltips: new MutationObserver(
                /** @param {MutationRecord[]} records */
                function (records) {
                    if (records.length && $DOM.currency_tooltip.colour_reference.is(":visible")) {
                        const cssClass = $DOM.currency_tooltip.colour_reference.attr("class"),
                            marketID = cssClass.replace("crystals", "premium")
                                .replace("materials", "weapon_scraps")
                                .replace("fragments", "gem_fragments"),
                            $allTDs = $DOM.currency_tooltip.table_row.find(">td");

                        $DOM.currency_tooltip.table_row.attr("class", cssClass);

                        if (cssClass === "gold") {
                            $allTDs.text("N/A");
                            fn.toggleVisibility($AJAX_SPINNERS.currency_tooltip, false);
                        } else {
                            $allTDs.text(" ");
                            fn.toggleVisibility($AJAX_SPINNERS.currency_tooltip, true);

                            (new Request("/market.php", CACHE_TTL.market)).post({
                                type: "currency",
                                page: 0,
                                st: marketID
                            }).done(Request.prototype.callbacks.success.currency_tooltip);
                        }
                    }
                }),
            /** Makes sure the script settings modal doesn't get nasty with the other game modals */
            script_settings: new MutationObserver(function () {
                    if (!$DOM.modal.script_settings.is(":visible")) {
                        $DOM.modal.script_settings.hide();
                    }
                }
            ),
            house_status: new MutationObserver(function (records) {
                for (var i = 0; i < records.length; i++) {
                    if (records[i].addedNodes.length) {
                        fn.handle_house_status_update(records[i].target.innerText.trim());
                        break;
                    }
                }
            }),
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
            ),
            inventory_table: new MutationObserver(
                /** @param {MutationRecord[]} records */
                function (records) {
                    for (var i = 0; i < records.length; i++) {
                        if (records[i].addedNodes.length) {
                            for (var n = 0; n < records[i].addedNodes.length; n++) {
                                if (records[i].addedNodes[n] instanceof HTMLTableSectionElement) {
                                    const $tbody = $(records[i].addedNodes[n]);

                                    if ($tbody.find("th:contains(Ingredient)").length) { //Bingo!
                                        $tbody.find(">tr>[data-th=Item]").each($HANDLERS.each.inventory_table_ingredients);
                                    }

                                    $DOM.inventory.overflow_preventing_container.css("height", "auto")
                                        .css("height", $DOM.inventory.overflow_preventing_container.height() + 150);
                                    break;
                                }
                            }
                            break;
                        }
                    }
                }
            )
        };

        var TRADESKILL_MATS = {};

        const Demo = function (kind) {
            this.kind = kind;
        };

        Demo.prototype.kinds = {
            SOUND: 1,
            GM_NOTIFICATION: 2
        };
        Demo.prototype.gm_texts = {
            whisper: "[00:00:00] Whisper from Alorel: send me all of your crystals.",
            construction: "Construction finished!"
        };
        Demo.prototype.scenarios = {
            "whisper-sound": {
                kind: Demo.prototype.kinds.SOUND,
                src: SFX.msg_ding
            },
            "whisper-gm": {
                kind: Demo.prototype.kinds.GM_NOTIFICATION,
                src: Demo.prototype.gm_texts.whisper
            },
            "construction-sound": {
                kind: Demo.prototype.kinds.SOUND,
                src: SFX.circ_saw
            },
            "construction-gm": {
                kind: Demo.prototype.kinds.GM_NOTIFICATION,
                src: Demo.prototype.gm_texts.construction
            }
        };
        Demo.prototype.play = function () {
            if (typeof(this.scenarios[this.kind]) !== "undefined") {
                const scenario = this.scenarios[this.kind];

                switch (scenario.kind) {
                    case Demo.prototype.kinds.SOUND:
                        if (!buzz.isWAVSupported()) {
                            Toast.incompatibility("WAV sounds");
                        } else {
                            scenario.src.play();
                        }
                        break;
                    case Demo.prototype.kinds.GM_NOTIFICATION:
                        fn.notification(scenario.src);
                        break;
                    default:
                        Toast.error("Misconfigured demo scenario: " + this.kind);
                }
            } else {
                Toast.error("Invalid demo scenario picked: " + this.kind);
            }
        };

        const $HANDLERS = {
            click: {
                demo: function () {
                    (new Demo($(this).attr("data-demo"))).play();
                },
                house_state_refresh: function () {
                    $.post("/house.php", {}, Request.prototype.callbacks.success.house_state_refresh);
                },
                topbar_currency: function () {
                    const type = $(this).find(">td:first").text().trim();
                    fn.openMarket(type.substring(0, type.length - 1));
                },
                ingredient: function () {
                    $DOM.modal.modal_background.click();
                    fn.openMarket("Ingredients");
                },
                script_menu: function () {
                    $DOM.modal.modal_title.text(GM_info.script.name + " " + GM_info.script.version);
                    fn.openStdModal($DOM.modal.script_settings);
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
                }
            },
            mouseenter: {
                inventory_table_ingredient: function () {
                    const $this = $(this),
                        ingredient = $this.text().trim();

                    if (typeof(TRADESKILL_MATS[ingredient]) === "undefined") {
                        Toast.error("Failed to lookup " + ingredient + ": ID not found");
                    } else {
                        (new Request("/market.php", CACHE_TTL.market))
                            .post({
                                type: "ingredient",
                                page: 0,
                                q: 0,
                                ll: 0,
                                hl: 0,
                                st: TRADESKILL_MATS[ingredient]
                            }).done(function (r) {
                            const describedBy = $this.attr("aria-describedby"),
                                $describedBy = $("#" + describedBy);

                            if (!describedBy || !$describedBy.length) {
                                console.error("Failed to lookup " + ingredient + ": $describedBy not found");
                            } else {
                                const analysis = fn.analysePrice(r.l),
                                    $tds = $describedBy.find("tr[data-id=prices]>td");
                                console.log(analysis);

                                $tds.first().text(fn.numberWithCommas(analysis.low))
                                    .next().text(fn.numberWithCommas(analysis.avg))
                                    .next().text(fn.numberWithCommas(analysis.high));
                            }
                        });
                    }
                }
            },
            each: {
                settings_notification: function () {
                    const $this = $(this);

                    $this.prop("checked", Settings.settings.notifications[$this.data("notification")][$this.data("type")]);
                },
                settings_features: function () {
                    const $this = $(this);
                    $this.prop("checked", Settings.settings.features[$this.data("feature")]);
                },
                inventory_table_ingredients: function () {
                    const $this = $(this),
                        ingredient = $this.text().trim(),
                        $span = $('<span>' + ingredient + '</span>');
                    $this.html($span);

                    $span.popover({
                        title: ingredient,
                        html: true,
                        trigger: "hover",
                        content: GM_getResourceText("html_market_tooltip")
                    });

                    $span.mouseenter($HANDLERS.mouseenter.inventory_table_ingredient)
                        .css("cursor", "pointer")
                        .click($HANDLERS.click.ingredient);
                }
            }
        };

        (function () {
            const ON_LOAD = {
                "Registering currency tooltip scanner": function () {
                    const $tooltipTable = $(GM_getResourceText("html_market_tooltip"));

                    $tooltipTable.find("th[colspan]").append($AJAX_SPINNERS.currency_tooltip);
                    $DOM.currency_tooltip.table_row = $tooltipTable.find("tr[data-id=prices]");
                    $DOM.currency_tooltip.market_low = $DOM.currency_tooltip.table_row.find(">td").first();
                    $DOM.currency_tooltip.market_avg = $DOM.currency_tooltip.market_low.next();
                    $DOM.currency_tooltip.market_high = $DOM.currency_tooltip.market_avg.next();

                    //Add our stuff to the currency tooltips
                    $DOM.currency_tooltip.the_tooltip.append($tooltipTable);

                    OBSERVERS.currency_tooltips.observe($DOM.currency_tooltip.the_tooltip[0], {
                        attributes: true
                    });
                },
                "Fixing some game CSS": function () {
                    $("head").append('<style>.materials{color:' +
                        $("#crafting_materials").css("color") +
                        '}.fragments{color:' +
                        $("#gem_fragments").css("color") + '}</style>');
                },
                "Applying house monitor": function () {
                    if (Settings.settings.features.house_timer) {
                        const $timer = $(GM_getResourceText("html_house_timers"));
                        $("#houseTimerInfo").addClass("avi-force-block");
                        $("#constructionNotifier, #houseTimerTable [data-typeid='Construction']").addClass("avi-force-hide");
                        $("#houseTimerTable").prepend($timer);
                        $DOM.house_monitor.status = $("#avi-house-construction");
                        OBSERVERS.house_status.observe(document.querySelector("#house_notification"), {
                            childList: true,
                            characterData: true
                        });
                        $(document).ajaxComplete(Request.prototype.callbacks.success.house_requery);
                        $("body").append('<link rel="stylesheet" type="text/css" href="' + GM_getResourceText("css_house_timer_remove") + '"/>');
                    } else {
                        console.log("(skipped due to user settings)");
                    }
                },
                "Checking if the script has been updated": function () {
                    if (fn.versionCompare(GM_getValue("last_ver") || "999999", GM_info.script.version) < 0) {
                        $().toastmessage('showToast', {
                            text: GM_info.script.name + " has been updated! See the changelog " +
                            "<a href='https://github.com/Alorel/avabur-improved/releases' target='_blank'>here</a>",
                            sticky: true,
                            position: 'top-left',
                            type: 'success'
                        });
                    }
                    GM_setValue("last_ver", GM_info.script.version);
                },
                "Loading script CSS": function () {
                    const $head = $("head");

                    for (var i = 0; i < LOAD_CSS.length; i++) {
                        $head.append("<link type='text/css' rel='stylesheet' href='" + LOAD_CSS[i] + "'/>");
                        delete LOAD_CSS[i];
                    }
                },
                "Configuring script modal": function () {
                    $("#modalContent").append($DOM.modal.script_settings);
                    fn.tabify($DOM.modal.script_settings);
                    $DOM.modal.script_settings.find("[data-demo]").click($HANDLERS.click.demo);

                    $DOM.modal.script_settings.find('[data-setting="notifications"]')
                        .each($HANDLERS.each.settings_notification)
                        .change($HANDLERS.change.settings_notification);

                    $DOM.modal.script_settings.find('[data-setting="features"]')
                        .each($HANDLERS.each.settings_features)
                        .change($HANDLERS.change.settings_feature);

                    OBSERVERS.script_settings.observe($DOM.modal.modal_wrapper[0], {attributes: true});
                },
                "Registering side menu entry": function () {
                    const $helpSection = $("#helpSection"),
                        $menuLink = $('<a href="javascript:;"/>')
                            .html('<li class="active">' + GM_info.script.name + " " + GM_info.script.version + '</li>')
                            .click($HANDLERS.click.script_menu);

                    $helpSection.append($menuLink);
                    $("#navWrapper").css("padding-top", $menuLink.height());
                },
                "Registering market shortcuts": function () {
                    $("#allThemTables").find(".currencyWithTooltip:not(:contains(Gold))").css("cursor", "pointer")
                        .click($HANDLERS.click.topbar_currency);
                },
                "Registering Inventory table observer": function () {
                    OBSERVERS.inventory_table.observe(document.querySelector("#inventoryTable"), {
                        childList: true,
                        characterData: true
                    });
                },
                "Staring whisper monitor": function () {
                    OBSERVERS.chat_whispers.observe(document.querySelector("#chatMessageList"), {
                        childList: true
                    });
                },
                "Collecting tradeskill material IDs": function () {
                    const cached_ids = window.sessionStorage.getItem("TRADESKILL_MATERIAL_IDS");
                    if (cached_ids) {
                        TRADESKILL_MATS = JSON.parse(cached_ids);
                    } else {
                        $.post("/market.php", {
                            type: "ingredient",
                            page: 0,
                            st: "all"
                        }, function (r) {
                            const select = $("<select/>"),
                                mats = {};
                            select.html(r.filter);

                            select.find(">option:not([value=all])").each(function () {
                                const $this = $(this);
                                mats[$this.text().trim()] = parseInt($this.val());
                            });

                            window.sessionStorage.setItem("TRADESKILL_MATERIAL_IDS", JSON.stringify(mats));
                            TRADESKILL_MATS = mats;
                        });
                    }
                },
                "Checking GitHub for updates": function () {
                    GM_xmlhttpRequest({
                        method: "GET",
                        url: UPDATE_URL,
                        onload: function (r) {
                            const theirVersion = r.responseText.match(/\/\/\s+@version\s+([^\n<>]+)/)[1];
                            if (fn.versionCompare(GM_info.script.version, theirVersion) < 0) {
                                $().toastmessage('showToast', {
                                    text: 'A new version of ' + GM_info.script.name + ' is available! Click your ' +
                                    'Greasemonkey/Tampermonkey icon, select "Check for updates" and reload the page in a few seconds.',
                                    sticky: true,
                                    position: 'top-center',
                                    type: 'notice'
                                });
                            }
                        }
                    });
                },
                "Applying the scripts tooltips": function () {
                    $(".avi-tip").tooltip();
                }
            };
            const keys = Object.keys(ON_LOAD);
            for (var i = 0; i < keys.length; i++) {
                console.log("[" + GM_info.script.name + "] " + keys[i]);
                ON_LOAD[keys[i]]();
                delete ON_LOAD[keys[i]];
            }
        })();
    })(jQuery, window.sessionStorage, MutationObserver, buzz, AloTimer);
}
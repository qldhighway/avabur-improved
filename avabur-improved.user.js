// ==UserScript==
// @name           Avabur Improved
// @namespace      org.alorel.avaburimproved
// @author         Alorel <a.molcanovas@gmail.com>
// @homepage       https://github.com/Alorel/avabur-improved
// @description    Some welcome additions to Avabur's UI choices
// @include        https://avabur.com*
// @include        http://avabur.com*
// @include        https://www.avabur.com*
// @include        http://www.avabur.com*
// @version        0.3
// @icon           https://avabur.com/images/favicon.ico
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
// @resource    css_toast               https://raw.githubusercontent.com/Alorel/avabur-improved/master/lib/toastmessage/jquery.toastmessage.min.css

// @require        https://raw.githubusercontent.com/Alorel/avabur-improved/develop/lib/jalc-1.0.1.min.js

// @resource    img_ajax_loader         https://raw.githubusercontent.com/Alorel/avabur-improved/develop/res/img/ajax-loader.gif
// @resource    css_script              https://raw.githubusercontent.com/Alorel/avabur-improved/develop/res/css/avabur-improved.min.css?1
// @resource    html_market_tooltip     https://raw.githubusercontent.com/Alorel/avabur-improved/develop/res/html/market-tooltip.html
// @resource    html_settings_modal     https://raw.githubusercontent.com/Alorel/avabur-improved/develop/res/html/script-settings.html
// @resource    sfx_circ_saw            https://raw.githubusercontent.com/Alorel/avabur-improved/develop/res/sfx/circ_saw.wav.txt
// @resource    sfx_msg_ding            https://raw.githubusercontent.com/Alorel/avabur-improved/develop/res/sfx/message_ding.wav.txt
// @noframes
// ==/UserScript==

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
    (function ($, CACHE_STORAGE, MutationObserver, buzz) {
        'use strict'; //https://github.com/Alorel/avabur-improved/blob/develop/avabur-improved.user.js

        ////////////////////////////////////////////////////////////////////////
        // These are the settings - you can safely change them, but they will //
        // be overwritten during script updates                               //
        ////////////////////////////////////////////////////////////////////////

        /** How long our AJAX cache is meant to last */
        const CACHE_TTL = {
            /** Resource tooltip market price lookups */
            market: 1 / 3600 * 60 //30 sec
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

        /** Our persistent DOM stuff */
        const $DOM = {
            currency_tooltip: {
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
            }
        };

        const SFX = {
            _settings: {},
            circ_saw: new buzz.sound()
        };

        var b = new buzz.sound("data:audio/wav;base64,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");
        b.play();
        setTimeout(function () {
            b.play();
        }, 5000);

        /** AJAX spinners throughout the page */
        const $AJAX_SPINNERS = {
            /** The spinner @ the currency tooltip */
            currency_tooltip: $('<img src="' + GM_getResourceURL("img_ajax_loader") + '"/>')
        };

        /** Misc function container */
        const fn = {
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
                        const low = r.l[0].price,
                            high = r.l[r.l.length - 1].price,
                            avg = Math.round((parseFloat(low) + parseFloat(high)) / 2);

                        fn.toggleVisibility($AJAX_SPINNERS.currency_tooltip, false);
                        $DOM.currency_tooltip.market_low.text(fn.numberWithCommas(low));
                        $DOM.currency_tooltip.market_avg.text(fn.numberWithCommas(avg));
                        $DOM.currency_tooltip.market_high.text(fn.numberWithCommas(high));
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
                /** @param {MutationRecord[]} node */
                function (node) {
                    if (node.length && $DOM.currency_tooltip.colour_reference.is(":visible")) {
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
                })
        };

        //Register currency tooltip code
        (function () {
            const $currencyTooltip = $("#currencyTooltip");

            if ($currencyTooltip.length) {
                const $tooltipTable = $(GM_getResourceText("html_market_tooltip"));

                $tooltipTable.find("th[colspan]").append($AJAX_SPINNERS.currency_tooltip);
                $DOM.currency_tooltip.table_row = $tooltipTable.find("tr[data-id=prices]");
                $DOM.currency_tooltip.market_low = $DOM.currency_tooltip.table_row.find(">td").first();
                $DOM.currency_tooltip.market_avg = $DOM.currency_tooltip.market_low.next();
                $DOM.currency_tooltip.market_high = $DOM.currency_tooltip.market_avg.next();

                //Add our stuff to the currency tooltips
                $currencyTooltip.append($tooltipTable);

                OBSERVERS.currency_tooltips.observe($currencyTooltip[0], {
                    attributes: true
                });
            }
        })();

        //Fix some CSS
        $("head").append('<style>.materials{color:' +
            $("#crafting_materials").css("color") +
            '}.fragments{color:' +
            $("#gem_fragments").css("color") + '}</style>');

        //Issue a "script updated" message if required
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

        //Load our CSS
        (function () {
            const $head = $("head");

            for (var i = 0; i < LOAD_CSS.length; i++) {
                $head.append("<link type='text/css' rel='stylesheet' href='" + LOAD_CSS[i] + "'/>");
                delete LOAD_CSS[i];
            }
        })();

        //Create our settings modal
        $("#modalContent").append($DOM.modal.script_settings);
        fn.tabify($DOM.modal.script_settings);

        //Register our side menu entry
        (function () {
            const $helpSection = $("#helpSection"),
                $menuLink = $('<a href="javascript:;"/>')
                    .html('<li class="active">' + GM_info.script.name + " " + GM_info.script.version + '</li>')
                    .click(function () {
                        $DOM.modal.modal_title.text(GM_info.script.name + " " + GM_info.script.version);
                        $DOM.modal.script_settings.show().siblings().hide();
                        $DOM.modal.modal_wrapper.fadeIn();
                        $DOM.modal.modal_background.fadeIn();
                    });


            $helpSection.append($menuLink);

            $("#navWrapper").css("padding-top", $menuLink.height());
        })();

        //Check for updates
        GM_xmlhttpRequest({
            method: "GET",
            url: UPDATE_URL,
            onload: function (r) {
                const theirVersion = r.responseText.match(/\/\/\s+@version\s+([^\n<>]+)/)[1];
                if (fn.versionCompare(GM_info.script.version, theirVersion) < 1) {
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
    })(jQuery, window.sessionStorage, MutationObserver, buzz);
}
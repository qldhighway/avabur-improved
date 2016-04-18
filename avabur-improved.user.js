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
// @resource    html_settings_modal     https://raw.githubusercontent.com/Alorel/avabur-improved/develop/res/html/script-settings.html?1
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
            circ_saw: new buzz.sound(GM_getResourceText("sfx_circ_saw")),
            msg_ding: new buzz.sound(GM_getResourceText("sfx_msg_ding"))
        };

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
// ==UserScript==
// @name           AvaburImproved
// @namespace      org.alorel.avaburimproved
// @author         Alorel <a.molcanovas@gmail.com>
// @homepage       https://github.com/Alorel/avabur-improved
// @description    Some welcome additions to Avabur's UI choices
// @include        https://avabur.com*
// @include        http://avabur.com*
// @version        0.1
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
// @resource    ajax_loader     https://raw.githubusercontent.com/Alorel/avabur-improved/master/res/img/ajax-loader/0.1.gif
// @resource    toast_css       https://raw.githubusercontent.com/Alorel/avabur-improved/master/lib/toastmessage/jquery.toastmessage.min.css
// @resource    toast_js        https://raw.githubusercontent.com/Alorel/avabur-improved/master/lib/toastmessage/jquery.toastmessage.min.js
// @noframes
// ==/UserScript==

(function ($) {
    'use strict';

    eval(GM_getResourceText("toast_js"));

    var Toast = {
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
        }
    };

    //No point in even continuing if you're using a prehistoric browser.
    if (typeof(MutationObserver) !== "undefined") {
        /**
         * Compares two software version numbers (e.g. "1.7.1" or "1.2b").
         *
         * This function was born in http://stackoverflow.com/a/6832721.
         *
         * @param {string} v1 The first version to be compared.
         * @param {string} v2 The second version to be compared.
         * @param {object} [options] Optional flags that affect comparison behavior:
         * <ul>
         *     <li>
         *         <tt>lexicographical: true</tt> compares each part of the version strings lexicographically instead of
         *         naturally; this allows suffixes such as "b" or "dev" but will cause "1.10" to be considered smaller than
         *         "1.2".
         *     </li>
         *     <li>
         *         <tt>zeroExtend: true</tt> changes the result if one version string has less parts than the other. In
         *         this case the shorter string will be padded with "zero" parts instead of being considered smaller.
         *     </li>
         * </ul>
         * @returns {number|NaN}
         * <ul>
         *    <li>0 if the versions are equal</li>
         *    <li>a negative integer iff v1 &lt; v2</li>
         *    <li>a positive integer iff v1 &gt; v2</li>
         *    <li>NaN if either version string is in the wrong format</li>
         * </ul>
         *
         * @copyright by Jon Papaioannou (["john", "papaioannou"].join(".") + "@gmail.com")
         * @license This function is in the public domain. Do what you want with it, no strings attached.
         */
        var versionCompare = function (v1, v2, options) {
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
            }, Observers = {
                currency_tooltips: new MutationObserver(
                    /** @param {MutationRecord[]|MutationRecord} node */
                    function (node) {
                        if (node.length && $currencyTooltipColourReference.is(":visible")) {
                            var cssClass = $currencyTooltipColourReference.attr("class"),
                                marketID = cssClass.replace("crystals", "premium")
                                    .replace("materials", "weapon_scraps")
                                    .replace("fragments", "gem_fragments");

                            $currencyTooltipMarketInfo.attr("class", cssClass);

                            if (cssClass === "gold") {
                                $currencyTooltipMarketInfo.text("N/A").show();
                                $AJAX_SPINNERS.currency_tooltip.hide();
                            } else {
                                $currencyTooltipMarketInfo.hide();
                                $AJAX_SPINNERS.currency_tooltip.show();

                                $.post("/market.php", {
                                    type: "currency",
                                    page: 0,
                                    st: marketID
                                }, AJAX_CALLBACKS.success.currency_tooltip, "json").fail(AJAX_CALLBACKS.error.generic);
                            }
                        }
                    })
            },
            AJAX_CALLBACKS = {
                success: {
                    currency_tooltip: function (r) {
                        $AJAX_SPINNERS.currency_tooltip.hide();
                        $currencyTooltipMarketInfo.text(fn.numberWithCommas(r.l[0].price)).show();
                    }
                },
                error: {
                    generic: function (xhr, textStatus, errorThrown) {
                        Toast.error("[" + textStatus + "] " + xhr.responseText);
                        console.error({
                            xhr: xhr,
                            textStatus: textStatus,
                            errorThrown: errorThrown
                        })
                    }
                }
            },
            LOAD_CSS = [
                GM_getResourceURL("toast_css")
            ],
            $AJAX_SPINNERS = {
                currency_tooltip: $('<img src="' + GM_getResourceURL("ajax_loader") + '"/>')
            },
            fn = {
                numberWithCommas: function (x) {
                    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
                }
            },
            $currencyTooltip = $("#currencyTooltip"),
            $currencyTooltipColourReference = $("#currencyTooltipMarketable"),
            $currencyTooltipMarketInfo = $("<span/>").hide();

        //Add our stuff to the currency tooltips
        $currencyTooltip.append(
            $("<div/>")
                .append("<span>Market lowest: </span>")
                .append($currencyTooltipMarketInfo)
                .append($AJAX_SPINNERS.currency_tooltip)
        );

        //Register observers
        Observers.currency_tooltips.observe($currencyTooltip[0], {
            attributes: true
        });

        //Fix some CSS
        $("head").append('<style>.materials{color:' +
            $("#crafting_materials").css("color") +
            '}.fragments{color:' +
            $("#gem_fragments").css("color") + '}</style>');

        if (versionCompare(GM_getValue("last_ver") || "999999", GM_info.script.version) < 0) {
            $().toastmessage('showToast', {
                text: GM_info.script.name + " has been updated! See the changelog "
                + "<a href='https://github.com/Alorel/avabur-improved/releases' target='_blank'>here</a>",
                sticky: true,
                position: 'top-left',
                type: 'success'
            });
        }

        GM_setValue("last_ver", GM_info.script.version);
        //Cleanup
        $currencyTooltip = null;
    } else {
        Toast.error("Your browser does not support MutationObserver. Please download a recent version of Chrome.");
    }

    //Load our CSS
    (function (hrefs) {
        var $head = $("head");

        for (var i = 0; i < hrefs.length; i++) {
            $head.append("<link type='text/css' rel='stylesheet' href='" + hrefs[i] + "'/>");
        }
    })(LOAD_CSS);

    //Cleanup
    LOAD_CSS = null;
})(jQuery);
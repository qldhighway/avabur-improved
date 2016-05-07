/** @module CoreFn */

/**
 * Whether we're in the dev version
 * @type {boolean}
 */
var is_dev = true,

    /**
     * Our current commit hash
     * @type {string}
     */
    dev_hash = "1f878fbb282667124559b3b576882fd229d2cd81",

    /**
     * The URL where we check for updates. This is different from @updateURL because we want it to come through
     * as a regular page load, not a request to the raw file
     * @type {string}
     */
    UPDATE_URL = "https://github.com/Alorel/avabur-improved/blob/master/avabur-improved.user.js",

    /**
     * The default author for gh_url
     * @type {string}
     */
    DEFAULT_GH_AUTHOR = "Alorel",

    /**
     * The default repo for gh_url
     * @type {string}
     */
    DEFAULT_GH_REPO = "avabur-improved",

// ====================================================================================================================

    /**
     * Our settings handler
     * @type SettingsHandler
     */
    Settings = require('./settings-handler'),

    /**
     * Whether the market has been opened yet
     * @type {boolean}
     */
    market_was_opened = false,

    /**
     * Market navigation menu
     * @type {*|jQuery|HTMLElement}
     */
    $MarketNavLinks = $("#marketTypeSelector").find("a"),

    /**
     * The standard game modal wrapper
     * @type {*|jQuery|HTMLElement}
     */
    $ModalWrapper = $("#modalWrapper"),
    /**
     * The faded background for modals
     * @type {*|jQuery|HTMLElement}
     */
    $ModalBackground = $("#modalBackground");

/**
 * Core functions
 */
var coreFn = {
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
    },

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
                if (coreFn.versionCompare(GM_info.script.version, theirVersion) < 0) {
                    coreFn.notification('A new version of ' + GM_info.script.name + ' is available! Click your ' +
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
        $this.html('<img src="' + coreFn.gh_url("res/img/ajax-loader.gif") + '" alt="Loading"/>');
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
        if (Settings.running.notifications.all.gm) {
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
        var doOpen = function () {
            $MarketNavLinks.removeClass("active")
                .filter("a:contains('" + type + "')").addClass("active").click();
        };
        if (market_was_opened) {
            coreFn.openStdModal("#marketWrapper");
            doOpen();
        } else {
            var $document = $(document);

            var $openCategory = function (evt, xhr, opts) {
                if (opts.url === "market.php") {
                    $document.unbind("ajaxComplete", $openCategory);
                    market_was_opened = true;
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
        var low = arr[0].price,
            high = arr[arr.length - 1].price;
        return {
            low: low,
            high: high,
            avg: Math.round((parseFloat(low) + parseFloat(high)) / 2)
        };
    },
    /**
     * Turns a raw GitHub URL into a CDN one
     * @param {String} path Path to the file
     * @param {String} [author=Alorel] The repository admin
     * @param {String} [repo=avabur-improved] The repository
     * @returns {String} The created URL
     */
    gh_url: function (path, author, repo) {
        author = author || DEFAULT_GH_AUTHOR;
        repo = repo || DEFAULT_GH_REPO;

        return "https://cdn.rawgit.com/" + author + "/" + repo + "/" +
            (is_dev ? dev_hash : GM_info.script.version) + "/" + path;
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
        $ModalBackground.fadeIn();
        $ModalWrapper.fadeIn();

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

module.exports = coreFn;
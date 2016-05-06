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
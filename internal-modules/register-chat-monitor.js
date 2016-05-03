/**
 * Log module
 * @module RegisterChatMonitor
 */

/**
 * Test
 * @param $
 * @param console
 * @param MutationObserver
 * @param ConsoleLogHTML
 * @param FastSet
 * @param flash_once
 */

module.exports = function ($, console, MutationObserver, ConsoleLogHTML, FastSet, flash_once) {
    var clear = function () {
        console.clear();
        btn.popover("hide");
        console.debug("Console cleared");
    };
    var levels = {
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
                $('<a href="javascript:;" style="float:right">Clear</a>'),
                '<div style="clear:both"></div>'
            ),
        container = $("<div/>").append(ul),
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

            for (var r = 0; r < records.length; r++) {
                var n, lvl;
                if (records[r].addedNodes.length) {
                    for (n = 0; n < records[r].addedNodes.length; n++) {
                        lvl = $(records[r].addedNodes[n]).addClass("avi-italic small").attr("data-level");

                        badgesToFlash.add(lvl);
                        levels[lvl].text(parseInt(levels[lvl].text()) + 1)
                    }
                }
                if (records[r].removedNodes.length) {
                    for (n = 0; n < records[r].removedNodes.length; n++) {
                        lvl = $(records[r].removedNodes[n]).attr("data-level");
                        badgesToFlash.add(lvl);
                        levels[lvl].text(parseInt(levels[lvl].text()) - 1);
                    }
                }
            }
            badgesToFlash.forEach(function (lvl) {
                flash_once(levels[lvl]);
            });
        })).observe(ul[0], {childList: true});
};
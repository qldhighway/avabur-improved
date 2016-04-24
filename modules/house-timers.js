exec_module({
    name: "House timers",
    desc: "Shows house construction timers without the need for an alarm clock",
    dependencies: {
        fn: ["parseTimeStringLong"],
        classes: ["AloTimer", "CssManager", "Interval"]
    },
    load: function ($, module) {
        var $baseDiv = $("<div class='col-xs-6 col-md-12'/>");

        /**
         * Click handler for the "(refresh)" button
         */
        function $click$refresh() {
            $.post("/house.php");
        }

        /**
         * End our interval
         * @param {classes.Interval} interval
         */
        function end(interval) {
            interval.clear();
            module.vars.paneSpan.addClass("avi-highlight").html(
                $('<span data-delegate-click="#header_house" style="cursor:pointer;text-decoration:underline;padding-right:5px">Ready!</span>')
            ).append($("<a href='javascript:;'>(refresh)</a>")
                .click($click$refresh));
        }

        /**
         * Handle an update to the house banner text
         * @param {String} text The text
         */
        function handle_house_status_update(text) {
            var interval = new module.dependencies.classes.Interval(module.spec.name);
            interval.clear();

            if (text.indexOf("available again") !== -1) { // Working
                var timer = new module.dependencies.classes.AloTimer(module.dependencies.fn.parseTimeStringLong(text));
                interval.set(function () {
                    if (timer.isFinished()) {
                        end(interval);
                    } else {
                        module.vars.paneSpan.removeClass("avi-highlight").text(timer.toString());
                    }
                }, 1000);
            } else if (text.indexOf("are available") !== -1) { // Available
                end(interval);
            } else {
                setTimeout($click$refresh, 3000); // Fuck knows - try again.
            }
        }

        module.vars = {
            paneLabel: $baseDiv.clone().addClass("col-lg-5 gold").text("Construction:"),
            paneSpan: $('<span>House unavailable</span>'),
            house_requery: function (evt, r, opts) {
                if (opts.url.indexOf("house") !== -1 &&
                    typeof(r.responseJSON) !== "undefined" &&
                    typeof(r.responseJSON.m) !== "undefined") {
                    handle_house_status_update(r.responseJSON.m);
                }
            },
            css: (new module.dependencies.classes.CssManager()).setRules({
                "#constructionNotifier,#houseTimerTable [data-typeid='Construction']": {
                    display: "none !important"
                }
            }).addToDOM()
        };
        module.vars.paneSpanContainer = $baseDiv.clone().addClass("col-lg-7").html(module.vars.paneSpan);

        $("#houseTimerInfo").addClass("avi-force-block");
        $("#houseTimerTable").prepend(module.vars.paneLabel, module.vars.paneSpanContainer);
        $(document).ajaxComplete(module.vars.house_requery);
        $click$refresh();
    },
    unload: function ($, module) {
        module.vars.paneLabel.remove();
        module.vars.paneSpanContainer.remove();
        module.vars.css.removeFromDOM();
        $(document).unbind("ajaxComplete", module.vars.house_requery);
        $("#houseTimerInfo").removeClass("avi-force-block");
        (new module.dependencies.classes.Interval(module.spec.name)).clear();
    }
});
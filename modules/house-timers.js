exec_module({
    name: "House timers",
    desc: "Shows house construction timers without the need for an alarm clock",
    dependencies: {
        classes: ["AloTimer", "CssManager"]
    },
    load: function ($, module) {
        const $baseDiv = $("<div class='col-xs-6 col-md-12'/>");
        module.vars = {
            paneLabel: $baseDiv.clone().addClass("col-lg-5 gold").text("Construction:"),
            paneSpan: $('<span>House unavailable</span>'),
            css: (new module.dependencies.classes.CssManager()).setRules({
                "#constructionNotifier,#houseTimerTable [data-typeid='Construction']": {
                    display: "none !important"
                }
            }).addToDOM()
        };
        module.vars.paneSpanContainer = $baseDiv.clone().addClass("col-lg-7").html(module.vars.paneSpan);

        $("#houseTimerInfo").addClass("avi-force-block");
        $("#houseTimerTable").prepend(module.vars.paneLabel, module.vars.paneSpanContainer);
    },
    unload: function ($, module) {
        module.vars.paneLabel.remove();
        module.vars.paneSpanContainer.remove();
        module.vars.css.removeFromDOM();
        $("#houseTimerInfo").removeClass("avi-force-block");
    }
});
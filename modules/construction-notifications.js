exec_module({
    name: "Construction notifications",
    desc: "Creates toast & sound notifications when house construction finishes",
    dependencies: {
        fn: ["parseTimeStringLong"],
        classes: ["AloTimer", "Interval"]
    },
    load: function ($, module) {
        function refresh() {
            $.post("/house.php");
        }

        module.vars = {
            notified: false,
            house_requery: function (evt, r, opts) {
                console.debug(r);
                if (opts.url.indexOf("house") !== -1 &&
                    typeof(r.responseJSON) !== "undefined" &&
                    typeof(r.responseJSON.m) !== "undefined") {

                    var text = r.responseJSON.m,
                        interval = new module.dependencies.classes.Interval(module.spec.name);
                    interval.clear();

                    if (text.indexOf("available again") !== -1) { // Working
                        var timer = new module.dependencies.classes.AloTimer(module.dependencies.fn.parseTimeStringLong(text));
                        interval.set(function () {
                            if (timer.isFinished()) {
                                interval.clear();
                                console.debug("Construction: available (NOT direct). Notified: " + (module.vars.notified ? "Y" : "N"));
                                module.vars.notified = true;
                            } else {
                                console.debug("Construction: available in " + timer.toString() + ". Notified: " + (module.vars.notified ? "Y" : "N"));
                                module.vars.notified = false;
                            }
                        }, 1000);
                    } else if (text.indexOf("are available") !== -1) { // Available
                        console.debug("Construction: available (direct). Notified: " + (module.vars.notified ? "Y" : "N"));
                        module.vars.notified = true;
                    } else {
                        setTimeout(refresh, 3000); // Fuck knows - try again.
                        console.debug("Construction: fuck knows. Notified: " + (module.vars.notified ? "Y" : "N"));
                    }
                }
            }
        };

        $(document).ajaxComplete(module.vars.house_requery);
        $.ajax("/house.php",{global:false}).done(function(r){console.error(r)});
    },
    unload: function ($, module) {
        $(document).unbind("ajaxComplete", module.vars.house_requery);
    }
});
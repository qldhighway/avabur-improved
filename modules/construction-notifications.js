exec_module({
    name: "Construction notifications",
    desc: "Creates toast & sound notifications when house construction finishes",
    dependencies: {
        fn: ["parseTimeStringLong", "gh_url", "notification"],
        classes: ["AloTimer", "Interval", "buzz"]
    },
    load: function ($, module) {
        function refresh() {
            $.post("/house.php");
        }

        function handle_text(text) {
            var interval = new module.dependencies.classes.Interval(module.spec.name);
            interval.clear();

            if (text.indexOf("available again") !== -1) { // Working
                var timer = new module.dependencies.classes.AloTimer(module.dependencies.fn.parseTimeStringLong(text));
                interval.set(function () {
                    if (timer.isFinished()) {
                        interval.clear();
                        module.vars.sfx.play();
                        module.dependencies.fn.notification("Construction finished", {title: module.spec.name});
                        module.vars.notified = true;
                    } else {
                        module.vars.notified = false;
                    }
                }, 1000);
            } else if (text.indexOf("are available") !== -1) { // Available
                module.vars.sfx.play();
                module.dependencies.fn.notification("Construction finished", {title: module.spec.name});
                module.vars.notified = true;
            } else {
                setTimeout(refresh, 3000); // Fuck knows - try again.
            }
        }

        module.vars.notified = false;
        module.vars = {
            notified: false,
            house_requery: function (evt, r, opts) {
                if (opts.url.indexOf("house") !== -1 &&
                    typeof(r.responseJSON) !== "undefined" &&
                    typeof(r.responseJSON.m) !== "undefined") {

                    handle_text(r.responseJSON.m);
                }
            },
            sfx: new module.dependencies.classes.buzz.sound(
                module.dependencies.fn.gh_url("res/sfx/circ_saw.wav")
            )
        };

        $(document).ajaxComplete(module.vars.house_requery);
        $.ajax("/house.php", {global: false}).done(function (r) {
            if (typeof(r.m) !== "undefined") {
                handle_text(r.m);
            }
        });
    },
    unload: function ($, module) {
        $(document).unbind("ajaxComplete", module.vars.house_requery);
    }
});
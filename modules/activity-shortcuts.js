exec_module({
    name: "Activity Shortcuts",
    desc: "Registers activity shortcuts on the side menu",
    dependencies: {
        fn: ["gh_url", "svg"]
    },
    load: function ($, module) {
        var $a = $("<a href='javascript:;' class='avi-tip avi-menu-shortcut'/>"),
            appends = [
                ['sword-clash', 'MobList', 'Open Battles'],
                ['fishing', 'Fishing', 'Open Fishing'],
                ['log', 'Woodcutting', 'Open Woodcutting'],
                ['metal-bar', 'Mining', 'Open Mining'],
                ['stone-block', '#loadStonecutting', 'Open Stonecutting']
            ], a;

        module.vars.li = $('<li class="avi-menu"/>');

        for (var i = 0; i < appends.length; i++) {
            a = $a.clone().attr({
                "data-delegate-click": "#load" + appends[i][1],
                'title': appends[i][2]
            });
            module.vars.li.append(a);
            module.dependencies.fn.svg(a, module.dependencies.fn.gh_url("res/svg/" + appends[i][0] + ".svg"))
        }

        $("#navWrapper").find("ul").append(module.vars.li);
    },
    unload: function ($, module) {
        module.vars.li.remove();
    }
});

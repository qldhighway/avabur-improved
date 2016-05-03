module.exports = {
    name: "Activity Shortcuts",
    desc: "Registers activity shortcuts on the side menu",
    id: "ACTIVITY_SHORTCUTS",
    dependencies: {
        fn: ["gh_url", "svg"]
    },
    vars: {
        /**
         * The buttons to append. The first element is the name of the SVG, followed by the ending of the button ID the
         * click should be delegated to, followed by the button title/tooltip
         */
        appends: [
            ['sword-clash', 'MobList', 'Open Battles'],
            ['fishing', 'Fishing', 'Open Fishing'],
            ['log', 'Woodcutting', 'Open Woodcutting'],
            ['metal-bar', 'Mining', 'Open Mining'],
            ['stone-block', '#loadStonecutting', 'Open Stonecutting']
        ]
    },
    load: function ($, module) {
        var vars = module.spec.vars,
            $a = $("<a href='javascript:;' class='avi-tip avi-menu-shortcut' style='border-bottom:none'/>"),
            $navul = $("#navWrapper").find("ul"),
            a;

        module.vars.li = $('<li class="avi-menu"/>');

        for (var i = 0; i < vars.appends.length; i++) {
            a = $a.clone().attr({
                "data-delegate-click": "#load" + vars.appends[i][1],
                'title': vars.appends[i][2]
            });
            module.vars.li.append(a);
            module.dependencies.fn.svg(a, module.dependencies.fn.gh_url("res/svg/" + vars.appends[i][0] + ".svg"))
        }

        $navul.append(module.vars.li);
    },
    unload: function ($, module) {
        module.vars.li.remove();
    }
};

exec_module({
    name: "Activity Shortcuts",
    desc: "Registers activity shortcuts on the side menu",
    dependencies: {
        fn: ["gh_url", "svg"]
    },
    load: function ($, module) {
        const $a = $("<a href='javascript:;' class='avi-tip avi-menu-shortcut'/>");
        const $appends = {
            'sword-clash': $a.clone().data("delegate-click", "#loadMobList").title("Open Battles"),
            fishing: $a.clone().data("delegate-click", "#loadFishing").title("Open Fishing"),
            log: $a.clone().data("delegate-click", "#loadWoodcutting").title("Open Woodcutting"),
            'metal-bar': $a.clone().data("delegate-click", "#loadMining").title("Open Mining"),
            'stone-block': $a.clone().data("delegate-click", "#loadStonecutting").title("Open Stonecutting")
        };
        const keys = Object.keys($appends);

        module.vars.li = $('<li class="avi-menu"/>');

        for (var i = 0; i < keys.length; i++) {
            module.vars.li.append($appends[keys[i]]);
            module.dependencies.fn.svg($appends[keys[i]], module.dependencies.fn.gh_url("res/svg/" + keys[i] + ".svg"));
        }

        $("#navWrapper").find("ul").append(module.vars.li);
    },
    unload: function ($, module) {
        module.vars.li.remove();
    }
});

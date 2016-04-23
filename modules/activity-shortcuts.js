exec_module({
    name: "test",
    desc: "",
    dependencies: {
        fn: ["gh_url", "svg"]
    },
    load: function ($, module) {
        const $appends = {
            battle: $("<a href='javascript:;' data-delegate-click='#loadMobList' class='avi-tip avi-menu-shortcut' title='Open Battles'/>"),
            fishing: $("<a href='javascript:;' data-delegate-click='#loadFishing' class='avi-tip avi-menu-shortcut' title='Open Fishing'/>"),
            wc: $("<a href='javascript:;' data-delegate-click='#loadWoodcutting' class='avi-tip avi-menu-shortcut' title='Open Woodcutting'/>"),
            mine: $("<a href='javascript:;' data-delegate-click='#loadMining' class='avi-tip avi-menu-shortcut' title='Open Ironing (lol)'/>"),
            quarry: $("<a href='javascript:;' data-delegate-click='#loadStonecutting' class='avi-tip avi-menu-shortcut' title='Open Stoners'/>")
        };

        module.vars.li = $('<li class="avi-menu"/>')
            .append($appends.battle)
            .append($appends.fishing)
            .append($appends.wc)
            .append($appends.mine)
            .append($appends.quarry);

        $("#navWrapper").find("ul").append(module.vars.li);

        module.dependencies.fn.svg($appends.battle, module.dependencies.fn.gh_url("res/svg/sword-clash.svg"));
        module.dependencies.fn.svg($appends.fishing, module.dependencies.fn.gh_url("res/svg/log.svg"));
        module.dependencies.fn.svg($appends.wc, module.dependencies.fn.gh_url("res/svg/metal-bar.svg"));
        module.dependencies.fn.svg($appends.mine, module.dependencies.fn.gh_url("res/svg/stone-block.svg"));
        module.dependencies.fn.svg($appends.quarry, module.dependencies.fn.gh_url("res/svg/fishing.svg"));
    },
    unload: function ($, module) {
        module.vars.li.remove();
    }
});

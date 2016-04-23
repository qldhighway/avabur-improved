exec_module({
    name: "test",
    vars: {},
    dependencies: {
        fn: ["gh_url", "svg"]
    },
    load: function ($, deps) {
        console.log(deps);
    },
    unload: function ($, deps) {

    }
});

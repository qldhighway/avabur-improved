var Spec = {
    /**
     * A module's manifest
     */
    Module: {
        /**
         * The module name
         * @type {String}
         */
        name: "Module name",
        /**
         * The module description
         * @type {String}
         */
        desc: "Module description",
        /**
         * Module dependencies
         */
        dependencies: {
            /**
             * Function dependencies
             * @type {?String[]}
             */
            fn: ["fn1", "fn2"],
            /**
             * Class dependencies
             * @type {?String[]}
             */
            classes: ["class1", "class2"]
        },

        /**
         * Module settings
         */
        settings: {
            /**
             * Module setting descriptions
             * @type {?Object} ModuleSettingsDesc
             * @property {...String} [prop] The properties
             */
            desc: {
                param1: "Desc of param1",
                param2: "desc of param2",
                param3: "desc of param3"
            },
            /**
             * Module default settings
             * @type {?Object} ModuleSettingsDefaults
             * @property {...String|...Number|...Boolean} [prop] The properties
             */
            defaults: {
                param1: "val",
                param2: false,
                param3: 3
            }
        },
        /**
         * Module-specific variables
         * @typedef {?Object} ModuleVars
         * @property {...String|...Boolean|...Number|...Function|...Object} [var] The variables
         */
        vars: {},
        /**
         * Custom-registered module functions
         * @typedef {?Object} ModuleFuncs
         * @property {...Function} [fn] The functions
         */
        funcs: {},
        /**
         * Loads the module
         * @param {!$|!jQuery} $ An instance of jQuery
         * @param {Module} module The module object
         */
        load: function ($, module) {
        },
        /**
         * Unloads the module, removing all its references from the page
         * @param {!$|!jQuery} $ An instance of jQuery
         * @param {!Module} module The module object
         */
        unload: function ($, module) {
        }
    },

    /**
     * Typical xhr response
     */
    xhr: {
        /**
         * The response text
         * @type String
         */
        responseText: "",
        /**
         * The response JSON
         * @type Object
         */
        responseJSON: {}
    }
};
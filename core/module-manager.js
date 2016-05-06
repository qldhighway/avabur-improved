/** @module CoreModuleManager */

/**
 * @typedef {Function} ModuleLoaderFunction
 * @param {*|jQuery|HTMLElement} $ The jQuery instance
 * @param {Module} module The module manager instance
 */

/**
 * Spec for a loadable module
 * @typedef {Object} ModuleSpec
 * @prop {string} id Module ID
 * @prop {string} name Module name
 * @prop {ModuleLoaderFunction} load Loader function
 * @prop {ModuleLoaderFunction|undefined} unload Unloader function
 * @prop {string} desc Module description
 * @prop {Object|undefined} settings Module settings
 * @prop {{}} settings.defaults Default module settings
 * @prop {{}|undefined} settings.desc Setting descriptions
 * @prop {{}|undefined} settings.demo Setting demos
 */


module.exports = {};
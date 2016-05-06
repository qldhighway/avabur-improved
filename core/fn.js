/** @module CoreFn */


module.exports = function ($) {
    return {
        /**
         * Flash an element once
         * @param {*|jQuery|HTMLElement} $element The element
         * @returns {*|jQuery|HTMLElement} the element
         */
        flash_once: function ($element) {
            $element.removeClass("avi-flash-once");
            setTimeout(function () {
                $element.addClass("avi-flash-once");
            }, 10);
            return $element;
        }
    }
};
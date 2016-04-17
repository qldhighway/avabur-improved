// ==UserScript==
// @name           AvaburImproved
// @namespace      org.alorel.avaburimproved
// @author         Alorel <a.molcanovas@gmail.com>
// @homepage       https://github.com/Alorel/avabur-improved
// @description    Some welcome additions to Avabur's UI choices
// @include        https://avabur.com*
// @include        http://avabur.com*
// @version        0.1
// @icon           https://avabur.com/images/favicon.ico
// @downloadURL    https://github.com/Alorel/avabur-improved/raw/master/avabur-improved.user.js
// @updateURL      https://github.com/Alorel/avabur-improved/raw/master/avabur-improved.user.js
// @run-at         document-end
// @grant          GM_getValue
// @grant          GM_setValue
// @grant          GM_deleteValue
// @grant          GM_notification
// @grant          GM_listValues
// @grant          GM_getResourceURL
// @grant          GM_getResourceText
// @grant          GM_xmlhttpRequest
// @connect        githubusercontent.com
// @connect        github.com
// @connect        self
// @resource    ajax_loader     https://raw.githubusercontent.com/Alorel/avabur-improved/master/res/img/ajax-loader/0.1.gif
// @noframes
// ==/UserScript==

(function ($) {
    'use strict';

    $("body").append('<img src="' + GM_getResourceURL("ajax_loader") + '"/>');
})(jQuery);
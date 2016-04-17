[![Install](https://raw.githubusercontent.com/Alorel/avabur-improved/master/res/img/install.png)](https://github.com/Alorel/avabur-improved/raw/master/avabur-improved.user.js)


----------


This is a **currently in-development** UserScript (to be used with [Greasemonkey](https://addons.mozilla.org/en-US/firefox/addon/greasemonkey/) on Firefox or [Tampermonkey](https://chrome.google.com/webstore/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo?hl=en) on Chrome - only the latest versions of Chrome have been tested) for [Relics of Avabur](http://www.avabur.com/?ref=12345). It does not automate gameplay, but it does make things easier for you! Raise an issue on Github or whisper Alorel in-game if you need support or have suggestions.

## Current features:

 - UI general
	 - Hovering a resource will now show its lowest, average and highest market prices like so (values are cached for a set amount of time):
	 ![Screenshot](https://raw.githubusercontent.com/Alorel/avabur-improved/master/screenshots/scr-market-tooltips.png)
	 - Fixed some of the CSS the devs left out ;) Hovering materials and fragments on the top bar will now display them in colour, just like all the other resources.

## Planned features:

 - Improvements on the inventory/market UI, making it much easier to sell ingredients/gear/gems
 - Market alerts - be notified when an item is above/below a threshold
 - Market watcher - historic graphs for price changes (stored locally on your machine)
 - Event notifications (whispers for now)
 - Squeezing out more information in general - once more data is available we might be able to predict your win rate on new mobs etc
 - Various timers (next house upgrade, for example)

## Planned features if the game devs approve:

 - Quest retaking. Instead of having to open the quest window, turn the quest in and take a new one, have one button that will fire all the requests in one click

## Greasemonkey permissions:

 - `GM_getValue`, `GM_setValue`, `GM_deleteValue`, `GM_listValues`:  these are simply used as an alternative to the browser's local storage. Userscript settings and runtime data are stored here.
 - `GM_getResourceURL`, `GM_getResourceText`:  some assets, such as 3rd party libraries, CSS files and images are static and will hardly ever change, so it makes sense for them to just be downloaded once and read from disk.
 - `GM_xmlhttpRequest` and the respective `@connect`s: right now a script update simply creates a toast message giving you a link to the changelog; in the future I plan on making the changelog viewable in-game by sending a request to GitHub. Unfortunately, this can't be done with jQuery's ajax calls due to cross-domain limitations, but it *can* be done with Greasemonkey as it makes a regular, non-ajax request.
 - `GM_notification`: for the upcoming notifications

## When's the next batch of updates?
I'm busy with exams until late May - should be able to deliver a regular batch of updates after that

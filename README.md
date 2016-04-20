[![Install](https://raw.githubusercontent.com/Alorel/avabur-improved/master/res/img/install.png)](https://github.com/Alorel/avabur-improved/raw/master/avabur-improved.user.js)


----------


This is a **currently in-development** UserScript (to be used with
[Greasemonkey](https://addons.mozilla.org/en-US/firefox/addon/greasemonkey/) on Firefox or
[Tampermonkey](https://chrome.google.com/webstore/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo?hl=en) on
Chrome - only the latest versions of Chrome have been tested) for
[Relics of Avabur](http://www.avabur.com/?ref=12345). It does not automate gameplay, but it does make things easier
for you! Raise an issue on Github or whisper Alorel in-game if you need support or have suggestions.

## Current features:

 - UI header bar
	 - Hovering a resource will now show its lowest, average and highest market prices like so (values are cached
	 for a set amount of time) [[Screenshot](https://github.com/Alorel/avabur-improved/blob/master/screenshots/scr-market-tooltips.png)]
	 - Clicking a sellable resource (crystals, plat, wood etc) will take you to that resource's market page
	 - Fixed some of the CSS the devs left out ;) Hovering materials and fragments on the top bar will now display
	 them in colour, just like all the other resources.
 - Notifications (can be configured in the [script settings](https://github.com/Alorel/avabur-improved/blob/master/screenshots/gi-settings.png), off by default)
     - Sound and/or browser notifications on *whispers*
     - Sound and/or browser notification when house construction finishes
 - Inventory
     - Ingredients are getting some love! Hover them to see their current market price, click them to go to the
     ingredients market tab. Unfortunately, the ingredient does not get auto-filtered. [[Screenshot](https://github.com/Alorel/avabur-improved/blob/master/screenshots/scr-fish-fin.png)]
 - House
     - Permanent construction timer without having to build an alarm clock
     [[Screenshot](https://github.com/Alorel/avabur-improved/blob/master/screenshots/permanent-house-timer.png)]! This
     feature is enabled by default and can be toggled off.

## Planned features:

 - Improvements on the inventory/market UI, making it much easier to sell ingredients/gear/gems
 - Market alerts - be notified when an item is above/below a threshold (most likely scrapped due to server requests)
 - Market watcher - historic graphs for price changes (stored locally on your machine)
 - Squeezing out more information in general - once more data is available we might be able to predict your win rate on new mobs etc
 - Fewer clicks for crafting/carving
 - [Item multisend](https://github.com/Alorel/avabur-improved/blob/develop/user-suggestions/item-multisend.txt)
 - Ingredient price lookup (partially implemented - demo in the inventory)

## Planned features if the game devs approve:

 - Quest retaking. Instead of having to open the quest window, turn the quest in and take a new one, have one button that will fire all the requests in one click

## Greasemonkey permissions:

 - `GM_getValue`, `GM_setValue`, `GM_deleteValue`, `GM_listValues`:  these are simply used as an alternative to
 the browser's local storage. Userscript settings and runtime data are stored here.
 - `GM_getResourceURL`, `GM_getResourceText`:  some assets, such as 3rd party libraries, CSS files and images are
 static and will hardly ever change, so it makes sense for them to just be downloaded once and read from disk.
 - `GM_xmlhttpRequest` and the respective `@connect`s: Used to check for updates. In the future it will also be used to
 view the changelog.
 - `GM_notification`: The name is self-explanatory now, isn't it? This is Greasemonkey's API for HTML5 notifications.

## When's the next batch of updates?
I'm busy with exams until late May - should be able to deliver a regular batch of updates after that

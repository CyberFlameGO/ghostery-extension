/**
 * Browser Button Class
 *
 * Manages the browser's badge icon, text and title
 *
 * Ghostery Browser Extension
 * https://www.ghostery.com/
 *
 * Copyright 2019 Ghostery, Inc. All rights reserved.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0
 */
import { getBrowserInfo } from '@ghostery/libs';

import conf from './Conf';
import foundBugs from './FoundBugs';
import Policy from './Policy';
import { getCommonData } from '../utils/commonModulesData';
import { getTab } from '../utils/utils';
import { log } from '../utils/common';
import globals from './Globals';

const IS_ANDROID = getBrowserInfo.isAndroid();

/**
 * @class for handling Ghostery button.
 * @memberof BackgroundClasses
 */
class BrowserButton {
	constructor() {
		this.backgrounds = {
			alert: [255, 157, 0, 230],
			default: [51, 0, 51, 230]
		};
	}

	/**
	 * Update the Ghostery icon in the browser toolbar
	 * @param  {number} tabId		tab id
	 */
	update(tabId) {
		if (IS_ANDROID) { return; }
		// Update this specific tab
		if (tabId) {
			// In ES6 classes, we need to bind context to callback function
			getTab(tabId, this._getIconCount.bind(this), (err) => {
				log('Button.update failed', err);
			});
		} else {
			// No tab ID was provided: update all active tabs
			chrome.tabs.query({
				active: true
			}, (tabs) => {
				// catch errors in case the tab no longer exists
				if (chrome.runtime.lastError) {
					log('chrome.tabs.query', chrome.runtime.lastError.message);
					return;
				}
				// map each tab to _getIconCount
				tabs.map(this._getIconCount.bind(this));
			});
		}
	}

	/**
	 * Set Ghostery icon in toolbar. We use a callback function in
	 * `chrome.browserAction.setIcon` to catch errors caused by closing
	 * multiple tabs at once.
	 *
	 * @private
	 *
	 * @param 	{boolean}	active			is Ghostery currently active / blocking enabled?
	 * @param 	{number} 	tabId			tab id
	 * @param 	{number}	trackerCount	current tracker count
	 * @param 	{boolean}	alert			is it a special case which requires button to change its background color?
	 */
	_setIcon(active, tabId, trackerCount, alert) {
		if (tabId <= 0) { return; }

		const iconAlt = (!active) ? '_off' : '';

		chrome.browserAction.setIcon({
			path: {
				19: `app/images/icon19${iconAlt}.png`,
				38: `app/images/icon38${iconAlt}.png`
			},
			tabId
		}, () => {
			if (chrome.runtime.lastError) {
				log('chrome.browserAction.setIcon', chrome.runtime.lastError);
			} else {
				// Because setBadgeText() and setBadgeBackgroundColor() don't
				// provide callbacks, we must check that the tab exists again to compensate for a race
				// condition that occurs if a user closes the tab while the trackers are still loading
				getTab(tabId, () => {
					if (typeof chrome.browserAction.setTitle === 'function') {
						chrome.browserAction.setTitle({
							title: chrome.i18n.getMessage('browser_button_tooltip'),
							tabId
						});
					}

					// Only show the badge if the conf setting allows it
					if (conf.show_badge) {
						const text = trackerCount;
						chrome.browserAction.setBadgeText({ text, tabId });

						// Set badge background color
						chrome.browserAction.setBadgeBackgroundColor({
							color: (alert ? this.backgrounds.alert : this.backgrounds.default),
							tabId
						});
					}
				});
			}
		});
	}

	/**
	 * Query foundbugs for any bugs on this tab
	 * and pass to _setIcon
	 *
	 * @private
	 *
	 * @param  {Object} tab 	tab object passed through via callback function
	 */
	_getIconCount(tab) {
		const tabId = tab.id;
		const tabHostUrl = tab.pageHost;
		let	trackerCount = '';
		let alert = false;

		if (!conf.setup_complete) {
			this._setIcon(false, tabId, '!', true);
			return;
		}

		// Get tracker count for badgeText
		if (foundBugs.getBugs(tabId) === false) {
			// if no cached bug discovery data then:
			// 	+ Ghostery was enabled after the tab started loading
			// 	+ or, this is a tab onBeforeRequest doesn't run in (non-http/https page)
			trackerCount = '';
			this._setIcon(false, tabId, trackerCount, alert);
			return;
		}

		const { appsCount, appsAlertCount } = BrowserButton._getTrackerCount(tabId);
		const adBlockingCount = getCommonData(tabId, tabHostUrl).trackerCount;
		const antiTrackingCount = getCommonData(tabId, tabHostUrl, true).trackerCount;

		alert = (appsAlertCount > 0);
		trackerCount = (appsCount + antiTrackingCount + adBlockingCount).toString();

		// gray-out the icon when blocking has been disabled for whatever reason
		if (trackerCount === '') {
			this._setIcon(false, tabId, trackerCount, alert);
		} else {
			this._setIcon(!globals.SESSION.paused_blocking && Policy.getSitePolicy(tab.url) !== globals.WHITELISTED, tabId, trackerCount, alert);
		}
	}

	/**
	 * Gets tracker count the traditional way, from BugDb
	 * @param  {number} tabId  the Tab Id
	 * @param  {string} tabUrl the Tab URL
	 * @return {Object}        the number of total trackers and alerted trackers in an Object
	 */
	static _getTrackerCount(tabId, tabUrl) {
		const apps = foundBugs.getAppsCountByIssues(tabId, tabUrl);
		return {
			appsCount: apps.all,
			appsAlertCount: apps.total,
		};
	}
}

export default new BrowserButton();

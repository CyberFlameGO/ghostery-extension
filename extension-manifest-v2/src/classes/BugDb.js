/**
 * BugDb Class
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
import { FiltersEngine } from '@cliqz/adblocker';

import conf from './Conf';

/**
 * Class for handling the main Ghostery trackers database
 */
class BugDb {
	constructor() {
		this.db = {
			categories: {},
			apps: {},
			bugs: {},
			version: 0,
		};
	}

	async init() {
		const response = await fetch(
			chrome.runtime.getURL('databases/trackerdb.engine.bytes'),
		);
		const rawTrackerDB = await response.arrayBuffer();
		const engine = FiltersEngine.deserialize(new Uint8Array(rawTrackerDB));
		const selectedApps = conf.selected_app_ids || {};

		const categoriesMeta = engine.metadata.getCategories().reduce((all, category) => ({
			...all,
			[category.key]: {
				trackers: [],
				blockedTrackersCount: 0,
			},
		}), {});

		engine.metadata.getPatterns().forEach((pattern) => {
			categoriesMeta[pattern.category].trackers.push({
				id: String(pattern.ghostery_id),
				name: pattern.name,
				description: '',
				blocked: selectedApps.hasOwnProperty(pattern.ghostery_id),
				shouldShow: true,
				catId: pattern.category,
				trackerID: pattern.key,
			});

			if (selectedApps.hasOwnProperty(pattern.ghostery_id)) {
				categoriesMeta[pattern.category].blockedTrackersCount += 1;
			}
		});

		this.db.categories = engine.metadata.getCategories().map(({ key: category }) => ({
			id: category,
			name: t(`category_${category}`),
			description: t(`category_${category}_desc`),
			img_name: (category === 'advertising') ? 'adv' : // Because AdBlock blocks images with 'advertising' in the name.
				(category === 'social_media') ? 'smed' : category, // Because AdBlock blocks images with 'social' in the name.
			num_total: categoriesMeta[category].trackers.length,
			num_blocked: categoriesMeta[category].blockedTrackersCount,
			trackers: categoriesMeta[category].trackers,
		}));

		this.db.apps = engine.metadata.getPatterns().reduce((all, pattern) => ({
			...all,
			[String(pattern.ghostery_id)]: {
				name: pattern.name,
				trackerID: pattern.key,
				cat: pattern.category,
			},
		}), {});

		this.db.bugs = engine.metadata.getPatterns().reduce((all, pattern) => ({
			...all,
			[String(pattern.ghostery_id)]: {
				aid: String(pattern.ghostery_id),
			},
		}), {});

		this.engine = engine;
		conf.bugs = this.db;
	}
}

export default new BugDb();

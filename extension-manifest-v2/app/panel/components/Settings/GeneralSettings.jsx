/**
 * General Settings Component
 *
 * Ghostery Browser Extension
 * https://www.ghostery.com/
 *
 * Copyright 2020 Ghostery, Inc. All rights reserved.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0
 */

import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment/min/moment-with-locales.min';
/**
 * @class Implement General Settings subview. The view opens from the
 * left-side menu of the main Settings view.
 * @memberOf SettingsComponents
 */
class GeneralSettings extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			dbLastUpdated: '',
		};

		// event bindings
		this.updateDatabase = this.updateDatabase.bind(this);
	}

	/**
	 * Lifecycle event.
	 */
	static getDerivedStateFromProps(prevProps, prevState) {
		const dbLastUpdated = GeneralSettings.getDbLastUpdated(prevProps.settingsData);

		if (dbLastUpdated && dbLastUpdated !== prevState.dbLastUpdated) {
			return { dbLastUpdated };
		}
		return null;
	}

	/**
	 * Get DB check timestamp and return it.
	 * @param  {Object} settingsData
	 */
	static getDbLastUpdated(settingsData) {
		const { language, bugs_last_checked } = settingsData;
		moment.locale(language).toLowerCase().replace('_', '-');
		const dbLastUpdated = moment(bugs_last_checked).format('LLL');
		return dbLastUpdated;
	}

	/**
	 * Lifecycle event.
	 */
	componentDidMount() {
		const { settingsData } = this.props;
		this.updateDbLastUpdated(settingsData);
	}

	/**
	 * Trigger action to check for new DB updates.
	 */
	updateDatabase() {
		const { actions } = this.props;
		actions.updateDatabase();
	}

	/**
	 * Update DB check timestamp and save it in state.
	 * @param  {Object} settingsData
	 */
	updateDbLastUpdated(settingsData) {
		const { dbLastUpdated } = this.state;
		const calcDbLastUpdated = GeneralSettings.getDbLastUpdated(settingsData);

		if (calcDbLastUpdated && calcDbLastUpdated !== dbLastUpdated) {
			this.setState({ dbLastUpdated: calcDbLastUpdated });
		}
	}

	/**
	* Render General Settings subview.
	* @return {ReactComponent}   ReactComponent instance
	*/
	render() {
		const { settingsData, toggleCheckbox } = this.props;
		const { dbLastUpdated } = this.state;

		return (
			<div id="general-settings-panel" className="s-tabs-panel">
				<div className="row">
					<div className="columns">
						<h3>WhoTracks.Me</h3>
						<div className="s-option-group">
							<div className="s-square-checkbox">
								<input type="checkbox" id="settings-wtm-serp-report" name="enable_wtm_serp_report" defaultChecked={settingsData.enable_wtm_serp_report} onClick={toggleCheckbox} />
								<label htmlFor="settings-wtm-serp-report">{ t('settings_wtm_serp_report') }</label>
								<div className="s-checkbox-label">
									<span id="last-updated-span"><a href="https://ghostery.com/blog/introducing-wtm-serp-report" target="_blank" rel="noreferrer">{ t('panel_detail_learn_more') }</a></span>
								</div>
							</div>
						</div>
						<h3>{ t('settings_trackers') }</h3>
						<div className="s-option-group">
							<div className="s-square-checkbox">
								<input type="checkbox" id="settings-auto-update" name="enable_autoupdate" defaultChecked={settingsData.enable_autoupdate} onClick={toggleCheckbox} />
								<label htmlFor="settings-auto-update">
									{ t('settings_auto_update') }
								</label>
								<div className="s-checkbox-label">
									<span id="last-updated-span">
										{ t('settings_last_update') }
										{' '}
									</span>
									<span id="last-updated-span-value">{ dbLastUpdated }</span>
									<span id="update-now-span" className="s-blue-header" onClick={this.updateDatabase}>
										{' '}
										{ settingsData.dbUpdateText }
									</span>
								</div>
							</div>
						</div>
						<div className="s-option-group">
							<div className="s-square-checkbox">
								<input type="checkbox" id="settings-show-patterns" name="show_tracker_urls" defaultChecked={settingsData.show_tracker_urls} onClick={toggleCheckbox} />
								<label htmlFor="settings-show-patterns">
									<span>{ t('settings_show_patterns') }</span>
								</label>
								<div className="s-tooltip-up" data-g-tooltip={t('settings_show_patterns_tooltip')}>
									<img src="/app/images/panel/icon-information-tooltip.svg" className="s-question" />
								</div>
							</div>
						</div>
						<h3 className="s-special">{ t('settings_highlight_trackers') }</h3>
						<div className="s-tooltip-down-click-to-play-img" data-g-tooltip={t('settings_highlight_trackers_tooltip')}>
							<img src="/app/images/panel/icon-information-tooltip.svg" className="s-question" />
						</div>
						<div className="s-option-group">
							<div className="s-square-checkbox">
								<input type="checkbox" id="settings-enable-click2play" name="enable_click2play" defaultChecked={settingsData.enable_click2play} onClick={toggleCheckbox} />
								<label htmlFor="settings-enable-click2play">
									{ t('settings_required_trackers') }
								</label>
							</div>
						</div>
						<div className="s-option-group">
							<div className="s-square-checkbox">
								<input type="checkbox" id="settings-replace-social" name="enable_click2play_social" defaultChecked={settingsData.enable_click2play_social} onClick={toggleCheckbox} />
								<label htmlFor="settings-replace-social">{ t('settings_replace_social') }</label>
							</div>
						</div>
						<h3>{ t('settings_blocking') }</h3>
						<div className="s-option-group">
							<div className="s-square-checkbox">
								<input type="checkbox" id="settings-individual-trackers" name="toggle_individual_trackers" defaultChecked={settingsData.toggle_individual_trackers} onClick={toggleCheckbox} />
								<label htmlFor="settings-individual-trackers">
									<span>{ t('settings_individual_trackers') }</span>
								</label>
								<div className="s-tooltip-up" data-g-tooltip={t('settings_individual_trackers_tooltip')}>
									<img src="/app/images/panel/icon-information-tooltip.svg" className="s-question" />
								</div>
							</div>
						</div>
						<div className="s-option-group">
							<div className="s-square-checkbox">
								<input type="checkbox" id="settings-allow-trackers" name="ignore_first_party" defaultChecked={settingsData.ignore_first_party} onClick={toggleCheckbox} />
								<label htmlFor="settings-allow-trackers">
									<span>{ t('settings_allow_trackers') }</span>
								</label>
								<div className="s-tooltip-up" data-g-tooltip={t('settings_allow_trackers_tooltip')}>
									<img src="/app/images/panel/icon-information-tooltip.svg" className="s-question" />
								</div>
							</div>
						</div>
						<div className="s-option-group">
							<div className="s-square-checkbox">
								<input type="checkbox" id="settings-show-redirect-tracking-dialogs" name="show_redirect_tracking_dialogs" defaultChecked={settingsData.show_redirect_tracking_dialogs} onClick={toggleCheckbox} />
								<label htmlFor="settings-show-redirect-tracking-dialogs">
									<span>{ t('settings_show_redirect_tracking_dialogs') }</span>
								</label>
								<div className="s-tooltip-up" data-g-tooltip={t('settings_show_redirect_tracking_dialogs_tooltip')}>
									<img src="/app/images/panel/icon-information-tooltip.svg" className="s-question" />
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		);
	}
}

GeneralSettings.propTypes = {
	actions: PropTypes.shape({
		updateDatabase: PropTypes.func.isRequired,
	}).isRequired,
	toggleCheckbox: PropTypes.func.isRequired,
	settingsData: PropTypes.shape({
		language: PropTypes.string.isRequired,
		bugs_last_checked: PropTypes.number.isRequired,
		enable_autoupdate: PropTypes.bool.isRequired,
		dbUpdateText: PropTypes.string,
		show_tracker_urls: PropTypes.bool.isRequired,
		enable_click2play: PropTypes.bool.isRequired,
		enable_click2play_social: PropTypes.bool.isRequired,
		toggle_individual_trackers: PropTypes.bool.isRequired,
		ignore_first_party: PropTypes.bool.isRequired,
	}).isRequired,
};

export default GeneralSettings;

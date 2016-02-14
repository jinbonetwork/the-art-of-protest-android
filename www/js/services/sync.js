angular.module('starter.services')

	.constant('UPDATE_RESULT',
		/**
		 * @ngdoc constant
		 * @name UPDATE_RESULT
		 */
		{
			// TODO Custom Errors로 개선 https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error
			UPDATED: {
				type: "SUCCESS",
				id: "UPDATED"
			},
			ALREADY: {
				type: "SUCCESS",
				id: "ALREADY"
			},
			NETWORK_ERROR: {
				type: "FAILED",
				id: "NETWORK_ERROR"
			},
			UNKNOWN_ERROR: {
				type: "FAILED",
				id: "UNKNOWN_ERROR"
			}
		})

	.factory('AppUpdater',
		/**
		 * @ngdoc factory
		 * @name AppUpdater
		 * @param {$q} $q
		 * @param {$log} $log
		 * @param {LocalStorage} LocalStorage
		 * @param {RestService} RestService
		 * @param {CategoryUpdater} CategoryUpdater
		 * @param {PostUpdater} PostUpdater
		 * @param {NoticeUpdater} NoticeUpdater
		 * @param {IntroUpdater} IntroUpdater
		 * @param {SettingService} SettingService
		 * @param {UPDATE_RESULT} UPDATE_RESULT
		 */
		function ($q, $log, LocalStorage, RestService, CategoryUpdater, PostUpdater, NoticeUpdater, IntroUpdater, SettingService, UPDATE_RESULT) {
			var HOME_KEY = "HOME_VERSION";
			var POST_KEY = "POST_VERSION";

			return {
				getLastUpdate: function () {
					var postVersion = LocalStorage.get(POST_KEY);

					if (_.isUndefined(postVersion)) {
						return undefined;
					} else {
						return new Date(postVersion);
					}
				},

				/**
				 * @returns {Promise}
				 */
				update: function () {
					return RestService.getVersion()
						.then(function (response) {
							var homeVersion = LocalStorage.get(HOME_KEY);
							var postVersion = LocalStorage.get(POST_KEY);

							var currHomeVersion = new Date(response.data.home_version * 1000).toJSON();
							var currPostVersion = new Date(response.data.content_version * 1000).toJSON();

							$log.debug(`홈 버전 : 로컬(${currHomeVersion}), 서버(${homeVersion})`);
							$log.debug(`컨텐트 버전 : 로컬(${currPostVersion}), 서버(${postVersion})`);

							var updates = [];

							if (_.isUndefined(postVersion) || currPostVersion != postVersion) {
								updates.push(
									CategoryUpdater.update(),
									PostUpdater.updateAll(),
									NoticeUpdater.updateAll()
								);
							}

							if (_.isUndefined(homeVersion) || currHomeVersion != homeVersion) {
								updates.push(
									IntroUpdater.update()
								);
							}

							if (updates.length > 0) {
								$log.info("업데이트를 시작합니다.");

								return $q.all(updates).then(function () {
									$log.info("업데이트가 완료되었습니다.");
									LocalStorage.set(HOME_KEY, currHomeVersion);
									LocalStorage.set(POST_KEY, currPostVersion);
									return UPDATE_RESULT.UPDATED;
								});
							}

							$log.info("이미 최신입니다.");
							return UPDATE_RESULT.ALREADY;
						}).catch(function (err) {
							//TODO err 분석
							$log.warn("업데이트 중 에러가 발생했습니다.", err);
							return UPDATE_RESULT.NETWORK_ERROR;
						});
				}
			};
		});

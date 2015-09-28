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

		var checkUpdate = function () {
			var homeVersion = LocalStorage.get(HOME_KEY);
			var postVersion = LocalStorage.get(POST_KEY);

			// TODO 홈 화면의 버전 확인
			return RestService.getPostVersion()
				.then(function (response) {
					var currPostVersion = response.data.posts[0].modified;
					$log.debug(currPostVersion);
					$log.debug(postVersion);

					if (_.isUndefined(postVersion) || currPostVersion != postVersion) {
						$log.info("업데이트가 필요합니다.");
						return currPostVersion;
					} else {
						$log.info("최신으로 업데이트되어 있습니다.");
						return false;
					}
				});
		};

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
				return checkUpdate()
					.then(function (newestPostVersion) {
						if (newestPostVersion !== false) {
							$log.info("업데이트를 시작합니다.");

							return $q.all([
								// 홈 업데이트
								IntroUpdater.update(),
								// 카테고리 업데이트
								CategoryUpdater.update(),
								// 글 업데이트
								PostUpdater.updateAll(),
								// TODO 개별 update() 호출
								// 공지 업데이트
								NoticeUpdater.updateAll()
								// TODO 설정 확인
							]).then(function () {
								$log.info("업데이트가 완료되었습니다.");
								LocalStorage.set(POST_KEY, newestPostVersion);
								return UPDATE_RESULT.UPDATED;
							});
						}

						return UPDATE_RESULT.ALREADY;
					}).catch(function (err) {
						//TODO err 분석
						$log.warn("업데이트 중 에러가 발생했습니다.", err);
						return UPDATE_RESULT.NETWORK_ERROR;
					});
			}
		};
	});

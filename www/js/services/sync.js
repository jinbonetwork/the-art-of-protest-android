angular.module('starter.services')

	.service('SyncService',
	/**
	 * @ngdoc service
	 * @name SyncService
	 * @param {$q} $q
	 * @param {$log} $log
	 * @param {LocalStorage} LocalStorage
	 * @param {RestService} RestService
	 * @param {CategoryService} CategoryService
	 * @param {PostService} PostService
	 * @param {NoticeService} NoticeService
	 * @param {IntroService} IntroService
	 * @param {SettingService} SettingService
	 */
	function ($q, $log, LocalStorage, RestService, CategoryService, PostService, NoticeService, IntroService, SettingService) {
		var HOME_KEY = "HOME_VERSION";
		var POST_KEY = "POST_VERSION";

		var checkUpdate = function () {
			var deferred = $q.defer();

			var homeVersion = LocalStorage.get(HOME_KEY);
			var postVersion = LocalStorage.get(POST_KEY);

			// TODO 홈 화면의 버전 확인
			RestService.getPostVersion()
				.then(function (response) {
					var currPostVersion = response.data.posts[0].modified;
					$log.debug(currPostVersion);
					$log.debug(postVersion);

					if (_.isUndefined(postVersion) || currPostVersion != postVersion) {
						$log.debug("동기화가 필요합니다.");
						deferred.resolve(currPostVersion);
					} else {
						$log.debug("최신으로 동기화되어 있습니다.");
						deferred.resolve(false);
					}
				});

			return deferred.promise;
		};

		this.getLastUpdate = function () {
			return new Date(LocalStorage.get(POST_KEY));
		};

		/**
		 * @returns {Promise}
		 */
		this.sync = function () {
			return checkUpdate()
				.then(function (newestPostVersion) {
					if (newestPostVersion !== false) {
						$log.debug("동기화를 시작합니다.");

						return $q.all([
							// 홈 업데이트
							IntroService.sync(),
							// 카테고리 업데이트
							CategoryService.sync(),
							// 글 업데이트
							PostService.syncAll(),
							// TODO 개별 sync() 호출
							// 공지 업데이트
							NoticeService.syncAll()
							// TODO 설정 확인
						]).then(function () {
							$log.debug("동기화가 완료되었습니다.");
							LocalStorage.set(POST_KEY, newestPostVersion);
						});
					} else {
						IntroService.release();
						CategoryService.release();
						PostService.release();
						NoticeService.release();
					}
				});
		}
	});

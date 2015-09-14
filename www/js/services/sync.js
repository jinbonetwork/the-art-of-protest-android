angular.module('starter.services')

	.service('$syncService',
	/**
	 * @ngdoc service
	 * @name $syncService
	 * @param {$q} $q
	 * @param {$log} $log
	 * @param {$localStorage} $localStorage
	 * @param {$restService} $restService
	 * @param {$categoryService} $categoryService
	 * @param {$postService} $postService
	 * @param {$noticeService} $noticeService
	 * @param {$introService} $introService
	 * @param {$settingService} $settingService
	 */
	function ($q, $log, $localStorage, $restService, $categoryService, $postService, $noticeService, $introService, $settingService) {
		var HOME_KEY = "HOME_VERSION";
		var POST_KEY = "POST_VERSION";

		var checkUpdate = function () {
			var deferred = $q.defer();

			var homeVersion = $localStorage.get(HOME_KEY);
			var postVersion = $localStorage.get(POST_KEY);

			// TODO 홈 화면의 버전 확인
			$restService.getPostVersion()
				.then(function (response) {
					var currPostVersion = response.data.posts[0].modified;
					$log.debug(currPostVersion);
					$log.debug(postVersion);

					if (_.isUndefined(postVersion) || currPostVersion != postVersion) {
						$localStorage.set(POST_KEY, currPostVersion);

						$log.debug("동기화가 필요합니다.");
						deferred.resolve(true);
					} else {
						$log.debug("최신으로 동기화되어 있습니다.");
						deferred.resolve(false);
					}
				});

			return deferred.promise;
		};

		this.getLastUpdate = function () {
			return new Date($localStorage.get(POST_KEY));
		};

		/**
		 * @returns {Promise}
		 */
		this.sync = function () {
			return checkUpdate()
				.then(function (needUpdate) {
					if (needUpdate) {
						return $q.all([
							// 홈 업데이트
							$introService.sync(),
							// 카테고리 업데이트
							$categoryService.sync(),
							// 글 업데이트
							$postService.syncAll(),
							// TODO 개별 sync() 호출
							// 공지 업데이트
							$noticeService.syncAll()
							// TODO 설정 확인
						]);
					} else {
						$introService.release();
						$categoryService.release();
						$postService.release();
						$noticeService.release();
					}
				});
		}
	});

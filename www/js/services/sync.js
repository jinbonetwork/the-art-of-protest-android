angular.module('starter.services')

	.service('$syncService',
	/**
	 * @ngdoc service
	 * @name $syncService
	 * @param {$q} $q
	 * @param {$categoryService} $categoryService
	 * @param {$postService} $postService
	 * @param {$noticeService} $noticeService
	 * @param {$introService} $introService
	 * @param {$settingService} $settingService
	 */
	function ($q, $categoryService, $postService, $noticeService, $introService, $settingService) {
		/**
		 * @returns {Promise}
		 */
		this.sync = function () {
			return $q.all([
				// TODO 버전 확인
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
		}
	});

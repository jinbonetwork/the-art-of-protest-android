angular.module('starter.services')

	.service('$syncService', function ($q, $categoryService, $postService, $noticeService, $settingService) {
		this.sync = function () {
			return $q.all([
				// TODO 버전 확인
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

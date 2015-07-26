angular.module('starter.controllers', ['starter.services'])

	.controller('AppCtrl', function ($scope, $ionicModal, $timeout, $http, $localStorage, $categoryService, $restService, $log) {
		var isManual = function (category) {
			return category.parent == 2;
		};

		//TODO localstorage 이용 버전 확인
		//TODO 정렬

		$categoryService.all().then(function (result) {
			$scope.categories = _(result.rows).map(function (obj) {
				return obj.doc;
			});
		}).catch($log.error);

		$restService.getCategories()
			.success(function (data, status, headers, config) {
				var manualCategories = _(data.categories).filter(isManual).map(function (obj) {
					//PouchDB ID 추가
					obj._id = obj.ID + "";
					return obj;
				});

				$categoryService.reset(manualCategories);

				$scope.categories = manualCategories;
			})
			.error(function (data, status, headers, config) {
				$log.error(status);
			});

		// With the new view caching in Ionic, Controllers are only called
		// when they are recreated or on app start, instead of every page change.
		// To listen for when this page is active (for example, to refresh data),
		// listen for the $ionicView.enter event:
		//$scope.$on('$ionicView.enter', function(e) {
		//});

		// Form data for the login modal
		$scope.loginData = {};

		// Create the login modal that we will use later
		$ionicModal.fromTemplateUrl('templates/login.html', {
			scope: $scope
		}).then(function (modal) {
			$scope.modal = modal;
		});

		// Triggered in the login modal to close it
		$scope.closeLogin = function () {
			$scope.modal.hide();
		};

		// Open the login modal
		$scope.login = function () {
			$scope.modal.show();
		};

		// Perform the login action when the user submits the login form
		$scope.doLogin = function () {
			$log.log('Doing login', $scope.loginData);

			// Simulate a login delay. Remove this and replace with your login
			// code if using a login system
			$timeout(function () {
				$scope.closeLogin();
			}, 1000);
		};
	})

	.controller('NoticesCtrl', function ($restService, $scope) {
		$scope.notices = [
			{title: '내용을 불러오는 중입니다.', id: 0}
		];

		$restService.getNotices()
			.success(function (data, status, headers, config) {
				$scope.notices = data.posts;
			})
			.error(function (data, status, headers, config) {
			});
	})

	.controller('NoticeCtrl', function ($scope, $stateParams, $restService) {
		$restService.getNotice($stateParams.noticeId)
			.success(function (data, status, headers, config) {
				$scope.notice = data;
			})
			.error(function (data, status, headers, config) {
			});
	})

	.controller('DocumentsCtrl', function ($scope, $restService) {
		$scope.documents = [
			{title: '내용을 불러오는 중입니다.', id: 0}
		];

		$restService.getDocuments()
			.success(function (data, status, headers, config) {
				$scope.documents = data.posts;
			})
			.error(function (data, status, headers, config) {
			});
	})

	.controller('DocumentCtrl', function ($scope, $stateParams, $restService) {
		$restService.getDocument($stateParams.documentId)
			.success(function (data, status, headers, config) {
				$scope.document = data;
			})
			.error(function (data, status, headers, config) {
			});
	})

	.controller('BookmarksCtrl', function ($scope) {
		$scope.bookmarks = [
			{title: 'Bookmark1', id: 1},
			{title: 'Bookmark2', id: 2},
			{title: 'Book3', id: 3},
			{title: 'Indie', id: 4},
			{title: 'Rap', id: 5},
			{title: 'Cowbell', id: 6}
		];
	})

	.controller('SettingsCtrl', function ($scope) {
		$scope.settings = [
			{title: 'Bookmark1', id: 1},
			{title: 'Bookmark2', id: 2},
			{title: 'Book3', id: 3},
			{title: 'Indie', id: 4},
			{title: 'Rap', id: 5},
			{title: 'Cowbell', id: 6}
		];
	});

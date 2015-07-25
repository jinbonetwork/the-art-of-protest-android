angular.module('starter.controllers', [])

	.controller('AppCtrl', function ($scope, $ionicModal, $timeout, $http) {

		$scope.isManual = function (category) {
			return category.parent == 2;
		};

		$http({
			method: 'GET',
			url: $scope.api + "/categories",
			params: {
				'category': 'notice',
				'status': 'publish'
			}
		})
			.success(function (data, status, headers, config) {
				$scope.categories = data.categories;
			})
			.error(function (data, status, headers, config) {
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
			console.log('Doing login', $scope.loginData);

			// Simulate a login delay. Remove this and replace with your login
			// code if using a login system
			$timeout(function () {
				$scope.closeLogin();
			}, 1000);
		};
	})

	.controller('NoticesCtrl', function ($scope, $http) {
		$scope.notices = [
			{title: '내용을 불러오는 중입니다.', id: 0}
		];

		$http({
			method: 'GET',
			url: $scope.api + "/posts/",
			params: {
				'category': 'notice',
				'status': 'publish'
			}
		})
			.success(function (data, status, headers, config) {
				$scope.notices = data.posts;
			})
			.error(function (data, status, headers, config) {
			});
	})

	.controller('NoticeCtrl', function ($scope, $stateParams, $http) {
		$http({
			method: 'GET',
			url: $scope.api + "/posts/" + $stateParams.noticeId
		})
			.success(function (data, status, headers, config) {
				$scope.notice = data;
			})
			.error(function (data, status, headers, config) {
			});
	})

	.controller('DocumentsCtrl', function ($scope, $http) {
		$scope.documents = [
			{title: '내용을 불러오는 중입니다.', id: 0}
		];

		$http({
			method: 'GET',
			url: $scope.api + "/posts/",
			params: {
				'category': 'manual',
				'status': 'publish'
			}
		})
			.success(function (data, status, headers, config) {
				$scope.documents = data.posts;
			})
			.error(function (data, status, headers, config) {
			});
	})

	.controller('DocumentCtrl', function ($scope, $stateParams, $http) {
		$http({
			method: 'GET',
			url: $scope.api + "/posts/" + $stateParams.documentId
		})
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

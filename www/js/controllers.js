angular.module('starter.controllers', ['starter.services'])

	.controller('AppCtrl', function ($scope, $ionicModal, $timeout, $http, $localStorage, $categoryService, $log) {
		//TODO localstorage 이용 버전 확인
		//TODO 정렬

		$categoryService.retrieveAll(function (categories) {
			$scope.categories = categories;
		}, $log.error);

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

	.controller('NoticesCtrl', function ($noticeService, $scope, $log) {
		$noticeService.retrieveAll(function (notices) {
			$scope.notices = notices;
		}, $log.error);
	})

	.controller('NoticeCtrl', function ($scope, $stateParams, $noticeService, $log) {
		$noticeService.retrieve($stateParams.noticeId, function (notice) {
			$scope.notice = notice
		}, $log.error);
	})

	.controller('DocumentsCtrl', function ($scope, $documentService, $log) {
		$documentService.retrieveAll(function (docs) {
			$scope.documents = docs;
		}, $log.error);
	})

	.controller('DocumentCtrl', function ($scope, $stateParams, $documentService, $log) {
		$documentService.retrieve($stateParams.documentId, function (doc) {
			$scope.document = doc;
		}, $log.error);
	})

	.controller('BookmarksCtrl', function ($scope, $bookmarkService, $log) {
		$bookmarkService.allDemo(function (bookmarks) {
			$scope.bookmarks = bookmarks;
		}, $log.error);
	})

	.controller('SettingsCtrl', function ($scope, $settingService, $log) {
		$settingService.allDemo(function (settings) {
			$scope.settings = settings;
		}, $log.error);
	});

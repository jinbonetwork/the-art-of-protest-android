angular.module('starter.controllers', ['starter.services'])

	.controller('AppCtrl', function ($scope, $ionicModal, $timeout, $http, $localStorage, $categoryService,
									 $ionicSideMenuDelegate, $log) {
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

		$scope.toggleLeftSideMenu = function () {
			$ionicSideMenuDelegate.toggleLeft();
		};
	})

	.controller('NoticesCtrl', function ($noticeService, $scope, $log) {
		$scope.refreshItems = function () {
			$noticeService.retrieveAll(function (notices) {
				$scope.notices = notices;
			}, $log.error);

			$scope.$broadcast('scroll.refreshComplete');
		};

		$scope.refreshItems();
	})

	.controller('NoticeCtrl', function ($scope, $stateParams, $noticeService, $log) {
		$noticeService.retrieve($stateParams.noticeId, function (notice) {
			$scope.notice = notice
		}, $log.error);
	})

	.controller('DocumentsCtrl', function ($scope, $documentService, $log) {
		$scope.refreshItems = function () {
			$documentService.retrieveAll(function (docs) {
				$scope.documents = docs;
			}, $log.error);

			$scope.$broadcast('scroll.refreshComplete');
		};

		$scope.refreshItems();
	})

	.controller('DocumentCtrl', function ($scope, $stateParams, $documentService, $bookmarkService, $cordovaToast,
										  $log) {
		var documentId = $stateParams.documentId;

		//TODO 라우팅 전에 수행되도록 변경
		$documentService.retrieve(documentId, function (doc) {
			$scope.document = doc;
			$scope.loaded = true;
		}, $log.error);

		$bookmarkService.exists(documentId, function (result, rev) {
			$scope.bookmarked = result;
			$scope.bookmarkRev = rev;
		}, $log.error);

		$scope.toggleBookmark = function () {
			var doc = $scope.document;

			if ($scope.bookmarked == true) {
				$bookmarkService.remove(
					doc.ID,
					$scope.bookmarkRev,
					function () {
						$scope.bookmarked = false;
						$scope.bookmarkRev = null;
						$scope.$apply();
						$cordovaToast.showShortTop('북마크가 해제되었습니다.');
					},
					$log.error)
			} else {
				$bookmarkService.add(
					doc.ID,
					doc.title,
					function (id, rev) {
						$scope.bookmarked = true;
						$scope.bookmarkRev = rev;
						$scope.$apply();
						$cordovaToast.showShortTop('북마크가 설정되었습니다.');
					},
					$log.error)
			}
		}
	})

	.controller('SearchCtrl', function ($scope, $ionicFilterBar, $documentService, $timeout, $log) {
		var filterBarInstance;

		$scope.items = [];

		$scope.showFilterBar = function () {
			filterBarInstance = $ionicFilterBar.show({
				items: $scope.items,
				update: function (filteredItems) {
					$scope.items = filteredItems;
					$scope.$apply();
				},
				filter: function (array, expression, comparator) {
					var that = this;
					// TODO workaround. global.keyword 참조
					global["keyword"] = expression;
					$documentService.query(expression, 20, function (result) {
						if (result.rows.length > 0) {
							that.update(_(result.rows).map(function (row) {
								return row.doc
							}));
						} else {
							that.update([{"title": "해당되는 문서가 없습니다."}])
						}
					}, function () {
						that.update([{"title": "찾는 중 오류가 발생했습니다."}])
					});

					return [{"title": "찾는 중입니다..."}]
				}
			});
		};

		$scope.showFilterBar()
	})

	.controller('BookmarksCtrl', function ($scope, $bookmarkService, $log) {
		$bookmarkService.retrieveAll(function (bookmarks) {
			$scope.bookmarks = bookmarks;
		}, $log.error);
	})

	.controller('SettingsCtrl', function ($scope, $settingService, $log) {
		$settingService.allDemo(function (settings) {
			$scope.settings = settings;
		}, $log.error);
	});

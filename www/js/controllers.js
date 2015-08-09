angular.module('starter.controllers', ['starter.services'])

	.controller('AppCtrl', function ($scope, $ionicModal, $timeout, $http, $localStorage, $categoryService,
									 $ionicSideMenuDelegate, $log) {
		//TODO localstorage 이용 버전 확인

		$categoryService.retrieveAll(function (categories) {
			$scope.categories = categories;
		}, $log.error);

		/*
		 * if given group is the selected group, deselect it
		 * else, select the given group
		 */
		$scope.toggleGroup = function (group) {
			if ($scope.isGroupShown(group)) {
				$scope.shownGroup = null;
			} else {
				$scope.shownGroup = group;
			}
		};

		$scope.isGroupShown = function (group) {
			return $scope.shownGroup === group;
		};

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

	.controller('PostsCtrl', function ($scope, $postService, $log) {
		$scope.refreshItems = function () {
			$postService.retrieveAll(function (posts) {
				$scope.posts = posts;
			}, $log.error);

			$scope.$broadcast('scroll.refreshComplete');
		};

		$scope.refreshItems();
	})

	.controller('PostCtrl', function ($scope, $stateParams, $postService, $bookmarkService, $cordovaToast,
									  $log) {
		var postId = $stateParams.postId;

		//TODO 라우팅 전에 수행되도록 변경
		$postService.retrieve(postId, function (post) {
			$scope.post = post;
			$scope.loaded = true;
		}, $log.error);

		$bookmarkService.exists(postId, function (result, rev) {
			$scope.bookmarked = result;
			$scope.bookmarkRev = rev;
		}, $log.error);

		$scope.toggleBookmark = function () {
			var post = $scope.post;

			if ($scope.bookmarked == true) {
				$bookmarkService.remove(
					post.ID,
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
					post.ID,
					post.title,
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

	.controller('SearchCtrl', function ($scope, $ionicFilterBar, $postService, $timeout, $log) {
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
					$postService.query(expression, 20, function (result) {
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

	.controller('BookmarksCtrl', function ($scope, $bookmarkService, $log, $cordovaToast) {
		$scope.data = {
			showDelete: false
		};

		$scope.onItemDelete = function (bookmark) {
			$bookmarkService.remove(
				bookmark._id,
				bookmark._rev,
				function () {
					$cordovaToast.showShortTop('북마크가 해제되었습니다.');
				},
				$log.error);

			$scope.bookmarks.splice($scope.bookmarks.indexOf(bookmark), 1);
		};

		$bookmarkService.retrieveAll(function (bookmarks) {
			$scope.bookmarks = bookmarks;
			$scope.$apply();
		}, $log.error);
	})

	.controller('SettingsCtrl', function ($scope, $settingService, $log) {
		$settingService.allDemo(function (settings) {
			$scope.settings = settings;
		}, $log.error);
	});

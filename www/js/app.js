angular.module('starter', ['ionic', 'ngCordova', 'jett.ionic.filter.bar', 'pouchdb', 'starter.controllers'])

	.run(function ($ionicPlatform, $ionicLoading, SyncService, $cordovaSplashscreen, $log, $rootScope, $ionicConfig) {
		// 안드로이드에서 헤더 바 가운데 정렬을 강제
		$ionicConfig.navBar.alignTitle('center');

		// 라우팅 오류 기록
		$rootScope.$on('$stateChangeError', $log.error);

		$ionicPlatform.ready(function () {
			// Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
			// for form inputs)
			if (window.cordova && window.cordova.plugins.Keyboard) {
				cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
				cordova.plugins.Keyboard.disableScroll(true);
			}

			//동기화 시작
			$log.info("동기화를 시작합니다.");
			$ionicLoading.show({
				templateUrl: "loading.html"
			});

			try {
				$cordovaSplashscreen.hide();
			} catch (err) {
				$log.error(err);
			}

			SyncService.sync()
				.then(function (result) {
					$log.info("동기화에 성공했습니다.");
					$ionicLoading.hide();
				})
				.catch(function (err) {
					$log.error("동기화에 실패했습니다.", err);
				});
			//동기화 끝

			if (window.StatusBar) {
				// org.apache.cordova.statusbar required
				StatusBar.styleDefault();
			}
		});
	})

	.config(function ($stateProvider, $urlRouterProvider) {
		$stateProvider

			.state('loading', {
				url: '/'
			})

			.state('app', {
				url: '/app',
				abstract: true,
				templateUrl: 'templates/menu.html',
				controller: 'AppCtrl',
				resolve: {
					'categories': function (CategoryService) {
						return CategoryService.list();
					},
					"notice": function (NoticeService) {
						return NoticeService.getAvailable();
					}
				}
			})

			.state('app.home', {
				url: '/home',
				views: {
					'menuContent': {
						templateUrl: 'templates/home.html',
						controller: 'HomeCtrl'
					}
				},
				resolve: {
					'contents': function (IntroService) {
						return IntroService.get();
					}
				}
			})

			.state('app.search', {
				url: '/search',
				views: {
					'menuContent': {
						templateUrl: 'templates/search.html',
						controller: 'SearchCtrl'
					}
				}
			})

			.state('app.notices', {
				url: '/notices',
				views: {
					'menuContent': {
						templateUrl: 'templates/notices.html',
						controller: 'NoticesCtrl'
					}
				},
				resolve: {
					"notices": function (NoticeService) {
						return NoticeService.list();
					}
				}
			})

			.state('app.notice', {
				url: '/notices/:noticeId',
				views: {
					'menuContent': {
						templateUrl: 'templates/notice.html',
						controller: 'NoticeCtrl'
					}
				},
				resolve: {
					"noticeId": function ($stateParams) {
						return $stateParams.noticeId;
					},
					"notice": function (NoticeService, noticeId) {
						return NoticeService.get(noticeId);
					}
				}
			})

			.state('app.posts', {
				url: '/posts',
				views: {
					'menuContent': {
						templateUrl: 'templates/posts.html',
						controller: 'PostsCtrl'
					}
				},
				resolve: {
					"posts": function (PostService) {
						return PostService.list();
					}
				}
			})

			.state('app.post', {
				url: '/posts/:postId',
				views: {
					'menuContent': {
						templateUrl: 'templates/post.html',
						controller: 'PostCtrl'
					}
				},
				resolve: {
					"postId": function ($stateParams) {
						return $stateParams.postId;
					},
					"post": function (postId, PostService) {
						return PostService.get(postId);
					},
					"initBookmarkRev": function (postId, BookmarkService) {
						return BookmarkService.exists(postId);
					}
				}
			})

			.state('app.bookmarks', {
				url: '/bookmarks',
				views: {
					'menuContent': {
						templateUrl: 'templates/bookmarks.html',
						controller: 'BookmarksCtrl'
					}
				},
				resolve: {
					"bookmarks": function (BookmarkService) {
						return BookmarkService.list();
					}
				}
			})

			.state('app.settings', {
				url: '/settings',
				views: {
					'menuContent': {
						templateUrl: 'templates/settings.html',
						controller: 'SettingsCtrl'
					}
				}
			})

			.state('app.about', {
				url: '/about',
				views: {
					'menuContent': {
						templateUrl: 'templates/about.html',
						controller: 'AboutCtrl'
					}
				}
			});
		// if none of the above states are matched, use this as the fallback
		$urlRouterProvider.otherwise('/app/home');
	});

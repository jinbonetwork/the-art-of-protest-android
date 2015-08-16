angular.module('starter', ['ionic', 'ngCordova', 'jett.ionic.filter.bar', 'pouchdb', 'uiRouterStyles', 'starter.controllers'])

	.run(function ($ionicPlatform, $cordovaSplashscreen, $cordovaToast) {
		$ionicPlatform.ready(function () {
			// Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
			// for form inputs)
			if (window.cordova && window.cordova.plugins.Keyboard) {
				cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
				cordova.plugins.Keyboard.disableScroll(true);

				$cordovaToast.showLongBottom('버전을 확인하고 있습니다.')
					.then(function (success) {
						setTimeout(function () {
							$cordovaSplashscreen.hide();
						}, 5000);
						// success
					}, function (error) {
						// error
					});

			}
			if (window.StatusBar) {
				// org.apache.cordova.statusbar required
				StatusBar.styleDefault();
			}
		});
	})

	.config(function ($stateProvider, $urlRouterProvider) {
		$stateProvider

			.state('app', {
				url: '/app',
				abstract: true,
				templateUrl: 'templates/menu.html',
				controller: 'AppCtrl'
			})

			.state('app.home', {
				url: '/home',
				views: {
					'menuContent': {
						templateUrl: 'templates/home.html'
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
				}
			})

			.state('app.notice', {
				url: '/notices/:noticeId',
				views: {
					'menuContent': {
						templateUrl: 'templates/notice.html',
						controller: 'NoticeCtrl'
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
				data: {
					css: 'css/post.css'
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
					"bookmarks": function ($bookmarkService, $q) {
						var deferred = $q.defer();

						$bookmarkService.retrieveAll(function (bookmarks) {
							deferred.resolve(bookmarks);
						}, function (err) {
							deferred.reject(err)
						});

						return deferred.promise;
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
			});
		// if none of the above states are matched, use this as the fallback
		$urlRouterProvider.otherwise('/app/home');
	});

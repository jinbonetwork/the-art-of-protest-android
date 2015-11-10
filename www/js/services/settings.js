angular.module('starter.services')

	.service('SettingService',
		/**
		 * @ngdoc service
		 * @name SettingService
		 * @param {PouchDB} pouchDB
		 * @param {$log} $log
		 * @param {$q} $q
		 */
		function (pouchDB, $log, $q) {
			var DB_NAME = "settings";
			var db = pouchDB(DB_NAME);

			this.list = function () {
				return db.allDocs({
					include_docs: true
				});
			};

			this.allDemo = function () {
				return $q(function (resolve, reject) {
					resolve([
						{title: 'Setting1', id: 1},
						{title: 'Setting2', id: 2},
						{title: 'Book3', id: 3},
						{title: 'Indie', id: 4},
						{title: 'Rap', id: 5},
						{title: 'Cowbell', id: 6}
					]);
				});
			};

			this.reset = function (notices) {
				db.destroy().then(function () {
					db = pouchDB(DB_NAME);
					return db.bulkDocs(notices);
				}).catch($log.error);
			}
		});

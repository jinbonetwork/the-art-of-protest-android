describe('RestService Unit Tests', function () {
	beforeEach(module('starter.services'));

	var RestService, ApiEndpoint, $httpBackend;

	beforeEach(inject(function (_RestService_, _ApiEndpoint_, _$httpBackend_) {
		RestService = _RestService_;
		ApiEndpoint = _ApiEndpoint_;
		$httpBackend = _$httpBackend_;
	}));

	it('should return an html page', function () {
		$httpBackend.whenGET(ApiEndpoint.home).respond("<html></html>");

		RestService.getHome().then(function (data) {
			expect(data.status).toBe(200);
			expect(data.data).toBe("<html></html>");
		});

		$httpBackend.flush();
	});

	it('should return a version object', function () {
		$httpBackend.whenGET(ApiEndpoint.version).respond({
			home_version: 1441370337,
			content_version: 1441561815
		});

		RestService.getVersion().then(function (data) {
			expect(data.data.home_version).toBe(1441370337);
			expect(data.data.content_version).toBe(1441561815);
		});

		$httpBackend.flush();
	});
});

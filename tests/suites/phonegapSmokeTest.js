import SuiteManager from '/framework/suiteManager';

describe("smoke test", function () {
    before(SuiteManager.initBefore.bind(SuiteManager));
    after(SuiteManager.initAfter.bind(SuiteManager));
	
	it(`should display the main page`, async () => {
		await driver
			.MainPage.isPage();
	});
});
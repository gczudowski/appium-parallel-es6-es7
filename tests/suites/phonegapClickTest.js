import SuiteManager from '/framework/suiteManager';

describe("main page", function () {
    before(SuiteManager.initBefore.bind(SuiteManager, __filename));
    after(SuiteManager.initAfter.bind(SuiteManager));
		
    it(`should make it possible to click the 'Device is ready' button and change its color to red`, async () => {
		await driver
			.MainPage.isPage();
		await driver
			.MainPage.clickButton();
		await driver
			.MainPage.isButtonColorRed();
    });
});
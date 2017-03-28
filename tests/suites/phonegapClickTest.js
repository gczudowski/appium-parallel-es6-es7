import SuiteManager from '/framework/suiteManager';
import Framework from '/framework/framework';

describe("main page", SuiteManager.executeTestSuite(() => {
    it(`should make it possible to click the 'Device is ready' button and change its color to red`, async () => {
		await Framework
			.MainPage.isPage();
		await Framework
			.MainPage.clickButton();
		await Framework
			.MainPage.isButtonColorRed();
    });
}));
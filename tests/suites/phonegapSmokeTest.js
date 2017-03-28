import SuiteManager from '/framework/suiteManager';
import Framework from '/framework/framework';

describe("smoke test", SuiteManager.executeTestSuite(() => {
	it(`should display the main page`, async () => {
		await Framework
			.MainPage.isPage();
	});
}));
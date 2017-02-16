import SuiteManager from '/framework/suiteManager';

describe("main page", function () {
	before(SuiteManager.initBefore.bind(SuiteManager));
    after(SuiteManager.initAfter.bind(SuiteManager));
		
    it(`should make it possible to click the 'Device is ready' button and change its color to red`, async () => {
		await driver.elementById('button')
			.click()
			.sleep(1000)
			.click()
			.sleep(1000)
			.click()
			.sleep(1000)
			.click()
			.sleep(1000)
			.click()
			.sleep(1000)
			.click()
			.sleep(1000)
			.click()
			.sleep(1000);
			
		expect(driver.elementByClassName('red').isDisplayed()).to.eventually.equal(true);
    });
});
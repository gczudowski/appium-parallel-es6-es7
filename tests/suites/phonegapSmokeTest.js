import SuiteManager from '/framework/suiteManager';

describe("smoke test", function () {
    before(SuiteManager.initBefore.bind(SuiteManager));
    after(SuiteManager.initAfter.bind(SuiteManager));
	
	it(`should have 'Hello World' in the browser title`, async () => {
		expect(driver.title()).to.eventually.equal('Hello World');
	});
	
	it(`should display home screen`, async () => {
		expect(driver.elementByClassName('app').isDisplayed()).to.eventually.equal(true);
		expect(driver.elementByClassName('blink').isDisplayed()).to.eventually.equal(true);
	});
	
	it(`should display 'DEVICE IS READY' message`, async () => {
		expect(driver.elementByClassName('received').isDisplayed()).to.eventually.equal(true);
	});
});
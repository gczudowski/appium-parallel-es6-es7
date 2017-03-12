import SuiteManager from '/framework/suiteManager';

describe("screenshot test", function () {
    before(SuiteManager.initBefore.bind(SuiteManager, __filename));
    after(SuiteManager.initAfter.bind(SuiteManager));

    it(`should take screenshot of the main page`, async () => {
        await driver
            .screenshot('mainPageScreenshot')
    });
});
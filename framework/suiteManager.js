import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import webDriverInstance from 'wd';
import screenshotComparer from 'wd-screenshot';
import CONFIG from './configGenerator';

const SuiteManager = class {
	constructor () {
        this.beginDateTime = process.env.DATETIME;
        this.deviceId = process.env.DEVICE;
        this.moduleName = null;

		this.serverConfig = {
			host: '127.0.0.1',
			port: process.env.PORT
		};

		this.capsConfig = {
			udid: this.deviceId,
			deviceName: '*',
			platformName: process.env.PLATFORM,
			app: process.env.PLATFORM === 'Android' ? CONFIG.APK_PATH : CONFIG.APP_PATH,
			// noReset: true,
			fullReset: true,
			automationName: process.env.PLATFORM === 'Android' ? "Appium" : "XCUITest",
            xcodeConfigFile: CONFIG.XCODE_CONFIG,
            nativeWebScreenshot: true,
			wdaLocalPort: +process.env.PORT + 1500
		};
	}
	
	async initBefore (filename) {
		this.moduleName = filename.split('/').pop().split('.').shift();

		return new Promise(async (resolve) => {
            this.exposeChai(webDriverInstance);
			this.enhanceDriver(webDriverInstance);

            const driver = webDriverInstance.promiseChainRemote(this.serverConfig);
			await driver.init(this.capsConfig);
			await driver.setImplicitWaitTimeout(CONFIG.MAXIMUM_WAIT_TIMEOUT_MS);
			const contexts = await driver.contexts();
			await driver.context(contexts[1]);

			this.exposeDriver(driver);

			resolve();
		});
	}

	exposeChai(webDriverInstance) {
		chai.use(chaiAsPromised);
        chai.should();
        chaiAsPromised.transferPromiseness = webDriverInstance.transferPromiseness;
	}

	enhanceDriver(webDriverInstance) {
        webDriverInstance.addPromiseChainMethod(
            'waitForClass',
			function(selector, timeout = CONFIG.MAXIMUM_WAIT_TIMEOUT_MS) {
                return this
                    .waitForElementByClassName(selector, timeout);
            }
        );
	}
	
	exposeDriver(driver) {
		global.driver = driver;
		global.driver.screenshot = async (path) => {
            await driver.saveScreenshot(`reports/${this.beginDateTime}/${this.deviceId}/${this.moduleName}-${path}.png`);
		};

        const comparer = screenshotComparer({
        	Q: driver.Q,
			tolerance: CONFIG.SCREENSHOT_TOLERANCE,
            saveDiffImagePath: 'screenshot-reference',
            highlightColor: 'magenta',
            highlightStyle: 'XOR'
        });

        global.driver.compare = async (path) => {
			return await comparer.compareScreenshot(
				`screenshot-reference/${this.deviceId}/${this.moduleName}-${path}.png`,
				`reports/${this.beginDateTime}/${this.deviceId}/${this.moduleName}-${path}.png`
            );
        };
	}
	
	async initAfter () {
		return new Promise(async (resolve) => {
			await driver.quit();
			resolve();
		});
	}

    executeTestSuite (its) {
		return function() {
            before(this.initBefore.bind(this, __filename));
            its();
            after(this.initAfter.bind(this));
		}.bind(this);
	}
};

export default new SuiteManager();
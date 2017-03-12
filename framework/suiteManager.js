import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import webDriverInstance from 'wd';
import CONFIG from './configGenerator';
import shelljs from 'shelljs';

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
			noReset: true,
			fullReset: false,
			automationName: process.env.PLATFORM === 'Android' ? "Appium" : "XCUITest"
		};
	}
	
	async initBefore (filename) {
		this.moduleName = filename.split('/').pop().split('.').shift();

		return new Promise(async (resolve) => {
            this.exposeChai(webDriverInstance);

            const driver = webDriverInstance.promiseChainRemote(this.serverConfig);
			await driver.init(this.capsConfig);
			await driver.setImplicitWaitTimeout(10000);
			const contexts = await driver.contexts();
			await driver.context(contexts[1]);

			this.exposeDriver(driver);
            this.enhanceDriverWithUtils();

			resolve();
		});
	}

    enhanceDriverWithUtils () {
		const path = 'tests/utils';

		shelljs.ls(path).forEach(async (element) => {
            const el = element.replace('.js', '');
            global.driver[el] = require(`./../${path}/${el}`).default;
		});
	}
	
	exposeChai(webDriverInstance) {
		chai.use(chaiAsPromised);
        chai.should();
        chaiAsPromised.transferPromiseness = webDriverInstance.transferPromiseness;
	}
	
	exposeDriver(driver) {
		global.driver = driver;
		global.driver.screenshot = async (path) => {
            const contexts = await driver.contexts();
            await driver.context(contexts[0]);
            await driver.saveScreenshot(`reports/${this.beginDateTime}/${this.deviceId}/${this.moduleName}-${path}.png`);
            await driver.context(contexts[1]);
		}
	}
	
	async initAfter () {
		return new Promise(async (resolve) => {
			await driver.quit();
			resolve();
		});
	}
};

export default new SuiteManager();
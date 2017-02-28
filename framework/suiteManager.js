import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import webDriverInstance from 'wd';
import CONFIG from './configGenerator';
import shelljs from 'shelljs';

const SuiteManager = class {
	constructor () {
		this.serverConfig = {
			host: '127.0.0.1',
			port: process.env.PORT
		};
		this.capsConfig = {
			udid: process.env.DEVICE,
			deviceName: '*',
			platformName: 'Android',
			app: CONFIG.APK_PATH
		};
	}
	
	async initBefore () {
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
            await driver.saveScreenshot(`reports/${path}.png`);
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
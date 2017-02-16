import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import webDriverInstance from 'wd';
import CONFIG from './configGenerator';

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
			const driver = webDriverInstance.promiseChainRemote(this.serverConfig);
			await driver.init(this.capsConfig).setImplicitWaitTimeout(10000);
			const contexts = await driver.contexts();
			await driver.context(contexts[1]);
			
			this.exposeChai();
			this.exposeDriver(driver);

			resolve();
		});
	}
	
	exposeChai() {
		chai.use(chaiAsPromised);
		global.expect = chai.expect;
	}
	
	exposeDriver(driver) {
		global.driver = driver;
	}
	
	async initAfter () {
		return new Promise(async (resolve) => {
			await driver.quit();
			resolve();
		});
	}
};

export default new SuiteManager();
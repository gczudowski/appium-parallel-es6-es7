import CommonUtils from './commonUtils';
import CONFIG from '/config/config';

const ConfigGenerator = class {
	constructor () {
		this.config = CONFIG;
		this.config.APK_PATH = `${CommonUtils.getMainPath()}/apk/${this.config.APK_PATH}`;
		this.config.APP_PATH = `${CommonUtils.getMainPath()}/apk/${this.config.APP_PATH}`;

		return this.config;
	}
};

export default new ConfigGenerator();
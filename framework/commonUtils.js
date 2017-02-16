const CommonUtils = class {
	getMainPath () {
		return __dirname.replace(/\\framework/, '').replace(/\/framework/, '');
	}
};

export default new CommonUtils();
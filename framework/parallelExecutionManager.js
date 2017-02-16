import shelljs from 'shelljs';
import request from 'request';
import CommonUtils from './commonUtils';
import CONFIG from './configGenerator';

const ParallelExecutionManager = class {
	init () {
		this.resetAppium();
		this.startTestsOnAllDevices();
	}
	
	resetAppium () {
		shelljs.exec(`forever stopall`, {silent:true});
	}
	
    getDevicesList () {
		shelljs.exec(`adb devices`, {silent:true});
		
        let response = shelljs.exec(`adb devices`, {silent:true});
        response = response.stdout.replace('List of devices attached', '');
        response = response.replace(/(\r\n|\n|\r|\t)/gm, '');
        response = response.replace(/\s+/g, '');
        response = response.split('device');
		response.pop();
		
		console.log(`Devices connected: ${response.length}`);
		
        return response;
    }
	
    runAppium (port) {
        shelljs.exec(`forever start --sourceDir "${CommonUtils.getMainPath()}" /node_modules/appium/build/lib/main.js --port ${port} -bp ${port+100} --chromedriver-port ${port+200}`, {silent:true});
    }
	
	startTestsOnAllDevices () {
		const devicesList = this.getDevicesList();
		
		console.log('Please wait a moment, initiating tests on all connected devices...')
		
		for (let i = devicesList.length; i--;) {
			const port = CONFIG.PORT_MIN + i;
			const device = devicesList[i];

			this.runAppium(port);
			this.runTest(device, port);
		}
	}
	
	runTest (deviceId, port) {	
		request(`http://127.0.0.1:${port}`, (error, response, body) => {
			if (!error && response.statusCode == 404) {
					shelljs.exec(`env DEVICE=${deviceId} PORT=${port} mocha --require babel-polyfill --compilers js:babel-register --timeout 300000 tests`, {silent:false}, () => {
						console.log(`Test (device: ${deviceId}, port: ${port}) has just finished`);
					});
			} else {
				setTimeout((() => {
					this.runTest.call(this, deviceId, port);
				}).bind(this), 3000)
			}
		});
    }
};

export default new ParallelExecutionManager();
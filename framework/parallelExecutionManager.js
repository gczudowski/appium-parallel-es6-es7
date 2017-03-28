import shelljs from 'shelljs';
import request from 'request';
import CommonUtils from './commonUtils';
import CONFIG from './configGenerator';
import moment from 'moment';

const ParallelExecutionManager = class {
    constructor () {
        this.beginDateTime = moment().format('YYYY-MM-DD_HH-mm');
        this.activeDevicesList = {};
    }

	init () {
		this.resetAppium();
		this.prepareFolders();
		this.startTestsOnAllDevices();
	}
	
	resetAppium () {
		shelljs.exec(`forever stopall`, {silent:true});
	}

	prepareFolders () {
        shelljs.exec(`mkdir reports`, {silent:true});
        shelljs.exec(`mkdir reports/${this.beginDateTime}`, {silent:true});
        shelljs.exec(`mkdir logs`, {silent:true});
    }

	startTestsOnAllDevices () {
        console.log('Please wait a moment, initiating tests on all connected devices...');

        this.startTestsOnAndroidDevices();
        this.startTestsOnIOSDevices();
	}

    startTestsOnAndroidDevices () {
        const devicesIdList = this.getAndroidDevicesList();

        for (let i = devicesIdList.length; i--;) {
            const port = CONFIG.PORT_MIN + i;
            const deviceId = devicesIdList[i];

            shelljs.exec(`mkdir reports/${this.beginDateTime}/${deviceId}`, {silent:true});

            this.runAppium(port, deviceId);
            this.runTest(deviceId, port, 'Android');
        }
    }

    getAndroidDevicesList () {
		shelljs.exec(`adb devices`, {silent:true});
		
        let response = shelljs.exec(`adb devices`, {silent:true});

        response = response.stdout.replace('List of devices attached', '');
        response = response.replace(/(\r\n|\n|\r|\t)/gm, '');
        response = response.replace(/\s+/g, '');
        response = response.split('device');
		response.pop();
		
		console.log(`Android devices connected: ${response.length}`);
		
        return response;
    }
	
    runAppium (port, deviceId) {
        shelljs.exec(`forever start -o logs/${this.beginDateTime}-${port} -a --sourceDir "${CommonUtils.getMainPath()}" --tmp "${CommonUtils.getMainPath()}/reports/${this.beginDateTime}/${deviceId}" --uid "${this.beginDateTime}-${port}" /node_modules/appium/build/lib/main.js --port ${port} -bp ${port+100} --chromedriver-port ${port+200} --webkit-debug-proxy-port ${port+300}`, {silent:true});
    }

	runTest (deviceId, port, platform, resolve) {
        this.activeDevicesList[deviceId] = deviceId;

		request(`http://127.0.0.1:${port}`, (error, response, body) => {
			if (!error && response.statusCode === 404) {
                shelljs.exec(`env DEVICE=${deviceId} PORT=${port} PLATFORM=${platform} DATETIME=${this.beginDateTime} mocha -R good-mocha-html-reporter -p ./reports/${this.beginDateTime}/${deviceId}.html --require babel-polyfill --compilers js:babel-core/register --timeout 300000 tests/tests.js`, {silent:false}, () => {
                    console.log(`Test (device: ${deviceId}, port: ${port}) has just finished`);
                    shelljs.exec(`forever stop ${this.beginDateTime}-${port}`, {silent:true});

                    delete this.activeDevicesList[deviceId];
                    console.log('devices left: ', Object.keys(this.activeDevicesList).length);
                    if (Object.keys(this.activeDevicesList).length === 0) {
                        console.log('killing...');
                        process.exit(0);
                    }

                    if (resolve) {
                        resolve();
                    }
                });
			} else {
				setTimeout((() => {
					this.runTest.call(this, deviceId, port, platform, resolve);
				}).bind(this), 3000)
			}
		});
    }

    runTestSync (deviceId, port, platform) {
        return new Promise((resolve) => {
            this.runTest(deviceId, port, platform, resolve);
        });
    }

    startTestsOnIOSDevices () {
		const devicesIdList = this.getIOSDevicesList();

        for (let i = devicesIdList.length; i--;) {
            const port = CONFIG.PORT_MIN + 1000 + i;
            const deviceId = devicesIdList[i];

            shelljs.exec(`mkdir reports/${this.beginDateTime}/${deviceId}`, {silent:true});
            shelljs.exec(`ios_webkit_debug_proxy -c ${deviceId}:${port+300} -d`, {silent: true, async: true});

            this.runAppium(port, deviceId);
            this.runTest(deviceId, port, 'iOS');
        }
	}

    getIOSDevicesList () {
        let response = shelljs.exec(`instruments -s devices`, {silent:true});
        let devices = [];

        response = response.stdout.replace('Known Devices:', '');
        response = response.split('\n');

        for (let i = response.length; i--;) {
            if (response[i].indexOf('Simulator') === -1 && response[i].length !== 0) {
                let parsedResponse = response[i].substring(response[i].indexOf('[') + 1);
                parsedResponse = parsedResponse.substring(0, parsedResponse.indexOf(']'));
                if (parsedResponse.indexOf('-') === -1) {
                    devices.push(parsedResponse);
                }
            }
        }

        console.log('iOS devices connected: ', devices.length);

        return devices;
    }
};

export default new ParallelExecutionManager();
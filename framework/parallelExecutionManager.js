import shelljs from 'shelljs';
import request from 'request';
import CommonUtils from './commonUtils';
import CONFIG from './configGenerator';
import moment from 'moment';

const ParallelExecutionManager = class {
    constructor () {
        this.beginDateTime = moment().format('YYYY-MM-DD_HH-mm');
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
        this.startTestsOnIOSSimulators();
	}

    startTestsOnAndroidDevices () {
        const devicesList = this.getAndroidDevicesList();

        for (let i = devicesList.length; i--;) {
            const port = CONFIG.PORT_MIN + i;
            const device = devicesList[i];

            shelljs.exec(`mkdir reports/${this.beginDateTime}/${device}`, {silent:true});

            this.runAppium(port);
            this.runTest(device, port, 'Android');
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
	
    runAppium (port) {
        shelljs.exec(`forever start -o logs/${this.beginDateTime}-${port} -a --sourceDir "${CommonUtils.getMainPath()}" --uid "${this.beginDateTime}-${port}" /node_modules/appium/build/lib/main.js --port ${port} -bp ${port+100} --chromedriver-port ${port+200}`, {silent:true});
    }

	runTest (deviceId, port, platform, resolve) {
		request(`http://127.0.0.1:${port}`, (error, response, body) => {
			if (!error && response.statusCode === 404) {
                shelljs.exec(`env DEVICE=${deviceId} PORT=${port} PLATFORM=${platform} DATETIME=${this.beginDateTime} mocha -R good-mocha-html-reporter -p ./reports/${this.beginDateTime}/${deviceId}.html --require babel-polyfill --compilers js:babel-core/register --timeout 300000 tests/tests.js`, {silent:false}, () => {
                    console.log(`Test (device: ${deviceId}, port: ${port}) has just finished`);
                    shelljs.exec(`forever stop ${this.beginDateTime}-${port}`);
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

    async startTestsOnIOSSimulators () {
        const iOSSimulatorsList = this.getIOSSimulatorsList();

        for (let i = iOSSimulatorsList.length; i--;) {
            const port = CONFIG.PORT_MIN + i + 50;
            const device = iOSSimulatorsList[i];

            shelljs.mkdir(`reports/${this.beginDateTime}/${device}`);

            this.runAppium(port);
            await this.runTestSync(device, port, 'iOS');
        }
    }

    getIOSSimulatorsList () {
        let response = shelljs.exec(`instruments -s devices`, {silent:true});
        let devices = [];

        response = response.stdout.replace('Known Devices:', '');
        response = response.split('\n');

        for (let i = 0; devices.length < 4; i++) {
            if (response[i].indexOf('Simulator') !== -1 && response[i].length !== 0
                && response[i].indexOf('iPhone') !== -1 && response[i].indexOf('iPhone 4') === -1) {
                let parsedResponse = response[i].substring(response[i].indexOf('[') + 1);
                parsedResponse = parsedResponse.substring(0, parsedResponse.indexOf(']'));
                devices.push(parsedResponse);
            }
        }

        console.log('iPhone simulators available: ', devices.length);

        return devices;
    }
};

export default new ParallelExecutionManager();
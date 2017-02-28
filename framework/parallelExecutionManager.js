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

	startTestsOnAllDevices () {
        console.log('Please wait a moment, initiating tests on all connected devices...');

        this.startTestsOnAndroidDevices();
        // this.startTestsOnIOSDevices();
	}

    startTestsOnAndroidDevices () {
        const devicesList = this.getAndroidDevicesList();

        for (let i = devicesList.length; i--;) {
            const port = CONFIG.PORT_MIN + i;
            const device = devicesList[i];

            this.runAppium(port);
            this.runTest(device, port);
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
        shelljs.exec(`forever start --sourceDir "${CommonUtils.getMainPath()}" /node_modules/appium/build/lib/main.js --port ${port} -bp ${port+100} --chromedriver-port ${port+200}`, {silent:true});
    }
	
	runTest (deviceId, port) {	
		request(`http://127.0.0.1:${port}`, (error, response, body) => {
			if (!error && response.statusCode == 404) {
					shelljs.exec(`env DEVICE=${deviceId} PORT=${port} mocha -R good-mocha-html-reporter -p ./reports/${deviceId}.html --require babel-polyfill --compilers js:babel-core/register --timeout 300000 tests/tests.js`, {silent:false}, () => {
						console.log(`Test (device: ${deviceId}, port: ${port}) has just finished`);
					});
			} else {
				setTimeout((() => {
					this.runTest.call(this, deviceId, port);
				}).bind(this), 3000)
			}
		});
    }

    startTestsOnIOSDevices () {
		const devices = this.getIOSDevicesList();
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
                devices.push(parsedResponse);
            }
        }

        console.log('iOS devices connected: ', devices.length);

        return devices;
    }
};

export default new ParallelExecutionManager();
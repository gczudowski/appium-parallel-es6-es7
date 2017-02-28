const LoginPage = class {
    isPage() {
        return driver
            .waitForElementByClassName('app').should.eventually.exist
            .waitForElementByClassName('blink').should.eventually.exist
            .waitForElementByClassName('received').should.eventually.exist
            .title().should.eventually.equal('Hello World');
    }

    isButtonColorRed() {
        return driver
            .waitForElementByClassName('red').should.eventually.exist;
    }

    clickButton() {
        return driver
            .elementById('button')
            .click()
            .sleep(1000)
            .click()
            .sleep(1000)
            .click()
            .sleep(1000)
            .click()
            .sleep(1000)
            .click()
            .sleep(1000)
            .click()
            .sleep(1000)
            .click()
            .sleep(1000);
    }
};

export default new LoginPage();
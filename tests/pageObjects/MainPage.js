const LoginPage = class {
    isPage() {
        return driver
            .waitForClass('app').should.eventually.exist
            .waitForClass('blink').should.eventually.exist
            .waitForClass('received').should.eventually.exist
            .title().should.eventually.equal('Hello World');
    }

    isButtonColorRed() {
        return driver
            .waitForClass('red').should.eventually.exist;
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
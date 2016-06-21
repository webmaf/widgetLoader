describe('WidgetLogging', function () {

    beforeEach(function () {
        jasmine.Ajax.install();
    });

    afterEach(function () {
        jasmine.Ajax.uninstall();
    });

    describe('- configuration -', function () {
        var widgetLogging = new WidgetLogging({
                maxLoggings: 404,
                logLevelProfile: 'error',
                logResponseLimit: 4044,
                logIntervalUse: 40400,
                logIntervalLimit: 404404

            });

        afterEach(function () {
            widgetLogging.stopInterval();
        });

        it('config has overwrite vars', function () {
            var config = widgetLogging.config;

            expect(config.maxLoggings).toBe(404);
            expect(config.logLevelProfile).toBe('error');
            expect(config.logResponseLimit).toBe(4044);
            expect(config.logIntervalUse).toBe(40400);
            expect(config.logIntervalMin).toBe(40400);
            expect(config.logIntervalLimit).toBe(404404);
            expect(config.logLevelRange).toEqual(['trace', 'debug', 'info', 'warn', 'error']);
        });
    });

    describe('- submit Logging -', function () {
        var widgetLogging = new WidgetLogging({
                logIntervalUse: 30
            }),
            json = [
                {a: 5, b: 5, c: 5},
                {a: 5, b: 5, c: 5},
                {a: 5, b: 5, c: 5}
            ];

        afterEach(function () {
            widgetLogging.stopInterval();
        });

        xit('ajax repsonse should be right', function () {
            jasmine.Ajax.stubRequest('/rest/widgets/log').andReturn({
                "responseText": 'immediate response'
            });

            widgetLogging.sendLogList(JSON.stringify(json));
            expect(3).toBe(0);
        });
    });
});
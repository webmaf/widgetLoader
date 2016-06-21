describe('WidgetLoader', function () {
    beforeEach(function () {
        window.tuiWidgetLoader = {
            log: function () {}
        };
    });

    describe('- configuration - before', function () {
        var wl = new WidgetLoader({
            environment: environment.configOverrides.environment,
            backendUrl: environment.backendUrl,
            widgetLoaderResourceUrl: environment.widgetLoaderResourceUrl,
            widgetResourceUrl: environment.widgetResourceUrl,
            //widgetLogging: widgetLogging,
            version: '1.0.0'
        });

        it('config has overwrite vars', function () {
            var config = wl.config;

            expect(config.widgetName).toBe('widgetLoader');
            expect(config.widgetSelector).toBe('tui-widget');
            expect(config.backendUrl).toBe('//localhost/');
            expect(config.widgetResourceUrl).toBe('//ms-dev-devnode01.tui-interactive.com/ms/fe/');
            expect(config.restWidgetRequirements).toBe('rest/widgets/requirements?widgetNames=');
        });
    });

    describe('- configuration - after', function () {
        var wl = new WidgetLoader({
            widgetName: 'widgetLoaderRename',
            widgetSelector: 'widshit',
            backendUrl: 'http://localHORST/',
            widgetResourceUrl: 'http://localHORST/live/',
            restWidgetRequirements: '/local/widgets/moep?widgetNames='
        });

        it('config has overwrite vars', function () {
            var config = wl.config;

            expect(config.widgetName).toBe('widgetLoaderRename');
            expect(config.widgetSelector).toBe('widshit');
            expect(config.backendUrl).toBe('http://localHORST/');
            expect(config.widgetResourceUrl).toBe('http://localHORST/live/');
            expect(config.restWidgetRequirements).toBe('/local/widgets/moep?widgetNames=');
        });
    });

    describe('- convert version string to number', function () {
        var wl = new WidgetLoader({
            restWidgetRequirements: '/local/widgets/moep?widgetNames='
        });

        it('should be a length of 10', function () {
            var length = 10; // 1.000.000.000, 1mio

            expect(wl.getVersionNumber('1.2.3.4.5.6').toString().length).toBe(length);
            expect(wl.getVersionNumber('1.2.3.4.5').toString().length).toBe(length);
            expect(wl.getVersionNumber('1.2.3.4').toString().length).toBe(length);
            expect(wl.getVersionNumber('1.2.3').toString().length).toBe(length);
            expect(wl.getVersionNumber('1.2').toString().length).toBe(length);
            expect(wl.getVersionNumber('1').toString().length).toBe(length);
        });

        it('is correct', function () {
            expect(wl.getVersionNumber('a')).toBe(0);
            expect(wl.getVersionNumber('a.3')).toBe(3000000);
            expect(wl.getVersionNumber('9')).toBe(9000000000);
            expect(wl.getVersionNumber('2.0')).toBe(2000000000);
            expect(wl.getVersionNumber('0.8.3')).toBe(8003000);
            expect(wl.getVersionNumber('1.8.3')).toBe(1008003000);
            expect(wl.getVersionNumber('2.4.0')).toBe(2004000000);
            expect(wl.getVersionNumber('1.3.0-rc.5')).toBe(1003000005);
            expect(wl.getVersionNumber('1.4.0-beta.0')).toBe(1004000000);
        });
    });

    describe('- the current version -', function () {
        var wl = new WidgetLoader({
            restWidgetRequirements: '/local/widgets/moep?widgetNames='
        });

        it('is in range', function () {
            expect(wl.versionInRange('2.0', '1.9.3', '2.1')).toBeTruthy();
            expect(wl.versionInRange('2.0.0.0.3', '1.9.3', '2.0')).toBeTruthy();
        });

        it('is out of range', function () {
            expect(wl.versionInRange('2.0.0.1.3', '1.9.3', '2.0')).toBeFalsy();
            expect(wl.versionInRange('2', '2.9.3', '2.0')).toBeFalsy();
        });
    });

    describe('- library -', function () {
        var wl = new WidgetLoader({
                restWidgetRequirements: '/local/widgets/moep?widgetNames=',
                widgetLogging: {
                    log: function () {}
                }
            }),
            libraryCheckName = {},
            library = {
                "libObj": "angular",
                "versionObj": "angular.version.full",
                "versionMin": "1.1.0",
                "versionMax": "2.4",
                "fileName": "angular.min.js"
            };

        it('exist and version is in range', function () {
            libraryCheckName.angular = {
                libName: function () {
                    return true
                },
                version: function () {
                    return '1.5.0';
                }
            };
            expect(wl.existingUsableLibrary(library, libraryCheckName)).toBe(1);
        });

        it('exist and version is out of range', function () {
            libraryCheckName.angular = {
                libName: function () {
                    return true
                },
                version: function () {
                    return '3.5.0';
                }
            };
            expect(wl.existingUsableLibrary(library, libraryCheckName)).toBe(0);
        });

        it('not found', function () {
            libraryCheckName.angular = {
                libName: function () {
                    return false
                },
                version: function () {
                    return '1.5.0';
                }
            };
            expect(wl.existingUsableLibrary(library, libraryCheckName)).toBe(2);
        });
    });

    describe('- fetchWidgets -', function () {
        var wl = new WidgetLoader({
                restWidgetRequirements: '/local/widgets/moep?widgetNames='
            }),
            div;

        div = document.createElement('div');
        div.setAttribute('data-widget', 'Widget_1');
        div.setAttribute('class', 'tui-widget');
        document.body.appendChild(div);

        div = document.createElement('div');
        div.setAttribute('data-widget', 'Widget_2');
        div.setAttribute('class', 'tui-widget');
        document.body.appendChild(div);

        it('return the right array', function () {
            expect(wl.fetchWidgets(document)).toEqual(['Widget_1', 'Widget_2']);
        });
    });

    describe('- widget is enabled -', function () {
        var wl = new WidgetLoader({
                restWidgetRequirements: '/local/widgets/moep?widgetNames='
            }),
            widgetList = [
                {
                    "name": "widget-bluebox",
                    "libraries": [{
                        "libObj": "angular",
                        "versionMin": "1.1.0",
                        "versionMax": "2.4",
                        "fileName": "angular.min.js",
                        "appName": "angular",
                        "download": true
                    }],
                    "enable": true
                },
                {
                    "name": "supergreen",
                    "libraries": [{
                        "libObj": "angular",
                        "versionMin": "1.11.3",
                        "versionMax": "2.1.4",
                        "fileName": "angular.min.js",
                        "appName": "angular",
                        "download": true
                    }],
                    "enable": true
                },
                {
                    "name": "heroes",
                    "libraries": [
                        {
                            "libObj": "spiderman",
                            "versionMin": "1.11.3",
                            "versionMax": "2.1.4",
                            "fileName": "spiderman.lol.js",
                            "appName": "spiderman"
                        },
                        {
                            "libObj": "joker",
                            "min": "1.2",
                            "max": "1.4",
                            "fileName": "joker.lol.js",
                            "appName": "joker",
                            "download": true
                        },
                        {
                            "libObj": "batman",
                            "min": "1.2",
                            "max": "1.4",
                            "fileName": "batman.min.js",
                            "appName": "batman",
                            "download": true
                        }
                    ],
                    "enable": true
                }
            ];

        it('return the right array', function () {
            var result = wl.checkWidgetIsEnabled(widgetList);

            expect(result.name).toEqual(['angular', 'joker', 'batman']);
            expect(result.library).toEqual(['angular.min.js', 'joker.lol.js', 'batman.min.js']);
            expect(result.path).toEqual(['widget-bluebox/angular.min.js', 'heroes/joker.lol.js', 'heroes/batman.min.js']);
        });
    });
});

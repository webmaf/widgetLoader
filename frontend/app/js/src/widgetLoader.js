/**
 *
 * class WidgetLoader
 * @param settings
 * @constructor
 */
var WidgetLoader = function (settings) {
    var config = {
            widgetName: 'widgetLoader',
            widgetSelector: 'tui-widget',
            widgetSelectorDone: 'done',
            restWidgetRequirements: 'rest/widgets/requirements?widgetNames=',
            autoRun: false
        },
        inProgress = false,
        initialize = false,
        initWidget = '',
        libraryCheckName = {
            jquery: {
                libName: function () {
                    return (typeof window.jQuery !== 'undefined');
                },
                version: function () {
                    return window.jQuery.fn.jquery;
                }
            },
            jqueryui: {
                libName: function () {
                    return (typeof window.jQuery !== 'undefined' && typeof window.jQuery.ui !== 'undefined');
                },
                version: function () {
                    return window.jQuery.ui.version;
                }
            },
            angular: {
                libName: function () {
                    return (typeof window.angular !== 'undefined');
                },
                version: function () {
                    return window.angular.version.full;
                }
            },
            prototype: {
                libName: function () {
                    return (typeof window.Prototype !== 'undefined');
                },
                version: function () {
                    return window.Prototype.Version;
                }
            }
        },
        widgetList = [],
        widgetCompleteList = [],
        widgetNodes = {},
        widgetAllow = [],
        widgetLoaderCSS = false;

    var widgetRegistry = [];

    window.tuiWidgetLoader.loadedWidgets = [];

    /*
     *   S E T T I N G S
     *   -----------------------------------------------------------------------------------------
     */

    /**
     * @param src {string}
     * @param callback {function}
     * @param libName {string}
     */
    function addLibraryScript(src, callback, libName) {
        var script = document.createElement('script');

        script.setAttribute('src', src);
        script.onerror = function (err) {
            config.widgetLogging.log(config.widgetName, 'error', 'cannot download library ' + err.target.src);
            callback(libName);
        };

        if (script.readyState) { //IE
            script.onreadystatechange = function () {
                if (script.readyState == 'loaded' || script.readyState == 'complete') {
                    script.onreadystatechange = null;
                    callback(null);
                }
            };
        } else { //Others
            script.onload = function () {
                callback(null);
            };
        }

        document.body.appendChild(script);
    }

    /**
     * @param src {string}
     */
    function addWidgetScript(src) {
        var scripts = document.querySelectorAll('script[src]'),
            existingScript = false,
            s = document.createElement('script');

        for (var i = 0, l = scripts.length; i < l; i++) {
            if (scripts[i].src.indexOf(src) !== -1) {
                existingScript = true;
                break;
            }
        }

        if (!existingScript) {
            s.setAttribute('src', src);
            document.body.appendChild(s);
        }
    }

    /**
     * @param src {string}
     */
    function addLink(src) {
        var s = document.createElement('link');
        s.setAttribute('href', src);
        s.setAttribute('rel', 'stylesheet');
        document.head.appendChild(s);
    }

    /*
     *   W I D G E T
     *   -----------------------------------------------------------------------------------------
     */
    /**
     * @param element {object}
     * @param name
     */
    function fetchRefreshWidgets(element, name) {
        var widgets = element.getElementsByClassName(config.widgetSelector);

        widgetNodes = [];

        for (var i = 0, l = widgets.length; i < l; i++) {
            if (typeof widgets[i].dataset.disable === 'undefined' && typeof widgets[i].dataset.widget !== 'undefined') { // <div data-widget="not-empty"/>
                if (widgets[i].dataset.widget == name) { // accepted Widgets
                    if (typeof widgets[i].dataset.wl === 'undefined') {
                        widgetNodes.push(widgets[i]);
                        widgets[i].dataset.wl = config.widgetSelectorDone;
                    }
                }
            }
        }
        return widgetNodes;
    }

    /**
     * get unique widget names
     * @param element {object}
     * @returns {Array}
     */
    function fetchAllUniqueWidgetNames(element) {
        var widgets = element.getElementsByClassName(config.widgetSelector),
            widgetUniqueNames = [];

        for (var i = 0, l = widgets.length; i < l; i++) {
            if (typeof widgets[i].dataset.widget !== 'undefined') {
                if (typeof widgets[i].dataset.disable === 'undefined') {
                    if (widgetUniqueNames.indexOf(widgets[i].dataset.widget) === -1) {
                        widgetUniqueNames.push(widgets[i].dataset.widget);
                    }
                }
            }
        }

        return widgetUniqueNames;
    }

    /**
     * get requirements from widgets and push it into a widget array
     */
    function getWidgetRequirements(all) {
        var xhr = new XMLHttpRequest(),
            widgetNames = fetchAllUniqueWidgetNames(document),
            url = config.backendUrl + config.restWidgetRequirements;

        if (!all) { // set all widgets before codefreeze
            url += widgetNames.join(); //'js/src/mockup.json';
        } else {
            url += 'saved-search,search,tui-cars-teaser,seat-reservation,search-results,r-search,r-search-results,saved-search2';
        }

        if (config.environment) {
            url += '&environment=' + config.environment;
        }

        function onLoad() {
            if (xhr.readyState === 4) {
                if (xhr.status === 200 || xhr.status === 304) {
                    widgetList = _consumeRequirements(xhr.responseText);
                    if (config.autoRun) {
                        startLoadingWidgets(null);
                    }
                    //if (!initialize) {
                    //    initialize = true;
                    //    loadingLibs(widgetList, initWidget);
                    //}
                } else {
                    config.widgetLogging.log(config.widgetName, 'error', xhr.statusText);
                    config.widgetLogging.log(config.widgetName, 'warn', xhr.responseURL);
                }
                initialize = true;
                inProgress = false;
            }
        }

        if (all || widgetNames.length) {
            xhr.open("GET", url, true);
            xhr.onreadystatechange = onLoad;
            xhr.send();
        } else {
            inProgress = false;
        }
    }

    /**
     * @param widgetList {json}
     * @returns {*}
     * @private
     */
    function _consumeRequirements(widgetList) {
        var libraryLength = 0,
            error,
            libCode = 1,
            copyWidgetList = JSON.parse(widgetList),
            widgetLength = copyWidgetList.length;

        if (widgetLength && copyWidgetList[0].hasOwnProperty('libraries')) {
            for (var i = 0; i < widgetLength; i++) {
                error = 0;
                libraryLength = copyWidgetList[i].libraries.length || 0;
                copyWidgetList[i].librariesToLoad = [];

                /*
                 * libCode:
                 * 0 = library exist and running in the RIGHT version
                 * 1 = library exist but running in the WRONG version
                 * 2 = library not found and should be loaded
                 */
                while (libraryLength--) {
                    libCode = existingUsableLibrary(copyWidgetList[i].libraries[libraryLength], libraryCheckName);
                    if (libCode == 2) {
                        // add notice to load this library
                        copyWidgetList[i].libraries[libraryLength].download = true;
                        copyWidgetList[i].librariesToLoad.push(copyWidgetList[i].libraries[libraryLength].libObj);

                    } else {
                        error += (libCode) ? 0 : 1;
                    }
                }
                // when all libraries are in version range or not any not exist then is widget enable to load
                copyWidgetList[i].enable = (error == 0);

                config.widgetLogging.log(config.widgetName, 'debug', 'Enable Widget (' + copyWidgetList[i].name + '): ' + (error == 0));
            }
        } else {
            config.widgetLogging.log(config.widgetName, 'debug', 'Found widgets on page but the REST response are empty');
        }

        return copyWidgetList;
    }

    /*
     *   L I B R A R Y
     *   -----------------------------------------------------------------------------------------
     */

    /**
     * @param string {string}
     * @returns {number}
     */
    function getVersionNumber(string) {
        var arr = string.split('.'),
            i = arr.length, // current length
            j = 4, // desired length
            number = 0,
            minus = 0;

        if (i < j) {
            for (var a = 0; a < (j - i); a++) {
                arr.push('0');
            }
        } else {
            arr = arr.slice(0, j);
        }

        i = arr.length;
        arr.reverse();

        while (i--) {
            if (isNaN(arr[i])) {
                arr[i] = 0;
            }
            number += (parseInt(arr[i]) + 1) * Math.pow(1000, i);
            minus += Math.pow(1000, i);
        }
        number -= minus;

        return number;
    }

    /**
     * @param version {string}
     * @param min {string}
     * @param max {string}
     * @returns {boolean}
     */
    function versionInRange(version, min, max) {
        var versionNumber = getVersionNumber(version);

        return (versionNumber >= getVersionNumber(min) && versionNumber <= getVersionNumber(max));
    }

    /**
     * @param library {object}
     * @param libraryCheckName {object}
     * @returns {number}
     */
    function existingUsableLibrary(library, libraryCheckName) {
        var lib = library,
            versionCurrent = 0;

        lib.appName = lib.libObj.toLowerCase().replace('.', '');

        if (libraryCheckName.hasOwnProperty(lib.appName) && libraryCheckName[lib.appName].libName()) {
            versionCurrent = libraryCheckName[lib.appName].version();

            if (versionInRange(versionCurrent, lib.versionMin, lib.versionMax)) {
                config.widgetLogging.log(config.widgetName, 'debug', 'Library ==( ' + lib.libObj + ' )== RIGHT version');

                return 1;
            } else {
                config.widgetLogging.log(config.widgetName, 'debug', 'Library ==( ' + lib.libObj + ' )== WRONG version');

                return 0;
            }
        } else {
            config.widgetLogging.log(config.widgetName, 'debug', 'Library ==( ' + lib.libObj + ' )== NOT FOUND - should be loaded');

            return 2;
        }
    }

    /**
     * @param widgetList {array}
     * @returns {{name: Array, library: Array, path: Array}}
     * @param widgetName
     */
    function checkWidgetIsEnabled(widgetList, widgetName) {
        var widgetLength = widgetList.length,
            libraryLength = 0,
            loadingLibraries = {
                name: [],
                library: [],
                path: []
            };

        for (var i = 0; i < widgetLength; i++) {
            if (widgetAllow.length === 0 || widgetList[i].name == widgetName && widgetList[i].enable) {
                libraryLength = widgetList[i].libraries.length;

                for (var j = 0; j < libraryLength; j++) {
                    if (loadingLibraries.library.indexOf(widgetList[i].libraries[j].fileName) == -1 && widgetList[i].libraries[j].download) {
                        loadingLibraries.name.push(widgetList[i].libraries[j].libObj);
                        loadingLibraries.library.push(widgetList[i].libraries[j].fileName);
                        loadingLibraries.path.push(widgetList[i].name + '/' + widgetList[i].libraries[j].fileName);
                    }
                }
            }
        }

        return loadingLibraries;
    }

    /**
     * @param widgetName {string}
     * @param callback {function}
     */
    function registerWidget(widgetName, callback) {
        if (typeof widgetRegistry[widgetName] === 'undefined') {
            widgetRegistry[widgetName] = [];
        }

        widgetRegistry[widgetName].push({
            bootstrapMethod: callback
        });

        for (var i = 0, l = widgetCompleteList.length; i < l; i++) {
            if (widgetCompleteList[i].name == widgetName) {
                callback(widgetCompleteList[i].environment, fetchRefreshWidgets(document, widgetName));
                break;
            }
        }
    }

    /**
     * @param widgetsObject
     * @param widgetName
     */
    function loadingLibs(widgetsObject, widgetName) {
        var loadingLibraries = checkWidgetIsEnabled(widgetsObject, widgetName),
            countToLoad = loadingLibraries.library.length,
            countLoaded = countToLoad,
            errorLibList = [],
            errorLibCount = 0,
            resourcePathWithoutFileExtension = '',
            extendVersion = '';

        function callback(errorLibName) {
            if (errorLibName) {
                errorLibList.push(errorLibName);
            }

            // last callback, starts when loading last library
            if (!--countLoaded) {
                // inject all needed widget scripts to page
                for (var i = 0, l = widgetsObject.length; i < l; i++) {
                    if (widgetAllow.length === 0 || widgetsObject[i].name == widgetName) {
                        errorLibCount = 0;

                        // looking and counting for not loading lib into widget libraries
                        for (var x = 0, n = errorLibList.length; x < n; x++) {
                            errorLibCount += (widgetsObject[i].librariesToLoad.indexOf(errorLibList[x]) == -1) ? 0 : 1;
                        }

                        // only add if widget is enabled and libraries are not in the error list
                        if (widgetsObject[i].enable && !errorLibCount && (window.tuiWidgetLoader.loadedWidgets.indexOf(widgetsObject[i].name) == -1)) {
                            resourcePathWithoutFileExtension = config.excludeWidgetNameInResourceUrl ? config.widgetResourceUrl + widgetsObject[i].name : config.widgetResourceUrl + widgetsObject[i].name + '/' + widgetsObject[i].name;
                            extendVersion = widgetsObject[i].version ? '?v=' + widgetsObject[i].version : '';
                            addWidgetScript(resourcePathWithoutFileExtension + '.js' + extendVersion);
                            addLink(resourcePathWithoutFileExtension + '.css' + extendVersion);
                            window.tuiWidgetLoader.loadedWidgets.push(widgetsObject[i].name);
                        }
                    }
                }
            }
        }

        widgetCompleteList = widgetsObject;

        // add widgetLoader Stylesheet
        if (!widgetLoaderCSS) {
            addLink(config.widgetLoaderResourceUrl + '/global-widget.css?x=' + config.version);
            widgetLoaderCSS = true;
        }

        // inject all needed library scripts to page first
        while (countToLoad--) {
            addLibraryScript(config.widgetResourceUrl + loadingLibraries.path[countToLoad], callback, loadingLibraries.name[countToLoad]);
        }

        // load widget if they have nothing to load a library
        for (var i = 0, l = widgetsObject.length; i < l; i++) {
            if (widgetAllow.length === 0 || widgetsObject[i].name == widgetName && (window.tuiWidgetLoader.loadedWidgets.indexOf(widgetsObject[i].name) == -1)) {
                if (!widgetsObject[i].librariesToLoad.length && widgetsObject[i].enable) {
                    resourcePathWithoutFileExtension = config.excludeWidgetNameInResourceUrl ? config.widgetResourceUrl + widgetsObject[i].name : config.widgetResourceUrl + widgetsObject[i].name + '/' + widgetsObject[i].name;
                    extendVersion = widgetsObject[i].version ? '?v=' + widgetsObject[i].version : '';
                    addWidgetScript(resourcePathWithoutFileExtension + '.js' + extendVersion);
                    addLink(resourcePathWithoutFileExtension + '.css' + extendVersion);
                    window.tuiWidgetLoader.loadedWidgets.push(widgetsObject[i].name);
                }
            }
        }
    }

    /*
     *   R U N N I N G
     *   -----------------------------------------------------------------------------------------
     */

    /**
     * second: load widget, if null load all widgets
     * @param widgets {array}
     */
    function startLoadingWidgets(widgets) {
        var widgetName = widgets;

        if (Object.prototype.toString.call(widgets) === '[object Array]') {
            widgetName = widgets.toString();
            widgetAllow = widgets;
        } else {
            widgetAllow = [];
        }

        if (!initialize) {
            if (!inProgress) {
                initWidget = widgetName;
                initializeWidgetLoader();
            } else {
                var interval = null,
                    widgetGo = function () {
                        if (initialize) {
                            clearInterval(interval);
                            loadingLibs(widgetList, widgetName);
                        }
                    };

                interval = setInterval(widgetGo, 100);
            }
        } else {
            loadingLibs(widgetList, widgetName);
        }

        for (var wName in widgetRegistry) {
            if (widgetRegistry.hasOwnProperty(wName)) {
                widgetRegistry[wName].forEach(function (widgetRegistryEntry) {
                    if (widgetRegistryEntry.bootstrapMethod) {
                        var widgetEnvironment;

                        for (var i = 0, l = widgetCompleteList.length; i < l; i++) {
                            if (widgetCompleteList[i].name == wName) {
                                widgetEnvironment = widgetCompleteList[i].environment;
                                break;
                            }
                        }

                        if (widgetEnvironment) {
                            widgetRegistryEntry.bootstrapMethod(widgetEnvironment, fetchRefreshWidgets(document, wName));
                        }
                    }
                });
            }
        }
    }

    /**
     * first: initialize widgetloader
     */
    function initializeWidgetLoader() {
        inProgress = true;
        getWidgetRequirements(true);
    }

    // @override config from intern
    if (typeof settings != 'undefined') {
        for (var i in settings) {
            if (settings.hasOwnProperty(i)) {
                config[i] = settings[i];
            }
        }
    }

    // @override config from extern
    if (typeof window.tuiWidgetLoader !== 'undefined') {
        config.environment = (window.tuiWidgetLoader.configOverrides && window.tuiWidgetLoader.configOverrides.environment) || config.environment;
        config.widgetResourceUrl = (window.tuiWidgetLoader.configOverrides && window.tuiWidgetLoader.configOverrides.widgetResourceUrl) || config.widgetResourceUrl;
        config.excludeWidgetNameInResourceUrl = (window.tuiWidgetLoader.configOverrides && window.tuiWidgetLoader.configOverrides.excludeWidgetNameInResourceUrl) || false;
    }

    return {
        config: config,
        fetchWidgets: fetchAllUniqueWidgetNames,
        initializeWidgetLoader: initializeWidgetLoader,
        existingUsableLibrary: existingUsableLibrary,
        versionInRange: versionInRange,
        getVersionNumber: getVersionNumber,
        startLoadingWidgets: startLoadingWidgets,
        checkWidgetIsEnabled: checkWidgetIsEnabled,
        registerWidget: registerWidget
    };
};

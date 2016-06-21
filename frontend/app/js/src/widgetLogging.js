/**
 *
 * class WidgetLogging
 * @param settings
 * @returns {}
 * @constructor
 */
var WidgetLogging = function (settings) {
    var config = {
            server: '//webnode01.berlin.webhub.com/',
            maxLoggings: 100,
            logLevelProfile: 'trace', //setLevelProfile
            logLevelRange: ['trace', 'debug', 'info', 'warn', 'error'],
            logResponseLimit: 2000,
            logIntervalUse: 10000,
            logIntervalLimit: 300000
        },
        timer,
        loggingList = [];

    /*
     *   L O G G I N G
     *   -----------------------------------------------------------------------------------------
     */

    function sendLogList(logData) {
        var xhr = new XMLHttpRequest(),
            startTime = new Date().getTime();

        xhr.onreadystatechange = function () {
            var endTime = new Date().getTime(),
                consumption = endTime - startTime;

            if (xhr.readyState == 4) {

                // caps the maximum of response time
                if (consumption < config.logIntervalLimit) {

                    // response time checks if it bigger than logResponseLimit
                    // than increase the time of log interval
                    if (consumption > config.logResponseLimit) {
                        config.logIntervalUse *= 2;
                        stopInterval();
                        startInterval();

                        // or decrease the time of log interval
                    } else if (config.logIntervalUse > config.logIntervalMin) {
                        config.logIntervalUse /= 2;
                        stopInterval();
                        startInterval();
                    }
                }
            }
        };
        xhr.open('POST', config.server + 'rest/widgets/log', true);
        xhr.timeout = 5000;
        xhr.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');
        xhr.send(JSON.stringify(logData));

        loggingList.length = 0;
    }

    //map levels to be comparable
    function validateLevel(logLevel) {
        return config.logLevelRange.indexOf(logLevel);
    }

    function log(widgetName, logLevel, message) {
        if (loggingList.length < config.maxLoggings) {
            //compare logLevel and only add message if its within level scope
            if (validateLevel(logLevel) >= validateLevel(config.logLevelProfile)) {
                loggingList.push({
                    widgetName: widgetName,
                    logLevel: logLevel.toUpperCase(),
                    message: message
                });
            }
        }
    }

    function startInterval() {
        timer = setInterval(function () {
            if (loggingList.length > 0) {
                sendLogList(loggingList);
            }
        }, config.logIntervalUse);
    }

    function stopInterval() {
        clearInterval(timer);
    }

    /*
     *   R U N N I N G
     *   -----------------------------------------------------------------------------------------
     */

    if (typeof settings != 'undefined') {
        for (var i in settings) {
            if (settings.hasOwnProperty(i)) {
                config[i] = settings[i];
            }
        }
    }
    // do not change this
    config.logIntervalMin = config.logIntervalUse;

    startInterval();

    return {
        config: config,
        log: log,
        sendLogList: sendLogList,
        stopInterval: stopInterval
    };
};

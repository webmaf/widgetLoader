if (!window.tuiWidgetLoader.registerWidget) {
    var widgetLogging = new WidgetLogging({
            server: environment.backendUrl,
            logLevelProfile: environment.logLevel || 'warn'
        }),
        widgetLoader = new WidgetLoader({
            environment: environment.environment,
            backendUrl: environment.backendUrl,
            widgetLoaderResourceUrl: environment.widgetLoaderResourceUrl,
            widgetResourceUrl: environment.widgetResourceUrl,
            widgetLogging: widgetLogging,
            //autoRun: true,
            version: '1.0.3'
        });

    window.tuiWidgetLoader.log = widgetLogging.log;
    window.tuiWidgetLoader.registerWidget = widgetLoader.registerWidget;
    window.tuiWidgetLoader.startLoadingWidgets = widgetLoader.startLoadingWidgets;

    docReady(function () {
        widgetLoader.initializeWidgetLoader();
    });

    // try to fix race condition problems when using a <script> tag with tuiWidgetLoader.startLoadingWidgets(['abc']) right aber the corresponding widget html code
    window.tuiWidgetLoader.startLoadingWidgets([]);
}

document.addEventListener('widgetLoader.discover', function () {
    console.log('WL - event was fired "widgetLoader.discover" !');
});
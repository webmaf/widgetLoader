#### Integration snippet local/dev: ####
```html
<script type="text/javascript">

(function() {
    var wl = document.createElement('script'); wl.type = 'text/javascript'; wl.async = true;
    wl.src = ('https:' == document.location.protocol ? 'https://' : 'http://') + 'ttm-stag.tui-interactive.com/ms/fe/widgetloader/widgetloader.js';
    var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(wl, s);
})();

</script>
```

#### Integration snippet live: ####
```html
<script type="text/javascript">

// tbd

</script>
```

## widgetloader ##

#### settings ####

addLibraryScript (3)
    - erstellt ein script tag für javascript bibliotheken und hängt es an den body tag
    - bei einem fehler, erfolg oder timeout wird eine [callback] funktion aufgerufen
        callback (1)
        - beim fehler fall wird der name der bibliothek (parameter) in eine liste gepackt
        - 

addWidgetScript (1)
    - erstellt ein script tag für javascript und hängt es an den body tag

addLink (1)
    - erstellt ein link tag für css und hängt es in den head tag
    
#### widget ####
    
fetchRefreshWidgets (1)
    - 
    
fetchWidgets (1)

getWidgetRequirements (1)

_consumeRequirements (1)

restartWithWidgets (1)

#### library ####

getVersionNumber (1)

versionInRange (3)
    - 

existingUsableLibrary (2)
    - prüft ob die zuladene Bibliothek schon auf der Seite existiert oder geladen werden muss

checkWidgetIsEnabled (1)
    - gibt eine Liste zurück für die zuladenen Bibliotheken (name, library, path)

registerWidget (2)
    - ruft die callback Funktion
    - übergibt ihm die Umgbungsvariablen und die Nodes im DOM wo die/das Widget liegt

#### running ####

startLoadingLibs
    - lädt die global-widget.css
    - lädt alle Bibliotheken
    - lädt alle Widgets die keine Bibliotheken brauchen deren JS und CSS 
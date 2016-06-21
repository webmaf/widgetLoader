## mockData ##
#--------------------------------------------------------

# if you want to use mock data, paste into browser console to enable / disable (auto):

localStorage.dataMock = 'on'
localStorage.dataMock = 'off'


## Feature Set ##
##--------------------------------------------------------

- Sucht alle WidgetsPlaceHolder auf der aufgerufenen Seite mittels einem konfigurierbaren Selektor

- Erstellt eine List von gefundenen Widgets und schickt diese, gefiltert von Duplikaten ans Backend

- Mit Hilfe von localStorage kann man die Response vom Backend entweder von MockDaten oder RealDaten abholen

- Prüft ob die Bibliothek schon existiert und wenn ja, ob diese auch in der Versions Skala enthalten ist

- Lädt alle nicht existierenden Bibliotheken nach

- Nur wenn alle Bibliotheken des Widgets geladen sind dann werden die Widget geladen

- Falls eine Bibliothek nicht geladen werden konnte wird das Widget was das braucht ignoriert

- Jedes Widget hat die Möglichkeit zu loggen

- Es gibt ein globales Logging, die Einstellungen sind konfigurierbar zB. logLevel, delay ...

- Die Logs sind limitiert und werden pro User gesammelt und im Interval versendet

- Sind die Antwortzeiten zu hoch wird die Intervalzeit erhöht und gesenkt wenn es sich wieder normalisiert


### Installing Karma and plugins
###--------------------------------------------------------
    $ npm install


### Commandline Interface
###--------------------------------------------------------

#### So you might find it useful to install karma-cli globally.
    $ (sudo) npm install -g karma-cli


### To use Karma
###--------------------------------------------------------

#### that is include a watcher
    $ karma start


### Building needed files
###--------------------------------------------------------

#### local 
    $ gulp
or
    $ gulp local

#### not local
    --env dev
    --env prod
    --env stag
    --env itest

    --env devnode
    --env testnode

    $ gulp build --env stag
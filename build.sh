#!/usr/bin/env bash

echo "####################"
echo "###     build.sh ###"
echo "####################"

WORKSPACE=$(pwd)
echo "This is my workspace $WORKSPACE"

### Export Path Variables ###
echo Exporting path variables
PATH=$PATH:/home/tui/tools/gradle-2.5/bin:/home/tui/tools/gradle-2.5/bin:/home/tui/tools/node-v0.12.7-linux-x64/bin:/home/tui/tools/rubygems-2.4.8/bin:/home/tui/.rvm/rubies/ruby-1.9.3-p551/bin:/home/tui/.rvm/gems/ruby-1.9.3-p551/bin


echo "####################"
echo "###  Build Tools ###"
echo "####################"
echo "gradle $(gradle -v)"
echo "ruby $(ruby -v)"
echo "npm $(npm -v)"
echo "npm-cache $(npm-cache -v)"
echo "bower $(bower -v)"
echo "bundle $(bundle -v)"
echo "gulp $(gulp -v)"
echo "phantomjs $(phantomjs -v)"

GRADLE="gradle.properties"
cd $WORKSPACE/backend
if [ -e $GRADLE ]; then
    sed -i "s/nextVersion/$VERSION/g" "$GRADLE"
    echo "exporting $VERSION to $GRADLE"
else
    echo "$GRADLE not found"
fi

cd $WORKSPACE/frontend
npm-cache install npm bower
npm install

packagejson="package.json"
cd $WORKSPACE/frontend
if [ -e $packagejson ]; then
    sed -i "s/0\.0\.0/$VERSION/g" "$packagejson"
    echo "exporting $VERSION to $packagejson"
else
    echo "$packagejson not found"
fi

### Build Backend ###
echo "Building backend"
cd $WORKSPACE/backend
gradle clean build
echo "Building backend - finished"



### Build Frontend ###
echo "Building frontend"
cd $WORKSPACE/frontend
bower install
bundle install
gulp clean
gulp jenkinsbuild --env dev
#gulp jenkinsbuild --env itest
#gulp jenkinsbuild --env stag
#gulp jenkinsbuild --env prod
echo "Building frontend - finished"


### Collect Build Artifacts ###
echo "Collecting build artifacts to deploy folder"
cd $WORKSPACE
[ -d deploy/ ] && rm -r deploy/
mkdir -p deploy/
cp backend/widgetloader-service/build/libs/*.jar deploy/
cp backend/widgetloader-logging/build/libs/*.jar deploy/
cp frontend/app/deploy/*.tar deploy/
echo "Collecting build artifacts - finished"


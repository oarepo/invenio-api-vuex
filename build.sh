#!/bin/bash

set -e

json=$(realpath $(dirname $0)/node_modules/.bin/json)
bili=$(realpath $(dirname $0)/node_modules/.bin/bili)

rm -rf dist
cd library 
$bili -c bili.config.js --plugins.vue --format esm ./index.js
mv dist/index.esm.js dist/oarepo-invenio-api-vuex.esm.js 
cat ../package.json | $json -e "delete this.scripts; delete this.devDependencies; this.peerDependencies=this.dependencies; delete this.dependencies" >dist/package.json
cp ../README.md dist 
mv dist ..


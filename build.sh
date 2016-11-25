#!/bin/bash
tsc

pushd lib
  browserify core.js > ../built.js
  browserify control.js > ../built-control.js
popd

cat userscript.txt > built.user.js
cat built.js >> built.user.js
cat foot.txt >> built.user.js

cp built.js ./crx/content-scripts/bilidili-core.js
cp built-control.js ./crx/content-scripts/bilidili-control.js
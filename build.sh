#!/bin/bash
pushd src
  tsc -t es5 --removeComments --lib es6,dom --outDir ../lib -m commonjs core.ts control.ts
popd

pushd lib
  browserify core.js > ../built.js
  browserify control.js > ../built-control.js
popd

cat userscript.txt > built.user.js
cat built.js >> built.user.js
cat foot.txt >> built.user.js

cp built.js ./crx/content-scripts/bilidili-core.js
cp built-control.js ./crx/content-scripts/bilidili-control.js
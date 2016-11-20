#!/bin/bash
pushd core/src
  tsc -t es5  --removeComments --lib es6,dom --outDir ../lib -m commonjs video2.ts control.ts
popd

pushd core/lib
  browserify video2.js > ../built.js
  browserify control.js > ../built-control.js
popd

cat userscript.txt > built.user.js
cat core/built.js >> built.user.js
cat foot.txt >> built.user.js

cp core/built.js ./crx/content-scripts/bilidili-core.js
cp core/built-control.js ./crx/content-scripts/bilidili-control.js
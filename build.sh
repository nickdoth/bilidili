#!/bin/bash
pushd core/src
  tsc -t es5  --removeComments --outDir ../lib -m commonjs video2.ts
popd

pushd core/lib
  browserify video2.js > ../built.js
popd

cat userscript.txt > built.user.js
cat built.js >> built.user.js
cat foot.txt >> built.user.js

cp core/built.js ./crx/content-scripts/bilidili-core.js
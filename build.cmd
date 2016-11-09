pushd core\src
  call tsc -t es5 --outDir --removeComments ..\lib -m commonjs video2.ts
popd

pushd core\lib
  call browserify video2.js > ..\built.js
popd

type userscript.txt > built.user.js
type built.js >> built.user.js
type foot.txt >> built.user.js

copy /y core\built.js .\crx\content-scripts\bilidili-core.js
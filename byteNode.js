const bytenode = require('bytenode');

let compiledFilename = bytenode.compileFile({
    filename: './server/appClear.js',
    output: './server/app.jsc', // if omitted, it defaults to '/path/to/your/file.jsc'
  });
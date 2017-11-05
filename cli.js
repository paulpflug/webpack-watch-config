#!/usr/bin/env node
readConf = require("read-conf")
try {
  webpack = require("webpack")
} catch (e) {
  path = require("path")
  var entry = require.resolve("webpack", { paths: [path.join(process.cwd(), "node_modules")] })
  webpack = require(entry)
}
var args, compiler, watcher
args = process.argv.slice(2)
compiler, watcher = null
readConf({
  name: "webpack.config",
  filename: args[0],
  watch: true,
  cancel: () => {
    console.log("webpack-watcher: change in configuration detected")
    watcher.close()
  },
  cb: (conf) => {
    delete conf.mtime
    delete conf.hash
    return new Promise((resolve) => {
      compiler = webpack(conf)
      watcher = compiler.watch({}, (err, stats) => {
        if (err) {
          console.error(err.stack || err);
          if (err.details) {
            console.error(err.details);
          }
          return;
        }

        const info = stats.toJson();

        if (stats.hasErrors()) {
          console.log(info.errors);
        }

        if (stats.hasWarnings()) {
          console.log(info.warnings);
        }

        console.log(stats.toString({
          chunks: false,  // Makes the build much quieter
          colors: true    // Shows colors in the console
        }));
      })
    })
  }
})
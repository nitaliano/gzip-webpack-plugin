var zlib = require('zlib');
var async = require('async');
var RawSource = require('webpack/lib/RawSource');

function WebpackGzipPlugin(options) {
    if (!options) {
        options = {};
    }
    this.regExp = options.regExp || /\.js$|\.css$/;
}

WebpackGzipPlugin.prototype.apply = function (compiler) {
    compiler.plugin('this-compilation', this.onCompilation.bind(this));
};

WebpackGzipPlugin.prototype.onCompilation = function (compilation) {
    compilation.plugin("optimize-assets", this.onOptimize.bind(this));
};

WebpackGzipPlugin.prototype.onOptimize = function (assets, cb) {
    var self = this;

    async.forEach(Object.keys(assets), function(file, cb) {
        if (!self.regExp.test(file)) {
            return cb();
        }

        var asset = assets[file];
        var content = asset.source();

        if(!Buffer.isBuffer(content)) {
            content = new Buffer(content, "utf-8");
        }

        if (!content.length) {
            return cb();
        }

        zlib.gzip(content, function(err, result) {
            if (err) {
                return cb(err);
            }

            var newFile = this.asset.replace(/\{file\}/g, file);
            assets[newFile] = new RawSource(result);
            callback();
        });
    }, callback);
};

module.exports = WebpackGzipPlugin;
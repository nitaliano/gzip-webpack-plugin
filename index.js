var zlib = require('zlib');
var async = require('async');
var RawSource = require('webpack/lib/RawSource');

function GzipPlugin(options) {
    if (!options) {
        options = {};
    }
    this.regExp = options.regExp || /\.js$|\.css$/;
}

GzipPlugin.prototype.apply = function (compiler) {
    compiler.plugin('this-compilation', this.onCompilation.bind(this));
};

GzipPlugin.prototype.onCompilation = function (compilation) {
    compilation.plugin("optimize-assets", this.onOptimize.bind(this));
};

GzipPlugin.prototype.onOptimize = function (assets, cb) {
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

            console.log('here');
            var fileParts = file.split('.');
            var ext = fileParts.pop();
            assets[fileParts.join('.') + '.gz.' + ext] = new RawSource(result);

            return cb();
        });
    }, cb);
};

module.exports = GzipPlugin;

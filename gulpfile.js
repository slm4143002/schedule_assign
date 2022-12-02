const { series, src, dest } = require('gulp');
const typeScript = require('gulp-typescript');
const install = require('gulp-install');
const rimraf = require('rimraf');

function cleanResource(callback) {
    rimraf.sync('dist/**');
    callback();
}

function compileTypeScript(callback) {
    // body omitted
    let ts = typeScript.createProject('tsconfig.json');
    src('src/**/*.ts').pipe(ts()).pipe(dest(ts.options.outDir));
    callback();
}

function collectResources(callback) {
    src('config/**').pipe(dest('dist/config/'));
    callback();
}

function copyPackageJson(callback) {
    src('package.json').pipe(dest('dist/')).pipe(install());
    console.log(process.cwd());
    callback();
}

exports.autobuild = series(
    cleanResource,
    collectResources,
    copyPackageJson,
    compileTypeScript
);

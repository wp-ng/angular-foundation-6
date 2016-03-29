'use strict';
var gulp = require('gulp');
var sass = require('gulp-sass');
var ngAnnotate = require('gulp-ng-annotate');
var uglify = require('gulp-uglify');
var templateCache = require('gulp-angular-templatecache');
var merge = require('merge-stream');
var path = require('path');
var template = require('gulp-template');
var expand = require('glob-expand');
var fs = require('fs');
var marked = require('marked');
var _ = require('lodash');
var concat = require('gulp-concat');
var Streamqueue = require('streamqueue');
var source = require('vinyl-source-stream');
var vinylBuffer = require('vinyl-buffer');
var conventionalChangelog = require('gulp-conventional-changelog');
var rename = require('gulp-rename');
var chmod = require('gulp-chmod');
var KarmaServer = require('karma').Server;
var runSequence = require('run-sequence');
var argv = require('yargs').argv;
var bump = require('gulp-bump');
var shell = require('shelljs');
var changed = require('gulp-changed');
var connect = require('gulp-connect');
var open = require('gulp-open');
var postcss = require('gulp-postcss');
var autoprefixer = require('autoprefixer-core');
var babel = require('gulp-babel');
var eslint = require('gulp-eslint');

var base = path.join(__dirname, 'src');
var watchedFiles = [
    '!src/**/*spec.js',
    'src/**/*.js',
    'src/**/*.md',
    'src/**/*.html',
    'misc/**/*',
    'gulpfile.js'
];


var buildModules = [];
if (argv.modules) {
    buildModules = argv.modules.split(',');
}

var uglifySettings = {
    preserveLicenseComments: false,
    inline_script: true,
    warnings: false,
    mangle: true || {
        except: [
            '__require',
            'require',
            'define',
            'System.import',
            'System.require',
            'System',
            'FB',
            'ga',
            'Rollbar'
        ]
    },
    compress: {
        screw_ie8: true,
        sequences: true,
        dead_code: true,
        conditionals: true,
        booleans: true,
        unused: true,
        if_return: true,
        join_vars: true,
        drop_console: true
    }
};

var pkg = require('./package.json');

// Common mm.foundation module containing all modules for src and templates
// findModule: Adds a given module to config

function fileContents(fname) {
    return fs.readFileSync(fname, {
        encoding: 'utf-8'
    });
}

function findModule(name, modules, foundModules) {
    if (foundModules[name]) {
        return;
    }
    foundModules[name] = true;

    function breakup(text, separator) {
        return text.replace(/[A-Z]/g, function(match) {
            return separator + match;
        });
    }

    function ucwords(text) {
        return text.replace(/^([a-z])|\s+([a-z])/g, function($1) {
            return $1.toUpperCase();
        });
    }

    var module = {
        name: name,
        moduleName: 'mm.foundation.' + name,
        displayName: ucwords(breakup(name, ' ')),
        srcFiles: expand('src/' + name + '/*.js'),
        tplFiles: expand('src/' + name + '/*.html'),
        dependencies: dependenciesForModule(name),
        docs: {
            md: expand('src/' + name + '/docs/*.md')
                .map(fileContents).map(function(content){return marked(content);}).join('\n'),
            js: expand('src/' + name + '/docs/*.js')
                .map(fileContents).join('\n'),
            html: expand('src/' + name + '/docs/*.html')
                .map(fileContents).join('\n')
        }
    };
    module.dependencies.forEach(function(name) {
        findModule(name, modules, foundModules);
    });
    modules.push(module);
}

function dependenciesForModule(name) {
    var deps = [];

    expand('src/' + name + '/*.js')
        .map(fileContents)
        .forEach(function(contents) {
            // var contents = String(buffer);
            // Strategy: find where module is declared,
            // and from there get everything inside the [] and split them by comma
            var moduleDeclIndex = contents.indexOf('angular.module(');
            var depArrayStart = contents.indexOf('[', moduleDeclIndex);
            var depArrayEnd = contents.indexOf(']', depArrayStart);
            var dependencies = contents.substring(depArrayStart + 1, depArrayEnd);
            dependencies.split(',').forEach(function(dep) {
                if (dep.indexOf('mm.foundation.') > -1) {
                    var depName = dep.trim().replace('mm.foundation.', '').replace(/['"]/g, '');
                    if (deps.indexOf(depName) < 0) {
                        deps.push(depName);
                        //Get dependencies for this new dependency
                        deps = deps.concat(dependenciesForModule(depName));
                    }
                }
            });
        });
    return deps;
}

function findModules() {
    var foundModules = {};
    var modules = [];

    expand({
        filter: 'isDirectory',
        cwd: '.'
    }, 'src/*').forEach(function(dir) {
        var moduleName = dir.split('/')[1];
        if (moduleName[0] === '_') {
            return;
        }
        if (buildModules.length && buildModules.indexOf(moduleName) === -1) {
            return;
        }
        findModule(moduleName, modules, foundModules);
    });

    modules.sort(function(a, b) {
        if (a.name < b.name) {
            return -1;
        }
        if (a.name > b.name) {
            return 1;
        }
        return 0;
    });

    return modules;
}


function build(fileName, opts) {
    var options = opts || {};

    var modules = findModules();

    var sq = new Streamqueue({
        objectMode: true
    });

    var banner = ['/*',
        ' * <%= pkg.name %>',
        ' * <%= pkg.homepage %>\n',
        ' * Version: <%= pkg.version %> - <%= today %>',
        ' * License: <%= pkg.license %>',
        ' * (c) <%= pkg.author %>',
        ' */\n'
    ].join('\n');

    var fakeFileStream = source('banner.js');
    fakeFileStream.write(banner);
    sq.queue(
        fakeFileStream.pipe(vinylBuffer()).pipe(template({
            pkg: pkg,
            today: new Date().toISOString().slice(0, 10)
        }))
    );
    fakeFileStream.end();

    modules.forEach(function(module) {
        if (!options.skipSource) {
            sq.queue(gulp.src(module.srcFiles));
        }

        if (!options.skipTemplates && module.tplFiles.length) {
            var s = gulp.src(module.tplFiles)
                .pipe(templateCache(
                    'templates.js', {
                        moduleSystem: 'IIFE',
                        module: module.moduleName,
                        standalone: false,
                        root: 'template/' + module.name
                    }
                ));

            sq.queue(s);
        }
    });

    var srcModules = _.map(modules, 'moduleName').map(function(m) {
        return '"' + m + '"';
    });
    var fakeFileStream2 = source('mm.foundation.js');
    fakeFileStream2.write('angular.module("mm.foundation", [' + srcModules + ']);');
    sq.queue(fakeFileStream2.pipe(vinylBuffer()));
    fakeFileStream2.end();

    sq.done();

    var s = sq.pipe(concat(fileName))
        .pipe(babel({
            presets: ['es2015']
        }))
        .pipe(ngAnnotate({
            add: true,
            single_quotes: true,
        }));

    if (options.minify) {
        s = s.pipe(uglify(uglifySettings));
    }
    return s;
}

gulp.task('lint', function() {
    return gulp.src(['gulpfile.js', 'src/**/*.js'])
        .pipe(eslint());
        // .pipe(eslint.format());
        // .pipe(eslint.failAfterError());
});

gulp.task('enforce', function() {
    return gulp.src('./misc/validate-commit-msg.js')
        .pipe(rename('commit-msg'))
        .pipe(chmod(755))
        .pipe(gulp.dest('./.git/hooks'));
});

gulp.task('changelog', function() {
    return gulp.src('./CHANGELOG.md')
        .pipe(conventionalChangelog({
            preset: 'angular'
        }))
        .pipe(gulp.dest('./'));
});

gulp.task('demo', function() {
    var modules = findModules();
    var demoModules = modules.filter(function(module) {
        return module.docs.md && module.docs.js && module.docs.html;
    });

    function jspmVersion(str) {
        return str.split('@')[1].replace(/^[^0-9\.]/g, '');
    }

    // read package.json
    var html = gulp.src('./misc/demo/index.html')
        .pipe(template({
            pkg: pkg,
            demoModules: demoModules,
            ngversion: jspmVersion(pkg.jspm.dependencies['angular']),
            nglegacyversion: jspmVersion(pkg.jspm.devDependencies['angular-legacy']),
            //fdversion: '6.0.5',
            fdversion: '6.2.0',
            faversion: '4.3.0',
        }));

    var assets = gulp.src(['./misc/demo/assets/**', '!./misc/demo/assets/*.scss'], {
        base: './misc/demo/'
    });

    var css = gulp.src('./misc/demo/assets/demo.scss', {
        base: './misc/demo/'
    })
    .pipe(sass({
        includePaths: ['./node_modules/motion-ui/src', './node_modules/foundation-sites/scss']
    }))
    .pipe(postcss([
        autoprefixer({
            browsers: ['last 2 version'],
            cascade: false
        })
    ]));

    return merge(assets, html, css).pipe(gulp.dest('./dist'));
});


// Test
gulp.task('test-current', function(done) {
    var config = {
        configFile: __dirname + '/karma.conf.js',
        singleRun: true
    };
    if (argv.coverage) {
        config.preprocessors = {
            'src/*/*.js': ['coverage'],
            'src/**/*': ['generic']
        };
        config.reporters = ['progress', 'coverage'];
    }
    if (process.env.TRAVIS) {
        config.browsers = [ /*'Chrome_travis_ci',*/ 'Firefox'];
    }
    new KarmaServer(config, done).start();
});

gulp.task('test-legacy', function(done) {
    var config = {
        configFile: __dirname + '/karma.conf.js',
        singleRun: true,
        imports: 'var angular = require("angular");' +
            'var mocks = require("angular-mocks");' +
            'var inject = mocks.inject;' +
            'var module = mocks.module;',
    };
    if (argv.coverage) {
        config.preprocessors = {
            'src/*/*.js': ['coverage'],
            'src/**/*': ['generic']
        };
        config.reporters = ['progress', 'coverage'];
    }
    if (process.env.TRAVIS) {
        config.browsers = ['Firefox'];
    }
    new KarmaServer(config, done).start();
});

gulp.task('tdd', function(done) {
    var config = {
        configFile: __dirname + '/karma.conf.js',
        //background: true
    };
    if (argv.coverage) {
        config.preprocessors = {
            'src/*/*.js': ['coverage'],
            'src/**/*': ['generic']
        };
        config.reporters = ['progress', 'coverage'];
    }
    new KarmaServer(config, done).start();
});

gulp.task('test', ['test-current', /*'test-legacy'*/ ], function(done) {
    done();
});

// Develop
gulp.task('build', ['lint'], function() {
    return merge(
            build('mm-foundation-tpls-' + pkg.version + '.js'),
            build('mm-foundation-' + pkg.version + '.js', {
                skipSource: false,
                skipTemplates: true
            }),
            build('mm-foundation-tpls-' + pkg.version + '.min.js', {
                minify: true
            }),
            build('mm-foundation-' + pkg.version + '.min.js', {
                skipSource: false,
                skipTemplates: true,
                minify: true
            })
        )
        .pipe(gulp.dest('dist'));
});

gulp.task('bump', function() {
    return gulp.src('./package.json')
        .pipe(bump({
            type: 'minor'
        }))
        .pipe(gulp.dest('./'));
});

gulp.task('bump-snapshot', function() {
    return gulp.src('./package.json')
        .pipe(bump({
            type: 'prerelease',
            preid: 'SNAPSHOT'
        }))
        .pipe(gulp.dest('./'));
});

gulp.task('publish', ['enforce'], function(done) {
    shell.exec('git commit package.json -m "chore(release): v%version% :shipit:"');
    shell.exec('git tag %version%');
});

gulp.task('release', function(done) {
    // ### Release
    // * Bump up version number in `package.json`
    // * Commit the version change with the following message: `chore(release): [version number]`
    // * tag
    // * push changes and a tag (`git push --tags`)
    // * switch to the `gh-pages` branch: `git checkout gh-pages`
    // * copy content of the dist folder to the main folder
    // * Commit the version change with the following message: `chore(release): [version number]`
    // * push changes
    // * switch back to the `main branch` and modify `package.json` to bump up version for the next iteration
    // * commit (`chore(release): starting [version number]`) and push
    // * publish NPM, Bower and NuGet packages
    runSequence('test', 'build', 'demo', done);
});

gulp.task('server:connect', function() {
    connect.server({
        livereload: true,
        fallback: 'dist/index.html',
        host: 'localhost',
        port: 8080,
        root: ['dist/', '.']
    });
});

gulp.task('server:reload', function() {
    return gulp.src(watchedFiles)
        .pipe(connect.reload());
});

gulp.task('refresh', function(callback) {
    runSequence(['build', 'demo'], 'server:reload', callback);
});

gulp.task('watch', function() {
    gulp.watch(watchedFiles, ['refresh']);
});

gulp.task('opendemo', function(callback) {
    gulp.src(__filename)
        .pipe(open({
            uri: 'http://localhost:8080'
        }));
    callback();
});

gulp.task('default', function(callback) {
    runSequence(['build', 'demo'], 'server:connect', 'watch', 'opendemo', 'tdd', callback);
});

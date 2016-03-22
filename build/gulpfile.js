var app = {
    css: 'css',
    js: 'js',
    img: 'img',
    dist: '../dist',
    snapshots: 'snapshots',
    includes: ['**/*'],
    excludes: ['!./.*/', '!./_*/**', '!.*', '!*.rb', '!./node_modules/', '!./node_modules/**','!./sass/', '!./js/source/**', '!package.json', '!gulpfile.js', '!./bower_components/', '!./bower_components/**', '!bower.json','!./snapshots/'],
    xfolders: ['./.*/', './_*', './node_modules', './sass', './bower_components'],
    port: 41710,
    host: 'localhost',
    bower: 'bower_components/'
};

var filename = {
    headjs : 'init.js',
    headjsmin: 'init.min.js',
    js: 'scripts.js',
    jsmin: 'scripts.min.js',
    css: 'style.css',
    cssmin: 'style.min.css',
}

var gulp = require('gulp');

// Include Plugins
var $ = require('gulp-load-plugins')({
    camelize: true,
    pattern: [
        'gulp-*',
        'gulp.*',
        'glob',
        'del',
        'run-sequence',
        'main-bower-files',
        'browser-sync',
        'pageres',
        'imagemin-mozjpeg'
    ],
    replaceString: /\bgulp[\-.]/
});

var reload = $.browserSync.reload;

var onError = function(err) {
    console.log(err);
};

function makeHashKey(file) {
    return [file.contents.toString('utf8')].join('');
}

function watch(live) {
    if (watch) {
        gulp.watch('sass/**/*.scss', ['deploy:styles']);
        gulp.watch('js/source/*.js', ['deploy:scripts', reload]);
        gulp.watch(['_raw_img/**/*.jpg','_raw_img/**/*.svg','_raw_img/**/*.png','_raw_img/**/*.gif'], ['deploy:images']);
    } else {
        gulp.watch(['*.html'], ['statics']);
        gulp.watch('sass/**/*.scss', ['styles']);
        gulp.watch('js/source/head/*.js', ['scripts:head', reload]);
        gulp.watch('js/source/*.js', ['scripts:foot', reload]);
        gulp.watch(['_raw_img/**/*.jpg','_raw_img/**/*.svg','_raw_img/**/*.png','_raw_img/**/*.gif'], ['images']);
    }

}

// statics
gulp.task('statics', function() {
    return gulp.src(['*.html', '*.php'])
        .pipe(reload({stream: true}));
});

// Run all scripts tasks
gulp.task('scripts', ['scripts:jquery', 'scripts:head', 'scripts:foot'], function() {
    //
});

// jQuery Bower
gulp.task('scripts:jquery', function() {
    return gulp.src($.mainBowerFiles({
            filter: ['**/'+app.bower+'jquery/**/*']
        }))
        .pipe($.plumber(onError))
        .pipe($.changed(app.js + '/lib'))
        .pipe($.stripComments({
            block: true
        }))
        .pipe(gulp.dest(app.js + '/lib'))
        .pipe($.size({
            showFiles: true
        }))
        .pipe($.rename('jquery.min.js'))
        .pipe($.uglify())
        .pipe($.size({
            showFiles: true
        }))
        .pipe(gulp.dest(app.js + '/lib'));
});

// Concatenate & Minify head scripts
gulp.task('scripts:head', function() {
    var jsFiles = ['js/source/head/*.js'];
    return gulp.src(jsFiles)
        .pipe($.plumber(onError))
        .pipe($.stripComments({
            block: true
        }))
        .pipe($.concat(filename.headjs))
        .pipe(gulp.dest(app.js))
        .pipe($.size({
            showFiles: true
        }))
        .pipe($.rename(filename.headjsmin))
        .pipe($.uglify())
        .pipe($.size({
            showFiles: true
        }))
        .pipe(gulp.dest('js'));
});

// Concatenate & Minify DOMReady scripts (footer scripts)
gulp.task('scripts:foot', function() {
    var jsFiles = ['js/source/_*.js', '!js/source/head/*'];
    return gulp.src($.mainBowerFiles({
            filter: ['**/*.js', '!**/'+app.bower+'jquery/**/*']
        }).concat(jsFiles))
        .pipe($.plumber(onError))
        .pipe($.stripComments({
            block: true
        }))
        .pipe($.concat(filename.js))
        .pipe(gulp.dest(app.js))
        .pipe($.size({
            showFiles: true
        }))
        .pipe($.rename(filename.jsmin))
        .pipe($.uglify())
        .pipe($.size({
            showFiles: true
        }))
        .pipe(gulp.dest(app.js));
});

// Concatenate & Minify CSS
gulp.task('styles', function() {
    return gulp.src('sass/*.scss')
        .pipe($.sass({
            outputStyle: 'compressed',
            includePaths: [app.bower + 'bootstrap-sass/assets/stylesheets/']
        }).on('error', $.sass.logError))
        .pipe($.autoprefixer({
            browsers: ["last 2 versions", "ie >= 10", "> 1%"],
            cascade: true
        }))
        .pipe($.groupCssMediaQueries({
            //log: true
        }))
        .pipe($.size({
            showFiles: true
        }))
        .pipe($.concat(filename.css))
        .pipe(gulp.dest('css'))
        .pipe($.rename(filename.cssmin)) // create minified version
        .pipe($.csso())
        .pipe($.size({
            showFiles: true
        }))
        .pipe(gulp.dest('css'))
        .pipe(reload({stream: true}));
});

gulp.task('images', function(callback) { //process files in /_raw_img folder and move to /img
    return $.runSequence('cache:clear','images:optimize',callback);
});

gulp.task('images:optimize', function() { //process files in /_raw_img folder and move to /img
    return gulp.src(['_raw_img/**/*.jpg','_raw_img/**/*.svg','_raw_img/**/*.png','_raw_img/**/*.gif'])
        .pipe($.changed(app.img))
        .pipe($.cache($.imagemin({
            optimizationLevel: 3,
            progressive: true,
            interlaced: true,
            svgoPlugins: [{
                removeEmptyAttrs: true
            }, {
                removeMetadata: true
            }, {
                removeUselessStrokeAndFill: true
            }],
            use: [$.imageminMozjpeg({
                quality: 85,
                //smooth: 10
            })]
        }), {
            key: makeHashKey,
        }))
        .pipe(gulp.dest('img'))
        .pipe(reload({stream: true}));
});


gulp.task('cache:clear', function(done) {
    return $.cache.clearAll(done);
});

// Build
gulp.task('build', function(callback) {
    return $.runSequence(['statics', 'styles', 'scripts'], 'images',callback);
});

gulp.task('postDeploy', function(){
    process.chdir(app.dist);
    return gulp.src(['*.html', '*.php'])
    .pipe($.replace('|||VERSION|||', 'v='+Date.now() ))
    .pipe(gulp.dest('.'))
});

// Deploy files for production
gulp.task('deploy', function() {
    return $.runSequence('prep:safe', 'cleandist', 'postDeploy', function() {
        console.log('\x1b[32m%s\x1b[0m', '✔ Tasks completed. Distribution files at:', app.dist);
    });
});

// Deploy files for production, !! deleting dist/ folder first !!
gulp.task('deploy:clean', function() {
    return $.runSequence('prep', 'cleandist', function() {
        console.log('\x1b[32m%s\x1b[0m', '✔ Tasks completed. Distribution files at:', app.dist);
    });
});

// Build and deploy statics
gulp.task('deploy:statics', ['statics'], function() {
    return gulp.src(['*.html', '*.php'])
        .pipe(gulp.dest(app.dist));
});

// Build and deploy styles
gulp.task('deploy:styles', ['styles'], function() {
    return gulp.src(app.css + '/**')
        .pipe(gulp.dest(app.dist + '/' + app.css));
});

// Build and deploy scripts
gulp.task('deploy:scripts', ['scripts'], function() {
    return gulp.src([app.js + '/**', '!' + app.js + '/source/**'])
        .pipe(gulp.dest(app.dist + '/' + app.js));
});

// Build and deploy images
gulp.task('deploy:images', ['images'], function() {
    return gulp.src(app.img + '/**')
        .pipe(gulp.dest(app.dist + '/' + app.img));
});

// build and watch with Browsersync
gulp.task('watch', ['build'], function() {
    $.browserSync({
        notify: true,
        port: app.port,
        server: true,
        tunnel: false,
        xip: false,
        //online: false,
    });

    watch();
});

gulp.task('watch:deploy', ['build'], function() {
    $.browserSync({
        notify: true,
        port: app.port,
        server: true,
        tunnel: false,
        xip: false,
        //online: false,
    });

    watch(true);
});

gulp.task('watch:offline', ['build'], function() {
    $.browserSync({
        notify: true,
        port: app.port,
        server: true,
        tunnel: false,
        xip: false,
        online: false,
    });

    watch();
});

// watch with Browsersync (no building on init)
gulp.task('watch:fast', function() {
    $.browserSync({
        notify: false,
        port: app.port,
        server: true,
        tunnel: false,
        xip: false,
        online: false,
    });

    watch();
});

// Utilities
gulp.task('wipe', function() {
    $.del(app.dist, {
        force: true
    }, function(err, paths) {
        if (paths) {
            console.log('Deleted files/folders:\n', paths.join('\n'));
        }
    })
});

gulp.task('cleandist', function() {
    $.del(app.xfolders, {
        cwd: app.dist
    });
});

//
gulp.task('prep', ['build', 'wipe'], function() {
    return gulp.src(app.includes.concat(app.excludes))
        .pipe(gulp.dest(app.dist));
});

gulp.task('prep:safe', ['build'], function() {
    return gulp.src(app.includes.concat(app.excludes))
        .pipe(gulp.dest(app.dist));
});

// Default task
gulp.task('default', function() {
    gulp.start('deploy');
});

//SPECIAL TASKS
// - not included in the default automation
// - experimental features

// PAGERES
gulp.task('snapshot', function() {
    var url = app.host + ':' + app.port,
        res = ['1920x1080', '1366x768', '1280x800', '1024x768', '768x1024'],
        crop = true;

    $.pageres({
            //delay: 1,
            filename: 'snap-<%= date %>-<%= size %>',
        })
        .src(url, res, {
            crop: crop
        })
        .dest(app.snapshots)
        .run(function(err) {
            console.log('done');
        });
});

//  UNCSS - removes unecessary CSS files based on the listed HTML files. use with caution
gulp.task('uncss', function() {
    return gulp.src('css/style.css')
        .pipe($.size({
            showFiles: true
        }))
        .pipe($.rename('style.stripped.css')) //uncss
        .pipe($.uncss({
            html: $.glob.sync('*.html')
        }))
        .pipe($.size({
            showFiles: true
        }))
        .pipe(gulp.dest('css'))
        .pipe($.rename('style.stripped.min.css'))
        .pipe($.csso())
        .pipe($.size({
            showFiles: true
        }))
        .pipe(gulp.dest('css'))
});

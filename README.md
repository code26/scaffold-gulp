# scaffold-gulp #

A simple Gulp build process that I personally use to scaffold a website and automate common CSS/JS/Images tasks so I don't have to. ;)

** This is an experimental project, so use with caution. **

### Requirements ###
* [Node.js](https://nodejs.org/)
* [Ruby](https://www.ruby-lang.org/en/downloads/)
    * SASS `gem install sass`
* [Gulp.js](http://gulpjs.com/)
* [Bower](http://bower.io/)

### What's inside? ###

* HTML5 standard index page
* CSS:
    * Twitter Bootstrap-Sass 3.x (via Bower)
    * Wordpress default styles
    * Mixin for common breakpoints
* JS:
    * jQuery 2.x
    * Modernizr (custom build, see banner on file)
    * Lodash (custom build, `modern, category=collection,function`)
    * TWBS scripts (via Bower)
    * VelocityJS (via Bower, disabled by default. To enable, open bower.json > comment "ignore":true)

### The process ###

* BrowserSync (gulp watch, gulp watch:build) ~~and LiveReload (gulp watch:lr) options~~
    * HTML, CSS, JS, Images reloading
    * ~~LR will be removed on next version.~~ REMOVED
* CSS:
    * SASS processing `gulp-sass`
    * Autoprefixer (last 2 versions, > 1% usage, >=IE9) `gulp-autoprefixer`
        * takes care of vendor prefixes
    * Combine Media Queries `gulp-combine-media-queries`
        * media queries can be nested inside the actual selector for maintainability. takes care of consolidating and placing mediaqueries at the end of processed CSS file
    * Minification `gulp-csso`
    * NEW: TWBS is installed via Bower and a router file is created for it. This makes updating TWBS easier and prevents overriding of user configurations.
* JS:
    * Concatenates JS installed via Bower and JS in /sources folder `main-bower-files` except jQuery
    * Strip block comments `gulp-strip-comments`
    * Concatenate *.js files inside /js/source, (except files inside /js/lib and /js/source/head)
    * Minify concatenated files `gulp-uglify`
    * NEW: Concatenates and Minify Init scripts (scripts under /js/source/head), and creates a separate file (init.js and init.min.js)
    * NEW: jQuery is installed via Bower and has a separate task. Outputs to standard and minified files to /js/lib
* Images:
    * Optimization of raw files inside /_raw_img. Processed files are moved to /img `gulp-imagemin`
    * NEW: All images must be put under `_raw_img/` to prevent unnecessary looping of image task.
    * NEW: Added MozJpeg addon for finer compression control.
    * NEW: Updated method for clearing cache.

### Installation ###

1. Clone or Download zip
2. go to `build` folder
3. Run `npm install && bower install`
4. Run `gulp watch:build`

### Commands ###

`gulp build` - Runs all tasks

`gulp watch` - Runs BrowserSync

`gulp watch:build` - Runs all tasks, with BrowserSync

`gulp deploy` - Creates a distribution folder which removes build-related files. Saves to `./dist` folder

Other micro tasks are found in Gulpfile.js

### TODO ###
* ~~Upgrade to jQuery 2.x.x~~ DONE
* To add optional gulp-rev feature

### ACK ###
[Yeoman](http://yeoman.io/)
[Material Design Lite](https://github.com/google/material-design-lite)

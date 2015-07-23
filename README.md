# scaffold-gulp #

A simple Gulp build process that I personally use to scaffold a website and automate common CSS/JS tasks so I don't have to. ;)

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
    * jQuery 1.1x
    * Modernizr (custom build, see banner on file)
    * TWBS scripts (via Bower)
    * Lodash (via Bower)
    * VelocityJS (via Bower)

### The process ###

* BrowserSync (gulp watch) and LiveReload (gulp watch:lr) options
    * HTML, CSS, JS, Images reloading
    * LR will be removed on next version.
* CSS:
    * SASS processing `gulp-sass`
    * Autoprefixer (last 2 versions, > 1% usage, >=IE9) `gulp-autoprefixer`
        * takes care of vendor prefixes
    * Combine Media Queries `gulp-combine-media-queries`
        * media queries can be nested inside the actual selector for maintainability. takes care of consolidating and placing mediaqueries at the end of processed CSS file
    * Minification `gulp-csso`
* JS:
    * Concatenates JS installed via Bower and JS in /sources folder `main-bower-files`
    * Strip block comments `gulp-strip-comments`
    * Concatenate *.js files inside /js/source, (except files inside /js/lib)
    * Minify concatenated files `gulp-uglify`
* Images:
    * Optimization of raw files inside /_img. Processed files are moved to /img `gulp-imagemin`

### Installation ###

1. Clone or Download zip
2. go to `build` folder
3. Run `npm install && bower install`
4. Run `gulp watch`

### Commands ###
`gulp build` - Runs all tasks

`gulp watch` - Runs all tasks, with BrowserSync

`gulp deploy` - Creates a distribution folder which removes build-related files. Saves to `./dist` folder

### TODO ###
* Upgrade to jQuery 2.x.x
* To add optional gulp-rev feature

### ACK ###
[Yeoman](http://yeoman.io/)
[Material Design Lite](https://github.com/google/material-design-lite)

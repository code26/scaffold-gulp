# scaffold-gulp #

A simple Gulp build process that I personally use to scaffold a website and automate common CSS/JS tasks so I don't have to. :)

** This is an experimental project, so use with caution. **

### What's inside? ###

* HTML5 standard index page
* CSS (enabled by default):
    * Twitter Bootstrap-Sass (3.x)
    * Wordpress default styles
    * Mixin for common breakpoints
    * Compass
* JS:
    * jQuery 1.1x
    * Modernizr (custom build, see banner on file)
    * jQuery-evenOut (custom plugin to even-out container blocks in grid)
    * jQuery-scrollTo and localScroll
    * TWBS scripts
    * Lodash 2.4.1 (custom build, `modern category="arrays,functions"`)

### The process ###

* LiveReload
    * HTML, CSS, JS, Images
* CSS:
    * SASS processing with Compass support (ruby-sass)
    * Autoprefixer (last 2 versions, >=IE9) `gulp-autoprefixer`
        * takes care of vendor prefixes
    * Combine Media Queries `gulp-combine-media-queries`
        * media queries can be nested inside the actual selector for maintainability. takes care of consolidating and placing mediaqueries at the end of processed CSS file
    * Minification `gulp-csso`
* JS:
    * Strip block comments `gulp-strip-comments`
    * Concatenate *.js files inside /js/source, (except files inside /js/lib)
    * Minify concatenated files `gulp-uglify`
* Images:
    * Optimization of raw files inside /_img. Processed files are moved to /img `gulp-imagemin`

### Requirements ###
* [Node.js](https://nodejs.org/)
* [Ruby](https://www.ruby-lang.org/en/downloads/)
* [Gulp.js](http://gulpjs.com/)

### Installation ###

1. Clone or Download zip
2. go to `build` folder
3. Run `npm install`
4. Run `gulp watch`

### Commands ###
`gulp build` - Runs all tasks mentioned above

`gulp watch` - Runs all tasks, with LiveReload

`gulp deploy` - Creates a distribution folder which removes build-related files (/dist) 

### ACK ###
Inspired by [Yeoman](http://yeoman.io/).

If you liked it or have some suggestions, feel free to message me. :)
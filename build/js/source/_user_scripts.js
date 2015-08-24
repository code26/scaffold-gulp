/*! Custom scripts */

$(document).ready(function () {
  console.log('code26.ok');

  $(window).on('resize', _.debounce(function () {
    console.log('resized!');
  }, 300));
});

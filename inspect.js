// Validator for the Hakkasan Group's Web Technical Requirements SOP:
// https://hakkasan.atlassian.net/wiki/display/ENG/SOP%3A+Web+Technical+Requirements

var jsdom = require('jsdom');
var colors = require('colors');

var assertions = 0;
var passed = 0;

jsdom.env({
  url: 'http://tiestovegas.com',
  scripts: ['http://code.jquery.com/jquery.js'],
  done: function (err, window) {

    // A non-zero length page title is required.
    assert(window.$('title').length === 1,
      'There is exactly 1 page title');
    assert(window.document.title.length > 0,
      'Page title is greater than 1 character');
    console.log('<title> : ', window.document.title);

    // A non-zero length meta description is required.
    var description = window.$('meta[name="description"]').attr('content');
    assert((description.length > 0),
      'Page includes a <meta name="description" tag with content greater than 1 character');
    assert(((description.length > 150) && (description.length < 160)),
      'Meta description content should ideally be between 150 and 160 characters');
    console.log('<meta name="description" content => ',
      window.$('meta[name="description"]').attr('content'));
    console.log(description.length + ' characters');

    // Multiple favicons are required.
    var favicons = window.$('link[rel="icon"]');
    assert(favicons.length >= 1, 
      'Page has more than 1 favicon');
    favicons.each(function(i) {
      console.log((window.$('link[rel="icon"]')[i].getAttribute('sizes')));
    });

    // Multiple apple-touch-icons are required.
    var appleicons = window.$('link[rel="apple-touch-icon"]');
    assert(appleicons.length >= 1, 
      'Page has more than 1 apple-touch-icon');
    appleicons.each(function(i) {
      console.log((window.$('link[rel="apple-touch-icon"]')[i].getAttribute('sizes')));
    });

    // Twitter card tags required.
    assert(window.$('meta[name="twitter:card"]').attr('content').length >= 1,
      'Page has twitter:card content');
    console.log(window.$('meta[name="twitter:card"]').attr('content'));
    assert(window.$('meta[name="twitter:site"]').attr('content').length >= 1,
      'Page has twitter:site content');
    console.log(window.$('meta[name="twitter:site"]').attr('content'));
    assert(window.$('meta[name="twitter:creator"]').attr('content').length >= 1,
      'Page has twitter:creator content');
    console.log(window.$('meta[name="twitter:creator"]').attr('content'));
    assert(window.$('meta[name="twitter:title"]').attr('content').length >= 1,
      'Page has twitter:title content');
    console.log(window.$('meta[name="twitter:title"]').attr('content'));
    assert(window.$('meta[name="twitter:description"]').attr('content').length >= 1,
      'Page has twitter:description content');
    console.log(window.$('meta[name="twitter:description"]').attr('content'));
    assert(window.$('meta[name="twitter:image"]').attr('content').length >= 1,
      'Page has twitter:image content');
    console.log(window.$('meta[name="twitter:image"]').attr('content'));

    // Facebook Open Graph tags required.
    assert(window.$('meta[property="og:url"]').attr('content').length >= 1,
      'Page has og:url content');
    console.log(window.$('meta[property="og:url"]').attr('content'));
    assert(window.$('meta[property="og:type"]').attr('content').length >= 1,
      'Page has og:type content');
    console.log(window.$('meta[property="og:type"]').attr('content'));
    assert(window.$('meta[property="og:title"]').attr('content').length >= 1,
      'Page has og:title content');
    console.log(window.$('meta[property="og:title"]').attr('content'));
    assert(window.$('meta[property="og:description"]').attr('content').length >= 1,
      'Page has og:description content');
    console.log(window.$('meta[property="og:description"]').attr('content'));
    assert(window.$('meta[property="og:image"]').attr('content').length >= 1,
      'Page has og:image content');
    console.log(window.$('meta[property="og:image"]').attr('content'));





    stats();
  }
})

function assert(condition, message) {
    assertions++;
    if (condition) {
        passed++;
        console.log('  ', colors.green(message));
    } else {
        console.log(colors.red('  Fail: ' + message));
    }
}

function stats() {
    console.log('');

    if (assertions == passed) {
        console.log(colors.green('Assertions: ' + assertions));
        console.log(colors.green('Passed:     ' + passed));
    } else {
        console.log(colors.red('Assertions: ' + assertions));
        console.log(colors.red('Passed:     ' + passed));
        process.exit(1);
    }
}

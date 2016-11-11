// Validator for the Hakkasan Group's Web Technical Requirements SOP:
// https://hakkasan.atlassian.net/wiki/display/ENG/SOP%3A+Web+Technical+Requirements

var jsdom = require('jsdom');
var colors = require('colors');

var assertions = 0;
var passed = 0;

jsdom.env({
  url: 'https://google.com',
  scripts: ['http://code.jquery.com/jquery.js'],
  done: function (err, window) {

    // A non-zero length page title is required.
    console.log('<title> : ', window.document.title);
    assert(window.$('title').length == 1,
      'A page title should exist');
    assert(window.document.title.length > 0,
      'The page title should include something');

    // A non-zero length meta description is required.
    console.log('<meta name="description" content => ',
      window.$('meta[name="description"]').attr('content'));
    assert(window.$('meta[name="description"]').attr('content').length > 0,
      'The page must include a <meta name="description" tag ',
      'with non-zero content.');

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

// Validator for the Hakkasan Group's Web Technical Requirements SOP:
// https://hakkasan.atlassian.net/wiki/display/ENG/SOP%3A+Web+Technical+Requirements

const jsdom = require('jsdom');
const colors = require('colors');
const w3cjs = require('w3cjs');
const yaml = require('js-yaml');
const fs = require('fs');

var failure = false;

// Read in urls from website.yml and set urlList variable/array accordingly
try {
  // var websiteList = yaml.safeLoad(fs.readFileSync('website.yml', 'utf8'));     // yaml file with only 1 url
  var websiteList = yaml.safeLoad(fs.readFileSync('website2.yml', 'utf8'));     // yaml file with multiple urls
  var urlList = websiteList.url;
  console.log("Scanning: " + urlList + "......");
} catch (e) {
  console.log(e);
}

// Send the urlList to functions that will use
// asynchrounous recursion to process them.
inspect(urlList);
// validateHTML(urlList);

function inspect(urlList) {

  // Clone the array because we're going to damage it.
  // https://davidwalsh.name/javascript-clone-array
  var inspectURLList = urlList.slice(0);

  var inspectURL = function() {

    if (!inspectURLList.length) endWithStatusCode();

    var url = inspectURLList.shift().toString();

    jsdom.env({
      url: url,
      scripts: ['http://code.jquery.com/jquery.js'],
      done: function (err, window) {

        if (err) {
          console.log(err);
          return;
        }

        console.log("Inspecting " + url + "...");

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
        console.log("Checking for Twitter Card tags...");
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
        console.log("Checking for Facebook Open Graph tags...");
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

        // Google Tag Manager required.
        console.log("Checking for Google Tag Manager script tags...");
        var gtmScript = window.$('head > script:contains("//www.googletagmanager.com/gtm.js?id=")');
        assert(gtmScript.length === 1,
          'Page has a Google Tag Manager <script> in the <head>');
        console.log(gtmScript.html());
        var gtmNoscript = window.$('body > noscript:contains("//www.googletagmanager.com/ns.html?id=")');
        assert(gtmNoscript.length === 1,
          'Page has a Google Tag Manager <noscript> in the <body>');
        console.log(gtmNoscript.html());

        // Marketo form required
        // console.log("Checking for Marketo form...");
        // var marketoForm = window.$('body > script[src="//app-ab06.marketo.com/js/forms2/js/forms2.min.js"]');
        // assert(marketoForm.length === 1,
        //   'Page has a Google Tag Manager <noscript> in the <body>');
        // console.log(marketoForm);

        // Log Assertions vs. Passed stats
        stats();

        // Inspect the next URL.
        inspectURL();
      }
    });
  }

  inspectURL();
}

function validateHTML(url) {
  var results = w3cjs.validate({
    file: url,
    output: 'json', // Defaults to 'json', other option includes html
    callback: function(res) {
      console.log("Beginning HTML Validation on " + url + "...");
      var errors = 0;
      var warnings = 0;
      for (i=0; i < res.messages.length; i++) {
        if ((res.messages[i].type === 'error') && (res.messages[i].subType !== 'warning')) {
          console.log(res.messages[i].type + ' : ' + res.messages[i].message);
          errors++;
        } else if ((res.messages[i].type === 'info') && (res.messages[i].subType === 'warning')) {
          console.log(res.messages[i].subType + ' : ' + res.messages[i].message);
          warnings++;
        }
      };
      console.log(errors + ' Errors!');
      console.log(warnings + ' Warnings!');
      assert(errors === 0,
        'W3C Validator should return 0 errors');
      //console.log(res);
    }
  });
}

// Initialize testing variables
var assertions = 0;
var passed = 0;

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
        failure = true;
    }
}

function endWithStatusCode() {
  if (failure == true) {
    console.log(colors.red('INSPECTION FAILED'));
    process.exit(1);
  } else {
    console.log(colors.green('INSPECTION PASSED'));
    process.exit();
  }
}

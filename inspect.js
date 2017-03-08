// Validator for the Hakkasan Group's Web Technical Requirements SOP:
// https://hakkasan.atlassian.net/wiki/display/ENG/SOP%3A+Web+Technical+Requirements

var async = require("async");
var jsdom = require('jsdom');
var colors = require('colors');
var w3cjs = require('w3cjs');
var yaml = require('js-yaml');
var fs = require('fs');
var util = require('util');
var request = require("request");
var cheerio = require("cheerio");
var parseUrl = require("url-parse");

var failure = false;

// grab website url from yaml file
try {
  var website = yaml.safeLoad(fs.readFileSync('website.yml', 'utf8'));
  var domain = website.url;
  console.log("Scanning: " + domain.join(", ") + "...\n");
} catch (e) {
  console.log(e);
}

// setting vars for crawler
var START_URL = domain;
var url = new parseUrl(domain);
var crawledURLs = [];
var pagesToInspect = [];
var baseUrl = url.protocol + "//" + url.hostname

// verify 'url' var holds correct value
console.log("Inspecting page " + url);

// request url
request(url.toString(), function(error, response, body) {
  if(error) {
    console.log("Error: " + error);
   }
  // Check status code (200 is HTTP OK)
  console.log("Status code: " + response.statusCode);
  if(response.statusCode === 200) {
    // Parse the document body
    var $ = cheerio.load(body);
    collectRelativeURLs($);
    inspect();
  }
});

// crawl starting url for relative urls and shove them into pagesToInspect
function collectRelativeURLs($) {
  var relativeLinks = $("a[href^='/']");
  relativeLinks.each(function() {
    crawledURLs.push(baseUrl + $(this).attr('href'));
  });
  pagesToInspect = crawledURLs.filter(function(elem, pos) {
    return crawledURLs.indexOf(elem) == pos;
  });
  console.log("Found " + pagesToInspect.length + " relative links:");
  if (pagesToInspect.length === 0) {
    pagesToInspect = START_URL;
  }
  console.log(pagesToInspect);
}

function inspect() {
  async.until(
    function() {
      console.log(pagesToInspect.length);
      //return;
      return !pagesToInspect.length;
    },

    function(callback) {
      var page = pagesToInspect.shift().toString();

      console.log("Inspecting URL: " + page + '\n');

      validateHTML(page);

      jsdom.env({
        url: page,
        scripts: ['http://code.jquery.com/jquery.js'],
        done: function (err, window) {

          if (err) {
            console.log(err);
            return;
          }

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
          console.log("\nChecking for Twitter Card tags...");

          var twitterCard = window.$('meta[name="twitter:card"]').attr('content');
          assert(twitterCard,
            'Page has twitter:card meta tag');
          if (twitterCard) {
            assert(twitterCard.length >= 1,
            'twitter:card meta tag has content');
            console.log(window.$('meta[name="twitter:card"]').attr('content'));
          }
          
          var twitterSite = window.$('meta[name="twitter:site"]').attr('content');
          assert(twitterSite,
            'Page has twitter:site meta tag');
          if (twitterSite) {
            assert(twitterSite.length >= 1,
            'twitter:site meta tag has content');
            console.log(window.$('meta[name="twitter:site"]').attr('content'));
          }

          var twitterCreator = window.$('meta[name="twitter:creator"]').attr('content');
          assert(twitterCreator,
            'Page has twitter:creator meta tag');
          if (twitterCreator) {
            assert(twitterCreator.length >= 1,
            'twitter:creator meta tag has content');
            console.log(window.$('meta[name="twitter:creator"]').attr('content'));
          }
          
          var twitterTitle = window.$('meta[name="twitter:title"]').attr('content');
          assert(twitterTitle,
            'Page has twitter:title meta tag');
          if (twitterTitle) {
            assert(twitterTitle.length >= 1,
            'twitter:title meta tag has content');
            console.log(window.$('meta[name="twitter:title"]').attr('content'));
          }

          var twitterDescription = window.$('meta[name="twitter:description"]').attr('content');
          assert(twitterDescription,
            'Page has twitter:description meta tag');
          if (twitterDescription) {
            assert(twitterDescription.length >= 1,
            'twitter:description meta tag has content');
            console.log(window.$('meta[name="twitter:description"]').attr('content'));
          }

          var twitterImage = window.$('meta[name="twitter:image"]').attr('content');
          assert(twitterImage,
            'Page has twitter:image meta tag');
          if (twitterImage) {
            assert(twitterImage.length >= 1,
            'twitter:image meta tag has content');
            console.log(window.$('meta[name="twitter:image"]').attr('content'));
          }

          // Facebook Open Graph tags required.
          console.log("\nChecking for Facebook Open Graph tags...");

          var ogUrl = window.$('meta[name="og:url"]').attr('content');
          assert(ogUrl,
            'Page has og:url meta tag');
          if (ogUrl) {
            assert(ogUrl.length >= 1,
            'og:url meta tag has content');
            console.log(window.$('meta[name="og:url"]').attr('content'));
          }

          var ogType = window.$('meta[name="og:type"]').attr('content');
          assert(ogType,
            'Page has og:type meta tag');
          if (ogType) {
            assert(ogType.length >= 1,
            'og:type meta tag has content');
            console.log(window.$('meta[name="og:type"]').attr('content'));
          }

          var ogTitle = window.$('meta[name="og:title"]').attr('content');
          assert(ogTitle,
            'Page has og:title meta tag');
          if (ogTitle) {
            assert(ogTitle.length >= 1,
            'og:title meta tag has content');
            console.log(window.$('meta[name="og:title"]').attr('content'));
          }

          var ogDescription = window.$('meta[name="og:description"]').attr('content');
          assert(ogDescription,
            'Page has og:description meta tag');
          if (ogDescription) {
            assert(ogDescription.length >= 1,
            'og:description meta tag has content');
            console.log(window.$('meta[name="og:description"]').attr('content'));
          }
          
          var ogImage = window.$('meta[name="og:image"]').attr('content');
          assert(ogImage,
            'Page has og:image meta tag');
          if (ogImage) {
            assert(ogImage.length >= 1,
            'og:image meta tag has content');
            console.log(window.$('meta[name="og:image"]').attr('content'));
          }
          
          // Google Tag Manager required.
          console.log("\nChecking for Google Tag Manager script tags...");
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

          callback(err, window);
        }
      });
    },
    function(err, windows) {
      endWithStatusCode();
    }
)};

function validateHTML(page) {
  var results = w3cjs.validate({
    file: page,
    output: 'json', // Defaults to 'json', other option includes html
    callback: function(res) {
      console.log("Beginning HTML Validation on " + page + "...");
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
    console.log('\n');
    assertions++;
    if (condition) {
        passed++;
        console.log(colors.green(message));
    } else {
        console.log(colors.red('ERROR: ' + message));
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
    console.log('\n---\n');
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

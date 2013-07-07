#!/usr/bin/env node
/*
Automatically grade files for the presence of specified HTML tags/attributes.
Uses commander.js and cheerio. Teaches command line application development
and basic DOM parsing.

References:

 + cheerio
   - https://github.com/MatthewMueller/cheerio
   - http://encosia.com/cheerio-faster-windows-friendly-alternative-jsdom/
   - http://maxogden.com/scraping-with-node.html

 + commander.js
   - https://github.com/visionmedia/commander.js
   - http://tjholowaychuk.com/post/9103188408/commander-js-nodejs-command-line-interfaces-made-easy

 + JSON
   - http://en.wikipedia.org/wiki/JSON
   - https://developer.mozilla.org/en-US/docs/JSON
   - https://developer.mozilla.org/en-US/docs/JSON#JSON_in_Firefox_2
*/

var fs = require('fs');
var program = require('commander');
var cheerio = require('cheerio');
var HTMLFILE_DEFAULT = "index.html";
var CHECKSFILE_DEFAULT = "checks.json";
var URL_DEFAULT = "http://shrouded-beach-3400.herokuapp.com/";

var sys = require('util');
var rest = require('restler');

var assertFileExists = function(infile) {
    var instr = infile.toString();
    if(!fs.existsSync(instr)) {
	console.log("%s does not exist. Exiting.", instr);
	process.exit(1); // http://nodejs.org/api/process.html#process_process_exit_code
    }
    return instr;
};

var cheerioHtmlFile = function(htmlfile) {
    return cheerio.load(fs.readFileSync(htmlfile));
};

var loadChecks = function(checksfile) {
    return JSON.parse(fs.readFileSync(checksfile));
};

var checkHtmlURL = function(htmlurl, checksfile) {
    var out = {};

    rest.get(htmlurl).on('complete', function(result) {
       if (result instanceof Error) {
         sys.puts('Error: ' + result.message);
         this.retry(5000); // try again after 5 sec
       } else {
          //sys.puts(result);

      //$ = cheerioHtmlFile(htmlfile);
      //console.log("result" , result);
      $ = cheerio.load(result);
      //$ = cheerioHtmlFile(htmlfile);
      var checks = loadChecks(checksfile).sort();
      for(var ii in checks) {
  	var present = $(checks[ii]).length > 0;
	out[checks[ii]] = present;
        //console.log(ii , out[checks[ii]]);
      }
    //console.log(out);
    console.log(JSON.stringify(out, null, 4));

    return out;
     }
      
    });
};

var checkHtmlFile = function(htmlfile, checksfile) {
    $ = cheerioHtmlFile(htmlfile);
    var checks = loadChecks(checksfile).sort();
    var out = {};
    for(var ii in checks) {
	var present = $(checks[ii]).length > 0;
	out[checks[ii]] = present;
    }
    return out;
};

var clone = function(fn) {
    // Workaround for commander.js issue.
    // http://stackoverflow.com/a/6772648
    return fn.bind({});
};

function sleep(time) {
  var d1 = new Date().getTime();
  var d2 = new Date().getTime();
  while (d2 < d1 + time) {
    d2 = new Date().getTime();
   }
   return;
}

if(require.main == module) {
    program
	.option('-f, --file <html_file>', 'Path to index.html', clone(assertFileExists), HTMLFILE_DEFAULT)
	.option('-u --url <url>', 'url', null , URL_DEFAULT)
	.option('-c, --checks <check_file>', 'Path to checks.json', clone(assertFileExists), CHECKSFILE_DEFAULT)
	.parse(process.argv);

    //if( program.file && program.checks ){

      //var checkJson = checkHtmlFile(program.file, program.checks);
      //var outJson = JSON.stringify(checkJson, null, 4);

      //console.log(outJson);
      //console.log("DEBUG:" , program.file , program.checks,program.url,program.argc);

      var checkJson = checkHtmlURL(program.url, program.checks);
      //sleep(2000);
      //console.log("checkJson= " , checkJson);
      var outJson = JSON.stringify(checkJson, null, 4);
      //console.log(outJson);
      //console.log("outJson=" , outJson);
  
     //    }
    //else if( pgorgram.url && program.checks){
    //  console.log("here");
    //}
} else {
    exports.checkHtmlFile = checkHtmlFile;
}

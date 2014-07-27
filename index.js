var program = require('commander'),
	fs = require('fs'),
	version = require('./package.json').version;

//read the pack logic files.
fs.readdirSync(__dirname + '/lib/packer').forEach(function (filename) {
  if (!/.js$/.test(filename)) 
    return;
    require(__dirname + '/lib/packer/' + filename);
});

program
	.version(version)
	.parse(process.argv);

if (!program.args.length) program.help();


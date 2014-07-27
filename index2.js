var program = require('commander');

program.version("0.0.1");

program
	.command('haha')
	.action(function() {
  		console.log("-=-=-=--=-");
	});

program.parse(process.argv);

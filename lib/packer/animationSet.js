var program = require('commander'),
	path = require('path'),
	util = require('util'),
	constant = require('../constant.js'),
	scriptName = path.basename(__filename, '.js');

program.command(scriptName)
	.description('pack ' + scriptName + 'file format.')
	.option('-a, --atf', 'use atf texture format?')
	.option('-d, --directory <directory>', 'source of resource file or resource parent dir.')
	.option('-b, --batch', 'if use batch it means the source is the parent dir.')
	.option('-o, --outputParentDir', 'default out is cur dir, or parent dir.')
  	.action(onCommand);

function onCommand(opts) {
	var useAtf = opts.atf;
	var directory = opts.directory;
	var useBatch = opts.batch;
	var isOutputParentDir = opts.outputParentDir;

	if(useBatch) {
		
	}
	else {
		packAsset(directory, useBatch, isOutputParentDir);
	}
}

function packAsset(assetDirPath, useBatch, isOutputParentDir) {
	var artDir = assetDirPath + "/art";
	var artDirFile =  

}
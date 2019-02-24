'use strict'
const loadConfig = require('./load-config'),
	build = require('./lib/build'),
	deploy = require('./lib/deploy')

console.time('build-deploy')
console.log('BEGIN')
var config = loadConfig(process.argv)
if(!config){
	process.exit()
}

build(config).then(() =>
deploy(config), err => Promise.reject(err)).then(() =>
console.timeEnd('build-deploy'), err => console.log(err || 'ERROR occured'))
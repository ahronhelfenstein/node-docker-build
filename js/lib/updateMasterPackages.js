'use strict'
const updateMasterPackage = require('./updateMasterPackage'),
	{resolve, basename, join} = require('path'),
	throat = require('throat')(4),
	dockerCompose = require('./dockerCompose'),
	{promisify} = require('util'),
	fs = require('fs'),
	copyFile = promisify(fs.copyFile),
	spawnCommand = require('./spawnCommand'),
	buildArgs = require('./buildArgs'),
	wdName = 'working-dir'

//update master branch of all own packages (masterPackages)
module.exports = async ({
	masterPackages, workingDir, target, baseImage, sshHosts
}) => {

	var packageDir = resolve(workingDir, '..', '..'),
		wd = resolve(packageDir, wdName)
	await Promise.all(Object.keys(masterPackages).reduce((acc, scope) => {
		masterPackages[scope].packages.forEach(val => {
			var {name, uri} = typeof val === 'string' ? {name:val} : val
			acc.push( throat(() => updateMasterPackage({
				baseDir: resolve(wd, '_master-packages'),
				...masterPackages[scope], scope, name, uri
			})))
		})
		return acc
	}, []))
	await Promise.all(['docker-compose.yml', 'Dockerfile-master']
		.map( file => copyFile(
			resolve(__dirname, 'docker', file),
			resolve(wd, file)
		))
	)
	var args = {BASE_IMAGE:baseImage, SSH_HOSTS:sshHosts},
		subPath = join(basename(packageDir), wdName)
	await spawnCommand(
		`${dockerCompose((target||{}).home, subPath)} build ${buildArgs(args)}`,
		wd
	)
}

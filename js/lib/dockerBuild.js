'use strict'
const path = require('path'),
	{DOCKER_HOST} =  process.env,
	cp = require('child_process'),
	buildArg = require('./buildArgs'),
	{platform} = require('os')

module.exports = config => new Promise((res, rej) => {
	var {repository, domain, target, buildArgs, push, buildCache} = config,
		{scope, name, domainDir} = repository,
		{home} = target || {},
		subPath = `${scope}/${name}/${domainDir}/${domain}`,
		dir = path.resolve(config.baseDir, subPath),
		compose = (cmd, args='') => (
			DOCKER_HOST ?
				`docker run --rm -v /var/run/:/var/run -v ${home}:${home} -v ${home}:/root -v domains:/wd -w /wd/${subPath} docker/compose:1.23.2`
				: 'docker-compose'
		) + ` ${args} ${cmd} ${(cmd==='build' && buildArgs) ? buildArg(buildArgs):''}`,
		buildCacheCommand = buildCache ? `${compose('build', '-f docker-compose-build-cache.yml')} && ` : '',
		pushCommand = push ? ` && ${compose('push')} --ignore-push-failures ` : '',
		exe = platform() === 'win32' ? 'PowerShell.exe -NonInteractive -Command ' : '',
		command = `${exe}${buildCacheCommand}${compose('build')}${pushCommand}`

	console.log(command)
	cp.spawn( command, {cwd:dir, stdio:'inherit', shell:true} )
		.on('exit', code => code === 0 ? res() : rej(new Error({code})))
		.on('error', err => rej(new Error(err)))
})

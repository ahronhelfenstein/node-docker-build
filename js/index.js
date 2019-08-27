'use strict'
const {spawn} = require('child_process'),
	debug = require('debug')('node-docker-build'),
	processList = {}

const call = args => {
	var {script, moduleName, domain, logPath, cwd, detach} = args,
		startProcess = `node ${script} ${moduleName} ${domain} > ${logPath}_${script}.log 2>&1`

	if(detach === false){
		return callSync(args)
	}

	if(processList[script]){
		processList[script].kill('SIGKILL')
	}

	debug(`spawn command: ${startProcess}`)
	processList[script] = spawn(
		startProcess,
		{
			cwd,
			shell:true,
			detach:true,
			stdio:'ignore',
			env:{...process.env, NODE_ENV:'development'}
		}
	)
}

const callSync = ({script, moduleName, domain, cwd}) => {
	var startProcess = `node ${script} ${moduleName} ${domain||''}`
	debug(`spawn command: ${startProcess}`)
	spawn(
		startProcess,
		{
			cwd,
			shell:true,
			stdio:'inherit',
			env:{...process.env, NODE_ENV:'development'}
		}
	)
}

module.exports = {
	singletonExec: config => call({...config}),
	build: config => call({script:'build', ...config}),
	deploy: config => call({script:'deploy', ...config}),
	buildDeploy: config => call({script:'build-deploy', ...config})
}
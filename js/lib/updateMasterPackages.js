'use strict'
const updateMasterPackage = require('./updateMasterPackage'),
	path = require('path'),
	throat = require('throat')(4)

//update master branch of all own packages (masterPackages)
module.exports = ({domain, masterPackages, baseDir, repository}) => Promise.all(
	Object.keys(masterPackages).reduce((acc, scope) => {
		masterPackages[scope].packages.forEach(val => {
			var pckge = typeof val === 'string' ? {name:val} : val,
				{name, uri} = pckge
			acc.push( throat(() => updateMasterPackage({
				baseDir: path.resolve(
					baseDir, repository.scope, repository.name, repository.domainDir||'',
					domain, '_dev'
				),
				...masterPackages[scope], scope, name, uri
			})))
		})
		return acc
	}, [])
)

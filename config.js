var environments = {};

environments.staging = {
	'httpPort': 3000,
	'httpsPort': 3001,
	'envName': 'staging'
}

environments.production = {
	'httpPort': 80,
	'httpsPort': 443,
	'envName': 'production'
}

let currentEnvironment = typeof(process.env.NODE_ENV) === 'string' ? process.env.NODE_ENV.toLowerCase() : '';

let environmentExport = typeof(environments[currentEnvironment]) === 'object' ? environments[currentEnvironment] : environments.staging;

module.exports = environmentExport;
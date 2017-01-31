'use strict';

var chalk = require('chalk');
var path = require('path');

var pluralize = function(word, count) {
	return count === 1 ? word : word + 's';
};

var docUrls = {
	default: {
		prefix: 'http://eslint.org/docs/rules/',
		suffix: ''
	},
	import: {
		prefix: 'https://github.com/benmosher/eslint-plugin-import/tree/master/docs/rules/',
		suffix: '.md'
	}
};

var docsUrl = function(message) {

	if (!message.ruleId) {
		return false;
	}

	var
		ruleId = message.ruleId.split('/'),
		isPlugin = ruleId.length > 1,
		docs = docUrls[ruleId[0]];

	if (isPlugin && !docs) {
		return false;
	}

	docs = docs || docUrls.default;

	return [
		docs.prefix,
		ruleId[isPlugin ? 1 : 0],
		docs.suffix
	].join('');

};

module.exports = function(opts) {
	return function(results) {

		var
			summary = [],
			counts = {
				file: 0,
				error: 0,
				failure: 0,
				pass: 0,
				warning: 0
			},
			error = false;

		results.forEach(function(result) {

			if (result.messages.length) {

				counts.failure++;
				counts.warning += result.warningCount;
				counts.error += result.errorCount;

				if (result.errorCount && !error) {
					error = result;
				}

			} else {

				counts.pass++;

			}

		});

		counts.file = counts.pass + counts.failure;

		summary.push([
			'JaveScript Summary:',
			counts.file + ' ' + pluralize('file', counts.file) + ' checked.',
			counts.pass + ' passed.'
		].join(' '));

		if (counts.error || counts.warning) {
			summary.push(chalk[counts.error ? 'red' : 'yellow'].bold(counts.failure + ' failed.'));
		}

		['error', 'warning'].forEach(function(type) {

			if (counts[type]) {

				summary.push(
					chalk[type === 'error' ? 'red' : 'yellow'].bold([
						counts[type],
						pluralize(type, counts[type]) + '.'
					].join(' '))
				);

			}

		});

		if (error) {

			for (var i = 0; i < error.messages.length; i++) {

				if (error.messages[i].severity <= 1) {
					continue;
				}

				if (!opts.hideErrors) {

					summary.push([
						chalk.red(path.parse(error.filePath).base),
						chalk.red(error.messages[i].line + ':' + error.messages[i].column),
						chalk.red.bold(error.messages[i].message),
					].join(' '));

				}

				var url = docsUrl(error.messages[i]);

				if (url) {
					summary.push(url);
				}

				break;

			}

		}

		return summary.join(' ');

	};
};

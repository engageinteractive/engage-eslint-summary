'use strict';

var chalk = require('chalk');
var path = require('path');

var pluralize = function(word, count) {
	return count === 1 ? word : word + 's';
};

module.exports = function(results) {

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

			if (result.errorCount) {
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
		summary.push(chalk.yellow.bold(counts.failure + ' failed.'));
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
		var message = error.messages[0];
		summary.push([
			'\r\n' + chalk.red(path.parse(error.filePath).base),
			chalk.red(message.line + ':' + message.column),
			chalk.red.bold(message.message),
		].join(' '));

	}

	return summary.join(' ');

};

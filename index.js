
var Batch = require('batch');
var component = require('component');
var each = require('each-component');


/**
 * Expose `outdated`.
 */

module.exports = outdated;


/**
 * Return a dictionary of outdated components given a `json`.
 *
 * @param {Object} json
 * @param {Function} callback
 */

function outdated (json, callback) {
  var batch = new Batch();
  var deps = json.dependencies || {};

  each(deps, function (repo, version) {
    if (version === '*' || version === 'master') return;
    batch.push(function (done) {
      component.info(repo, 'master', function (err, json) {
        if (err) return done(err);
        done(null, {
          repo: repo,
          local: version,
          remote: json.version
        });
      });
    });
  });

  batch.end(function (err, res) {
    if (err) return callback(err);
    callback(null, clean(res));
  });
}


/**
 * Clean the result, turning it into an object and removing up-to-dates.
 *
 * @param {Array} result
 * @return {Object}
 */

function clean (result) {
  var ret = {};

  result.forEach(function (dep) {
    if (dep.local === dep.remote) return;
    ret[dep.repo] = {
      local: dep.local,
      remote: dep.remote
    };
  });

  return ret;
}
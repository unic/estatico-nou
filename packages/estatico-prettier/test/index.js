const glob = require('glob')
const path = require('path')
const fs = require('fs')
const should = require('should') // eslint-disable-line
const del = require('del')

module.exports = {
  before: function (done) {
    const config = {
      src: './test/fixtures/*',
      srcBase: './test/fixtures/',
      dest: './test/results/',
      plugins: {
        prettier: {
          singleQuote: false
        }
      }
    }

    const task = require('../index.js')(config)

    task.fn().on('end', done)
  },

  default: function () {
    const expected = glob.sync(path.join(__dirname, '/expected/**/*'), {
      nodir: true
    })

    expected.forEach((filePath) => {
      const expectedFile = fs.readFileSync(filePath).toString()
      const resultedFile = fs.readFileSync(filePath.replace('expected', 'results')).toString()

      expectedFile.should.be.eql(resultedFile)
    })
  },

  after: function (done) {
    del(path.join(__dirname, '/results')).then(() => done())
  }
}

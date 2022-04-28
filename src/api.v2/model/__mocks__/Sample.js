const BasicModel = require('./BasicModel')();

const stub = {
  setNewFile: jest.fn(),
  ...BasicModel,
};

const Sample = jest.fn().mockImplementation(() => stub);

module.exports = Sample;

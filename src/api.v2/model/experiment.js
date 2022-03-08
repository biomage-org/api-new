// const sqlClient = require('../../SQL/sqlClient').get();

const createGuts = require('../helpers/modelGuts');

const tableName = 'experiment';

const selectableProps = [
  'id',
  'name',
  'description',
  'processing_config',
  'notify_by_email',
  'created_at',
  'updated_at',
];

const guts = createGuts({
  tableName,
  selectableProps,
});

module.exports = {
  ...guts,
  // create: async (id, name, description) => {
  //   await sqlClient.insert({
  //     id, name, description,
  //   }).into(tableName);
  // },
};

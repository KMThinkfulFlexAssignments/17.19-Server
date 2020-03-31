'use strict';

const knex = require('knex');
const app = require('../src/app');
const { makeFoldersArray, makeMaliciousFolder } = require('./folders.fixtures');
const { makeNotesArray, makeMaliciousNote } = require('./notes.fixtures');

describe('Noteful Endpoints', function() {
  let db;

  before('make knex instance', () => {

    db = knex({
      client: 'pg',
      connection: process.env.TEST_DB_URL,
    });
    app.set('db', db);
    
  });

  after('dissconnect from db', () => db.destroy());

  before('clear the tables', () => db.raw('TRUNCATE folders, notes RESTART IDENTITY CASCADE'));

  afterEach('cleanup', () => db.raw('TRUNCATE folders, notes RESTART IDENTITY CASCADE'));

  //describe GET /api/folders
});
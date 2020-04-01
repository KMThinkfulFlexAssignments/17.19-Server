'use strict';

const knex = require('knex');
const app = require('../src/app');
const { makeFoldersArray, makeMaliciousFolder } = require('./folders.fixtures');
const { makeNotesArray, makeMaliciousNote } = require('./notes.fixtures');

describe('Folder Endpoints', function() {
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

  describe('GET /api/folders', () => {
    context('Given no folders', () => {
      it('responds with 200 and an empty array', () => {
        return supertest(app)
          .get('/api/folders')
          .expect(200, []);
      });
    });
  });

  context('Given there are folders in the database', () => {
    const testFolders = makeFoldersArray();
    const testNotes = makeNotesArray();

    beforeEach('insert folders', () => {
      return db
        .into('folders')
        .insert(testFolders)
        .then(() => {
          return db
            .into('notes')
            .insert(testNotes);
        });
    });

    it('responds with 200 and all the folders', () => {
      return supertest(app)
        .get('/api/folders')
        .expect(200, testFolders);
    });
  });

  //returning undefined
  context('Given an XSS attack folder', () => {
    const { maliciousFolder, expetedFolder } = makeFoldersArray();

    beforeEach('insert malicious folder', () => {
      return db
        .into('folders')
        .insert([ maliciousFolder ]);
    });

    it('removes XSS attack content', () => {
      return supertest(app)
        .get('/api/folders')
        .expect(200)
        .expect(res => {
          expect(res.body[0].folder_name).to.eql(expetedFolder.folder_name);
        });
    });
  });
});
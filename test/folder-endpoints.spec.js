'use strict';

const knex = require('knex');
const app = require('../src/app');
const { makeFoldersArray, makeMaliciousFolder } = require('./folders.fixtures');

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

    beforeEach('insert folders', () => {
      return db
        .into('folders')
        .insert(testFolders);
    });

    it('responds with 200 and all the folders', () => {
      return supertest(app)
        .get('/api/folders')
        .expect(200, testFolders);
    });
  });

  context('Given an XSS attack folder', () => {
    const { maliciousFolder, expectedFolder } = makeMaliciousFolder();

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
          expect(res.body[0].folder_name).to.eql(expectedFolder.folder_name);
        });
    });
  });

  describe('GET /api/folders/:folder_id', () => {
    context('Given no folders', () => {
      it('responds with 404', () => {
        const folderId = 123456;
        return supertest(app)
          .get(`/api/folders/${folderId}`)
          .expect(404, { error: { message: 'Folder does not exist' } });
      });
    });

    context('Given there are folders in the database', () => {
      const testFolders = makeFoldersArray();

      beforeEach('insert folders', () => {
        return db
          .into('folders')
          .insert(testFolders);
      });

      it('responds with 200 and the specified folder', () => {
        const folderId = 2;
        const expectedFolder = testFolders[folderId - 1];

        return supertest(app)
          .get(`/api/folders/${folderId}`)
          .expect(200, expectedFolder);
      });
    });

    context('Given an XSS attack folder', () => {
      const { maliciousFolder, expectedFolder } = makeMaliciousFolder();

      beforeEach('insert malicious folder', () => { 
        return db
          .into('folders')
          .insert([ maliciousFolder ]);
      });

      it('removes XSS attack content', () => {
        return supertest(app)
          .get(`/api/folders/${maliciousFolder.id}`)
          .expect(200)
          .expect(res => {
            expect(res.body.folder_name).to.eql(expectedFolder.folder_name);
          });
      });
    });
  });

  describe('POST /api/folders', () => {
    const testFolders = makeFoldersArray();
    beforeEach('insert folders', () => {
      return db
        .into('folders')
        .insert(testFolders);
    });

    it('creates a folder, responding with 201 and the new folder', () => {
      const newFolder = {
        id: 12,
        folder_name: 'Test folder'
      };
      return supertest(app)
        .post('/api/folders')
        .send(newFolder)
        .expect(201)
        .expect(res => {
          expect(res.body).to.have.property('id');
          expect(res.body.folder_name).to.eql(newFolder.folder_name);
          expect(res.headers.location).to.eql(`/api/folders/${res.body.id}`);
        })
        .then(res => 
          supertest(app)
            .get(`/api/folders/${res.body.id}`)
            .expect(res.body)
        );
    });

    it('responds with 400 and an error message when the \'folder_name\' field is missing', () => {
      return supertest(app)
        .post('/api/folders')
        .send({})
        .expect(400, {
          error: { message: 'Missing \'folder_name\' in request body' }
        });
    });

    it('removes XSS attack content from response', () => {
      const { maliciousFolder, expectedFolder } = makeMaliciousFolder();
      return supertest(app)
        .post('/api/folders')
        .send(maliciousFolder)
        .expect(201)
        .expect(res => {
          expect(res.body.folder_name).to.eql(expectedFolder.folder_name);
        });
    });
  });

  describe('DELETE /folders/:folder_id', () => {
    context('Given no folders', () => {
      it('responds with 404', () => {
        const folderId = 123456;
        return supertest(app)
          .delete(`/api/folders/${folderId}`)
          .expect(404, { error: { message: 'Folder does not exist' } });
      });
    });

    context('Given there are folders in the database', () => {
      const testFolders = makeFoldersArray();

      beforeEach('insert folders', () => {
        return db
          .into('folders')
          .insert(testFolders);
      });

      it('responds with 204 and removes the folder', () => {
        const idToRemove = 2;
        const expectedFolders = testFolders.filter(folder => folder.id !== idToRemove);
        return supertest(app)
          .delete(`/api/folders/${idToRemove}`)
          .expect(204)
          .then(res =>
            supertest(app)
              .get('/api/folders')
              .expect(expectedFolders)
          );
      });
    });
  });

  describe('PATCH /api/folders/:folder_id', () => {
    context('Given no folders', () => {
      it('responds with 404', () => {
        const folderId = 123456;
        return supertest(app)
          .delete(`/api/folders/${folderId}`)
          .expect(404, { error: { message: 'Folder does not exist' } });
      });
    });

    context('Given there are folders in the database', () => {
      const testFolders = makeFoldersArray();
      
      beforeEach('insert folders', () => {
        return db
          .into('folders')
          .insert(testFolders);
      });

      it('responds with 204 and updates the folder', () => {
        const idToUpdate = 2;
        const updatedFolder = {
          folder_name: 'updated folder name'
        };
        const expectedFolder = {
          ...testFolders[idToUpdate - 1],
          ...updatedFolder
        };
        return supertest(app)
          .patch(`/api/folders/${idToUpdate}`)
          .send(updatedFolder)
          .expect(204)
          .then(res => {
            supertest(app)
              .get(`/api/folders/${idToUpdate}`)
              .expect(expectedFolder);
          });
      });

      //responds with 500 instead of 400, also tests dont close anymore
      it('responds with 400 when no required fields are supplied', () => {
        const idToUpdate = 2;
        return supertest(app)
          .patch(`/api/folders/${idToUpdate}`)
          .send({ irrelevantField: 'foo' })
          .expect(400, {
            error: {
              message: 'Request body must contain \'folder name\''
            }
          });
      });

      //responds with 500 instead of 204
      it('responds with 204 when updating a field', () => {
        const idToUpdate = 2;
        const updatedFolder = {
          folder_name: 'updated folder name'
        };
        const expectedFolder = {
          ...testFolders[idToUpdate - 1],
          ...updatedFolder
        };

        return supertest(app)
          .patch(`/api/folders/${idToUpdate}`)
          .send({
            ...updatedFolder,
            fieldToIgnore: 'should not be in the GET response'
          })
          .expect(204)
          .then(res => 
            supertest(app)
              .get(`/api/folders/${idToUpdate}`)
              .expect(expectedFolder)
          );
      });
    });
  });
});

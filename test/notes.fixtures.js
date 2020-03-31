'use strict';

function makeNotesArray() {
  return [
    {
      id: 1,
      note_name: 'Squirtle',
      date_modified: '2029-01-22T16:28:32.615Z',
      content: 'Squirtle, Wartortle, Blastoise',
      folder_id: 2
    },
    {
      id: 2,
      note_name: 'Charmander',
      date_modified: '2100-05-22T16:28:32.615Z',
      content: 'Charmander, Charmeleon, Charizzard',
      folder_id: 1
    },
    {
      id: 3,
      note_name: 'Bulbasaur',
      date_modified: '1919-12-22T16:28:32.615Z',
      content: 'Bulbasaur, Ivysaur, Venusaur',
      folder_id: 3
    },
    {
      id: 4,
      note_name: 'Ponyta',
      date_modified: '2029-01-22T16:28:32.615Z',
      content: 'Ponyta, Rapidash',
      folder_id: 1
    },
    {
      id: 5,
      note_name: 'Shellder',
      date_modified: '2029-01-22T16:28:32.615Z',
      content: 'Shellder, Cloyster',
      folder_id: 2
    },
    {
      id: 6,
      note_name: 'Tangela',
      date_modified: '1919-12-22T16:28:32.615Z',
      content: 'Just this one bro',
      folder_id: 3
    }
  ];
}

function makeMaliciousNote() {
  const maliciousNote = {
    id: 911,
    note_name: 'Naughty naughty very naughty <script>alert("xss");</script>',
    date_modified: new Date().toISOString(),
    content: 'Bad image <img src="https://url.to.file.which/does-not.exist" onerror="alert(document.cookie);">. But not <strong>all</strong> bad.'
    //folder_id maybe?
  };
  const expectedNote = {
    ...maliciousNote,
    note_name: 'Naughty naughty very naughty &lt;script&gt;alert(\"xss\");&lt;/script&gt;',
    content: 'Bad image <img src="https://url.to.file.which/does-not.exist">. But not <strong>all</strong> bad.'
  };
  return {
      maliciousNote,
      expectedNote
  };
}

module.exports = {
    makeNotesArray,
    makeMaliciousNote
}
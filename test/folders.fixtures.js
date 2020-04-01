'use strict';

function makeFoldersArray() {
  return [
    {
      id: 1,
      folder_name: 'Fire'
    },
    {
      id: 2,
      folder_name: 'Water'
    },
    {
      id: 3,
      folder_name: 'Grass'
    }
  ];
}

function makeMaliciousFolder() {
  const maliciousFolder = {
    id: 911,
    folder_name: 'Naughty naughty very naughty <script>alert("xss");</script>'
  };
  const expectedFolder = {
      ...maliciousFolder,
      folder_name: 'Naughty naughty very naughty &lt;script&gt;alert(\"xss\");&lt;/script&gt;'
  };
  return {
      maliciousFolder,
      expectedFolder
  };
}

module.exports = {
    makeFoldersArray,
    makeMaliciousFolder
};
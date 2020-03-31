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
  const maliciousFoler = {
    id: 911,
    title: 'Naughty naughty very naughty <script>alert("xss");</script>'
  };
  const expectedFolder = {
      ...maliciousFoler,
      title: 'Naughty naughty very naughty &lt;script&gt;alert(\"xss\");&lt;/script&gt;'
  };
  return {
      maliciousFoler,
      expectedFolder
  };
}

module.exports = {
    makeFoldersArray,
    makeMaliciousFolder
};
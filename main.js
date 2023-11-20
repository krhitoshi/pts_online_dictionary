let data = null;

// load ptsd.json
const loadJSON = (callback) => {
  const file = 'ptsd.json';
  let ptsd = null;
  const xhr = new XMLHttpRequest();
  xhr.open('GET', file, true);

  // execute callback to treat with the JSON data
  xhr.onload = () => {
    if (xhr.status === 200) {
      console.log(`Successfully loaded ${file}`);
      ptsd = xhr.responseText;
      callback(ptsd);
    } else {
      console.log(`Request failed. Returned status of ${xhr.status}`);
    }
  };

  xhr.send(null);
};

// display the number of definitions
const displayNumDefinitions = (data) => {
  const numDefinitions = document.getElementById('num-definitions');
  numDefinitions.innerHTML = `${data.length} definitions`;
};

// display the definitions
const displayDefinitions = (data) => {
  const table = document.getElementById('definitions');
  data.forEach((item, index) => {
    const row = table.insertRow(index + 1);
    const headword = row.insertCell(0);
    headword.className = "headword";
    headword.innerHTML = item.headword;
    const definition = row.insertCell(1);
    definition.innerHTML = item.definition;
    // add memo into definition if memo is not empty
    if (item.memo !== '') {
      definition.innerHTML += `<hr>${item.memo}`;
    }
  });
};

// display only the definitions that match the search keyword
function searchHeadword() {
  deleteDefinitions();
  // get the search headword
  const searchHeadword = document.getElementById('search').elements[0].value;

  // do nothing if the search keyword is empty
  if (searchHeadword === '') {
    hideDefinitionTable();
    return;
  }

  // filter the data based on the search keyword
  const newData = data.filter((definition) => {
    const headword = definition.headword;

    if ( getAccentMode() === 'insensitive' ) {
      // accent insensitive
      const normalizedHeadword = normalizeString(headword);
      const normalizedSearchHeadword = normalizeString(searchHeadword);
      return matchHeadword(normalizedHeadword, normalizedSearchHeadword);
    }
    else {
      // accent sensitive
      return matchHeadword(headword, searchHeadword);
    }
  });

  // hide the table if there is no definition
  if (newData.length === 0) {
    hideDefinitionTable();
  } else {
    updateNumDefinitions(newData.length);
    displayDefinitions(newData);
    showDefinitionTable();
  }
}

// match the search keyword with the headword
const matchHeadword = (headword, searchHeadword) => {
    const matchMode = getMatchMode();
    if ( matchMode === 'forward' ) {
      return headword.startsWith(searchHeadword);
    } else if ( matchMode === 'exact' ) {
      return headword === searchHeadword;
    } else {
      return headword.endsWith(searchHeadword);
    }
};

// append a message to the status element
const status = (message) => {
  document.getElementById('status').innerHTML += `${message}<br>`;
};

// clear the status element
const clearStatus = () => {
  document.getElementById('status').innerHTML = '';
};

// show the table
const showDefinitionTable = () => {
  show('definitions');
  show('num-definitions');
};

// hide the table
const hideDefinitionTable = () => {
  hide('definitions');
  hide('num-definitions');
};

// delete definitions
function deleteDefinitions() {
  const table = document.getElementById('definitions');
  const numRows = table.rows.length;
  for (let i = 1; i < numRows; i++) {
    table.deleteRow(1);
  }
}

// update num-definitions
const updateNumDefinitions = (numDefinitions) => {
  document.getElementById('num-definitions').innerHTML = `${numDefinitions} definitions`;
};

// get accent mode radio button value
const getAccentMode = () => {
  return document.querySelector('input[name="accent-mode"]:checked').value;
};

// get match mode radio button value
const getMatchMode = () => {
  return document.querySelector('input[name="match-mode"]:checked').value;
};

// show an element
const show = (id) => {
  document.getElementById(id).style.display = '';
};

//hide an element
const hide = (id) => {
  document.getElementById(id).style.display = 'none';
};

// normalize string
const normalizeString = (str) => {
  return str.normalize('NFD').replace(/[\u0300-\u036f]/g, "");
}

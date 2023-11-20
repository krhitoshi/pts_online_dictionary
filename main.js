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
  let searchKeyword = getSearchKeyword();
  let regexBase = searchKeyword.replace(/[aā]/g, '[aā]');
  regexBase = regexBase.replace(/[iī]/g, '[iī]');
  regexBase = regexBase.replace(/[uū]/g, '[uū]');
  regexBase = regexBase.replace(/[ṅñṇnn]/g, '[ṅñṇnn]');
  regexBase = regexBase.replace(/[ṃmṁ]/g, '[ṃmṁ]');
  regexBase = regexBase.replace(/[ṭt]/g, '[ṭt]');
  regexBase = regexBase.replace(/[ḍd]/g, '[ḍd]');
  regexBase = regexBase.replace(/[ḷl]/g, '[ḷl]');
  regexBase = regexBase.replace(/[ḥh]/g, '[ḥh]');
  const regex = new RegExp(regexBase, 'gi');

  data.forEach((item, index) => {
    const row = table.insertRow(index + 1);
    const headword = row.insertCell(0);
    headword.className = "headword";

    // highlight the search keyword
    headword.innerHTML = highlight(searchKeyword, regex, item.headword);
    const definition = row.insertCell(1);
    definition.innerHTML = highlight(searchKeyword, regex, item.definition);
    // add memo into definition if memo is not empty
    if (item.memo !== '') {
      definition.innerHTML += `<hr>${highlight(searchKeyword, regex, item.memo)}`;
    }
  });
};

const headwordFilter = (condition, headword, keyword) => {
  if (condition.accentMode === 'insensitive') {
    // accent insensitive
    const normalizedHeadword = normalizeString(headword);
    const normalizedSearchHeadword = normalizeString(keyword);
    return matchHeadword(condition, normalizedHeadword, normalizedSearchHeadword);
  } else {
    // accent sensitive
    return matchHeadword(condition, headword, keyword);
  }
};

const definitionFilter = (condition, definition, keyword) => {
  if (condition.accentMode === 'insensitive') {
    // accent insensitive
    const normalizedDefinition = normalizeString(definition);
    const normalizedSearchHeadword = normalizeString(keyword);
    return matchDefinition(normalizedDefinition, normalizedSearchHeadword);
  } else {
    // accent sensitive
    return matchDefinition(definition, keyword);
  }
};

// get search keyword
const getSearchKeyword = () => {
  return document.getElementById('keyword').value;
};

// display only the definitions that match the search keyword
const searchHeadword = () => {
  deleteDefinitions();
  // get the search headword
  const searchKeyword = getSearchKeyword();

  // do nothing if the search keyword is empty
  if (searchKeyword === '') {
    hideDefinitionTable();
    return;
  }

  const condition = { "matchMode": getMatchMode(),
    "accentMode": getAccentMode(),
    "includeDefinitionMode": getIncludeDefinitionMode() };

  // filter the data based on the search keyword
  const newData = data.filter((definition) => {

    const result = headwordFilter(condition, definition.headword, searchKeyword);

    if ( result ) {
      return true;
    } else if ( condition.includeDefinitionMode ) {
      return definitionFilter(condition, definition.definition, searchKeyword);
    } else {
      return false;
    }
  });

  // hide the table if no definition matches the search keyword
  if (newData.length === 0) {
    hideDefinitionTable();
  } else {
    updateNumDefinitions(newData.length);
    displayDefinitions(newData);
    showDefinitionTable();
  }
};

// match the search keyword with the headword
const matchHeadword = (condition, headword, searchHeadword) => {
    if ( condition.matchMode === 'forward' ) {
      return headword.startsWith(searchHeadword);
    } else if ( condition.matchMode === 'exact' ) {
      return headword === searchHeadword;
    } else {
      return headword.endsWith(searchHeadword);
    }
};

// match the search keyword with the definition
const matchDefinition = (definition, searchDefinition) => {
  return definition.includes(searchDefinition);
}

// highlight the search keyword
const highlight = (searchKeyword, regex, text) => {
  // do nothing if the search keyword is one character or less
  if ( searchKeyword.length <= 1 ) {
    return text;
  } else {
    return text.replace(regex, (match) => `<span class="highlight">${match}</span>`);
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
const deleteDefinitions = () => {
  const table = document.getElementById('definitions');
  const numRows = table.rows.length;
  for (let i = 1; i < numRows; i++) {
    table.deleteRow(1);
  }
};

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

// get include definition checkbox value
const getIncludeDefinitionMode = () => {
  return document.getElementById('include-definition').checked;
}

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

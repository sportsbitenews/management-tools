/* Copyright (C) 2014 Google Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */



var player = player || {};


/**
 * Creates list of players and, if available, scores
 *
 * @param {Object} root the element you want to append this to.
 * @param {Array} items the list of players to show.
 * @param {boolean} showScore should I show the score column?
 */
player.createPlayerList = function(root, items, showScore) {
  if (!items) {
    return;
  }
  console.log('Show players');
  var tab = document.createElement('table');
  tab.className = 'gridtable';
  var row, cell;

  // Make the header
  row = document.createElement('tr');
  row.style.backgroundColor = '#e81d62';
  row.style.color = '#FFF';
  cell = document.createElement('th');
  cell.setAttribute('colSpan', '5');
  cell.appendChild(document.createTextNode(
      'Total players on this page: ' +
      items.length));
  row.appendChild(cell);
  tab.appendChild(row);

  row = document.createElement('tr');
  row.style.backgroundColor = '#e81d62';
  row.style.color = '#FFF';
  cell = document.createElement('th');
  cell.appendChild(document.createTextNode('DISPLAY NAME'));
  row.appendChild(cell);

  cell = document.createElement('th');
  cell.appendChild(document.createTextNode('Icon'));
  row.appendChild(cell);

  cell = document.createElement('th');
  cell.appendChild(document.createTextNode('PLAYER ID'));
  row.appendChild(cell);

  cell = document.createElement('th');
  row.appendChild(cell);

  if (showScore) {
    cell = document.createElement('th');
    cell.appendChild(document.createTextNode('SCORE'));
    row.appendChild(cell);
  }

  tab.appendChild(row);

  // Now actually parse the data.
  for (var index in items) {
    item = items[index];
    row = document.createElement('tr');
    row.style.backgroundColor = index & 1 ? '#CCC' : '#FFF';

    console.log('Name: ' + item.player.displayName +
                    ', playerId:' + item.player.playerId +
                    ' ' + item.scoreValue);
    cell = document.createElement('td');
    cell.appendChild(document.createTextNode(item.player.displayName));
    row.appendChild(cell);

    cell = document.createElement('td');

    var img = document.createElement('img');
    img.setAttribute('src', item.player.avatarImageUrl + '?sz=50');
    img.setAttribute('height', '50px');
    img.setAttribute('width', '50px');
    cell.appendChild(img);
    row.appendChild(cell);

    cell = document.createElement('td');
    cell.appendChild(document.createTextNode(item.player.playerId));
    row.appendChild(cell);

    // Need an active button
    cell = document.createElement('td');
    var button = document.createElement('button');
    button.setAttribute('type', 'button');
    button.setAttribute('name', 'edit');
    button.setAttribute('value', item.player.playerId);
    button.appendChild(document.createTextNode('Pick me!'));
    button.addEventListener('click', player.sendPlayerDataToInputs, false);
    cell.appendChild(button);
    row.appendChild(cell);

    if (showScore) {
      cell = document.createElement('td');
      cell.appendChild(document.createTextNode(item.scoreValue));
      row.appendChild(cell);
    }

    tab.appendChild(row);
  }
  root.appendChild(tab);
};


/**
 * Creates a button on the page.
 *
 * @param {string} text The button text.
 * @param {function} handler The function called when the button is clicked.
 * @return {Object} The created button.
 */
player.createPageButton = function(text, handler) {
  var button = document.createElement('button');
  button.setAttribute('type', 'button');
  button.setAttribute('name', 'edit');
  button.setAttribute('value', item.player.playerId);
  button.appendChild(document.createTextNode(text));
  button.addEventListener('click', handler, false);
  return button;
};


/**
 * Load the current top 25 high scores and render them.
 *
 * @param {String} pageToken a REST API paging token string, or null.
 */
player.showHighScoreList = function(pageToken) {
  document.querySelector('#highScoreListDiv').innerHTML = '';
  document.querySelector('#highScoreListDiv').style.display = 'block';
  // Create the request.
  LEADERBOARD_ID = document.getElementById('leaderboardIdShowHS').value;
  var request = gapi.client.games.scores.list(
      {leaderboardId: LEADERBOARD_ID,
        collection: 'PUBLIC',
        timeSpan: 'all_time',
        pageToken: pageToken,
        maxResults: '10'});
  request.execute(
      function(response) {
        console.log('High score', response);
        if (response.error) {
          alert('Error ' + response.error.code + ': ' + response.message);
          return;
        }
        var root = document.getElementById('highScoreListDiv');
        player.createPlayerList(root, response.items, true);
        if (response.prevPageToken) {
          root.appendChild(
              player.createPageButton(
              'Prev',
              function(event) {
                player.showHighScoreList(response.prevPageToken);}));
        }
        if (response.nextPageToken) {
          root.appendChild(
              player.createPageButton(
              'Next',
              function(event) {
                player.showHighScoreList(response.nextPageToken);}));
        }
      });
};


/**
 * Loads the current hidden players and renders them.
 *
 * @param {String} pageToken a REST API paging token string, or null.
 */
player.showHiddenPlayers = function(pageToken) {
  document.querySelector('#hiddenPlayersDiv').innerHTML = '';
  document.querySelector('#hiddenPlayersDiv').style.display = 'block';
  // Create the request.
  var request = gapi.client.gamesManagement.applications.listHidden(
      {applicationId: APP_ID,
        pageToken: pageToken,
        maxResults: '10'});
  request.execute(
      function(response) {
        console.log('Hidden', response);
        var root = document.getElementById('hiddenPlayersDiv');
        if (response.items) {
          player.createPlayerList(root, response.items, true);
        } else {
          player.createPlayerList(root, [], true);
        }
        if (response.prevPageToken) {
          root.appendChild(
              player.createPageButton(
              'Prev',
              function(event) {
                            player.showHiddenPlayers(response.prevPageToken);
              }));
        }
        if (response.nextPageToken) {
          root.appendChild(
              player.createPageButton(
              'Next',
              function(event) {
                            player.showHiddenPlayers(response.nextPageToken);
              }));
        }
      });
};


/**
 * Fills in the textboxes at the bottom of the page with the user's ID.
 *
 * @param {Object} event the mouse event from clicking the button*
 */
player.sendPlayerDataToInputs = function(event) {
  console.log(event.target.value);
  document.getElementById('playerIdHideInput').value =
      event.target.value;
  document.getElementById('playerIdUnhideInput').value =
      event.target.value;
};


/**
 * Hides a player.
 */
player.hidePlayer = function() {
  var id = document.getElementById('playerIdHideInput').value;

  if (id == '') {
    alert('You need to enter a valid player id.');
    return;
  }
  gapi.client.gamesManagement.players.hide(
      {applicationId: APP_ID,
        playerId: id}).execute(function(response) {
    console.log('Player hide:', response);
    if (response.error != null) {
      alert('There was an error hiding that player: ' +
          response.error.code + ': ' + response.error.message);
    }
    else
    {
      alert('Player is hidden! It may be a few seconds ' +
          'for this to propagate.');
    }
  });
};


/**
 * Unhides a player.
 */
player.unhidePlayer = function() {
  var id = document.getElementById('playerIdUnhideInput').value;
  if (id == '') {
    alert('You need to enter a valid player id.');
    return;
  }
  gapi.client.gamesManagement.players.unhide(
      {applicationId: APP_ID,
        playerId: id}).execute(function(response) {
    console.log('Player hide:', response);
    console.log('Player hide:', JSON.stringify(response));
    if (response.error != null) {

      if (response.error.code == '404') {
        alert('You got a 404.  That might mean that ' +
            ' player is already unhidden.');
      }
      else {
        alert('There was an error unhiding that player: ' +
            response.error.code + ': ' + response.error.message);
      }
    }
    else
    {
      alert('Player is unhidden!  It may take up to 12 hours ' +
          'for this player to reappear.');
    }
  });
};


/**
 * Personalizes the UI to include a visual representation of the player.
 */
player.personalizeUI = function() {
  gapi.client.games.players.get({playerId: 'me'}).execute(function(player) {
    var playerHtml = '<table><td><img src="' + player.avatarImageUrl +
        '" alt="' + player.displayName +
        '" title="' + player.displayName + '" height="45" />' +
        '</a></td><td>' + 'Signed in' + ' as:<br>' + player.displayName +
        '</td></tr></table>';
    document.getElementById('playerCard').innerHTML = playerHtml;
  });
};

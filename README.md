# WikiRaces

[WikiRaces](https://wikiraces.lucapassariello.co.uk) is an application allowing for multi-player Wikipedia races, using Socket.IO and Wikipedia's API.

User's can create, join and play in rooms, participating in Wikipedia Races. User's are shown other player's progress in their room as well as completion time, etc.

### Base Routes

##### /

This namespace contains the base routes of the site:

| HTTP Method | Route    | Usage                                                                               |
| ----------- | -------- | ----------------------------------------------------------------------------------- |
| GET         |          | Home page                                                                           |
| GET         | policies | Page showing the basic policies for the site, pertaining to data and cookie storage |

##### /room/

This namespace contains all of the routes for things to do with rooms:

| HTTP Method | Route                     | Usage                                                                                                   |
| ----------- | ------------------------- | ------------------------------------------------------------------------------------------------------- |
| GET         | join                      | Shows the room connection form                                                                          |
| POST        | join                      | POST route for room connection logic                                                                    |
| GET         | create                    | Shows the room creation form                                                                            |
| POST        | create                    | POST route for the room creation, redirects to join page                                                |
| GET         | :roomID/wiki/:term        | Used in the iFrame to pull the page from Wikipedia                                                      |
| GET         | :roomID/wiki/:term/:term2 | Some Wikipedia links contain a slash, this catches that and replaces it with a `%2f` code               |
| GET         | :roomID/play              | Actual page for playing a race, where the iFrame for the game is displayed, along with game information |

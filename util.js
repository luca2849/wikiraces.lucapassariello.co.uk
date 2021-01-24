const axios = require(`axios`);
const fs = require("fs");
const Room = require("./models/Room");

// Function for creating IDs
createId = (length) => {
    let result = "";
    const characters = "ACDFGHJKLMNQRSUVWXYZ1234567890";
    for (let i = 0; i < length; i++) {
        result += characters.charAt(
            Math.floor(Math.random() * characters.length)
        );
    }
    return result;
};

// Sentence Case Method
toSentenceCase = (string) => {
    const words = string
        .split(" ")
        .map((x) => x.charAt(0).toUpperCase() + x.substring(1));
    return words.join(" ");
};

// Gets the redirected page for a given term e.g. NBA -> National Basketball Association
getPagesWithRedirects = async (term) => {
    const wikiUrl = `https://en.wikipedia.org/w/api.php?action=query&prop=revisions&rvprop=content&format=json&titles=${term}`;
    const pagesResponseObject = await axios.get(encodeURI(wikiUrl));
    const id = Object.keys(pagesResponseObject.data.query.pages)[0];
    const redirectsUrl = `https://en.wikipedia.org/w/api.php?action=query&format=json&pageids=${id}&redirects`;
    const redirectsObject = await axios.get(encodeURI(redirectsUrl));
    if (redirectsObject.data.query.redirects !== undefined) {
        return redirectsObject.data.query.redirects[0].to;
    } else {
        return pagesResponseObject.data.query.pages[id].title;
    }
};

// Checks if a page actually exists in Wikipedia
doesPageExist = async (term) => {
    const wikiUrl = `http://en.wikipedia.org/w/api.php?action=parse&page=${term}&format=json&prop=text|headhtml&contentmodel=wikitext`;
    const pagesResponseObject = await axios.get(encodeURI(wikiUrl));
    if (pagesResponseObject.data.error) {
        return false;
    } else {
        return true;
    }
};

// Pads strings for timings, etc.
str_pad = (string) => {
    return string < 10 ? "0" + string : string;
};

// Method for joining a room in the back-end
joinRoom = async (roomId, userId, username) => {
    try {
        const room = await Room.findOne({ roomId: roomId });
    } catch (error) {
        console.error(error);
        return;
    }
    if (!room) {
        console.log("Room not found");
        return;
    }
    room.users.push({
        userId: userId,
        currentUrl: "",
        username: username,
        host: room.users.length === 0,
    });
    await room.save();
};

// Method for joining a room on the back-end
leaveRoom = async (roomId, userId) => {
    await Room.findOne(
        { roomId: roomId.toUpperCase() },
        async (err, foundObject) => {
            if (err) {
                console.error(err);
            } else {
                if (!foundObject) {
                    console.log("Room not found");
                } else {
                    let foundIdx = null;
                    for (let i = 0; i < foundObject.users.length; i++) {
                        if (foundObject.users[i].userId === userId) {
                            foundIdx = i;
                            break;
                        }
                    }
                    if (foundIdx !== null) {
                        foundObject.users.splice(foundIdx, 1);
                        if (foundObject.users.length === 0) {
                            await Room.deleteOne({ roomId });
                        } else {
                            await foundObject.save();
                        }
                    }
                }
            }
        }
    );
};

// Updates the user's current page in a race in the database
updateUrl = async (roomId, userId, url) => {
    await Room.findOne({ roomId }, async (err, foundObject) => {
        if (err) {
            console.error(err);
        } else {
            if (!foundObject) {
                console.log("Room Not Found");
            } else {
                let foundIdx;
                for (let i = 0; i < foundObject.users.length; i++) {
                    if (foundObject.users[i].userId === userId) {
                        foundIdx = i;
                        break;
                    }
                }
                if (foundIdx || foundIdx === 0) {
                    foundObject.users[foundIdx].currentUrl = url;
                    await foundObject.save();
                }
            }
        }
    });
};

// Updates the user to show they have reached the finishing page
foundPage = (roomId, userId, time) => {
    Room.findOne({ roomId }, (err, foundObject) => {
        if (err) {
            console.error(err);
        } else {
            if (!foundObject) {
                console.log("Room Not Found");
            } else {
                let foundIdx;
                for (let i = 0; i < foundObject.users.length; i++) {
                    if (foundObject.users[i].userId === userId) {
                        foundIdx = i;
                        break;
                    }
                }
                if (foundIdx || foundIdx === 0) {
                    foundObject.users[foundIdx].found = true;
                    foundObject.users[foundIdx].time = time;
                    foundObject.save();
                }
            }
        }
    });
};

// Finds a users record in a room
findInRoom = async (userId, roomId) => {
    const room = await Room.findOne({ roomId });
    if (!room) {
        console.log("Room not found");
        return null;
    }
    for (let i = 0; i < room.users.length; i++) {
        if (room.users[i].userId === userId) {
            return room.users[i];
        }
    }
    return null;
};

module.exports = {
    createId,
    toSentenceCase,
    getPagesWithRedirects,
    joinRoom,
    leaveRoom,
    updateUrl,
    foundPage,
    doesPageExist,
    findInRoom,
};

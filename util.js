const axios = require(`axios`);
const fs = require("fs");
const Room = require("./models/Room");

// Function for creating IDs
createId = (length) => {
    let result = "";
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890";
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

doesPageExist = async (term) => {
    const wikiUrl = `http://en.wikipedia.org/w/api.php?action=parse&page=${term}&format=json&prop=text|headhtml&contentmodel=wikitext`;
    const pagesResponseObject = await axios.get(encodeURI(wikiUrl));
    if (pagesResponseObject.data.error) {
        return false;
    } else {
        return true;
    }
};

str_pad = (string) => {
    return string < 10 ? "0" + string : string;
};

log = (msg) => {
    const fileName = "msg.log";
    // Log message to console
    console.log(msg);
    // Get current date
    const d = new Date();
    const dateString = `[${str_pad(d.getDate())}-${str_pad(
        d.getMonth()
    )}-${str_pad(d.getFullYear())} ${str_pad(d.getHours())}:${str_pad(
        d.getMinutes()
    )}:${str_pad(d.getSeconds())}] `;
    // Append date and time to message
    msg = dateString.toString() + msg;
    fs.appendFile(fileName, `${msg}\n`, (err) => {
        if (err) throw err;
        console.log("Updated");
    });
};

joinRoom = async (roomId, userId, username) => {
    try {
        const room = await Room.findOne({ roomId: roomId.toUpperCase() });
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

findInRoom = async (userId, roomId) => {
    const room = await Room.findOne({ roomId });
    if (!room) {
        console.log("Room not found");
        return undefined;
    }
    for (let i = 0; i < room.users.length; i++) {
        if (room.users[i].userId === userId) {
            return room.users[i];
        }
    }
    return undefined;
};

module.exports = {
    createId,
    toSentenceCase,
    getPagesWithRedirects,
    log,
    joinRoom,
    leaveRoom,
    updateUrl,
    foundPage,
    doesPageExist,
    findInRoom,
};

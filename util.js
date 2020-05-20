const axios = require(`axios`);

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

module.exports = {
    createId,
    toSentenceCase,
    getPagesWithRedirects,
};

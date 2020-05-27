// Check for cookie flag in localstorage
if (localStorage.getItem("cookieAck") != "true") {
    $(".cookieWarning").delay(500).fadeIn(300);
}
// Cookie acknowledgement button callback
cookieAck = () => {
    localStorage.setItem("cookieAck", "true");
    $(".cookieWarning").fadeOut(300);
};

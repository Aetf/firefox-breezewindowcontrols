window.onresize = function() {
    var msg = {
        resized: true
    };
    browser.runtime.sendMessage(msg);
}

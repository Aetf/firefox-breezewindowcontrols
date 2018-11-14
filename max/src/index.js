function getCurrentWindow() {
    return browser.windows.getCurrent({
        populate: false
    });
}

function closeWindow() {
    return getCurrentWindow().then((currentWindow) => {
        browser.windows.remove(currentWindow.id);
    });
}

function minimizeWindow() {
    return getCurrentWindow().then((currentWindow) => {
        browser.windows.update(currentWindow.id, {
            state: "minimized"
        });
    });
}

function toggleMaximizeWindow(btn) {
    return getCurrentWindow().then((currentWindow) => {
        var newState = "maximized";

        if (currentWindow.state === "maximized") {
            newState = "normal";
            newImageName = "titlebutton-maximize";
        }

        return browser.windows.update(currentWindow.id, {
            state: newState
        }).then((currentWindow) => {
            btn.onWindowUpdated(currentWindow);
        });
    });
}

function updateBreezeTheme(focused) {
    if (focused) {
        browser.theme.update({
            images: {
                headerURL: "icons/bg-focused.png"
            },
            colors: {
                accentcolor: "#4c555d",
                textcolor: "#FFF"
            }
        });
    } else {
        browser.theme.update({
            images: {
                headerURL: "icons/bg-nofocused.png"
            },
            colors: {
                accentcolor: "#d7d8d9",
                textcolor: "#000"
            }
        });
    }
}


var actions = {
    "Breeze Window Controls (Close)": {
        action: closeWindow,
        setup: () => {
            browser.runtime.onStartup.addListener(function(){ updateBreezeTheme(true); });
        },
        onFocusChanged: (focused) => {
            updateBreezeTheme(focused);
        },
        icon: {
            title: "Clonse Window",
            imageName: "titlebutton-close"
        }
    },
    "Breeze Window Controls (Minimize)": {
        action: minimizeWindow,
        setup: () => { },
        onFocusChanged: (focused) => {
        },
        icon: {
            title: "Minimize Window",
            imageName: "titlebutton-minimize"
        }
    },
    "Breeze Window Controls (Maximize)": {
        action: toggleMaximizeWindow,
        setup: () => {
        },
        onFocusChanged: (focused) => {
        },
        onWindowUpdated: (currentWindow) => {
            var newImageName = "titlebutton-maximize";
            if (currentWindow.state === "maximized") {
                newImageName += "-maximized";
            }
            updateIcon(newImageName);
        },
        icon: {
            title: "Maximize Window",
            imageName: "titlebutton-maximize"
        }
    },
};

var manifest = browser.runtime.getManifest();
var currentButton = actions[manifest.name];
var state = {
    focused: true
};

function updateIcon(imageName) {
    var image_path = "icons/" + imageName;
    if (!state.focused) {
        image_path += "-backdrop";
    }
    browser.browserAction.setIcon({
        path: {
            "18": image_path + ".png",
            "36": image_path + "@2.png"
        }
    });
}


currentButton.setup();
browser.browserAction.onClicked.addListener(() => {
    currentButton.action(currentButton);
});
browser.browserAction.setTitle({
    title: currentButton.icon.title
});
updateIcon(currentButton.icon.imageName);

browser.windows.onFocusChanged.addListener(() => {
    getCurrentWindow().then((currentWindow) => {
        state.focused = currentWindow.focused;
        // update icon
        updateIcon(currentButton.icon.imageName);
        // then handle more listeners
        currentButton.onFocusChanged(state.focused);
    });
})

browser.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    if (msg.resized) {
        browser.windows.get(sender.tab.windowId, {populate: false})
        .then((currentWindow) =>{
            currentButton.onWindowUpdated(currentWindow);
        });
    }
});

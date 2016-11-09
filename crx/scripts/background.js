'use strict';

// Update the declarative rules on install or upgrade.
// chrome.runtime.onInstalled.addListener(function() {
//   chrome.runtime.onPageChanged.removeRules(undefined, function() {
//     chrome.runtime.onPageChanged.addRules([{
//       conditions: [
//         // When a page contains #bilidili
//         new chrome.runtime.PageStateMatcher({
//           css: ['#bilidili']
//         })
//       ],
//       // ... show the page action.
//       actions: [new chrome.runtime.ShowPageAction() ]
//     }]);
//   });
// });


// chrome.runtime.onInstalled.addListener(function (details) {
//     console.log('previousVersion', details.previousVersion);
// });

chrome.tabs.onUpdated.addListener(function (tabId) {
    chrome.pageAction.show(tabId);
});

console.log('\'Allo \'Allo! Event Page for Page Action');

chrome.runtime.onMessage.addListener(function (msg, sender, sendRes) {
    console.log('getdanmaku');
    if (Array.isArray(msg) && msg[0] === 'getdanmaku') {
        var url = msg[1];
        console.log(url);
        GM_xmlhttpRequest({
            method: 'GET',
            url: url,
            onload: function onload(res) {
                console.log([res.responseText]);
                sendRes(res.responseText);
            },
            onerror: function onerror(err) {
                console.log('getdanmaku error', err);
                sendRes(null);
            }
        });
    }

    return true;
});

function GM_xmlhttpRequest(o) {
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function () {
        if (xhr.readyState === xhr.DONE) {
            if (xhr.status < 400) {
                o.onload && o.onload(xhr);
            } else {
                o.onerror(xhr.statusText);
            }
        }
    };

    xhr.onerror = o.onerror;

    xhr.open(o.method, o.url);
    xhr.send(o.data);
}
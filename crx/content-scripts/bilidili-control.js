function silly() {
    console.log.apply(console, arguments);
}

var cacheKey = 'cache:' + location.href;
silly('Using cacheKey:', cacheKey);
if (location.hostname === 'player.xcmh.cc') {
    
    silly('Getting URL...');
    chrome.storage.local.get(cacheKey, (items) => {
        var url = items[cacheKey] || prompt('Input URL:');
        silly('url: ', url);
        var data = {};
        data[cacheKey] = url;
        chrome.storage.local.set(data);
        chrome.runtime.sendMessage(null, ['getdanmaku', url], {}, (responseText) => {
            if (!responseText) {
                silly('Error while fetch danmaku file, halt');
                return;
            }
            window.addEventListener('bdcore-ready', () => {
                var evt = new Event('bdctrl-restext');
                var s = document.createElement('script');
                s.setAttribute('type', 'text/xml');
                s.id = 'restext';
                s.innerHTML = responseText;
                document.body.appendChild(s);
                window.dispatchEvent(evt);
            });

            injectScript(chrome.extension.getURL('/content-scripts/bilidili-core.js'), 'body');
        })
    });
        
}
else if (location.hostname === 'www.dilidili.com') {
    var toolbarStr = `
<div class="player_sx" id="bilidili">
<p style="float:left; margin-left:5px;">关闭/开启弹幕</p>
<p style="float:left; margin-left:5px;" onclick="document.querySelector('#player_iframe').webkitRequestFullscreen()">带弹幕全屏</p></div>
`;
    var toolbar = document.createElement('div');
    toolbar.innerHTML = toolbarStr;
    var sx = document.querySelector('.player_sx');
    sx.parentElement.insertBefore(toolbar, sx);
}



function injectScript(file, node) {
    var th = document.getElementsByTagName(node)[0];
    var s = document.createElement('script');
    s.setAttribute('type', 'text/javascript');
    s.setAttribute('src', file);
    th.appendChild(s);
}
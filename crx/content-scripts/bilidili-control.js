function silly() {
    console.log.apply(console, arguments);
}

var PageAgent = {
	onMessage(listener) {
		if (location.protocol === 'file:') {
			window.addEventListener('lo-message', (ev) => {
				listener(JSON.parse(document.getElementById('_msg_response').innerHTML));
			});
		}
		else {
			window.addEventListener('message', (ev) => listener(ev.data));
		}
	},

	postMessage(data) {
		// console.log('core:postMessage(data, origin)',location.protocol);
		if (location.protocol === 'file:') {
			var ev = new Event('lo-message');
			var msgNode = document.getElementById('_msg_response') || 
				document.body.appendChild(document.createElement('script'))
			msgNode.id = '_msg_response';
            msgNode.type = 'application/json';
			msgNode.innerHTML = JSON.stringify(data);

			window.dispatchEvent(ev);
		}
		else {
			window.postMessage(data, location.origin);
		}
	}
};

var DILI_PLAYER = 'player.dilidili.tv';

if (location.hostname === DILI_PLAYER || location.protocol === 'file:') {
    silly('Getting URL...');
    var cacheKey = 'cache:' + 
        (location.hostname === DILI_PLAYER ? getKeyByVid(location.href) : location.href);
    silly('Using cacheKey:', cacheKey);
    silly(location.protocol);

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

            console.log('ctrl:location.origin', location.origin);
            PageAgent.onMessage((msg) => {
                if (!msg.requestDanmaku) return;
                PageAgent.postMessage({
                    responseDanmaku: responseText
                });
            })

            injectScript(chrome.extension.getURL('/content-scripts/bilidili-core.js'), 'body');
        })
    });
        
}
else if (location.hostname === 'www.dilidili.com') {
    
    var toolbar = document.createElement('div');
    toolbar.innerHTML = Toolbar();
    var sx = document.querySelector('.player_sx');
    sx.parentElement.insertBefore(toolbar, sx);
    var cacheKey = 'cache:' + getKeyByVid(document.getElementById('player_iframe').src);
    silly('getKeyByVid(document.getElementById(\'player_iframe\').src', cacheKey)
    chrome.storage.local.get(cacheKey, (items) => {
        var url = items[cacheKey];
        if (url) toolbar.innerHTML = Toolbar({ url: url });
    });
}

function Toolbar(props = { url: '' }) {
    return `
    <div class="player_sx" id="bilidili">
        <p style="float:left; margin-left:5px;">关闭/开启弹幕</p>
        <p style="float:left; margin-left:5px;" 
            onclick="document.querySelector('#player_iframe').webkitRequestFullscreen()">
            带弹幕全屏
        </p>
        <p style="float:left; margin-left:5px;">${decodeURIComponent(props.url) || '未加载弹幕。'}</p>
    </div>
    `;
}

function getKeyByVid(href) {
    var ma = /vid=(\d+)/.exec(href);
    return ma && ma[1];
}

function injectScript(file, node) {
    var th = document.getElementsByTagName(node)[0];
    var s = document.createElement('script');
    s.setAttribute('type', 'text/javascript');
    s.setAttribute('src', file);
    th.appendChild(s);
}
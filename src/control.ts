import PageAgent from './page-agent';

var silly = PageAgent.silly;
var global = (<any>window);
var cr = global.chrome;
var DILI_PLAYER = 'newplayer.dilidili.tv';

if (location.hostname === DILI_PLAYER || location.protocol === 'file:') {
    silly('Getting URL...');
    var cacheKey = 'cache:' + 
        (location.hostname === DILI_PLAYER ? getKeyByVid(location.href) : location.href);
    silly('Using cacheKey:', cacheKey);
    silly(location.protocol);
    
    history.pushState({}, '', '#');
    window.onhashchange = () => {
        if (location.hash === '#editDmUrl') {
            cr.storage.local.set({ [cacheKey]: prompt('Input URL:') });
        }
    }
    cr.storage.local.get(cacheKey, (items) => {
        var url = items[cacheKey] || prompt('Input URL:');
        silly('url: ', url);
        var data = {};
        data[cacheKey] = url;
        cr.storage.local.set(data);
        cr.runtime.sendMessage(null, ['getdanmaku', url], {}, (responseText) => {
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

            injectScript(cr.extension.getURL('/content-scripts/bilidili-core.js'), 'body');
        })
    });
        
}
else if (location.hostname === 'www.dilidili.com') {

    var toolbar = document.createElement('div');
    toolbar.innerHTML = Toolbar();
    var sx = document.querySelector('.player_sx');
    sx.parentElement.insertBefore(toolbar, sx);
    var cacheKey = 'cache:' + getKeyByVid((document.getElementById('player_iframe') as HTMLIFrameElement).src);
    silly('getKeyByVid(document.getElementById(\'player_iframe\').src', cacheKey)
    cr.storage.local.get(cacheKey, (items) => {
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
        <a style="float:left; margin-left:5px;" onclick="document.querySelector('#player_iframe').src+='#editDmUrl'">${decodeURIComponent(props.url) || '未加载弹幕。'}</a>
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
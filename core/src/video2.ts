/// <reference path="../../typings/tsd.d.ts" />
import { Lyric } from './music/Lyric';
import { BilibiliDanmakuDocument } from './danmaku/bilibili';
import { DanmakuViewer } from './danmaku/viewer';
import { CkPlayerWrapperMedia } from './skplayer';
// import { xml } from './lrc.xml';
// GM_xmlhttpRequest;

function danmaku(text) {
	
	var audio = new CkPlayerWrapperMedia('ckplayer_a1');
	var lrc = new Lyric(audio, BilibiliDanmakuDocument, text);
	var dmv = (<any>window).dmv = new DanmakuViewer(audio);

	lrc.addView(dmv);
	dmv.init();
}

var pending;

(function waitReady() {
	if (typeof CKobject === 'object' && CKobject.getObjectById('ckplayer_a1').addListener) {
		clearTimeout(pending);
		setInterval(() => {
			// console.log('pong...');
			document.querySelector('object').setAttribute('height', window.innerHeight + '');
			CKobject.getObjectById('ckplayer_a1').setAttribute('height', window.innerHeight);
		}, 1200);
		
		window.addEventListener('bdctrl-restext', (evt) => {
            // console.log('iner', document.getElementById('restext').innerHTML);
            danmaku(document.getElementById('restext').innerHTML);
        })
        window.dispatchEvent(new Event('bdcore-ready'));

		return;
	}

	pending = setTimeout(waitReady, 300);
})();

(<any>window).danmaku = danmaku;

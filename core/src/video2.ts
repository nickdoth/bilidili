/// <reference path="../typings/tsd.d.ts" />
import { Lyric } from './music/Lyric';
import { BilibiliDanmakuDocument } from './danmaku/bilibili';
import { DanmakuViewer } from './danmaku/viewer';
import { Media } from './media/Media';
import { HTMLMedia } from './media/HTMLMedia';
import { CkPlayerWrapperMedia } from './skplayer';
// import { xml } from './lrc.xml';
// GM_xmlhttpRequest;

function danmaku(media: Media, text: string) {
	
	var lrc = new Lyric(media, BilibiliDanmakuDocument, text);
	var dmv = (<any>window).dmv = new DanmakuViewer(media);

	lrc.addView(dmv);
	dmv.init();
}

function loadAndPlay(media: Media) {
	window.addEventListener('bdctrl-restext', (evt) => {
		// console.log('iner', document.getElementById('restext').innerHTML);
		danmaku(media, document.getElementById('restext').innerHTML);
	})
	window.dispatchEvent(new Event('bdcore-ready'));
}

var pending;

(function waitPlayerReady() {
	if (typeof CKobject === 'object' && CKobject.getObjectById('ckplayer_a1').addListener) {
		clearTimeout(pending);
		setInterval(() => {
			// console.log('pong...');
			document.querySelector('object').setAttribute('height', window.innerHeight + '');
			CKobject.getObjectById('ckplayer_a1').setAttribute('height', window.innerHeight);
		}, 1200);
		
        loadAndPlay(new CkPlayerWrapperMedia('ckplayer_a1'));

		return;
	}
	else if (document.querySelector('video') !== null) {
		clearTimeout(pending);
		loadAndPlay(new HTMLMedia(document.querySelector('video')));
		return;
	}

	pending = setTimeout(waitPlayerReady, 300);
})();

(<any>window).danmaku = danmaku;

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

function getDanmakuText() {
	return new Promise<string>((resolve, reject) => {
		var inTime = timeout(reject, 15000);
		window.addEventListener('message', (ev) => {
			if (ev.origin !== location.hostname && location.hostname !== '') return;
			var msg = ev.data;
			if (msg.responseDanmaku) {
				inTime();
				resolve(msg.responseDanmaku);
			}
		});

		window.postMessage({ requestDanmaku: true }, location.hostname || '*');
	});
}


function getMedia() {
	return new Promise<Media>((resolve, reject) => {
		var inTime = timeout(resolve, 30000);
		var pending;
		(function waitPlayerReady() {
			if (typeof CKobject === 'object' && CKobject.getObjectById('ckplayer_a1').addListener) {
				setInterval(() => {
					// console.log('pong...');
					document.querySelector('object').setAttribute('height', window.innerHeight + '');
					CKobject.getObjectById('ckplayer_a1').setAttribute('height', window.innerHeight);
				}, 1200);
				
				clearTimeout(pending);
				inTime();
				resolve(new CkPlayerWrapperMedia('ckplayer_a1'));
				return;
			}
			else if (document.querySelector('video') !== null) {
				clearTimeout(pending);
				inTime();
				resolve(new HTMLMedia(document.querySelector('video')));
				return;
			}

			pending = setTimeout(waitPlayerReady, 300);
		})();
	});
}

function timeout(reject, t) {
	var timer = setTimeout(() => reject(new Error('Times up')), t);
	return () => clearTimeout(timer);
}

function loadAndPlay() {
	return Promise.all([ getDanmakuText(), getMedia() ]).then(function([resText, media]) {
		danmaku(media, resText);
	})
}

loadAndPlay();

(<any>window).danmaku = danmaku;

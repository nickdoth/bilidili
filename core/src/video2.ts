/// <reference path="../typings/tsd.d.ts" />
import { Lyric } from './music/Lyric';
import { BilibiliDanmakuDocument } from './danmaku/bilibili';
import { DanmakuViewer } from './danmaku/viewer';
import { Media } from './media/Media';
import { HTMLMedia } from './media/HTMLMedia';
import { CkPlayerWrapperMedia } from './skplayer';
// import { xml } from './lrc.xml';
// GM_xmlhttpRequest;
import config from './config';
import PageAgent from './page-agent';

function danmaku(media: Media, text: string) {
	
	var lrc = new Lyric(media, new BilibiliDanmakuDocument(text), text);
	var dmv = (<any>window).dmv = config(new DanmakuViewer(media), 'danmakuViewer');

	lrc.addView(dmv);
	dmv.init();
}

function getDanmakuText() {
	return new Promise<string>((resolve, reject) => {
		var inTime = timeout(reject, 15000);
		PageAgent.onMessage((msg) => {
			if (msg.responseDanmaku) {
				inTime();
				resolve(msg.responseDanmaku);
			}
		});

		console.log('core:location.origin', location.origin);
		PageAgent.postMessage({ requestDanmaku: true });
	});
}


function getMedia() {
	return new Promise<Media>((resolve, reject) => {
		var inTime = timeout(resolve, 30000);
		(function waitPlayerReady() {
			if (typeof CKobject === 'object' && CKobject.getObjectById('ckplayer_a1').addListener) {
				setInterval(() => {
					// console.log('pong...');
					document.querySelector('object').setAttribute('height', window.innerHeight + '');
					CKobject.getObjectById('ckplayer_a1').setAttribute('height', window.innerHeight);
				}, 1200);
				
				inTime();
				resolve(new CkPlayerWrapperMedia('ckplayer_a1'));
				return;
			}
			else if (document.querySelector('video') !== null) {
				inTime();
				resolve(new HTMLMedia(document.querySelector('video')));
				return;
			}

			setTimeout(waitPlayerReady, 300);
		})();
	});
}

function timeout(reject, t, message = '') {
	var timer = setTimeout(() => reject(new Error('Times up' + message ? `: ${message}` : '')), t);
	return () => clearTimeout(timer);
}

function loadAndPlay() {
	return Promise.all([ getMedia(), getDanmakuText() ]).then(function(data) {
		var [media, resText] = data;
		danmaku(media, resText);
	})
}

loadAndPlay();

(<any>window).danmaku = danmaku;

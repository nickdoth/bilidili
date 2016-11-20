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

var PageAgent = {
	onMessage(listener: Function) {
		if (location.protocol === 'file:') {
			window.addEventListener('lo-message', (ev) => {
				listener(JSON.parse(document.getElementById('_msg_response').innerHTML));
			});
		}
		else {
			window.addEventListener('message', (ev) => listener(ev.data));
		}
	},

	postMessage(data: any) {
		// console.log('core:postMessage(data, origin)',location.protocol);
		if (location.protocol === 'file:') {
			var ev = new Event('lo-message') as any;
			var msgNode = document.getElementById('_msg_response') as HTMLDivElement || 
				document.body.appendChild(document.createElement('script')) as HTMLDivElement
			msgNode.id = '_msg_response';
			(<any>msgNode).type = 'application/json';
			msgNode.innerHTML = JSON.stringify(data);

			window.dispatchEvent(ev);
		}
		else {
			window.postMessage(data, location.origin);
		}
	}
};

function danmaku(media: Media, text: string) {
	
	var lrc = new Lyric(media, BilibiliDanmakuDocument, text);
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
	return Promise.all([ getDanmakuText(), getMedia() ]).then(function(data) {
		var [resText, media] = data;
		danmaku(media, resText);
	})
}

loadAndPlay();

(<any>window).danmaku = danmaku;

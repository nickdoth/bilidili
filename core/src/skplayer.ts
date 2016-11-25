/// <reference path="../typings/tsd.d.ts" />
import { Media } from './media/media';
import { EventEmitter } from 'events';

var g = (<any>window);

export class CkPlayerWrapperMedia extends EventEmitter implements Media {
	private sk = null;
	private currentTime = 0;
	private paused = false;

	constructor(id: string) {
		super();
		if (typeof CKobject !== 'object') {
			throw new Error('ckplayer not found');
		}
		this.sk = CKobject.getObjectById(id);
		if (!this.sk) throw new Error('ckplayer instance not found');
		console.log(this.sk);

		g.dmkev_time = (time) => {
			this.emit('timeupdate', time);
			this.currentTime = time;
		};

		g.dmkev_paused = (paused) => {
			this.paused = paused;
			if (paused) {
				this.emit('pause');
			}
			else {
				this.emit('play');
			}
		};

		g.dmkev_seeking = (time) => {
			this.emit('seeked');
		}

		this.sk.addListener('time', 'dmkev_time');
		this.sk.addListener('paused', 'dmkev_paused');
		this.sk.addListener('seeking', 'dmkev_seeking');
	}

	 //load media file from $url
    load(url) {}

    //get current loaded media
    getUrl() { return '' }

    //play current media
    play() {}

    //pause current media
    pause() {}

    //set current playing time
    setCurrentTime(percent: number) {}

    //get current playing time
    getCurrentTime() {
    	return this.currentTime;
    }

    //get media duration
    getDuration() { 
    	return 0;
    };

    //set media auto-loop or not
    setLoop(loop: boolean) {}

    isPaused() {
    	return this.paused;
    }

    isPlaying() {
    	return !this.paused;
    }

    isLoop() { return false };

    isEnded() { return false };

    isLoaded() { return true };

    // on(type: 'play', listener: () => void);
    // on(type: 'load', listener: () => void);
    // on(type: 'ended', listener: () => void);
    // on(type: 'timeupdate', listener: (curtime: number) => void);
    // on(type: string, listener: Function);

}
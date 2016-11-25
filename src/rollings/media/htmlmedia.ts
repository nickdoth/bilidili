/// <reference path="../../../typings/tsd.d.ts" />
import { Media } from './media';
import { EventEmitter } from 'events';

export class HTMLMedia extends EventEmitter implements Media {
    element: HTMLMediaElement;
   
    constructor(elementType?: string);
    constructor(element?: HTMLMediaElement);
    constructor(elementOrType) {
       super();
        if (!elementOrType) {
            elementOrType = 'audio';
        }

        if (typeof elementOrType === 'string') {
            var element = this.element = <HTMLMediaElement> document.createElement(elementOrType);
            document.body.appendChild(element);
        }
        else {
            var element = this.element = <HTMLMediaElement> elementOrType;
        }
        
        //delegate events.
        element.onplay = e => this.emit('play', e);
        element.onpause = e => this.emit('pause', e);
        element.ontimeupdate = e => this.emit('timeupdate', this.element.currentTime);
        element.onended = e => this.emit('ended', e);
        element.onseeked = e => this.emit('seeked', e);
    }

    load(url) {
        this.element.src = url;
        return this.element.load();
    }

    getUrl() {
        return this.element.src;
    }

    play() {
        return this.element.play();
    }

    pause() {
        return this.element.pause();
    }

    setCurrentTime(time: number) {
        //Not Implemented.
        this.element.currentTime = time;
    }

    getCurrentTime() {
        return this.element.currentTime;
    }

    getDuration() {
        return this.element.duration;
    }

    setLoop(bool) {
        return this.element.loop = bool;
    }

    isPaused() {
        return this.element.paused;
    }

    isPlaying() {
        return !this.element.paused;
    }

    isLoop() {
        return this.element.loop;
    }

    isEnded() {
        return this.element.ended;
    }

    isLoaded() {
        //Not Implemented.
        return true;
    }
}
/// <reference path="../../../typings/index.d.ts" />
import { Media } from '../media/media';
import { EventEmitter } from 'events';
import { DEBUG } from '..';

var silly: typeof console.log = (...args) => DEBUG && console.log.apply(console, args);

// @fires init, update, destroy, lrc_notfound
export class Connector extends EventEmitter implements ConnectorEvents {
    public enableCheck = false;

    constructor(private media: Media, private lrcDocument: Document<any>) {
        super();

        if(!media) {
            throw new Error("Media Element not specified.");
        }
        
        this.init();
    }

    init() {
        silly('Lyric init');
            
        var lrcDocument = this.lrcDocument;
        // var lrcLine = lrcDocument.lrcNodes;
        var timeLine = lrcDocument.getTimeLine();

        this.emit('init', timeLine);

        silly('timeLine', [timeLine]);

        /*滚动循环体*/
        var currentLine = '';
        var checker: () => void;
        var timer;
        var matchStartPoint = 0;
        this.enableCheck = true;
        (checker = () => {
            var now = this.media.getCurrentTime();
            var matchLines = timeLine.matchByTime(now, matchStartPoint);
            silly('matchStartPoint', matchStartPoint);

            if(matchLines.toString() !== currentLine) {
                currentLine = matchLines.toString();
                matchStartPoint = matchLines[matchLines.length - 1];
                this.emit('update', matchLines, timeLine);
                
                silly(timeLine[currentLine]);
            }

            timer = this.enableCheck && setTimeout(checker, 5);
            if(!this.enableCheck) {
                clearTimeout(timer);
            }
        })();

        this.media.on('seeked', (e) => {
            matchStartPoint = 0;
            console.log('seeked');
        });
    }

    destroy() {
        if (this.enableCheck) {
            this.enableCheck = false;
            this.emit('destroy');
        }
    }

    addView<T>(view: ILyricViewer<T>) {
        this.on('init', (timeLine) => view.init(timeLine));
        this.on('update', (matches, timeLine) => view.update(matches, timeLine));
        this.on('destroy', () => view.destroy());
    }

    getDocumentInstance() {
        return this.lrcDocument;
    }

}

export interface ConnectorEvents {
    on(event: 'init', listener: () => any): EventEmitter;
    on(event: 'destroy', listener: () => any): EventEmitter;
    on(event: 'update', listener: (data: string, index?: number[]) => any): EventEmitter;
    on(event: string, listener: Function): EventEmitter;
}

export interface ILyricViewer<T> {
    init(t?: TimeLine<T>);
    update(matches: number[], timeLine: TimeLine<T>);
    destroy();
}


// Timeline

export interface TimeNode<T> {
    time: number;
    content_id: number;
    data: T;
}

export interface TimeLine<T> extends Array<TimeNode<T>> {
    matchByTime(time: number, startPoint: number): number[];
}

function matchByTime(time: number, startPoint = 0): number[] {
    var timeLine: TimeLine<any> = this;
    var ret: number[] = [];

    // var center = Math.floor(timeLine.length / 2);

    for (var i = startPoint; i < timeLine.length; i++) {
        let next = timeLine[i + 1] ? timeLine[i + 1].time : Infinity;
        if(timeLine[i].time <= time && next > time) {
            // for (let e = i + 1; timeLine[e] && (timeLine[e].time === timeLine[i].time); e++) {
            //     ret.push(e);
            // }
            for (let e = i; timeLine[e] && (timeLine[e].time === timeLine[i].time); e--) {
                ret.push(e);
            }
            break;
        }
    }
    silly('查找次数', i - startPoint);
    return ret;
}

export function TimeLine<T>(): TimeLine<T> {
    var arr: any = [];
    arr.matchByTime = matchByTime;
    return arr;
}


// Ctor of lyric format

export interface Document<T> {
    getTimeLine(): TimeLine<T>;
}

export interface DocumentCtor {
    new (rawData: any): Document<any>;
    extname: string;
    responseType: string;
}
/// <reference path="../../../typings/tsd.d.ts" />
import { ILyricViewer, TimeLine } from '../media/connector';
import { Danmaku } from './bilibili';
import { Media } from '../media/media';
import { EventEmitter } from 'events';
import styles from '../../styles';
var SILLY = false;

function silly(...args: any[]) {
    SILLY && console.log(args.shift(), ...args);
}

function debugTime(str) {
    SILLY && console.time(str);
}

function debugTimeEnd(str) {
    SILLY && console.timeEnd(str);
}

silly(__dirname, __filename);

var devicePixelRatio = 1; // forcing


interface Rolling {
    node: HTMLSpanElement;
    pos: number;
    width: number;
    removed?: boolean;
}

interface RollingNode<D> {
    node: Danmaku;
    top: number;
    left: number;
    width: number;
    color: number[];
    fontSize: number;
    attachData?: D;
    initialized?: boolean;
}

interface DanmakuRenderer<D> {
    updateState(n: RollingNode<D>): void;
    removeState(n: RollingNode<D>): void;
    render(): void;
}


export class DanmakuViewer extends EventEmitter implements ILyricViewer<Danmaku> {

    /** */
    // private canvas: HTMLCanvasElement;
    /** */
    private viewList: RollingNode<any>[] = [];
    /** */
    public rollingDuration: number; // ms
    /** */
    defaultFontSize = 19 * devicePixelRatio;
    /** */
    public showFps: boolean = false;
    get rollingSpeed() {
        return devicePixelRatio * this.screenWidth / this.rollingDuration; // pixels per microsecond
    }

    get screenWidth() {
        return document.body.offsetWidth;
    }

    get screenHeight() {
        return document.body.offsetHeight * 0.8;
    }



    constructor(private video: Media) {
        super();
        video.on('pause', () => { });
        range(0, this.maxRow - 1).forEach(n => this.rowBlocked[n] = false);
        setInterval(() => this.row = 1, 1700);
    }

    init() {
        // this.rollingDuration = 8000;
        this.mainLoop();
    }

    update(matches: number[], timeLine: TimeLine<Danmaku>) {
        // silly('matchesLength:', matches.length);
        for (let i = 0; i < matches.length; i++) {
            // silly('%c' + readableTime(timeLine[matches[i]].time), 'color: #888;',
            //     timeLine[matches[i]].data.content);
            let dm = timeLine[matches[i]].data;
            let left = this.screenWidth;

            this.viewList.push({
                node: dm,
                top: this.dTop(),
                left: left,
                width: -1,
                fontSize: this.defaultFontSize,
                color: color(dm.color)
            });
        }
    }

    destroy() {
    	
    }

    private row = 1;
    private maxRow = 13;
    private rowBlocked: boolean[] = [];
    dTop() {
        debugTime('dTop');
        let lineHeight = this.defaultFontSize * 2 + 2;

        let top: number;

        while (true) {
            if (this.row > this.maxRow) {
                top = lineHeight * (this.row++ - this.maxRow) + lineHeight / 2;
            }
            else {
                top = lineHeight * this.row++;
            }

            

            // 筛选出top值与local top相同的元素，取出他们的的完全左移值，并求他们的最大值
            // 若没有匹配到元素，即该行上没有元素，max函数返回负无穷
            // 该算法效率不稳定，正在试图替代
            var maxLeft = Math.max(...this.viewList.filter(n => n.top === top)
                .map(n => n.width + n.left));
            silly(top, maxLeft);
            if (maxLeft < this.screenWidth - 15) {
                break;
            }
            else {
                silly('向其它行查找空余空间');
            }

            // var match1 = this.viewList.filter(n =>
            //         n.width + n.left < this.screenWidth - 15)
            //     .map(n => n.top);

            // silly(match1);

            // break;
        }
        
        if (this.row === this.maxRow * 2) this.row = 1;

        debugTimeEnd('dTop');
        return top;
    }
    

    public recover() {
        this.emit('recover-request');
    }

    public suspend() {
        this.emit('suspend-request');
    }

    public suspendState(callback: Function) {
        this.emit('suspend-query', callback)
    }

    private mainLoop() {
        var cd = new DanmakuDOM();
        cd.setSize(this.screenWidth, this.screenHeight);
        window.addEventListener('resize', () => 
            cd.setSize(this.screenWidth, this.screenHeight));
        // var cd = new DanmakuDOM();

        var isSuspended = false;
        this.on('suspend-request', () => {
            isSuspended = true;
            this.once('recover-request', () => {
                last = performance.now();
                isSuspended = false;
                requestAnimationFrame(handler);
            });
        });

        this.on('suspend-query', (cb: Function) => {
            cb(isSuspended);
        });


        this.video.on('pause', () => {
            this.suspend();
            this.video.once('play', () => this.recover());
        });

            

        // FPS相关调整
        var last = performance.now(),
            now = 0,
            mspf = 0; // microseconds per frame
        // FPS Viewer
        if (this.showFps) {
            var fpsNode = <HTMLSpanElement> document.body.appendChild(
                document.createElement('span'));
            fpsNode.className = styles.fpsNode;
        }
        var handler: FrameRequestCallback;
        var doRealRender = true;
        requestAnimationFrame(handler = (time) => {
            if (isSuspended) {
                return;
            }

            // if (this.video.isPaused()) {
            //     this.video.once('play', () => {
            //         last = performance.now();
            //         requestAnimationFrame(handler);
            //     });
            //     return;
            // }

            
            now = performance.now();
            mspf = now - last;
            last = now;

            for (let i = 0; i < this.viewList.length; i++) {
                let n = this.viewList[i];

                if (!n.initialized) {
                    // n.width = this.dTop();
                    cd.initNode(n);
                    n.initialized = true;
                }

                // p/f = ms/f * p/ms;
                // n.left -= this.rollingSpeed * mspf; // pixels per frame
                
                // experimental: specified speed
                // if (!(<any>n).rollingSpeed && n.width > 0) {
                    // (<any>n).rollingSpeed = (document.body.offsetWidth + n.width) /
                    //     this._rollingDuration;
                // }


                n.left -= this.rollingSpeed * mspf; // pixels per frame

                
                cd.updateState(n);

                if (n.width < 0) {
                    // cd.measureItemWidth(n);
                }

                if (n.left < 0 - n.width) {
                    cd.removeState(n);
                    this.viewList.splice(i--, 1);
                }
            }
            
            
            if (doRealRender) {
                cd.render(this.viewList);
            }
            // doRealRender = !doRealRender;
            requestAnimationFrame(handler);
            
        });

        setInterval(_ => {
            requestAnimationFrame(t => {
                if (this.showFps) {
                    fpsNode.innerHTML = (1000 / mspf).toFixed(1) + 'fps';
                }
            });
        }, 400);
    }

}

function readableTime(sec: number) {
    let hh = Math.floor(sec / 3600);
    let mm = Math.floor(sec / 60 - hh * 60);
    let ss = Math.floor(sec - hh * 3600 - mm * 60);

    return `${hh}:${numFormat(mm)}:${numFormat(ss)}`;
}





class DanmakuDOM {
    public rootEl: HTMLDivElement = null;
    constructor() {
        this.rootEl = document.createElement('div');
        document.body.appendChild(this.rootEl);
    }

    setSize(x: number, y: number) {

    }

    initNode(n: RollingNode<HTMLSpanElement>) {
        if (!n.attachData) {
            n.attachData = document.createElement('span');
            n.attachData.innerHTML = n.node.content;
            n.attachData.style.top = n.top + 'px';
            n.attachData.style.color = `rgb(${color(n.node.color).join(',')})`;
            n.attachData.style.fontSize = n.fontSize + 'px';

            n.attachData.className = styles.danmaku;

            silly(n.node.content, n.attachData);
            this.rootEl.appendChild(n.attachData);
            var offsetWidth = n.attachData.offsetWidth;
            n.attachData.style.left = '-9999px';
            n.attachData.style.width = offsetWidth + 'px';
            n.width = offsetWidth;
        }
    }

    updateState(n: RollingNode<HTMLSpanElement>) {
        // n.attachData.style.left = n.left + 'px';
    }

    removeState(n: RollingNode<HTMLSpanElement>) {
        this.rootEl.removeChild(n.attachData);
    }

    render(viewList: RollingNode<HTMLSpanElement>[]) {
        viewList.forEach(n => {
            n.attachData.style.left = n.left + 'px';
        });
    }
}










function numFormat(n: number) {
    if (n < 10) {
        return `0${n}`;
    }
    else {
        return n.toString();
    }
}

function color(n: number) {
    var b = n & 0xff;
    n = n >> 8;
    var g = n & 0xff;
    var r = n >> 8;
    // return `rgb(${r},${g},${b})`;
    return [r, g, b];
}

function colorLightness(color: number[]) {
    var min = Math.min(...color);
    var max = Math.max(...color);
    return (min + max) / 2.0;
}

function range(from, to) {
    let ret: number[] = [];
    for (let i = from; i <= to; i++) {
        ret.push(i);
    }

    return ret;
}
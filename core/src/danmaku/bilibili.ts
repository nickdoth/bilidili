import { TimeLine, Document } from '../music/Lyric';

/** 弹幕对象 */
export interface Danmaku {
    /** 弹幕时间(秒) */
    time: number;
    /** 弹幕类型 */
    type: DanmakuType;
    /** 字体大小 */
    fontSize: number;
    /** 字体颜色 */
    color: number;
    /** 弹幕发送时间(Unix时间戳) */
    timestamp: number;
    /** 弹幕池ID */
    poolId: number;
    /** 用户ID */
    userId: string;
    /** 数据库行号(?) */
    rowId: number;

    /** 弹幕内容 */
    content: string;
}

/** 弹幕类型枚举 */
export enum DanmakuType {
    /** 滚动弹幕(1..3) */
    Rolling = 3,
    /** 底部弹幕 */
    Bottom = 4,
    /** 顶部弹幕 */
    Top = 5,
    /** 逆向弹幕 */
    Reverse = 6,
    /** 绝对定位弹幕 */
    Absolute = 7,
    /** 高级弹幕 */
    Advanced = 8
}

export class BilibiliDanmakuDocument implements Document<Danmaku> {
    static extname = 'xml';
    static responseType = 'document';

    public nodes: Danmaku[] = [];

    constructor(text: string) {
        var xmldoc = (new DOMParser()).parseFromString(text, "text/xml");
        var list = xmldoc.getElementsByTagName('d');
        
        // this.nodes.push({time: -1, content: ''});
        for(var i = 0; i < list.length; i++) {
            var line = parseLrcLine(<Element> list[i]);
            if(line !== null) {
                this.nodes.push(line);
            }
        }
        // this.nodes.push({time: [Infinity], content: ''});
        
    }


    getTimeLine() {
        var nodes = this.nodes;
        var timeLine = TimeLine<Danmaku>();

        /*将时间标签存到TimeLine*/
        for(var i = 0; i < nodes.length; i++)
        {
            timeLine.push({
                    time: nodes[i].time,
                    content_id: i,
                    data: nodes[i]
            });
        }

        timeLine.sort((a, b) => a.time > b.time ? 1 : -1);
        
        return timeLine;
    }
}



function parseLrcLine(node: Element): Danmaku {
    var infoAttr = node.getAttribute('p');
    var info = infoAttr.split(',');

    return <Danmaku> {
        time: parseFloat(info[0]),
        type: parseInt(info[1]),
        fontSize: parseInt(info[2]),
        color: parseInt(info[3]),
        timestamp: parseFloat(info[4]),
        poolId: parseInt(info[5]),
        userId: info[6],
        rowId: parseInt(info[7]),

        content: node.childNodes[0] ? node.childNodes[0].textContent : ' '
    }
}

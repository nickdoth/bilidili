import { TimeLine, Document } from './Lyric';

export interface LrcNode {
    time: number[];
    specialLabels?: string[];
    content: string;
}

export interface CurrentLrcNode extends LrcNode {
    currentLine: number;
}

export class LrcDocument implements Document<LrcNode> {
    static extname = 'lrc';
    static responseType = 'text';

    public lrcNodes: LrcNode[];

    constructor(lrcText: string) {
        var lrcNodes: LrcNode[] = this.lrcNodes = [],
            timeLine = [];
        
        //Windows/DOS换行符
        if(/\r\n/.test(lrcText)) {
            var lrcLines = lrcText.split('\r\n');
        }
        //Mac换行符
        else if(/\r/.test(lrcText) && !/\n/.test(lrcText)) {
            var lrcLines = lrcText.split('\r');
        }
        //Unix换行符
        else {
            var lrcLines = lrcText.split('\n');
        }
        
        lrcNodes.push({time: [-1], content: ''});
        for(var i = 0; i < lrcLines.length; i++) {
            var line = parseLrcLine(lrcLines[i]);
            if(line !== null) {
                lrcNodes.push(line);
            }
        }
        lrcNodes.push({time: [Infinity], content: ''});
        
    }


    getTimeLine() {
        var lrcNodes = this.lrcNodes;
        var timeLine = TimeLine<LrcNode>();

        /*将时间标签存到TimeLine*/
        for(var i = 0; i < lrcNodes.length; i++)
        {
            for(var j = 0; j < lrcNodes[i]["time"].length; j++)
            {
                timeLine.push({
                        time: lrcNodes[i]["time"][j],
                        content_id: i,
                        data: lrcNodes[i]
                });
            }
        }
        /*对时间标签排序*/
        // var swap: TimeNode;
        // for (var i = 0; i < timeLine.length; i++) {
        //     for (var j = 0; j < timeLine.length; j++) {
        //         if (j !== timeLine.length - 1 && timeLine[j].time > timeLine[j + 1].time) {
        //             swap = timeLine[j];
        //             timeLine[j] = timeLine[j+1];
        //             timeLine[j+1] = swap;
        //         }
        //     }
        // }
        timeLine.sort((a, b) => a.time > b.time ? 1 : -1);
        // timeLine.push({time:Infinity, content_id:Infinity, data: null});

        return timeLine;
    }
}



function parseLrcLine(text: string): LrcNode {
    /* 若是空行返回 */
    if(!text.trim()) return null;
    /* 时间标签
     * 标准格式:[数字:数字.数字]。RegExp:/\[\d*:\d*.\d*\]/g;
     * 兼容格式:[数字:数字:数字]以及[数字:数字]。在上述RegExp中将"."替换为"[\.\:]?"
     */
    var times = text.match(/\[\d*:\d*[\.\:]?\d*\]/g);
    if(times) {
        for(var i = 0;i < times.length;i++) {
            /*从正文中去除所有时间标签*/
            text = text.replace(times[i],"");
            /*去除中括号*/
            times[i] = times[i].replace("[","").replace("]","");
            /*将分和秒分开*/
            times[i] = <any>times[i].split(":");
            /*兼容非标准格式[mm:ss:nn].把第二个冒号替换为点号*/
            if(times[i].length === 3) {
                times[i][1] = times[i][1] + "." + times[i][2];
            }
            /*转换为秒数*/
            times[i] = ((+times[i][0])*60 + (+times[i][1])).toString();
        }
    }
    
    /* 其他标签
     * 格式:[字符:字符]
     * TODO:目前不作处理
     */
    var labels = text.match(/\[[\s\S]*:[\s\S]*\]/g);
    
    if(labels) {
        console.log("各类奇怪标签",[labels]);
        for(i=0;i<labels.length;i++) {
            
            text=text.replace(labels[i],"");
        }
    }
    var content = text;
    if(times) {
        return {
            time: times.map(Number),
            specialLabels: labels,
            content: content
        };
    }
    /*若没有时间标签则做空行处理*/
    else {
        return null;
    }
}
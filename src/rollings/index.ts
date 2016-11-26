export { Connector } from './media/connector';
export { Media as IMedia } from './media/media';
export { HTMLMedia } from './media/htmlmedia';
export { DanmakuViewer } from './danmaku/viewer';
export { BilibiliDanmakuDocument } from './danmaku/bilibili';

import { Media as IMedia } from './media/media';
import { Document, Connector } from './media/connector';
import { BilibiliDanmakuDocument } from './danmaku/bilibili';
import { DanmakuViewer } from './danmaku/viewer';
import config from '../config';

export function connect(media: IMedia, doc: Document<any>) {
    return new Connector(media, doc);
}

export function danmaku(video: IMedia, text: string) {
    var conn = connect(video, new BilibiliDanmakuDocument(text));
    var viewer = new DanmakuViewer(video);
    conn.addView(viewer);
    return viewer;
}

export var DEBUG = 0;
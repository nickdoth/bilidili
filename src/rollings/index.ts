export { Connector } from './media/connector';
export { Media as IMedia } from './media/media';
export { HTMLMedia } from './media/htmlmedia';
export { DanmakuViewer } from './danmaku/viewer';
export { BilibiliDanmakuDocument } from './danmaku/bilibili';

import { Media as IMedia } from './media/media';
import { Document, Connector } from './media/connector';
export function connect(media: IMedia, doc: Document<any>) {
    return new Connector(media, doc);
}
export var DEBUG = 0;
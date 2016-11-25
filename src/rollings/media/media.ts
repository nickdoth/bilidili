import { EventEmitter } from 'events';


export interface Media {

    //load media file from $url
    load(url);

    //get current loaded media
    getUrl(): string;

    //play current media
    play();

    //pause current media
    pause();

    //set current playing time
    setCurrentTime(percent: number);

    //get current playing time
    getCurrentTime(): number;

    //get media duration
    getDuration(): number;

    //set media auto-loop or not
    setLoop(bool: boolean);

    isPaused(): boolean;

    isPlaying(): boolean;

    isLoop(): boolean;

    isEnded(): boolean;

    isLoaded(): boolean;

    on(type: 'play', listener: () => void);
    on(type: 'load', listener: () => void);
    on(type: 'ended', listener: () => void);
    on(type: 'timeupdate', listener: (curtime: number) => void);
    on(type: string, listener: Function);

    once(type: 'play', listener: () => void);
    once(type: 'load', listener: () => void);
    once(type: 'ended', listener: () => void);
    once(type: 'timeupdate', listener: (curtime: number) => void);
    once(type: string, listener: Function);

}

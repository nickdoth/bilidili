export var config = {
    'danmakuViewer': {
        renderClass: 'DanmakuDOM',
        rollingDuration: 8000,
        defaultFontSize: 25,
        showFps: true
    }
}

export default function applyConfig(obj: any, configSet: string) {
    for (let configKey in config[configSet]) {
        obj[configKey] = config[configSet][configKey];
    }

    return obj;
};
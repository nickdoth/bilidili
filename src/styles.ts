export var stylesheet = {
    danmaku: {
        'position': 'fixed',
        'z-index': '1900',
        'font-weight': 'normal',
        'text-shadow': '-1px 0 black, 0 1px black, 1px 0 black, 0 -1px black',
        'white-space': 'nowrap',
        'box-sizing': 'border-box',
        'border': '1px solid transparent',

        ':hover': {
            'border': '1px solid #fff'
        }
    },

    fpsNode: {
        'position': 'fixed',
        'z-index': '1500',
        'top': '5px',
        'right': '5px',
        'color': '#fff'
    }
}

export function applyStyle(stylesObj: any, base = uniqueClass(), styleEl?: HTMLStyleElement) {
    var style: string[] = [];
    var classes: any = {};
    if (!styleEl) {
        styleEl = document.createElement('style');
        document.head.appendChild(styleEl);
    }
    var sheet = styleEl.sheet as CSSStyleSheet;

    Object.keys(stylesObj).map(s => [s, stylesObj[s]]).forEach(function([sel, sh]) {
        var uniqueSelector = `${base}_${sel}`;
        classes[sel] = uniqueSelector;
        sheet.insertRule(`.${uniqueSelector} ${stylesheetBody(sh, '.' + uniqueSelector)}`);
    });

    function stylesheetBody(styles: any, parentSelector: string) {
        return '{' + Object.keys(styles).map(s => {
            if (typeof styles[s] === 'object') {
                // sub-style
                // return applyStyle({[s]: style[s]}, `${base}_${sel}`, styleEl);
                sheet.insertRule(`${parentSelector}${s} ${stylesheetBody(styles[s], `${parentSelector}${s}`)}`);
            }
            return `${s}: ${styles[s]};`
        }).join('\n') + '}';
    }

    return classes;
}

    

function uniqueClass() {
    return '_css_' + Math.floor(Math.random() * 100000).toString(26)
}

var styles = applyStyle(stylesheet);
export default styles;
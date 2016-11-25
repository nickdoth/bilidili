import { ILyricViewer, TimeLine } from '../media/connector';
import { LrcNode } from './lrc-document';

export class FadeViewer implements ILyricViewer<LrcNode> {

    template = document.getElementById('lrc-template');
    sw = true;
    current: HTMLElement = null;

    init() {
    	// Nothing	
    }

    update(matches: number[], timeLine: TimeLine<LrcNode>) {
    	var n = this.sw? 0 : 1;
    	// var node = document.getElementsByClassName('nd-lyric-fade-' + n)[0];
    	var node = this.current;
        node && fadeOut(node, () => {
            // console.log('remove');
            try {
                document.body.removeChild(node);
            }
            catch (e) {

            }
            // createFadeNode(lyricDOM, text);
        });
    	// this.sw = !this.sw;
    	this.current = null;
    	this.createFadeNode(timeLine[matches[0]].data.content);

    }

    createFadeNode(text) {
    	text = hackText(text);
    	var n = this.sw? 0 : 1;
    	var node = <HTMLElement>this.template.cloneNode(true);
    	this.current = node;
    	// node.lyricCtrl = this.lyricCtrl;
    	node.id = null;
    	node.style.opacity = '0';
    	node.style.display = 'block';
    	node.classList.add('nd-lyric-fade-' + n);
    	
    	var textChild = <HTMLElement>node.getElementsByClassName('lyric-text')[0];
    	textChild.innerHTML = text;
    	document.body.appendChild(node);
    	fadeIn(node);
    }

    destroy() {
    	var nodes = document.querySelectorAll('.nd-lyric-fade-1, .nd-lyric-fade-0');
    	for(var n = 0; n < nodes.length; n++) {
    		try {
                document.body.removeChild(nodes[n]);
            }
            catch (e) {

            } 
    	}
    }

};


function fadeIn(node: HTMLElement, callback?: Function) {
	var delta = 0.1;
	var dur = 12;
	node.style.opacity = <any>0;
	function _fadeIn() {
		node.style.opacity = <any>+node.style.opacity + delta;
		// console.log(node.style.opacity)
		if(+node.style.opacity < 1) {
			setTimeout(_fadeIn, dur);
		}
		else {
			node.style.opacity = <any>1;
			callback && callback();
		}
	}

	_fadeIn();
}

function fadeOut(node: HTMLElement, callback?: Function) {
	var delta = 10;
	var dur = 19;
	var apacity = 100;
	node.style.opacity = '1';
	function _fadeOut() {
		apacity -= delta;
		node.style.opacity = apacity / 100 + '';
		if(apacity > 0) {
			setTimeout(_fadeOut, dur);
		}
		else {
			node.style.opacity = '0';
			callback && callback();
		}
	}

	_fadeOut();
}

function hackText(text) {
	var a = text.split('/');
	return '<div class="align-right">' + (a[0] || '') + '</div>' +
		   '<div class="align-right lyric-orange">' + (a[1] || '') + '</div>';
}


function refreshLyric(txt, callback) {
    var lyricDOM = document.getElementById('nd-lyric');
    var textNode = lyricDOM.childNodes[0];
    textNode ? textNode.nodeValue = txt : lyricDOM.innerHTML = txt;
    callback && callback();
}


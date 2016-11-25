import { ILyricViewer, TimeLine } from '../media/connector';
import { LrcNode } from './lrc-document';

export class RollingViewer implements ILyricViewer<LrcNode> {

	lyricDOMNodes: HTMLElement[];

    init(timeLine: TimeLine<LrcNode>) {
		document.body.style.color = '#fff';

		for (let i = 0; i < 13; i++) {
			let elem = document.createElement('pre');
			elem.style.display = 'block';
			elem.innerHTML = '　';
			document.body.appendChild(elem);
		}

		this.lyricDOMNodes = timeLine.map(t => {
			let elem = document.createElement('pre');
			elem.style.display = 'block';
			elem.innerHTML = t.data.content || '　';
			document.body.appendChild(elem);
			return elem;
		});

		// loop.run();

    }

    update(matches: number[], timeLine: TimeLine<LrcNode>) {
		for (let i = 0; i < this.lyricDOMNodes.length; i++) {
			if (matches.indexOf(i) > -1) {
				this.lyricDOMNodes[i].style.color = '#faa';
				// var next = getNext(timeLine, i);
				if (timeLine[i + 1]) {
					// document.documentElement.scrollTop = this.lyricDOMNodes[i].offsetTop -
					// 	innerHeight / 2;
					let keepTime = (timeLine[i + 1].time - timeLine[i].time);
					// if (keepTime < 100) keepTime = 100;

					((elem1, elem2, keepTime) => {
						setTimeout(() => {
							fade(elem1, elem2, keepTime *  0.25);
						}, keepTime * 0.75);
					})(this.lyricDOMNodes[i], this.lyricDOMNodes[i + 1], keepTime);
					
				}
				else {
					// eof
					document.documentElement.scrollTop = 0;
				}
				// console.log(this.lyricDOMNodes[i].offsetTop +
				// 	innerHeight / 2);
			}
			else {
				this.lyricDOMNodes[i].style.color = '';
			}
		}
    }

    destroy() {
		
    }

}


// class Loop {
// 	targetTop: number;

// 	run() {
// 		let frame = () => {
// 			document.documentElement.scrollTop += ppms;
// 			if (ppms > 0) {
// 				if (document.documentElement.scrollTop < this.targetTop) {
// 					setTimeout(frame, mspf);
// 				}
// 				else {
// 					// document.documentElement.scrollTop = this.targetTop;
// 				}
// 			}
// 			else {
// 				if (document.documentElement.scrollTop > this.targetTop) {
// 					setTimeout(frame, mspf);
// 				}
// 				else {
// 					// document.documentElement.scrollTop = this.targetTop;
// 				}
// 			}

// 		}

// 		frame();
// 	}
// }

function fade(elem1: HTMLElement, elem2: HTMLElement, dT: number) {
	// var dT = 100;
	if (dT <= 0) dT = 1;

	// var currentTop = elem1.offsetTop - innerHeight / 2;
	var targetTop = elem2.offsetTop - innerHeight / 2;

	var ppms = (targetTop - document.documentElement.scrollTop) / dT; // px/ms

	if (ppms === 0) {
		return;
	}

	var mspf = 16; // ms/frame

	var ppf = ppms / mspf;

	console.log(`
		dT: ${dT};
		currentTop: ${document.documentElement.scrollTop};
		targetTop: ${targetTop};
		ppms: ${ppms};
		ppf: ${ppf};
	`);

	function frame() {
		document.documentElement.scrollTop += ppf;
		if (document.documentElement.scrollTop >= document.documentElement.scrollHeight - innerHeight) {
			return;
		}

		if (ppms > 0) {
			if (document.documentElement.scrollTop < targetTop) {
				setTimeout(frame, mspf);
			}
			else {
				document.documentElement.scrollTop = targetTop;
			}
		}
		else {
			if (document.documentElement.scrollTop > targetTop) {
				setTimeout(frame, mspf);
			}
			else {
				document.documentElement.scrollTop = targetTop;
			}
		}
			
	}

	frame();
	
}

function getNext(t: TimeLine<LrcNode>, i: number) {
	++i;
	while (t[i] && t[i].data.content === '') {
		++i;
	}

	return --i;
}
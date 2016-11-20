var PageAgent = {
	onMessage(listener: Function) {
		if (location.protocol === 'file:') {
			window.addEventListener('lo-message', (ev) => {
				listener(JSON.parse(document.getElementById('_msg_response').innerHTML));
			});
		}
		else {
			window.addEventListener('message', (ev) => listener(ev.data));
		}
	},

	postMessage(data: any) {
		// console.log('core:postMessage(data, origin)',location.protocol);
		if (location.protocol === 'file:') {
			var ev = new Event('lo-message') as any;
			var msgNode = document.getElementById('_msg_response') as HTMLDivElement || 
				document.body.appendChild(document.createElement('script')) as HTMLDivElement
			msgNode.id = '_msg_response';
			(<any>msgNode).type = 'application/json';
			msgNode.innerHTML = JSON.stringify(data);

			window.dispatchEvent(ev);
		}
		else {
			window.postMessage(data, location.origin);
		}
	},

    silly(...args: any[]) {
        console.log.apply(console, args);
    }
};

export default PageAgent;
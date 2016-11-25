/// <reference path="../../../typings/index.d.ts" />

var xorKey = ['@', 'G', 'a', 'w', '^', '2', 't', 'G', 'Q', '6', '1', '-', 'Î', 'Ò', 'n', 'i'].map(n => n.charCodeAt(0));
var head = ['k', 'r', 'c', '1'].map(n => n.charCodeAt(0));

interface Seq<T> {
	[k: number]: T;
	length: number;
}

class KrcDocument {
	private zipData: Buffer;

	constructor(data: ArrayBuffer) {
		this.zipData = new Buffer(new Uint8Array(data, 4));

		for (var i = 0; i < this.zipData.length; i++) {
			this.zipData[i] = this.zipData[i] ^ xorKey[i % 16];
		}
	}
}
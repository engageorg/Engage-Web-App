(this.webpackJsonpengagev2=this.webpackJsonpengagev2||[]).push([[3],{312:function(r,e,t){var n=t(313);r.exports=function(r){if(137!==r[0])throw new Error("Invalid .png file header");if(80!==r[1])throw new Error("Invalid .png file header");if(78!==r[2])throw new Error("Invalid .png file header");if(71!==r[3])throw new Error("Invalid .png file header");if(13!==r[4])throw new Error("Invalid .png file header: possibly caused by DOS-Unix line ending conversion?");if(10!==r[5])throw new Error("Invalid .png file header: possibly caused by DOS-Unix line ending conversion?");if(26!==r[6])throw new Error("Invalid .png file header");if(10!==r[7])throw new Error("Invalid .png file header: possibly caused by DOS-Unix line ending conversion?");var e=!1,t=[],i=8;for(;i<r.length;){a[3]=r[i++],a[2]=r[i++],a[1]=r[i++],a[0]=r[i++];var u=c[0]+4,s=new Uint8Array(u);s[0]=r[i++],s[1]=r[i++],s[2]=r[i++],s[3]=r[i++];var f=String.fromCharCode(s[0])+String.fromCharCode(s[1])+String.fromCharCode(s[2])+String.fromCharCode(s[3]);if(!t.length&&"IHDR"!==f)throw new Error("IHDR header missing");if("IEND"===f){e=!0,t.push({name:f,data:new Uint8Array(0)});break}for(var d=4;d<u;d++)s[d]=r[i++];a[3]=r[i++],a[2]=r[i++],a[1]=r[i++],a[0]=r[i++];var l=o[0];if(n.buf(s)!==l)throw new Error("CRC values for "+f+" header do not match, PNG file is likely corrupted");var p=new Uint8Array(s.buffer.slice(4));t.push({name:f,data:p})}if(!e)throw new Error(".png file ended prematurely: no IEND header was found");return t};var a=new Uint8Array(4),o=new Int32Array(a.buffer),c=new Uint32Array(a.buffer)},313:function(r,e,t){(function(r){var t;t=function(e){e.version="0.3.0";var t=function(){for(var r=0,e=new Array(256),t=0;256!=t;++t)r=1&(r=1&(r=1&(r=1&(r=1&(r=1&(r=1&(r=1&(r=t)?-306674912^r>>>1:r>>>1)?-306674912^r>>>1:r>>>1)?-306674912^r>>>1:r>>>1)?-306674912^r>>>1:r>>>1)?-306674912^r>>>1:r>>>1)?-306674912^r>>>1:r>>>1)?-306674912^r>>>1:r>>>1)?-306674912^r>>>1:r>>>1,e[t]=r;return"undefined"!==typeof Int32Array?new Int32Array(e):e}(),n="undefined"!==typeof r;function a(r){for(var e=-1,n=0,a=r.length-7;n<a;)e=(e=(e=(e=(e=(e=(e=(e=e>>>8^t[255&(e^r[n++])])>>>8^t[255&(e^r[n++])])>>>8^t[255&(e^r[n++])])>>>8^t[255&(e^r[n++])])>>>8^t[255&(e^r[n++])])>>>8^t[255&(e^r[n++])])>>>8^t[255&(e^r[n++])])>>>8^t[255&(e^r[n++])];for(;n<a+7;)e=e>>>8^t[255&(e^r[n++])];return-1^e}e.table=t,e.bstr=function(e){if(e.length>32768&&n)return a(new r(e));for(var o=-1,c=e.length-1,i=0;i<c;)o=t[255&(o^e.charCodeAt(i++))]^o>>>8,o=t[255&(o^e.charCodeAt(i++))]^o>>>8;return i===c&&(o=o>>>8^t[255&(o^e.charCodeAt(i))]),-1^o},e.buf=function(r){if(r.length>1e4)return a(r);for(var e=-1,n=0,o=r.length-3;n<o;)e=(e=(e=(e=e>>>8^t[255&(e^r[n++])])>>>8^t[255&(e^r[n++])])>>>8^t[255&(e^r[n++])])>>>8^t[255&(e^r[n++])];for(;n<o+3;)e=e>>>8^t[255&(e^r[n++])];return-1^e},e.str=function(r){for(var e,n,a=-1,o=0,c=r.length;o<c;)(e=r.charCodeAt(o++))<128?a=a>>>8^t[255&(a^e)]:e<2048?a=(a=a>>>8^t[255&(a^(192|e>>6&31))])>>>8^t[255&(a^(128|63&e))]:e>=55296&&e<57344?(e=64+(1023&e),n=1023&r.charCodeAt(o++),a=(a=(a=(a=a>>>8^t[255&(a^(240|e>>8&7))])>>>8^t[255&(a^(128|e>>2&63))])>>>8^t[255&(a^(128|n>>6&15|3&e))])>>>8^t[255&(a^(128|63&n))]):a=(a=(a=a>>>8^t[255&(a^(224|e>>12&15))])>>>8^t[255&(a^(128|e>>6&63))])>>>8^t[255&(a^(128|63&e))];return-1^a}},"undefined"===typeof DO_NOT_EXPORT_CRC?t(e):t({})}).call(this,t(67).Buffer)},314:function(r,e,t){e.encode=t(316),e.decode=t(317)},315:function(r,e,t){var n=t(318),a=t(313);r.exports=function(r){var e,t=8,u=t;for(e=0;e<r.length;e++)t+=r[e].data.length,t+=12;var s=new Uint8Array(t);for(s[0]=137,s[1]=80,s[2]=78,s[3]=71,s[4]=13,s[5]=10,s[6]=26,s[7]=10,e=0;e<r.length;e++){var f=r[e],d=f.name,l=f.data,p=l.length,w=[d.charCodeAt(0),d.charCodeAt(1),d.charCodeAt(2),d.charCodeAt(3)];i[0]=p,s[u++]=o[3],s[u++]=o[2],s[u++]=o[1],s[u++]=o[0],s[u++]=w[0],s[u++]=w[1],s[u++]=w[2],s[u++]=w[3];for(var h=0;h<p;)s[u++]=l[h++];var v=w.concat(n(l)),x=a.buf(v);c[0]=x,s[u++]=o[3],s[u++]=o[2],s[u++]=o[1],s[u++]=o[0]}return s};var o=new Uint8Array(4),c=new Int32Array(o.buffer),i=new Uint32Array(o.buffer)},316:function(r,e){r.exports=function(r,e){if(r=String(r),e=String(e),!/^[\x00-\xFF]+$/.test(r)||!/^[\x00-\xFF]+$/.test(e))throw new Error("Only Latin-1 characters are permitted in PNG tEXt chunks. You might want to consider base64 encoding and/or zEXt compression");if(r.length>=80)throw new Error('Keyword "'+r+'" is longer than the 79-character limit imposed by the PNG specification');for(var t,n=r.length+e.length+1,a=new Uint8Array(n),o=0,c=0;c<r.length;c++){if(!(t=r.charCodeAt(c)))throw new Error("0x00 character is not permitted in tEXt keywords");a[o++]=t}a[o++]=0;for(var i=0;i<e.length;i++){if(!(t=e.charCodeAt(i)))throw new Error("0x00 character is not permitted in tEXt content");a[o++]=t}return{name:"tEXt",data:a}}},317:function(r,e){r.exports=function(r){r.data&&r.name&&(r=r.data);for(var e=!0,t="",n="",a=0;a<r.length;a++){var o=r[a];if(e)o?n+=String.fromCharCode(o):e=!1;else{if(!o)throw new Error("Invalid NULL character found. 0x00 character is not permitted in tEXt content");t+=String.fromCharCode(o)}}return{keyword:n,text:t}}},318:function(r,e){r.exports=function(r,e,t){var n=[],a=r.length;if(0===a)return n;var o=e<0?Math.max(0,e+a):e||0;for(void 0!==t&&(a=t<0?t+a:t);a-- >o;)n[a-o]=r[a];return n}},319:function(r,e,t){"use strict";t.r(e),t.d(e,"getTEXtChunk",(function(){return h})),t.d(e,"encodePngMetadata",(function(){return v})),t.d(e,"decodePngMetadata",(function(){return x})),t.d(e,"encodeSvgMetadata",(function(){return y})),t.d(e,"decodeSvgMetadata",(function(){return b}));var n=t(4),a=t.n(n),o=t(8),c=t(312),i=t.n(c),u=t(314),s=t.n(u),f=t(315),d=t.n(f),l=t(88),p=t(5),w=function(r){return"arrayBuffer"in r?r.arrayBuffer():new Promise((function(e,t){var n=new FileReader;n.onload=function(r){var n;if(!(null===(n=r.target)||void 0===n?void 0:n.result))return t(new Error("couldn't convert blob to ArrayBuffer"));e(r.target.result)},n.readAsArrayBuffer(r)}))},h=function(){var r=Object(o.a)(a.a.mark((function r(e){var t,n;return a.a.wrap((function(r){for(;;)switch(r.prev=r.next){case 0:return r.t0=i.a,r.t1=Uint8Array,r.next=4,w(e);case 4:if(r.t2=r.sent,r.t3=new r.t1(r.t2),t=(0,r.t0)(r.t3),!(n=t.find((function(r){return"tEXt"===r.name})))){r.next=10;break}return r.abrupt("return",s.a.decode(n.data));case 10:return r.abrupt("return",null);case 11:case"end":return r.stop()}}),r)})));return function(e){return r.apply(this,arguments)}}(),v=function(){var r=Object(o.a)(a.a.mark((function r(e){var t,n,o,c;return a.a.wrap((function(r){for(;;)switch(r.prev=r.next){case 0:return t=e.blob,n=e.metadata,r.t0=i.a,r.t1=Uint8Array,r.next=5,w(t);case 5:return r.t2=r.sent,r.t3=new r.t1(r.t2),o=(0,r.t0)(r.t3),r.t4=s.a,r.t5=p.C.excalidraw,r.t6=JSON,r.next=13,Object(l.e)({text:n,compress:!0});case 13:return r.t7=r.sent,r.t8=r.t6.stringify.call(r.t6,r.t7),c=r.t4.encode.call(r.t4,r.t5,r.t8),o.splice(-1,0,c),r.abrupt("return",new Blob([d()(o)],{type:p.C.png}));case 18:case"end":return r.stop()}}),r)})));return function(e){return r.apply(this,arguments)}}(),x=function(){var r=Object(o.a)(a.a.mark((function r(e){var t,n;return a.a.wrap((function(r){for(;;)switch(r.prev=r.next){case 0:return r.next=2,h(e);case 2:if((null===(t=r.sent)||void 0===t?void 0:t.keyword)!==p.C.excalidraw){r.next=19;break}if(r.prev=4,"encoded"in(n=JSON.parse(t.text))){r.next=10;break}if(!("type"in n)||n.type!==p.s.excalidraw){r.next=9;break}return r.abrupt("return",t.text);case 9:throw new Error("FAILED");case 10:return r.next=12,Object(l.c)(n);case 12:return r.abrupt("return",r.sent);case 15:throw r.prev=15,r.t0=r.catch(4),console.error(r.t0),new Error("FAILED");case 19:throw new Error("INVALID");case 20:case"end":return r.stop()}}),r,null,[[4,15]])})));return function(e){return r.apply(this,arguments)}}(),y=function(){var r=Object(o.a)(a.a.mark((function r(e){var t,n,o;return a.a.wrap((function(r){for(;;)switch(r.prev=r.next){case 0:return t=e.text,r.t0=l.f,r.t1=JSON,r.next=5,Object(l.e)({text:t});case 5:return r.t2=r.sent,r.t3=r.t1.stringify.call(r.t1,r.t2),r.next=9,(0,r.t0)(r.t3,!0);case 9:return n=r.sent,o="",o+="\x3c!-- payload-type:".concat(p.C.excalidraw," --\x3e"),o+="\x3c!-- payload-version:2 --\x3e",o+="\x3c!-- payload-start --\x3e",o+=n,o+="\x3c!-- payload-end --\x3e",r.abrupt("return",o);case 17:case"end":return r.stop()}}),r)})));return function(e){return r.apply(this,arguments)}}(),b=function(){var r=Object(o.a)(a.a.mark((function r(e){var t,n,o,c,i,u,s;return a.a.wrap((function(r){for(;;)switch(r.prev=r.next){case 0:if(!(t=e.svg).includes("payload-type:".concat(p.C.excalidraw))){r.next=26;break}if(n=t.match(/<!-- payload-start -->(.+?)<!-- payload-end -->/)){r.next=5;break}throw new Error("INVALID");case 5:return o=t.match(/<!-- payload-version:(\d+) -->/),c=(null===o||void 0===o?void 0:o[1])||"1",i="1"!==c,r.prev=8,r.next=11,Object(l.a)(n[1],i);case 11:if(u=r.sent,"encoded"in(s=JSON.parse(u))){r.next=17;break}if(!("type"in s)||s.type!==p.s.excalidraw){r.next=16;break}return r.abrupt("return",u);case 16:throw new Error("FAILED");case 17:return r.next=19,Object(l.c)(s);case 19:return r.abrupt("return",r.sent);case 22:throw r.prev=22,r.t0=r.catch(8),console.error(r.t0),new Error("FAILED");case 26:throw new Error("INVALID");case 27:case"end":return r.stop()}}),r,null,[[8,22]])})));return function(e){return r.apply(this,arguments)}}()},329:function(r,e,t){"use strict";t.r(e),t.d(e,"getTEXtChunk",(function(){return h})),t.d(e,"encodePngMetadata",(function(){return v})),t.d(e,"decodePngMetadata",(function(){return x})),t.d(e,"encodeSvgMetadata",(function(){return y})),t.d(e,"decodeSvgMetadata",(function(){return b}));var n=t(4),a=t.n(n),o=t(8),c=t(312),i=t.n(c),u=t(314),s=t.n(u),f=t(315),d=t.n(f),l=t(89),p=t(6),w=function(r){return"arrayBuffer"in r?r.arrayBuffer():new Promise((function(e,t){var n=new FileReader;n.onload=function(r){var n;if(!(null===(n=r.target)||void 0===n?void 0:n.result))return t(new Error("couldn't convert blob to ArrayBuffer"));e(r.target.result)},n.readAsArrayBuffer(r)}))},h=function(){var r=Object(o.a)(a.a.mark((function r(e){var t,n;return a.a.wrap((function(r){for(;;)switch(r.prev=r.next){case 0:return r.t0=i.a,r.t1=Uint8Array,r.next=4,w(e);case 4:if(r.t2=r.sent,r.t3=new r.t1(r.t2),t=(0,r.t0)(r.t3),!(n=t.find((function(r){return"tEXt"===r.name})))){r.next=10;break}return r.abrupt("return",s.a.decode(n.data));case 10:return r.abrupt("return",null);case 11:case"end":return r.stop()}}),r)})));return function(e){return r.apply(this,arguments)}}(),v=function(){var r=Object(o.a)(a.a.mark((function r(e){var t,n,o,c;return a.a.wrap((function(r){for(;;)switch(r.prev=r.next){case 0:return t=e.blob,n=e.metadata,r.t0=i.a,r.t1=Uint8Array,r.next=5,w(t);case 5:return r.t2=r.sent,r.t3=new r.t1(r.t2),o=(0,r.t0)(r.t3),r.t4=s.a,r.t5=p.C.excalidraw,r.t6=JSON,r.next=13,Object(l.e)({text:n,compress:!0});case 13:return r.t7=r.sent,r.t8=r.t6.stringify.call(r.t6,r.t7),c=r.t4.encode.call(r.t4,r.t5,r.t8),o.splice(-1,0,c),r.abrupt("return",new Blob([d()(o)],{type:p.C.png}));case 18:case"end":return r.stop()}}),r)})));return function(e){return r.apply(this,arguments)}}(),x=function(){var r=Object(o.a)(a.a.mark((function r(e){var t,n;return a.a.wrap((function(r){for(;;)switch(r.prev=r.next){case 0:return r.next=2,h(e);case 2:if((null===(t=r.sent)||void 0===t?void 0:t.keyword)!==p.C.excalidraw){r.next=19;break}if(r.prev=4,"encoded"in(n=JSON.parse(t.text))){r.next=10;break}if(!("type"in n)||n.type!==p.s.excalidraw){r.next=9;break}return r.abrupt("return",t.text);case 9:throw new Error("FAILED");case 10:return r.next=12,Object(l.c)(n);case 12:return r.abrupt("return",r.sent);case 15:throw r.prev=15,r.t0=r.catch(4),console.error(r.t0),new Error("FAILED");case 19:throw new Error("INVALID");case 20:case"end":return r.stop()}}),r,null,[[4,15]])})));return function(e){return r.apply(this,arguments)}}(),y=function(){var r=Object(o.a)(a.a.mark((function r(e){var t,n,o;return a.a.wrap((function(r){for(;;)switch(r.prev=r.next){case 0:return t=e.text,r.t0=l.f,r.t1=JSON,r.next=5,Object(l.e)({text:t});case 5:return r.t2=r.sent,r.t3=r.t1.stringify.call(r.t1,r.t2),r.next=9,(0,r.t0)(r.t3,!0);case 9:return n=r.sent,o="",o+="\x3c!-- payload-type:".concat(p.C.excalidraw," --\x3e"),o+="\x3c!-- payload-version:2 --\x3e",o+="\x3c!-- payload-start --\x3e",o+=n,o+="\x3c!-- payload-end --\x3e",r.abrupt("return",o);case 17:case"end":return r.stop()}}),r)})));return function(e){return r.apply(this,arguments)}}(),b=function(){var r=Object(o.a)(a.a.mark((function r(e){var t,n,o,c,i,u,s;return a.a.wrap((function(r){for(;;)switch(r.prev=r.next){case 0:if(!(t=e.svg).includes("payload-type:".concat(p.C.excalidraw))){r.next=26;break}if(n=t.match(/<!-- payload-start -->(.+?)<!-- payload-end -->/)){r.next=5;break}throw new Error("INVALID");case 5:return o=t.match(/<!-- payload-version:(\d+) -->/),c=(null===o||void 0===o?void 0:o[1])||"1",i="1"!==c,r.prev=8,r.next=11,Object(l.a)(n[1],i);case 11:if(u=r.sent,"encoded"in(s=JSON.parse(u))){r.next=17;break}if(!("type"in s)||s.type!==p.s.excalidraw){r.next=16;break}return r.abrupt("return",u);case 16:throw new Error("FAILED");case 17:return r.next=19,Object(l.c)(s);case 19:return r.abrupt("return",r.sent);case 22:throw r.prev=22,r.t0=r.catch(8),console.error(r.t0),new Error("FAILED");case 26:throw new Error("INVALID");case 27:case"end":return r.stop()}}),r,null,[[8,22]])})));return function(e){return r.apply(this,arguments)}}()}}]);
//# sourceMappingURL=image.74dbab4f.chunk.js.map
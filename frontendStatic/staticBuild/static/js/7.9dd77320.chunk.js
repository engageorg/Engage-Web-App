/*! For license information please see 7.9dd77320.chunk.js.LICENSE.txt */
(this.webpackJsonpengagev2=this.webpackJsonpengagev2||[]).push([[7],{328:function(e,t,r){"use strict";r.r(t);var n=r(4),a=r(9),i=r(8);function u(e){var t,r,n,a=2;for("undefined"!==typeof Symbol&&(r=Symbol.asyncIterator,n=Symbol.iterator);a--;){if(r&&null!=(t=e[r]))return t.call(e);if(n&&null!=(t=e[n]))return new s(t.call(e));r="@@asyncIterator",n="@@iterator"}throw new TypeError("Object is not async iterable")}function s(e){function t(e){if(Object(e)!==e)return Promise.reject(new TypeError(e+" is not an object."));var t=e.done;return Promise.resolve(e.value).then((function(e){return{value:e,done:t}}))}return s=function(e){this.s=e,this.n=e.next},s.prototype={s:null,n:null,next:function(){return t(this.n.apply(this.s,arguments))},return:function(e){var r=this.s.return;return void 0===r?Promise.resolve({value:e,done:!0}):t(r.apply(this.s,arguments))},throw:function(e){var r=this.s.return;return void 0===r?Promise.reject(e):t(r.apply(this.s,arguments))}},new s(e)}var c=function(){var e=Object(i.a)(n.mark((function e(t,r){var i,s,o,l,f,p,v,h,b,d=arguments;return n.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:i=d.length>2&&void 0!==d[2]?d[2]:t.name,s=[],o=[],l=!1,f=!1,e.prev=4,v=function(){var e=b.value,n="".concat(i,"/").concat(e.name);"file"===e.kind?o.push(e.getFile().then((function(e){return e.directoryHandle=t,Object.defineProperty(e,"webkitRelativePath",{configurable:!0,enumerable:!0,get:function(){return n}})}))):"directory"===e.kind&&r&&s.push(c(e,r,n))},h=u(t.values());case 7:return e.next=9,h.next();case 9:if(!(l=!(b=e.sent).done)){e.next=14;break}v();case 11:l=!1,e.next=7;break;case 14:e.next=20;break;case 16:e.prev=16,e.t0=e.catch(4),f=!0,p=e.t0;case 20:if(e.prev=20,e.prev=21,!l||null==h.return){e.next=25;break}return e.next=25,h.return();case 25:if(e.prev=25,!f){e.next=28;break}throw p;case 28:return e.finish(25);case 29:return e.finish(20);case 30:return e.t1=[],e.t2=a.a,e.next=34,Promise.all(s);case 34:return e.t3=e.sent.flat(),e.t4=(0,e.t2)(e.t3),e.t5=a.a,e.next=39,Promise.all(o);case 39:return e.t6=e.sent,e.t7=(0,e.t5)(e.t6),e.abrupt("return",e.t1.concat.call(e.t1,e.t4,e.t7));case 42:case"end":return e.stop()}}),e,null,[[4,16,20,30],[21,,25,29]])})));return function(t,r){return e.apply(this,arguments)}}();t.default=Object(i.a)(n.mark((function e(){var t,r,a=arguments;return n.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return(t=a.length>0&&void 0!==a[0]?a[0]:{}).recursive=t.recursive||!1,e.next=4,window.showDirectoryPicker({id:t.id,startIn:t.startIn});case 4:return r=e.sent,e.abrupt("return",c(r,t.recursive));case 6:case"end":return e.stop()}}),e)})))}}]);
//# sourceMappingURL=7.9dd77320.chunk.js.map
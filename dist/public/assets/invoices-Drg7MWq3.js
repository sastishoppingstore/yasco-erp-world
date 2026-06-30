import{j as e}from"./ui-DXA0ZPrw.js";import{g as kt,r as Z}from"./vendor-Dj4APJbq.js";import{C as Mt,c as zt}from"./card-C-q3xrlD.js";import{a6 as V,a1 as Dt,ai as De,as as Lt,a0 as L,aj as Le,ak as qe,al as Ue,ad as H,x as Fe,v as qt}from"./index-DpZ5o7u_.js";import{L as K}from"./label-CeMyhxq5.js";import{T as _e,a as Ve,b as ae,c as z,d as He,e as D}from"./table-DZefjAVm.js";import{S as Qe,a as Oe,b as Ke,c as Ze,d as se}from"./select-Dbehsd1i.js";import{t as q}from"./index-HsANf_Et.js";import{P as Je}from"./plus-CcECLjFp.js";import{T as Ut}from"./trash-2-Ds4DSURf.js";import{E as Ft}from"./eye-BBcfiYnZ.js";import{Q as Ye}from"./qr-code-CK7r3vOJ.js";import{F as _t}from"./file-code-corner-DfqEmg2T.js";import{F as Vt}from"./file-pen-line-CPqX60QY.js";import{P as Ht}from"./printer-DkzJDT2i.js";import"./query-BSVeN4Sl.js";import"./charts-iOUL380-.js";import"./check-B8YqHAbR.js";import"./chevron-up-Du5GGyVV.js";var re={},ue,Ge;function Qt(){return Ge||(Ge=1,ue=function(){return typeof Promise=="function"&&Promise.prototype&&Promise.prototype.then}),ue}var fe={},X={},We;function $(){if(We)return X;We=1;let a;const r=[0,26,44,70,100,134,172,196,242,292,346,404,466,532,581,655,733,815,901,991,1085,1156,1258,1364,1474,1588,1706,1828,1921,2051,2185,2323,2465,2611,2761,2876,3034,3196,3362,3532,3706];return X.getSymbolSize=function(n){if(!n)throw new Error('"version" cannot be null or undefined');if(n<1||n>40)throw new Error('"version" should be in range from 1 to 40');return n*4+17},X.getSymbolTotalCodewords=function(n){return r[n]},X.getBCHDigit=function(s){let n=0;for(;s!==0;)n++,s>>>=1;return n},X.setToSJISFunction=function(n){if(typeof n!="function")throw new Error('"toSJISFunc" is not a valid function.');a=n},X.isKanjiModeEnabled=function(){return typeof a<"u"},X.toSJIS=function(n){return a(n)},X}var he={},Xe;function Me(){return Xe||(Xe=1,(function(a){a.L={bit:1},a.M={bit:0},a.Q={bit:3},a.H={bit:2};function r(s){if(typeof s!="string")throw new Error("Param is not a string");switch(s.toLowerCase()){case"l":case"low":return a.L;case"m":case"medium":return a.M;case"q":case"quartile":return a.Q;case"h":case"high":return a.H;default:throw new Error("Unknown EC Level: "+s)}}a.isValid=function(n){return n&&typeof n.bit<"u"&&n.bit>=0&&n.bit<4},a.from=function(n,t){if(a.isValid(n))return n;try{return r(n)}catch{return t}}})(he)),he}var ge,$e;function Ot(){if($e)return ge;$e=1;function a(){this.buffer=[],this.length=0}return a.prototype={get:function(r){const s=Math.floor(r/8);return(this.buffer[s]>>>7-r%8&1)===1},put:function(r,s){for(let n=0;n<s;n++)this.putBit((r>>>s-n-1&1)===1)},getLengthInBits:function(){return this.length},putBit:function(r){const s=Math.floor(this.length/8);this.buffer.length<=s&&this.buffer.push(0),r&&(this.buffer[s]|=128>>>this.length%8),this.length++}},ge=a,ge}var me,et;function Kt(){if(et)return me;et=1;function a(r){if(!r||r<1)throw new Error("BitMatrix size must be defined and greater than 0");this.size=r,this.data=new Uint8Array(r*r),this.reservedBit=new Uint8Array(r*r)}return a.prototype.set=function(r,s,n,t){const i=r*this.size+s;this.data[i]=n,t&&(this.reservedBit[i]=!0)},a.prototype.get=function(r,s){return this.data[r*this.size+s]},a.prototype.xor=function(r,s,n){this.data[r*this.size+s]^=n},a.prototype.isReserved=function(r,s){return this.reservedBit[r*this.size+s]},me=a,me}var xe={},tt;function Zt(){return tt||(tt=1,(function(a){const r=$().getSymbolSize;a.getRowColCoords=function(n){if(n===1)return[];const t=Math.floor(n/7)+2,i=r(n),o=i===145?26:Math.ceil((i-13)/(2*t-2))*2,c=[i-7];for(let l=1;l<t-1;l++)c[l]=c[l-1]-o;return c.push(6),c.reverse()},a.getPositions=function(n){const t=[],i=a.getRowColCoords(n),o=i.length;for(let c=0;c<o;c++)for(let l=0;l<o;l++)c===0&&l===0||c===0&&l===o-1||c===o-1&&l===0||t.push([i[c],i[l]]);return t}})(xe)),xe}var pe={},nt;function Jt(){if(nt)return pe;nt=1;const a=$().getSymbolSize,r=7;return pe.getPositions=function(n){const t=a(n);return[[0,0],[t-r,0],[0,t-r]]},pe}var ve={},rt;function Yt(){return rt||(rt=1,(function(a){a.Patterns={PATTERN000:0,PATTERN001:1,PATTERN010:2,PATTERN011:3,PATTERN100:4,PATTERN101:5,PATTERN110:6,PATTERN111:7};const r={N1:3,N2:3,N3:40,N4:10};a.isValid=function(t){return t!=null&&t!==""&&!isNaN(t)&&t>=0&&t<=7},a.from=function(t){return a.isValid(t)?parseInt(t,10):void 0},a.getPenaltyN1=function(t){const i=t.size;let o=0,c=0,l=0,h=null,m=null;for(let w=0;w<i;w++){c=l=0,h=m=null;for(let j=0;j<i;j++){let g=t.get(w,j);g===h?c++:(c>=5&&(o+=r.N1+(c-5)),h=g,c=1),g=t.get(j,w),g===m?l++:(l>=5&&(o+=r.N1+(l-5)),m=g,l=1)}c>=5&&(o+=r.N1+(c-5)),l>=5&&(o+=r.N1+(l-5))}return o},a.getPenaltyN2=function(t){const i=t.size;let o=0;for(let c=0;c<i-1;c++)for(let l=0;l<i-1;l++){const h=t.get(c,l)+t.get(c,l+1)+t.get(c+1,l)+t.get(c+1,l+1);(h===4||h===0)&&o++}return o*r.N2},a.getPenaltyN3=function(t){const i=t.size;let o=0,c=0,l=0;for(let h=0;h<i;h++){c=l=0;for(let m=0;m<i;m++)c=c<<1&2047|t.get(h,m),m>=10&&(c===1488||c===93)&&o++,l=l<<1&2047|t.get(m,h),m>=10&&(l===1488||l===93)&&o++}return o*r.N3},a.getPenaltyN4=function(t){let i=0;const o=t.data.length;for(let l=0;l<o;l++)i+=t.data[l];return Math.abs(Math.ceil(i*100/o/5)-10)*r.N4};function s(n,t,i){switch(n){case a.Patterns.PATTERN000:return(t+i)%2===0;case a.Patterns.PATTERN001:return t%2===0;case a.Patterns.PATTERN010:return i%3===0;case a.Patterns.PATTERN011:return(t+i)%3===0;case a.Patterns.PATTERN100:return(Math.floor(t/2)+Math.floor(i/3))%2===0;case a.Patterns.PATTERN101:return t*i%2+t*i%3===0;case a.Patterns.PATTERN110:return(t*i%2+t*i%3)%2===0;case a.Patterns.PATTERN111:return(t*i%3+(t+i)%2)%2===0;default:throw new Error("bad maskPattern:"+n)}}a.applyMask=function(t,i){const o=i.size;for(let c=0;c<o;c++)for(let l=0;l<o;l++)i.isReserved(l,c)||i.xor(l,c,s(t,l,c))},a.getBestMask=function(t,i){const o=Object.keys(a.Patterns).length;let c=0,l=1/0;for(let h=0;h<o;h++){i(h),a.applyMask(h,t);const m=a.getPenaltyN1(t)+a.getPenaltyN2(t)+a.getPenaltyN3(t)+a.getPenaltyN4(t);a.applyMask(h,t),m<l&&(l=m,c=h)}return c}})(ve)),ve}var oe={},it;function Tt(){if(it)return oe;it=1;const a=Me(),r=[1,1,1,1,1,1,1,1,1,1,2,2,1,2,2,4,1,2,4,4,2,4,4,4,2,4,6,5,2,4,6,6,2,5,8,8,4,5,8,8,4,5,8,11,4,8,10,11,4,9,12,16,4,9,16,16,6,10,12,18,6,10,17,16,6,11,16,19,6,13,18,21,7,14,21,25,8,16,20,25,8,17,23,25,9,17,23,34,9,18,25,30,10,20,27,32,12,21,29,35,12,23,34,37,12,25,34,40,13,26,35,42,14,28,38,45,15,29,40,48,16,31,43,51,17,33,45,54,18,35,48,57,19,37,51,60,19,38,53,63,20,40,56,66,21,43,59,70,22,45,62,74,24,47,65,77,25,49,68,81],s=[7,10,13,17,10,16,22,28,15,26,36,44,20,36,52,64,26,48,72,88,36,64,96,112,40,72,108,130,48,88,132,156,60,110,160,192,72,130,192,224,80,150,224,264,96,176,260,308,104,198,288,352,120,216,320,384,132,240,360,432,144,280,408,480,168,308,448,532,180,338,504,588,196,364,546,650,224,416,600,700,224,442,644,750,252,476,690,816,270,504,750,900,300,560,810,960,312,588,870,1050,336,644,952,1110,360,700,1020,1200,390,728,1050,1260,420,784,1140,1350,450,812,1200,1440,480,868,1290,1530,510,924,1350,1620,540,980,1440,1710,570,1036,1530,1800,570,1064,1590,1890,600,1120,1680,1980,630,1204,1770,2100,660,1260,1860,2220,720,1316,1950,2310,750,1372,2040,2430];return oe.getBlocksCount=function(t,i){switch(i){case a.L:return r[(t-1)*4+0];case a.M:return r[(t-1)*4+1];case a.Q:return r[(t-1)*4+2];case a.H:return r[(t-1)*4+3];default:return}},oe.getTotalCodewordsCount=function(t,i){switch(i){case a.L:return s[(t-1)*4+0];case a.M:return s[(t-1)*4+1];case a.Q:return s[(t-1)*4+2];case a.H:return s[(t-1)*4+3];default:return}},oe}var be={},ie={},at;function Gt(){if(at)return ie;at=1;const a=new Uint8Array(512),r=new Uint8Array(256);return(function(){let n=1;for(let t=0;t<255;t++)a[t]=n,r[n]=t,n<<=1,n&256&&(n^=285);for(let t=255;t<512;t++)a[t]=a[t-255]})(),ie.log=function(n){if(n<1)throw new Error("log("+n+")");return r[n]},ie.exp=function(n){return a[n]},ie.mul=function(n,t){return n===0||t===0?0:a[r[n]+r[t]]},ie}var st;function Wt(){return st||(st=1,(function(a){const r=Gt();a.mul=function(n,t){const i=new Uint8Array(n.length+t.length-1);for(let o=0;o<n.length;o++)for(let c=0;c<t.length;c++)i[o+c]^=r.mul(n[o],t[c]);return i},a.mod=function(n,t){let i=new Uint8Array(n);for(;i.length-t.length>=0;){const o=i[0];for(let l=0;l<t.length;l++)i[l]^=r.mul(t[l],o);let c=0;for(;c<i.length&&i[c]===0;)c++;i=i.slice(c)}return i},a.generateECPolynomial=function(n){let t=new Uint8Array([1]);for(let i=0;i<n;i++)t=a.mul(t,new Uint8Array([1,r.exp(i)]));return t}})(be)),be}var ye,ot;function Xt(){if(ot)return ye;ot=1;const a=Wt();function r(s){this.genPoly=void 0,this.degree=s,this.degree&&this.initialize(this.degree)}return r.prototype.initialize=function(n){this.degree=n,this.genPoly=a.generateECPolynomial(this.degree)},r.prototype.encode=function(n){if(!this.genPoly)throw new Error("Encoder not initialized");const t=new Uint8Array(n.length+this.degree);t.set(n);const i=a.mod(t,this.genPoly),o=this.degree-i.length;if(o>0){const c=new Uint8Array(this.degree);return c.set(i,o),c}return i},ye=r,ye}var we={},je={},Ne={},lt;function St(){return lt||(lt=1,Ne.isValid=function(r){return!isNaN(r)&&r>=1&&r<=40}),Ne}var Y={},ct;function Et(){if(ct)return Y;ct=1;const a="[0-9]+",r="[A-Z $%*+\\-./:]+";let s="(?:[u3000-u303F]|[u3040-u309F]|[u30A0-u30FF]|[uFF00-uFFEF]|[u4E00-u9FAF]|[u2605-u2606]|[u2190-u2195]|u203B|[u2010u2015u2018u2019u2025u2026u201Cu201Du2225u2260]|[u0391-u0451]|[u00A7u00A8u00B1u00B4u00D7u00F7])+";s=s.replace(/u/g,"\\u");const n="(?:(?![A-Z0-9 $%*+\\-./:]|"+s+`)(?:.|[\r
]))+`;Y.KANJI=new RegExp(s,"g"),Y.BYTE_KANJI=new RegExp("[^A-Z0-9 $%*+\\-./:]+","g"),Y.BYTE=new RegExp(n,"g"),Y.NUMERIC=new RegExp(a,"g"),Y.ALPHANUMERIC=new RegExp(r,"g");const t=new RegExp("^"+s+"$"),i=new RegExp("^"+a+"$"),o=new RegExp("^[A-Z0-9 $%*+\\-./:]+$");return Y.testKanji=function(l){return t.test(l)},Y.testNumeric=function(l){return i.test(l)},Y.testAlphanumeric=function(l){return o.test(l)},Y}var dt;function ee(){return dt||(dt=1,(function(a){const r=St(),s=Et();a.NUMERIC={id:"Numeric",bit:1,ccBits:[10,12,14]},a.ALPHANUMERIC={id:"Alphanumeric",bit:2,ccBits:[9,11,13]},a.BYTE={id:"Byte",bit:4,ccBits:[8,16,16]},a.KANJI={id:"Kanji",bit:8,ccBits:[8,10,12]},a.MIXED={bit:-1},a.getCharCountIndicator=function(i,o){if(!i.ccBits)throw new Error("Invalid mode: "+i);if(!r.isValid(o))throw new Error("Invalid version: "+o);return o>=1&&o<10?i.ccBits[0]:o<27?i.ccBits[1]:i.ccBits[2]},a.getBestModeForData=function(i){return s.testNumeric(i)?a.NUMERIC:s.testAlphanumeric(i)?a.ALPHANUMERIC:s.testKanji(i)?a.KANJI:a.BYTE},a.toString=function(i){if(i&&i.id)return i.id;throw new Error("Invalid mode")},a.isValid=function(i){return i&&i.bit&&i.ccBits};function n(t){if(typeof t!="string")throw new Error("Param is not a string");switch(t.toLowerCase()){case"numeric":return a.NUMERIC;case"alphanumeric":return a.ALPHANUMERIC;case"kanji":return a.KANJI;case"byte":return a.BYTE;default:throw new Error("Unknown mode: "+t)}}a.from=function(i,o){if(a.isValid(i))return i;try{return n(i)}catch{return o}}})(je)),je}var ut;function $t(){return ut||(ut=1,(function(a){const r=$(),s=Tt(),n=Me(),t=ee(),i=St(),o=7973,c=r.getBCHDigit(o);function l(j,g,S){for(let I=1;I<=40;I++)if(g<=a.getCapacity(I,S,j))return I}function h(j,g){return t.getCharCountIndicator(j,g)+4}function m(j,g){let S=0;return j.forEach(function(I){const R=h(I.mode,g);S+=R+I.getBitsLength()}),S}function w(j,g){for(let S=1;S<=40;S++)if(m(j,S)<=a.getCapacity(S,g,t.MIXED))return S}a.from=function(g,S){return i.isValid(g)?parseInt(g,10):S},a.getCapacity=function(g,S,I){if(!i.isValid(g))throw new Error("Invalid QR Code version");typeof I>"u"&&(I=t.BYTE);const R=r.getSymbolTotalCodewords(g),A=s.getTotalCodewordsCount(g,S),P=(R-A)*8;if(I===t.MIXED)return P;const b=P-h(I,g);switch(I){case t.NUMERIC:return Math.floor(b/10*3);case t.ALPHANUMERIC:return Math.floor(b/11*2);case t.KANJI:return Math.floor(b/13);case t.BYTE:default:return Math.floor(b/8)}},a.getBestVersionForData=function(g,S){let I;const R=n.from(S,n.M);if(Array.isArray(g)){if(g.length>1)return w(g,R);if(g.length===0)return 1;I=g[0]}else I=g;return l(I.mode,I.getLength(),R)},a.getEncodedBits=function(g){if(!i.isValid(g)||g<7)throw new Error("Invalid QR Code version");let S=g<<12;for(;r.getBCHDigit(S)-c>=0;)S^=o<<r.getBCHDigit(S)-c;return g<<12|S}})(we)),we}var Ce={},ft;function en(){if(ft)return Ce;ft=1;const a=$(),r=1335,s=21522,n=a.getBCHDigit(r);return Ce.getEncodedBits=function(i,o){const c=i.bit<<3|o;let l=c<<10;for(;a.getBCHDigit(l)-n>=0;)l^=r<<a.getBCHDigit(l)-n;return(c<<10|l)^s},Ce}var Ae={},Te,ht;function tn(){if(ht)return Te;ht=1;const a=ee();function r(s){this.mode=a.NUMERIC,this.data=s.toString()}return r.getBitsLength=function(n){return 10*Math.floor(n/3)+(n%3?n%3*3+1:0)},r.prototype.getLength=function(){return this.data.length},r.prototype.getBitsLength=function(){return r.getBitsLength(this.data.length)},r.prototype.write=function(n){let t,i,o;for(t=0;t+3<=this.data.length;t+=3)i=this.data.substr(t,3),o=parseInt(i,10),n.put(o,10);const c=this.data.length-t;c>0&&(i=this.data.substr(t),o=parseInt(i,10),n.put(o,c*3+1))},Te=r,Te}var Se,gt;function nn(){if(gt)return Se;gt=1;const a=ee(),r=["0","1","2","3","4","5","6","7","8","9","A","B","C","D","E","F","G","H","I","J","K","L","M","N","O","P","Q","R","S","T","U","V","W","X","Y","Z"," ","$","%","*","+","-",".","/",":"];function s(n){this.mode=a.ALPHANUMERIC,this.data=n}return s.getBitsLength=function(t){return 11*Math.floor(t/2)+6*(t%2)},s.prototype.getLength=function(){return this.data.length},s.prototype.getBitsLength=function(){return s.getBitsLength(this.data.length)},s.prototype.write=function(t){let i;for(i=0;i+2<=this.data.length;i+=2){let o=r.indexOf(this.data[i])*45;o+=r.indexOf(this.data[i+1]),t.put(o,11)}this.data.length%2&&t.put(r.indexOf(this.data[i]),6)},Se=s,Se}var Ee,mt;function rn(){if(mt)return Ee;mt=1;const a=ee();function r(s){this.mode=a.BYTE,typeof s=="string"?this.data=new TextEncoder().encode(s):this.data=new Uint8Array(s)}return r.getBitsLength=function(n){return n*8},r.prototype.getLength=function(){return this.data.length},r.prototype.getBitsLength=function(){return r.getBitsLength(this.data.length)},r.prototype.write=function(s){for(let n=0,t=this.data.length;n<t;n++)s.put(this.data[n],8)},Ee=r,Ee}var Ie,xt;function an(){if(xt)return Ie;xt=1;const a=ee(),r=$();function s(n){this.mode=a.KANJI,this.data=n}return s.getBitsLength=function(t){return t*13},s.prototype.getLength=function(){return this.data.length},s.prototype.getBitsLength=function(){return s.getBitsLength(this.data.length)},s.prototype.write=function(n){let t;for(t=0;t<this.data.length;t++){let i=r.toSJIS(this.data[t]);if(i>=33088&&i<=40956)i-=33088;else if(i>=57408&&i<=60351)i-=49472;else throw new Error("Invalid SJIS character: "+this.data[t]+`
Make sure your charset is UTF-8`);i=(i>>>8&255)*192+(i&255),n.put(i,13)}},Ie=s,Ie}var Pe={exports:{}},pt;function sn(){return pt||(pt=1,(function(a){var r={single_source_shortest_paths:function(s,n,t){var i={},o={};o[n]=0;var c=r.PriorityQueue.make();c.push(n,0);for(var l,h,m,w,j,g,S,I,R;!c.empty();){l=c.pop(),h=l.value,w=l.cost,j=s[h]||{};for(m in j)j.hasOwnProperty(m)&&(g=j[m],S=w+g,I=o[m],R=typeof o[m]>"u",(R||I>S)&&(o[m]=S,c.push(m,S),i[m]=h))}if(typeof t<"u"&&typeof o[t]>"u"){var A=["Could not find a path from ",n," to ",t,"."].join("");throw new Error(A)}return i},extract_shortest_path_from_predecessor_list:function(s,n){for(var t=[],i=n;i;)t.push(i),s[i],i=s[i];return t.reverse(),t},find_path:function(s,n,t){var i=r.single_source_shortest_paths(s,n,t);return r.extract_shortest_path_from_predecessor_list(i,t)},PriorityQueue:{make:function(s){var n=r.PriorityQueue,t={},i;s=s||{};for(i in n)n.hasOwnProperty(i)&&(t[i]=n[i]);return t.queue=[],t.sorter=s.sorter||n.default_sorter,t},default_sorter:function(s,n){return s.cost-n.cost},push:function(s,n){var t={value:s,cost:n};this.queue.push(t),this.queue.sort(this.sorter)},pop:function(){return this.queue.shift()},empty:function(){return this.queue.length===0}}};a.exports=r})(Pe)),Pe.exports}var vt;function on(){return vt||(vt=1,(function(a){const r=ee(),s=tn(),n=nn(),t=rn(),i=an(),o=Et(),c=$(),l=sn();function h(A){return unescape(encodeURIComponent(A)).length}function m(A,P,b){const T=[];let k;for(;(k=A.exec(b))!==null;)T.push({data:k[0],index:k.index,mode:P,length:k[0].length});return T}function w(A){const P=m(o.NUMERIC,r.NUMERIC,A),b=m(o.ALPHANUMERIC,r.ALPHANUMERIC,A);let T,k;return c.isKanjiModeEnabled()?(T=m(o.BYTE,r.BYTE,A),k=m(o.KANJI,r.KANJI,A)):(T=m(o.BYTE_KANJI,r.BYTE,A),k=[]),P.concat(b,T,k).sort(function(f,p){return f.index-p.index}).map(function(f){return{data:f.data,mode:f.mode,length:f.length}})}function j(A,P){switch(P){case r.NUMERIC:return s.getBitsLength(A);case r.ALPHANUMERIC:return n.getBitsLength(A);case r.KANJI:return i.getBitsLength(A);case r.BYTE:return t.getBitsLength(A)}}function g(A){return A.reduce(function(P,b){const T=P.length-1>=0?P[P.length-1]:null;return T&&T.mode===b.mode?(P[P.length-1].data+=b.data,P):(P.push(b),P)},[])}function S(A){const P=[];for(let b=0;b<A.length;b++){const T=A[b];switch(T.mode){case r.NUMERIC:P.push([T,{data:T.data,mode:r.ALPHANUMERIC,length:T.length},{data:T.data,mode:r.BYTE,length:T.length}]);break;case r.ALPHANUMERIC:P.push([T,{data:T.data,mode:r.BYTE,length:T.length}]);break;case r.KANJI:P.push([T,{data:T.data,mode:r.BYTE,length:h(T.data)}]);break;case r.BYTE:P.push([{data:T.data,mode:r.BYTE,length:h(T.data)}])}}return P}function I(A,P){const b={},T={start:{}};let k=["start"];for(let x=0;x<A.length;x++){const f=A[x],p=[];for(let v=0;v<f.length;v++){const E=f[v],N=""+x+v;p.push(N),b[N]={node:E,lastCount:0},T[N]={};for(let C=0;C<k.length;C++){const y=k[C];b[y]&&b[y].node.mode===E.mode?(T[y][N]=j(b[y].lastCount+E.length,E.mode)-j(b[y].lastCount,E.mode),b[y].lastCount+=E.length):(b[y]&&(b[y].lastCount=E.length),T[y][N]=j(E.length,E.mode)+4+r.getCharCountIndicator(E.mode,P))}}k=p}for(let x=0;x<k.length;x++)T[k[x]].end=0;return{map:T,table:b}}function R(A,P){let b;const T=r.getBestModeForData(A);if(b=r.from(P,T),b!==r.BYTE&&b.bit<T.bit)throw new Error('"'+A+'" cannot be encoded with mode '+r.toString(b)+`.
 Suggested mode is: `+r.toString(T));switch(b===r.KANJI&&!c.isKanjiModeEnabled()&&(b=r.BYTE),b){case r.NUMERIC:return new s(A);case r.ALPHANUMERIC:return new n(A);case r.KANJI:return new i(A);case r.BYTE:return new t(A)}}a.fromArray=function(P){return P.reduce(function(b,T){return typeof T=="string"?b.push(R(T,null)):T.data&&b.push(R(T.data,T.mode)),b},[])},a.fromString=function(P,b){const T=w(P,c.isKanjiModeEnabled()),k=S(T),x=I(k,b),f=l.find_path(x.map,"start","end"),p=[];for(let v=1;v<f.length-1;v++)p.push(x.table[f[v]].node);return a.fromArray(g(p))},a.rawSplit=function(P){return a.fromArray(w(P,c.isKanjiModeEnabled()))}})(Ae)),Ae}var bt;function ln(){if(bt)return fe;bt=1;const a=$(),r=Me(),s=Ot(),n=Kt(),t=Zt(),i=Jt(),o=Yt(),c=Tt(),l=Xt(),h=$t(),m=en(),w=ee(),j=on();function g(x,f){const p=x.size,v=i.getPositions(f);for(let E=0;E<v.length;E++){const N=v[E][0],C=v[E][1];for(let y=-1;y<=7;y++)if(!(N+y<=-1||p<=N+y))for(let u=-1;u<=7;u++)C+u<=-1||p<=C+u||(y>=0&&y<=6&&(u===0||u===6)||u>=0&&u<=6&&(y===0||y===6)||y>=2&&y<=4&&u>=2&&u<=4?x.set(N+y,C+u,!0,!0):x.set(N+y,C+u,!1,!0))}}function S(x){const f=x.size;for(let p=8;p<f-8;p++){const v=p%2===0;x.set(p,6,v,!0),x.set(6,p,v,!0)}}function I(x,f){const p=t.getPositions(f);for(let v=0;v<p.length;v++){const E=p[v][0],N=p[v][1];for(let C=-2;C<=2;C++)for(let y=-2;y<=2;y++)C===-2||C===2||y===-2||y===2||C===0&&y===0?x.set(E+C,N+y,!0,!0):x.set(E+C,N+y,!1,!0)}}function R(x,f){const p=x.size,v=h.getEncodedBits(f);let E,N,C;for(let y=0;y<18;y++)E=Math.floor(y/3),N=y%3+p-8-3,C=(v>>y&1)===1,x.set(E,N,C,!0),x.set(N,E,C,!0)}function A(x,f,p){const v=x.size,E=m.getEncodedBits(f,p);let N,C;for(N=0;N<15;N++)C=(E>>N&1)===1,N<6?x.set(N,8,C,!0):N<8?x.set(N+1,8,C,!0):x.set(v-15+N,8,C,!0),N<8?x.set(8,v-N-1,C,!0):N<9?x.set(8,15-N-1+1,C,!0):x.set(8,15-N-1,C,!0);x.set(v-8,8,1,!0)}function P(x,f){const p=x.size;let v=-1,E=p-1,N=7,C=0;for(let y=p-1;y>0;y-=2)for(y===6&&y--;;){for(let u=0;u<2;u++)if(!x.isReserved(E,y-u)){let J=!1;C<f.length&&(J=(f[C]>>>N&1)===1),x.set(E,y-u,J),N--,N===-1&&(C++,N=7)}if(E+=v,E<0||p<=E){E-=v,v=-v;break}}}function b(x,f,p){const v=new s;p.forEach(function(u){v.put(u.mode.bit,4),v.put(u.getLength(),w.getCharCountIndicator(u.mode,x)),u.write(v)});const E=a.getSymbolTotalCodewords(x),N=c.getTotalCodewordsCount(x,f),C=(E-N)*8;for(v.getLengthInBits()+4<=C&&v.put(0,4);v.getLengthInBits()%8!==0;)v.putBit(0);const y=(C-v.getLengthInBits())/8;for(let u=0;u<y;u++)v.put(u%2?17:236,8);return T(v,x,f)}function T(x,f,p){const v=a.getSymbolTotalCodewords(f),E=c.getTotalCodewordsCount(f,p),N=v-E,C=c.getBlocksCount(f,p),y=v%C,u=C-y,J=Math.floor(v/C),U=Math.floor(N/C),le=U+1,d=J-U,B=new l(d);let M=0;const F=new Array(C),_=new Array(C);let te=0;const Rt=new Uint8Array(x.buffer);for(let ne=0;ne<C;ne++){const de=ne<u?U:le;F[ne]=Rt.slice(M,M+de),_[ne]=B.encode(F[ne]),M+=de,te=Math.max(te,de)}const ce=new Uint8Array(v);let ze=0,G,W;for(G=0;G<te;G++)for(W=0;W<C;W++)G<F[W].length&&(ce[ze++]=F[W][G]);for(G=0;G<d;G++)for(W=0;W<C;W++)ce[ze++]=_[W][G];return ce}function k(x,f,p,v){let E;if(Array.isArray(x))E=j.fromArray(x);else if(typeof x=="string"){let J=f;if(!J){const U=j.rawSplit(x);J=h.getBestVersionForData(U,p)}E=j.fromString(x,J||40)}else throw new Error("Invalid data");const N=h.getBestVersionForData(E,p);if(!N)throw new Error("The amount of data is too big to be stored in a QR Code");if(!f)f=N;else if(f<N)throw new Error(`
The chosen QR Code version cannot contain this amount of data.
Minimum version required to store current data is: `+N+`.
`);const C=b(f,p,E),y=a.getSymbolSize(f),u=new n(y);return g(u,f),S(u),I(u,f),A(u,p,0),f>=7&&R(u,f),P(u,C),isNaN(v)&&(v=o.getBestMask(u,A.bind(null,u,p))),o.applyMask(v,u),A(u,p,v),{modules:u,version:f,errorCorrectionLevel:p,maskPattern:v,segments:E}}return fe.create=function(f,p){if(typeof f>"u"||f==="")throw new Error("No input text");let v=r.M,E,N;return typeof p<"u"&&(v=r.from(p.errorCorrectionLevel,r.M),E=h.from(p.version),N=o.from(p.maskPattern),p.toSJISFunc&&a.setToSJISFunction(p.toSJISFunc)),k(f,E,v,N)},fe}var Be={},Re={},yt;function It(){return yt||(yt=1,(function(a){function r(s){if(typeof s=="number"&&(s=s.toString()),typeof s!="string")throw new Error("Color should be defined as hex string");let n=s.slice().replace("#","").split("");if(n.length<3||n.length===5||n.length>8)throw new Error("Invalid hex color: "+s);(n.length===3||n.length===4)&&(n=Array.prototype.concat.apply([],n.map(function(i){return[i,i]}))),n.length===6&&n.push("F","F");const t=parseInt(n.join(""),16);return{r:t>>24&255,g:t>>16&255,b:t>>8&255,a:t&255,hex:"#"+n.slice(0,6).join("")}}a.getOptions=function(n){n||(n={}),n.color||(n.color={});const t=typeof n.margin>"u"||n.margin===null||n.margin<0?4:n.margin,i=n.width&&n.width>=21?n.width:void 0,o=n.scale||4;return{width:i,scale:i?4:o,margin:t,color:{dark:r(n.color.dark||"#000000ff"),light:r(n.color.light||"#ffffffff")},type:n.type,rendererOpts:n.rendererOpts||{}}},a.getScale=function(n,t){return t.width&&t.width>=n+t.margin*2?t.width/(n+t.margin*2):t.scale},a.getImageWidth=function(n,t){const i=a.getScale(n,t);return Math.floor((n+t.margin*2)*i)},a.qrToImageData=function(n,t,i){const o=t.modules.size,c=t.modules.data,l=a.getScale(o,i),h=Math.floor((o+i.margin*2)*l),m=i.margin*l,w=[i.color.light,i.color.dark];for(let j=0;j<h;j++)for(let g=0;g<h;g++){let S=(j*h+g)*4,I=i.color.light;if(j>=m&&g>=m&&j<h-m&&g<h-m){const R=Math.floor((j-m)/l),A=Math.floor((g-m)/l);I=w[c[R*o+A]?1:0]}n[S++]=I.r,n[S++]=I.g,n[S++]=I.b,n[S]=I.a}}})(Re)),Re}var wt;function cn(){return wt||(wt=1,(function(a){const r=It();function s(t,i,o){t.clearRect(0,0,i.width,i.height),i.style||(i.style={}),i.height=o,i.width=o,i.style.height=o+"px",i.style.width=o+"px"}function n(){try{return document.createElement("canvas")}catch{throw new Error("You need to specify a canvas element")}}a.render=function(i,o,c){let l=c,h=o;typeof l>"u"&&(!o||!o.getContext)&&(l=o,o=void 0),o||(h=n()),l=r.getOptions(l);const m=r.getImageWidth(i.modules.size,l),w=h.getContext("2d"),j=w.createImageData(m,m);return r.qrToImageData(j.data,i,l),s(w,h,m),w.putImageData(j,0,0),h},a.renderToDataURL=function(i,o,c){let l=c;typeof l>"u"&&(!o||!o.getContext)&&(l=o,o=void 0),l||(l={});const h=a.render(i,o,l),m=l.type||"image/png",w=l.rendererOpts||{};return h.toDataURL(m,w.quality)}})(Be)),Be}var ke={},jt;function dn(){if(jt)return ke;jt=1;const a=It();function r(t,i){const o=t.a/255,c=i+'="'+t.hex+'"';return o<1?c+" "+i+'-opacity="'+o.toFixed(2).slice(1)+'"':c}function s(t,i,o){let c=t+i;return typeof o<"u"&&(c+=" "+o),c}function n(t,i,o){let c="",l=0,h=!1,m=0;for(let w=0;w<t.length;w++){const j=Math.floor(w%i),g=Math.floor(w/i);!j&&!h&&(h=!0),t[w]?(m++,w>0&&j>0&&t[w-1]||(c+=h?s("M",j+o,.5+g+o):s("m",l,0),l=0,h=!1),j+1<i&&t[w+1]||(c+=s("h",m),m=0)):l++}return c}return ke.render=function(i,o,c){const l=a.getOptions(o),h=i.modules.size,m=i.modules.data,w=h+l.margin*2,j=l.color.light.a?"<path "+r(l.color.light,"fill")+' d="M0 0h'+w+"v"+w+'H0z"/>':"",g="<path "+r(l.color.dark,"stroke")+' d="'+n(m,h,l.margin)+'"/>',S='viewBox="0 0 '+w+" "+w+'"',R='<svg xmlns="http://www.w3.org/2000/svg" '+(l.width?'width="'+l.width+'" height="'+l.width+'" ':"")+S+' shape-rendering="crispEdges">'+j+g+`</svg>
`;return typeof c=="function"&&c(null,R),R},ke}var Nt;function un(){if(Nt)return re;Nt=1;const a=Qt(),r=ln(),s=cn(),n=dn();function t(i,o,c,l,h){const m=[].slice.call(arguments,1),w=m.length,j=typeof m[w-1]=="function";if(!j&&!a())throw new Error("Callback required as last argument");if(j){if(w<2)throw new Error("Too few arguments provided");w===2?(h=c,c=o,o=l=void 0):w===3&&(o.getContext&&typeof h>"u"?(h=l,l=void 0):(h=l,l=c,c=o,o=void 0))}else{if(w<1)throw new Error("Too few arguments provided");return w===1?(c=o,o=l=void 0):w===2&&!o.getContext&&(l=c,c=o,o=void 0),new Promise(function(g,S){try{const I=r.create(c,l);g(i(I,o,l))}catch(I){S(I)}})}try{const g=r.create(c,l);h(null,i(g,o,l))}catch(g){h(g)}}return re.create=r.create,re.toCanvas=t.bind(null,s.render),re.toDataURL=t.bind(null,s.renderToDataURL),re.toString=t.bind(null,function(i,o,c){return n.render(i,c)}),re}var fn=un();const Pt=kt(fn),hn="SAR";function O(a){return Number(a??0)}function Q(a){return O(a).toLocaleString("en-SA",{minimumFractionDigits:2,maximumFractionDigits:2})}function gn(a){return a==="simplified"}function mn(a){if(!a)return"";try{return new Date(a).toLocaleDateString("ar-SA-u-ca-islamic",{year:"numeric",month:"long",day:"numeric"})}catch{return""}}const Ct={draft:{label:"Draft",labelAr:"مسودة",color:"#64748b"},sent:{label:"Sent",labelAr:"مُرسلة",color:"#3b82f6"},paid:{label:"Paid",labelAr:"مدفوعة",color:"#10b981"},partial:{label:"Partial",labelAr:"جزئي",color:"#f59e0b"},overdue:{label:"Overdue",labelAr:"متأخرة",color:"#ef4444"},cancelled:{label:"Cancelled",labelAr:"ملغاة",color:"#6b7280"}},At={cleared:{label:"Cleared",color:"#10b981"},reported:{label:"Reported",color:"#3b82f6"},pending:{label:"Pending",color:"#f59e0b"},failed:{label:"Failed",color:"#ef4444"}},Bt=Z.forwardRef(({invoice:a,company:r,customer:s,items:n,className:t=""},i)=>{const[o,c]=Z.useState("");Z.useEffect(()=>{if(!a.zatcaQrCode){c("");return}Pt.toDataURL(a.zatcaQrCode,{errorCorrectionLevel:"M",margin:1,width:180,color:{dark:"#0f172a",light:"#ffffff"}}).then(c).catch(()=>c(""))},[a.zatcaQrCode]);const l=r.defaultCurrency??hn,h=gn(a.invoiceType),m=Ct[a.status??"draft"]??Ct.draft,w=At[a.zatcaStatus??"pending"]??At.pending,j=O(a.taxPercent??15),g=O(a.subTotal),S=O(a.taxAmount),I=O(a.totalAmount),R=O(a.paidAmount),A=I-R,P=mn(a.date);return e.jsxs("div",{ref:i,className:`saudi-invoice-root ${t}`,style:{fontFamily:"'Segoe UI', Tahoma, Arial, sans-serif"},children:[e.jsx("style",{children:`
          @import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700;800&display=swap');
          .saudi-invoice-root { font-family: 'Tajawal', 'Segoe UI', sans-serif; background: #f8fafc; }

          /* ── Page ── */
          .inv-page {
            max-width: 860px;
            margin: 0 auto;
            background: #ffffff;
            border-radius: 20px;
            overflow: hidden;
            box-shadow:
              0 25px 50px -12px rgba(0,0,0,.15),
              0 0 0 1px rgba(0,0,0,.04),
              inset 0 1px 0 rgba(255,255,255,.8);
          }

          /* ── Header gradient ── */
          .inv-header {
            background: linear-gradient(135deg, #0f4c35 0%, #1a7a56 40%, #0d6e4e 70%, #063d26 100%);
            padding: 32px 36px 28px;
            position: relative;
            overflow: hidden;
          }
          .inv-header::before {
            content: '';
            position: absolute;
            top: -60px; right: -60px;
            width: 220px; height: 220px;
            border-radius: 50%;
            background: rgba(255,255,255,.06);
          }
          .inv-header::after {
            content: '';
            position: absolute;
            bottom: -40px; left: -40px;
            width: 180px; height: 180px;
            border-radius: 50%;
            background: rgba(255,255,255,.04);
          }

          /* ── Logo box ── */
          .inv-logo-box {
            width: 72px; height: 72px;
            border-radius: 16px;
            background: rgba(255,255,255,.15);
            border: 2px solid rgba(255,255,255,.25);
            display: flex; align-items: center; justify-content: center;
            backdrop-filter: blur(4px);
            overflow: hidden;
            flex-shrink: 0;
          }
          .inv-logo-box img { width: 100%; height: 100%; object-fit: contain; }

          /* ── Title badge ── */
          .inv-title-badge {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            background: rgba(255,255,255,.15);
            border: 1px solid rgba(255,255,255,.3);
            border-radius: 100px;
            padding: 4px 14px;
            backdrop-filter: blur(4px);
            margin-bottom: 6px;
          }

          /* ── Color stat boxes ── */
          .inv-stats {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 0;
          }
          .inv-stat-box {
            padding: 20px 24px;
            position: relative;
          }
          .inv-stat-box:not(:last-child)::after {
            content: '';
            position: absolute;
            right: 0; top: 16px; bottom: 16px;
            width: 1px;
            background: rgba(0,0,0,.07);
          }
          .inv-stat-box-subtotal { background: linear-gradient(135deg, #eff6ff, #dbeafe); }
          .inv-stat-box-vat      { background: linear-gradient(135deg, #f0fdf4, #dcfce7); }
          .inv-stat-box-total    { background: linear-gradient(135deg, #0f4c35, #1a7a56); }
          .inv-stat-box-paid     { background: linear-gradient(135deg, #fefce8, #fef9c3); }

          .inv-stat-label {
            font-size: 11px;
            font-weight: 600;
            letter-spacing: .05em;
            text-transform: uppercase;
            margin-bottom: 6px;
          }
          .inv-stat-value {
            font-size: 22px;
            font-weight: 800;
            letter-spacing: -.5px;
            line-height: 1.1;
          }
          .inv-stat-currency {
            font-size: 11px;
            font-weight: 600;
            margin-top: 2px;
          }

          /* ── Body ── */
          .inv-body { padding: 28px 36px; }

          /* ── Info cards ── */
          .inv-info-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 16px;
            margin-bottom: 24px;
          }
          .inv-info-card {
            border-radius: 14px;
            padding: 18px 20px;
            border: 1.5px solid;
            position: relative;
            overflow: hidden;
          }
          .inv-info-card::before {
            content: '';
            position: absolute;
            top: 0; left: 0; right: 0;
            height: 3px;
            border-radius: 14px 14px 0 0;
          }
          .inv-info-card-seller {
            background: linear-gradient(135deg, #f0fdf4, #ecfdf5);
            border-color: #bbf7d0;
          }
          .inv-info-card-seller::before { background: linear-gradient(90deg, #10b981, #059669); }
          .inv-info-card-buyer {
            background: linear-gradient(135deg, #eff6ff, #dbeafe);
            border-color: #bfdbfe;
          }
          .inv-info-card-buyer::before { background: linear-gradient(90deg, #3b82f6, #2563eb); }

          .inv-card-tag {
            font-size: 10px;
            font-weight: 700;
            letter-spacing: .1em;
            text-transform: uppercase;
            margin-bottom: 10px;
            display: flex;
            align-items: center;
            gap: 6px;
          }
          .inv-card-name {
            font-size: 16px;
            font-weight: 700;
            margin-bottom: 4px;
          }
          .inv-card-name-ar {
            font-size: 14px;
            font-weight: 600;
            direction: rtl;
            margin-bottom: 4px;
          }
          .inv-card-text {
            font-size: 12px;
            color: #475569;
            line-height: 1.6;
          }
          .inv-vat-badge {
            display: inline-flex;
            align-items: center;
            gap: 4px;
            padding: 3px 10px;
            border-radius: 6px;
            font-size: 11px;
            font-weight: 700;
            margin-top: 8px;
          }

          /* ── Meta row ── */
          .inv-meta-row {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 12px;
            margin-bottom: 24px;
          }
          .inv-meta-pill {
            border-radius: 12px;
            padding: 12px 16px;
            text-align: center;
            border: 1.5px solid;
          }
          .inv-meta-pill-type  { background: #f8fafc; border-color: #e2e8f0; }
          .inv-meta-pill-date  { background: #fff7ed; border-color: #fed7aa; }
          .inv-meta-pill-due   { background: #fef2f2; border-color: #fecaca; }
          .inv-meta-pill-uuid  { background: #faf5ff; border-color: #e9d5ff; }
          .inv-meta-label { font-size: 10px; font-weight: 600; letter-spacing: .06em; text-transform: uppercase; color: #64748b; }
          .inv-meta-value { font-size: 13px; font-weight: 700; margin-top: 3px; word-break: break-all; }

          /* ── Items table ── */
          .inv-table-wrap {
            border-radius: 14px;
            border: 1.5px solid #e2e8f0;
            overflow: hidden;
            margin-bottom: 24px;
          }
          .inv-table { width: 100%; border-collapse: collapse; }
          .inv-table thead { background: linear-gradient(135deg, #0f4c35, #1a7a56); }
          .inv-table thead th {
            padding: 14px 16px;
            text-align: left;
            font-size: 11px;
            font-weight: 700;
            letter-spacing: .06em;
            text-transform: uppercase;
            color: rgba(255,255,255,.9);
          }
          .inv-table thead th:last-child { text-align: right; }
          .inv-table tbody tr { border-bottom: 1px solid #f1f5f9; }
          .inv-table tbody tr:last-child { border-bottom: none; }
          .inv-table tbody tr:nth-child(even) { background: #f8fafc; }
          .inv-table tbody tr:hover { background: #f0fdf4; }
          .inv-table td {
            padding: 14px 16px;
            font-size: 13px;
            color: #1e293b;
          }
          .inv-table td:last-child { text-align: right; font-weight: 700; }
          .inv-item-desc { font-weight: 600; }
          .inv-item-desc-ar { font-size: 11px; color: #64748b; direction: rtl; }
          .inv-table-number { font-variant-numeric: tabular-nums; }
          .inv-row-num {
            width: 28px; height: 28px;
            border-radius: 50%;
            background: linear-gradient(135deg, #10b981, #059669);
            color: white;
            font-size: 11px;
            font-weight: 700;
            display: inline-flex;
            align-items: center;
            justify-content: center;
          }

          /* ── Footer section ── */
          .inv-footer-grid {
            display: grid;
            grid-template-columns: 1fr 300px;
            gap: 20px;
            align-items: start;
          }

          /* ── Totals box ── */
          .inv-totals {
            border-radius: 16px;
            overflow: hidden;
            border: 1.5px solid #e2e8f0;
          }
          .inv-totals-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 12px 18px;
            border-bottom: 1px solid #f1f5f9;
            font-size: 13px;
          }
          .inv-totals-row:last-child { border-bottom: none; }
          .inv-totals-row-sub   { background: #f8fafc; }
          .inv-totals-row-vat   { background: #f0fdf4; }
          .inv-totals-row-total {
            background: linear-gradient(135deg, #0f4c35, #1a7a56);
            color: white;
            padding: 16px 18px;
          }
          .inv-totals-row-paid  { background: #fefce8; }
          .inv-totals-row-due   { background: #fef2f2; }
          .inv-totals-label { font-weight: 600; color: #475569; }
          .inv-totals-label-white { font-weight: 700; color: rgba(255,255,255,.85); }
          .inv-totals-value { font-weight: 700; font-variant-numeric: tabular-nums; }
          .inv-totals-value-big { font-size: 20px; font-weight: 800; color: white; }
          .inv-totals-value-due { color: #ef4444; font-weight: 800; }

          /* ── QR box ── */
          .inv-qr-box {
            border-radius: 16px;
            border: 1.5px solid #bbf7d0;
            background: linear-gradient(135deg, #f0fdf4, #ecfdf5);
            padding: 20px;
            text-align: center;
          }
          .inv-qr-img {
            width: 140px; height: 140px;
            object-fit: contain;
            border-radius: 12px;
            padding: 8px;
            background: white;
            box-shadow: 0 4px 12px rgba(0,0,0,.1);
            margin: 0 auto 12px;
            display: block;
          }
          .inv-qr-label {
            font-size: 11px;
            font-weight: 700;
            color: #059669;
            text-transform: uppercase;
            letter-spacing: .05em;
          }
          .inv-qr-label-ar {
            font-size: 13px;
            font-weight: 600;
            color: #047857;
            direction: rtl;
            margin-top: 2px;
          }

          /* ── Notes / Terms ── */
          .inv-notes {
            margin-top: 20px;
            border-radius: 14px;
            padding: 16px 20px;
            background: linear-gradient(135deg, #faf5ff, #f3e8ff);
            border: 1.5px solid #e9d5ff;
            font-size: 12px;
            color: #4c1d95;
          }

          /* ── Compliance footer ── */
          .inv-compliance {
            margin-top: 24px;
            border-top: 2px dashed #e2e8f0;
            padding-top: 20px;
          }
          .inv-compliance-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 12px;
          }
          .inv-compliance-item {
            border-radius: 10px;
            padding: 12px 14px;
            font-size: 11px;
            text-align: center;
          }
          .inv-compliance-item-zatca { background: #f0fdf4; border: 1px solid #bbf7d0; color: #065f46; }
          .inv-compliance-item-vat   { background: #eff6ff; border: 1px solid #bfdbfe; color: #1e40af; }
          .inv-compliance-item-cr    { background: #fff7ed; border: 1px solid #fed7aa; color: #9a3412; }
          .inv-compliance-label { font-weight: 700; letter-spacing: .05em; text-transform: uppercase; margin-bottom: 4px; }
          .inv-compliance-value { font-weight: 600; word-break: break-all; }

          /* ── Watermark ── */
          .inv-watermark {
            text-align: center;
            margin-top: 20px;
            padding: 10px;
            font-size: 10px;
            color: #cbd5e1;
            letter-spacing: .05em;
          }

          /* ── Badge ── */
          .inv-badge {
            display: inline-flex;
            align-items: center;
            gap: 4px;
            padding: 4px 12px;
            border-radius: 100px;
            font-size: 11px;
            font-weight: 700;
          }

          /* ── Print ── */
          @media print {
            .saudi-invoice-root { background: white; }
            .inv-page { box-shadow: none; border-radius: 0; }
            .inv-body { padding: 20px; }
          }
        `}),e.jsxs("div",{className:"inv-page",children:[e.jsx("div",{className:"inv-header",children:e.jsxs("div",{style:{display:"flex",justifyContent:"space-between",alignItems:"flex-start",position:"relative",zIndex:1},children:[e.jsxs("div",{style:{display:"flex",gap:"16px",alignItems:"flex-start"},children:[e.jsx("div",{className:"inv-logo-box",children:r.logo?e.jsx("img",{src:r.logo,alt:"logo"}):e.jsx("span",{style:{color:"white",fontWeight:800,fontSize:20},children:(r.companyName??"YA").slice(0,2).toUpperCase()})}),e.jsxs("div",{children:[e.jsx("div",{style:{color:"white",fontWeight:800,fontSize:20,lineHeight:1.2},children:r.companyName??"Company Name"}),r.companyNameAr&&e.jsx("div",{style:{color:"rgba(255,255,255,.8)",fontWeight:600,fontSize:14,direction:"rtl",marginTop:2},children:r.companyNameAr}),e.jsxs("div",{style:{color:"rgba(255,255,255,.65)",fontSize:11,marginTop:6,lineHeight:1.7},children:[r.address&&e.jsxs("div",{children:[r.address,r.city?`, ${r.city}`:""]}),r.phone&&e.jsx("div",{children:r.phone}),r.email&&e.jsx("div",{children:r.email})]})]})]}),e.jsxs("div",{style:{textAlign:"right"},children:[e.jsxs("div",{className:"inv-title-badge",children:[e.jsxs("svg",{width:"14",height:"14",viewBox:"0 0 24 24",fill:"none",stroke:"white",strokeWidth:"2.5",children:[e.jsx("path",{d:"M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"}),e.jsx("polyline",{points:"14 2 14 8 20 8"})]}),e.jsx("span",{style:{color:"white",fontSize:11,fontWeight:700,letterSpacing:".08em",textTransform:"uppercase"},children:h?"Simplified Tax Invoice":"Tax Invoice"})]}),e.jsx("div",{style:{color:"rgba(255,255,255,.9)",fontWeight:800,fontSize:18,direction:"rtl",marginBottom:4},children:h?"فاتورة ضريبية مبسطة":"فاتورة ضريبية"}),e.jsx("div",{style:{color:"rgba(255,255,255,.7)",fontFamily:"monospace",fontSize:16,fontWeight:700},children:a.invoiceNumber??"INV-000000"}),a.zatcaStatus&&e.jsx("div",{style:{marginTop:10},children:e.jsxs("span",{className:"inv-badge",style:{background:`${w.color}22`,border:`1.5px solid ${w.color}44`,color:w.color},children:[e.jsx("span",{style:{width:6,height:6,borderRadius:"50%",background:w.color,display:"inline-block"}}),"ZATCA ",w.label]})}),e.jsx("div",{style:{marginTop:8},children:e.jsxs("span",{className:"inv-badge",style:{background:`${m.color}22`,border:`1.5px solid ${m.color}44`,color:m.color},children:[m.label," / ",m.labelAr]})})]})]})}),e.jsxs("div",{className:"inv-stats",children:[e.jsxs("div",{className:"inv-stat-box inv-stat-box-subtotal",children:[e.jsx("div",{className:"inv-stat-label",style:{color:"#2563eb"},children:"Subtotal / المجموع"}),e.jsx("div",{className:"inv-stat-value",style:{color:"#1d4ed8"},children:Q(g)}),e.jsx("div",{className:"inv-stat-currency",style:{color:"#3b82f6"},children:l})]}),e.jsxs("div",{className:"inv-stat-box inv-stat-box-vat",children:[e.jsxs("div",{className:"inv-stat-label",style:{color:"#059669"},children:["VAT ",j,"% / ضريبة القيمة"]}),e.jsx("div",{className:"inv-stat-value",style:{color:"#047857"},children:Q(S)}),e.jsx("div",{className:"inv-stat-currency",style:{color:"#10b981"},children:l})]}),e.jsxs("div",{className:"inv-stat-box inv-stat-box-total",children:[e.jsx("div",{className:"inv-stat-label",style:{color:"rgba(255,255,255,.75)"},children:"TOTAL / الإجمالي"}),e.jsx("div",{className:"inv-stat-value",style:{color:"white"},children:Q(I)}),e.jsx("div",{className:"inv-stat-currency",style:{color:"rgba(255,255,255,.7)"},children:l})]}),e.jsxs("div",{className:"inv-stat-box inv-stat-box-paid",children:[e.jsx("div",{className:"inv-stat-label",style:{color:"#d97706"},children:"Amount Due / المستحق"}),e.jsx("div",{className:"inv-stat-value",style:{color:A>0?"#dc2626":"#16a34a"},children:Q(A)}),e.jsx("div",{className:"inv-stat-currency",style:{color:"#f59e0b"},children:l})]})]}),e.jsxs("div",{className:"inv-body",children:[e.jsxs("div",{className:"inv-info-grid",children:[e.jsxs("div",{className:"inv-info-card inv-info-card-seller",children:[e.jsxs("div",{className:"inv-card-tag",style:{color:"#059669"},children:[e.jsx("svg",{width:"12",height:"12",viewBox:"0 0 24 24",fill:"none",stroke:"#059669",strokeWidth:"2.5",children:e.jsx("path",{d:"M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"})}),"Seller / البائع"]}),e.jsx("div",{className:"inv-card-name",children:r.companyName??"—"}),r.companyNameAr&&e.jsx("div",{className:"inv-card-name-ar",style:{color:"#065f46"},children:r.companyNameAr}),e.jsxs("div",{className:"inv-card-text",children:[r.address&&e.jsxs("div",{children:[r.address,r.city?`, ${r.city}`:""]}),r.country&&e.jsx("div",{children:r.country}),r.phone&&e.jsxs("div",{children:["📞 ",r.phone]}),r.email&&e.jsxs("div",{children:["✉ ",r.email]})]}),r.taxNumber&&e.jsxs("div",{className:"inv-vat-badge",style:{background:"#d1fae5",color:"#065f46"},children:["🏛 VAT: ",r.taxNumber]}),r.crNumber&&e.jsxs("div",{className:"inv-vat-badge",style:{background:"#d1fae5",color:"#065f46",marginTop:4},children:["📋 CR: ",r.crNumber]})]}),e.jsxs("div",{className:"inv-info-card inv-info-card-buyer",children:[e.jsxs("div",{className:"inv-card-tag",style:{color:"#2563eb"},children:[e.jsxs("svg",{width:"12",height:"12",viewBox:"0 0 24 24",fill:"none",stroke:"#2563eb",strokeWidth:"2.5",children:[e.jsx("path",{d:"M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"}),e.jsx("circle",{cx:"12",cy:"7",r:"4"})]}),"Bill To / العميل"]}),e.jsx("div",{className:"inv-card-name",children:s.name??"—"}),s.nameAr&&e.jsx("div",{className:"inv-card-name-ar",style:{color:"#1e40af"},children:s.nameAr}),e.jsxs("div",{className:"inv-card-text",children:[s.address&&e.jsxs("div",{children:[s.address,s.city?`, ${s.city}`:""]}),s.phone&&e.jsxs("div",{children:["📞 ",s.phone]}),s.email&&e.jsxs("div",{children:["✉ ",s.email]})]}),s.taxNumber&&e.jsxs("div",{className:"inv-vat-badge",style:{background:"#dbeafe",color:"#1e40af"},children:["🏛 Customer VAT: ",s.taxNumber]})]})]}),e.jsxs("div",{className:"inv-meta-row",children:[e.jsxs("div",{className:"inv-meta-pill inv-meta-pill-type",children:[e.jsx("div",{className:"inv-meta-label",children:"Invoice Type"}),e.jsx("div",{className:"inv-meta-value",style:{color:"#0f172a",fontSize:12},children:a.invoiceType==="simplified"?"Simplified / مبسطة":a.invoiceType==="zatca"?"ZATCA / فاتورة ذاتكا":"Standard / قياسية"})]}),e.jsxs("div",{className:"inv-meta-pill inv-meta-pill-date",children:[e.jsx("div",{className:"inv-meta-label",children:"Invoice Date"}),e.jsx("div",{className:"inv-meta-value",style:{color:"#c2410c"},children:a.date??"—"}),P&&e.jsx("div",{style:{fontSize:10,color:"#9a3412",direction:"rtl",marginTop:2},children:P})]}),e.jsxs("div",{className:"inv-meta-pill inv-meta-pill-due",children:[e.jsx("div",{className:"inv-meta-label",children:"Due Date"}),e.jsx("div",{className:"inv-meta-value",style:{color:"#b91c1c"},children:a.dueDate??"Upon Receipt"})]}),e.jsxs("div",{className:"inv-meta-pill inv-meta-pill-uuid",children:[e.jsx("div",{className:"inv-meta-label",children:"Place of Supply"}),e.jsx("div",{className:"inv-meta-value",style:{color:"#6d28d9",fontSize:12},children:r.country??"Saudi Arabia / المملكة"})]})]}),e.jsx("div",{className:"inv-table-wrap",children:e.jsxs("table",{className:"inv-table",children:[e.jsx("thead",{children:e.jsxs("tr",{children:[e.jsx("th",{style:{width:40,textAlign:"center"},children:"#"}),e.jsx("th",{children:"Description / الوصف"}),e.jsx("th",{style:{textAlign:"right"},children:"Qty"}),e.jsx("th",{style:{textAlign:"right"},children:"Unit Price"}),e.jsx("th",{style:{textAlign:"right"},children:"VAT %"}),e.jsx("th",{style:{textAlign:"right"},children:"VAT Amt"}),e.jsx("th",{style:{textAlign:"right"},children:"Total / الإجمالي"})]})}),e.jsx("tbody",{children:n.map((b,T)=>{const k=O(b.quantity)*O(b.unitPrice),x=k*(O(b.taxPercent)/100),f=O(b.totalAmount)||k;return e.jsxs("tr",{children:[e.jsx("td",{style:{textAlign:"center"},children:e.jsx("span",{className:"inv-row-num",children:T+1})}),e.jsx("td",{children:e.jsx("div",{className:"inv-item-desc",children:b.description})}),e.jsx("td",{style:{textAlign:"right"},className:"inv-table-number",children:O(b.quantity).toLocaleString()}),e.jsx("td",{style:{textAlign:"right"},className:"inv-table-number",children:Q(b.unitPrice)}),e.jsx("td",{style:{textAlign:"right"},children:e.jsxs("span",{style:{background:"#d1fae5",color:"#065f46",padding:"2px 8px",borderRadius:6,fontSize:11,fontWeight:700},children:[O(b.taxPercent),"%"]})}),e.jsx("td",{style:{textAlign:"right"},className:"inv-table-number",children:Q(x)}),e.jsx("td",{className:"inv-table-number",children:Q(f)})]},b.id??T)})})]})}),e.jsxs("div",{className:"inv-footer-grid",children:[e.jsx("div",{children:(a.notes||a.terms||r.invoiceTerms)&&e.jsxs("div",{className:"inv-notes",children:[e.jsx("div",{style:{fontWeight:700,marginBottom:6,color:"#6d28d9"},children:"📝 Terms & Notes / الشروط والملاحظات"}),e.jsx("div",{style:{lineHeight:1.7},children:a.notes||a.terms||r.invoiceTerms})]})}),e.jsxs("div",{style:{display:"flex",flexDirection:"column",gap:16},children:[e.jsxs("div",{className:"inv-totals",children:[e.jsxs("div",{className:"inv-totals-row inv-totals-row-sub",children:[e.jsx("span",{className:"inv-totals-label",children:"Subtotal / المجموع الفرعي"}),e.jsxs("span",{className:"inv-totals-value",children:[Q(g)," ",l]})]}),e.jsxs("div",{className:"inv-totals-row inv-totals-row-vat",children:[e.jsxs("span",{className:"inv-totals-label",children:["VAT ",j,"% / ضريبة القيمة المضافة"]}),e.jsxs("span",{className:"inv-totals-value",style:{color:"#059669"},children:[Q(S)," ",l]})]}),e.jsxs("div",{className:"inv-totals-row inv-totals-row-total",children:[e.jsx("span",{className:"inv-totals-label-white",children:"GRAND TOTAL / الإجمالي الكلي"}),e.jsxs("span",{className:"inv-totals-value-big",children:[Q(I)," ",l]})]}),R>0&&e.jsxs("div",{className:"inv-totals-row inv-totals-row-paid",children:[e.jsx("span",{className:"inv-totals-label",style:{color:"#854d0e"},children:"Paid / المدفوع"}),e.jsxs("span",{className:"inv-totals-value",style:{color:"#854d0e"},children:[Q(R)," ",l]})]}),R>0&&e.jsxs("div",{className:"inv-totals-row inv-totals-row-due",children:[e.jsx("span",{className:"inv-totals-label",style:{color:"#991b1b"},children:"Balance Due / المبلغ المستحق"}),e.jsxs("span",{className:"inv-totals-value inv-totals-value-due",children:[Q(A)," ",l]})]})]}),o&&e.jsxs("div",{className:"inv-qr-box",children:[e.jsx("img",{src:o,alt:"ZATCA QR",className:"inv-qr-img"}),e.jsx("div",{className:"inv-qr-label",children:"ZATCA Phase 2 QR Code"}),e.jsx("div",{className:"inv-qr-label-ar",children:"رمز الاستجابة السريعة - هيئة الزكاة والضريبة"})]})]})]}),e.jsxs("div",{className:"inv-compliance",children:[e.jsx("div",{style:{textAlign:"center",marginBottom:14},children:e.jsx("span",{style:{fontSize:11,fontWeight:700,letterSpacing:".08em",textTransform:"uppercase",color:"#64748b",background:"#f1f5f9",padding:"4px 16px",borderRadius:100},children:"⚖️ Saudi Arabia — ZATCA Compliance Information / معلومات الامتثال الضريبي"})}),e.jsxs("div",{className:"inv-compliance-grid",children:[e.jsxs("div",{className:"inv-compliance-item inv-compliance-item-zatca",children:[e.jsx("div",{className:"inv-compliance-label",children:"🏛 ZATCA VAT Number"}),e.jsx("div",{className:"inv-compliance-value",children:r.taxNumber??"—"}),e.jsx("div",{style:{marginTop:4,fontSize:10},children:"الرقم الضريبي للبائع"})]}),e.jsxs("div",{className:"inv-compliance-item inv-compliance-item-vat",children:[e.jsx("div",{className:"inv-compliance-label",children:"📋 Commercial Registration"}),e.jsx("div",{className:"inv-compliance-value",children:r.crNumber??"—"}),e.jsx("div",{style:{marginTop:4,fontSize:10},children:"السجل التجاري"})]}),e.jsxs("div",{className:"inv-compliance-item inv-compliance-item-cr",children:[e.jsx("div",{className:"inv-compliance-label",children:"🔐 ZATCA Status"}),e.jsxs("div",{className:"inv-compliance-value",style:{color:w.color},children:[w.label," / ",a.zatcaStatus??"Pending"]}),e.jsx("div",{style:{marginTop:4,fontSize:10},children:"حالة ZATCA"})]})]}),a.hash&&e.jsxs("div",{style:{marginTop:14,padding:"8px 14px",borderRadius:10,background:"#f8fafc",border:"1px solid #e2e8f0",fontSize:10,color:"#64748b",wordBreak:"break-all",textAlign:"center"},children:[e.jsx("strong",{children:"Invoice Hash / تجزئة الفاتورة:"})," ",a.hash]})]}),e.jsxs("div",{className:"inv-watermark",children:["This invoice was generated in compliance with Saudi Arabia's ZATCA e-Invoicing Phase 2 regulations.",e.jsx("br",{}),"تم إنشاء هذه الفاتورة وفقًا لأنظمة الفوترة الإلكترونية للمرحلة الثانية من هيئة الزكاة والضريبة والجمارك"]})]})]})]})});Bt.displayName="SaudiInvoicePrint";function zn(){const{data:a,refetch:r}=V.sales.invoiceList.useQuery(void 0),{data:s}=V.sales.customerList.useQuery(void 0),{data:n}=V.settings.companySettingsGet.useQuery(),t=Dt(),i=V.sales.invoiceCreate.useMutation({onSuccess:()=>{r(),q.success("Invoice created")},onError:d=>q.error(d.message)});V.sales.invoiceUpdateStatus.useMutation({onSuccess:()=>r()});const o=V.zatca.generateXml.useMutation({onSuccess:()=>{q.success("ZATCA UBL XML generated"),A.refetch(),r()},onError:d=>q.error(d.message)}),c=V.zatca.generateQrCode.useMutation({onSuccess:()=>{q.success("ZATCA QR generated"),A.refetch(),r()},onError:d=>q.error(d.message)}),l=V.zatca.signInvoice.useMutation({onSuccess:()=>{q.success("Invoice signed for ZATCA workflow"),A.refetch(),r()},onError:d=>q.error(d.message)}),h=V.zatca.clearanceInvoice.useMutation({onSuccess:()=>q.success("ZATCA clearance workflow logged"),onError:d=>q.error(d.message)}),m=V.zatca.reportInvoice.useMutation({onSuccess:()=>q.success("ZATCA reporting workflow logged"),onError:d=>q.error(d.message)}),w=V.zatca.syncStatus.useMutation({onSuccess:()=>q.success("ZATCA status synced"),onError:d=>q.error(d.message)}),[j,g]=Z.useState(!1),[S,I]=Z.useState(null),R=Z.useRef(null),A=V.sales.invoiceGet.useQuery({id:S},{enabled:!!S}),[P,b]=Z.useState(""),T=()=>{const d=R.current;if(!d)return;const B=window.open("","_blank");B&&(B.document.write(`<html><head><title>Invoice ${u?.invoice?.invoiceNumber??""}</title></head><body>${d.innerHTML}</body></html>`),B.document.close(),B.focus(),B.print(),B.close())},[k,x]=Z.useState(""),[f,p]=Z.useState({invoiceNumber:"",customerId:0,date:"",dueDate:"",invoiceType:"standard",subTotal:"0",taxAmount:"0",taxPercent:"15",totalAmount:"0",notes:"",items:[{description:"",quantity:1,unitPrice:"0",taxPercent:"15",totalAmount:"0"}]}),v=()=>{p(d=>C({...d,items:[...d.items,{description:"",quantity:1,unitPrice:"0",taxPercent:d.taxPercent,totalAmount:"0"}]}))},E=d=>{f.items.length<=1||p(B=>C({...B,items:B.items.filter((M,F)=>F!==d)}))},N=(d,B,M)=>{p(F=>{const _=[...F.items];return _[d]={..._[d],[B]:M},C({...F,items:_})})};Z.useEffect(()=>{const d=t.selectedCountry==="SA"||(n?.country||"").toLowerCase().includes("saudi")||n?.defaultCurrency==="SAR"||n?.zatcaEnabled;p(B=>({...B,taxPercent:String(n?.vatRate??(d?"15":B.taxPercent)),invoiceType:d?"zatca":B.invoiceType,items:B.items.map(M=>({...M,taxPercent:String(n?.vatRate??(d?"15":M.taxPercent))}))}))},[t.selectedCountry,n]);const C=d=>{const B=d.items.reduce((_,te)=>_+Number(te.quantity||0)*Number(te.unitPrice||0),0),M=Number(d.taxPercent||0),F=Number((B*M/100).toFixed(2));return{...d,subTotal:B.toFixed(2),taxAmount:F.toFixed(2),totalAmount:(B+F).toFixed(2),items:d.items.map(_=>({..._,taxPercent:d.taxPercent,totalAmount:(Number(_.quantity||0)*Number(_.unitPrice||0)).toFixed(2)}))}},y=s?.find(d=>d.id===f.customerId),u=A.data;Z.useEffect(()=>{let d=!0;const B=u?.invoice?.zatcaQrCode;if(!B){x("");return}return Pt.toDataURL(B,{errorCorrectionLevel:"M",margin:2,width:220,color:{dark:"#0f172a",light:"#ffffff"}}).then(M=>{d&&x(M)}).catch(()=>{d&&x("")}),()=>{d=!1}},[u?.invoice?.zatcaQrCode]);const J=a?.filter(d=>!P||d.status===P)||[],U=u?.invoice?.id,le={draft:"bg-slate-100 text-slate-700",sent:"bg-blue-100 text-blue-700",paid:"bg-emerald-100 text-emerald-700",partial:"bg-amber-100 text-amber-700",overdue:"bg-red-100 text-red-700",cancelled:"bg-gray-100 text-gray-700"};return e.jsxs("div",{className:"space-y-6",children:[e.jsxs("div",{className:"flex items-center justify-between",children:[e.jsxs("div",{children:[e.jsx("h2",{className:"text-2xl font-bold",children:"Invoices"}),e.jsx("p",{className:"text-slate-500",children:"Manage sales invoices with ZATCA compliance"})]}),e.jsxs(De,{open:j,onOpenChange:g,children:[e.jsx(Lt,{asChild:!0,children:e.jsxs(L,{onClick:()=>p(d=>C({...d,invoiceNumber:d.invoiceNumber||`${n?.invoicePrefix||"INV-"}${Date.now().toString().slice(-6)}`,date:d.date||new Date().toISOString().slice(0,10)})),children:[e.jsx(Je,{className:"w-4 h-4 mr-2"}),"New Invoice"]})}),e.jsxs(Le,{className:"max-w-2xl",children:[e.jsx(qe,{children:e.jsx(Ue,{children:"Create Invoice"})}),e.jsxs("form",{onSubmit:d=>{d.preventDefault(),i.mutate({...f},{onSuccess:()=>g(!1)})},className:"space-y-4",children:[e.jsxs("div",{className:"grid grid-cols-3 gap-4",children:[e.jsxs("div",{children:[e.jsx(K,{children:"Invoice #"}),e.jsx(H,{value:f.invoiceNumber,onChange:d=>p({...f,invoiceNumber:d.target.value}),required:!0})]}),e.jsxs("div",{children:[e.jsx(K,{children:"Date"}),e.jsx(H,{type:"date",value:f.date,onChange:d=>p({...f,date:d.target.value}),required:!0})]}),e.jsxs("div",{children:[e.jsx(K,{children:"Due Date"}),e.jsx(H,{type:"date",value:f.dueDate,onChange:d=>p({...f,dueDate:d.target.value})})]})]}),e.jsxs("div",{className:"grid grid-cols-3 gap-4",children:[e.jsxs("div",{children:[e.jsx(K,{children:"Invoice Type"}),e.jsxs(Qe,{value:f.invoiceType,onValueChange:d=>p({...f,invoiceType:d}),children:[e.jsx(Oe,{children:e.jsx(Ke,{})}),e.jsxs(Ze,{children:[e.jsx(se,{value:"standard",children:"Standard Tax Invoice"}),e.jsx(se,{value:"simplified",children:"Simplified Invoice"}),e.jsx(se,{value:"zatca",children:"Saudi ZATCA Invoice"})]})]})]}),e.jsxs("div",{children:[e.jsx(K,{children:"VAT %"}),e.jsx(H,{type:"number",value:f.taxPercent,onChange:d=>p(C({...f,taxPercent:d.target.value}))})]}),e.jsxs("div",{children:[e.jsx(K,{children:"Currency"}),e.jsx(H,{value:n?.defaultCurrency||"SAR",disabled:!0})]})]}),e.jsxs("div",{children:[e.jsx(K,{children:"Customer"}),e.jsxs(Qe,{onValueChange:d=>p({...f,customerId:Number(d)}),children:[e.jsx(Oe,{children:e.jsx(Ke,{placeholder:"Select customer"})}),e.jsx(Ze,{children:s?.map(d=>e.jsx(se,{value:d.id.toString(),children:d.name},d.id))})]})]}),y&&e.jsxs("div",{className:"rounded-md border bg-slate-50 p-3 text-xs text-slate-600",children:[e.jsx("div",{className:"font-medium text-slate-800",children:y.name}),e.jsx("div",{children:y.address||y.city||"No address saved"}),e.jsxs("div",{children:["Tax/VAT: ",y.taxNumber||"Not provided"]})]}),e.jsxs("div",{className:"space-y-2",children:[e.jsxs("div",{className:"flex items-center justify-between",children:[e.jsx(K,{className:"text-sm font-semibold",children:"Line Items"}),e.jsxs(L,{type:"button",variant:"outline",size:"sm",onClick:v,children:[e.jsx(Je,{className:"size-3.5 mr-1"}),"Add Item"]})]}),e.jsx("div",{className:"border rounded-lg overflow-hidden",children:e.jsxs(_e,{children:[e.jsx(Ve,{children:e.jsxs(ae,{className:"bg-muted/50",children:[e.jsx(z,{className:"w-12",children:"#"}),e.jsx(z,{children:"Description"}),e.jsx(z,{className:"w-20",children:"Qty"}),e.jsx(z,{className:"w-28",children:"Unit Price"}),e.jsx(z,{className:"w-20",children:"VAT %"}),e.jsx(z,{className:"w-28 text-right",children:"Total"}),e.jsx(z,{className:"w-10"})]})}),e.jsx(He,{children:f.items.map((d,B)=>e.jsxs(ae,{children:[e.jsx(D,{className:"text-muted-foreground text-sm",children:B+1}),e.jsx(D,{children:e.jsx(H,{value:d.description,onChange:M=>N(B,"description",M.target.value),placeholder:"Item description",className:"h-8 text-sm"})}),e.jsx(D,{children:e.jsx(H,{type:"number",value:d.quantity,onChange:M=>N(B,"quantity",Number(M.target.value)),className:"h-8 text-sm",min:"0"})}),e.jsx(D,{children:e.jsx(H,{type:"number",value:d.unitPrice,onChange:M=>N(B,"unitPrice",M.target.value),className:"h-8 text-sm",min:"0"})}),e.jsx(D,{children:e.jsx(H,{type:"number",value:d.taxPercent,onChange:M=>N(B,"taxPercent",M.target.value),className:"h-8 text-sm",min:"0",max:"100"})}),e.jsx(D,{className:"text-right font-mono text-sm",children:Number(d.totalAmount||0).toLocaleString(void 0,{minimumFractionDigits:2})}),e.jsx(D,{children:f.items.length>1&&e.jsx(L,{type:"button",variant:"ghost",size:"icon",className:"size-7 text-red-500 hover:text-red-700",onClick:()=>E(B),children:e.jsx(Ut,{className:"size-3.5"})})})]},B))})]})})]}),e.jsxs("div",{className:"grid grid-cols-3 gap-4 rounded-lg bg-slate-50 p-3",children:[e.jsxs("div",{children:[e.jsx(K,{className:"text-xs",children:"Subtotal"}),e.jsx(H,{value:f.subTotal,readOnly:!0,className:"h-8 font-mono"})]}),e.jsxs("div",{children:[e.jsxs(K,{className:"text-xs",children:["VAT (",f.taxPercent,"%)"]}),e.jsx(H,{value:f.taxAmount,readOnly:!0,className:"h-8 font-mono"})]}),e.jsxs("div",{children:[e.jsx(K,{className:"text-xs font-semibold",children:"Grand Total"}),e.jsx(H,{value:f.totalAmount,readOnly:!0,className:"h-8 font-mono font-bold"})]})]}),(f.invoiceType==="zatca"||n?.zatcaEnabled)&&e.jsx("div",{className:"rounded-md border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-800",children:"Saudi invoice mode: backend requires company name and Saudi VAT number, then creates ZATCA TLV QR payload, Saudi VAT fields, XML archive data, and pending ZATCA status."}),e.jsx(L,{type:"submit",className:"w-full",children:"Create Invoice"})]})]})]})]}),e.jsxs("div",{className:"flex gap-2",children:[e.jsx(L,{variant:"outline",size:"sm",onClick:()=>b(""),className:P?"":"bg-slate-100",children:"All"}),["draft","sent","paid","partial","overdue"].map(d=>e.jsx(L,{variant:"outline",size:"sm",onClick:()=>b(d),className:P===d?"bg-slate-100 capitalize":"capitalize",children:d},d))]}),e.jsx(Mt,{children:e.jsx(zt,{className:"p-0",children:e.jsxs(_e,{children:[e.jsx(Ve,{children:e.jsxs(ae,{children:[e.jsx(z,{children:"Invoice #"}),e.jsx(z,{children:"Type"}),e.jsx(z,{children:"Date"}),e.jsx(z,{className:"text-right",children:"Subtotal"}),e.jsx(z,{className:"text-right",children:"Tax"}),e.jsx(z,{className:"text-right",children:"Total"}),e.jsx(z,{className:"text-right",children:"Paid"}),e.jsx(z,{children:"Status"}),e.jsx(z,{className:"text-right",children:"Action"})]})}),e.jsx(He,{children:J.map(d=>e.jsxs(ae,{children:[e.jsx(D,{className:"font-mono font-medium",children:d.invoiceNumber}),e.jsx(D,{children:e.jsx("span",{className:"text-xs",children:d.invoiceType==="zatca"?"ZATCA":d.invoiceType})}),e.jsx(D,{children:new Date(d.date).toLocaleDateString()}),e.jsx(D,{className:"text-right font-mono",children:Number(d.subTotal).toLocaleString()}),e.jsx(D,{className:"text-right font-mono",children:Number(d.taxAmount).toLocaleString()}),e.jsx(D,{className:"text-right font-mono font-semibold",children:Number(d.totalAmount).toLocaleString()}),e.jsx(D,{className:"text-right font-mono",children:Number(d.paidAmount).toLocaleString()}),e.jsx(D,{children:e.jsx("span",{className:`text-xs px-2 py-1 rounded-full ${le[d.status]||""}`,children:d.status})}),e.jsx(D,{className:"text-right",children:e.jsx(L,{variant:"ghost",size:"icon",onClick:()=>I(d.id),children:e.jsx(Ft,{className:"h-4 w-4"})})})]},d.id))})]})})}),e.jsx(De,{open:!!S,onOpenChange:d=>!d&&I(null),children:e.jsxs(Le,{className:"max-w-5xl max-h-[90vh] overflow-y-auto",children:[e.jsx(qe,{children:e.jsxs(Ue,{className:"flex items-center justify-between gap-3",children:[e.jsxs("span",{className:"flex items-center gap-2",children:[e.jsx("span",{className:"flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100",children:e.jsx(Ye,{className:"h-4 w-4 text-emerald-700"})}),"Saudi ZATCA Invoice / فاتورة ضريبية"]}),e.jsxs("div",{className:"flex flex-wrap justify-end gap-2",children:[U&&e.jsxs(e.Fragment,{children:[e.jsxs(L,{size:"sm",variant:"outline",onClick:()=>o.mutate({invoiceId:U}),children:[e.jsx(_t,{className:"mr-2 h-4 w-4"}),"XML"]}),e.jsxs(L,{size:"sm",variant:"outline",onClick:()=>c.mutate({invoiceId:U}),children:[e.jsx(Ye,{className:"mr-2 h-4 w-4"}),"QR"]}),e.jsxs(L,{size:"sm",variant:"outline",onClick:()=>l.mutate({invoiceId:U}),children:[e.jsx(Vt,{className:"mr-2 h-4 w-4"}),"Sign"]}),e.jsxs(L,{size:"sm",variant:"outline",onClick:()=>h.mutate({invoiceId:U}),children:[e.jsx(Fe,{className:"mr-2 h-4 w-4"}),"Clear"]}),e.jsxs(L,{size:"sm",variant:"outline",onClick:()=>m.mutate({invoiceId:U}),children:[e.jsx(Fe,{className:"mr-2 h-4 w-4"}),"Report"]}),e.jsxs(L,{size:"sm",variant:"outline",onClick:()=>w.mutate({invoiceId:U}),children:[e.jsx(qt,{className:"mr-2 h-4 w-4"}),"Sync"]})]}),e.jsxs(L,{size:"sm",onClick:T,className:"bg-emerald-700 hover:bg-emerald-800 text-white",children:[e.jsx(Ht,{className:"mr-2 h-4 w-4"}),"Print Invoice"]})]})]})}),u?.invoice&&e.jsx(Bt,{ref:R,invoice:{invoiceNumber:u.invoice.invoiceNumber,date:u.invoice.date,dueDate:u.invoice.dueDate??void 0,invoiceType:u.invoice.invoiceType,taxPercent:u.invoice.taxPercent,subTotal:u.invoice.subTotal,taxAmount:u.invoice.taxAmount,totalAmount:u.invoice.totalAmount,paidAmount:u.invoice.paidAmount,status:u.invoice.status,zatcaStatus:u.invoice.zatcaStatus??void 0,zatcaQrCode:u.invoice.zatcaQrCode??void 0,notes:u.invoice.notes??void 0,terms:u.invoice.terms??void 0,hash:u.invoice.invoiceHash??void 0},company:{companyName:u.company?.companyName,companyNameAr:u.company?.companyNameAr??void 0,address:u.company?.address??void 0,city:u.company?.city??void 0,country:u.company?.country??void 0,phone:u.company?.phone??void 0,email:u.company?.email??void 0,taxNumber:u.company?.taxNumber??void 0,crNumber:u.company?.crNumber??void 0,logo:u.company?.logo??void 0,defaultCurrency:u.company?.defaultCurrency??"SAR",invoiceTerms:u.company?.invoiceTerms??void 0},customer:{name:u.customer?.name??void 0,nameAr:void 0,address:u.customer?.address??u.customer?.city??void 0,city:u.customer?.city??void 0,phone:u.customer?.phone??void 0,email:u.customer?.email??void 0,taxNumber:u.customer?.taxNumber??void 0},items:(u.items??[]).map(d=>({id:d.id,description:d.description,quantity:d.quantity,unitPrice:d.unitPrice,taxPercent:d.taxPercent,totalAmount:d.totalAmount}))})]})})]})}export{zn as default};

import{c as Lr,y as Ar,h as qr,z as Ur,A as $r,B as Pr,e as Dr,C as jr,D as Hr,E as Wr,F as Br,G as Fr,b as zr,n as Qr,j as Vr,g as Jr,I as Gr,s as Yr,f as Kr,a as Zr,d as Xr,l as te,K as eo,i as Lt,o as st,J as at,H as to}from"./http-c73df747.js";import{cO as At}from"./index-1016e947.js";import{b as no}from"./browser-a1ac24ac.js";const ke="Session currently connected",D="Session currently disconnected",ro="Session Rejected",oo="Missing JSON RPC response",io='JSON-RPC success response must include "result" field',so='JSON-RPC error response must include "error" field',ao='JSON RPC request must have valid "method" value',co='JSON RPC request must have valid "id" value',lo="Missing one of the required parameters: bridge / uri / session",ct="JSON RPC response format is invalid",uo="URI format is invalid",_o="QRCode Modal not provided",lt="User close QRCode Modal",fo=["session_request","session_update","exchange_key","connect","disconnect","display_uri","modal_closed","transport_open","transport_close","transport_error"],ho=["wallet_addEthereumChain","wallet_switchEthereumChain","wallet_getPermissions","wallet_requestPermissions","wallet_registerOnboarding","wallet_watchAsset","wallet_scanQRCode"],Ae=["eth_sendTransaction","eth_signTransaction","eth_sign","eth_signTypedData","eth_signTypedData_v1","eth_signTypedData_v2","eth_signTypedData_v3","eth_signTypedData_v4","personal_sign",...ho],xe="WALLETCONNECT_DEEPLINK_CHOICE",po={1:"mainnet",3:"ropsten",4:"rinkeby",5:"goerli",42:"kovan"};var qt=qe;qe.strict=Ut;qe.loose=$t;var mo=Object.prototype.toString,go={"[object Int8Array]":!0,"[object Int16Array]":!0,"[object Int32Array]":!0,"[object Uint8Array]":!0,"[object Uint8ClampedArray]":!0,"[object Uint16Array]":!0,"[object Uint32Array]":!0,"[object Float32Array]":!0,"[object Float64Array]":!0};function qe(t){return Ut(t)||$t(t)}function Ut(t){return t instanceof Int8Array||t instanceof Int16Array||t instanceof Int32Array||t instanceof Uint8Array||t instanceof Uint8ClampedArray||t instanceof Uint16Array||t instanceof Uint32Array||t instanceof Float32Array||t instanceof Float64Array}function $t(t){return go[mo.call(t)]}var vo=qt.strict,yo=function(e){if(vo(e)){var n=Buffer.from(e.buffer);return e.byteLength!==e.buffer.byteLength&&(n=n.slice(e.byteOffset,e.byteOffset+e.byteLength)),n}else return Buffer.from(e)};const Ue="hex",$e="utf8",wo="binary",bo="buffer",ko="array",Eo="typed-array",Co="array-buffer",he="0";function z(t){return new Uint8Array(t)}function Pe(t,e=!1){const n=t.toString(Ue);return e?ne(n):n}function De(t){return t.toString($e)}function Pt(t){return t.readUIntBE(0,t.length)}function J(t){return yo(t)}function q(t,e=!1){return Pe(J(t),e)}function Dt(t){return De(J(t))}function jt(t){return Pt(J(t))}function je(t){return Buffer.from(Q(t),Ue)}function U(t){return z(je(t))}function So(t){return De(je(t))}function xo(t){return jt(U(t))}function He(t){return Buffer.from(t,$e)}function Ht(t){return z(He(t))}function Io(t,e=!1){return Pe(He(t),e)}function Ro(t){const e=parseInt(t,10);return Qo(zo(e),"Number can only safely store up to 53 bits"),e}function To(t){return Lo(We(t))}function Oo(t){return Be(We(t))}function No(t,e){return Ao(We(t),e)}function Mo(t){return`${t}`}function We(t){const e=(t>>>0).toString(2);return ze(e)}function Lo(t){return J(Be(t))}function Be(t){return new Uint8Array(jo(t).map(e=>parseInt(e,2)))}function Ao(t,e){return q(Be(t),e)}function qo(t){return!(typeof t!="string"||!new RegExp(/^[01]+$/).test(t)||t.length%8!==0)}function Wt(t,e){return!(typeof t!="string"||!t.match(/^0x[0-9A-Fa-f]*$/)||e&&t.length!==2+2*e)}function pe(t){return Buffer.isBuffer(t)}function Fe(t){return qt.strict(t)&&!pe(t)}function Bt(t){return!Fe(t)&&!pe(t)&&typeof t.byteLength<"u"}function Uo(t){return pe(t)?bo:Fe(t)?Eo:Bt(t)?Co:Array.isArray(t)?ko:typeof t}function $o(t){return qo(t)?wo:Wt(t)?Ue:$e}function Po(...t){return Buffer.concat(t)}function Ft(...t){let e=[];return t.forEach(n=>e=e.concat(Array.from(n))),new Uint8Array([...e])}function Do(t,e=8){const n=t%e;return n?(t-n)/e*e+e:t}function jo(t,e=8){const n=ze(t).match(new RegExp(`.{${e}}`,"gi"));return Array.from(n||[])}function ze(t,e=8,n=he){return Ho(t,Do(t.length,e),n)}function Ho(t,e,n=he){return Vo(t,e,!0,n)}function Q(t){return t.replace(/^0x/,"")}function ne(t){return t.startsWith("0x")?t:`0x${t}`}function Wo(t){return t=Q(t),t=ze(t,2),t&&(t=ne(t)),t}function Bo(t){const e=t.startsWith("0x");return t=Q(t),t=t.startsWith(he)?t.substring(1):t,e?ne(t):t}function Fo(t){return typeof t>"u"}function zo(t){return!Fo(t)}function Qo(t,e){if(!t)throw new Error(e)}function Vo(t,e,n,r=he){const o=e-t.length;let i=t;if(o>0){const c=r.repeat(o);i=n?c+t:t+c}return i}function le(t){return J(new Uint8Array(t))}function Jo(t){return Dt(new Uint8Array(t))}function zt(t,e){return q(new Uint8Array(t),!e)}function Go(t){return jt(new Uint8Array(t))}function Yo(...t){return U(t.map(e=>q(new Uint8Array(e))).join("")).buffer}function Qt(t){return z(t).buffer}function Ko(t){return De(t)}function Zo(t,e){return Pe(t,!e)}function Xo(t){return Pt(t)}function ei(...t){return Po(...t)}function ti(t){return Ht(t).buffer}function ni(t){return He(t)}function ri(t,e){return Io(t,!e)}function oi(t){return Ro(t)}function ii(t){return je(t)}function Vt(t){return U(t).buffer}function si(t){return So(t)}function ai(t){return xo(t)}function ci(t){return To(t)}function li(t){return Oo(t).buffer}function ui(t){return Mo(t)}function Jt(t,e){return No(Number(t),!e)}const _i=Ur,di=$r,fi=Pr,hi=Dr,pi=jr,Gt=qr,mi=Hr,Yt=Lr,gi=Wr,vi=Br,yi=Fr,me=Ar;function ge(t){return zr(t)}function ve(){const t=ge();return t&&t.os?t.os:void 0}function Kt(){const t=ve();return t?t.toLowerCase().includes("android"):!1}function Zt(){const t=ve();return t?t.toLowerCase().includes("ios")||t.toLowerCase().includes("mac")&&navigator.maxTouchPoints>1:!1}function Xt(){return ve()?Kt()||Zt():!1}function en(){const t=ge();return t&&t.name?t.name.toLowerCase()==="node":!1}function tn(){return!en()&&!!Gt()}const nn=Qr,rn=Vr;function Qe(t,e){const n=rn(e),r=me();r&&r.setItem(t,n)}function Ve(t){let e=null,n=null;const r=me();return r&&(n=r.getItem(t)),e=n&&nn(n),e}function Je(t){const e=me();e&&e.removeItem(t)}function Ie(){return Jr()}function wi(t){return Wo(t)}function bi(t){return ne(t)}function ki(t){return Q(t)}function Ei(t){return Bo(ne(t))}const on=Gr;function se(){return((e,n)=>{for(n=e="";e++<36;n+=e*51&52?(e^15?8^Math.random()*(e^20?16:4):4).toString(16):"-");return n})()}function Ci(){console.warn("DEPRECATION WARNING: This WalletConnect client library will be deprecated in favor of @walletconnect/client. Please check docs.walletconnect.org to learn more about this migration!")}function sn(t,e){let n;const r=po[t];return r&&(n=`https://${r}.infura.io/v3/${e}`),n}function an(t,e){let n;const r=sn(t,e.infuraId);return e.custom&&e.custom[t]?n=e.custom[t]:r&&(n=r),n}function Si(t,e){const n=encodeURIComponent(t);return e.universalLink?`${e.universalLink}/wc?uri=${n}`:e.deepLink?`${e.deepLink}${e.deepLink.endsWith(":")?"//":"/"}wc?uri=${n}`:""}function xi(t){const e=t.href.split("?")[0];Qe(xe,Object.assign(Object.assign({},t),{href:e}))}function cn(t,e){return t.filter(n=>n.name.toLowerCase().includes(e.toLowerCase()))[0]}function Ii(t,e){let n=t;return e&&(n=e.map(r=>cn(t,r)).filter(Boolean)),n}function Ri(t,e){return async(...r)=>new Promise((o,i)=>{const c=(u,h)=>{(u===null||typeof u>"u")&&i(u),o(h)};t.apply(e,[...r,c])})}function ln(t){const e=t.message||"Failed or Rejected Request";let n=-32e3;if(t&&!t.code)switch(e){case"Parse error":n=-32700;break;case"Invalid request":n=-32600;break;case"Method not found":n=-32601;break;case"Invalid params":n=-32602;break;case"Internal error":n=-32603;break;default:n=-32e3;break}const r={code:n,message:e};return t.data&&(r.data=t.data),r}const un="https://registry.walletconnect.com";function Ti(){return un+"/api/v2/wallets"}function Oi(){return un+"/api/v2/dapps"}function _n(t,e="mobile"){var n;return{name:t.name||"",shortName:t.metadata.shortName||"",color:t.metadata.colors.primary||"",logo:(n=t.image_url.sm)!==null&&n!==void 0?n:"",universalLink:t[e].universal||"",deepLink:t[e].native||""}}function Ni(t,e="mobile"){return Object.values(t).filter(n=>!!n[e].universal||!!n[e].native).map(n=>_n(n,e))}var Ge={};(function(t){const e=Zr,n=Xr,r=Yr,o=Kr,i=a=>a==null;function c(a){switch(a.arrayFormat){case"index":return l=>(f,_)=>{const v=f.length;return _===void 0||a.skipNull&&_===null||a.skipEmptyString&&_===""?f:_===null?[...f,[p(l,a),"[",v,"]"].join("")]:[...f,[p(l,a),"[",p(v,a),"]=",p(_,a)].join("")]};case"bracket":return l=>(f,_)=>_===void 0||a.skipNull&&_===null||a.skipEmptyString&&_===""?f:_===null?[...f,[p(l,a),"[]"].join("")]:[...f,[p(l,a),"[]=",p(_,a)].join("")];case"comma":case"separator":return l=>(f,_)=>_==null||_.length===0?f:f.length===0?[[p(l,a),"=",p(_,a)].join("")]:[[f,p(_,a)].join(a.arrayFormatSeparator)];default:return l=>(f,_)=>_===void 0||a.skipNull&&_===null||a.skipEmptyString&&_===""?f:_===null?[...f,p(l,a)]:[...f,[p(l,a),"=",p(_,a)].join("")]}}function u(a){let l;switch(a.arrayFormat){case"index":return(f,_,v)=>{if(l=/\[(\d*)\]$/.exec(f),f=f.replace(/\[\d*\]$/,""),!l){v[f]=_;return}v[f]===void 0&&(v[f]={}),v[f][l[1]]=_};case"bracket":return(f,_,v)=>{if(l=/(\[\])$/.exec(f),f=f.replace(/\[\]$/,""),!l){v[f]=_;return}if(v[f]===void 0){v[f]=[_];return}v[f]=[].concat(v[f],_)};case"comma":case"separator":return(f,_,v)=>{const E=typeof _=="string"&&_.includes(a.arrayFormatSeparator),b=typeof _=="string"&&!E&&s(_,a).includes(a.arrayFormatSeparator);_=b?s(_,a):_;const S=E||b?_.split(a.arrayFormatSeparator).map(T=>s(T,a)):_===null?_:s(_,a);v[f]=S};default:return(f,_,v)=>{if(v[f]===void 0){v[f]=_;return}v[f]=[].concat(v[f],_)}}}function h(a){if(typeof a!="string"||a.length!==1)throw new TypeError("arrayFormatSeparator must be single character string")}function p(a,l){return l.encode?l.strict?e(a):encodeURIComponent(a):a}function s(a,l){return l.decode?n(a):a}function w(a){return Array.isArray(a)?a.sort():typeof a=="object"?w(Object.keys(a)).sort((l,f)=>Number(l)-Number(f)).map(l=>a[l]):a}function g(a){const l=a.indexOf("#");return l!==-1&&(a=a.slice(0,l)),a}function m(a){let l="";const f=a.indexOf("#");return f!==-1&&(l=a.slice(f)),l}function k(a){a=g(a);const l=a.indexOf("?");return l===-1?"":a.slice(l+1)}function I(a,l){return l.parseNumbers&&!Number.isNaN(Number(a))&&typeof a=="string"&&a.trim()!==""?a=Number(a):l.parseBooleans&&a!==null&&(a.toLowerCase()==="true"||a.toLowerCase()==="false")&&(a=a.toLowerCase()==="true"),a}function C(a,l){l=Object.assign({decode:!0,sort:!0,arrayFormat:"none",arrayFormatSeparator:",",parseNumbers:!1,parseBooleans:!1},l),h(l.arrayFormatSeparator);const f=u(l),_=Object.create(null);if(typeof a!="string"||(a=a.trim().replace(/^[?#&]/,""),!a))return _;for(const v of a.split("&")){if(v==="")continue;let[E,b]=r(l.decode?v.replace(/\+/g," "):v,"=");b=b===void 0?null:["comma","separator"].includes(l.arrayFormat)?b:s(b,l),f(s(E,l),b,_)}for(const v of Object.keys(_)){const E=_[v];if(typeof E=="object"&&E!==null)for(const b of Object.keys(E))E[b]=I(E[b],l);else _[v]=I(E,l)}return l.sort===!1?_:(l.sort===!0?Object.keys(_).sort():Object.keys(_).sort(l.sort)).reduce((v,E)=>{const b=_[E];return b&&typeof b=="object"&&!Array.isArray(b)?v[E]=w(b):v[E]=b,v},Object.create(null))}t.extract=k,t.parse=C,t.stringify=(a,l)=>{if(!a)return"";l=Object.assign({encode:!0,strict:!0,arrayFormat:"none",arrayFormatSeparator:","},l),h(l.arrayFormatSeparator);const f=b=>l.skipNull&&i(a[b])||l.skipEmptyString&&a[b]==="",_=c(l),v={};for(const b of Object.keys(a))f(b)||(v[b]=a[b]);const E=Object.keys(v);return l.sort!==!1&&E.sort(l.sort),E.map(b=>{const S=a[b];return S===void 0?"":S===null?p(b,l):Array.isArray(S)?S.reduce(_(b),[]).join("&"):p(b,l)+"="+p(S,l)}).filter(b=>b.length>0).join("&")},t.parseUrl=(a,l)=>{l=Object.assign({decode:!0},l);const[f,_]=r(a,"#");return Object.assign({url:f.split("?")[0]||"",query:C(k(a),l)},l&&l.parseFragmentIdentifier&&_?{fragmentIdentifier:s(_,l)}:{})},t.stringifyUrl=(a,l)=>{l=Object.assign({encode:!0,strict:!0},l);const f=g(a.url).split("?")[0]||"",_=t.extract(a.url),v=t.parse(_,{sort:!1}),E=Object.assign(v,a.query);let b=t.stringify(E,l);b&&(b=`?${b}`);let S=m(a.url);return a.fragmentIdentifier&&(S=`#${p(a.fragmentIdentifier,l)}`),`${f}${b}${S}`},t.pick=(a,l,f)=>{f=Object.assign({parseFragmentIdentifier:!0},f);const{url:_,query:v,fragmentIdentifier:E}=t.parseUrl(a,f);return t.stringifyUrl({url:_,query:o(v,l),fragmentIdentifier:E},f)},t.exclude=(a,l,f)=>{const _=Array.isArray(l)?v=>!l.includes(v):(v,E)=>!l(v,E);return t.pick(a,_,f)}})(Ge);function dn(t){const e=t.indexOf("?")!==-1?t.indexOf("?"):void 0;return typeof e<"u"?t.substr(e):""}function fn(t,e){let n=Ye(t);return n=Object.assign(Object.assign({},n),e),t=hn(n),t}function Ye(t){return Ge.parse(t)}function hn(t){return Ge.stringify(t)}function pn(t){return typeof t.bridge<"u"}function mn(t){const e=t.indexOf(":"),n=t.indexOf("?")!==-1?t.indexOf("?"):void 0,r=t.substring(0,e),o=t.substring(e+1,n);function i(w){const g="@",m=w.split(g);return{handshakeTopic:m[0],version:parseInt(m[1],10)}}const c=i(o),u=typeof n<"u"?t.substr(n):"";function h(w){const g=Ye(w);return{key:g.key||"",bridge:g.bridge||""}}const p=h(u);return Object.assign(Object.assign({protocol:r},c),p)}function Mi(t){return t===""||typeof t=="string"&&t.trim()===""}function Li(t){return!(t&&t.length)}function Ai(t){return pe(t)}function qi(t){return Fe(t)}function Ui(t){return Bt(t)}function $i(t){return Uo(t)}function Pi(t){return $o(t)}function Di(t,e){return Wt(t,e)}function ji(t){return typeof t.params=="object"}function gn(t){return typeof t.method<"u"}function B(t){return typeof t.result<"u"}function Z(t){return typeof t.error<"u"}function Re(t){return typeof t.event<"u"}function vn(t){return fo.includes(t)||t.startsWith("wc_")}function yn(t){return t.method.startsWith("wc_")?!0:!Ae.includes(t.method)}const Hi=Object.freeze(Object.defineProperty({__proto__:null,addHexPrefix:bi,appendToQueryString:fn,concatArrayBuffers:Yo,concatBuffers:ei,convertArrayBufferToBuffer:le,convertArrayBufferToHex:zt,convertArrayBufferToNumber:Go,convertArrayBufferToUtf8:Jo,convertBufferToArrayBuffer:Qt,convertBufferToHex:Zo,convertBufferToNumber:Xo,convertBufferToUtf8:Ko,convertHexToArrayBuffer:Vt,convertHexToBuffer:ii,convertHexToNumber:ai,convertHexToUtf8:si,convertNumberToArrayBuffer:li,convertNumberToBuffer:ci,convertNumberToHex:Jt,convertNumberToUtf8:ui,convertUtf8ToArrayBuffer:ti,convertUtf8ToBuffer:ni,convertUtf8ToHex:ri,convertUtf8ToNumber:oi,detectEnv:ge,detectOS:ve,formatIOSMobile:Si,formatMobileRegistry:Ni,formatMobileRegistryEntry:_n,formatQueryString:hn,formatRpcError:ln,getClientMeta:Ie,getCrypto:vi,getCryptoOrThrow:gi,getDappRegistryUrl:Oi,getDocument:hi,getDocumentOrThrow:fi,getEncoding:Pi,getFromWindow:_i,getFromWindowOrThrow:di,getInfuraRpcUrl:sn,getLocal:Ve,getLocalStorage:me,getLocalStorageOrThrow:yi,getLocation:Yt,getLocationOrThrow:mi,getMobileLinkRegistry:Ii,getMobileRegistryEntry:cn,getNavigator:Gt,getNavigatorOrThrow:pi,getQueryString:dn,getRpcUrl:an,getType:$i,getWalletRegistryUrl:Ti,isAndroid:Kt,isArrayBuffer:Ui,isBrowser:tn,isBuffer:Ai,isEmptyArray:Li,isEmptyString:Mi,isHexString:Di,isIOS:Zt,isInternalEvent:Re,isJsonRpcRequest:gn,isJsonRpcResponseError:Z,isJsonRpcResponseSuccess:B,isJsonRpcSubscription:ji,isMobile:Xt,isNode:en,isReservedEvent:vn,isSilentPayload:yn,isTypedArray:qi,isWalletConnectSession:pn,logDeprecationWarning:Ci,parseQueryString:Ye,parseWalletConnectUri:mn,payloadId:on,promisify:Ri,removeHexLeadingZeros:Ei,removeHexPrefix:ki,removeLocal:Je,safeJsonParse:nn,safeJsonStringify:rn,sanitizeHex:wi,saveMobileLinkInfo:xi,setLocal:Qe,uuid:se},Symbol.toStringTag,{value:"Module"}));class Wi{constructor(){this._eventEmitters=[],typeof window<"u"&&typeof window.addEventListener<"u"&&(window.addEventListener("online",()=>this.trigger("online")),window.addEventListener("offline",()=>this.trigger("offline")))}on(e,n){this._eventEmitters.push({event:e,callback:n})}trigger(e){let n=[];e&&(n=this._eventEmitters.filter(r=>r.event===e)),n.forEach(r=>{r.callback()})}}const Bi=typeof global.WebSocket<"u"?global.WebSocket:require("ws");class Fi{constructor(e){if(this.opts=e,this._queue=[],this._events=[],this._subscriptions=[],this._protocol=e.protocol,this._version=e.version,this._url="",this._netMonitor=null,this._socket=null,this._nextSocket=null,this._subscriptions=e.subscriptions||[],this._netMonitor=e.netMonitor||new Wi,!e.url||typeof e.url!="string")throw new Error("Missing or invalid WebSocket url");this._url=e.url,this._netMonitor.on("online",()=>this._socketCreate())}set readyState(e){}get readyState(){return this._socket?this._socket.readyState:-1}set connecting(e){}get connecting(){return this.readyState===0}set connected(e){}get connected(){return this.readyState===1}set closing(e){}get closing(){return this.readyState===2}set closed(e){}get closed(){return this.readyState===3}open(){this._socketCreate()}close(){this._socketClose()}send(e,n,r){if(!n||typeof n!="string")throw new Error("Missing or invalid topic field");this._socketSend({topic:n,type:"pub",payload:e,silent:!!r})}subscribe(e){this._socketSend({topic:e,type:"sub",payload:"",silent:!0})}on(e,n){this._events.push({event:e,callback:n})}_socketCreate(){if(this._nextSocket)return;const e=zi(this._url,this._protocol,this._version);if(this._nextSocket=new Bi(e),!this._nextSocket)throw new Error("Failed to create socket");this._nextSocket.onmessage=n=>this._socketReceive(n),this._nextSocket.onopen=()=>this._socketOpen(),this._nextSocket.onerror=n=>this._socketError(n),this._nextSocket.onclose=()=>{setTimeout(()=>{this._nextSocket=null,this._socketCreate()},1e3)}}_socketOpen(){this._socketClose(),this._socket=this._nextSocket,this._nextSocket=null,this._queueSubscriptions(),this._pushQueue()}_socketClose(){this._socket&&(this._socket.onclose=()=>{},this._socket.close())}_socketSend(e){const n=JSON.stringify(e);this._socket&&this._socket.readyState===1?this._socket.send(n):(this._setToQueue(e),this._socketCreate())}async _socketReceive(e){let n;try{n=JSON.parse(e.data)}catch{return}if(this._socketSend({topic:n.topic,type:"ack",payload:"",silent:!0}),this._socket&&this._socket.readyState===1){const r=this._events.filter(o=>o.event==="message");r&&r.length&&r.forEach(o=>o.callback(n))}}_socketError(e){const n=this._events.filter(r=>r.event==="error");n&&n.length&&n.forEach(r=>r.callback(e))}_queueSubscriptions(){this._subscriptions.forEach(n=>this._queue.push({topic:n,type:"sub",payload:"",silent:!0})),this._subscriptions=this.opts.subscriptions||[]}_setToQueue(e){this._queue.push(e)}_pushQueue(){this._queue.forEach(n=>this._socketSend(n)),this._queue=[]}}function zi(t,e,n){var r,o;const c=(t.startsWith("https")?t.replace("https","wss"):t.startsWith("http")?t.replace("http","ws"):t).split("?"),u=tn()?{protocol:e,version:n,env:"browser",host:((r=Yt())===null||r===void 0?void 0:r.host)||""}:{protocol:e,version:n,env:((o=ge())===null||o===void 0?void 0:o.name)||""},h=fn(dn(c[1]||""),u);return c[0]+"?"+h}class Qi{constructor(){this._eventEmitters=[]}subscribe(e){this._eventEmitters.push(e)}unsubscribe(e){this._eventEmitters=this._eventEmitters.filter(n=>n.event!==e)}trigger(e){let n=[],r;gn(e)?r=e.method:B(e)||Z(e)?r=`response:${e.id}`:Re(e)?r=e.event:r="",r&&(n=this._eventEmitters.filter(o=>o.event===r)),(!n||!n.length)&&!vn(r)&&!Re(r)&&(n=this._eventEmitters.filter(o=>o.event==="call_request")),n.forEach(o=>{if(Z(e)){const i=new Error(e.error.message);o.callback(i,null)}else o.callback(null,e)})}}class Vi{constructor(e="walletconnect"){this.storageId=e}getSession(){let e=null;const n=Ve(this.storageId);return n&&pn(n)&&(e=n),e}setSession(e){return Qe(this.storageId,e),e}removeSession(){Je(this.storageId)}}const Ji="walletconnect.org",Gi="abcdefghijklmnopqrstuvwxyz0123456789",wn=Gi.split("").map(t=>`https://${t}.bridge.walletconnect.org`);function Yi(t){let e=t.indexOf("//")>-1?t.split("/")[2]:t.split("/")[0];return e=e.split(":")[0],e=e.split("?")[0],e}function Ki(t){return Yi(t).split(".").slice(-2).join(".")}function Zi(){return Math.floor(Math.random()*wn.length)}function Xi(){return wn[Zi()]}function es(t){return Ki(t)===Ji}function ts(t){return es(t)?Xi():t}class ns{constructor(e){if(this.protocol="wc",this.version=1,this._bridge="",this._key=null,this._clientId="",this._clientMeta=null,this._peerId="",this._peerMeta=null,this._handshakeId=0,this._handshakeTopic="",this._connected=!1,this._accounts=[],this._chainId=0,this._networkId=0,this._rpcUrl="",this._eventManager=new Qi,this._clientMeta=Ie()||e.connectorOpts.clientMeta||null,this._cryptoLib=e.cryptoLib,this._sessionStorage=e.sessionStorage||new Vi(e.connectorOpts.storageId),this._qrcodeModal=e.connectorOpts.qrcodeModal,this._qrcodeModalOptions=e.connectorOpts.qrcodeModalOptions,this._signingMethods=[...Ae,...e.connectorOpts.signingMethods||[]],!e.connectorOpts.bridge&&!e.connectorOpts.uri&&!e.connectorOpts.session)throw new Error(lo);e.connectorOpts.bridge&&(this.bridge=ts(e.connectorOpts.bridge)),e.connectorOpts.uri&&(this.uri=e.connectorOpts.uri);const n=e.connectorOpts.session||this._getStorageSession();n&&(this.session=n),this.handshakeId&&this._subscribeToSessionResponse(this.handshakeId,"Session request rejected"),this._transport=e.transport||new Fi({protocol:this.protocol,version:this.version,url:this.bridge,subscriptions:[this.clientId]}),this._subscribeToInternalEvents(),this._initTransport(),e.connectorOpts.uri&&this._subscribeToSessionRequest(),e.pushServerOpts&&this._registerPushServer(e.pushServerOpts)}set bridge(e){e&&(this._bridge=e)}get bridge(){return this._bridge}set key(e){if(!e)return;const n=Vt(e);this._key=n}get key(){return this._key?zt(this._key,!0):""}set clientId(e){e&&(this._clientId=e)}get clientId(){let e=this._clientId;return e||(e=this._clientId=se()),this._clientId}set peerId(e){e&&(this._peerId=e)}get peerId(){return this._peerId}set clientMeta(e){}get clientMeta(){let e=this._clientMeta;return e||(e=this._clientMeta=Ie()),e}set peerMeta(e){this._peerMeta=e}get peerMeta(){return this._peerMeta}set handshakeTopic(e){e&&(this._handshakeTopic=e)}get handshakeTopic(){return this._handshakeTopic}set handshakeId(e){e&&(this._handshakeId=e)}get handshakeId(){return this._handshakeId}get uri(){return this._formatUri()}set uri(e){if(!e)return;const{handshakeTopic:n,bridge:r,key:o}=this._parseUri(e);this.handshakeTopic=n,this.bridge=r,this.key=o}set chainId(e){this._chainId=e}get chainId(){return this._chainId}set networkId(e){this._networkId=e}get networkId(){return this._networkId}set accounts(e){this._accounts=e}get accounts(){return this._accounts}set rpcUrl(e){this._rpcUrl=e}get rpcUrl(){return this._rpcUrl}set connected(e){}get connected(){return this._connected}set pending(e){}get pending(){return!!this._handshakeTopic}get session(){return{connected:this.connected,accounts:this.accounts,chainId:this.chainId,bridge:this.bridge,key:this.key,clientId:this.clientId,clientMeta:this.clientMeta,peerId:this.peerId,peerMeta:this.peerMeta,handshakeId:this.handshakeId,handshakeTopic:this.handshakeTopic}}set session(e){e&&(this._connected=e.connected,this.accounts=e.accounts,this.chainId=e.chainId,this.bridge=e.bridge,this.key=e.key,this.clientId=e.clientId,this.clientMeta=e.clientMeta,this.peerId=e.peerId,this.peerMeta=e.peerMeta,this.handshakeId=e.handshakeId,this.handshakeTopic=e.handshakeTopic)}on(e,n){const r={event:e,callback:n};this._eventManager.subscribe(r)}off(e){this._eventManager.unsubscribe(e)}async createInstantRequest(e){this._key=await this._generateKey();const n=this._formatRequest({method:"wc_instantRequest",params:[{peerId:this.clientId,peerMeta:this.clientMeta,request:this._formatRequest(e)}]});this.handshakeId=n.id,this.handshakeTopic=se(),this._eventManager.trigger({event:"display_uri",params:[this.uri]}),this.on("modal_closed",()=>{throw new Error(lt)});const r=()=>{this.killSession()};try{const o=await this._sendCallRequest(n);return o&&r(),o}catch(o){throw r(),o}}async connect(e){if(!this._qrcodeModal)throw new Error(_o);return this.connected?{chainId:this.chainId,accounts:this.accounts}:(await this.createSession(e),new Promise(async(n,r)=>{this.on("modal_closed",()=>r(new Error(lt))),this.on("connect",(o,i)=>{if(o)return r(o);n(i.params[0])})}))}async createSession(e){if(this._connected)throw new Error(ke);if(this.pending)return;this._key=await this._generateKey();const n=this._formatRequest({method:"wc_sessionRequest",params:[{peerId:this.clientId,peerMeta:this.clientMeta,chainId:e&&e.chainId?e.chainId:null}]});this.handshakeId=n.id,this.handshakeTopic=se(),this._sendSessionRequest(n,"Session update rejected",{topic:this.handshakeTopic}),this._eventManager.trigger({event:"display_uri",params:[this.uri]})}approveSession(e){if(this._connected)throw new Error(ke);this.chainId=e.chainId,this.accounts=e.accounts,this.networkId=e.networkId||0,this.rpcUrl=e.rpcUrl||"";const n={approved:!0,chainId:this.chainId,networkId:this.networkId,accounts:this.accounts,rpcUrl:this.rpcUrl,peerId:this.clientId,peerMeta:this.clientMeta},r={id:this.handshakeId,jsonrpc:"2.0",result:n};this._sendResponse(r),this._connected=!0,this._setStorageSession(),this._eventManager.trigger({event:"connect",params:[{peerId:this.peerId,peerMeta:this.peerMeta,chainId:this.chainId,accounts:this.accounts}]})}rejectSession(e){if(this._connected)throw new Error(ke);const n=e&&e.message?e.message:ro,r=this._formatResponse({id:this.handshakeId,error:{message:n}});this._sendResponse(r),this._connected=!1,this._eventManager.trigger({event:"disconnect",params:[{message:n}]}),this._removeStorageSession()}updateSession(e){if(!this._connected)throw new Error(D);this.chainId=e.chainId,this.accounts=e.accounts,this.networkId=e.networkId||0,this.rpcUrl=e.rpcUrl||"";const n={approved:!0,chainId:this.chainId,networkId:this.networkId,accounts:this.accounts,rpcUrl:this.rpcUrl},r=this._formatRequest({method:"wc_sessionUpdate",params:[n]});this._sendSessionRequest(r,"Session update rejected"),this._eventManager.trigger({event:"session_update",params:[{chainId:this.chainId,accounts:this.accounts}]}),this._manageStorageSession()}async killSession(e){const n=e?e.message:"Session Disconnected",r={approved:!1,chainId:null,networkId:null,accounts:null},o=this._formatRequest({method:"wc_sessionUpdate",params:[r]});await this._sendRequest(o),this._handleSessionDisconnect(n)}async sendTransaction(e){if(!this._connected)throw new Error(D);const n=e,r=this._formatRequest({method:"eth_sendTransaction",params:[n]});return await this._sendCallRequest(r)}async signTransaction(e){if(!this._connected)throw new Error(D);const n=e,r=this._formatRequest({method:"eth_signTransaction",params:[n]});return await this._sendCallRequest(r)}async signMessage(e){if(!this._connected)throw new Error(D);const n=this._formatRequest({method:"eth_sign",params:e});return await this._sendCallRequest(n)}async signPersonalMessage(e){if(!this._connected)throw new Error(D);const n=this._formatRequest({method:"personal_sign",params:e});return await this._sendCallRequest(n)}async signTypedData(e){if(!this._connected)throw new Error(D);const n=this._formatRequest({method:"eth_signTypedData",params:e});return await this._sendCallRequest(n)}async updateChain(e){if(!this._connected)throw new Error("Session currently disconnected");const n=this._formatRequest({method:"wallet_updateChain",params:[e]});return await this._sendCallRequest(n)}unsafeSend(e,n){return this._sendRequest(e,n),this._eventManager.trigger({event:"call_request_sent",params:[{request:e,options:n}]}),new Promise((r,o)=>{this._subscribeToResponse(e.id,(i,c)=>{if(i){o(i);return}if(!c)throw new Error(oo);r(c)})})}async sendCustomRequest(e,n){if(!this._connected)throw new Error(D);switch(e.method){case"eth_accounts":return this.accounts;case"eth_chainId":return Jt(this.chainId);case"eth_sendTransaction":case"eth_signTransaction":e.params;break;case"personal_sign":e.params;break}const r=this._formatRequest(e);return await this._sendCallRequest(r,n)}approveRequest(e){if(B(e)){const n=this._formatResponse(e);this._sendResponse(n)}else throw new Error(io)}rejectRequest(e){if(Z(e)){const n=this._formatResponse(e);this._sendResponse(n)}else throw new Error(so)}transportClose(){this._transport.close()}async _sendRequest(e,n){const r=this._formatRequest(e),o=await this._encrypt(r),i=typeof(n==null?void 0:n.topic)<"u"?n.topic:this.peerId,c=JSON.stringify(o),u=typeof(n==null?void 0:n.forcePushNotification)<"u"?!n.forcePushNotification:yn(r);this._transport.send(c,i,u)}async _sendResponse(e){const n=await this._encrypt(e),r=this.peerId,o=JSON.stringify(n),i=!0;this._transport.send(o,r,i)}async _sendSessionRequest(e,n,r){this._sendRequest(e,r),this._subscribeToSessionResponse(e.id,n)}_sendCallRequest(e,n){return this._sendRequest(e,n),this._eventManager.trigger({event:"call_request_sent",params:[{request:e,options:n}]}),this._subscribeToCallResponse(e.id)}_formatRequest(e){if(typeof e.method>"u")throw new Error(ao);return{id:typeof e.id>"u"?on():e.id,jsonrpc:"2.0",method:e.method,params:typeof e.params>"u"?[]:e.params}}_formatResponse(e){if(typeof e.id>"u")throw new Error(co);const n={id:e.id,jsonrpc:"2.0"};if(Z(e)){const r=ln(e.error);return Object.assign(Object.assign(Object.assign({},n),e),{error:r})}else if(B(e))return Object.assign(Object.assign({},n),e);throw new Error(ct)}_handleSessionDisconnect(e){const n=e||"Session Disconnected";this._connected||(this._qrcodeModal&&this._qrcodeModal.close(),Je(xe)),this._connected&&(this._connected=!1),this._handshakeId&&(this._handshakeId=0),this._handshakeTopic&&(this._handshakeTopic=""),this._peerId&&(this._peerId=""),this._eventManager.trigger({event:"disconnect",params:[{message:n}]}),this._removeStorageSession(),this.transportClose()}_handleSessionResponse(e,n){n?n.approved?(this._connected?(n.chainId&&(this.chainId=n.chainId),n.accounts&&(this.accounts=n.accounts),this._eventManager.trigger({event:"session_update",params:[{chainId:this.chainId,accounts:this.accounts}]})):(this._connected=!0,n.chainId&&(this.chainId=n.chainId),n.accounts&&(this.accounts=n.accounts),n.peerId&&!this.peerId&&(this.peerId=n.peerId),n.peerMeta&&!this.peerMeta&&(this.peerMeta=n.peerMeta),this._eventManager.trigger({event:"connect",params:[{peerId:this.peerId,peerMeta:this.peerMeta,chainId:this.chainId,accounts:this.accounts}]})),this._manageStorageSession()):this._handleSessionDisconnect(e):this._handleSessionDisconnect(e)}async _handleIncomingMessages(e){if(![this.clientId,this.handshakeTopic].includes(e.topic))return;let r;try{r=JSON.parse(e.payload)}catch{return}const o=await this._decrypt(r);o&&this._eventManager.trigger(o)}_subscribeToSessionRequest(){this._transport.subscribe(this.handshakeTopic)}_subscribeToResponse(e,n){this.on(`response:${e}`,n)}_subscribeToSessionResponse(e,n){this._subscribeToResponse(e,(r,o)=>{if(r){this._handleSessionResponse(r.message);return}B(o)?this._handleSessionResponse(n,o.result):o.error&&o.error.message?this._handleSessionResponse(o.error.message):this._handleSessionResponse(n)})}_subscribeToCallResponse(e){return new Promise((n,r)=>{this._subscribeToResponse(e,(o,i)=>{if(o){r(o);return}B(i)?n(i.result):i.error&&i.error.message?r(i.error):r(new Error(ct))})})}_subscribeToInternalEvents(){this.on("display_uri",()=>{this._qrcodeModal&&this._qrcodeModal.open(this.uri,()=>{this._eventManager.trigger({event:"modal_closed",params:[]})},this._qrcodeModalOptions)}),this.on("connect",()=>{this._qrcodeModal&&this._qrcodeModal.close()}),this.on("call_request_sent",(e,n)=>{const{request:r}=n.params[0];if(Xt()&&this._signingMethods.includes(r.method)){const o=Ve(xe);o&&(window.location.href=o.href)}}),this.on("wc_sessionRequest",(e,n)=>{e&&this._eventManager.trigger({event:"error",params:[{code:"SESSION_REQUEST_ERROR",message:e.toString()}]}),this.handshakeId=n.id,this.peerId=n.params[0].peerId,this.peerMeta=n.params[0].peerMeta;const r=Object.assign(Object.assign({},n),{method:"session_request"});this._eventManager.trigger(r)}),this.on("wc_sessionUpdate",(e,n)=>{e&&this._handleSessionResponse(e.message),this._handleSessionResponse("Session disconnected",n.params[0])})}_initTransport(){this._transport.on("message",e=>this._handleIncomingMessages(e)),this._transport.on("open",()=>this._eventManager.trigger({event:"transport_open",params:[]})),this._transport.on("close",()=>this._eventManager.trigger({event:"transport_close",params:[]})),this._transport.on("error",()=>this._eventManager.trigger({event:"transport_error",params:["Websocket connection failed"]})),this._transport.open()}_formatUri(){const e=this.protocol,n=this.handshakeTopic,r=this.version,o=encodeURIComponent(this.bridge),i=this.key;return`${e}:${n}@${r}?bridge=${o}&key=${i}`}_parseUri(e){const n=mn(e);if(n.protocol===this.protocol){if(!n.handshakeTopic)throw Error("Invalid or missing handshakeTopic parameter value");const r=n.handshakeTopic;if(!n.bridge)throw Error("Invalid or missing bridge url parameter value");const o=decodeURIComponent(n.bridge);if(!n.key)throw Error("Invalid or missing key parameter value");const i=n.key;return{handshakeTopic:r,bridge:o,key:i}}else throw new Error(uo)}async _generateKey(){return this._cryptoLib?await this._cryptoLib.generateKey():null}async _encrypt(e){const n=this._key;return this._cryptoLib&&n?await this._cryptoLib.encrypt(e,n):null}async _decrypt(e){const n=this._key;return this._cryptoLib&&n?await this._cryptoLib.decrypt(e,n):null}_getStorageSession(){let e=null;return this._sessionStorage&&(e=this._sessionStorage.getSession()),e}_setStorageSession(){this._sessionStorage&&this._sessionStorage.setSession(this.session)}_removeStorageSession(){this._sessionStorage&&this._sessionStorage.removeSession()}_manageStorageSession(){this._connected?this._setStorageSession():this._removeStorageSession()}_registerPushServer(e){if(!e.url||typeof e.url!="string")throw Error("Invalid or missing pushServerOpts.url parameter value");if(!e.type||typeof e.type!="string")throw Error("Invalid or missing pushServerOpts.type parameter value");if(!e.token||typeof e.token!="string")throw Error("Invalid or missing pushServerOpts.token parameter value");const n={bridge:this.bridge,topic:this.clientId,type:e.type,token:e.token,peerName:"",language:e.language||""};this.on("connect",async(r,o)=>{if(r)throw r;if(e.peerMeta){const i=o.params[0].peerMeta.name;n.peerName=i}try{if(!(await(await fetch(`${e.url}/new`,{method:"POST",headers:{Accept:"application/json","Content-Type":"application/json"},body:JSON.stringify(n)})).json()).success)throw Error("Failed to register in Push Server")}catch{throw Error("Failed to register in Push Server")}})}}function rs(t){return te.getBrowerCrypto().getRandomValues(new Uint8Array(t))}const bn=256,kn=bn,os=bn,$="AES-CBC",is=`SHA-${kn}`,Te="HMAC",ss="encrypt",as="decrypt",cs="sign",ls="verify";function us(t){return t===$?{length:kn,name:$}:{hash:{name:is},name:Te}}function _s(t){return t===$?[ss,as]:[cs,ls]}async function Ke(t,e=$){return te.getSubtleCrypto().importKey("raw",t,us(e),!0,_s(e))}async function ds(t,e,n){const r=te.getSubtleCrypto(),o=await Ke(e,$),i=await r.encrypt({iv:t,name:$},o,n);return new Uint8Array(i)}async function fs(t,e,n){const r=te.getSubtleCrypto(),o=await Ke(e,$),i=await r.decrypt({iv:t,name:$},o,n);return new Uint8Array(i)}async function hs(t,e){const n=te.getSubtleCrypto(),r=await Ke(t,Te),o=await n.sign({length:os,name:Te},r,e);return new Uint8Array(o)}function ps(t,e,n){return ds(t,e,n)}function ms(t,e,n){return fs(t,e,n)}async function En(t,e){return await hs(t,e)}async function Cn(t){const e=(t||256)/8,n=rs(e);return Qt(J(n))}async function Sn(t,e){const n=U(t.data),r=U(t.iv),o=U(t.hmac),i=q(o,!1),c=Ft(n,r),u=await En(e,c),h=q(u,!1);return Q(i)===Q(h)}async function gs(t,e,n){const r=z(le(e)),o=n||await Cn(128),i=z(le(o)),c=q(i,!1),u=JSON.stringify(t),h=Ht(u),p=await ps(i,r,h),s=q(p,!1),w=Ft(p,i),g=await En(r,w),m=q(g,!1);return{data:s,hmac:m,iv:c}}async function vs(t,e){const n=z(le(e));if(!n)throw new Error("Missing key: required for decryption");if(!await Sn(t,n))return null;const o=U(t.data),i=U(t.iv),c=await ms(i,n,o),u=Dt(c);let h;try{h=JSON.parse(u)}catch{return null}return h}const ys=Object.freeze(Object.defineProperty({__proto__:null,decrypt:vs,encrypt:gs,generateKey:Cn,verifyHmac:Sn},Symbol.toStringTag,{value:"Module"}));class ws extends ns{constructor(e,n){super({cryptoLib:ys,connectorOpts:e,pushServerOpts:n})}}const bs=At(Hi);var ks=function(){var t=document.getSelection();if(!t.rangeCount)return function(){};for(var e=document.activeElement,n=[],r=0;r<t.rangeCount;r++)n.push(t.getRangeAt(r));switch(e.tagName.toUpperCase()){case"INPUT":case"TEXTAREA":e.blur();break;default:e=null;break}return t.removeAllRanges(),function(){t.type==="Caret"&&t.removeAllRanges(),t.rangeCount||n.forEach(function(o){t.addRange(o)}),e&&e.focus()}},Es=ks,ut={"text/plain":"Text","text/html":"Url",default:"Text"},Cs="Copy to clipboard: #{key}, Enter";function Ss(t){var e=(/mac os x/i.test(navigator.userAgent)?"⌘":"Ctrl")+"+C";return t.replace(/#{\s*key\s*}/g,e)}function xs(t,e){var n,r,o,i,c,u,h=!1;e||(e={}),n=e.debug||!1;try{o=Es(),i=document.createRange(),c=document.getSelection(),u=document.createElement("span"),u.textContent=t,u.ariaHidden="true",u.style.all="unset",u.style.position="fixed",u.style.top=0,u.style.clip="rect(0, 0, 0, 0)",u.style.whiteSpace="pre",u.style.webkitUserSelect="text",u.style.MozUserSelect="text",u.style.msUserSelect="text",u.style.userSelect="text",u.addEventListener("copy",function(s){if(s.stopPropagation(),e.format)if(s.preventDefault(),typeof s.clipboardData>"u"){n&&console.warn("unable to use e.clipboardData"),n&&console.warn("trying IE specific stuff"),window.clipboardData.clearData();var w=ut[e.format]||ut.default;window.clipboardData.setData(w,t)}else s.clipboardData.clearData(),s.clipboardData.setData(e.format,t);e.onCopy&&(s.preventDefault(),e.onCopy(s.clipboardData))}),document.body.appendChild(u),i.selectNodeContents(u),c.addRange(i);var p=document.execCommand("copy");if(!p)throw new Error("copy command was unsuccessful");h=!0}catch(s){n&&console.error("unable to copy using execCommand: ",s),n&&console.warn("trying IE specific stuff");try{window.clipboardData.setData(e.format||"text",t),e.onCopy&&e.onCopy(window.clipboardData),h=!0}catch(w){n&&console.error("unable to copy using clipboardData: ",w),n&&console.error("falling back to prompt"),r=Ss("message"in e?e.message:Cs),window.prompt(r,t)}}finally{c&&(typeof c.removeRange=="function"?c.removeRange(i):c.removeAllRanges()),u&&document.body.removeChild(u),o()}return h}var Is=xs,re,y,xn,j,_t,In,Oe,Rn,ue={},Tn=[],Rs=/acit|ex(?:s|g|n|p|$)|rph|grid|ows|mnc|ntw|ine[ch]|zoo|^ord|itera/i;function M(t,e){for(var n in e)t[n]=e[n];return t}function On(t){var e=t.parentNode;e&&e.removeChild(t)}function N(t,e,n){var r,o,i,c={};for(i in e)i=="key"?r=e[i]:i=="ref"?o=e[i]:c[i]=e[i];if(arguments.length>2&&(c.children=arguments.length>3?re.call(arguments,2):n),typeof t=="function"&&t.defaultProps!=null)for(i in t.defaultProps)c[i]===void 0&&(c[i]=t.defaultProps[i]);return Y(t,c,r,o,null)}function Y(t,e,n,r,o){var i={type:t,props:e,key:n,ref:r,__k:null,__:null,__b:0,__e:null,__d:void 0,__c:null,__h:null,constructor:void 0,__v:o??++xn};return o==null&&y.vnode!=null&&y.vnode(i),i}function Nn(){return{current:null}}function A(t){return t.children}function O(t,e){this.props=t,this.context=e}function X(t,e){if(e==null)return t.__?X(t.__,t.__.__k.indexOf(t)+1):null;for(var n;e<t.__k.length;e++)if((n=t.__k[e])!=null&&n.__e!=null)return n.__e;return typeof t.type=="function"?X(t):null}function Mn(t){var e,n;if((t=t.__)!=null&&t.__c!=null){for(t.__e=t.__c.base=null,e=0;e<t.__k.length;e++)if((n=t.__k[e])!=null&&n.__e!=null){t.__e=t.__c.base=n.__e;break}return Mn(t)}}function Ne(t){(!t.__d&&(t.__d=!0)&&j.push(t)&&!_e.__r++||_t!==y.debounceRendering)&&((_t=y.debounceRendering)||In)(_e)}function _e(){var t,e,n,r,o,i,c,u;for(j.sort(Oe);t=j.shift();)t.__d&&(e=j.length,r=void 0,o=void 0,c=(i=(n=t).__v).__e,(u=n.__P)&&(r=[],(o=M({},i)).__v=i.__v+1,Ze(u,i,o,n.__n,u.ownerSVGElement!==void 0,i.__h!=null?[c]:null,r,c??X(i),i.__h),$n(r,i),i.__e!=c&&Mn(i)),j.length>e&&j.sort(Oe));_e.__r=0}function Ln(t,e,n,r,o,i,c,u,h,p){var s,w,g,m,k,I,C,a=r&&r.__k||Tn,l=a.length;for(n.__k=[],s=0;s<e.length;s++)if((m=n.__k[s]=(m=e[s])==null||typeof m=="boolean"||typeof m=="function"?null:typeof m=="string"||typeof m=="number"||typeof m=="bigint"?Y(null,m,null,null,m):Array.isArray(m)?Y(A,{children:m},null,null,null):m.__b>0?Y(m.type,m.props,m.key,m.ref?m.ref:null,m.__v):m)!=null){if(m.__=n,m.__b=n.__b+1,(g=a[s])===null||g&&m.key==g.key&&m.type===g.type)a[s]=void 0;else for(w=0;w<l;w++){if((g=a[w])&&m.key==g.key&&m.type===g.type){a[w]=void 0;break}g=null}Ze(t,m,g=g||ue,o,i,c,u,h,p),k=m.__e,(w=m.ref)&&g.ref!=w&&(C||(C=[]),g.ref&&C.push(g.ref,null,m),C.push(w,m.__c||k,m)),k!=null?(I==null&&(I=k),typeof m.type=="function"&&m.__k===g.__k?m.__d=h=An(m,h,t):h=qn(t,m,g,a,k,h),typeof n.type=="function"&&(n.__d=h)):h&&g.__e==h&&h.parentNode!=t&&(h=X(g))}for(n.__e=I,s=l;s--;)a[s]!=null&&(typeof n.type=="function"&&a[s].__e!=null&&a[s].__e==n.__d&&(n.__d=Un(r).nextSibling),Dn(a[s],a[s]));if(C)for(s=0;s<C.length;s++)Pn(C[s],C[++s],C[++s])}function An(t,e,n){for(var r,o=t.__k,i=0;o&&i<o.length;i++)(r=o[i])&&(r.__=t,e=typeof r.type=="function"?An(r,e,n):qn(n,r,r,o,r.__e,e));return e}function L(t,e){return e=e||[],t==null||typeof t=="boolean"||(Array.isArray(t)?t.some(function(n){L(n,e)}):e.push(t)),e}function qn(t,e,n,r,o,i){var c,u,h;if(e.__d!==void 0)c=e.__d,e.__d=void 0;else if(n==null||o!=i||o.parentNode==null)e:if(i==null||i.parentNode!==t)t.appendChild(o),c=null;else{for(u=i,h=0;(u=u.nextSibling)&&h<r.length;h+=1)if(u==o)break e;t.insertBefore(o,i),c=i}return c!==void 0?c:o.nextSibling}function Un(t){var e,n,r;if(t.type==null||typeof t.type=="string")return t.__e;if(t.__k){for(e=t.__k.length-1;e>=0;e--)if((n=t.__k[e])&&(r=Un(n)))return r}return null}function Ts(t,e,n,r,o){var i;for(i in n)i==="children"||i==="key"||i in e||de(t,i,null,n[i],r);for(i in e)o&&typeof e[i]!="function"||i==="children"||i==="key"||i==="value"||i==="checked"||n[i]===e[i]||de(t,i,e[i],n[i],r)}function dt(t,e,n){e[0]==="-"?t.setProperty(e,n??""):t[e]=n==null?"":typeof n!="number"||Rs.test(e)?n:n+"px"}function de(t,e,n,r,o){var i;e:if(e==="style")if(typeof n=="string")t.style.cssText=n;else{if(typeof r=="string"&&(t.style.cssText=r=""),r)for(e in r)n&&e in n||dt(t.style,e,"");if(n)for(e in n)r&&n[e]===r[e]||dt(t.style,e,n[e])}else if(e[0]==="o"&&e[1]==="n")i=e!==(e=e.replace(/Capture$/,"")),e=e.toLowerCase()in t?e.toLowerCase().slice(2):e.slice(2),t.l||(t.l={}),t.l[e+i]=n,n?r||t.addEventListener(e,i?ht:ft,i):t.removeEventListener(e,i?ht:ft,i);else if(e!=="dangerouslySetInnerHTML"){if(o)e=e.replace(/xlink(H|:h)/,"h").replace(/sName$/,"s");else if(e!=="width"&&e!=="height"&&e!=="href"&&e!=="list"&&e!=="form"&&e!=="tabIndex"&&e!=="download"&&e in t)try{t[e]=n??"";break e}catch{}typeof n=="function"||(n==null||n===!1&&e.indexOf("-")==-1?t.removeAttribute(e):t.setAttribute(e,n))}}function ft(t){return this.l[t.type+!1](y.event?y.event(t):t)}function ht(t){return this.l[t.type+!0](y.event?y.event(t):t)}function Ze(t,e,n,r,o,i,c,u,h){var p,s,w,g,m,k,I,C,a,l,f,_,v,E,b,S=e.type;if(e.constructor!==void 0)return null;n.__h!=null&&(h=n.__h,u=e.__e=n.__e,e.__h=null,i=[u]),(p=y.__b)&&p(e);try{e:if(typeof S=="function"){if(C=e.props,a=(p=S.contextType)&&r[p.__c],l=p?a?a.props.value:p.__:r,n.__c?I=(s=e.__c=n.__c).__=s.__E:("prototype"in S&&S.prototype.render?e.__c=s=new S(C,l):(e.__c=s=new O(C,l),s.constructor=S,s.render=Ns),a&&a.sub(s),s.props=C,s.state||(s.state={}),s.context=l,s.__n=r,w=s.__d=!0,s.__h=[],s._sb=[]),s.__s==null&&(s.__s=s.state),S.getDerivedStateFromProps!=null&&(s.__s==s.state&&(s.__s=M({},s.__s)),M(s.__s,S.getDerivedStateFromProps(C,s.__s))),g=s.props,m=s.state,s.__v=e,w)S.getDerivedStateFromProps==null&&s.componentWillMount!=null&&s.componentWillMount(),s.componentDidMount!=null&&s.__h.push(s.componentDidMount);else{if(S.getDerivedStateFromProps==null&&C!==g&&s.componentWillReceiveProps!=null&&s.componentWillReceiveProps(C,l),!s.__e&&s.shouldComponentUpdate!=null&&s.shouldComponentUpdate(C,s.__s,l)===!1||e.__v===n.__v){for(e.__v!==n.__v&&(s.props=C,s.state=s.__s,s.__d=!1),s.__e=!1,e.__e=n.__e,e.__k=n.__k,e.__k.forEach(function(T){T&&(T.__=e)}),f=0;f<s._sb.length;f++)s.__h.push(s._sb[f]);s._sb=[],s.__h.length&&c.push(s);break e}s.componentWillUpdate!=null&&s.componentWillUpdate(C,s.__s,l),s.componentDidUpdate!=null&&s.__h.push(function(){s.componentDidUpdate(g,m,k)})}if(s.context=l,s.props=C,s.__P=t,_=y.__r,v=0,"prototype"in S&&S.prototype.render){for(s.state=s.__s,s.__d=!1,_&&_(e),p=s.render(s.props,s.state,s.context),E=0;E<s._sb.length;E++)s.__h.push(s._sb[E]);s._sb=[]}else do s.__d=!1,_&&_(e),p=s.render(s.props,s.state,s.context),s.state=s.__s;while(s.__d&&++v<25);s.state=s.__s,s.getChildContext!=null&&(r=M(M({},r),s.getChildContext())),w||s.getSnapshotBeforeUpdate==null||(k=s.getSnapshotBeforeUpdate(g,m)),b=p!=null&&p.type===A&&p.key==null?p.props.children:p,Ln(t,Array.isArray(b)?b:[b],e,n,r,o,i,c,u,h),s.base=e.__e,e.__h=null,s.__h.length&&c.push(s),I&&(s.__E=s.__=null),s.__e=!1}else i==null&&e.__v===n.__v?(e.__k=n.__k,e.__e=n.__e):e.__e=Os(n.__e,e,n,r,o,i,c,h);(p=y.diffed)&&p(e)}catch(T){e.__v=null,(h||i!=null)&&(e.__e=u,e.__h=!!h,i[i.indexOf(u)]=null),y.__e(T,e,n)}}function $n(t,e){y.__c&&y.__c(e,t),t.some(function(n){try{t=n.__h,n.__h=[],t.some(function(r){r.call(n)})}catch(r){y.__e(r,n.__v)}})}function Os(t,e,n,r,o,i,c,u){var h,p,s,w=n.props,g=e.props,m=e.type,k=0;if(m==="svg"&&(o=!0),i!=null){for(;k<i.length;k++)if((h=i[k])&&"setAttribute"in h==!!m&&(m?h.localName===m:h.nodeType===3)){t=h,i[k]=null;break}}if(t==null){if(m===null)return document.createTextNode(g);t=o?document.createElementNS("http://www.w3.org/2000/svg",m):document.createElement(m,g.is&&g),i=null,u=!1}if(m===null)w===g||u&&t.data===g||(t.data=g);else{if(i=i&&re.call(t.childNodes),p=(w=n.props||ue).dangerouslySetInnerHTML,s=g.dangerouslySetInnerHTML,!u){if(i!=null)for(w={},k=0;k<t.attributes.length;k++)w[t.attributes[k].name]=t.attributes[k].value;(s||p)&&(s&&(p&&s.__html==p.__html||s.__html===t.innerHTML)||(t.innerHTML=s&&s.__html||""))}if(Ts(t,g,w,o,u),s)e.__k=[];else if(k=e.props.children,Ln(t,Array.isArray(k)?k:[k],e,n,r,o&&m!=="foreignObject",i,c,i?i[0]:n.__k&&X(n,0),u),i!=null)for(k=i.length;k--;)i[k]!=null&&On(i[k]);u||("value"in g&&(k=g.value)!==void 0&&(k!==t.value||m==="progress"&&!k||m==="option"&&k!==w.value)&&de(t,"value",k,w.value,!1),"checked"in g&&(k=g.checked)!==void 0&&k!==t.checked&&de(t,"checked",k,w.checked,!1))}return t}function Pn(t,e,n){try{typeof t=="function"?t(e):t.current=e}catch(r){y.__e(r,n)}}function Dn(t,e,n){var r,o;if(y.unmount&&y.unmount(t),(r=t.ref)&&(r.current&&r.current!==t.__e||Pn(r,null,e)),(r=t.__c)!=null){if(r.componentWillUnmount)try{r.componentWillUnmount()}catch(i){y.__e(i,e)}r.base=r.__P=null,t.__c=void 0}if(r=t.__k)for(o=0;o<r.length;o++)r[o]&&Dn(r[o],e,n||typeof t.type!="function");n||t.__e==null||On(t.__e),t.__=t.__e=t.__d=void 0}function Ns(t,e,n){return this.constructor(t,n)}function ee(t,e,n){var r,o,i;y.__&&y.__(t,e),o=(r=typeof n=="function")?null:n&&n.__k||e.__k,i=[],Ze(e,t=(!r&&n||e).__k=N(A,null,[t]),o||ue,ue,e.ownerSVGElement!==void 0,!r&&n?[n]:o?null:e.firstChild?re.call(e.childNodes):null,i,!r&&n?n:o?o.__e:e.firstChild,r),$n(i,t)}function jn(t,e){ee(t,e,jn)}function Ms(t,e,n){var r,o,i,c=M({},t.props);for(i in e)i=="key"?r=e[i]:i=="ref"?o=e[i]:c[i]=e[i];return arguments.length>2&&(c.children=arguments.length>3?re.call(arguments,2):n),Y(t.type,c,r||t.key,o||t.ref,null)}function Hn(t,e){var n={__c:e="__cC"+Rn++,__:t,Consumer:function(r,o){return r.children(o)},Provider:function(r){var o,i;return this.getChildContext||(o=[],(i={})[e]=this,this.getChildContext=function(){return i},this.shouldComponentUpdate=function(c){this.props.value!==c.value&&o.some(function(u){u.__e=!0,Ne(u)})},this.sub=function(c){o.push(c);var u=c.componentWillUnmount;c.componentWillUnmount=function(){o.splice(o.indexOf(c),1),u&&u.call(c)}}),r.children}};return n.Provider.__=n.Consumer.contextType=n}re=Tn.slice,y={__e:function(t,e,n,r){for(var o,i,c;e=e.__;)if((o=e.__c)&&!o.__)try{if((i=o.constructor)&&i.getDerivedStateFromError!=null&&(o.setState(i.getDerivedStateFromError(t)),c=o.__d),o.componentDidCatch!=null&&(o.componentDidCatch(t,r||{}),c=o.__d),c)return o.__E=o}catch(u){t=u}throw t}},xn=0,O.prototype.setState=function(t,e){var n;n=this.__s!=null&&this.__s!==this.state?this.__s:this.__s=M({},this.state),typeof t=="function"&&(t=t(M({},n),this.props)),t&&M(n,t),t!=null&&this.__v&&(e&&this._sb.push(e),Ne(this))},O.prototype.forceUpdate=function(t){this.__v&&(this.__e=!0,t&&this.__h.push(t),Ne(this))},O.prototype.render=A,j=[],In=typeof Promise=="function"?Promise.prototype.then.bind(Promise.resolve()):setTimeout,Oe=function(t,e){return t.__v.__b-e.__v.__b},_e.__r=0,Rn=0;var P,x,Ee,pt,V=0,Wn=[],ae=[],mt=y.__b,gt=y.__r,vt=y.diffed,yt=y.__c,wt=y.unmount;function H(t,e){y.__h&&y.__h(x,t,V||e),V=0;var n=x.__H||(x.__H={__:[],__h:[]});return t>=n.__.length&&n.__.push({__V:ae}),n.__[t]}function ye(t){return V=1,Xe(Gn,t)}function Xe(t,e,n){var r=H(P++,2);if(r.t=t,!r.__c&&(r.__=[n?n(e):Gn(void 0,e),function(u){var h=r.__N?r.__N[0]:r.__[0],p=r.t(h,u);h!==p&&(r.__N=[p,r.__[1]],r.__c.setState({}))}],r.__c=x,!x.u)){var o=function(u,h,p){if(!r.__c.__H)return!0;var s=r.__c.__H.__.filter(function(g){return g.__c});if(s.every(function(g){return!g.__N}))return!i||i.call(this,u,h,p);var w=!1;return s.forEach(function(g){if(g.__N){var m=g.__[0];g.__=g.__N,g.__N=void 0,m!==g.__[0]&&(w=!0)}}),!(!w&&r.__c.props===u)&&(!i||i.call(this,u,h,p))};x.u=!0;var i=x.shouldComponentUpdate,c=x.componentWillUpdate;x.componentWillUpdate=function(u,h,p){if(this.__e){var s=i;i=void 0,o(u,h,p),i=s}c&&c.call(this,u,h,p)},x.shouldComponentUpdate=o}return r.__N||r.__}function et(t,e){var n=H(P++,3);!y.__s&&tt(n.__H,e)&&(n.__=t,n.i=e,x.__H.__h.push(n))}function oe(t,e){var n=H(P++,4);!y.__s&&tt(n.__H,e)&&(n.__=t,n.i=e,x.__h.push(n))}function Bn(t){return V=5,we(function(){return{current:t}},[])}function Fn(t,e,n){V=6,oe(function(){return typeof t=="function"?(t(e()),function(){return t(null)}):t?(t.current=e(),function(){return t.current=null}):void 0},n==null?n:n.concat(t))}function we(t,e){var n=H(P++,7);return tt(n.__H,e)?(n.__V=t(),n.i=e,n.__h=t,n.__V):n.__}function zn(t,e){return V=8,we(function(){return t},e)}function Qn(t){var e=x.context[t.__c],n=H(P++,9);return n.c=t,e?(n.__==null&&(n.__=!0,e.sub(x)),e.props.value):t.__}function Vn(t,e){y.useDebugValue&&y.useDebugValue(e?e(t):t)}function Ls(t){var e=H(P++,10),n=ye();return e.__=t,x.componentDidCatch||(x.componentDidCatch=function(r,o){e.__&&e.__(r,o),n[1](r)}),[n[0],function(){n[1](void 0)}]}function Jn(){var t=H(P++,11);if(!t.__){for(var e=x.__v;e!==null&&!e.__m&&e.__!==null;)e=e.__;var n=e.__m||(e.__m=[0,0]);t.__="P"+n[0]+"-"+n[1]++}return t.__}function As(){for(var t;t=Wn.shift();)if(t.__P&&t.__H)try{t.__H.__h.forEach(ce),t.__H.__h.forEach(Me),t.__H.__h=[]}catch(e){t.__H.__h=[],y.__e(e,t.__v)}}y.__b=function(t){x=null,mt&&mt(t)},y.__r=function(t){gt&&gt(t),P=0;var e=(x=t.__c).__H;e&&(Ee===x?(e.__h=[],x.__h=[],e.__.forEach(function(n){n.__N&&(n.__=n.__N),n.__V=ae,n.__N=n.i=void 0})):(e.__h.forEach(ce),e.__h.forEach(Me),e.__h=[])),Ee=x},y.diffed=function(t){vt&&vt(t);var e=t.__c;e&&e.__H&&(e.__H.__h.length&&(Wn.push(e)!==1&&pt===y.requestAnimationFrame||((pt=y.requestAnimationFrame)||qs)(As)),e.__H.__.forEach(function(n){n.i&&(n.__H=n.i),n.__V!==ae&&(n.__=n.__V),n.i=void 0,n.__V=ae})),Ee=x=null},y.__c=function(t,e){e.some(function(n){try{n.__h.forEach(ce),n.__h=n.__h.filter(function(r){return!r.__||Me(r)})}catch(r){e.some(function(o){o.__h&&(o.__h=[])}),e=[],y.__e(r,n.__v)}}),yt&&yt(t,e)},y.unmount=function(t){wt&&wt(t);var e,n=t.__c;n&&n.__H&&(n.__H.__.forEach(function(r){try{ce(r)}catch(o){e=o}}),n.__H=void 0,e&&y.__e(e,n.__v))};var bt=typeof requestAnimationFrame=="function";function qs(t){var e,n=function(){clearTimeout(r),bt&&cancelAnimationFrame(e),setTimeout(t)},r=setTimeout(n,100);bt&&(e=requestAnimationFrame(n))}function ce(t){var e=x,n=t.__c;typeof n=="function"&&(t.__c=void 0,n()),x=e}function Me(t){var e=x;t.__c=t.__(),x=e}function tt(t,e){return!t||t.length!==e.length||e.some(function(n,r){return n!==t[r]})}function Gn(t,e){return typeof e=="function"?e(t):e}function Yn(t,e){for(var n in e)t[n]=e[n];return t}function Le(t,e){for(var n in t)if(n!=="__source"&&!(n in e))return!0;for(var r in e)if(r!=="__source"&&t[r]!==e[r])return!0;return!1}function Ce(t,e){return t===e&&(t!==0||1/t==1/e)||t!=t&&e!=e}function fe(t){this.props=t}function Kn(t,e){function n(o){var i=this.props.ref,c=i==o.ref;return!c&&i&&(i.call?i(null):i.current=null),e?!e(this.props,o)||!c:Le(this.props,o)}function r(o){return this.shouldComponentUpdate=n,N(t,o)}return r.displayName="Memo("+(t.displayName||t.name)+")",r.prototype.isReactComponent=!0,r.__f=!0,r}(fe.prototype=new O).isPureReactComponent=!0,fe.prototype.shouldComponentUpdate=function(t,e){return Le(this.props,t)||Le(this.state,e)};var kt=y.__b;y.__b=function(t){t.type&&t.type.__f&&t.ref&&(t.props.ref=t.ref,t.ref=null),kt&&kt(t)};var Us=typeof Symbol<"u"&&Symbol.for&&Symbol.for("react.forward_ref")||3911;function Zn(t){function e(n){var r=Yn({},n);return delete r.ref,t(r,n.ref||null)}return e.$$typeof=Us,e.render=e,e.prototype.isReactComponent=e.__f=!0,e.displayName="ForwardRef("+(t.displayName||t.name)+")",e}var Et=function(t,e){return t==null?null:L(L(t).map(e))},Xn={map:Et,forEach:Et,count:function(t){return t?L(t).length:0},only:function(t){var e=L(t);if(e.length!==1)throw"Children.only";return e[0]},toArray:L},$s=y.__e;y.__e=function(t,e,n,r){if(t.then){for(var o,i=e;i=i.__;)if((o=i.__c)&&o.__c)return e.__e==null&&(e.__e=n.__e,e.__k=n.__k),o.__c(t,e)}$s(t,e,n,r)};var Ct=y.unmount;function er(t,e,n){return t&&(t.__c&&t.__c.__H&&(t.__c.__H.__.forEach(function(r){typeof r.__c=="function"&&r.__c()}),t.__c.__H=null),(t=Yn({},t)).__c!=null&&(t.__c.__P===n&&(t.__c.__P=e),t.__c=null),t.__k=t.__k&&t.__k.map(function(r){return er(r,e,n)})),t}function tr(t,e,n){return t&&(t.__v=null,t.__k=t.__k&&t.__k.map(function(r){return tr(r,e,n)}),t.__c&&t.__c.__P===e&&(t.__e&&n.insertBefore(t.__e,t.__d),t.__c.__e=!0,t.__c.__P=n)),t}function K(){this.__u=0,this.t=null,this.__b=null}function nr(t){var e=t.__.__c;return e&&e.__a&&e.__a(t)}function rr(t){var e,n,r;function o(i){if(e||(e=t()).then(function(c){n=c.default||c},function(c){r=c}),r)throw r;if(!n)throw e;return N(n,i)}return o.displayName="Lazy",o.__f=!0,o}function F(){this.u=null,this.o=null}y.unmount=function(t){var e=t.__c;e&&e.__R&&e.__R(),e&&t.__h===!0&&(t.type=null),Ct&&Ct(t)},(K.prototype=new O).__c=function(t,e){var n=e.__c,r=this;r.t==null&&(r.t=[]),r.t.push(n);var o=nr(r.__v),i=!1,c=function(){i||(i=!0,n.__R=null,o?o(u):u())};n.__R=c;var u=function(){if(!--r.__u){if(r.state.__a){var p=r.state.__a;r.__v.__k[0]=tr(p,p.__c.__P,p.__c.__O)}var s;for(r.setState({__a:r.__b=null});s=r.t.pop();)s.forceUpdate()}},h=e.__h===!0;r.__u++||h||r.setState({__a:r.__b=r.__v.__k[0]}),t.then(c,c)},K.prototype.componentWillUnmount=function(){this.t=[]},K.prototype.render=function(t,e){if(this.__b){if(this.__v.__k){var n=document.createElement("div"),r=this.__v.__k[0].__c;this.__v.__k[0]=er(this.__b,n,r.__O=r.__P)}this.__b=null}var o=e.__a&&N(A,null,t.fallback);return o&&(o.__h=null),[N(A,null,e.__a?null:t.children),o]};var St=function(t,e,n){if(++n[1]===n[0]&&t.o.delete(e),t.props.revealOrder&&(t.props.revealOrder[0]!=="t"||!t.o.size))for(n=t.u;n;){for(;n.length>3;)n.pop()();if(n[1]<n[0])break;t.u=n=n[2]}};function Ps(t){return this.getChildContext=function(){return t.context},t.children}function Ds(t){var e=this,n=t.i;e.componentWillUnmount=function(){ee(null,e.l),e.l=null,e.i=null},e.i&&e.i!==n&&e.componentWillUnmount(),t.__v?(e.l||(e.i=n,e.l={nodeType:1,parentNode:n,childNodes:[],appendChild:function(r){this.childNodes.push(r),e.i.appendChild(r)},insertBefore:function(r,o){this.childNodes.push(r),e.i.appendChild(r)},removeChild:function(r){this.childNodes.splice(this.childNodes.indexOf(r)>>>1,1),e.i.removeChild(r)}}),ee(N(Ps,{context:e.context},t.__v),e.l)):e.l&&e.componentWillUnmount()}function or(t,e){var n=N(Ds,{__v:t,i:e});return n.containerInfo=e,n}(F.prototype=new O).__a=function(t){var e=this,n=nr(e.__v),r=e.o.get(t);return r[0]++,function(o){var i=function(){e.props.revealOrder?(r.push(o),St(e,t,r)):o()};n?n(i):i()}},F.prototype.render=function(t){this.u=null,this.o=new Map;var e=L(t.children);t.revealOrder&&t.revealOrder[0]==="b"&&e.reverse();for(var n=e.length;n--;)this.o.set(e[n],this.u=[1,0,this.u]);return t.children},F.prototype.componentDidUpdate=F.prototype.componentDidMount=function(){var t=this;this.o.forEach(function(e,n){St(t,n,e)})};var ir=typeof Symbol<"u"&&Symbol.for&&Symbol.for("react.element")||60103,js=/^(?:accent|alignment|arabic|baseline|cap|clip(?!PathU)|color|dominant|fill|flood|font|glyph(?!R)|horiz|image|letter|lighting|marker(?!H|W|U)|overline|paint|pointer|shape|stop|strikethrough|stroke|text(?!L)|transform|underline|unicode|units|v|vector|vert|word|writing|x(?!C))[A-Z]/,Hs=/^on(Ani|Tra|Tou|BeforeInp|Compo)/,Ws=/[A-Z0-9]/g,Bs=typeof document<"u",Fs=function(t){return(typeof Symbol<"u"&&typeof Symbol()=="symbol"?/fil|che|rad/:/fil|che|ra/).test(t)};function sr(t,e,n){return e.__k==null&&(e.textContent=""),ee(t,e),typeof n=="function"&&n(),t?t.__c:null}function ar(t,e,n){return jn(t,e),typeof n=="function"&&n(),t?t.__c:null}O.prototype.isReactComponent={},["componentWillMount","componentWillReceiveProps","componentWillUpdate"].forEach(function(t){Object.defineProperty(O.prototype,t,{configurable:!0,get:function(){return this["UNSAFE_"+t]},set:function(e){Object.defineProperty(this,t,{configurable:!0,writable:!0,value:e})}})});var xt=y.event;function zs(){}function Qs(){return this.cancelBubble}function Vs(){return this.defaultPrevented}y.event=function(t){return xt&&(t=xt(t)),t.persist=zs,t.isPropagationStopped=Qs,t.isDefaultPrevented=Vs,t.nativeEvent=t};var nt,It={configurable:!0,get:function(){return this.class}},Rt=y.vnode;y.vnode=function(t){var e=t.type,n=t.props,r=n;if(typeof e=="string"){for(var o in r={},n){var i=n[o];if(!(o==="value"&&"defaultValue"in n&&i==null||Bs&&o==="children"&&e==="noscript")){var c=o.toLowerCase();o==="defaultValue"&&"value"in n&&n.value==null?o="value":o==="download"&&i===!0?i="":c==="ondoubleclick"?o="ondblclick":c!=="onchange"||e!=="input"&&e!=="textarea"||Fs(n.type)?c==="onfocus"?o="onfocusin":c==="onblur"?o="onfocusout":Hs.test(o)?o=c:e.indexOf("-")===-1&&js.test(o)?o=o.replace(Ws,"-$&").toLowerCase():i===null&&(i=void 0):c=o="oninput",c==="oninput"&&r[o=c]&&(o="oninputCapture"),r[o]=i}}e=="select"&&r.multiple&&Array.isArray(r.value)&&(r.value=L(n.children).forEach(function(u){u.props.selected=r.value.indexOf(u.props.value)!=-1})),e=="select"&&r.defaultValue!=null&&(r.value=L(n.children).forEach(function(u){u.props.selected=r.multiple?r.defaultValue.indexOf(u.props.value)!=-1:r.defaultValue==u.props.value})),t.props=r,n.class!=n.className&&(It.enumerable="className"in n,n.className!=null&&(r.class=n.className),Object.defineProperty(r,"className",It))}t.$$typeof=ir,Rt&&Rt(t)};var Tt=y.__r;y.__r=function(t){Tt&&Tt(t),nt=t.__c};var Ot=y.diffed;y.diffed=function(t){Ot&&Ot(t);var e=t.props,n=t.__e;n!=null&&t.type==="textarea"&&"value"in e&&e.value!==n.value&&(n.value=e.value==null?"":e.value),nt=null};var cr={ReactCurrentDispatcher:{current:{readContext:function(t){return nt.__n[t.__c].props.value}}}},Js="17.0.2";function lr(t){return N.bind(null,t)}function rt(t){return!!t&&t.$$typeof===ir}function ur(t){return rt(t)?Ms.apply(null,arguments):t}function _r(t){return!!t.__k&&(ee(null,t),!0)}function dr(t){return t&&(t.base||t.nodeType===1&&t)||null}var fr=function(t,e){return t(e)},hr=function(t,e){return t(e)},pr=A;function ot(t){t()}function mr(t){return t}function gr(){return[!1,ot]}var vr=oe;function yr(t,e){var n=e(),r=ye({h:{__:n,v:e}}),o=r[0].h,i=r[1];return oe(function(){o.__=n,o.v=e,Ce(o.__,e())||i({h:o})},[t,n,e]),et(function(){return Ce(o.__,o.v())||i({h:o}),t(function(){Ce(o.__,o.v())||i({h:o})})},[t]),n}var Gs={useState:ye,useId:Jn,useReducer:Xe,useEffect:et,useLayoutEffect:oe,useInsertionEffect:vr,useTransition:gr,useDeferredValue:mr,useSyncExternalStore:yr,startTransition:ot,useRef:Bn,useImperativeHandle:Fn,useMemo:we,useCallback:zn,useContext:Qn,useDebugValue:Vn,version:"17.0.2",Children:Xn,render:sr,hydrate:ar,unmountComponentAtNode:_r,createPortal:or,createElement:N,createContext:Hn,createFactory:lr,cloneElement:ur,createRef:Nn,Fragment:A,isValidElement:rt,findDOMNode:dr,Component:O,PureComponent:fe,memo:Kn,forwardRef:Zn,flushSync:hr,unstable_batchedUpdates:fr,StrictMode:pr,Suspense:K,SuspenseList:F,lazy:rr,__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED:cr};const Ys=Object.freeze(Object.defineProperty({__proto__:null,Children:Xn,Component:O,Fragment:A,PureComponent:fe,StrictMode:pr,Suspense:K,SuspenseList:F,__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED:cr,cloneElement:ur,createContext:Hn,createElement:N,createFactory:lr,createPortal:or,createRef:Nn,default:Gs,findDOMNode:dr,flushSync:hr,forwardRef:Zn,hydrate:ar,isValidElement:rt,lazy:rr,memo:Kn,render:sr,startTransition:ot,unmountComponentAtNode:_r,unstable_batchedUpdates:fr,useCallback:zn,useContext:Qn,useDebugValue:Vn,useDeferredValue:mr,useEffect:et,useErrorBoundary:Ls,useId:Jn,useImperativeHandle:Fn,useInsertionEffect:vr,useLayoutEffect:oe,useMemo:we,useReducer:Xe,useRef:Bn,useState:ye,useSyncExternalStore:yr,useTransition:gr,version:Js},Symbol.toStringTag,{value:"Module"})),Ks=At(Ys);function wr(t){return t&&typeof t=="object"&&"default"in t?t.default:t}var R=bs,br=wr(no),Zs=wr(Is),d=Ks;function Xs(t){br.toString(t,{type:"terminal"}).then(console.log)}var ea=`:root {
  --animation-duration: 300ms;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes fadeOut {
  from {
    opacity: 1;
  }
  to {
    opacity: 0;
  }
}

.animated {
  animation-duration: var(--animation-duration);
  animation-fill-mode: both;
}

.fadeIn {
  animation-name: fadeIn;
}

.fadeOut {
  animation-name: fadeOut;
}

#walletconnect-wrapper {
  -webkit-user-select: none;
  align-items: center;
  display: flex;
  height: 100%;
  justify-content: center;
  left: 0;
  pointer-events: none;
  position: fixed;
  top: 0;
  user-select: none;
  width: 100%;
  z-index: 99999999999999;
}

.walletconnect-modal__headerLogo {
  height: 21px;
}

.walletconnect-modal__header p {
  color: #ffffff;
  font-size: 20px;
  font-weight: 600;
  margin: 0;
  align-items: flex-start;
  display: flex;
  flex: 1;
  margin-left: 5px;
}

.walletconnect-modal__close__wrapper {
  position: absolute;
  top: 0px;
  right: 0px;
  z-index: 10000;
  background: white;
  border-radius: 26px;
  padding: 6px;
  box-sizing: border-box;
  width: 26px;
  height: 26px;
  cursor: pointer;
}

.walletconnect-modal__close__icon {
  position: relative;
  top: 7px;
  right: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  transform: rotate(45deg);
}

.walletconnect-modal__close__line1 {
  position: absolute;
  width: 100%;
  border: 1px solid rgb(48, 52, 59);
}

.walletconnect-modal__close__line2 {
  position: absolute;
  width: 100%;
  border: 1px solid rgb(48, 52, 59);
  transform: rotate(90deg);
}

.walletconnect-qrcode__base {
  -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
  background: rgba(37, 41, 46, 0.95);
  height: 100%;
  left: 0;
  pointer-events: auto;
  position: fixed;
  top: 0;
  transition: 0.4s cubic-bezier(0.19, 1, 0.22, 1);
  width: 100%;
  will-change: opacity;
  padding: 40px;
  box-sizing: border-box;
}

.walletconnect-qrcode__text {
  color: rgba(60, 66, 82, 0.6);
  font-size: 16px;
  font-weight: 600;
  letter-spacing: 0;
  line-height: 1.1875em;
  margin: 10px 0 20px 0;
  text-align: center;
  width: 100%;
}

@media only screen and (max-width: 768px) {
  .walletconnect-qrcode__text {
    font-size: 4vw;
  }
}

@media only screen and (max-width: 320px) {
  .walletconnect-qrcode__text {
    font-size: 14px;
  }
}

.walletconnect-qrcode__image {
  width: calc(100% - 30px);
  box-sizing: border-box;
  cursor: none;
  margin: 0 auto;
}

.walletconnect-qrcode__notification {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  font-size: 16px;
  padding: 16px 20px;
  border-radius: 16px;
  text-align: center;
  transition: all 0.1s ease-in-out;
  background: white;
  color: black;
  margin-bottom: -60px;
  opacity: 0;
}

.walletconnect-qrcode__notification.notification__show {
  opacity: 1;
}

@media only screen and (max-width: 768px) {
  .walletconnect-modal__header {
    height: 130px;
  }
  .walletconnect-modal__base {
    overflow: auto;
  }
}

@media only screen and (min-device-width: 415px) and (max-width: 768px) {
  #content {
    max-width: 768px;
    box-sizing: border-box;
  }
}

@media only screen and (min-width: 375px) and (max-width: 415px) {
  #content {
    max-width: 414px;
    box-sizing: border-box;
  }
}

@media only screen and (min-width: 320px) and (max-width: 375px) {
  #content {
    max-width: 375px;
    box-sizing: border-box;
  }
}

@media only screen and (max-width: 320px) {
  #content {
    max-width: 320px;
    box-sizing: border-box;
  }
}

.walletconnect-modal__base {
  -webkit-font-smoothing: antialiased;
  background: #ffffff;
  border-radius: 24px;
  box-shadow: 0 10px 50px 5px rgba(0, 0, 0, 0.4);
  font-family: ui-rounded, "SF Pro Rounded", "SF Pro Text", medium-content-sans-serif-font,
    -apple-system, BlinkMacSystemFont, ui-sans-serif, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell,
    "Open Sans", "Helvetica Neue", sans-serif;
  margin-top: 41px;
  padding: 24px 24px 22px;
  pointer-events: auto;
  position: relative;
  text-align: center;
  transition: 0.4s cubic-bezier(0.19, 1, 0.22, 1);
  will-change: transform;
  overflow: visible;
  transform: translateY(-50%);
  top: 50%;
  max-width: 500px;
  margin: auto;
}

@media only screen and (max-width: 320px) {
  .walletconnect-modal__base {
    padding: 24px 12px;
  }
}

.walletconnect-modal__base .hidden {
  transform: translateY(150%);
  transition: 0.125s cubic-bezier(0.4, 0, 1, 1);
}

.walletconnect-modal__header {
  align-items: center;
  display: flex;
  height: 26px;
  left: 0;
  justify-content: space-between;
  position: absolute;
  top: -42px;
  width: 100%;
}

.walletconnect-modal__base .wc-logo {
  align-items: center;
  display: flex;
  height: 26px;
  margin-top: 15px;
  padding-bottom: 15px;
  pointer-events: auto;
}

.walletconnect-modal__base .wc-logo div {
  background-color: #3399ff;
  height: 21px;
  margin-right: 5px;
  mask-image: url("images/wc-logo.svg") center no-repeat;
  width: 32px;
}

.walletconnect-modal__base .wc-logo p {
  color: #ffffff;
  font-size: 20px;
  font-weight: 600;
  margin: 0;
}

.walletconnect-modal__base h2 {
  color: rgba(60, 66, 82, 0.6);
  font-size: 16px;
  font-weight: 600;
  letter-spacing: 0;
  line-height: 1.1875em;
  margin: 0 0 19px 0;
  text-align: center;
  width: 100%;
}

.walletconnect-modal__base__row {
  -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
  align-items: center;
  border-radius: 20px;
  cursor: pointer;
  display: flex;
  height: 56px;
  justify-content: space-between;
  padding: 0 15px;
  position: relative;
  margin: 0px 0px 8px;
  text-align: left;
  transition: 0.15s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  will-change: transform;
  text-decoration: none;
}

.walletconnect-modal__base__row:hover {
  background: rgba(60, 66, 82, 0.06);
}

.walletconnect-modal__base__row:active {
  background: rgba(60, 66, 82, 0.06);
  transform: scale(0.975);
  transition: 0.1s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

.walletconnect-modal__base__row__h3 {
  color: #25292e;
  font-size: 20px;
  font-weight: 700;
  margin: 0;
  padding-bottom: 3px;
}

.walletconnect-modal__base__row__right {
  align-items: center;
  display: flex;
  justify-content: center;
}

.walletconnect-modal__base__row__right__app-icon {
  border-radius: 8px;
  height: 34px;
  margin: 0 11px 2px 0;
  width: 34px;
  background-size: 100%;
  box-shadow: 0 4px 12px 0 rgba(37, 41, 46, 0.25);
}

.walletconnect-modal__base__row__right__caret {
  height: 18px;
  opacity: 0.3;
  transition: 0.1s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  width: 8px;
  will-change: opacity;
}

.walletconnect-modal__base__row:hover .caret,
.walletconnect-modal__base__row:active .caret {
  opacity: 0.6;
}

.walletconnect-modal__mobile__toggle {
  width: 80%;
  display: flex;
  margin: 0 auto;
  position: relative;
  overflow: hidden;
  border-radius: 8px;
  margin-bottom: 18px;
  background: #d4d5d9;
}

.walletconnect-modal__single_wallet {
  display: flex;
  justify-content: center;
  margin-top: 7px;
  margin-bottom: 18px;
}

.walletconnect-modal__single_wallet a {
  cursor: pointer;
  color: rgb(64, 153, 255);
  font-size: 21px;
  font-weight: 800;
  text-decoration: none !important;
  margin: 0 auto;
}

.walletconnect-modal__mobile__toggle_selector {
  width: calc(50% - 8px);
  background: white;
  position: absolute;
  border-radius: 5px;
  height: calc(100% - 8px);
  top: 4px;
  transition: all 0.2s ease-in-out;
  transform: translate3d(4px, 0, 0);
}

.walletconnect-modal__mobile__toggle.right__selected .walletconnect-modal__mobile__toggle_selector {
  transform: translate3d(calc(100% + 12px), 0, 0);
}

.walletconnect-modal__mobile__toggle a {
  font-size: 12px;
  width: 50%;
  text-align: center;
  padding: 8px;
  margin: 0;
  font-weight: 600;
  z-index: 1;
}

.walletconnect-modal__footer {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}

@media only screen and (max-width: 768px) {
  .walletconnect-modal__footer {
    margin-top: 5vw;
  }
}

.walletconnect-modal__footer a {
  cursor: pointer;
  color: #898d97;
  font-size: 15px;
  margin: 0 auto;
}

@media only screen and (max-width: 320px) {
  .walletconnect-modal__footer a {
    font-size: 14px;
  }
}

.walletconnect-connect__buttons__wrapper {
  max-height: 44vh;
}

.walletconnect-connect__buttons__wrapper__android {
  margin: 50% 0;
}

.walletconnect-connect__buttons__wrapper__wrap {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  margin: 10px 0;
}

@media only screen and (min-width: 768px) {
  .walletconnect-connect__buttons__wrapper__wrap {
    margin-top: 40px;
  }
}

.walletconnect-connect__button {
  background-color: rgb(64, 153, 255);
  padding: 12px;
  border-radius: 8px;
  text-decoration: none;
  color: rgb(255, 255, 255);
  font-weight: 500;
}

.walletconnect-connect__button__icon_anchor {
  cursor: pointer;
  display: flex;
  justify-content: flex-start;
  align-items: center;
  margin: 8px;
  width: 42px;
  justify-self: center;
  flex-direction: column;
  text-decoration: none !important;
}

@media only screen and (max-width: 320px) {
  .walletconnect-connect__button__icon_anchor {
    margin: 4px;
  }
}

.walletconnect-connect__button__icon {
  border-radius: 10px;
  height: 42px;
  margin: 0;
  width: 42px;
  background-size: cover !important;
  box-shadow: 0 4px 12px 0 rgba(37, 41, 46, 0.25);
}

.walletconnect-connect__button__text {
  color: #424952;
  font-size: 2.7vw;
  text-decoration: none !important;
  padding: 0;
  margin-top: 1.8vw;
  font-weight: 600;
}

@media only screen and (min-width: 768px) {
  .walletconnect-connect__button__text {
    font-size: 16px;
    margin-top: 12px;
  }
}

.walletconnect-search__input {
  border: none;
  background: #d4d5d9;
  border-style: none;
  padding: 8px 16px;
  outline: none;
  font-style: normal;
  font-stretch: normal;
  font-size: 16px;
  font-style: normal;
  font-stretch: normal;
  line-height: normal;
  letter-spacing: normal;
  text-align: left;
  border-radius: 8px;
  width: calc(100% - 16px);
  margin: 0;
  margin-bottom: 8px;
}
`;typeof Symbol<"u"&&(Symbol.iterator||(Symbol.iterator=Symbol("Symbol.iterator")));typeof Symbol<"u"&&(Symbol.asyncIterator||(Symbol.asyncIterator=Symbol("Symbol.asyncIterator")));function ta(t,e){try{var n=t()}catch(r){return e(r)}return n&&n.then?n.then(void 0,e):n}var na="data:image/svg+xml,%3C?xml version='1.0' encoding='UTF-8'?%3E %3Csvg width='300px' height='185px' viewBox='0 0 300 185' version='1.1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink'%3E %3C!-- Generator: Sketch 49.3 (51167) - http://www.bohemiancoding.com/sketch --%3E %3Ctitle%3EWalletConnect%3C/title%3E %3Cdesc%3ECreated with Sketch.%3C/desc%3E %3Cdefs%3E%3C/defs%3E %3Cg id='Page-1' stroke='none' stroke-width='1' fill='none' fill-rule='evenodd'%3E %3Cg id='walletconnect-logo-alt' fill='%233B99FC' fill-rule='nonzero'%3E %3Cpath d='M61.4385429,36.2562612 C110.349767,-11.6319051 189.65053,-11.6319051 238.561752,36.2562612 L244.448297,42.0196786 C246.893858,44.4140867 246.893858,48.2961898 244.448297,50.690599 L224.311602,70.406102 C223.088821,71.6033071 221.106302,71.6033071 219.883521,70.406102 L211.782937,62.4749541 C177.661245,29.0669724 122.339051,29.0669724 88.2173582,62.4749541 L79.542302,70.9685592 C78.3195204,72.1657633 76.337001,72.1657633 75.1142214,70.9685592 L54.9775265,51.2530561 C52.5319653,48.8586469 52.5319653,44.9765439 54.9775265,42.5821357 L61.4385429,36.2562612 Z M280.206339,77.0300061 L298.128036,94.5769031 C300.573585,96.9713 300.573599,100.85338 298.128067,103.247793 L217.317896,182.368927 C214.872352,184.763353 210.907314,184.76338 208.461736,182.368989 C208.461726,182.368979 208.461714,182.368967 208.461704,182.368957 L151.107561,126.214385 C150.496171,125.615783 149.504911,125.615783 148.893521,126.214385 C148.893517,126.214389 148.893514,126.214393 148.89351,126.214396 L91.5405888,182.368927 C89.095052,184.763359 85.1300133,184.763399 82.6844276,182.369014 C82.6844133,182.369 82.684398,182.368986 82.6843827,182.36897 L1.87196327,103.246785 C-0.573596939,100.852377 -0.573596939,96.9702735 1.87196327,94.5758653 L19.7936929,77.028998 C22.2392531,74.6345898 26.2042918,74.6345898 28.6498531,77.028998 L86.0048306,133.184355 C86.6162214,133.782957 87.6074796,133.782957 88.2188704,133.184355 C88.2188796,133.184346 88.2188878,133.184338 88.2188969,133.184331 L145.571,77.028998 C148.016505,74.6345347 151.981544,74.6344449 154.427161,77.028798 C154.427195,77.0288316 154.427229,77.0288653 154.427262,77.028899 L211.782164,133.184331 C212.393554,133.782932 213.384814,133.782932 213.996204,133.184331 L271.350179,77.0300061 C273.79574,74.6355969 277.760778,74.6355969 280.206339,77.0300061 Z' id='WalletConnect'%3E%3C/path%3E %3C/g%3E %3C/g%3E %3C/svg%3E",ra="WalletConnect",oa=300,ia="rgb(64, 153, 255)",kr="walletconnect-wrapper",Nt="walletconnect-style-sheet",Er="walletconnect-qrcode-modal",sa="walletconnect-qrcode-close",Cr="walletconnect-qrcode-text",aa="walletconnect-connect-button";function ca(t){return d.createElement("div",{className:"walletconnect-modal__header"},d.createElement("img",{src:na,className:"walletconnect-modal__headerLogo"}),d.createElement("p",null,ra),d.createElement("div",{className:"walletconnect-modal__close__wrapper",onClick:t.onClose},d.createElement("div",{id:sa,className:"walletconnect-modal__close__icon"},d.createElement("div",{className:"walletconnect-modal__close__line1"}),d.createElement("div",{className:"walletconnect-modal__close__line2"}))))}function la(t){return d.createElement("a",{className:"walletconnect-connect__button",href:t.href,id:aa+"-"+t.name,onClick:t.onClick,rel:"noopener noreferrer",style:{backgroundColor:t.color},target:"_blank"},t.name)}var ua="data:image/svg+xml,%3Csvg width='8' height='18' viewBox='0 0 8 18' fill='none' xmlns='http://www.w3.org/2000/svg'%3E %3Cpath fill-rule='evenodd' clip-rule='evenodd' d='M0.586301 0.213898C0.150354 0.552968 0.0718197 1.18124 0.41089 1.61719L5.2892 7.88931C5.57007 8.25042 5.57007 8.75608 5.2892 9.11719L0.410889 15.3893C0.071819 15.8253 0.150353 16.4535 0.586301 16.7926C1.02225 17.1317 1.65052 17.0531 1.98959 16.6172L6.86791 10.3451C7.7105 9.26174 7.7105 7.74476 6.86791 6.66143L1.98959 0.38931C1.65052 -0.0466374 1.02225 -0.125172 0.586301 0.213898Z' fill='%233C4252'/%3E %3C/svg%3E";function _a(t){var e=t.color,n=t.href,r=t.name,o=t.logo,i=t.onClick;return d.createElement("a",{className:"walletconnect-modal__base__row",href:n,onClick:i,rel:"noopener noreferrer",target:"_blank"},d.createElement("h3",{className:"walletconnect-modal__base__row__h3"},r),d.createElement("div",{className:"walletconnect-modal__base__row__right"},d.createElement("div",{className:"walletconnect-modal__base__row__right__app-icon",style:{background:"url('"+o+"') "+e,backgroundSize:"100%"}}),d.createElement("img",{src:ua,className:"walletconnect-modal__base__row__right__caret"})))}function da(t){var e=t.color,n=t.href,r=t.name,o=t.logo,i=t.onClick,c=window.innerWidth<768?(r.length>8?2.5:2.7)+"vw":"inherit";return d.createElement("a",{className:"walletconnect-connect__button__icon_anchor",href:n,onClick:i,rel:"noopener noreferrer",target:"_blank"},d.createElement("div",{className:"walletconnect-connect__button__icon",style:{background:"url('"+o+"') "+e,backgroundSize:"100%"}}),d.createElement("div",{style:{fontSize:c},className:"walletconnect-connect__button__text"},r))}var fa=5,Se=12;function ha(t){var e=R.isAndroid(),n=d.useState(""),r=n[0],o=n[1],i=d.useState(""),c=i[0],u=i[1],h=d.useState(1),p=h[0],s=h[1],w=c?t.links.filter(function(_){return _.name.toLowerCase().includes(c.toLowerCase())}):t.links,g=t.errorMessage,m=c||w.length>fa,k=Math.ceil(w.length/Se),I=[(p-1)*Se+1,p*Se],C=w.length?w.filter(function(_,v){return v+1>=I[0]&&v+1<=I[1]}):[],a=!e&&k>1,l=void 0;function f(_){o(_.target.value),clearTimeout(l),_.target.value?l=setTimeout(function(){u(_.target.value),s(1)},1e3):(o(""),u(""),s(1))}return d.createElement("div",null,d.createElement("p",{id:Cr,className:"walletconnect-qrcode__text"},e?t.text.connect_mobile_wallet:t.text.choose_preferred_wallet),!e&&d.createElement("input",{className:"walletconnect-search__input",placeholder:"Search",value:r,onChange:f}),d.createElement("div",{className:"walletconnect-connect__buttons__wrapper"+(e?"__android":m&&w.length?"__wrap":"")},e?d.createElement(la,{name:t.text.connect,color:ia,href:t.uri,onClick:d.useCallback(function(){R.saveMobileLinkInfo({name:"Unknown",href:t.uri})},[])}):C.length?C.map(function(_){var v=_.color,E=_.name,b=_.shortName,S=_.logo,T=R.formatIOSMobile(t.uri,_),W=d.useCallback(function(){R.saveMobileLinkInfo({name:E,href:T})},[C]);return m?d.createElement(da,{color:v,href:T,name:b||E,logo:S,onClick:W}):d.createElement(_a,{color:v,href:T,name:E,logo:S,onClick:W})}):d.createElement(d.Fragment,null,d.createElement("p",null,g.length?t.errorMessage:t.links.length&&!w.length?t.text.no_wallets_found:t.text.loading))),a&&d.createElement("div",{className:"walletconnect-modal__footer"},Array(k).fill(0).map(function(_,v){var E=v+1,b=p===E;return d.createElement("a",{style:{margin:"auto 10px",fontWeight:b?"bold":"normal"},onClick:function(){return s(E)}},E)})))}function pa(t){var e=!!t.message.trim();return d.createElement("div",{className:"walletconnect-qrcode__notification"+(e?" notification__show":"")},t.message)}var ma=function(t){try{var e="";return Promise.resolve(br.toString(t,{margin:0,type:"svg"})).then(function(n){return typeof n=="string"&&(e=n.replace("<svg",'<svg class="walletconnect-qrcode__image"')),e})}catch(n){return Promise.reject(n)}};function ga(t){var e=d.useState(""),n=e[0],r=e[1],o=d.useState(""),i=o[0],c=o[1];d.useEffect(function(){try{return Promise.resolve(ma(t.uri)).then(function(h){c(h)})}catch(h){Promise.reject(h)}},[]);var u=function(){var h=Zs(t.uri);h?(r(t.text.copied_to_clipboard),setInterval(function(){return r("")},1200)):(r("Error"),setInterval(function(){return r("")},1200))};return d.createElement("div",null,d.createElement("p",{id:Cr,className:"walletconnect-qrcode__text"},t.text.scan_qrcode_with_wallet),d.createElement("div",{dangerouslySetInnerHTML:{__html:i}}),d.createElement("div",{className:"walletconnect-modal__footer"},d.createElement("a",{onClick:u},t.text.copy_to_clipboard)),d.createElement(pa,{message:n}))}function va(t){var e=R.isAndroid(),n=R.isMobile(),r=n?t.qrcodeModalOptions&&t.qrcodeModalOptions.mobileLinks?t.qrcodeModalOptions.mobileLinks:void 0:t.qrcodeModalOptions&&t.qrcodeModalOptions.desktopLinks?t.qrcodeModalOptions.desktopLinks:void 0,o=d.useState(!1),i=o[0],c=o[1],u=d.useState(!1),h=u[0],p=u[1],s=d.useState(!n),w=s[0],g=s[1],m={mobile:n,text:t.text,uri:t.uri,qrcodeModalOptions:t.qrcodeModalOptions},k=d.useState(""),I=k[0],C=k[1],a=d.useState(!1),l=a[0],f=a[1],_=d.useState([]),v=_[0],E=_[1],b=d.useState(""),S=b[0],T=b[1],W=function(){h||i||r&&!r.length||v.length>0||d.useEffect(function(){var Rr=function(){try{if(e)return Promise.resolve();c(!0);var be=ta(function(){var G=t.qrcodeModalOptions&&t.qrcodeModalOptions.registryUrl?t.qrcodeModalOptions.registryUrl:R.getWalletRegistryUrl();return Promise.resolve(fetch(G)).then(function(Tr){return Promise.resolve(Tr.json()).then(function(Or){var Nr=Or.listings,Mr=n?"mobile":"desktop",ie=R.getMobileLinkRegistry(R.formatMobileRegistry(Nr,Mr),r);c(!1),p(!0),T(ie.length?"":t.text.no_supported_wallets),E(ie);var it=ie.length===1;it&&(C(R.formatIOSMobile(t.uri,ie[0])),g(!0)),f(it)})})},function(G){c(!1),p(!0),T(t.text.something_went_wrong),console.error(G)});return Promise.resolve(be&&be.then?be.then(function(){}):void 0)}catch(G){return Promise.reject(G)}};Rr()})};W();var Ir=n?w:!w;return d.createElement("div",{id:Er,className:"walletconnect-qrcode__base animated fadeIn"},d.createElement("div",{className:"walletconnect-modal__base"},d.createElement(ca,{onClose:t.onClose}),l&&w?d.createElement("div",{className:"walletconnect-modal__single_wallet"},d.createElement("a",{onClick:function(){return R.saveMobileLinkInfo({name:v[0].name,href:I})},href:I,rel:"noopener noreferrer",target:"_blank"},t.text.connect_with+" "+(l?v[0].name:"")+" ›")):e||i||!i&&v.length?d.createElement("div",{className:"walletconnect-modal__mobile__toggle"+(Ir?" right__selected":"")},d.createElement("div",{className:"walletconnect-modal__mobile__toggle_selector"}),n?d.createElement(d.Fragment,null,d.createElement("a",{onClick:function(){return g(!1),W()}},t.text.mobile),d.createElement("a",{onClick:function(){return g(!0)}},t.text.qrcode)):d.createElement(d.Fragment,null,d.createElement("a",{onClick:function(){return g(!0)}},t.text.qrcode),d.createElement("a",{onClick:function(){return g(!1),W()}},t.text.desktop))):null,d.createElement("div",null,w||!e&&!i&&!v.length?d.createElement(ga,Object.assign({},m)):d.createElement(ha,Object.assign({},m,{links:v,errorMessage:S})))))}var ya={choose_preferred_wallet:"Wähle bevorzugte Wallet",connect_mobile_wallet:"Verbinde mit Mobile Wallet",scan_qrcode_with_wallet:"Scanne den QR-code mit einer WalletConnect kompatiblen Wallet",connect:"Verbinden",qrcode:"QR-Code",mobile:"Mobile",desktop:"Desktop",copy_to_clipboard:"In die Zwischenablage kopieren",copied_to_clipboard:"In die Zwischenablage kopiert!",connect_with:"Verbinden mit Hilfe von",loading:"Laden...",something_went_wrong:"Etwas ist schief gelaufen",no_supported_wallets:"Es gibt noch keine unterstützten Wallet",no_wallets_found:"keine Wallet gefunden"},wa={choose_preferred_wallet:"Choose your preferred wallet",connect_mobile_wallet:"Connect to Mobile Wallet",scan_qrcode_with_wallet:"Scan QR code with a WalletConnect-compatible wallet",connect:"Connect",qrcode:"QR Code",mobile:"Mobile",desktop:"Desktop",copy_to_clipboard:"Copy to clipboard",copied_to_clipboard:"Copied to clipboard!",connect_with:"Connect with",loading:"Loading...",something_went_wrong:"Something went wrong",no_supported_wallets:"There are no supported wallets yet",no_wallets_found:"No wallets found"},ba={choose_preferred_wallet:"Elige tu billetera preferida",connect_mobile_wallet:"Conectar a billetera móvil",scan_qrcode_with_wallet:"Escanea el código QR con una billetera compatible con WalletConnect",connect:"Conectar",qrcode:"Código QR",mobile:"Móvil",desktop:"Desktop",copy_to_clipboard:"Copiar",copied_to_clipboard:"Copiado!",connect_with:"Conectar mediante",loading:"Cargando...",something_went_wrong:"Algo salió mal",no_supported_wallets:"Todavía no hay billeteras compatibles",no_wallets_found:"No se encontraron billeteras"},ka={choose_preferred_wallet:"Choisissez votre portefeuille préféré",connect_mobile_wallet:"Se connecter au portefeuille mobile",scan_qrcode_with_wallet:"Scannez le QR code avec un portefeuille compatible WalletConnect",connect:"Se connecter",qrcode:"QR Code",mobile:"Mobile",desktop:"Desktop",copy_to_clipboard:"Copier",copied_to_clipboard:"Copié!",connect_with:"Connectez-vous à l'aide de",loading:"Chargement...",something_went_wrong:"Quelque chose a mal tourné",no_supported_wallets:"Il n'y a pas encore de portefeuilles pris en charge",no_wallets_found:"Aucun portefeuille trouvé"},Ea={choose_preferred_wallet:"원하는 지갑을 선택하세요",connect_mobile_wallet:"모바일 지갑과 연결",scan_qrcode_with_wallet:"WalletConnect 지원 지갑에서 QR코드를 스캔하세요",connect:"연결",qrcode:"QR 코드",mobile:"모바일",desktop:"데스크탑",copy_to_clipboard:"클립보드에 복사",copied_to_clipboard:"클립보드에 복사되었습니다!",connect_with:"와 연결하다",loading:"로드 중...",something_went_wrong:"문제가 발생했습니다.",no_supported_wallets:"아직 지원되는 지갑이 없습니다",no_wallets_found:"지갑을 찾을 수 없습니다"},Ca={choose_preferred_wallet:"Escolha sua carteira preferida",connect_mobile_wallet:"Conectar-se à carteira móvel",scan_qrcode_with_wallet:"Ler o código QR com uma carteira compatível com WalletConnect",connect:"Conectar",qrcode:"Código QR",mobile:"Móvel",desktop:"Desktop",copy_to_clipboard:"Copiar",copied_to_clipboard:"Copiado!",connect_with:"Ligar por meio de",loading:"Carregamento...",something_went_wrong:"Algo correu mal",no_supported_wallets:"Ainda não há carteiras suportadas",no_wallets_found:"Nenhuma carteira encontrada"},Sa={choose_preferred_wallet:"选择你的钱包",connect_mobile_wallet:"连接至移动端钱包",scan_qrcode_with_wallet:"使用兼容 WalletConnect 的钱包扫描二维码",connect:"连接",qrcode:"二维码",mobile:"移动",desktop:"桌面",copy_to_clipboard:"复制到剪贴板",copied_to_clipboard:"复制到剪贴板成功！",connect_with:"通过以下方式连接",loading:"正在加载...",something_went_wrong:"出了问题",no_supported_wallets:"目前还没有支持的钱包",no_wallets_found:"没有找到钱包"},xa={choose_preferred_wallet:"کیف پول مورد نظر خود را انتخاب کنید",connect_mobile_wallet:"به کیف پول موبایل وصل شوید",scan_qrcode_with_wallet:"کد QR را با یک کیف پول سازگار با WalletConnect اسکن کنید",connect:"اتصال",qrcode:"کد QR",mobile:"سیار",desktop:"دسکتاپ",copy_to_clipboard:"کپی به کلیپ بورد",copied_to_clipboard:"در کلیپ بورد کپی شد!",connect_with:"ارتباط با",loading:"...بارگذاری",something_went_wrong:"مشکلی پیش آمد",no_supported_wallets:"هنوز هیچ کیف پول پشتیبانی شده ای وجود ندارد",no_wallets_found:"هیچ کیف پولی پیدا نشد"},Mt={de:ya,en:wa,es:ba,fr:ka,ko:Ea,pt:Ca,zh:Sa,fa:xa};function Ia(){var t=R.getDocumentOrThrow(),e=t.getElementById(Nt);e&&t.head.removeChild(e);var n=t.createElement("style");n.setAttribute("id",Nt),n.innerText=ea,t.head.appendChild(n)}function Ra(){var t=R.getDocumentOrThrow(),e=t.createElement("div");return e.setAttribute("id",kr),t.body.appendChild(e),e}function Sr(){var t=R.getDocumentOrThrow(),e=t.getElementById(Er);e&&(e.className=e.className.replace("fadeIn","fadeOut"),setTimeout(function(){var n=t.getElementById(kr);n&&t.body.removeChild(n)},oa))}function Ta(t){return function(){Sr(),t&&t()}}function Oa(){var t=R.getNavigatorOrThrow().language.split("-")[0]||"en";return Mt[t]||Mt.en}function Na(t,e,n){Ia();var r=Ra();d.render(d.createElement(va,{text:Oa(),uri:t,onClose:Ta(e),qrcodeModalOptions:n}),r)}function Ma(){Sr()}var xr=function(){return typeof process<"u"&&typeof process.versions<"u"&&typeof process.versions.node<"u"};function La(t,e,n){console.log(t),xr()?Xs(t):Na(t,e,n)}function Aa(){xr()||Ma()}var qa={open:La,close:Aa},Ua=qa;class $a extends eo{constructor(e){super(),this.events=new Lt,this.accounts=[],this.chainId=1,this.pending=!1,this.bridge="https://bridge.walletconnect.org",this.qrcode=!0,this.qrcodeModalOptions=void 0,this.opts=e,this.chainId=(e==null?void 0:e.chainId)||this.chainId,this.wc=this.register(e)}get connected(){return typeof this.wc<"u"&&this.wc.connected}get connecting(){return this.pending}get connector(){return this.wc=this.register(this.opts),this.wc}on(e,n){this.events.on(e,n)}once(e,n){this.events.once(e,n)}off(e,n){this.events.off(e,n)}removeListener(e,n){this.events.removeListener(e,n)}async open(e){if(this.connected){this.onOpen();return}return new Promise((n,r)=>{this.on("error",o=>{r(o)}),this.on("open",()=>{n()}),this.create(e)})}async close(){typeof this.wc>"u"||(this.wc.connected&&this.wc.killSession(),this.onClose())}async send(e){this.wc=this.register(this.opts),this.connected||await this.open(),this.sendPayload(e).then(n=>this.events.emit("payload",n)).catch(n=>this.events.emit("payload",st(e.id,n.message)))}register(e){if(this.wc)return this.wc;this.opts=e||this.opts,this.bridge=e!=null&&e.connector?e.connector.bridge:(e==null?void 0:e.bridge)||"https://bridge.walletconnect.org",this.qrcode=typeof(e==null?void 0:e.qrcode)>"u"||e.qrcode!==!1,this.chainId=typeof(e==null?void 0:e.chainId)<"u"?e.chainId:this.chainId,this.qrcodeModalOptions=e==null?void 0:e.qrcodeModalOptions;const n={bridge:this.bridge,qrcodeModal:this.qrcode?Ua:void 0,qrcodeModalOptions:this.qrcodeModalOptions,storageId:e==null?void 0:e.storageId,signingMethods:e==null?void 0:e.signingMethods,clientMeta:e==null?void 0:e.clientMeta};if(this.wc=typeof(e==null?void 0:e.connector)<"u"?e.connector:new ws(n),typeof this.wc>"u")throw new Error("Failed to register WalletConnect connector");return this.wc.accounts.length&&(this.accounts=this.wc.accounts),this.wc.chainId&&(this.chainId=this.wc.chainId),this.registerConnectorEvents(),this.wc}onOpen(e){this.pending=!1,e&&(this.wc=e),this.events.emit("open")}onClose(){this.pending=!1,this.wc&&(this.wc=void 0),this.events.emit("close")}onError(e,n="Failed or Rejected Request",r=-32e3){const o={id:e.id,jsonrpc:e.jsonrpc,error:{code:r,message:n}};return this.events.emit("payload",o),o}create(e){this.wc=this.register(this.opts),this.chainId=e||this.chainId,!(this.connected||this.pending)&&(this.pending=!0,this.registerConnectorEvents(),this.wc.createSession({chainId:this.chainId}).then(()=>this.events.emit("created")).catch(n=>this.events.emit("error",n)))}registerConnectorEvents(){this.wc=this.register(this.opts),this.wc.on("connect",e=>{var n,r;if(e){this.events.emit("error",e);return}this.accounts=((n=this.wc)===null||n===void 0?void 0:n.accounts)||[],this.chainId=((r=this.wc)===null||r===void 0?void 0:r.chainId)||this.chainId,this.onOpen()}),this.wc.on("disconnect",e=>{if(e){this.events.emit("error",e);return}this.onClose()}),this.wc.on("modal_closed",()=>{this.events.emit("error",new Error("User closed modal"))}),this.wc.on("session_update",(e,n)=>{const{accounts:r,chainId:o}=n.params[0];(!this.accounts||r&&this.accounts!==r)&&(this.accounts=r,this.events.emit("accountsChanged",r)),(!this.chainId||o&&this.chainId!==o)&&(this.chainId=o,this.events.emit("chainChanged",o))})}async sendPayload(e){this.wc=this.register(this.opts);try{const n=await this.wc.unsafeSend(e);return this.sanitizeResponse(n)}catch(n){return this.onError(e,n.message)}}sanitizeResponse(e){return typeof e.error<"u"&&typeof e.error.code>"u"?st(e.id,e.error.message,e.error.data):e}}class Ha{constructor(e){this.events=new Lt,this.rpc={infuraId:e==null?void 0:e.infuraId,custom:e==null?void 0:e.rpc},this.signer=new at(new $a(e));const n=this.signer.connection.chainId||(e==null?void 0:e.chainId)||1;this.http=this.setHttpProvider(n),this.registerEventListeners()}get connected(){return this.signer.connection.connected}get connector(){return this.signer.connection.connector}get accounts(){return this.signer.connection.accounts}get chainId(){return this.signer.connection.chainId}get rpcUrl(){var e;return((e=this.http)===null||e===void 0?void 0:e.connection).url||""}async request(e){switch(e.method){case"eth_requestAccounts":return await this.connect(),this.signer.connection.accounts;case"eth_accounts":return this.signer.connection.accounts;case"eth_chainId":return this.signer.connection.chainId}if(Ae.includes(e.method))return this.signer.request(e);if(typeof this.http>"u")throw new Error(`Cannot request JSON-RPC method (${e.method}) without provided rpc url`);return this.http.request(e)}sendAsync(e,n){this.request(e).then(r=>n(null,r)).catch(r=>n(r,void 0))}async enable(){return await this.request({method:"eth_requestAccounts"})}async connect(){this.signer.connection.connected||await this.signer.connect()}async disconnect(){this.signer.connection.connected&&await this.signer.disconnect()}on(e,n){this.events.on(e,n)}once(e,n){this.events.once(e,n)}removeListener(e,n){this.events.removeListener(e,n)}off(e,n){this.events.off(e,n)}get isWalletConnect(){return!0}registerEventListeners(){this.signer.connection.on("accountsChanged",e=>{this.events.emit("accountsChanged",e)}),this.signer.connection.on("chainChanged",e=>{this.http=this.setHttpProvider(e),this.events.emit("chainChanged",e)}),this.signer.on("disconnect",()=>{this.events.emit("disconnect")})}setHttpProvider(e){const n=an(e,this.rpc);return typeof n>"u"?void 0:new at(new to(n))}}export{Ha as default};

import{S as s,i as a,s as e,j as t,m as r,o as l,G as c,x as o,u as n,v as i,e as f,t as h,k as p,c as u,a as d,g,d as m,n as $,b as v,f as x,F as E,h as j,w as k,K as A,r as w}from"../../chunks/vendor-91fe6b9c.js";import{p as D}from"../../chunks/products-93807a47.js";import{P as I}from"../../chunks/productcard-f8e80c01.js";function V(s,a,e){const t=s.slice();return t[2]=a[e],t}function b(s){let a,e;return a=new I({props:{product:s[2]}}),{c(){t(a.$$.fragment)},l(s){r(a.$$.fragment,s)},m(s,t){l(a,s,t),e=!0},p:c,i(s){e||(o(a.$$.fragment,s),e=!0)},o(s){n(a.$$.fragment,s),e=!1},d(s){i(a,s)}}}function C(s){let a,e,t,r,l,c,i,D,I=s[0].charAt(0).toUpperCase()+s[0].slice(1)+"",C=s[1],U=[];for(let o=0;o<C.length;o+=1)U[o]=b(V(s,C,o));const y=s=>n(U[s],1,1,(()=>{U[s]=null}));return{c(){a=f("div"),e=f("div"),t=f("h1"),r=h(I),l=h(" Aisle"),c=p(),i=f("div");for(let s=0;s<U.length;s+=1)U[s].c();this.h()},l(s){a=u(s,"DIV",{class:!0});var o=d(a);e=u(o,"DIV",{class:!0});var n=d(e);t=u(n,"H1",{});var f=d(t);r=g(f,I),l=g(f," Aisle"),f.forEach(m),c=$(n),i=u(n,"DIV",{class:!0});var h=d(i);for(let a=0;a<U.length;a+=1)U[a].l(h);h.forEach(m),n.forEach(m),o.forEach(m),this.h()},h(){v(i,"class","products"),v(e,"class","aisle"),v(a,"class","aisle-wrapper")},m(s,o){x(s,a,o),E(a,e),E(e,t),E(t,r),E(t,l),E(e,c),E(e,i);for(let a=0;a<U.length;a+=1)U[a].m(i,null);D=!0},p(s,[a]){if((!D||1&a)&&I!==(I=s[0].charAt(0).toUpperCase()+s[0].slice(1)+"")&&j(r,I),2&a){let e;for(C=s[1],e=0;e<C.length;e+=1){const t=V(s,C,e);U[e]?(U[e].p(t,a),o(U[e],1)):(U[e]=b(t),U[e].c(),o(U[e],1),U[e].m(i,null))}for(w(),e=C.length;e<U.length;e+=1)y(e);k()}},i(s){if(!D){for(let s=0;s<C.length;s+=1)o(U[s]);D=!0}},o(s){U=U.filter(Boolean);for(let a=0;a<U.length;a+=1)n(U[a]);D=!1},d(s){s&&m(a),A(U,s)}}}async function U({page:s,fetch:a,session:e,context:t}){return{props:{aisle:s.path.split("/")[2]}}}function y(s,a,e){let{aisle:t}=a,r=[];return D.productList.forEach((s=>{t.slice(1)===s.aisle.slice(1)&&r.push(s)})),s.$$set=s=>{"aisle"in s&&e(0,t=s.aisle)},[t,r]}export default class extends s{constructor(s){super(),a(this,s,y,C,e,{aisle:0})}}export{U as load};

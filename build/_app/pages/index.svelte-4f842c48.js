import{S as e,i as a,s as r,j as s,m as t,o as n,G as l,x as i,u as c,v as o,e as f,k as h,t as g,c as u,a as m,n as d,g as p,d as v,J as j,b,f as E,F as $,w as I,K as D,r as V}from"../chunks/vendor-ca631d87.js";import{P as w}from"../chunks/productcard-8c9a482b.js";function B(e,a,r){const s=e.slice();return s[2]=a[r],s}function k(e,a,r){const s=e.slice();return s[5]=a[r],s}function x(e){let a,r;return a=new w({props:{product:e[5]}}),{c(){s(a.$$.fragment)},l(e){t(a.$$.fragment,e)},m(e,s){n(a,e,s),r=!0},p:l,i(e){r||(i(a.$$.fragment,e),r=!0)},o(e){c(a.$$.fragment,e),r=!1},d(e){o(a,e)}}}function A(e){let a,r,s,t,n,i,c,o,I,D=e[2].name+"";return{c(){a=f("a"),r=f("img"),n=h(),i=f("h2"),c=g(D),o=h(),this.h()},l(e){a=u(e,"A",{href:!0});var s=m(a);r=u(s,"IMG",{src:!0,alt:!0}),n=d(s),i=u(s,"H2",{});var t=m(i);c=p(t,D),t.forEach(v),o=d(s),s.forEach(v),this.h()},h(){j(r.src,s=e[2].image)||b(r,"src",s),b(r,"alt",t=e[2].name),b(a,"href",I="/"+e[2].name)},m(e,s){E(e,a,s),$(a,r),$(a,n),$(a,i),$(i,c),$(a,o)},p:l,d(e){e&&v(a)}}}function F(e){let a,r,s,t,n,l,o,j,w,F,H,P,W,y=e[0],G=[];for(let i=0;i<y.length;i+=1)G[i]=x(k(e,y,i));const T=e=>c(G[e],1,1,(()=>{G[e]=null}));let J=e[1],K=[];for(let i=0;i<J.length;i+=1)K[i]=A(B(e,J,i));return{c(){a=f("div"),r=f("div"),s=f("h1"),t=g("Today’s Featured Products"),n=h(),l=f("div");for(let e=0;e<G.length;e+=1)G[e].c();o=h(),j=f("div"),w=f("h1"),F=g("Aisles"),H=h(),P=f("div");for(let e=0;e<K.length;e+=1)K[e].c();this.h()},l(e){a=u(e,"DIV",{class:!0});var i=m(a);r=u(i,"DIV",{class:!0});var c=m(r);s=u(c,"H1",{});var f=m(s);t=p(f,"Today’s Featured Products"),f.forEach(v),n=d(c),l=u(c,"DIV",{class:!0});var h=m(l);for(let a=0;a<G.length;a+=1)G[a].l(h);h.forEach(v),c.forEach(v),o=d(i),j=u(i,"DIV",{class:!0});var g=m(j);w=u(g,"H1",{});var b=m(w);F=p(b,"Aisles"),b.forEach(v),H=d(g),P=u(g,"DIV",{class:!0});var E=m(P);for(let a=0;a<K.length;a+=1)K[a].l(E);E.forEach(v),g.forEach(v),i.forEach(v),this.h()},h(){b(l,"class","products"),b(r,"class","banner"),b(P,"class","aisles"),b(j,"class","aisles-wrapper"),b(a,"class","home-wrapper")},m(e,i){E(e,a,i),$(a,r),$(r,s),$(s,t),$(r,n),$(r,l);for(let a=0;a<G.length;a+=1)G[a].m(l,null);$(a,o),$(a,j),$(j,w),$(w,F),$(j,H),$(j,P);for(let a=0;a<K.length;a+=1)K[a].m(P,null);W=!0},p(e,[a]){if(1&a){let r;for(y=e[0],r=0;r<y.length;r+=1){const s=k(e,y,r);G[r]?(G[r].p(s,a),i(G[r],1)):(G[r]=x(s),G[r].c(),i(G[r],1),G[r].m(l,null))}for(V(),r=y.length;r<G.length;r+=1)T(r);I()}if(2&a){let r;for(J=e[1],r=0;r<J.length;r+=1){const s=B(e,J,r);K[r]?K[r].p(s,a):(K[r]=A(s),K[r].c(),K[r].m(P,null))}for(;r<K.length;r+=1)K[r].d(1);K.length=J.length}},i(e){if(!W){for(let e=0;e<y.length;e+=1)i(G[e]);W=!0}},o(e){G=G.filter(Boolean);for(let a=0;a<G.length;a+=1)c(G[a]);W=!1},d(e){e&&v(a),D(G,e),D(K,e)}}}function H(e){return[[{name:"White Bread",price:7.99,rebate:5,image:"bread1.jpg"},{name:"White Bread",price:7.99,rebate:0,image:"bread1.jpg"},{name:"White Bread",price:7.99,rebate:5,image:"bread1.jpg"}],[{name:"fruits",image:"fruits.jpg"},{name:"fruits",image:"fruits.jpg"},{name:"fruits",image:"fruits.jpg"},{name:"fruits",image:"fruits.jpg"},{name:"fruits",image:"fruits.jpg"},{name:"fruits",image:"fruits.jpg"}]]}export default class extends e{constructor(e){super(),a(this,e,H,F,r,{})}}
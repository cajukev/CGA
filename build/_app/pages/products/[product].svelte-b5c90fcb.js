import{S as e,i as a,s,e as t,t as i,c as r,a as c,g as o,d as l,b as p,f as L,E as d,h as m,D as n,k as h,n as g,M as f,I as u,F as v,R as w,G as x,A as E,H as b}from"../../chunks/vendor-a95f158c.js";import{c as y}from"../../chunks/stores-30180c6b.js";function C(e){let a,s,n,h="$"+(e[0].price*e[1]).toFixed(2);return{c(){a=t("p"),s=t("s"),n=i(h),this.h()},l(e){a=r(e,"P",{class:!0});var t=c(a);s=r(t,"S",{});var i=c(s);n=o(i,h),i.forEach(l),t.forEach(l),this.h()},h(){p(a,"class","rebate-price")},m(e,t){L(e,a,t),d(a,s),d(s,n)},p(e,a){3&a&&h!==(h="$"+(e[0].price*e[1]).toFixed(2))&&m(n,h)},d(e){e&&l(a)}}}function I(e){let a,s,t,i;return{c(){a=n("svg"),s=n("path"),t=n("path"),i=n("path"),this.h()},l(e){a=r(e,"svg",{viewBox:!0,fill:!0,xmlns:!0},1);var o=c(a);s=r(o,"path",{d:!0,fill:!0},1),c(s).forEach(l),t=r(o,"path",{d:!0,fill:!0},1),c(t).forEach(l),i=r(o,"path",{d:!0,fill:!0},1),c(i).forEach(l),o.forEach(l),this.h()},h(){p(s,"d","M15.7143 7.49286L13.9714 5.5L14.2143 2.86429L11.6357 2.27857L10.2857 0L7.85714 1.04286L5.42857 0L4.07857 2.27857L1.5 2.85714L1.74286 5.5L0 7.49286L1.74286 9.48571L1.5 12.1286L4.07857 12.7143L5.42857 15L7.85714 13.95L10.2857 14.9929L11.6357 12.7143L14.2143 12.1286L13.9714 9.49286L15.7143 7.49286ZM12.8929 8.55L12.4929 9.01429L12.55 9.62143L12.6786 11.0143L11.3214 11.3214L10.7214 11.4571L10.4071 11.9857L9.7 13.1857L8.42857 12.6357L7.85714 12.3929L7.29286 12.6357L6.02143 13.1857L5.31429 11.9929L5 11.4643L4.4 11.3286L3.04286 11.0214L3.17143 9.62143L3.22857 9.01429L2.82857 8.55L1.90714 7.5L2.82857 6.44286L3.22857 5.97857L3.16429 5.36429L3.03571 3.97857L4.39286 3.67143L4.99286 3.53571L5.30714 3.00714L6.01429 1.80714L7.28572 2.35714L7.85714 2.6L8.42143 2.35714L9.69286 1.80714L10.4 3.00714L10.7143 3.53571L11.3143 3.67143L12.6714 3.97857L12.5429 5.37143L12.4857 5.97857L12.8857 6.44286L13.8071 7.49286L12.8929 8.55Z"),p(s,"fill","#912338"),p(t,"d","M12.8929 8.55L12.4929 9.01429L12.55 9.62143L12.6786 11.0143L11.3214 11.3214L10.7214 11.4571L10.4071 11.9857L9.7 13.1857L8.42857 12.6357L7.85714 12.3929L7.29286 12.6357L6.02143 13.1857L5.31429 11.9929L5 11.4643L4.4 11.3286L3.04286 11.0214L3.17143 9.62143L3.22857 9.01429L2.82857 8.55L1.90714 7.5L2.82857 6.44286L3.22857 5.97857L3.16429 5.36429L3.03571 3.97857L4.39286 3.67143L4.99286 3.53571L5.30714 3.00714L6.01429 1.80714L7.28572 2.35714L7.85714 2.6L8.42143 2.35714L9.69286 1.80714L10.4 3.00714L10.7143 3.53571L11.3143 3.67143L12.6714 3.97857L12.5429 5.37143L12.4857 5.97857L12.8857 6.44286L13.8071 7.49286L12.8929 8.55Z"),p(t,"fill","#912338"),p(i,"d","M6.49261 8.75L4.83546 7.08572L3.77832 8.15L6.49261 10.8714L11.7355 5.61429L10.6783 4.55L6.49261 8.75Z"),p(i,"fill","white"),p(a,"viewBox","0 0 16 15"),p(a,"fill","none"),p(a,"xmlns","http://www.w3.org/2000/svg")},m(e,r){L(e,a,r),d(a,s),d(a,t),d(a,i)},d(e){e&&l(a)}}}function j(e){let a,s,x,E,b,y,j,M,V,D,k,S,B,H,O,R,U,$,Z,A,N,F,P,T,q,G,Q,z,J,K,W,X,Y,_,ee,ae,se,te,ie,re,ce,oe,le,pe,Le,de,me,ne,he,ge,fe,ue,ve,we,xe,Ee,be,ye,Ce,Ie,je,Me,Ve,De,ke,Se,Be,He,Oe,Re,Ue,$e,Ze,Ae,Ne,Fe=e[0].aisle+"",Pe=e[0].name+"",Te="$"+(e[0].price*e[1]-e[0].rebate*e[1]).toFixed(2),qe=e[0].origin+"",Ge=e[0].description+"",Qe=0!=e[0].rebate&&C(e),ze="Quebec"==e[0].origin&&I();return{c(){a=t("div"),s=t("a"),x=i(Fe),E=i(" Aisle"),y=h(),j=t("h1"),M=i(Pe),V=h(),D=t("div"),k=t("div"),S=t("picture"),B=t("source"),O=h(),R=t("source"),$=h(),Z=t("source"),N=h(),F=t("source"),T=h(),q=t("source"),Q=h(),z=t("source"),K=h(),W=t("source"),Y=h(),_=t("source"),ae=h(),se=t("img"),ie=h(),re=t("div"),ce=t("div"),Qe&&Qe.c(),oe=h(),le=t("p"),pe=i(Te),Le=h(),de=t("div"),me=n("svg"),ne=n("path"),he=h(),ge=i(e[1]),fe=h(),ue=n("svg"),ve=n("path"),we=h(),xe=t("button"),Ee=i("Add To Cart"),be=h(),ye=t("div"),Ce=t("i"),Ie=i("Made in "),je=i(qe),Me=h(),ze&&ze.c(),Ve=h(),De=t("div"),ke=t("div"),Se=t("p"),Be=i("Detailed Description"),He=h(),Oe=n("svg"),Re=n("path"),Ue=h(),$e=t("div"),Ze=i(Ge),this.h()},l(t){a=r(t,"DIV",{class:!0});var i=c(a);s=r(i,"A",{"sveltekit:prefetch":!0,href:!0});var p=c(s);x=o(p,Fe),E=o(p," Aisle"),p.forEach(l),y=g(i),j=r(i,"H1",{class:!0});var L=c(j);M=o(L,Pe),L.forEach(l),V=g(i),D=r(i,"DIV",{class:!0});var d=c(D);k=r(d,"DIV",{class:!0});var m=c(k);S=r(m,"PICTURE",{});var n=c(S);B=r(n,"SOURCE",{srcset:!0,media:!0,type:!0}),O=g(n),R=r(n,"SOURCE",{srcset:!0,media:!0,type:!0}),$=g(n),Z=r(n,"SOURCE",{srcset:!0,media:!0,type:!0}),N=g(n),F=r(n,"SOURCE",{srcset:!0,media:!0,type:!0}),T=g(n),q=r(n,"SOURCE",{srcset:!0,media:!0,type:!0}),Q=g(n),z=r(n,"SOURCE",{srcset:!0,media:!0,type:!0}),K=g(n),W=r(n,"SOURCE",{srcset:!0,type:!0}),Y=g(n),_=r(n,"SOURCE",{srcset:!0,type:!0}),ae=g(n),se=r(n,"IMG",{src:!0,alt:!0,class:!0}),n.forEach(l),m.forEach(l),ie=g(d),re=r(d,"DIV",{class:!0});var h=c(re);ce=r(h,"DIV",{class:!0});var f=c(ce);Qe&&Qe.l(f),oe=g(f),le=r(f,"P",{class:!0});var u=c(le);pe=o(u,Te),u.forEach(l),f.forEach(l),Le=g(h),de=r(h,"DIV",{class:!0});var v=c(de);me=r(v,"svg",{viewBox:!0,fill:!0,xmlns:!0,id:!0},1);var w=c(me);ne=r(w,"path",{d:!0,stroke:!0},1),c(ne).forEach(l),w.forEach(l),he=g(v),ge=o(v,e[1]),fe=g(v),ue=r(v,"svg",{viewBox:!0,fill:!0,xmlns:!0,id:!0},1);var b=c(ue);ve=r(b,"path",{d:!0,stroke:!0},1),c(ve).forEach(l),b.forEach(l),v.forEach(l),we=g(h),xe=r(h,"BUTTON",{class:!0});var C=c(xe);Ee=o(C,"Add To Cart"),C.forEach(l),be=g(h),ye=r(h,"DIV",{class:!0});var I=c(ye);Ce=r(I,"I",{});var H=c(Ce);Ie=o(H,"Made in "),je=o(H,qe),H.forEach(l),Me=g(I),ze&&ze.l(I),I.forEach(l),Ve=g(h),De=r(h,"DIV",{class:!0});var U=c(De);ke=r(U,"DIV",{class:!0});var A=c(ke);Se=r(A,"P",{});var P=c(Se);Be=o(P,"Detailed Description"),P.forEach(l),He=g(A),Oe=r(A,"svg",{viewBox:!0,fill:!0,id:!0,xmlns:!0},1);var G=c(Oe);Re=r(G,"path",{d:!0,fill:!0},1),c(Re).forEach(l),G.forEach(l),A.forEach(l),Ue=g(U),$e=r(U,"DIV",{class:!0,id:!0});var J=c($e);Ze=o(J,Ge),J.forEach(l),U.forEach(l),h.forEach(l),d.forEach(l),i.forEach(l),this.h()},h(){p(s,"sveltekit:prefetch",""),p(s,"href",b="/aisles/"+e[0].aisle),p(j,"class","product-name"),p(B,"srcset",H="/"+e[0].image+"-400.webp, /"+e[0].image+"-800.webp 2x"),p(B,"media","(max-width:600px)"),p(B,"type","image/webp"),p(R,"srcset",U="/"+e[0].image+"-400.jpg, /"+e[0].image+"-800.jpg 2x"),p(R,"media","(max-width:600px)"),p(R,"type","image/jpeg"),p(Z,"srcset",A="/"+e[0].image+"-600.webp"),p(Z,"media","(max-width:820px)"),p(Z,"type","image/webp"),p(F,"srcset",P="/"+e[0].image+"-600.jpg"),p(F,"media","(max-width:820px)"),p(F,"type","image/jpeg"),p(q,"srcset",G="/"+e[0].image+"-400.webp"),p(q,"media","(max-width:1600px)"),p(q,"type","image/webp"),p(z,"srcset",J="/"+e[0].image+"-400.jpg"),p(z,"media","(max-width:1600px)"),p(z,"type","image/jpeg"),p(W,"srcset",X="/"+e[0].image+"-600.webp"),p(W,"type","image/webp"),p(_,"srcset",ee="/"+e[0].image+"-600.jpg"),p(_,"type","image/jpeg"),f(se.src,te="/"+e[0].image+"-400.jpg")||p(se,"src",te),p(se,"alt","hi:)"),p(se,"class","bg-image"),p(k,"class","img-container"),p(le,"class","current-price"),p(ce,"class","prices"),p(ne,"d","M5 12H19M3 23H21C22.1046 23 23 22.1046 23 21V3C23 1.89543 22.1046 1 21 1H3C1.89543 1 1 1.89543 1 3V21C1 22.1046 1.89543 23 3 23Z"),p(ne,"stroke","#82172C"),p(me,"viewBox","0 0 24 24"),p(me,"fill","none"),p(me,"xmlns","http://www.w3.org/2000/svg"),p(me,"id","minus"),p(ve,"d","M12 5V12M12 12V19M12 12H5M12 12H19M3 23H21C22.1046 23 23 22.1046 23 21V3C23 1.89543 22.1046 1 21 1H3C1.89543 1 1 1.89543 1 3V21C1 22.1046 1.89543 23 3 23Z"),p(ve,"stroke","#82172C"),p(ue,"viewBox","0 0 24 24"),p(ue,"fill","none"),p(ue,"xmlns","http://www.w3.org/2000/svg"),p(ue,"id","plus"),p(de,"class","quantityPicker"),p(xe,"class","add-to-cart"),p(ye,"class","origin"),p(Re,"d","M5.51288 5.04852L9.41569 0L11 0L6.13115 6H4.88173L0 0L1.59719 0L5.51288 5.04852Z"),p(Re,"fill","#561925"),p(Oe,"viewBox","0 0 11 6"),p(Oe,"fill","none"),p(Oe,"id","arrow"),p(Oe,"xmlns","http://www.w3.org/2000/svg"),p(ke,"class","button"),p($e,"class","text"),p($e,"id","text"),p(De,"class","description"),p(re,"class","information"),p(D,"class","product"),p(a,"class","product-wrapper")},m(t,i){L(t,a,i),d(a,s),d(s,x),d(s,E),d(a,y),d(a,j),d(j,M),d(a,V),d(a,D),d(D,k),d(k,S),d(S,B),d(S,O),d(S,R),d(S,$),d(S,Z),d(S,N),d(S,F),d(S,T),d(S,q),d(S,Q),d(S,z),d(S,K),d(S,W),d(S,Y),d(S,_),d(S,ae),d(S,se),d(D,ie),d(D,re),d(re,ce),Qe&&Qe.m(ce,null),d(ce,oe),d(ce,le),d(le,pe),d(re,Le),d(re,de),d(de,me),d(me,ne),d(de,he),d(de,ge),d(de,fe),d(de,ue),d(ue,ve),d(re,we),d(re,xe),d(xe,Ee),d(re,be),d(re,ye),d(ye,Ce),d(Ce,Ie),d(Ce,je),d(ye,Me),ze&&ze.m(ye,null),d(re,Ve),d(re,De),d(De,ke),d(ke,Se),d(Se,Be),d(ke,He),d(ke,Oe),d(Oe,Re),d(De,Ue),d(De,$e),d($e,Ze),Ae||(Ne=[u(me,"click",e[2]),u(ue,"click",e[3]),u(xe,"click",e[4]),u(ke,"click",e[7])],Ae=!0)},p(e,[a]){1&a&&Fe!==(Fe=e[0].aisle+"")&&m(x,Fe),1&a&&b!==(b="/aisles/"+e[0].aisle)&&p(s,"href",b),1&a&&Pe!==(Pe=e[0].name+"")&&m(M,Pe),1&a&&H!==(H="/"+e[0].image+"-400.webp, /"+e[0].image+"-800.webp 2x")&&p(B,"srcset",H),1&a&&U!==(U="/"+e[0].image+"-400.jpg, /"+e[0].image+"-800.jpg 2x")&&p(R,"srcset",U),1&a&&A!==(A="/"+e[0].image+"-600.webp")&&p(Z,"srcset",A),1&a&&P!==(P="/"+e[0].image+"-600.jpg")&&p(F,"srcset",P),1&a&&G!==(G="/"+e[0].image+"-400.webp")&&p(q,"srcset",G),1&a&&J!==(J="/"+e[0].image+"-400.jpg")&&p(z,"srcset",J),1&a&&X!==(X="/"+e[0].image+"-600.webp")&&p(W,"srcset",X),1&a&&ee!==(ee="/"+e[0].image+"-600.jpg")&&p(_,"srcset",ee),1&a&&!f(se.src,te="/"+e[0].image+"-400.jpg")&&p(se,"src",te),0!=e[0].rebate?Qe?Qe.p(e,a):(Qe=C(e),Qe.c(),Qe.m(ce,oe)):Qe&&(Qe.d(1),Qe=null),3&a&&Te!==(Te="$"+(e[0].price*e[1]-e[0].rebate*e[1]).toFixed(2))&&m(pe,Te),2&a&&m(ge,e[1]),1&a&&qe!==(qe=e[0].origin+"")&&m(je,qe),"Quebec"==e[0].origin?ze||(ze=I(),ze.c(),ze.m(ye,null)):ze&&(ze.d(1),ze=null),1&a&&Ge!==(Ge=e[0].description+"")&&m(Ze,Ge)},i:v,o:v,d(e){e&&l(a),Qe&&Qe.d(),ze&&ze.d(),Ae=!1,w(Ne)}}}async function M({page:e,fetch:a,session:s,context:t}){const i=e.path.split("/")[2],r=await a("/api/productlist").then((e=>e.json())).then((e=>e)),c=await r;let o=[];return c.data.forEach((e=>{o.push(e.data)})),{props:{productList:o,productName:i}}}function V(e,a,s){let t;x(e,y,(e=>s(8,t=e)));let i,r,{productName:c}=a,{productList:o}=a;o.forEach((e=>{c===e.name.split(" ").join("-")&&s(0,i=e)})),console.log(i.aisle),E((()=>{s(1,r=localStorage.getItem(`${c}-qty`)||1)}));return e.$$set=e=>{"productName"in e&&s(5,c=e.productName),"productList"in e&&s(6,o=e.productList)},[i,r,()=>{1!=r&&s(1,r-=1),localStorage.setItem(`${c}-qty`,r)},()=>{s(1,r=parseInt(r)+1),localStorage.setItem(`${c}-qty`,r)},()=>{for(var e=0;e<t.length;e++)if(t[e].name==c)return b(y,t[e].amount=parseInt(t[e].amount)+r,t),!1;t.push(i),b(y,t[t.indexOf(i)].amount=r,t),console.log(t)},c,o,()=>{document.getElementById("text").classList.toggle("active"),document.getElementById("arrow").classList.toggle("active")}]}export default class extends e{constructor(e){super(),a(this,e,V,j,s,{productName:5,productList:6})}}export{M as load};
(()=>{class e{createBarChart(e,t=null){let n=document.createElement("div");n.id="chart";let s=Object.keys(e),a=Object.values(e);for(let e=0;e<s.length;++e){let r=document.createElement("div");r.classList.add("row");let o=document.createElement("div");o.classList.add("label"),o.innerText=s[e];let d=document.createElement("div");d.classList.add("bar-wrapper");let c=document.createElement("div");c.classList.add("bar"),c.style.width=`${a[e]}%`,null!=t&&a[e]>=t&&c.classList.add("unsafe-value"),d.appendChild(c),r.appendChild(o),r.appendChild(d),n.appendChild(r)}return n}}function t(){return document.querySelector("#amsOuterResponse")?.shadowRoot?.querySelector("#amsInnerResponse")}function n(e=!0){e?document.querySelector("#amsOuterResponse").classList.remove("show"):document.querySelector("#amsOuterResponse").classList.add("show"),t().classList.remove("error"),t().classList.remove("thinking"),t().querySelector("#amsContent").innerHTML=""}(async()=>{browser.runtime.onMessage.addListener(async s=>{var a,r,o;if(s?.type)switch(function(){if(document.querySelector("#amsOuterResponse"))return;let e=document.createElement("div");e.id="amsOuterResponse";let t=e.attachShadow({mode:"open"}),s=document.createElement("div");s.id="amsInnerResponse",t.appendChild(s);let a=document.createElement("link");a.rel="stylesheet",a.href=browser.runtime.getURL("/messageDisplay/messageDisplayScripts.css"),s.appendChild(a);let r=document.createElement("img");r.id="amsImage",r.src=browser.runtime.getURL("/images/bot-icon-color-64.webp"),s.appendChild(r);let o=document.createElement("div");o.id="amsContent",s.appendChild(o);let d=document.createElement("img");d.id="amsClose",d.src=browser.runtime.getURL("/images/close-icon.svg"),d.addEventListener("click",()=>n()),s.appendChild(d),document.body.insertBefore(e,document.body.firstChild)}(),s.type){case"addAudio":!function(e){n(!1);let s=new FileReader;s.onload=()=>{let e=s.result,n=document.createElement("audio");n.src=e,n.autoplay=!0,n.controls=!0,t().querySelector("#amsContent").appendChild(n)},s.readAsDataURL(e)}(s.content);break;case"addChart":!function(s){n(!1);let a=new e;t().querySelector("#amsContent").append(a.createBarChart(s,50))}(s.content);break;case"addText":a=s.content,n(!1),t().querySelector("#amsContent").textContent=a;break;case"showError":r=s.content,n(!1),t().classList.add("error"),t().querySelector("#amsContent").textContent=r;break;case"thinking":o=s.content,n(!1),t().classList.add("thinking"),t().querySelector("#amsContent").innerHTML=`${o}<span class="dots"></span>`}})})()})();
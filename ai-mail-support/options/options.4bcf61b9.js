var e=globalThis,r={},o={},t=e.parcelRequire693b;null==t&&((t=function(e){if(e in r)return r[e].exports;if(e in o){var t=o[e];delete o[e];var n={id:e,exports:{}};return r[e]=n,t.call(n.exports,n,n.exports),n.exports}var i=Error("Cannot find module '"+e+"'");throw i.code="MODULE_NOT_FOUND",i}).register=function(e,r){o[e]=r},e.parcelRequire693b=t),t.register;var n=t("9v09t"),i=t("hYzqD");async function l(){let e=document.querySelector("#groqModel"),r=e.value||(await n.getConfig("groq"))?.model;e.innerHTML="",document.querySelector("#groq .description.groq-error-api").classList.remove("show");try{let o=await (0,i.GroqProvider).getLocalModels(document.querySelector("#groqApiKey").value);o.sort((e,r)=>e.localeCompare(r)),o.forEach(o=>{let t=document.createElement("option");t.textContent=o,t.value=o,r&&o==r&&(t.selected=!0),e.appendChild(t)})}catch(e){document.querySelector("#groq .description.groq-error-api").classList.add("show"),document.querySelector("#groq .description.groq-error-api").innerHTML=e.message}}await (0,n.getConfig)("llmProvider")=="groq"&&l(),document.querySelector("#llmProvider").addEventListener("change",e=>{"groq"==e.target.value&&l()}),document.querySelector("#groqListModel").addEventListener("click",async e=>{l()});
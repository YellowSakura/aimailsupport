var e=globalThis,o={},l={},a=e.parcelRequire693b;null==a&&((a=function(e){if(e in o)return o[e].exports;if(e in l){var a=l[e];delete l[e];var r={id:e,exports:{}};return o[e]=r,a.call(r.exports,r,r.exports),r.exports}var t=Error("Cannot find module '"+e+"'");throw t.code="MODULE_NOT_FOUND",t}).register=function(e,o){l[e]=o},e.parcelRequire693b=a),a.register;var r=a("9v09t"),t=a("lp4zK");async function n(){let e=document.querySelector("#ollamaModel"),o=e.value||(await r.getConfig("ollama"))?.model;e.innerHTML="",document.querySelector("#ollama .description.ollama-error-api").classList.remove("show"),document.querySelector("#ollama .description.ollama-warning-no-model").classList.remove("show");try{let l=await (0,t.OllamaProvider).getLocalModels(document.querySelector("#ollamaServiceUrl").value);0!=l.length?(l.sort((e,o)=>e.name.localeCompare(o.name)),l.forEach(l=>{let a=document.createElement("option");a.textContent=l.name,a.value=l.model,o&&l.name==o&&(a.selected=!0),e.appendChild(a)})):document.querySelector("#ollama .description.ollama-warning-no-model").classList.add("show")}catch(e){document.querySelector("#ollama .description.ollama-error-api").classList.add("show")}}await (0,r.getConfig)("llmProvider")=="ollama"&&n(),document.querySelector("#ollamaListModel").addEventListener("click",async e=>{n()});
class e extends HTMLElement{sourceSelect;targetSelect;moveRightButton;moveLeftButton;constructor(){super();let e=this.attachShadow({mode:"open"}),t=document.createElement("style");t.textContent=`
            .container {
                align-items: center;
                display: flex;

                select {
                    flex: 1;
                    height: 120px;
                }

                .button-container {
                    display: flex;
                    flex-direction: column;

                    button {
                        padding: 0 8px;
                        margin: 5px;
                    }
                }
            }
        `;let n=document.createElement("div");n.className="container",this.sourceSelect=document.createElement("select",{is:"language-selector"}),this.sourceSelect.multiple=!0;let l=document.createElement("div");l.className="button-container",this.moveRightButton=document.createElement("button"),this.moveRightButton.textContent="→",this.moveLeftButton=document.createElement("button"),this.moveLeftButton.textContent="←",l.append(this.moveRightButton,this.moveLeftButton),this.targetSelect=document.createElement("select"),this.targetSelect.multiple=!0,n.append(this.sourceSelect,l,this.targetSelect),e.append(t,n),this.moveRightButton.addEventListener("click",()=>this.moveSelected(!0)),this.moveLeftButton.addEventListener("click",()=>this.moveSelected(!1)),this.targetSelect.addEventListener("change",()=>this.dispatchEvent(new Event("change")))}moveSelected(e){let t=e?this.sourceSelect:this.targetSelect,n=e?this.targetSelect:this.sourceSelect;Array.from(t.selectedOptions).forEach(e=>{t.removeChild(e),n.appendChild(e)});let l=Array.from(n.options).toSorted((e,t)=>{let n=e.textContent||"",l=t.textContent||"";return n.localeCompare(l)});n.replaceChildren(...l)}get value(){return this.targetSelect.value}set value(e){this.targetSelect.value=e}get selectedIndex(){return this.targetSelect.selectedIndex}set selectedIndex(e){this.targetSelect.selectedIndex=e}get options(){return this.targetSelect.options}get selectedOptions(){return this.targetSelect.selectedOptions}getValues(){return Array.from(this.targetSelect.options).map(e=>e.value)}setValues(e){let t=[...Array.from(this.sourceSelect.options),...Array.from(this.targetSelect.options)],n=(e,t)=>(e.textContent||"").localeCompare(t.textContent||""),l=t.filter(t=>!e.includes(t.value)).sort(n),o=t.filter(t=>e.includes(t.value)).sort(n);this.sourceSelect.replaceChildren(...l),this.targetSelect.replaceChildren(...o),this.dispatchEvent(new Event("change"))}}customElements.define("multiple-language-selector",e);
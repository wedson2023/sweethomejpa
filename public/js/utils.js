const toast = (text, time = 3150) => {

    const style = `
        padding: 12px;
        border-radius: 1em;
        background-color: rgb(0 0 0 / 70%); 
        color: #fff;
        font-weight: 500;
        text-align: center;
        font-size: 0.9em;
        position: fixed;
        z-index: 300;
        left: 50%;
        width: 70%;
        margin-left: -35%;
        transition-duration: 0.5s;
    `;

    const p = document.createElement('p');
    p.innerText = text;
    p.style.cssText = `
        opacity: 0;
        bottom: 10%;
        visibility: hidden;
        ${style}
    `;

    document.body.appendChild(p);

    setTimeout(() => {

        p.style.cssText = `
            opacity: 1;
            visibility: visible;
            bottom: 15%;  
            ${style}              
        `;

    }, 150);

    setTimeout(() => {

        p.style.cssText = `
            opacity: 0;
            visibility: hidden;
            bottom: 10%;   
            ${style}             
        `;

        setTimeout(() => p.remove(), 500);

    }, time);
}
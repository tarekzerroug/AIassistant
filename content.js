alert("welcome to my webextension")

const style = document.createElement("style");
style.innerHTML = `
    ::selection {
        background: transparent !important;
        color: inherit !important;
    }
`;
document.head.appendChild(style);


document.addEventListener("keydown", (e) => {
    
    if (e.key ="Tab") {
    const text = window.getSelection().toString().trim();
    if (text.length > 0) {
        console.log("Selected text:", text);
    }}
});
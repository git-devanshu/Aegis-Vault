(function () {
    if (document.getElementById("aegis-extension-frame")) return;
  
    const iframe = document.createElement("iframe");
    iframe.id = "aegis-extension-frame";
    iframe.src = chrome.runtime.getURL("index.html");
  
    Object.assign(iframe.style, {
        position: "fixed",
        top: "20px",
        right: "20px",
        width: "270px",
        height: "100px",  
        zIndex: "2147483647",
        display: "none",
        colorScheme: "none",
        background: "transparent",
        
        border: "1px solid rgba(255, 255, 255, 0.15)",
        borderRadius: "16px",
        boxShadow: "0 12px 40px rgba(0, 0, 0, 0.5)",
        overflow: "hidden"
    });
  
    document.body.appendChild(iframe);

    const closePopupSecurely = () => {
        if (iframe.contentWindow) {
            iframe.contentWindow.postMessage({ type: "AEGIS_CLOSE_REQUEST" }, "*");
        }
        iframe.style.display = "none";
    };
  
    window.addEventListener("message", (event) => {
        if (event.data && event.data.type === "AEGIS_RESIZE") {
            iframe.style.height = `${event.data.height}px`;
        }
        
        if (event.data && event.data.type === "AEGIS_CLOSE") {
            closePopupSecurely();
        }
    });

    document.addEventListener("click", (event) => {
        if (iframe.style.display === "block" && event.target !== iframe) {
            closePopupSecurely();
        }
    });
  
    chrome.runtime.onMessage.addListener((message) => {
        if (message.type === "TOGGLE_AEGIS_POPUP") {
            const isOpening = iframe.style.display === "none";
            
            if (isOpening) {
                iframe.style.display = "block";
                if (iframe.contentWindow) {
                    iframe.contentWindow.postMessage({ type: "AEGIS_PANEL_OPENED" }, "*");
                }
            } 
            else {
                closePopupSecurely();
            }
        }
    });
    
})();

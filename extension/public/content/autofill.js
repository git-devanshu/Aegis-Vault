chrome.runtime.onMessage.addListener((message, sender, sendResponse) =>{
    if(message.type !== "AUTOFILL_PASSWORD"){
        return;
    }

    try{
        const passwordField = document.querySelector('input[type="password"]');
        if(!passwordField){
            sendResponse({ success: false, message: "Password field not found." });
            return;
        }

        passwordField.focus();
        passwordField.value = message.password;

        passwordField.dispatchEvent(
            new Event("input", {bubbles: true})
        );

        passwordField.dispatchEvent(
            new Event("change", {bubbles: true})
        );

        sendResponse({ success: true });
    }
    catch(error){
        console.error(error);
        sendResponse({ success: false });
    }

    return true;
});

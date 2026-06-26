export async function autofillPassword(password){
    const [tab] = await chrome.tabs.query({
        active: true,
        currentWindow: true
    });

    if(!tab?.id){
        return;
    }

    await chrome.scripting.executeScript({
        target: {
            tabId: tab.id
        },
        files: [
            "content/autofill.js"
        ]
    });

    await chrome.tabs.sendMessage(tab.id,{
        type: "AUTOFILL_PASSWORD",
        password
    });

}

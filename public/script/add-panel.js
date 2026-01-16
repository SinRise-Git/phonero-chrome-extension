document.addEventListener("DOMContentLoaded", function () {
    function loadPanels() {
        chrome.storage.local.get(['panels'], function (result) {
            const panel = document.querySelector(".panelList");
            const panelDisplay = document.querySelector(".panelList h2");
            const panelContainer = document.querySelector(".panelContainer");
            panelDisplay.textContent = `Panel Liste (${result.panels.length})`;
            panelContainer.replaceChildren();

            if (result.panels && result.panels.length > 0) {
                panel.style.display = "block";
                result.panels.forEach(panel => {
                    const panelDiv = document.createElement("div");
                    const buttonDiv = document.createElement("div");
                    const panelName = document.createElement("p");
                    const deleteButton = document.createElement("button");
                    const clearButton = document.createElement("button");

                    panelDiv.className = "panelItem";
                    panelDiv.id = panel.id;
                    panelName.textContent = panel.name;

                    buttonDiv.className = "panelButtonContainer";

                    deleteButton.innerText = "Slett";
                    deleteButton.className = "deleteButton";
                    clearButton.innerText = "Tøm";

                    panelName.addEventListener("click", function () {
                        const form = document.createElement("form");
                        const inputField = document.createElement("input");
                        inputField.type = "text";
                        inputField.value = panel.name;

                        form.addEventListener("submit", function (e) {
                            const newName = inputField.value;
                            chrome.storage.local.get(['panels'], function (result) {
                                let updatedPanels = (result.panels || []).map(p => {
                                    if (p.id === panel.id) {
                                        return { ...p, name: newName };
                                    }
                                    return p;
                                });
                                chrome.storage.local.set({ panels: updatedPanels }, function () {
                                    loadPanels();
                                });
                            });
                        });
                        form.appendChild(inputField);
                        panelDiv.replaceChild(form, panelName);

                    });

                    deleteButton.addEventListener("click", function () {
                        const panelId = panel.id;
                        chrome.storage.local.get(['panels'], function (result) {
                            let updatedPanels = (result.panels || []).filter(panel => panel.id !== panelId);
                            chrome.storage.local.set({ panels: updatedPanels }, function () {
                                loadPanels();
                            });
                        });
                    })

                    clearButton.addEventListener("click", function () {
                        chrome.storage.local.get(['panels'], function (result) {
                            let updatedPanels = (result.panels || []).map(p => {
                                if (p.id === panel.id) {
                                    return { ...p, content: "" };
                                }
                                return p;
                            });
                            chrome.storage.local.set({ panels: updatedPanels }, function () {
                                loadPanels();
                            });
                        });
                    });
                    buttonDiv.replaceChildren(clearButton, deleteButton);
                    panelDiv.replaceChildren(panelName, buttonDiv);
                    panelContainer.appendChild(panelDiv);
                });
            } else {
                panel.style.display = "none";
            }
        });
    }

    document.getElementById("addPanelButton").addEventListener("click", function () {
        const panelName = document.getElementById("addPanelInput").value;
        if (!panelName || panelName.trim() === "") return;
        chrome.storage.local.get(['panels'], function (result) {
            let newPanels = result.panels || [];
            newPanels.push({ name: panelName, id: crypto.randomUUID(), content: "" });
            chrome.storage.local.set({ panels: newPanels }, function () {
                loadPanels();
            });
        });
        document.getElementById("addPanelInput").value = "";
    });
    loadPanels();
});
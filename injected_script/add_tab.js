(() => {
    const observer = new MutationObserver((mutations, observer) => {
        const tabList = document.querySelector('.info .header-box .tab-item-list.clearfix');
        const panelList = document.querySelectorAll('.current-call-info .info > div')[1];

        if (tabList && panelList) {
            addCustomTabButton(tabList, panelList);
            observer.disconnect();
        }
    });

    observer.observe(document, {
        childList: true,
        subtree: true,
    });

    function getPanelsFromStorage() {
        return new Promise((resolve, reject) => {
            chrome.storage.local.get(['panels'], result => {
                if (chrome.runtime.lastError) {
                    reject(chrome.runtime.lastError);
                    return;
                }

                resolve(result.panels);
            });
        });
    }

    async function addCustomTabButton(tabList, panelList) {
        const panels = await getPanelsFromStorage();

        if (!Array.isArray(panels)) {
            console.log('No panels found');
            return;
        }

        panels.forEach(panel => {
            if (document.getElementById(panel.id)) return;

            const panelButton = document.createElement('button');
            panelButton.className = 'tab-item';
            panelButton.id = panel.id;

            const span = document.createElement('span');
            span.textContent = panel.name;
            panelButton.appendChild(span);

            tabList.insertBefore(panelButton, tabList.lastElementChild);

            const tabDiv = document.createElement('div');
            tabDiv.className = 'info-content';
            tabDiv.id = panel.id;
            tabDiv.style.display = 'none';
            const mainContent= document.createElement('div');
            mainContent.className = 'infoview';
            tabDiv.appendChild(mainContent);

            const displayText= document.createElement('p');
            displayText.className = 'panel-content-text';
            displayText.innerText = panel.content || 'Ingen innhold lagt til ennå i dette panelet.';

            const editButton = document.createElement('button');
            editButton.className = 'custom-panel-button';
            editButton.innerText = 'Rediger';

            mainContent.replaceChildren(displayText, editButton);
            panelList.insertBefore(tabDiv, panelList.children[panelList.children.length - 1]);

            editButton.addEventListener('click', () => {
                chrome.storage.local.get(['panels'], function (result) {
                    editButton.parentElement.replaceChildren();
                    const editDiv = document.createElement('div');
                    editDiv.className = 'panel-edit-div';
                    
                    const textarea = document.createElement('textarea');
                    textarea.value = result.panels.find(p => p.id === panel.id)?.content || '';
                    textarea.id = 'panel-edit-textarea';

                    editDiv.replaceChildren(textarea);
                    
                    const saveButton = document.createElement('button');
                    saveButton.className = 'custom-panel-button';
                    saveButton.innerText = 'Lagre';

                    saveButton.addEventListener('click', () => {
                        const newContent = textarea.value;
                        let updatedPanels = (panels || []).map(p => {
                            if (p.id === panel.id) {
                                return { ...p, content: newContent };
                            }
                            return p;
                        });
                        chrome.storage.local.set({ panels: updatedPanels }, () => {
                            if (chrome.runtime.lastError) {
                                console.error('Error saving panels:', chrome.runtime.lastError);
                            } else {
                                console.log('Panels updated successfully');
                            }
                        });
                        displayText.innerText = textarea.value.trim() === '' ? 'Ingen innhold lagt til ennå i dette panelet.' : textarea.value;;
                        mainContent.replaceChildren(displayText, editButton);

                    });
                   
                    const cancelButton = document.createElement('button');
                    cancelButton.className = 'custom-panel-button';
                    cancelButton.innerText = 'Avbryt';
                    cancelButton.addEventListener('click', () => {
                        mainContent.replaceChildren(displayText, editButton);
                    });

                    mainContent.replaceChildren(editDiv, saveButton, cancelButton);
                });
            });
        });

        tabList.addEventListener('click', (event) => {
            if (event.target.classList.contains('tab-item') || event.target.parentElement.classList.contains('tab-item')) {
                let correctElemet = event.target;
                const allTabs = document.querySelectorAll('.tab-item-list.clearfix .tab-item')
                allTabs.forEach(tab => {
                    tab.classList.remove('active');
                });
                if (event.target.classList.contains('tab-item')) {
                    event.target.classList.add('active');
                } else {
                    event.target.parentElement.classList.add('active');
                    correctElemet = event.target.parentElement;
                }
                panelList.querySelectorAll(':scope > div').forEach(panel => {
                    panel.style.display = 'none';
                });
                const tabButtons = [...allTabs];
                const tabButtonsIndex = tabButtons.indexOf(correctElemet);
                panelList.children[tabButtonsIndex].removeAttribute('style');

            }
        });
    }
})();

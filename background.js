chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status !== 'complete') return;

  const url = tab.url || tab.pendingUrl;
  if (!url?.startsWith('https://bn.phonero.no/')) return;

  chrome.scripting.insertCSS({
    target: { tabId },
    files: ['styles/custom.css']
  }).catch(err => {
    console.error('CSS injection failed:', err);
  });

  chrome.scripting.executeScript({
    target: { tabId },
    files: ['injected_script/add_tab.js']
  }).catch(err => {
    console.error('Script injection failed:', err);
  });
});

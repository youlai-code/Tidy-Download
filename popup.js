document.addEventListener('DOMContentLoaded', () => {
  const toggle = document.getElementById('toggle');
  const statusText = document.getElementById('statusText');
  const openOptions = document.getElementById('openOptions');

  chrome.storage.local.get(['autoClassifyEnabled'], (result) => {
    const enabled = result.autoClassifyEnabled !== false;
    toggle.checked = enabled;
    statusText.textContent = enabled ? '智能分类：已开启' : '智能分类：已暂停';
  });

  toggle.addEventListener('change', () => {
    const enabled = toggle.checked;
    chrome.storage.local.set({ autoClassifyEnabled: enabled });
    statusText.textContent = enabled ? '智能分类：已开启' : '智能分类：已暂停';
  });

  openOptions.addEventListener('click', () => {
    chrome.runtime.openOptionsPage();
  });
});

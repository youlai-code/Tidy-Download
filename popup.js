document.addEventListener('DOMContentLoaded', () => {
  const openBtn = document.getElementById('openBtn');
  openBtn.addEventListener('click', () => {
    chrome.tabs.create({ url: 'manager.html' });
  });
});

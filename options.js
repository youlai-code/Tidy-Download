const defaultRules = [
  { id: "Images", label: "图片", folder: "Images", exts: ["jpg", "jpeg", "png", "gif", "webp", "svg"], builtin: true },
  { id: "Documents", label: "文档", folder: "Documents", exts: ["pdf", "doc", "docx", "xls", "xlsx", "ppt", "pptx", "txt", "md"], builtin: true },
  { id: "Videos", label: "视频", folder: "Videos", exts: ["mp4", "mkv", "avi", "mov", "wmv"], builtin: true },
  { id: "Audio", label: "音频", folder: "Audio", exts: ["mp3", "wav", "flac", "m4a"], builtin: true },
  { id: "Archives", label: "压缩包", folder: "Archives", exts: ["zip", "rar", "7z", "tar", "gz"], builtin: true },
  { id: "Programs", label: "程序", folder: "Programs", exts: ["exe", "msi", "bat", "dmg", "pkg", "deb"], builtin: true }
];

const defaultConfig = {
  version: 1,
  rules: defaultRules,
  unmatchedAction: "others",
  unmatchedFolder: "Others"
};

document.addEventListener('DOMContentLoaded', () => {
  restoreOptions();
  document.getElementById('saveBtn').addEventListener('click', saveOptions);
  document.getElementById('exportBtn').addEventListener('click', exportRules);
  document.getElementById('importBtn').addEventListener('click', () => {
    document.getElementById('importFile').click();
  });
  document.getElementById('importFile').addEventListener('change', importRules);
  document.getElementById('addRuleBtn').addEventListener('click', addRule);
  document.getElementById('unmatchedAction').addEventListener('change', toggleUnmatchedFolderInput);
});

function restoreOptions() {
  chrome.storage.local.get(['rulesConfig', 'userRules'], (result) => {
    const config = normalizeConfig(result.rulesConfig || result.userRules || defaultConfig);
    renderConfig(config);
  });
}

function saveOptions() {
  const rules = collectRulesFromForm();
  const unmatchedAction = document.getElementById('unmatchedAction').value;
  const unmatchedFolder = sanitizeFolderName(document.getElementById('unmatchedFolder').value) || "Others";

  const config = {
    version: 1,
    rules,
    unmatchedAction,
    unmatchedFolder
  };

  chrome.storage.local.set({ rulesConfig: config }, () => {
    showStatus("已保存");
  });
}

function renderConfig(config) {
  renderRules(config.rules);
  document.getElementById('unmatchedAction').value = config.unmatchedAction || "others";
  document.getElementById('unmatchedFolder').value = config.unmatchedFolder || "Others";
  toggleUnmatchedFolderInput();
}

function renderRules(rules) {
  const container = document.getElementById('rulesContainer');
  container.innerHTML = '';

  rules.forEach(rule => {
    const div = document.createElement('div');
    div.className = 'rule-group';
    div.dataset.ruleId = rule.id;
    div.innerHTML = `
      <div class="rule-header">
        <div class="rule-title">分类设置</div>
        ${rule.builtin ? '' : '<button class="btn btn-danger btn-mini remove-rule">删除</button>'}
      </div>
      <label class="rule-label">分类名称</label>
      <input class="rule-input rule-name" type="text" value="${rule.label || rule.id}">
      <label class="rule-label">文件夹名称</label>
      <input class="rule-input rule-folder" type="text" value="${rule.folder}">
      <label class="rule-label">扩展名（英文逗号分隔）</label>
      <textarea class="rule-textarea">${(rule.exts || []).join(', ')}</textarea>
    `;
    container.appendChild(div);

    const removeBtn = div.querySelector('.remove-rule');
    if (removeBtn) {
      removeBtn.addEventListener('click', () => {
        div.remove();
      });
    }
  });
}

function collectRulesFromForm() {
  const groups = document.querySelectorAll('.rule-group');
  const rules = [];
  groups.forEach(group => {
    const id = group.dataset.ruleId || `custom_${Date.now()}`;
    const label = (group.querySelector('.rule-name')?.value || id).trim();
    const folder = sanitizeFolderName(group.querySelector('.rule-folder')?.value || label) || id;
    const extsText = group.querySelector('.rule-textarea')?.value || '';
    const exts = extsText.split(',').map(e => e.trim().toLowerCase()).filter(Boolean);
    const builtin = defaultRules.some(r => r.id === id);
    rules.push({ id, label, folder, exts, builtin });
  });
  return mergeWithDefaults(rules);
}

function addRule() {
  const rules = collectRulesFromForm();
  const id = `custom_${Date.now()}`;
  rules.push({
    id,
    label: "自定义",
    folder: "Custom",
    exts: [],
    builtin: false
  });
  renderRules(rules);
}

function exportRules() {
  chrome.storage.local.get(['rulesConfig', 'userRules'], (result) => {
    const config = normalizeConfig(result.rulesConfig || result.userRules || defaultConfig);
    const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'download-rules.json';
    a.click();
    URL.revokeObjectURL(url);
  });
}

function importRules(event) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const parsed = JSON.parse(reader.result);
      const config = normalizeConfig(parsed);
      chrome.storage.local.set({ rulesConfig: config }, () => {
        renderConfig(config);
        showStatus("导入成功");
      });
    } catch (e) {
      showStatus("导入失败");
    } finally {
      event.target.value = '';
    }
  };
  reader.readAsText(file);
}

function normalizeConfig(rawConfig) {
  const config = {
    version: 1,
    rules: [...defaultRules],
    unmatchedAction: "others",
    unmatchedFolder: "Others"
  };

  if (!rawConfig) return config;

  if (rawConfig.unmatchedAction) {
    config.unmatchedAction = rawConfig.unmatchedAction;
  }
  if (rawConfig.unmatchedFolder) {
    config.unmatchedFolder = rawConfig.unmatchedFolder;
  }

  if (Array.isArray(rawConfig.rules)) {
    config.rules = normalizeRulesArray(rawConfig.rules);
  } else if (Array.isArray(rawConfig)) {
    config.rules = normalizeRulesArray(rawConfig);
  } else if (typeof rawConfig === "object") {
    config.rules = normalizeRulesFromObject(rawConfig);
  }

  config.rules = mergeWithDefaults(config.rules);
  return config;
}

function normalizeRulesArray(rules) {
  return rules
    .filter(Boolean)
    .map((rule, index) => ({
      id: rule.id || `custom_${index}`,
      label: rule.label || rule.id || `自定义${index + 1}`,
      folder: rule.folder || rule.id || `custom_${index}`,
      exts: Array.isArray(rule.exts) ? rule.exts.map(normalizeExt).filter(Boolean) : [],
      builtin: !!rule.builtin
    }));
}

function normalizeRulesFromObject(obj) {
  return Object.entries(obj)
    .filter(([, value]) => Array.isArray(value) || (value && Array.isArray(value.exts)))
    .map(([key, value]) => ({
      id: key,
      label: key,
      folder: value.folder || key,
      exts: (value.exts || value).map(normalizeExt).filter(Boolean),
      builtin: defaultRules.some(r => r.id === key)
    }));
}

function mergeWithDefaults(rules) {
  const map = new Map();
  defaultRules.forEach(rule => {
    map.set(rule.id, { ...rule });
  });
  rules.forEach(rule => {
    if (!rule || !rule.id) return;
    const merged = { ...(map.get(rule.id) || {}), ...rule };
    merged.builtin = defaultRules.some(r => r.id === merged.id);
    map.set(rule.id, merged);
  });
  return Array.from(map.values());
}

function normalizeExt(ext) {
  return String(ext || "").trim().toLowerCase();
}

function sanitizeFolderName(name) {
  return String(name || "")
    .replace(/[\\/:*?"<>|]+/g, "_")
    .trim();
}

function toggleUnmatchedFolderInput() {
  const action = document.getElementById('unmatchedAction').value;
  const input = document.getElementById('unmatchedFolder');
  input.disabled = action !== 'others';
}

function showStatus(text) {
  const status = document.getElementById('status');
  status.textContent = text;
  status.style.display = 'inline';
  setTimeout(() => {
    status.style.display = 'none';
  }, 2000);
}

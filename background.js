// 默认分类逻辑，当 storage 为空时使用
const defaultRules = [
  { 
    id: "Images", 
    folder: "Images", 
    exts: ["png", "jpg", "jpeg", "webp", "gif", "svg", "ico", "heic"] 
  },
  { 
    id: "Documents", 
    folder: "Documents", 
    exts: ["pdf", "doc", "docx", "xls", "xlsx", "ppt", "pptx", "txt", "md", "csv"] 
  },
  { 
    id: "Videos", 
    folder: "Videos", 
    exts: ["mp4", "mov", "mkv", "webm", "avi"] 
  },
  { 
    id: "Audio", 
    folder: "Music", 
    exts: ["mp3", "wav", "ogg", "flac", "m4a"] 
  },
  { 
    id: "Archives", 
    folder: "Archives", 
    exts: ["zip", "rar", "7z", "tar", "gz", "iso"] 
  },
  { 
    id: "Apps", 
    folder: "Apps", 
    exts: ["exe", "dmg", "pkg", "msi", "apk", "deb"] 
  }
];

const defaultConfig = {
  version: 1,
  rules: defaultRules,
  unmatchedAction: "others",
  unmatchedFolder: "Others"
};

chrome.downloads.onDeterminingFilename.addListener((item, suggest) => {
  chrome.storage.local.get(['rulesConfig', 'userRules', 'autoClassifyEnabled'], (result) => {
    const enabled = result.autoClassifyEnabled !== false;
    if (!enabled) {
      suggest({
        filename: item.filename,
        conflictAction: "uniquify"
      });
      return;
    }

    const config = normalizeConfig(result.rulesConfig || result.userRules || defaultConfig);
    const rules = config.rules;
    const filenameParts = item.filename.split('.');
    const extension = filenameParts.length > 1 ? filenameParts.pop().toLowerCase() : '';

    let subFolder = "";

    if (extension) {
      for (const rule of rules) {
        if (rule.exts.includes(extension)) {
          subFolder = sanitizeFolderName(rule.folder);
          break;
        }
      }
    }

    if (!subFolder) {
      if (config.unmatchedAction === "others") {
        subFolder = sanitizeFolderName(config.unmatchedFolder || "Others");
      }
    }

    const cleanFilename = item.filename.replace(/\\/g, '/');
    const finalPath = subFolder ? `${subFolder}/${cleanFilename}` : cleanFilename;

    suggest({
      filename: finalPath,
      conflictAction: "uniquify"
    });
  });

  return true;
});

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
      folder: rule.folder || rule.id || `custom_${index}`,
      exts: Array.isArray(rule.exts) ? rule.exts.map(normalizeExt).filter(Boolean) : []
    }));
}

function normalizeRulesFromObject(obj) {
  return Object.entries(obj)
    .filter(([, value]) => Array.isArray(value) || (value && Array.isArray(value.exts)))
    .map(([key, value]) => ({
      id: key,
      folder: value.folder || key,
      exts: (value.exts || value).map(normalizeExt).filter(Boolean)
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

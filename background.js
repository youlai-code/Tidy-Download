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
  version: 2,
  organizeMode: "type",
  dateFolderPattern: "flat",
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
    const subFolder = resolveTargetFolder(item, config);
    const cleanFilename = sanitizeRelativePath(item.filename);
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
    version: 2,
    organizeMode: "type",
    dateFolderPattern: "flat",
    rules: [...defaultRules],
    unmatchedAction: "others",
    unmatchedFolder: "Others"
  };

  if (!rawConfig) return config;

  if (rawConfig.organizeMode === "date") {
    config.organizeMode = "date";
  }
  if (rawConfig.dateFolderPattern === "nested") {
    config.dateFolderPattern = "nested";
  }
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

function resolveTargetFolder(item, config) {
  if (config.organizeMode === "date") {
    return buildDateFolder(item.startTime, config.dateFolderPattern);
  }

  const extension = getFileExtension(item.filename);
  let subFolder = "";

  if (extension) {
    for (const rule of config.rules) {
      if (rule.exts.includes(extension)) {
        subFolder = sanitizeRelativePath(rule.folder);
        break;
      }
    }
  }

  if (!subFolder && config.unmatchedAction === "others") {
    subFolder = sanitizeRelativePath(config.unmatchedFolder || "Others");
  }

  return subFolder;
}

function getFileExtension(filename) {
  const cleanFilename = String(filename || "").replace(/\\/g, "/").split("/").pop() || "";
  const filenameParts = cleanFilename.split(".");
  return filenameParts.length > 1 ? filenameParts.pop().toLowerCase() : "";
}

function buildDateFolder(startTime, pattern) {
  const downloadDate = startTime ? new Date(startTime) : new Date();
  if (Number.isNaN(downloadDate.getTime())) {
    return "";
  }

  const year = String(downloadDate.getFullYear());
  const month = String(downloadDate.getMonth() + 1).padStart(2, "0");
  const folder = pattern === "nested" ? `${year}/${month}` : `${year}-${month}`;
  return sanitizeRelativePath(folder);
}

function sanitizeRelativePath(value) {
  return String(value || "")
    .replace(/\\/g, "/")
    .split("/")
    .map(sanitizePathSegment)
    .filter(Boolean)
    .join("/");
}

function sanitizePathSegment(segment) {
  const sanitized = String(segment || "")
    .replace(/[\\:*?"<>|]+/g, "_")
    .trim();

  if (!sanitized || sanitized === "." || sanitized === "..") {
    return "";
  }

  return sanitized;
}

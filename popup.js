// 多语言字典
const i18n = {
  "zh-CN": {
    app_name: "下载自动归类助手",
    status_on: "正在运行",
    status_off: "已暂停",
    title_settings: "打开设置",
    strategy_label: "当前策略",
    strategy_type: "按类型分类",
    strategy_date_flat: "按时间分类 · YYYY-MM",
    strategy_date_nested: "按时间分类 · YYYY/MM"
  },
  "zh-TW": {
    app_name: "下載自動歸類助手",
    status_on: "正在運行",
    status_off: "已暫停",
    title_settings: "打開設置",
    strategy_label: "目前策略",
    strategy_type: "按類型分類",
    strategy_date_flat: "按時間分類 · YYYY-MM",
    strategy_date_nested: "按時間分類 · YYYY/MM"
  },
  "en": {
    app_name: "TidyDownload",
    status_on: "Running",
    status_off: "Paused",
    title_settings: "Settings",
    strategy_label: "Current Strategy",
    strategy_type: "By type",
    strategy_date_flat: "By date · YYYY-MM",
    strategy_date_nested: "By date · YYYY/MM"
  },
  "ja": {
    app_name: "自動整理",
    status_on: "実行中",
    status_off: "一時停止",
    title_settings: "設定"
  },
  "ko": {
    app_name: "자동 정리",
    status_on: "실행 중",
    status_off: "일시 중지",
    title_settings: "설정"
  },
  "fr": {
    app_name: "TidyDownload",
    status_on: "En cours",
    status_off: "En pause",
    title_settings: "Paramètres"
  },
  "es": {
    app_name: "TidyDownload",
    status_on: "Ejecutando",
    status_off: "Pausado",
    title_settings: "Configuración"
  },
  "ar": {
    app_name: "TidyDownload",
    status_on: "يعمل",
    status_off: "متوقف",
    title_settings: "الإعدادات"
  },
  "pt": {
    app_name: "TidyDownload",
    status_on: "Executando",
    status_off: "Pausado",
    title_settings: "Configurações"
  },
  "ru": {
    app_name: "TidyDownload",
    status_on: "Запущен",
    status_off: "Приостановлен",
    title_settings: "Настройки"
  },
  "de": {
    app_name: "TidyDownload",
    status_on: "Läuft",
    status_off: "Pausiert",
    title_settings: "Einstellungen"
  },
  "id": {
    app_name: "TidyDownload",
    status_on: "Berjalan",
    status_off: "Dijeda",
    title_settings: "Pengaturan"
  },
  "th": {
    app_name: "TidyDownload",
    status_on: "กำลังทำงาน",
    status_off: "หยุดชั่วคราว",
    title_settings: "การตั้งค่า"
  },
  "vi": {
    app_name: "TidyDownload",
    status_on: "Đang chạy",
    status_off: "Đã tạm dừng",
    title_settings: "Cài đặt"
  },
  "tr": {
    app_name: "TidyDownload",
    status_on: "Çalışıyor",
    status_off: "Duraklatıldı",
    title_settings: "Ayarlar"
  },
  "it": {
    app_name: "TidyDownload",
    status_on: "In esecuzione",
    status_off: "In pausa",
    title_settings: "Impostazioni"
  },
  "pl": {
    app_name: "TidyDownload",
    status_on: "Działa",
    status_off: "Wstrzymano",
    title_settings: "Ustawienia"
  },
  "nl": {
    app_name: "TidyDownload",
    status_on: "Actief",
    status_off: "Gepauzeerd",
    title_settings: "Instellingen"
  },
  "sv": {
    app_name: "TidyDownload",
    status_on: "Körs",
    status_off: "Pausad",
    title_settings: "Inställningar"
  },
  "hi": {
    app_name: "TidyDownload",
    status_on: "चल रहा है",
    status_off: "रुका हुआ",
    title_settings: "सेटिंग्स"
  },
  "el": {
    app_name: "TidyDownload",
    status_on: "Εκτελείται",
    status_off: "Σε παύση",
    title_settings: "Ρυθμίσεις"
  }
};

document.addEventListener('DOMContentLoaded', () => {
  const els = {
    toggle: document.getElementById('toggle'),
    status: document.getElementById('statusText'),
    strategy: document.getElementById('strategyText'),
    btnSettings: document.getElementById('btnSettings')
  };

  // 1. 获取配置 (开关状态 + 语言设置)
  chrome.storage.local.get(['autoClassifyEnabled', 'rulesConfig'], (result) => {
    // 获取语言：优先取 rulesConfig.language，没有则默认 zh-CN
    const lang = (result.rulesConfig && result.rulesConfig.language) || 'zh-CN';
    
    // 初始化界面语言
    updateLanguage(lang);

    // 获取开关状态：默认为 true
    const enabled = result.autoClassifyEnabled !== false;
    els.toggle.checked = enabled;
    updateStatusText(enabled, lang);
    updateStrategyText(result.rulesConfig, lang);
  });

  // 2. 监听开关切换
  els.toggle.addEventListener('change', () => {
    const enabled = els.toggle.checked;
    
    // 保存状态
    chrome.storage.local.set({ autoClassifyEnabled: enabled });
    
    // 重新获取语言以更新状态文本（防止闭包里的 lang 过期）
    chrome.storage.local.get(['rulesConfig'], (res) => {
       const lang = (res.rulesConfig && res.rulesConfig.language) || 'zh-CN';
       updateStatusText(enabled, lang);
    });
  });

  // 3. 点击设置图标 -> 打开 Options 页面
  els.btnSettings.addEventListener('click', () => {
    chrome.runtime.openOptionsPage();
  });

  // --- 辅助函数 ---

  function updateLanguage(lang) {
    document.querySelectorAll('[data-i18n]').forEach((element) => {
      element.textContent = getText(lang, element.dataset.i18n);
    });

    els.btnSettings.title = getText(lang, 'title_settings');
    
    // RTL 支持
    document.body.dir = lang === 'ar' ? 'rtl' : 'ltr';
  }

  function updateStatusText(enabled, lang) {
    if (enabled) {
      els.status.textContent = getText(lang, 'status_on');
      els.status.className = 'status-text active'; // 添加绿色样式
    } else {
      els.status.textContent = getText(lang, 'status_off');
      els.status.className = 'status-text'; // 灰色默认样式
    }
  }

  function updateStrategyText(config, lang) {
    const organizeMode = config && config.organizeMode === 'date' ? 'date' : 'type';
    const dateFolderPattern = config && config.dateFolderPattern === 'nested' ? 'nested' : 'flat';
    const key = organizeMode === 'date'
      ? (dateFolderPattern === 'nested' ? 'strategy_date_nested' : 'strategy_date_flat')
      : 'strategy_type';

    els.strategy.textContent = getText(lang, key);
  }

  function getText(lang, key) {
    return (i18n[lang] && i18n[lang][key]) || (i18n.en && i18n.en[key]) || key;
  }
});

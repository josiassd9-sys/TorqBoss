import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

const resources = {
  pt: {
    translation: {
      "app_name": "torqboss - Meu Carro Top",
      "app_subtitle": "— Meu Carro Top",
      "import_vehicle": "Importar Veículo",
      "add_vehicle": "Adicionar Veículo",
      "settings": "Configurações",
      "odometer_scan": "Escanear Odômetro",
      "mileage": "KM",
      "last_mileage": "Última KM registrada",
      "scan_success": "KM detectada com sucesso!",
      "confirm": "Confirmar",
      "cancel": "Cancelar",
      "save": "Salvar",
      "vehicles": "Veículos",
      "maintenance": "Manutenção",
      "fuel": "Combustível",
      "catalog": "Catálogo de Peças",
      "manual": "Manual do Proprietário",
      "no_vehicles": "Bem-vindo ao AUTOMASTER. Registre seu primeiro carro para começar a gestão inteligente.",
      "import_backup": "Importar Backup",
      "export_backup": "Exportar Backup",
      "ai_key": "Chave da API Gemini",
      "ai_key_link": "Obter chave gratuita"
    }
  },
  en: {
    translation: {
      "app_name": "torqboss - My Top Car",
      "app_subtitle": "— My Top Car",
      "import_vehicle": "Import Vehicle",
      "add_vehicle": "Add Vehicle",
      "settings": "Settings",
      "odometer_scan": "Scan Odometer",
      "mileage": "Mileage",
      "last_mileage": "Last registered mileage",
      "scan_success": "Mileage detected successfully!",
      "confirm": "Confirm",
      "cancel": "Cancel",
      "save": "Save",
      "vehicles": "Vehicles",
      "maintenance": "Maintenance",
      "fuel": "Fuel",
      "catalog": "Parts Catalog",
      "manual": "Owner's Manual",
      "no_vehicles": "Welcome to AUTOMASTER. Register your first car to start smart management.",
      "import_backup": "Import Backup",
      "export_backup": "Export Backup",
      "ai_key": "Gemini API Key",
      "ai_key_link": "Get free key"
    }
  },
  es: {
    translation: {
      "app_name": "torqboss - Mi Carro Top",
      "app_subtitle": "— Mi Carro Top",
      "import_vehicle": "Importar Vehículo",
      "add_vehicle": "Agregar Vehículo",
      "settings": "Configuración",
      "odometer_scan": "Escanear Odómetro",
      "mileage": "Kilometraje",
      "last_mileage": "Último kilometraje registrado",
      "scan_success": "¡Kilometraje detectado con éxito!",
      "confirm": "Confirmar",
      "cancel": "Cancelar",
      "save": "Guardar",
      "vehicles": "Vehículos",
      "maintenance": "Mantenimiento",
      "fuel": "Combustible",
      "catalog": "Catálogo de Piezas",
      "manual": "Manual del Propietario",
      "no_vehicles": "Bievenido a AUTOMASTER. Registra tu primer coche para empezar la gestión inteligente.",
      "import_backup": "Importar Copia de Seguridad",
      "export_backup": "Exportar Copia de Seguridad",
      "ai_key": "Clave API Gemini",
      "ai_key_link": "Obtener clave gratuita"
    }
  },
  fr: {
    translation: {
      "app_name": "torqboss - Ma Super Voiture",
      "app_subtitle": "— Ma Super Voiture",
      "import_vehicle": "Importer un véhicule",
      "add_vehicle": "Ajouter un véhicule",
      "settings": "Paramètres",
      "odometer_scan": "Scanner l'odomètre",
      "mileage": "Kilométrage",
      "last_mileage": "Dernier kilométrage enregistré",
      "scan_success": "Kilométrage détecté avec succès!",
      "confirm": "Confirmer",
      "cancel": "Annuler",
      "save": "Enregistrer",
      "vehicles": "Véhicules",
      "maintenance": "Entretien",
      "fuel": "Carburant",
      "catalog": "Catalogue de pièces",
      "manual": "Manuel du propriétaire",
      "no_vehicles": "Bienvenue sur AUTOMASTER. Enregistrez votre première voiture pour commencer la gestion intelligente.",
      "import_backup": "Importer une sauvegarde",
      "export_backup": "Exporter une sauvegarde",
      "ai_key": "Clé API Gemini",
      "ai_key_link": "Obtenir une clé gratuite"
    }
  },
  it: {
    translation: {
      "app_name": "torqboss - La Mia Auto Top",
      "app_subtitle": "— La Mia Auto Top",
      "import_vehicle": "Importa Veicolo",
      "add_vehicle": "Aggiungi Veicolo",
      "settings": "Impostazioni",
      "odometer_scan": "Scansiona Odometro",
      "mileage": "Chilometraggio",
      "last_mileage": "Ultimo chilometraggio registrato",
      "scan_success": "Chilometraggio rilevato con successo!",
      "confirm": "Conferma",
      "cancel": "Annulla",
      "save": "Salva",
      "vehicles": "Veicoli",
      "maintenance": "Manutenzione",
      "fuel": "Carburante",
      "catalog": "Catalogo Pezzi",
      "manual": "Manuale del Proprietario",
      "no_vehicles": "Benvenuto in AUTOMASTER. Registra la tua prima auto per iniziare la gestione intelligente.",
      "import_backup": "Importa Backup",
      "export_backup": "Esporta Backup",
      "ai_key": "Chiave API Gemini",
      "ai_key_link": "Ottieni chiave gratuita"
    }
  },
  de: {
    translation: {
      "app_name": "torqboss - Mein Top Auto",
      "app_subtitle": "— Mein Top Auto",
      "import_vehicle": "Fahrzeug importieren",
      "add_vehicle": "Fahrzeug hinzufügen",
      "settings": "Einstellungen",
      "odometer_scan": "Kilometerzähler scannen",
      "mileage": "Kilometerstand",
      "last_mileage": "Zuletzt registrierter Kilometerstand",
      "scan_success": "Kilometerstand erfolgreich erkannt!",
      "confirm": "Bestätigen",
      "cancel": "Abbrechen",
      "save": "Speichern",
      "vehicles": "Fahrzeuge",
      "maintenance": "Wartung",
      "fuel": "Kraftstoff",
      "catalog": "Teilekatalog",
      "manual": "Bedienungsanleitung",
      "no_vehicles": "Willkommen bei AUTOMASTER. Registrieren Sie Ihr erstes Auto, um mit der intelligenten Verwaltung zu beginnen.",
      "import_backup": "Backup importieren",
      "export_backup": "Backup exportieren",
      "ai_key": "Gemini API-Schlüssel",
      "ai_key_link": "Kostenlosen Schlüssel erhalten"
    }
  },
  ru: {
    translation: {
      "app_name": "torqboss - Мой Авто Топ",
      "app_subtitle": "— Мой Авто Топ",
      "import_vehicle": "Импорт автомобиля",
      "add_vehicle": "Добавить автомобиль",
      "settings": "Настройки",
      "odometer_scan": "Сканировать одометр",
      "mileage": "Пробег",
      "last_mileage": "Последний зарегистрированный пробег",
      "scan_success": "Пробег успешно обнаружен!",
      "confirm": "Подтвердить",
      "cancel": "Отмена",
      "save": "Сохранить",
      "vehicles": "Автомобили",
      "maintenance": "Обслуживание",
      "fuel": "Топливо",
      "catalog": "Каталог запчастей",
      "manual": "Руководство пользователя",
      "no_vehicles": "Добро пожаловать в AUTOMASTER. Зарегистрируйте свой первый автомобиль для умного управления.",
      "import_backup": "Импорт резервной копии",
      "export_backup": "Экспорт резервной копии",
      "ai_key": "API ключ Gemini",
      "ai_key_link": "Получить бесплатный ключ"
    }
  },
  zh: {
    translation: {
      "app_name": "torqboss - 我的顶级爱车",
      "app_subtitle": "— 我的顶级爱车",
      "import_vehicle": "导入车辆",
      "add_vehicle": "添加车辆",
      "settings": "设置",
      "odometer_scan": "扫描里程表",
      "mileage": "里程",
      "last_mileage": "最后记录的里程",
      "scan_success": "成功检测到里程！",
      "confirm": "确认",
      "cancel": "取消",
      "save": "保存",
      "vehicles": "车辆",
      "maintenance": "保养",
      "fuel": "燃油",
      "catalog": "配件目录",
      "manual": "车主手册",
      "no_vehicles": "欢迎来到 AUTOMASTER。注册您的第一辆车以开始智能管理。",
      "import_backup": "导入备份",
      "export_backup": "导出备份",
      "ai_key": "Gemini API 密钥",
      "ai_key_link": "获取免费密钥"
    }
  },
  ko: {
    translation: {
      "app_name": "torqboss - 내 최고의 차",
      "app_subtitle": "— 내 최고의 차",
      "import_vehicle": "차량 가져오기",
      "add_vehicle": "차량 추가",
      "settings": "설정",
      "odometer_scan": "주행거리계 스캔",
      "mileage": "주행거리",
      "last_mileage": "마지막 등록 주행거리",
      "scan_success": "주행거리가 성공적으로 감지되었습니다!",
      "confirm": "확인",
      "cancel": "취소",
      "save": "저장",
      "vehicles": "차량",
      "maintenance": "정비",
      "fuel": "연료",
      "catalog": "부품 카탈로그",
      "manual": "사용자 설명서",
      "no_vehicles": "AUTOMASTER에 오신 것을 환영합니다. 스마트한 관리를 위해 첫 번째 차량을 등록하세요.",
      "import_backup": "백업 가져오기",
      "export_backup": "백업 내보내기",
      "ai_key": "Gemini API 키",
      "ai_key_link": "무료 키 받기"
    }
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'pt',
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;

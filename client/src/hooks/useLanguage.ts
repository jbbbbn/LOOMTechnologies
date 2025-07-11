import { useEffect, useState } from "react";

export interface LanguageTranslations {
  [key: string]: string;
}

const translations: Record<string, LanguageTranslations> = {
  en: {
    // Navigation
    dashboard: "Dashboard",
    aiAssistant: "AI Assistant",
    notes: "Notes",
    calendar: "Calendar",
    search: "Search",
    mail: "Mail",
    chat: "Chat",
    gallery: "Gallery",
    settings: "Settings",
    logout: "Logout",
    
    // Common
    save: "Save",
    cancel: "Cancel",
    delete: "Delete",
    edit: "Edit",
    create: "Create",
    update: "Update",
    loading: "Loading...",
    
    // AI Assistant
    aiInsights: "AI Insights",
    askAnything: "Ask me anything about your LOOM activities...",
    sendMessage: "Send message",
    clearHistory: "Clear history",
    
    // Settings
    profile: "Profile",
    account: "Account",
    appearance: "Appearance",
    language: "Language",
    consciousness: "Consciousness",
    theme: "Theme",
    light: "Light",
    dark: "Dark",
    system: "System",
    
    // LOOM Apps
    noteTaking: "AI-powered note-taking",
    smartCalendar: "Smart event scheduling",
    webSearch: "Personalized search",
    emailManagement: "Intelligent email management",
    realTimeChat: "Real-time messaging",
    mediaGallery: "AI-enhanced media organization"
  },
  es: {
    // Navigation
    dashboard: "Panel de Control",
    aiAssistant: "Asistente IA",
    notes: "Notas",
    calendar: "Calendario",
    search: "Buscar",
    mail: "Correo",
    chat: "Chat",
    gallery: "Galería",
    settings: "Configuración",
    logout: "Cerrar Sesión",
    
    // Common
    save: "Guardar",
    cancel: "Cancelar",
    delete: "Eliminar",
    edit: "Editar",
    create: "Crear",
    update: "Actualizar",
    loading: "Cargando...",
    
    // AI Assistant
    aiInsights: "Perspectivas de IA",
    askAnything: "Pregúntame cualquier cosa sobre tus actividades LOOM...",
    sendMessage: "Enviar mensaje",
    clearHistory: "Limpiar historial",
    
    // Settings
    profile: "Perfil",
    account: "Cuenta",
    appearance: "Apariencia",
    language: "Idioma",
    consciousness: "Conciencia",
    theme: "Tema",
    light: "Claro",
    dark: "Oscuro",
    system: "Sistema",
    
    // LOOM Apps
    noteTaking: "Toma de notas con IA",
    smartCalendar: "Programación inteligente de eventos",
    webSearch: "Búsqueda personalizada",
    emailManagement: "Gestión inteligente de correo",
    realTimeChat: "Mensajería en tiempo real",
    mediaGallery: "Organización de medios con IA"
  },
  fr: {
    // Navigation
    dashboard: "Tableau de Bord",
    aiAssistant: "Assistant IA",
    notes: "Notes",
    calendar: "Calendrier",
    search: "Rechercher",
    mail: "Courrier",
    chat: "Chat",
    gallery: "Galerie",
    settings: "Paramètres",
    logout: "Déconnexion",
    
    // Common
    save: "Sauvegarder",
    cancel: "Annuler",
    delete: "Supprimer",
    edit: "Modifier",
    create: "Créer",
    update: "Mettre à jour",
    loading: "Chargement...",
    
    // AI Assistant
    aiInsights: "Aperçus IA",
    askAnything: "Demandez-moi n'importe quoi sur vos activités LOOM...",
    sendMessage: "Envoyer un message",
    clearHistory: "Effacer l'historique",
    
    // Settings
    profile: "Profil",
    account: "Compte",
    appearance: "Apparence",
    language: "Langue",
    consciousness: "Conscience",
    theme: "Thème",
    light: "Clair",
    dark: "Sombre",
    system: "Système",
    
    // LOOM Apps
    noteTaking: "Prise de notes avec IA",
    smartCalendar: "Planification intelligente d'événements",
    webSearch: "Recherche personnalisée",
    emailManagement: "Gestion intelligente des emails",
    realTimeChat: "Messagerie en temps réel",
    mediaGallery: "Organisation de médias avec IA"
  }
};

export function useLanguage() {
  const [currentLanguage, setCurrentLanguage] = useState<string>(() => {
    return localStorage.getItem('loom-language') || 'en';
  });

  useEffect(() => {
    localStorage.setItem('loom-language', currentLanguage);
    document.documentElement.lang = currentLanguage;
  }, [currentLanguage]);

  const t = (key: string): string => {
    return translations[currentLanguage]?.[key] || translations.en[key] || key;
  };

  const changeLanguage = (language: string) => {
    setCurrentLanguage(language);
  };

  return {
    language: currentLanguage,
    t,
    changeLanguage,
    availableLanguages: Object.keys(translations)
  };
}
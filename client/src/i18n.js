import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Translation dictionaries
const resources = {
  en: {
    translation: {
      "settings": "Settings",
      "manage_preferences": "Manage your preferences and account settings",
      "app_preferences": "App Preferences",
      "push_notifications": "Push Notifications",
      "push_sub": "Orders, deals & updates",
      "dark_mode": "Dark Mode",
      "dark_sub": "Switch to dark theme",
      "location_services": "Location Services",
      "location_sub": "Auto-detect your address",
      "language": "Language",
      "language_sub": "English (US)",
      "delivery": "Delivery",
      "priority_fetch": "Priority Fetch",
      "priority_sub": "Get faster delivery slots",
      "contactless": "Contactless Delivery",
      "contactless_sub": "Leave at door by default",
      "delivery_instructions": "Delivery Instructions",
      "delivery_instructions_sub": "Add default delivery notes",
      "payments": "Payments",
      "saved_cards": "Saved Cards",
      "saved_cards_sub": "Manage payment methods",
      "promo_codes": "Promo Codes",
      "promo_sub": "View & add discount codes",
      "auto_reorder": "Auto-Reorder",
      "auto_reorder_sub": "Schedule repeat orders",
      "privacy_security": "Privacy & Security",
      "two_factor": "Two-Factor Auth",
      "two_factor_sub": "Extra login security",
      "activity_tracking": "Activity Tracking",
      "activity_sub": "Personalize recommendations",
      "delete_account": "Delete Account",
      "delete_sub": "Permanently remove your data",
      "select_language": "Select Language",
      "english": "English",
      "spanish": "Spanish (Español)",
      "cancel": "Cancel",
      "home": "Home",
      "explore": "Explore",
      "orders": "Orders",
      "account": "Account",
      "logout": "Log Out"
    }
  },
  es: {
    translation: {
      "settings": "Ajustes",
      "manage_preferences": "Gestiona tus preferencias y cuenta",
      "app_preferences": "Preferencias de la App",
      "push_notifications": "Notificaciones Push",
      "push_sub": "Pedidos, ofertas y actualizaciones",
      "dark_mode": "Modo Oscuro",
      "dark_sub": "Cambiar al tema oscuro",
      "location_services": "Servicios de Ubicación",
      "location_sub": "Autodetectar tu dirección",
      "language": "Idioma",
      "language_sub": "Español",
      "delivery": "Entrega",
      "priority_fetch": "Entrega Prioritaria",
      "priority_sub": "Consigue entregas más rápidas",
      "contactless": "Entrega sin contacto",
      "contactless_sub": "Dejar en la puerta por defecto",
      "delivery_instructions": "Instrucciones de Entrega",
      "delivery_instructions_sub": "Añadir notas por defecto",
      "payments": "Pagos",
      "saved_cards": "Tarjetas Guardadas",
      "saved_cards_sub": "Gestionar métodos de pago",
      "promo_codes": "Códigos Promocionales",
      "promo_sub": "Ver y añadir códigos de descuento",
      "auto_reorder": "Auto-Reordenar",
      "auto_reorder_sub": "Programar pedidos repetidos",
      "privacy_security": "Privacidad y Seguridad",
      "two_factor": "Autenticación de Dos Pasos",
      "two_factor_sub": "Seguridad extra",
      "activity_tracking": "Rastreo de Actividad",
      "activity_sub": "Personalizar recomendaciones",
      "delete_account": "Eliminar Cuenta",
      "delete_sub": "Eliminar permanentemente tus datos",
      "select_language": "Seleccionar Idioma",
      "english": "Inglés (English)",
      "spanish": "Español",
      "cancel": "Cancelar",
      "home": "Inicio",
      "explore": "Explorar",
      "orders": "Pedidos",
      "account": "Cuenta",
      "logout": "Cerrar sesión"
    }
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false, // React automatically escapes
    },
  });

export default i18n;

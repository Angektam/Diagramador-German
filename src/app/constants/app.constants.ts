/**
 * Constantes globales de la aplicación PromptGen.
 * Centraliza valores mágicos para facilitar mantenimiento.
 */

/** Configuración de archivos */
export const FILE_CONFIG = {
  /** Tamaño máximo de archivo en bytes (20 MB) */
  MAX_FILE_SIZE: 20 * 1024 * 1024,
  /** Número máximo de páginas PDF a procesar */
  MAX_PDF_PAGES: 80,
  /** Extensiones de archivo permitidas */
  ALLOWED_EXTENSIONS: ['pdf', 'docx', 'doc', 'txt', 'md', 'rtf'] as const,
} as const;

/** Configuración de autenticación */
export const AUTH_CONFIG = {
  /** Máximo de intentos de login antes de bloqueo */
  MAX_LOGIN_ATTEMPTS: 5,
  /** Duración del bloqueo en ms (2 minutos) */
  LOCKOUT_DURATION: 2 * 60 * 1000,
  /** Duración de la sesión en ms (8 horas) */
  SESSION_DURATION: 8 * 60 * 60 * 1000,
  /** Longitud mínima de contraseña */
  MIN_PASSWORD_LENGTH: 6,
  /** Longitud máxima de contraseña */
  MAX_PASSWORD_LENGTH: 100,
  /** Longitud mínima de username */
  MIN_USERNAME_LENGTH: 3,
  /** Longitud máxima de username */
  MAX_USERNAME_LENGTH: 50,
} as const;

/** Configuración del historial de prompts */
export const HISTORY_CONFIG = {
  /** Máximo de entradas en el historial */
  MAX_ENTRIES: 50,
  /** Máximo de versiones por entrada */
  MAX_VERSIONS: 10,
  /** Debounce de búsqueda en ms */
  SEARCH_DEBOUNCE: 300,
} as const;

/** Configuración de tokens y prompts */
export const PROMPT_CONFIG = {
  /** Multiplicador de palabras a tokens (estimación) */
  WORD_TO_TOKEN_RATIO: 1.3,
  /** Umbral de advertencia de tokens */
  TOKEN_WARNING_THRESHOLD: 6000,
  /** Presupuestos de tokens disponibles */
  TOKEN_BUDGETS: [800, 1200, 2000, 3500] as const,
  /** Presupuesto de tokens por defecto */
  DEFAULT_TOKEN_BUDGET: 1200,
} as const;

/** Configuración de UI */
export const UI_CONFIG = {
  /** Duración de notificaciones por defecto (ms) */
  NOTIFICATION_DURATION: 4000,
  /** Duración de notificaciones de error (ms) */
  ERROR_NOTIFICATION_DURATION: 5000,
  /** Delay de animación de login (ms) */
  LOGIN_ANIMATION_DELAY: 500,
  /** Máximo de templates guardados */
  MAX_TEMPLATES: 10,
} as const;

/** Claves de localStorage */
export const STORAGE_KEYS = {
  SESSION: 'pg_session',
  LOCKOUT: 'pg_lockout',
  REGISTERED_USERS: 'pg_registeredUsers',
  THEME: 'pg_theme',
  HISTORY: 'prompt_history',
  TEMPLATES: 'pg_templates',
  INPUT_MODE: 'pg_input_mode',
  LANGUAGE: 'pg_language',
} as const;

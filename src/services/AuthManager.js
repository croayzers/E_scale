import { AppState } from '../core/AppState.js';

const LOCAL_AUTH_KEY = 'escale_auth_local';
const GOOGLE_DOMAINS = new Set(['gmail.com', 'googlemail.com']);
const MICROSOFT_DOMAINS = new Set(['outlook.com', 'hotmail.com', 'live.com', 'msn.com']);

let currentSession = null;

function cleanEmail(value) {
  return String(value || '').trim().toLowerCase();
}

function extractDomain(email) {
  const normalized = cleanEmail(email);
  const at = normalized.indexOf('@');
  return at > 0 ? normalized.slice(at + 1) : '';
}

function providerLabel(provider) {
  if (provider === 'google') return 'Google';
  if (provider === 'azure' || provider === 'microsoft') return 'Microsoft';
  return 'correo';
}

function uidFromEmail(email, provider) {
  const base = `${provider}:${cleanEmail(email)}`;
  let hash = 0;
  for (let index = 0; index < base.length; index += 1) {
    hash = ((hash << 5) - hash) + base.charCodeAt(index);
    hash |= 0;
  }
  return `local-${Math.abs(hash)}`;
}

function buildLocalSession(email, provider = 'email') {
  const normalizedEmail = cleanEmail(email);
  const normalizedProvider = provider === 'microsoft' ? 'azure' : provider;
  return {
    local: true,
    provider: normalizedProvider,
    access_token: '',
    user: {
      id: uidFromEmail(normalizedEmail, normalizedProvider),
      email: normalizedEmail,
      app_metadata: { provider: normalizedProvider },
      user_metadata: {}
    }
  };
}

function saveLocalSession(session) {
  try {
    if (!session?.user?.email) {
      localStorage.removeItem(LOCAL_AUTH_KEY);
      return;
    }
    localStorage.setItem(LOCAL_AUTH_KEY, JSON.stringify({
      email: session.user.email,
      provider: session.provider || session.user?.app_metadata?.provider || 'email'
    }));
  } catch (error) {
    console.warn('[AuthManager] No se pudo persistir la sesion local:', error);
  }
}

function readLocalSession() {
  try {
    const raw = localStorage.getItem(LOCAL_AUTH_KEY);
    if (!raw) return null;
    const payload = JSON.parse(raw);
    if (!payload?.email) return null;
    return buildLocalSession(payload.email, payload.provider || 'email');
  } catch (error) {
    console.warn('[AuthManager] No se pudo leer la sesion local:', error);
    return null;
  }
}

function exposeTokenGetter() {
  window.__ESCALE_AUTH__ = {
    getAccessToken: () => currentSession?.access_token || '',
    getUser: () => currentSession?.user || null
  };
}

function hydrateAuthState(session) {
  currentSession = session || null;
  const user = session?.user || null;
  const provider = String(session?.provider || user?.app_metadata?.provider || '');

  AppState.company.authUserId = user?.id || '';
  AppState.company.authEmail = user?.email || '';
  AppState.company.authProvider = provider || '';
  AppState.company.authDisplayName = '';
  AppState.company.authStatus = user
    ? (session?.local ? 'authenticated_local' : 'authenticated')
    : 'anonymous';

  exposeTokenGetter();

  document.dispatchEvent(new CustomEvent('escale:auth-changed', {
    detail: {
      userId: AppState.company.authUserId,
      email: AppState.company.authEmail,
      provider: AppState.company.authProvider,
      local: Boolean(session?.local)
    }
  }));
}

async function init() {
  const localSession = readLocalSession();
  hydrateAuthState(localSession);
  return localSession;
}

function suggestProvider(email) {
  const normalized = cleanEmail(email);
  const domain = extractDomain(normalized);

  if (!normalized || !domain) {
    return {
      primaryProvider: 'email',
      domain: '',
      title: 'Pon tu correo para continuar',
      description: 'Luego podrás elegir Google, Microsoft o recibir un acceso por correo.'
    };
  }

  if (GOOGLE_DOMAINS.has(domain)) {
    return {
      primaryProvider: 'google',
      domain,
      title: 'Cuenta Google detectada',
      description: 'Usa Google si ese correo es el que sueles utilizar para trabajar con E-scale.'
    };
  }

  if (MICROSOFT_DOMAINS.has(domain)) {
    return {
      primaryProvider: 'azure',
      domain,
      title: 'Cuenta Microsoft detectada',
      description: 'Perfecto para Outlook personal o Microsoft 365. También puedes seguir por correo.'
    };
  }

  return {
    primaryProvider: 'email',
    domain,
    title: `Dominio ${domain} detectado`,
    description: 'Si ya usaste este dominio en este equipo, recuperaremos los datos guardados.'
  };
}

async function mockSignIn(provider, email) {
  const normalizedEmail = cleanEmail(email);
  if (!normalizedEmail) throw new Error('Necesitas indicar un correo.');

  const session = buildLocalSession(normalizedEmail, provider);
  saveLocalSession(session);
  hydrateAuthState(session);
  return { data: { session }, error: null };
}

async function signOut() {
  saveLocalSession(null);
  hydrateAuthState(null);
}

function getSession() {
  return currentSession;
}

function isAuthenticated() {
  return Boolean(currentSession?.user?.id);
}

export const AuthManager = {
  init,
  suggestProvider,
  mockSignIn,
  signOut,
  getSession,
  isAuthenticated,
  providerLabel
};

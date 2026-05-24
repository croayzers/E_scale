import { AppState } from '../core/AppState.js';

const LOCAL_AUTH_KEY = 'escale_auth_local';
const LOCAL_AUTH_USERS_KEY = 'escale_auth_users_local';
const GOOGLE_DOMAINS = new Set(['gmail.com', 'googlemail.com']);
const MICROSOFT_DOMAINS = new Set(['outlook.com', 'hotmail.com', 'live.com', 'msn.com']);

let currentSession = null;

function cleanEmail(value) {
  return String(value || '').trim().toLowerCase();
}

function cleanText(value) {
  return String(value || '').trim().replace(/\s+/g, ' ');
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

function buildLocalSession(email, provider = 'email', options = {}) {
  const normalizedEmail = cleanEmail(email);
  const normalizedProvider = provider === 'microsoft' ? 'azure' : provider;
  const fullName = cleanText(options.fullName);

  return {
    local: true,
    provider: normalizedProvider,
    access_token: '',
    user: {
      id: uidFromEmail(normalizedEmail, normalizedProvider),
      email: normalizedEmail,
      app_metadata: { provider: normalizedProvider },
      user_metadata: fullName ? { fullName } : {}
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
      provider: session.provider || session.user?.app_metadata?.provider || 'email',
      fullName: cleanText(session.user?.user_metadata?.fullName)
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
    return buildLocalSession(payload.email, payload.provider || 'email', {
      fullName: payload.fullName || ''
    });
  } catch (error) {
    console.warn('[AuthManager] No se pudo leer la sesion local:', error);
    return null;
  }
}

function readLocalUsers() {
  try {
    const raw = localStorage.getItem(LOCAL_AUTH_USERS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (error) {
    console.warn('[AuthManager] No se pudo leer el indice local de accesos:', error);
    return [];
  }
}

function writeLocalUsers(users) {
  try {
    localStorage.setItem(LOCAL_AUTH_USERS_KEY, JSON.stringify(users.slice(0, 24)));
  } catch (error) {
    console.warn('[AuthManager] No se pudo persistir el indice local de accesos:', error);
  }
}

function findLocalAccount(email) {
  const normalizedEmail = cleanEmail(email);
  if (!normalizedEmail) return null;
  return readLocalUsers().find(user => cleanEmail(user?.email) === normalizedEmail) || null;
}

function upsertLocalAccount(account = {}) {
  const normalizedEmail = cleanEmail(account.email);
  if (!normalizedEmail) return null;

  const normalizedProvider = account.provider === 'microsoft' ? 'azure' : (account.provider || 'email');
  const now = new Date().toISOString();
  const users = readLocalUsers().filter(user => cleanEmail(user?.email) !== normalizedEmail);
  const existing = findLocalAccount(normalizedEmail);
  const next = {
    email: normalizedEmail,
    provider: normalizedProvider,
    fullName: cleanText(account.fullName || existing?.fullName || ''),
    password: normalizedProvider === 'email'
      ? String(account.password ?? existing?.password ?? '')
      : String(existing?.password ?? ''),
    createdAt: existing?.createdAt || now,
    updatedAt: now
  };
  users.unshift(next);
  writeLocalUsers(users);
  return next;
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
  const fullName = cleanText(session?.user?.user_metadata?.fullName || '');

  AppState.company.authUserId = user?.id || '';
  AppState.company.authEmail = user?.email || '';
  AppState.company.authProvider = provider || '';
  AppState.company.authDisplayName = fullName;
  AppState.company.authStatus = user
    ? (session?.local ? 'authenticated_local' : 'authenticated')
    : 'anonymous';

  exposeTokenGetter();

  document.dispatchEvent(new CustomEvent('escale:auth-changed', {
    detail: {
      userId: AppState.company.authUserId,
      email: AppState.company.authEmail,
      provider: AppState.company.authProvider,
      local: Boolean(session?.local),
      fullName
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
      description: 'Luego podras elegir Google, Microsoft o entrar con correo.'
    };
  }

  if (GOOGLE_DOMAINS.has(domain)) {
    return {
      primaryProvider: 'google',
      domain,
      title: 'Cuenta Google detectada',
      description: 'Usa Google si ese correo es el que sueles utilizar con E-scale.'
    };
  }

  if (MICROSOFT_DOMAINS.has(domain)) {
    return {
      primaryProvider: 'azure',
      domain,
      title: 'Cuenta Microsoft detectada',
      description: 'Perfecto para Outlook personal o Microsoft 365. Tambien puedes seguir por correo.'
    };
  }

  return {
    primaryProvider: 'email',
    domain,
    title: `Dominio ${domain} detectado`,
    description: 'Si ya usaste este dominio en este equipo, recuperaremos los datos guardados.'
  };
}

async function mockSignIn(provider, email, options = {}) {
  const normalizedEmail = cleanEmail(email);
  const normalizedProvider = provider === 'microsoft' ? 'azure' : provider;
  const fullName = cleanText(options.fullName);
  const password = String(options.password || '');
  const createAccount = Boolean(options.createAccount);

  if (!normalizedEmail) throw new Error('Necesitas indicar un correo.');

  const storedAccount = findLocalAccount(normalizedEmail);

  if (normalizedProvider === 'email') {
    if (createAccount) {
      if (!password) {
        throw new Error('Escribe una contraseña para crear la cuenta local.');
      }
      if (storedAccount?.password && storedAccount.password !== password) {
        throw new Error('Ya existe una cuenta local con ese correo. Inicia sesion para continuar.');
      }
      upsertLocalAccount({
        email: normalizedEmail,
        provider: normalizedProvider,
        fullName,
        password
      });
    } else if (storedAccount?.password) {
      if (!password) {
        throw new Error('Escribe tu contraseña para continuar.');
      }
      if (storedAccount.password !== password) {
        throw new Error('La contraseña no coincide.');
      }
    }
  } else if (createAccount || storedAccount || fullName) {
    upsertLocalAccount({
      email: normalizedEmail,
      provider: normalizedProvider,
      fullName
    });
  }

  const account = findLocalAccount(normalizedEmail);
  const session = buildLocalSession(normalizedEmail, normalizedProvider, {
    fullName: fullName || account?.fullName || ''
  });

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
  providerLabel,
  findLocalAccount
};

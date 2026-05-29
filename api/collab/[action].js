const { json, methodNotAllowed, readJsonBody, badRequest, serverError } = require('../../lib/http');
const {
  getAuthUser,
  createCollabSession,
  findCollabSessionByToken,
  countCollabParticipants,
  insertCollabParticipant
} = require('../../lib/supabase');

async function handleCreate(req, res) {
  if (req.method !== 'POST') return methodNotAllowed(req, res, ['POST']);
  const token = (req.headers.authorization || '').replace(/^Bearer\s+/i, '').trim();
  const user = token ? await getAuthUser(token) : null;
  const body = await readJsonBody(req);
  const { sessionName, hostDisplayName, guestRole, sceneSnapshot, planSnapshot } = body;
  if (!Array.isArray(sceneSnapshot)) return badRequest(res, 'sceneSnapshot must be an array');
  const session = await createCollabSession({
    hostUserId: user?.id || null,
    hostDisplayName: hostDisplayName || user?.fullName || 'Host',
    sessionName: sessionName || 'Colaboración',
    guestRole: guestRole === 'viewer' ? 'viewer' : 'editor',
    sceneSnapshot,
    planSnapshot: planSnapshot || {}
  });
  if (!session?.id) return serverError(res, new Error('Failed to create session'));
  return json(res, 200, {
    ok: true,
    sessionId: session.id,
    inviteToken: session.invite_token,
    channelName: `collab:${session.id}`
  });
}

async function handleJoin(req, res) {
  if (req.method !== 'POST') return methodNotAllowed(req, res, ['POST']);
  const body = await readJsonBody(req);
  const { inviteToken, displayName, email } = body;
  if (!inviteToken) return badRequest(res, 'Missing inviteToken');
  if (!displayName || !String(displayName).trim()) return badRequest(res, 'Missing displayName');
  const session = await findCollabSessionByToken(String(inviteToken).trim());
  if (!session) return json(res, 404, { ok: false, error: 'session_not_found' });
  if (new Date(session.expires_at) < new Date()) return json(res, 410, { ok: false, error: 'session_expired' });
  const participantCount = await countCollabParticipants(session.id);
  if (participantCount >= 4) return json(res, 409, { ok: false, error: 'session_full' });
  await insertCollabParticipant({
    sessionId: session.id,
    displayName: String(displayName).trim().slice(0, 60),
    email: email ? String(email).trim().toLowerCase() : null,
    role: session.guest_role || 'editor'
  });
  return json(res, 200, {
    ok: true,
    sessionId: session.id,
    channelName: `collab:${session.id}`,
    sessionName: session.session_name || 'Colaboración',
    hostName: session.host_display_name,
    guestRole: session.guest_role || 'editor',
    snapshot: { items: session.scene_snapshot || [], plan: session.plan_snapshot || {} }
  });
}

module.exports = async function handler(req, res) {
  const action = req.query?.action || req.url?.split('/').pop()?.split('?')[0];
  try {
    if (action === 'create') return await handleCreate(req, res);
    if (action === 'join')   return await handleJoin(req, res);
    return json(res, 404, { ok: false, error: 'unknown_action' });
  } catch (error) {
    return serverError(res, error);
  }
};

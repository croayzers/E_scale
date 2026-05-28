const { json, methodNotAllowed, readJsonBody, badRequest, serverError } = require('../../lib/http');
const { getAuthUser, createCollabSession } = require('../../lib/supabase');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return methodNotAllowed(req, res, ['POST']);

  try {
    const token = (req.headers.authorization || '').replace(/^Bearer\s+/i, '').trim();
    const user = token ? await getAuthUser(token) : null;

    const body = await readJsonBody(req);
    const { sessionName, hostDisplayName, guestRole, sceneSnapshot, planSnapshot } = body;

    if (!Array.isArray(sceneSnapshot)) {
      return badRequest(res, 'sceneSnapshot must be an array');
    }

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
  } catch (error) {
    return serverError(res, error);
  }
};

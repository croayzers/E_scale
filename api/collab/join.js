const { json, methodNotAllowed, readJsonBody, badRequest, serverError } = require('../../lib/http');
const { findCollabSessionByToken, countCollabParticipants, insertCollabParticipant } = require('../../lib/supabase');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return methodNotAllowed(req, res, ['POST']);

  try {
    const body = await readJsonBody(req);
    const { inviteToken, displayName, email } = body;

    if (!inviteToken) return badRequest(res, 'Missing inviteToken');
    if (!displayName || !String(displayName).trim()) return badRequest(res, 'Missing displayName');

    const session = await findCollabSessionByToken(String(inviteToken).trim());
    if (!session) return json(res, 404, { ok: false, error: 'session_not_found' });
    if (new Date(session.expires_at) < new Date()) {
      return json(res, 410, { ok: false, error: 'session_expired' });
    }

    const participantCount = await countCollabParticipants(session.id);
    if (participantCount >= 4) {
      return json(res, 409, { ok: false, error: 'session_full' });
    }

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
      snapshot: {
        items: session.scene_snapshot || [],
        plan: session.plan_snapshot || {}
      }
    });
  } catch (error) {
    return serverError(res, error);
  }
};

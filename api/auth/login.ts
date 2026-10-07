export default function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body || {};
  const { id, password } = body;

  const normalizedId = typeof id === 'string' ? id.trim().toLowerCase() : '';
  const rawPass = typeof password === 'string' ? password : '';

  if (normalizedId === 'admin@worklyft.in' && rawPass === 'worklyft8080') {
    return res.status(200).json({
      success: true,
      user: {
        id: 'admin@worklyft.in',
        role: 'Administrator',
        organization: 'Worklyft',
      },
    });
  }

  return res.status(401).json({
    success: false,
    error: 'Invalid Workspace ID or password. Access denied.',
  });
}

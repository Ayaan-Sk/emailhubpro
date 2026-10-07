export default async function handler(req: any, res: any) {
  if (req.method === 'DELETE') {
    return res.status(200).json({ success: true });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body || {};
  const { sendAt } = body;

  const jobId = `sched_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

  return res.status(200).json({
    success: true,
    jobId,
    scheduledAt: sendAt,
  });
}

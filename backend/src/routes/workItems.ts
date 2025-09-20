import { Router, Request, Response, NextFunction } from 'express';
import { azureDevopsClient } from '../services/azureDevopsClient';
import config from '../config/env';

const router = Router();

// Simple endpoint performing a WIQL query then fetching work item details
// POST /api/workitems/query { wiql: "SELECT [System.Id] FROM WorkItems ..." }
router.post('/query', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { wiql, project } = req.body || {};
    if (!wiql || typeof wiql !== 'string') {
      return res.status(400).json({ error: 'wiql (string) is required' });
    }
    const proj = project || config.azdo.project;
    const wiqlResult = await azureDevopsClient.getWorkItemsWiql(proj, wiql);
    const ids: number[] = wiqlResult.workItems?.map((w: any) => w.id) || [];
    const items = await azureDevopsClient.getWorkItems(ids);
    res.json({ count: items.length, items });
  } catch (err) {
    next(err);
  }
});

export default router;

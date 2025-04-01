import type { NextApiRequest, NextApiResponse } from 'next';
import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const client = new MongoClient(uri);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    await client.connect();
    const db = client.db('design-editor');
    const designs = db.collection('designs');

    if (req.method === 'POST') {
      const { id, data } = req.body;
      
      if (!data) {
        return res.status(400).json({ error: 'Design data is required' });
      }

      const result = await designs.updateOne(
        { _id: id },
        { $set: { data, updatedAt: new Date() } },
        { upsert: true }
      );

      return res.status(200).json({ 
        id: id || result.upsertedId,
        success: true 
      });
    }

    if (req.method === 'GET') {
      const { id } = req.query;
      const design = await designs.findOne({ _id: id });
      
      if (!design) {
        return res.status(404).json({ error: 'Design not found' });
      }

      return res.status(200).json(design);
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  } finally {
    await client.close();
  }
}

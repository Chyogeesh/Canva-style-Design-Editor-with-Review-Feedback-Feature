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
    const reviews = db.collection('reviews');

    if (req.method === 'POST') {
      const { designId, x, y, text } = req.body;
      
      if (!designId || !text) {
        return res.status(400).json({ error: 'Required fields missing' });
      }

      const review = {
        designId,
        x,
        y,
        text,
        resolved: false,
        createdAt: new Date(),
      };

      const result = await reviews.insertOne(review);
      
      return res.status(201).json({ 
        ...review,
        _id: result.insertedId,
      });
    }

    if (req.method === 'GET') {
      const { designId } = req.query;
      
      if (!designId) {
        return res.status(400).json({ error: 'Design ID is required' });
      }

      const comments = await reviews
        .find({ designId })
        .sort({ createdAt: -1 })
        .toArray();

      return res.status(200).json(comments);
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  } finally {
    await client.close();
  }
}

import { ObjectId } from "mongodb";

export interface Token {
  _id?: ObjectId;
  userId: string;
  token: string;
  refreshToken: string;
  userRole: string;
  status: 'active' | 'revoked';
  createdAt: Date;
  expiresAt: Date;
  refreshExpiresAt: Date;
  lastUsed?: Date;
}

export const createTokenCollection = async (db: any) => {
  const collections = await db.listCollections().toArray();
  const collectionNames = collections.map((c: any) => c.name);
  
  if (!collectionNames.includes('tokens')) {
    await db.createCollection('tokens');
    console.log('Tokens collection created');
    
    // สร้าง index เพื่อจัดการ token ที่หมดอายุ
    const tokensCollection = db.collection('tokens');
    await tokensCollection.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });
    await tokensCollection.createIndex({ userId: 1 });
    await tokensCollection.createIndex({ token: 1 });
    await tokensCollection.createIndex({ refreshToken: 1 });
  }
}; 
import path from 'path';
import dotenv from 'dotenv';

dotenv.config({ path: path.resolve("./",".env")});

export default {
  jwt: {
    secret: process.env.JWT_SECRET as string,
    expiresIn: '1d'
  }
}

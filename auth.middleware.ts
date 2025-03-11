// auth.middleware.ts
import * as jwt from 'jsonwebtoken';
import * as fs from 'fs';

const RSA_PUBLIC_KEY = fs.readFileSync('./demos/public.key');

export function checkIfAuthenticated(req, res, next) {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      message: 'Autenticazione richiesta'
    });
  }

  const token = authHeader.split(' ')[1];
  
  try {
    const decoded = jwt.verify(token, RSA_PUBLIC_KEY, {
      algorithms: ['RS256']
    });
    
    req.user = {
      id: decoded.sub
    };
    
    next();
  } catch (err) {
    return res.status(401).json({
      message: err.name === 'TokenExpiredError' ? 'Token scaduto' : 'Token non valido'
    });
  }
}

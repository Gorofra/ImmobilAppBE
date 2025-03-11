import {Request, Response} from "express";
import * as express from 'express';
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
import * as jwt from 'jsonwebtoken';
import * as fs from "fs";
const crypto = require('crypto');

const app = express();

app.use(bodyParser.json());

app.route('/api/login')
    .post(loginRoute);

app.route('/api/register')
    .post(registerRoute);

const RSA_PRIVATE_KEY = fs.readFileSync('./demos/private.key');

export function loginRoute(req, res) {

    const email = req.body.email,
          password = req.body.password;

    if (validateEmailAndPassword()) {
       const userId = findUserIdForEmail(email);

        const jwtBearerToken = jwt.sign({}, RSA_PRIVATE_KEY, {
                algorithm: 'RS256',
                expiresIn: 120,
                subject: userId
        });

        res.status(200).json({
            idToken: jwtBearerToken,
            expiresIn: 120
        })

    } else {
        res.sendStatus(401);
    }
}

export async function registerRoute(req, res) {
    const { firstName, lastName, email, password } = req.body;

    // Validate required fields
    if (!firstName || !lastName || !email || !password) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    try {
        // Check if user already exists
        const exists = await userExists(email);
        if (exists) {
            return res.status(409).json({ message: 'User already exists' });
        }

        // Hash password before storing
        const salt = crypto.randomBytes(16).toString('hex');
        const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');

        // Store user in database
        const userId = await createUser({
            firstName,
            lastName,
            email,
            password: hash,
            salt
        });

        // Generate JWT token
        const jwtBearerToken = jwt.sign({}, RSA_PRIVATE_KEY, {
            algorithm: 'RS256',
            expiresIn: 120,
            subject: userId
        });

        res.status(201).json({
            idToken: jwtBearerToken,
            expiresIn: 120,
            message: 'User registered successfully'
        });

    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ message: 'Error registering user' });
    }
}

function userExists(email) {
    return new Promise((resolve, reject) => {
        const query = 'SELECT * FROM users WHERE email = ?';
        connection.query(query, [email], (err, results) => {
            if (err) {
                console.error('Database Error:', err);
                reject(err);
            }
            resolve(results.length > 0);
        });
    });
}


function createUser(userData) {
    return new Promise((resolve, reject) => {
        const query = 'INSERT INTO users (firstName, lastName, email, password, salt) VALUES (?, ?, ?, ?, ?)';
        connection.query(
            query, 
            [userData.firstName, userData.lastName, userData.email, userData.password, userData.salt],
            (err, result) => {
                if (err) {
                    console.error('Database Error:', err);
                    reject(err);
                }
                resolve(result.insertId.toString());
            }
        );
    });
}

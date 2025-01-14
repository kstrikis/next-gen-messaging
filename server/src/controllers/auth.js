import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';
import logger from '../config/logger.js';

const prisma = new PrismaClient();

const generateToken = (userId, isGuest = false) => jwt.sign(
  { userId, isGuest },
  process.env.JWT_SECRET,
  { expiresIn: '24h' }
);

const ANONYMOUS_ANIMALS = [
  'Aardvark', 'Albatross', 'Alligator', 'Alpaca', 'Ant', 'Anteater', 'Antelope', 'Ape', 'Armadillo', 'Donkey',
  'Baboon', 'Badger', 'Barracuda', 'Bat', 'Bear', 'Beaver', 'Bee', 'Bison', 'Boar', 'Buffalo',
  'Butterfly', 'Camel', 'Capybara', 'Caribou', 'Cassowary', 'Cat', 'Caterpillar', 'Cattle', 'Chamois', 'Cheetah',
  'Chicken', 'Chimpanzee', 'Chinchilla', 'Chough', 'Clam', 'Cobra', 'Cockroach', 'Cod', 'Cormorant', 'Coyote',
  'Crab', 'Crane', 'Crocodile', 'Crow', 'Curlew', 'Deer', 'Dinosaur', 'Dog', 'Dogfish', 'Dolphin',
  'Dragon', 'Dragonfly', 'Duck', 'Dugong', 'Dunlin', 'Eagle', 'Echidna', 'Eel', 'Eland', 'Elephant',
  'Elk', 'Emu', 'Falcon', 'Ferret', 'Finch', 'Fish', 'Flamingo', 'Fox', 'Frog', 'Gaur',
  'Gazelle', 'Gerbil', 'Giraffe', 'Grasshopper', 'Heron', 'Hippopotamus', 'Hornet', 'Horse', 'Kangaroo', 'Kingfisher',
  'Koala', 'Komodo', 'Kookabura', 'Kouprey', 'Kudu', 'Lapwing', 'Lark', 'Lemur', 'Leopard', 'Lion',
  'Llama', 'Lobster', 'Locust', 'Loris', 'Louse', 'Lyrebird', 'Magpie', 'Mallard', 'Mongoose', 'Monkey'
];

const generateGuestUsername = (baseName = '') => {
  // Clean and truncate the base name
  const cleanName = baseName.trim()
    .replace(/[^\p{L}\p{N}\s\-_]/gu, '') // Only allow letters, numbers, spaces, hyphens, and underscores
    .trim();

  // If no name provided or name is invalid after cleaning, generate an anonymous name
  if (!cleanName) {
    const randomAnimal = ANONYMOUS_ANIMALS[Math.floor(Math.random() * ANONYMOUS_ANIMALS.length)];
    return `Anonymous ${randomAnimal}`;
  }

  // Truncate name if too long (leaving room for prefix)
  const maxNameLength = 50;
  const truncatedName = cleanName.length > maxNameLength ? 
    cleanName.substring(0, maxNameLength) : cleanName;

  return truncatedName;
};

const findUniqueGuestUsername = async (baseName) => {
  const maxAttempts = 100;
  let attempts = 0;
  
  while (attempts < maxAttempts) {
    const randomNum = Math.floor(Math.random() * 10000);
    const guestUsername = `guest${randomNum.toString().padStart(4, '0')}_${baseName}`;
    
    // Check if username exists
    const existingUser = await prisma.user.findUnique({
      where: { username: guestUsername }
    });
    
    if (!existingUser) {
      return guestUsername;
    }
    
    attempts++;
  }
  
  // If we couldn't find a unique name after max attempts, 
  // generate a completely random one as fallback
  const timestamp = Date.now();
  const randomNum = Math.floor(Math.random() * 10000);
  return `guest${timestamp}${randomNum}`;
};

export const register = async (req, res) => {
  try {
    const { email, password, username } = req.body;

    // Validate input
    if (!email || !password || !username) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Check if user exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email },
          { username }
        ]
      }
    });

    if (existingUser) {
      return res.status(400).json({ error: 'Email or username already taken' });
    }

    // Hash password and create user
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await prisma.user.create({
      data: {
        email,
        username,
        passwordHash: hashedPassword,
        isGuest: false
      }
    });

    logger.info(`User registered: ${email}`);
    
    const token = generateToken(user.id, false);
    
    return res.status(201).json({
      token,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
      },
    });
  } catch (error) {
    logger.error('Registration error:', error);
    return res.status(500).json({ error: 'Server error during registration' });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user || user.isGuest) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Update last seen
    await prisma.user.update({
      where: { id: user.id },
      data: { lastSeen: new Date() }
    });
    
    logger.info(`User logged in: ${email}`);
    
    const token = generateToken(user.id, false);
    
    return res.status(200).json({
      token,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
      },
    });
  } catch (error) {
    logger.error('Login error:', error);
    return res.status(500).json({ error: 'Server error during login' });
  }
};

export const guestLogin = async (req, res) => {
  try {
    const { username: rawUsername } = req.body;
    
    // Generate base username (either cleaned user input or anonymous animal name)
    const baseUsername = generateGuestUsername(rawUsername);
    
    // Find a unique guest username
    const uniqueUsername = await findUniqueGuestUsername(baseUsername);

    // Create guest user
    const user = await prisma.user.create({
      data: {
        username: uniqueUsername,
        isGuest: true,
      }
    });

    logger.info(`Guest user created: ${uniqueUsername}`);
    
    const token = generateToken(user.id, true);
    
    return res.status(200).json({
      token,
      user: {
        id: user.id,
        username: user.username,
        isGuest: true,
      },
    });
  } catch (error) {
    logger.error('Guest login error:', error);
    return res.status(500).json({ error: 'Server error during guest login' });
  }
};

export const handleAuth0Callback = async (req, res) => {
  try {
    logger.info('Auth0 callback received');
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      logger.error('No bearer token provided');
      return res.status(401).json({ error: 'No bearer token provided' });
    }

    const { email, sub, nickname } = req.body;

    if (!email || !sub) {
      logger.error('Missing required user info', { email, sub });
      return res.status(400).json({ error: 'Missing required user info' });
    }

    logger.info('Processing Auth0 user:', { email, sub });

    try {
      // First try to find user by Auth0 ID
      let user = await prisma.user.findFirst({
        where: { auth0Id: sub }
      });

      if (!user) {
        // Then try to find by email
        user = await prisma.user.findUnique({
          where: { email }
        });

        if (user) {
          // User exists but doesn't have Auth0 ID - update them
          logger.info('Updating existing user with Auth0 ID');
          user = await prisma.user.update({
            where: { id: user.id },
            data: { 
              auth0Id: sub,
              lastSeen: new Date()
            }
          });
        } else {
          // No user found - create new one
          logger.info('Creating new user from Auth0');
          user = await prisma.user.create({
            data: {
              email,
              username: nickname || email.split('@')[0],
              auth0Id: sub,
              isGuest: false,
              lastSeen: new Date()
            }
          });
        }
      } else {
        // User found by Auth0 ID - update lastSeen
        logger.info('Updating existing Auth0 user');
        user = await prisma.user.update({
          where: { id: user.id },
          data: { lastSeen: new Date() }
        });
      }

      // Generate our own JWT
      const appToken = generateToken(user.id, false);
      logger.info('Generated JWT token for user');

      logger.info(`Auth0 user processed successfully: ${user.email}`);
      
      return res.status(200).json({
        token: appToken,
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          isGuest: user.isGuest
        }
      });
    } catch (dbError) {
      logger.error('Database error during Auth0 callback:', dbError);
      return res.status(500).json({ error: 'Database error during user processing' });
    }
  } catch (error) {
    logger.error('Auth0 callback error:', error);
    return res.status(500).json({ error: 'Server error during Auth0 callback', message: error.message });
  }
}; 
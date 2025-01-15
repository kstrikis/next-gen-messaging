import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';
import logger from '../config/logger.js';

const prisma = new PrismaClient();

const generateToken = (userId, isGuest = false) => {
  // Ensure userId is a string
  const userIdStr = String(userId);
  
  // Log token payload for debugging
  logger.debug('Generating token:', { userId: userIdStr, isGuest });
  
  return jwt.sign(
    { userId: userIdStr, isGuest },
    process.env.JWT_SECRET || 'dev-jwt-secret-do-not-use-in-production',
    { expiresIn: '24h' }
  );
};

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

/**
 * Cleans the base name by allowing only permitted characters.
 * Truncates the base name if necessary to ensure the final username
 * does not exceed 50 characters when combined with 'guestXXXX_'.
 * 
 * @param {string} baseName - The input username.
 * @returns {string} - The cleaned and possibly truncated base name.
 */
const generateBaseUsername = (baseName = '') => {
  // Allow letters, numbers, spaces, underscores, dots, and CJK characters
  const cleanName = baseName.trim().replace(/[^\p{L}\p{N}\s_.]/gu, '').trim();

  if (!cleanName) {
    // If no valid name is provided, select a random animal for anonymity
    const randomAnimal = ANONYMOUS_ANIMALS[Math.floor(Math.random() * ANONYMOUS_ANIMALS.length)];
    const anonymousName = `Anonymous ${randomAnimal}`;

    // Calculate the maximum length allowed for 'Anonymous [Animal]'
    // considering 'guestXXXX_' prefix which is 9 characters
    const maxAnonymousLength = 50 - 9; // 41 characters
    return anonymousName.length > maxAnonymousLength
      ? anonymousName.substring(0, maxAnonymousLength)
      : anonymousName;
  }

  // Truncate the name if it's too long
  const maxBaseLength = 50 - 9; // 41 characters
  return cleanName.length > maxBaseLength ? cleanName.substring(0, maxBaseLength) : cleanName;
};

/**
 * Generates a random four-digit number as a string with leading zeros.
 * Ensures the number ranges from '0000' to '9999'.
 * 
 * @returns {string} - A four-digit number string.
 */
const generateFourDigitNumber = () => {
  return Math.floor(Math.random() * 10000).toString().padStart(4, '0');
};

/**
 * Generates a guest username in the format:
 * - 'guestXXXX_username' if username is provided.
 * - 'guestXXXX_Anonymous Animal' if no username is provided.
 * Ensures the total length does not exceed 50 characters.
 * 
 * @param {string} baseName - The input username.
 * @returns {string} - The formatted guest username.
 */
const generateGuestUsername = (baseName = '') => {
  const baseUsername = generateBaseUsername(baseName);
  const guestNumber = generateFourDigitNumber();
  return `guest${guestNumber}_${baseUsername}`;
};

/**
 * Finds a unique guest username by generating up to 100 attempts.
 * If unable to find a unique username after 100 attempts, falls back
 * to a randomized 'guestXXXX_Anonymous Animal' username.
 * 
 * @param {string} baseName - The input username.
 * @returns {Promise<string>} - A unique guest username.
 */
export const findUniqueGuestUsername = async (baseName = '') => {
  const maxAttempts = 100;
  let attempts = 0;

  while (attempts < maxAttempts) {
    const guestUsername = generateGuestUsername(baseName);

    // Ensure the username does not exceed 50 characters
    const finalUsername = guestUsername.substring(0, 50);

    // Check if the username already exists
    const existingUser = await prisma.user.findUnique({
      where: { username: finalUsername }
    });

    if (!existingUser) {
      return finalUsername;
    }

    attempts++;
  }

  // Fallback: Generate a completely random guest username
  const randomAnimal = ANONYMOUS_ANIMALS[Math.floor(Math.random() * ANONYMOUS_ANIMALS.length)];
  const fallbackBase = `Anonymous ${randomAnimal}`;
  const truncatedFallbackBase = fallbackBase.length > (50 - 9)
    ? fallbackBase.substring(0, 41)
    : fallbackBase;
  const guestNumber = generateFourDigitNumber();
  return `guest${guestNumber}_${truncatedFallbackBase}`.substring(0, 50);
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

    // Find general channel
    const generalChannel = await prisma.channel.findUnique({
      where: { name: 'general' }
    });

    if (!generalChannel) {
      logger.error('General channel not found during user registration');
      return res.status(500).json({ error: 'Server error during registration' });
    }

    const user = await prisma.user.create({
      data: {
        email,
        username,
        passwordHash: hashedPassword,
        isGuest: false,
        channels: {
          connect: { id: generalChannel.id }
        }
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
    // Find a unique guest username
    const uniqueUsername = await findUniqueGuestUsername();

    // Find general channel
    const generalChannel = await prisma.channel.findUnique({
      where: { name: 'general' }
    });

    if (!generalChannel) {
      logger.error('General channel not found during guest login');
      return res.status(500).json({ error: 'Server error during guest login' });
    }

    // Create guest user
    const user = await prisma.user.create({
      data: {
        username: uniqueUsername,
        isGuest: true,
        channels: {
          connect: { id: generalChannel.id }
        }
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

    // Find general channel
    const generalChannel = await prisma.channel.findUnique({
      where: { name: 'general' }
    });

    if (!generalChannel) {
      logger.error('General channel not found during Auth0 callback');
      return res.status(500).json({ error: 'Server error during Auth0 callback' });
    }

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
              lastSeen: new Date(),
              channels: {
                connect: { id: generalChannel.id }
              }
            }
          });
        } else {
          // New user - create them
          logger.info('Creating new user from Auth0');
          user = await prisma.user.create({
            data: {
              email,
              username: nickname || email.split('@')[0],
              auth0Id: sub,
              isGuest: false,
              lastSeen: new Date(),
              channels: {
                connect: { id: generalChannel.id }
              }
            }
          });
        }
      } else {
        // User found by Auth0 ID - update last seen
        logger.info('Updating existing Auth0 user');
        user = await prisma.user.update({
          where: { id: user.id },
          data: {
            lastSeen: new Date(),
            channels: {
              connect: { id: generalChannel.id }
            }
          }
        });
      }

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
      logger.error('Database error during Auth0 callback:', error);
      return res.status(500).json({ error: 'Database error during Auth0 callback' });
    }
  } catch (error) {
    logger.error('Auth0 callback error:', error);
    return res.status(500).json({ error: 'Server error during Auth0 callback' });
  }
};

export default {
  register,
  login,
  guestLogin,
  handleAuth0Callback,
  findUniqueGuestUsername
};
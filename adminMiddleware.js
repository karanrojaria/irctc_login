const adminApiKey = process.env.ADMIN_API_KEY;

const adminMiddleware = (req, res, next) => {
  const apiKey = req.header('x-api-key');

  if (apiKey !== adminApiKey) {
    return res.status(403).json({ error: 'Forbidden: Invalid API key.' });
  }

  next();
};

module.exports = adminMiddleware;

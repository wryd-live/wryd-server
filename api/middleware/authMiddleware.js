const jwt = require('jsonwebtoken');

const requireAuth = (req, res, next) => {

  // bearer token jwt
  try
  {
    const token = req.headers.authorization;
    if (token) {
      const bearer = token.split(' ');
      const bearerToken = bearer[1];

      jwt.verify(bearerToken, process.env.JWTLOGINSECRET, (err, decodedToken) => {
        if (err) {
          res.sendStatus(403);
        } else {
          req.params.userid = decodedToken.id;
          next();
        }
      });
    } else {
      res.sendStatus(404);
    }
  }
  catch(err)
  {
    res.sendStatus(500);
  }
};


module.exports = { requireAuth };
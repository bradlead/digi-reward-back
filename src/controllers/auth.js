const jwt = require('jsonwebtoken');
const request = require('request-promise');
const User = require('../models/user');

const createJWT = (user, callback) => {
  const payload = {
    id: user._id,
  };
  
  jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' }, callback);
};

const monzo = (req, res) => {
  request.post('https://api.monzo.com/oauth2/token', {
    form: {
      grant_type: 'authorization_code',
      client_id: process.env.MONZO_CLIENT_ID,
      client_secret: process.env.MONZO_CLIENT_SECRET,
      redirect_uri: process.env.REDIRECT_URL,
      code: req.body.code,
    },
  })
  
  // add access token to User collection here
  .then(response => request.post('http://localhost:3000/api/v1/User', {
    body: {
      access_token: response.access_token,
      user_id: response.user_id,
     },
     json: true,
   }))

  /* .then((response) => {
    console.log(response);
    return request.post('http://localhost:3000/api/v1/User', {
     body: {
          access_token: response.access_token,
          user_id: response.body.user_id,
       },
       json: true,
     });
  }) */
   
  .then((user) => {
    createJWT(user, (err, token) => {
      if (err) {
        res.sendStatus(500);
      } else {
        res.status(200).json({ token }); 
      }
    });
  })
  .catch((error) => {
    console.log(error.message);
    res.sendStatus(200);
  })
}

module.exports = {
  monzo,
};

//https://www.youtube.com/results?search_query=deploy+mern+app+to+heroku

const express = require('express')
const request = require('request');
const dotenv = require('dotenv');
const cors = require('cors')
const cookieParser = require('cookie-parser')
const path = require('path')


const port = process.env.PORT || 5000

global.access_token = ''
global.refresh_token = ''

dotenv.config()

var spotify_client_id = process.env.SPOTIFY_CLIENT_ID
var spotify_client_secret = process.env.SPOTIFY_CLIENT_SECRET

var spotify_redirect_uri = process.env.REDIRECT_URI

var generateRandomString = function (length) {
  var text = '';
  var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  for (var i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
};

var playlists

var stateKey = 'spotify_auth_state';

var app = express();

app.use(express.static(__dirname + '/client/public'))
   .use(cors())
   .use(cookieParser())

app.get('/auth/login', (req, res) => {

  var scope = "streaming user-read-email user-read-private"
  var state = generateRandomString(16);
  res.cookie(stateKey, state)

  var auth_query_parameters = new URLSearchParams({
    response_type: "code",
    client_id: spotify_client_id,
    scope: scope,
    redirect_uri: spotify_redirect_uri,
    state: state
  })

  res.redirect('https://accounts.spotify.com/authorize/?' + auth_query_parameters.toString());
})

app.get('/auth/callback', (req, res) => {

  var code = req.query.code || null;
  var state = req.query.state || null
  var storedState = req.cookies ? req.cookies[stateKey] : null

  if(state === null || state !== storedState) {
    let params = new URLSearchParams({
      error: 'state_mismatch'
    })
    res.redirect('/#' + params.toString())
  } else {
    res.clearCookie(stateKey)
    var authOptions = {
      url: 'https://accounts.spotify.com/api/token',
      form: {
        code: code,
        redirect_uri: spotify_redirect_uri,
        grant_type: 'authorization_code'
      },
      headers: {
        'Authorization': 'Basic ' + (Buffer.from(spotify_client_id + ':' + spotify_client_secret).toString('base64')),
        'Content-Type' : 'application/x-www-form-urlencoded'
      },
      json: true
    };

    request.post(authOptions, function(error, response, body) {
      if (!error && response.statusCode === 200) {

        console.log(body)

        access_token = body.access_token
        refresh_token = body.refresh_token

        var options = {
          url: 'https://api.spotify.com/v1/me/playlists',
          headers: { 'Authorization': 'Bearer ' + access_token },
          json: true
        };

        // use the access token to access the Spotify Web API
        request.get(options, function(error, response, body) {
          // console.log(body);
          playlists = body
        });

        // we can also pass the token to the browser to make requests from there
        // res.redirect('/#' +
        //   querystring.stringify({
        //     access_token: access_token,
        //     refresh_token: refresh_token
        //   }));

        // res.render('/', { playlists: playlists })
        res.redirect('/')
      } else {
        res.redirect('/#' +
          ({
            error: 'invalid_token'
          }).toString())
      }
    });
  }

  // var code = req.query.code;

  // var authOptions = {
  //   url: 'https://accounts.spotify.com/api/token',
  //   form: {
  //     code: code,
  //     redirect_uri: spotify_redirect_uri,
  //     grant_type: 'authorization_code'
  //   },
  //   headers: {
  //     'Authorization': 'Basic ' + (Buffer.from(spotify_client_id + ':' + spotify_client_secret).toString('base64')),
  //     'Content-Type' : 'application/x-www-form-urlencoded'
  //   },
  //   json: true
  // };

  // request.post(authOptions, function(error, response, body) {
  //   if (!error && response.statusCode === 200) {
  //     access_token = body.access_token;
  //     res.redirect('/')
  //   }
  // });

})

app.get('/auth/token', (req, res) => {
  res.json({ access_token: access_token, refresh_token: refresh_token })
})

app.get('/auth/refresh_token', (req, res) => {
  console.log("Exchanging refresh_token for access_token")

  // requesting access token from refresh token
  var reftoken = req.query.refresh_token  
  console.log(reftoken)
  var authOptions = {
    url: 'https://accounts.spotify.com/api/token',
    headers: { 
      'Authorization': 'Basic ' + (Buffer.from(spotify_client_id + ':' + spotify_client_secret).toString('base64')) },
    form: {
      grant_type: 'refresh_token',
      refresh_token: reftoken
    },
    json: true
  }

  request.post(authOptions, function(error, response, body) {
    if(!error && response.statusCode === 200) {
      access_token = body.access_token
      console.log(body)
      res.json({
        access_token: access_token
      })
    }
  })
})

app.get('/', (req, res) => {
  console.log(playlists)
  res.send(playlists)
})

if(process.env.NODE_ENV === 'production') {
  app.use(express.static('client/public'))
  app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "client", "public", "index.html"))
  })
}

app.listen(port, () => {
  console.log(`Server running at ${port}`)
})
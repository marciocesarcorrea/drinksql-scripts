const admin = require('firebase-admin')
admin.initializeApp()
const functions = require('firebase-functions')
const axios = require('axios')
require('dotenv').config()

exports.getCredential = functions.https.onRequest(async (request, response) => {
  let idToken
  if (request.headers.authorization && request.headers.authorization.startsWith('Bearer ')) {
    console.log('Found "Authorization" header')
    // Read the ID Token from the Authorization header.
    idToken = request.headers.authorization.split('Bearer ')[1]
  } else if (request.cookies) {
    console.log('Found "__session" cookie')
    // Read the ID Token from cookie.
    idToken = request.cookies.__session
  } else {
    // No cookie
    response.status(403).send('Unauthorized')
    return
  }

  try {
    const decodedIdToken = await admin.auth().verifyIdToken(idToken)
    console.log('ID Token correctly decoded', decodedIdToken)

    var hasuraVariables = {
      'X-Hasura-User-Id': decodedIdToken.uid,
      'X-Hasura-Role': 'user'
    }
    console.log(hasuraVariables) // For debug
    // Send appropriate variables
    response.json(hasuraVariables)
    return
  } catch (error) {
    console.error('Error while verifying Firebase ID token:', error)
    response.status(403).send('Unauthorized')
  }
})
exports.processSignUp = functions.auth.user().onCreate(async user => {
  console.log(user)
  const adminSecret = process.env.SECRET
  const url = process.env.URL_ADMIN
  try {
    const data = await axios.post(
      url,
      {
        query: `
          mutation($id: String!, $name: String) {
            insert_users(
              objects: [{ id: $id, name: $name }]
              on_conflict: {
                constraint: users_pkey
                update_columns: [last_seen, name]
              }
            ) {
              affected_rows
            }
          }
        `,
        variables: {
          id: user.uid,
          name: user.email
        }
      }, {
        headers: {
          'content-type': 'application/json',
          'x-hasura-admin-secret': adminSecret
        }
      }
    )
    console.log(data)
  } catch (e) {
    console.error('Error:', e)
  }
})

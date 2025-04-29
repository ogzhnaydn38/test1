TypeError: /app/src/nodeJs2/docs/rest-api-guide.ejs:67
65| Please ensure the token is correctly placed in one of these locations, using the appropriate label as indicated. The service prioritizes these locations in the order listed, processing the first token it successfully identifies.
66|

> > 67| <% if (ssoAuthentications.length) { %>

    68| ### Access Via SSO Tokens
    69| The <%= serviceNameUp %> service facilitates secure access using tokens generated via Single Sign-On (SSO). To ensure successful authentication through the SSO mechanism, it's crucial that SSO tokens are placed in one of the designated locations as outlined below. This enables the service to verify and grant access accordingly.
    70|

Cannot read properties of undefined (reading 'length')

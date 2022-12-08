The websocket server uses socket.io
Use the following code snippet to connect and to the socket server 


```javascript
const socket = io("https://lionfish-app-hsj4b.ondigitalocean.app/", {
      withCredentials: false,
      /// Pass the token you receive from our authentication server here
      extraHeaders:´{authorizationToken: <<YOUR TOKEN HERE >> }
      });
```

The server emits three types of events:
1. onlinefriends 
2. offlinefriends
3. invitedfriends 

An event is emitted whenever a a friend connects, logs off og is invited.
Each time an event is emitted all data regarding the authenticated users friends statuses is sent from the server 

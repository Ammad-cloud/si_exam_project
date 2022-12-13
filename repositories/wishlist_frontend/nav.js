const jwt = localStorage.getItem('jwt');

document.write(`
    <div class="nav-container">
        <div class="logo">
          <a href="index.html"><img src="https://d3uug9v35qw8k4.cloudfront.net/logo.webp" alt="" width="130"/></a>
          </div>
        <nav>
          <ul>
            <li><button class="invite-btn" id="inviteFriend-btn" style="display: none" onclick="openInvitePanel()">Invite friends</button></li>
            <li><a href="wishlist.html" style="display: none" id="nav_profile">Profile/Your wishlist</a></li>
            <li><button class="open-button" onclick="openForm()" id="loginButton">Login</li></button>
            <li><button class="open-button" onclick="logout()" id="logoutButton" style="display: none">Log out</li></button>
          </ul>
        </nav>
    </div>
    <div class="form-popup" id="login-form" >
      <form onsubmit="event.preventDefault(); submitLogin()" class="form-container">
        <h1>Login</h1>
    
        <label for="email"><b>Email</b></label>
        <input type="text" id="email" placeholder="Enter Email" name="email" required>
    
        <label for="psw"><b>Password</b></label>
        <input type="password" id="password" placeholder="Enter Password" name="psw" required>
        <p><a href="register.html">Sign up here</a></p>
        <button type="submit" class="btn" >Login</button>
        <button type="button" class="btn cancel" onclick="closeForm()">Close</button>
      </form>
    </div>

    <div class="form-popup" id="invite-form" >
      <form onsubmit="event.preventDefault(); sendInvite()" class="form-container">
        <h1>Invite your friends</h1>
    
        <label for="email"><b>Email</b></label>
        <input type="text" id="inviteEmail" placeholder="Enter Email" name="mytext" required>
    
        <button type="submit" class="btn invi-send-btn">Send invitation</button>
     <!-- <button type="button" class="btn cancel" onclick="closeInvite()">Close</button> -->
      </form>
    </div>
    `);

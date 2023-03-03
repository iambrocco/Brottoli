var testX, testY;
        testY = 0

window.onload = () => {
  const fragment = new URLSearchParams(window.location.hash.slice(1));
  const [accessToken, tokenType] = [
    fragment.get("access_token"),
    fragment.get("token_type"),
  ];

  if (!accessToken) {
    window.location.href("/dashboard");
    return (
      (document.getElementById("login").style.display = "flex"),
      (document.getElementsByClassName("head")[0].style.display = "none")
    );
  }

  fetch("https://discord.com/api/users/@me", {
    headers: {
      authorization: `${tokenType} ${accessToken}`,
    },
  })
    .then((result) => result.json())
    .then((response) => {
      document.getElementById("login").style.display = "none";
      document.getElementsByClassName("head")[0].style.display = "flex";

      const { username, discriminator, avatar, id } = response;

      document.getElementById(
        "name"
      ).innerText = ` ${username}#${discriminator}`;

      document.getElementById(
        "avatar"
      ).src = `https://cdn.discordapp.com/avatars/${id}/${avatar}.jpg`;
    });
  fetch("https://discord.com/api/users/@me/guilds", {
    headers: {
      authorization: `${tokenType} ${accessToken}`,
    },
  })
    .then((result) => result.json())
    .then((response) => {
      //handle response
      response.forEach((guild, index) => {
        console.log(guild);
        if (guild.owner == true) {
          var guildParent = document.createElement("div");
          guildParent.setAttribute("class", "guildParent")
          var guildDiv = document.createElement("div");
          guildDiv.setAttribute("id", guild.id.toString());
          guildDiv.setAttribute("class", "guildDiv");
          if (guild.icon != null) {
            var guildIcon = document.createElement("img");
            guildIcon.setAttribute("src", `https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.png`)
            guildDiv.append(guildIcon)
          }
          if (guild.icon == null) {
            var myStr = guild.name;
            var matches = myStr.match(/\b(\w)/g);
            var a = document.createElement("div")
            a.setAttribute("id", "guildName")
            a.innerText = matches.join('')
            guildDiv.append(a)
          }
          var guildNameIndicator = document.createElement("div");
          guildNameIndicator.setAttribute("class", "guildNameIndicator");
          guildNameIndicator.innerHTML = `<a>${guild.name}</a>`;
          guildDiv.onmouseenter = () => {
            guildNameIndicator.style.display = "inline-block";
          };
          guildDiv.onmouseleave = () => {
            guildNameIndicator.style.display = "none";
          };
          guildParent.append(guildDiv)
          guildParent.append(guildNameIndicator);
          document.getElementsByClassName("guilds")[0].append(guildParent);
        }
      });
    })
    .catch(console.error);
};

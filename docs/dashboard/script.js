window.onload = () => {
  const fragment = new URLSearchParams(window.location.hash.slice(1));
  const [accessToken, tokenType] = [
    fragment.get("access_token"),
    fragment.get("token_type"),
  ];

  if (!accessToken) {
    window.location.href("/dashboard");
    return (
      (document.getElementById("login").style.display = "block"),
      (document.getElementById("dash").style.display = "none")
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
      document.getElementById("dash").style.display = "block";

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
          var guildDiv = document.createElement("div");
          guildDiv.setAttribute("id", guild.id.toString());
          guildDiv.setAttribute("class", "guildDiv");
          if (guild.icon != null) {
            guildDiv.innerHTML = `<img src="https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.png" />`;
          }
          if (guild.icon == null) {
            guildDiv.innerHTML = `<a href="#">${guild.name}</a>`;
          }
          document.getElementById("guilds").append(guildDiv);
        }
      });

    }
    )
    .catch(console.error);
};

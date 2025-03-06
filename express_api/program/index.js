const readline = require("readline")
const ax = require("axios")

const axios = ax.create({
    baseURL: 'http://localhost:3000'
  });
  

// V discordu
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const askQuestion = (question) => {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
};
// End

let token = "";

let main = async () => {
    // Sem kód
    while (true) {
      let choice = await askQuestion("Co chceš dělat? (1 = list items,\n 2 = get specific item,\n 3 = login,\n 4 = create item,\n 5 = Exit)\n");
      switch (choice) {
        case "1":
          await axios.get("/items").then((response) => {
            console.log(response.data);
          })
          break;
        case "2":
          let idToFetch = await askQuestion("Jaké ID chceš získat?\n");
            
            // Přeparsování stringu na číslo
            let numId = parseInt(idToFetch);

            // Podmínka pro případ, že uživatel nezadal číslo
            if (numId !== NaN) {
                // Get request pomocí axiosu na "/item/{id}"
                await axios.get("item/" + numId).then((response) => {
                    // Výpis výsledku
                    console.log(response.data);
                })
            } else {
                console.log("Zadaná hodnota není číslo");
            }
            break;
        // Login: /login/:username/:password
        // {
        //    token: "token"
        // }
        case "3":
            let username = await askQuestion("Jaké je uživatelské jméno?");
            let pass = await askQuestion("Jaké je heslo?");
            console.log("Logging in...");
            await axios.get("login/" + username + "/" + pass).then((resp) => {
              console.log("Úspěch!");
              token = resp.data.token;
            }).catch((err) => {
              console.log("Špatné Jméno/Heslo");
              return;
            })
            break;
        // Přídání itemu na server
        // POST request: axios.post()
        // /item/add/:token/:id/:name
        case "4":
            let id = await askQuestion("Name: ");
            let name = await askQuestion("Desc : ");
            token = "m1HhlnQmANXAR6djvVoSmnJfv1Iz1LCt9ZPK69e3XSJkMkyIWDlVzUy6ybthyCFsrudpyGKd478jsILsPEtaj4PJYOjyEiC7GyaNW9X05TBmfPX29FxGI0glNYiMLbB7dgF38fpKQItnBQc9j7pEVi9DCleV7xwd6YVxOU3yzkSjUDQ7nEMlLejgaumuEVpA9oTcllRBaNEE8ogSqB5JJuS4Fb0Oj8MpfxE7cct8qDHbtkxkHhPF9EAeQq7blD";
            token = "MYwiP0oOaM6mfjRVr18sJEr5ON91YtrwN8cSnPVyFSWGle34DwLGzdUPBoDrqxahVDZRrFtkLw9RmUHdFSICKNy443POMN47Y7rY7lXEDaxg8niaFjmjkg2I1wFBZIU3GyGym9jX8cA5J60C6YfxHko6m6ETT8OOYSNtYKpCva3nvmnoRLbPZHVnfwXHZ3iJxdNpPyUkbxi3NTuwAGf98u9AunQm0lPHkZBvEhZH9voNH8v0gmJsgcu7ojO6yA";
            await axios.post("/item/add/" + token + "/" + id + "/" + name).catch((err) => {
              console.log("Probably duplicate id, try again" + err);
            })

            break;
        case "5":
            console.log("Exiting...");
            process.exit(0);
    }
  }
}

main();
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
let main = async () => {
    // Sem kód
    let choice = await askQuestion("Co chceš dělat? (1 = list items, 2 = get specific item, 3 = login, 4 = create item)\n");
    switch (choice) {
        case "1":
            axios.get("/items").then((response) => {
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
                axios.get("item/" + numId).then((response) => {
                    // Výpis výsledku
                    console.log(response.data);
                })
            } else {
                console.log("Zadaná hodnota není číslo");
            }
            break;
        case "3":
            break;
        case "4":
            break;
    }
}

main();
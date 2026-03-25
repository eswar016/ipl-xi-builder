const fs = require('fs');

let data = fs.readFileSync('data.js', 'utf8');

const spinAllRounders = [
    "Prashant Veer", "Ajay Jadav Mandal", "Tripurana Vijay",
    "Nishant Sindhu", "Rashid Khan", "Manav Suthar", "Rahul Tewatia", "Washington Sundar", "Ravisrinivasan Sai Kishore",
    "Anukul Roy", "Sunil Narine", "Rachin Ravindra", "Daksh Kamra",
    "Ayush Badoni", "Shahbaz Ahmed", "Wanindu Hasaranga",
    "Will Jacks", "Mitchell Santner", "Mayank Rawat", "Atharva Ankolekar",
    "Musheer Khan", "Cooper Connolly", "Praveen Dubey", "Harpreet Brar",
    "Ravindra Jadeja", "Riyan Parag",
    "Krunal Pandya", "Vihaan Malhotra", "Kanishk Chouhan", "Satvik Deswal",
    "Abhishek Sharma", "Liam Livingstone", "Harsh Dubey", "Shivang Kumar"
];

const spinBowlers = [
    "Digvesh Singh Rathi", "Yash Raj Punja", "Vignesh Puthur", "Amit Kumar", "Krains Fuletra"
];

spinAllRounders.forEach(player => {
    // Look for exact matches in the player object string
    const regex = new RegExp(`({ "id": "[a-z0-9_]+", "name": "${player}", "role": ")[^"]+(", "isOverseas": (true|false)(, "isCaptain": true)? })`, 'g');
    data = data.replace(regex, `$1Spin All-rounder$2`);
});

spinBowlers.forEach(player => {
    const regex = new RegExp(`({ "id": "[a-z0-9_]+", "name": "${player}", "role": ")[^"]+(", "isOverseas": (true|false)(, "isCaptain": true)? })`, 'g');
    data = data.replace(regex, `$1Spin Bowler$2`);
});

fs.writeFileSync('data.js', data);
console.log("Updated data.js with new Spin roles");

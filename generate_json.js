const fs = require('fs');
const path = require('path');

const markdown = fs.readFileSync(path.join(__dirname, 'clean_squads.md'), 'utf-8');

const overseasPlayers = new Set([
  'Dewald Brevis', 'Jamie Overton', 'Matthew Short', 'Zak Foulkes', 'Noor Ahmad', 'Akeal Hosein', 'Matt Henry', 'Spencer Johnson',
  'David Miller', 'Pathum Nissanka', 'Tristan Stubbs', 'Mitchell Starc', 'Dushmantha Chameera', 'Lungi Ngidi', 'Kyle Jamieson', 
  'Jos Buttler', 'Tom Banton', 'Glenn Phillips', 'Jason Holder', 'Kagiso Rabada', 'Luke Wood', 'Rashid Khan',
  'Finn Allen', 'Tim Seifert', 'Rovman Powell', 'Cameron Green', 'Rachin Ravindra', 'Sunil Narine', 'Blessing Muzarabani', 'Matheesha Pathirana',
  'Aiden Markram', 'Matthew Breetzke', 'Josh Inglis', 'Nicholas Pooran', 'Mitchell Marsh', 'Wanindu Hasaranga', 'Anrich Nortje',
  'Sherfane Rutherford', 'Ryan Rickelton', 'Quinton de Kock', 'Mitchell Santner', 'Corbin Bosch', 'Will Jacks', 'Trent Boult', 'Allah Ghazanfar',
  'Marcus Stoinis', 'Marco Jansen', 'Azmatullah Omarzai', 'Mitch Owen', 'Cooper Connolly', 'Ben Dwarshuis', 'Xavier Bartlett', 'Lockie Ferguson',
  'Donovan Ferreira', 'Lhuan Pretorius', 'Shimron Hetmyer', 'Dasun Shanaka', 'Jofra Archer', 'Kwena Maphaka', 'Adam Milne', 'Nandre Burger',
  'Phil Salt', 'Jordan Cox', 'Tim David', 'Romario Shepherd', 'Jacob Bethell', 'Josh Hazlewood', 'Nuwan Thushara', 'Jacob Duffy',
  'Heinrich Klaasen', 'Travis Head', 'Kamindu Mendis', 'Brydon Carse', 'Liam Livingstone', 'David Payne', 'Pat Cummins', 'Eshan Malinga'
]);

const spinBowlers = new Set([
  'Noor Ahmad', 'Shreyas Gopal', 'Akeal Hosein', 'Rahul Chahar', 'Kuldeep Yadav', 'Vipraj Nigam', 'Manav Suthar', 'Rashid Khan', 'Sai Kishore', 'Prashant Solanki', 'Varun Chakravarthy', 'M Siddharth', 'Mayank Markande', 'Raghu Sharma', 'Allah Ghazanfar', 'Yuzvendra Chahal', 'Pravin Dubey', 'Ravi Bishnoi', 'Suyash Sharma', 'Zeeshan Ansari', 'Vicky Ostwal'
]);

const teamNames = {
  'CSK': { name: 'Chennai Super Kings', color: '#F9CD05' },
  'DC': { name: 'Delhi Capitals', color: '#00008B' },
  'GT': { name: 'Gujarat Titans', color: '#1B2133' },
  'KKR': { name: 'Kolkata Knight Riders', color: '#3A225D' },
  'LSG': { name: 'Lucknow Super Giants', color: '#0057E2' },
  'MI': { name: 'Mumbai Indians', color: '#004BA0' },
  'PBKS': { name: 'Punjab Kings', color: '#ED1B24' },
  'RR': { name: 'Rajasthan Royals', color: '#EA1A82' },
  'RCB': { name: 'Royal Challengers Bengaluru', color: '#EC1C24' },
  'SRH': { name: 'Sunrisers Hyderabad', color: '#FF822A' }
};

const teamsData = [];
let currentTeam = null;
let currentRole = null;
let playerId = 1;

markdown.split('\n').forEach(line => {
  line = line.trim();
  if (line.startsWith('## ')) {
    const rawTeam = line.replace('##', '').trim();
    // rawTeam might have emojis like '🔵 CSK'
    const teamId = rawTeam.split(' ').pop(); // last word is 'CSK'
    if (teamNames[teamId]) {
      currentTeam = {
        id: teamId.toLowerCase(),
        name: teamNames[teamId].name,
        color: teamNames[teamId].color,
        players: []
      };
      teamsData.push(currentTeam);
      playerId = 1;
    }
  } else if (line.startsWith('### ')) {
    currentRole = line.replace('###', '').trim();
  } else if (line.startsWith('* ') && currentTeam && currentRole) {
    let rawName = line.replace('* ', '').trim();
    let isWK = false;
    if (rawName.includes('(WK)')) {
      isWK = true;
      rawName = rawName.replace('(WK)', '').trim();
    }
    
    let role = '';
    if (currentRole === 'Batters') {
      role = isWK ? 'Wicketkeeper' : 'Batter';
    } else if (currentRole === 'All-Rounders') {
      role = 'All-rounder';
    } else if (currentRole === 'Bowlers') {
      role = spinBowlers.has(rawName) ? 'Spin Bowler' : 'Fast Bowler';
    }
    
    currentTeam.players.push({
      id: `${currentTeam.id}_${playerId++}`,
      name: rawName,
      role: role,
      isOverseas: overseasPlayers.has(rawName)
    });
  }
});

fs.writeFileSync(path.join(__dirname, 'data.js'), `const teamsData = ${JSON.stringify(teamsData, null, 4)};\n`);
console.log('Successfully wrote to data.js');

# Parking Lot Crossing Game 🚗

A fun K-pop themed parking lot crossing game inspired by Frogger, built with p5.js and Supabase.

## 🎮 Play the Game

Help your character navigate through a busy mall parking lot while:
- Dodging moving cars and runaway shopping carts
- Collecting K-pop boy band member autographs
- Grabbing power-up ramen bowls
- Avoiding puddles and potholes
- Reaching the mall entrance safely

## 🌟 Features

- K-pop themed characters with unique dance animations
- Power-up system with collectible ramen bowls
- Global leaderboard system
- Particle effects and animations
- Progressive difficulty levels
- Social media sharing integration

## 🛠️ Setup

1. Clone the repository:
```bash
git clone https://github.com/yourusername/parking-lot-crossing.git
```

2. Create a Supabase project at [https://supabase.com](https://supabase.com)

3. Create the leaderboard table in Supabase:
```sql
create table leaderboard (
  id uuid default uuid_generate_v4() primary key,
  player_name text not null,
  score integer not null,
  level_reached integer not null,
  time_played integer not null,
  date timestamp with time zone default timezone('utc'::text, now()) not null
);
```

4. Copy your Supabase credentials to `supabase-config.js`:
```javascript
export const SUPABASE_CONFIG = {
  supabaseUrl: "your-supabase-project-url",
  supabaseKey: "your-supabase-anon-key"
};
```

5. Serve the game locally:
```bash
# Using Python
python -m http.server 8000

# Or using Node.js
npx http-server
```

6. Open `http://localhost:8000` in your browser

## 🎯 How to Play

- Use arrow keys to move
- Avoid cars and shopping carts
- Collect K-pop stars for bonus points
- Grab ramen bowls for power-ups
- Reach the mall entrance to complete the level

## 🏆 Scoring

- Completing a level: 100 points + (level × 50)
- Collecting K-pop star: 50 points
- Collecting ramen: 200 points
- Power-up bonus: 2x points while active

## 🔧 Technologies Used

- p5.js for game engine and graphics
- Supabase for backend and leaderboard
- HTML5 Canvas for rendering
- CSS for UI styling

## 📱 Social Features

- Global leaderboard
- Share scores on social media
- Screenshot sharing
- Highlight new high scores

## 🤝 Contributing

Feel free to contribute to this project by:
1. Forking the repository
2. Creating a feature branch
3. Committing your changes
4. Opening a pull request

## 📜 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Inspired by the classic Frogger game
- K-pop culture and aesthetics
- p5.js community
- Supabase team

## 🐛 Known Issues

Please check the [Issues](https://github.com/yourusername/parking-lot-crossing/issues) page for current bugs and feature requests.
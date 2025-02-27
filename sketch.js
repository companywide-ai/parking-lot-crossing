// Frogger-inspired game with custom theme
import { SUPABASE_CONFIG } from './supabase-config.js';
import { createClient } from 'https://esm.sh/@supabase/supabase-js';

const supabase = createClient(
  SUPABASE_CONFIG.supabaseUrl,
  SUPABASE_CONFIG.supabaseKey
);

// Export the p5.js sketch as default
export default function sketch(p) {
let player;
let cars = [];
let boyBands = [];
let shoppingCarts = [];
let parkingLots = [];
let gameState = "playing";
let score = 0;
let lives = 3;
let level = 1;
let startTime;
let gameFont;
let parkingSignImg;
let puddles = [];
let sunAngle = 0;
let clouds = [];
let particles = [];
  let ramenBowls = [];
  const RAMEN_SPAWN_RATE = 0.003; // Chance per frame to spawn ramen
  let powerUpActive = false;
  let powerUpTimer = 0;
  let leaderboardData = [];
  let playerNameInput;
  let submitScoreButton;
  let leaderboardDiv;
  let playAgainButton;
  let scoreSubmitted = false; // Add this line
  let viewLeaderboardLink;
  // Add this near the top with other variables
  let closeLeaderboardButton;
  // Add this variable near the top with other variables
  let gameEndTime;
  // Add this variable at the top with other variables
  let leaderboardManuallyClosed = false;

  // Move funMessages inside the p5 instance scope
  p.funMessages = [
    "OMG! It's them! 🎵",
    "Got their autograph! ✨",
    "Best day ever! 💫",
    "Boy band fever! 🕺",
  ];

  // Add near the top after Supabase initialization
  async function testSupabaseConnection() {
    try {
      const { data, error } = await supabase
        .from('leaderboard')
        .select('*')
        .limit(1);
      
      if (error) {
        console.error('Supabase connection error:', error);
      } else {
        console.log('Supabase connected successfully!');
      }
    } catch (error) {
      console.error('Error testing Supabase connection:', error);
    }
  }

// ParkingLot class
class ParkingLot {
  constructor(index) {
    this.index = index;
    this.y = 120 + index * 100;
    this.lineSpacing = 80;
    this.parkingSpots = [];
      this.hasPothole = p.random() < 0.3 && index > 0;
      this.potholeX = p.random(100, p.width - 100);
      this.hasSpeedBump = p.random() < 0.4 && index > 0;
      this.cartReturnArea = p.random() < 0.3 && index > 0;
      this.cartReturnX = p.random(p.width - 150, p.width - 50);
      
      // Create parking spots with fewer occupied spots and puddle checking
    for (let i = 0; i < 8; i++) {
      this.parkingSpots.push({
        x: i * this.lineSpacing,
          occupied: p.random() < 0.2
      });
    }
  }
  
    display(p) {
      p.push();
    
    if (this.index === 0) {
      // Start/finish area - mall entrance
        p.fill(20, 100, 20);
        p.rect(0, 0, p.width, 100);
      
      // Mall building
        p.fill(200, 150, 100);
        p.rect(0, -50, p.width, 70);
      
      // Mall windows
        p.fill(150, 200, 255);
        for (let i = 20; i < p.width; i += 60) {
          p.rect(i, -40, 40, 30);
      }
      
      // Mall entrance doors
        p.fill(150, 200, 255, 200);
        p.rect(p.width/2 - 50, -50, 40, 70);
        p.rect(p.width/2 + 10, -50, 40, 70);
      
      // Door frames
        p.stroke(100);
        p.strokeWeight(3);
        p.line(p.width/2 - 50, -50, p.width/2 - 50, 20);
        p.line(p.width/2 - 10, -50, p.width/2 - 10, 20);
        p.line(p.width/2 + 10, -50, p.width/2 + 10, 20);
        p.line(p.width/2 + 50, -50, p.width/2 + 50, 20);
      
      // Mall sign
        p.noStroke();
        p.fill(50, 50, 150);
        p.rect(p.width/2 - 80, -80, 160, 30);
        p.fill(255);
        p.textSize(20);
        p.textAlign(p.CENTER, p.CENTER);
        p.text("SUPER MALL", p.width/2, -65);
      
      // Sidewalk in front of mall
        p.fill(200, 200, 200);
        p.rect(0, 20, p.width, 30);
      
      // Finish line
        for (let i = 0; i < p.width; i += 40) {
          p.fill(i % 80 === 0 ? 255 : 0);
          p.rect(i, 50, 20, 20);
      }
      
      // Add entrance barrier
        p.fill(255, 100, 100);
        p.rect(p.width/4, 80, p.width/2, 10);
      for (let i = 0; i < 5; i++) {
          p.rect(p.width/4 + i * p.width/10, 80, 20, 10);
      }
      
      // Parking entrance sign
        p.image(parkingSignImg, p.width/2 - 30, 10);
      
      // Parking lot name
        p.fill(255);
        p.textSize(16);
        p.textAlign(p.CENTER);
        p.text("MALL PARKING", p.width/2, 90);
      
    } else {
      // Parking lot asphalt
        p.fill(80, 80, 90);
        p.rect(0, this.y - 20, p.width, 80);
      
      // Speed bump if present
      if (this.hasSpeedBump) {
        // Yellow speed bump
          p.fill(255, 255, 0);
          for (let i = 10; i < p.width - 10; i += 40) {
            p.rect(i, this.y + 20, 30, 8, 3);
        }
        
        // Warning text
          p.fill(255);
          p.textSize(10);
          p.textAlign(p.CENTER);
          p.text("SPEED BUMP", p.width/2, this.y + 15);
      }
      
      // Pothole if present
      if (this.hasPothole) {
        // Dark pothole
          p.fill(30, 30, 35);
          p.ellipse(this.potholeX, this.y + 30, 40, 25);
        
        // Pothole interior texture
          p.fill(20, 20, 25);
          p.ellipse(this.potholeX - 5, this.y + 28, 15, 10);
          p.ellipse(this.potholeX + 8, this.y + 32, 12, 8);
      }
      
      // Cart return area if present
      if (this.cartReturnArea) {
        // Cart return area outline
          p.stroke(0, 100, 0);
          p.strokeWeight(2);
          p.fill(150, 150, 150);
          p.rect(this.cartReturnX, this.y - 15, 70, 70);
        
        // Cart return sign
          p.fill(0, 100, 0);
          p.rect(this.cartReturnX + 5, this.y - 10, 60, 20);
          p.fill(255);
          p.textSize(10);
          p.textAlign(p.CENTER, p.CENTER);
          p.text("CART RETURN", this.cartReturnX + 35, this.y);
        
        // Carts in the return area
        for (let i = 0; i < 3; i++) {
            p.fill(180);
            p.rect(this.cartReturnX + 10 + i*5, this.y + 20 + i*10, 40, 20, 2);
          
          // Wheels
            p.fill(30);
            p.ellipse(this.cartReturnX + 15 + i*5, this.y + 40 + i*10, 6, 6);
            p.ellipse(this.cartReturnX + 45 + i*5, this.y + 40 + i*10, 6, 6);
          }
          
          p.noStroke();
      }
      
      // Parking lines
        p.stroke(255, 255, 0);
        p.strokeWeight(3);
      for (let spot of this.parkingSpots) {
          p.line(spot.x, this.y - 20, spot.x, this.y + 60);
        
        // Draw car in occupied spots
        if (spot.occupied) {
            p.noStroke();
            p.fill(p.random(100, 200), p.random(100, 200), p.random(100, 200));
            p.rect(spot.x + 10, this.y, 60, 30, 5);
            p.fill(50);
            p.ellipse(spot.x + 20, this.y + 30, 10, 10);
            p.ellipse(spot.x + 60, this.y + 30, 10, 10);
          
          // Add random car details
            if (p.random() < 0.3) {
            // Roof rack
              p.fill(50);
              p.rect(spot.x + 15, this.y - 5, 50, 5);
          }
          
          // Windows
            p.fill(150, 200, 255, 150);
            p.rect(spot.x + 20, this.y + 5, 40, 10, 2);
        }
      }
      
        p.noStroke();
      
      // Add level indicator and parking section sign
      let sections = ["A", "B", "C", "D"];
      if (this.index > 0 && this.index <= 4) {
          p.fill(0, 0, 150);
          p.rect(10, this.y, 40, 40);
          p.fill(255);
          p.textSize(24);
          p.textAlign(p.CENTER, p.CENTER);
          p.text(sections[this.index-1], 30, this.y + 20);
      }
      
      // Add some oil stains on the ground
        p.noStroke();
      for (let i = 0; i < 5; i++) {
          p.fill(20, 20, 20, 100);
          p.ellipse(p.random(p.width), this.y + p.random(-10, 50), p.random(10, 30), p.random(5, 15));
      }
      
      // Add parking payment machine
      if (this.index === 2) {
          p.fill(100);
          p.rect(p.width - 50, this.y, 30, 50);
          p.fill(200);
          p.rect(p.width - 45, this.y + 10, 20, 15);
          p.fill(50, 200, 50);
          p.rect(p.width - 40, this.y + 35, 10, 5);
        
        // Person using the machine
          if (p.random() < 0.3) {
          // Body
            p.fill(200, 100, 100);
            p.rect(p.width - 65, this.y + 15, 15, 25);
          
          // Head
            p.fill(255, 220, 190);
            p.ellipse(p.width - 57, this.y + 10, 15, 15);
          
          // Hair
            p.fill(50, 30, 20);
            p.arc(p.width - 57, this.y + 10, 15, 15, p.PI, p.TWO_PI);
        }
      }
    }
    
    // Add directional arrows on the pavement
    if (this.index > 0) {
        p.fill(255);
        p.noStroke();
      if (this.index % 2 === 1) {
        // Right-pointing arrow
          p.triangle(100, this.y + 30, 80, this.y + 20, 80, this.y + 40);
          p.rect(50, this.y + 25, 30, 10);
      } else {
        // Left-pointing arrow
          p.triangle(p.width - 100, this.y + 30, p.width - 80, this.y + 20, p.width - 80, this.y + 40);
          p.rect(p.width - 50, this.y + 25, -30, 10);
        }
      }
      
      p.pop();
    }
  }

  p.setup = function() {
    p.createCanvas(600, 700);
    startTime = p.millis();
  
  // Create the player
  player = new Player();
  
  // Create parking lots
  for (let i = 0; i < 5; i++) {
    parkingLots.push(new ParkingLot(i));
  }
  
  // Initialize obstacles
    p.initializeObstacles();
  
  // Create parking sign image
    p.createParkingSign();
  
  // Create clouds
  for (let i = 0; i < 5; i++) {
    clouds.push({
        x: p.random(p.width),
        y: p.random(50, 150),
        width: p.random(50, 150),
        speed: p.random(0.1, 0.3),
        opacity: p.random(150, 200)
    });
  }
  
  // Create initial puddles
    p.createPuddles(5);
    
    // Create UI elements but hide them initially
    playerNameInput = p.createInput('').attribute('placeholder', 'Enter your name');
    playerNameInput.position(-1000, -1000); // Hide off-screen initially
    
    submitScoreButton = p.createButton('Submit Score');
    submitScoreButton.position(-1000, -1000); // Hide off-screen initially
    submitScoreButton.mousePressed(submitScore);
    
    leaderboardDiv = p.select('#leaderboard');
    
    // Load initial leaderboard data
    fetchLeaderboard();
    
    // Test Supabase connection
    testSupabaseConnection();
  };

  p.draw = function() {
  // Sky gradient background
    p.drawSkyBackground();
  
  // Draw clouds
    p.drawClouds();
  
  // Draw game elements based on game state
  if (gameState === "playing") {
      p.drawGame();
      p.updateGame();
      p.checkCollisions();
  } else if (gameState === "gameOver") {
      p.drawGameOver();
  } else if (gameState === "levelComplete") {
      p.drawLevelComplete();
  }
  
  // Draw UI elements
    p.drawUI();
  
  // Update particles
    p.updateParticles();
  };

  p.drawSkyBackground = function() {
    // Create a gradient night sky
    let skyTop = p.color(10, 15, 40);     // Dark blue-black at top
    let skyBottom = p.color(20, 30, 60);   // Slightly lighter at bottom
    
    for (let y = 0; y < p.height/2; y++) {
      let inter = p.map(y, 0, p.height/2, 0, 1);
      let c = p.lerpColor(skyTop, skyBottom, inter);
      p.stroke(c);
      p.line(0, y, p.width, y);
    }
    
    // Draw stars
    p.noStroke();
    for (let i = 0; i < 100; i++) {
      // Use sin to make stars twinkle
      let twinkle = p.sin(p.frameCount * 0.05 + i) * 50 + 200;
      let x = (p.noise(i) * p.width * 2) % p.width;
      let y = (p.noise(i + 100) * p.height/2);
      
      // Larger stars with glow
      if (i % 10 === 0) {
        p.fill(255, 255, 200, twinkle * 0.3);
        p.ellipse(x, y, 4, 4);
        p.fill(255, 255, 200, twinkle);
        p.ellipse(x, y, 2, 2);
      } else {
        // Regular stars
        p.fill(255, 255, 255, twinkle);
        p.ellipse(x, y, 1, 1);
      }
    }
    
    // Draw moon
    let moonX = p.width * 0.8;
    let moonY = p.height * 0.15;
    
    // Moon glow
  for (let i = 30; i > 0; i--) {
      p.fill(255, 255, 220, (30 - i) * 2);
      p.ellipse(moonX, moonY, 60 + i, 60 + i);
    }
    
    // Moon
    p.fill(255, 255, 220);
    p.ellipse(moonX, moonY, 60, 60);
    
    // Moon craters
    p.fill(220, 220, 200);
    p.ellipse(moonX - 15, moonY - 10, 15, 15);
    p.ellipse(moonX + 10, moonY + 15, 20, 20);
    p.ellipse(moonX + 5, moonY - 15, 12, 12);
  
  // Ground color
    p.fill(80, 80, 90);
    p.rect(0, p.height/2, p.width, p.height/2);
  };

  p.drawClouds = function() {
    p.noStroke();
  for (let cloud of clouds) {
    cloud.x += cloud.speed;
      if (cloud.x > p.width + 100) {
      cloud.x = -cloud.width;
        cloud.y = p.random(50, 150);
      }
      
      // More visible night clouds with moonlight effect
      p.fill(150, 150, 170, cloud.opacity * 0.7);
      p.ellipse(cloud.x, cloud.y, cloud.width, cloud.width * 0.6);
      p.ellipse(cloud.x + cloud.width * 0.3, cloud.y - cloud.width * 0.1, cloud.width * 0.7, cloud.width * 0.5);
      p.ellipse(cloud.x - cloud.width * 0.2, cloud.y + cloud.width * 0.1, cloud.width * 0.7, cloud.width * 0.5);
      
      // Add slight glow to cloud edges
      p.fill(200, 200, 220, cloud.opacity * 0.3);
      p.ellipse(cloud.x, cloud.y, cloud.width + 10, (cloud.width * 0.6) + 10);
    }
  };

  p.createParkingSign = function() {
  // Create P sign for parking
    parkingSignImg = p.createGraphics(60, 60);
  parkingSignImg.background(0, 0, 180);
  parkingSignImg.fill(255);
  parkingSignImg.noStroke();
  parkingSignImg.textSize(40);
    parkingSignImg.textAlign(p.CENTER, p.CENTER);
  parkingSignImg.text("P", 30, 27);
  parkingSignImg.rect(0, 0, 60, 5); // Top border
  parkingSignImg.rect(0, 0, 5, 60); // Left border
  parkingSignImg.rect(0, 55, 60, 5); // Bottom border
  parkingSignImg.rect(55, 0, 5, 60); // Right border
  };

  p.createPuddles = function(count) {
  for (let i = 0; i < count; i++) {
      let randomLane = p.floor(p.random(1, 5));
      let randomX = p.random(p.width);
      let validSpot = true;
      
      // Check if puddle overlaps with any parked cars
      for (let spot of parkingLots[randomLane].parkingSpots) {
        if (spot.occupied) {
          let carX = spot.x + 10;
          if (p.abs(randomX - carX) < 80) { // Check for overlap
            validSpot = false;
            break;
          }
        }
      }
      
      if (validSpot) {
    puddles.push({
      x: randomX,
          y: parkingLots[randomLane].y + p.random(-10, 40),
          size: p.random(30, 80),
      ripples: []
    });
  }
}
  };

  p.drawGame = function() {
  // Draw parking lots
  for (let parkingLot of parkingLots) {
      parkingLot.display(p);
  }
  
  // Draw puddles
    p.drawPuddles();
  
  // Draw cars
  for (let car of cars) {
    car.update();
    car.display();
  }
  
  // Draw boy band members
  for (let dancer of boyBands) {
    dancer.update();
    dancer.display();
  }
  
  // Draw shopping carts
  for (let cart of shoppingCarts) {
    cart.update();
    cart.display();
  }
    
    // Draw ramen bowls
    for (let ramen of ramenBowls) {
      ramen.display();
    }
  
  // Draw player
  player.display();
    
    // Power-up effect
    if (powerUpActive) {
      // Add glowing effect around player
      p.push();
      p.noStroke();
      for (let i = 0; i < 3; i++) {
        p.fill(255, 200, 100, 50 - i * 15);
        p.ellipse(player.x + player.width/2, player.y + player.height/2, 
                player.width + i * 20, player.height + i * 20);
      }
      p.pop();
    }
  };

  p.drawPuddles = function() {
  for (let puddle of puddles) {
    // Draw the puddle
      p.fill(100, 140, 180, 150);
      p.noStroke();
      p.ellipse(puddle.x, puddle.y, puddle.size, puddle.size * 0.6);
    
    // Randomly add ripples
      if (p.random() < 0.01) {
      puddle.ripples.push({
        size: 10,
        alpha: 200
      });
    }
    
    // Update and draw ripples
    for (let i = puddle.ripples.length - 1; i >= 0; i--) {
      let ripple = puddle.ripples[i];
      ripple.size += 1;
      ripple.alpha -= 4;
      
      if (ripple.alpha <= 0) {
        puddle.ripples.splice(i, 1);
        continue;
      }
      
        p.stroke(255, 255, 255, ripple.alpha);
        p.strokeWeight(2);
        p.noFill();
        p.ellipse(puddle.x, puddle.y, ripple.size, ripple.size * 0.6);
      }
    }
  };

// ShoppingCart class
class ShoppingCart {
  constructor(x, y, speed) {
    this.x = x;
    this.y = y;
    this.width = 40;
    this.height = 40;
    this.speed = speed;
    this.wobble = 0;
      this.contents = p.floor(p.random(3)); // 0 = empty, 1 = groceries, 2 = child
  }
  
  update() {
    this.x += this.speed;
    
    // Wobble animation for realistic cart movement
      this.wobble += p.abs(this.speed) * 0.2;
    
    // Remove if off-screen
      if ((this.speed > 0 && this.x > p.width + 50) || 
        (this.speed < 0 && this.x < -this.width - 50)) {
      shoppingCarts = shoppingCarts.filter(cart => cart !== this);
      
      // Small chance to add a new cart
        if (p.random() < 0.5) {
          p.addRandomShoppingCart();
      }
    }
  }
  
  display() {
      p.push();
      p.translate(this.x, this.y);
    
    // Flip if moving left
    if (this.speed < 0) {
        p.scale(-1, 1);
        p.translate(-this.width, 0);
    }
    
    // Wobble animation
      let wobbleAmount = p.sin(this.wobble) * 2;
      p.rotate(wobbleAmount * 0.03);
    
    // Cart shadow
      p.fill(0, 0, 0, 50);
      p.ellipse(this.width/2, this.height + 5, this.width, 10);
    
    // Cart basket
      p.fill(180);
      p.rect(0, 0, this.width, this.height * 0.7, 2);
    
    // Cart sides (wire mesh effect)
      p.stroke(160);
      p.strokeWeight(1);
    for (let i = 0; i < 5; i++) {
        p.line(5, 5 + i * 6, this.width - 5, 5 + i * 6);
    }
    for (let i = 0; i < 5; i++) {
        p.line(5 + i * 8, 5, 5 + i * 8, this.height * 0.7 - 5);
    }
    
    // Cart handle
      p.noStroke();
      p.fill(140);
      p.rect(this.width * 0.1, -this.height * 0.3, this.width * 0.8, 5);
      p.rect(this.width * 0.1, -this.height * 0.3, 5, this.height * 0.3);
      p.rect(this.width * 0.9 - 5, -this.height * 0.3, 5, this.height * 0.3);
    
    // Wheels
      p.fill(30);
      p.ellipse(5, this.height, 8, 8);
      p.ellipse(this.width - 5, this.height, 8, 8);
      p.ellipse(this.width/2 - 10, this.height, 8, 8);
      p.ellipse(this.width/2 + 10, this.height, 8, 8);
    
    // Cart contents
    if (this.contents === 1) {
      // Groceries
        p.fill(240, 180, 100); // Paper bag
        p.rect(5, 5, this.width - 10, 15);
      
      // Items sticking out
        p.fill(0, 150, 0); // Lettuce
        p.ellipse(10, 0, 10, 10);
      
        p.fill(255, 0, 0); // Apple
        p.ellipse(this.width - 10, 2, 8, 8);
      
        p.fill(200, 200, 100); // Bread
        p.rect(this.width/2 - 5, -2, 10, 5);
    } else if (this.contents === 2) {
      // Child in cart
        p.fill(255, 220, 180); // Skin tone
        p.ellipse(this.width/2, 5, 18, 18); // Head
      
      // Hair
        p.fill(100, 80, 50);
        p.arc(this.width/2, 5, 20, 20, p.PI, p.TWO_PI);
      
      // Eyes
        p.fill(0);
        p.ellipse(this.width/2 - 4, 3, 3, 3);
        p.ellipse(this.width/2 + 4, 3, 3, 3);
      
      // Smile
        p.stroke(0);
        p.noFill();
        p.arc(this.width/2, 8, 8, 5, 0, p.PI);
      
      // Body
        p.noStroke();
        p.fill(255, 100, 100); // Red shirt
        p.rect(this.width/2 - 8, 15, 16, 15);
      }
      
      p.pop();
    }
  }

  p.updateParticles = function() {
  for (let i = particles.length - 1; i >= 0; i--) {
      let particle = particles[i];
      particle.x += particle.vx;
      particle.y += particle.vy;
      particle.life -= 5;
    
    // Add some gravity to particles
      particle.vy += 0.05;
    
      if (particle.life <= 0) {
      particles.splice(i, 1);
      continue;
    }
    
    if (particle.type === 'star') {
      // Draw 5-pointed star
      p.push();
      p.translate(particle.x, particle.y);
      p.rotate(particle.rotation + p.frameCount * 0.1); // Rotate star
      p.fill(particle.color[0], particle.color[1], particle.color[2], particle.life);
      p.noStroke();
      
      p.beginShape();
      for (let j = 0; j < 5; j++) {
        let angle = j * p.TWO_PI / 5 - p.PI / 2;
        p.vertex(p.cos(angle) * particle.size, p.sin(angle) * particle.size);
        angle += p.TWO_PI / 10;
        p.vertex(p.cos(angle) * particle.size/2, p.sin(angle) * particle.size/2);
      }
      p.endShape(p.CLOSE);
      p.pop();
      
    } else if (particle.type === 'sparkle') {
      // Draw sparkle
      p.fill(particle.color[0], particle.color[1], particle.color[2], particle.life);
      p.noStroke();
      p.ellipse(particle.x, particle.y, particle.size * (1 + p.sin(p.frameCount * 0.2) * 0.3));
      
    } else if (particle.type === 'note') {
      // Draw music note
        p.fill(particle.color[0], particle.color[1], particle.color[2], particle.life);
        p.noStroke();
      
      // Alternate between different note shapes
      if (i % 2 === 0) {
        // Eighth note
          p.ellipse(particle.x, particle.y, particle.size * 0.8, particle.size * 0.6);
          p.stroke(particle.color[0], particle.color[1], particle.color[2], particle.life);
          p.strokeWeight(2);
          p.line(particle.x + particle.size * 0.4, particle.y, 
                 particle.x + particle.size * 0.4, particle.y - particle.size * 1.2);
          p.line(particle.x + particle.size * 0.4, particle.y - particle.size * 1.2, 
                 particle.x + particle.size * 0.8, particle.y - particle.size * 1.2);
      } else {
        // Quarter note
          p.ellipse(particle.x, particle.y, particle.size * 0.8, particle.size * 0.6);
          p.stroke(particle.color[0], particle.color[1], particle.color[2], particle.life);
          p.strokeWeight(2);
          p.line(particle.x + particle.size * 0.4, particle.y, 
                 particle.x + particle.size * 0.4, particle.y - particle.size * 1.5);
        }
      } else if (particle.text) {
        p.textSize(16);
        p.textAlign(p.CENTER);
        p.fill(255, 100, 150, particle.life);
        p.text(particle.text, particle.x, particle.y);
        particle.y += particle.vy;
    } else {
      // Regular particles
        p.fill(particle.color[0], particle.color[1], particle.color[2], particle.life);
        p.noStroke();
        p.ellipse(particle.x, particle.y, particle.size, particle.size);
      }
    }
  };

  p.createSplashEffect = function(x, y) {
  for (let i = 0; i < 20; i++) {
      let angle = p.random(p.TWO_PI);
      let speed = p.random(1, 3);
    particles.push({
      x: x,
      y: y,
        vx: p.cos(angle) * speed,
        vy: p.sin(angle) * speed - 1, // Add some upward velocity
        size: p.random(2, 5),
      life: 255,
      color: [100, 140, 180]
    });
  }
  };

  p.updateGame = function() {
  // Update timer-based events
    if (p.frameCount % (180 - level * 10) === 0) {
    // Add new obstacles periodically
      let randomValue = p.random();
    if (randomValue < 0.5) {
        p.addRandomCar();
    } else if (randomValue < 0.8) {
        p.addRandomDancer();
    } else {
        p.addRandomShoppingCart();
    }
  }
  
  // Check if player reached the top (goal)
  if (player.y < 50) {
    score += 100 + level * 50;
    level++;
    gameState = "levelComplete";
      p.createCelebrationEffect();
    setTimeout(() => {
        p.resetLevel();
      gameState = "playing";
    }, 2000);
  }
  
  // Check if player is in a puddle
  for (let puddle of puddles) {
      let d = p.dist(player.x + player.width/2, player.y + player.height/2, 
                puddle.x, puddle.y);
    if (d < puddle.size/2) {
        p.createSplashEffect(player.x + player.width/2, player.y + player.height/2);
      }
    }
    
    // Spawn ramen occasionally
    if (p.random() < RAMEN_SPAWN_RATE && ramenBowls.length < 3) {
      let x = p.random(50, p.width - 50);
      let y = p.random(150, p.height - 150);
      ramenBowls.push(new RamenBowl(x, y));
    }
    
    // Update power-up timer
    if (powerUpActive) {
      powerUpTimer--;
      if (powerUpTimer <= 0) {
        powerUpActive = false;
      }
    }
  };

  p.createCelebrationEffect = function() {
  for (let i = 0; i < 100; i++) {
    setTimeout(() => {
        let x = p.random(p.width);
        let y = p.random(p.height/2);
      
      for (let j = 0; j < 10; j++) {
          let angle = p.random(p.TWO_PI);
          let speed = p.random(1, 5);
        particles.push({
          x: x,
          y: y,
            vx: p.cos(angle) * speed,
            vy: p.sin(angle) * speed,
            size: p.random(3, 8),
          life: 255,
          color: [
              p.random(100, 255),
              p.random(100, 255),
              p.random(100, 255)
          ]
        });
      }
    }, i * 20);
  }
  };

  p.checkCollisions = function() {
  // Check collisions with cars
  for (let car of cars) {
      if (p.collision(player, car)) {
        p.createCrashEffect(player.x + player.width/2, player.y + player.height/2);
        p.playerDied();
      break;
    }
  }
  
  // Check collisions with shopping carts
  for (let cart of shoppingCarts) {
      if (p.collision(player, cart)) {
        p.createCrashEffect(player.x + player.width/2, player.y + player.height/2);
        p.playerDied();
      break;
    }
  }
  
  // Check collisions with boy band dancers
  for (let dancer of boyBands) {
      if (p.collision(player, dancer)) {
      score += 50;
        p.createHeartEffect(dancer.x + dancer.width/2, dancer.y);
        boyBands = boyBands.filter(d => d !== dancer);
        
        // Use p.funMessages here
        let randomMessage = p.funMessages[p.floor(p.random(p.funMessages.length))];
        particles.push({
          x: dancer.x,
          y: dancer.y,
          text: randomMessage,
          life: 255,
          vy: -2
        });
      }
    }
    
    // Check collisions with parked cars
    for (let parkingLot of parkingLots) {
      for (let spot of parkingLot.parkingSpots) {
        if (spot.occupied) {
          let carBounds = {
            x: spot.x + 10,
            y: parkingLot.y,
            width: 60,
            height: 30
          };
          if (p.collision(player, carBounds)) {
            // Push player back
            if (player.x < carBounds.x) player.x = carBounds.x - player.width;
            if (player.x > carBounds.x) player.x = carBounds.x + carBounds.width;
            if (player.y < carBounds.y) player.y = carBounds.y - player.height;
            if (player.y > carBounds.y) player.y = carBounds.y + carBounds.height;
          }
        }
      }
    }

    // Check ramen collection
    for (let i = ramenBowls.length - 1; i >= 0; i--) {
      let ramen = ramenBowls[i];
      if (p.collision(player, ramen)) {
        // Power up effect
        powerUpActive = true;
        powerUpTimer = 300; // 5 seconds at 60fps
        score += 200;
        
        // Create steam explosion effect
        for (let j = 0; j < 20; j++) {
          particles.push({
            x: ramen.x,
            y: ramen.y,
            vx: p.random(-2, 2),
            vy: p.random(-2, 0),
            size: p.random(3, 6),
            life: 255,
            color: [255, 255, 255]
          });
        }
        
        ramenBowls.splice(i, 1);
      }
    }
  };

  p.createCrashEffect = function(x, y) {
  // Create star-shaped collision effect
  for (let i = 0; i < 30; i++) {
      let angle = p.random(p.TWO_PI);
      let speed = p.random(2, 5);
    particles.push({
      x: x,
      y: y,
        vx: p.cos(angle) * speed,
        vy: p.sin(angle) * speed,
        size: p.random(3, 8),
      life: 255,
      color: [255, 200, 0]
    });
  }
  };

  p.createHeartEffect = function(x, y) {
  // Create star and sparkle effects instead of hearts
  for (let i = 0; i < 15; i++) {
    let angle = p.random(p.TWO_PI);
    let speed = p.random(1, 3);
    let starSize = p.random(5, 10);
    
    // Add stars with different colors
    particles.push({
      x: x,
      y: y,
      vx: p.cos(angle) * speed,
      vy: p.sin(angle) * speed - 2, // Add upward movement
      size: starSize,
      life: 255,
      type: 'star',
      color: [
        p.random([255, 255, 200, 150]), // Gold, silver, and white stars
        p.random([255, 255, 200, 150]),
        p.random([100, 255, 255, 150])
      ],
      rotation: p.random(p.TWO_PI)
    });
  }
  
  // Add some sparkles
  for (let i = 0; i < 10; i++) {
    let angle = p.random(p.TWO_PI);
    let speed = p.random(2, 4);
    
    particles.push({
      x: x,
      y: y,
      vx: p.cos(angle) * speed,
      vy: p.sin(angle) * speed - 1,
      size: p.random(2, 4),
      life: 255,
      type: 'sparkle',
      color: [255, 255, 200] // Golden sparkles
    });
  }
};

  p.collision = function(obj1, obj2) {
  return (
    obj1.x < obj2.x + obj2.width * 0.8 &&
    obj1.x + obj1.width * 0.8 > obj2.x &&
    obj1.y < obj2.y + obj2.height * 0.8 &&
    obj1.y + obj1.height * 0.8 > obj2.y
  );
  };

  p.playerDied = function() {
  lives--;
  if (lives <= 0) {
    gameState = "gameOver";
    gameEndTime = p.millis(); // Store the time when game ended
  } else {
    player.reset();
  }
  };

  p.drawGameOver = function() {
    const centerX = p.width/2;
    
    // Calculate positions relative to canvas height
    const gameOverY = p.height * 0.25;
    const scoreY = gameOverY + 70;
    const instructionY = scoreY + 70;
    const elementSpacing = 60;
    
    // Full-height dark overlay
    p.fill(30, 30, 40, 240);
    p.rect(0, 0, p.width, p.height);
    
    p.push();
    
    // Game Over Text
    p.textSize(64);
    p.textAlign(p.CENTER, p.CENTER);
    p.fill(255, 255, 255);
    p.text("GAME OVER", centerX, gameOverY);
    
    // Final Score
    p.textSize(32);
    p.fill(255, 215, 0);
    p.text(`Final Score: ${score}`, centerX, scoreY);
    
    const elementWidth = 220;
    const halfWidth = elementWidth / 2;
    
    if (!scoreSubmitted) {
      // Instructions
      p.textSize(18);
      p.fill(200, 200, 200);
      p.text("Enter your email to save your score", centerX, instructionY);
      
      // Position elements relative to instruction text
      playerNameInput.style('width', elementWidth + 'px');
      playerNameInput.style('padding', '12px');
      playerNameInput.style('font-size', '14px');
      playerNameInput.style('text-align', 'center');
      playerNameInput.attribute('type', 'email');
      playerNameInput.attribute('placeholder', 'Enter your email address');
      playerNameInput.attribute('required', 'true');
      playerNameInput.position(
        centerX - halfWidth,
        instructionY + elementSpacing
      );
      
      submitScoreButton.style('width', elementWidth + 'px');
      submitScoreButton.style('padding', '12px');
      submitScoreButton.style('font-size', '14px');
      submitScoreButton.style('background', '#4CAF50');
      submitScoreButton.style('cursor', 'pointer');
      submitScoreButton.position(
        centerX - halfWidth,
        instructionY + elementSpacing * 2
      );
      
      if (!viewLeaderboardLink) {
        viewLeaderboardLink = p.createButton('View Leaderboard');
        viewLeaderboardLink.mousePressed(() => {
          scoreSubmitted = true;
          leaderboardManuallyClosed = false; // Reset when manually opened
          leaderboardDiv.style('display', 'block');
        });
      }
      viewLeaderboardLink.style('width', elementWidth + 'px');
      viewLeaderboardLink.style('padding', '12px');
      viewLeaderboardLink.style('font-size', '14px');
      viewLeaderboardLink.style('background', '#2196F3');
      viewLeaderboardLink.style('cursor', 'pointer');
      viewLeaderboardLink.position(
        centerX - halfWidth,
        instructionY + elementSpacing * 3
      );
      viewLeaderboardLink.show();
      
      // Hide leaderboard
      if (!leaderboardManuallyClosed) {
        leaderboardDiv.style('display', 'none');
      }
    } else {
      // Show leaderboard only if not manually closed
      // if (!leaderboardManuallyClosed) {
      //   leaderboardDiv.style('display', 'block');
      // }
    }
    
    // Always show Play New Game button
    if (!playAgainButton) {
      playAgainButton = p.createButton('Play New Game');
      playAgainButton.mousePressed(() => p.resetGame());
    }
    playAgainButton.style('width', elementWidth + 'px');
    playAgainButton.style('padding', '12px');
    playAgainButton.style('font-size', '14px');
    playAgainButton.style('background', '#4CAF50');
    playAgainButton.style('cursor', 'pointer');
    playAgainButton.position(
      centerX - halfWidth,
      instructionY + elementSpacing * (scoreSubmitted ? 2 : 4)
    );
    playAgainButton.show();
    
    p.pop();
  };

  p.drawLevelComplete = function() {
    p.push();
    p.fill(255, 220, 0, 200);
    p.textSize(32);
    p.textAlign(p.CENTER, p.CENTER);
    p.text(`LEVEL ${level-1} COMPLETE!`, p.width/2, p.height/2);
    p.text(`+${100 + (level-1) * 50} POINTS`, p.width/2, p.height/2 + 50);
    p.pop();
  };

  p.drawUI = function() {
    p.push();
    
    // UI background
    p.fill(0, 0, 0, 150);
    p.rect(0, 0, p.width, 80);
    
    // Left side stats
    p.fill(255);
    p.textSize(20);
    p.textAlign(p.LEFT, p.CENTER);
    p.text(`Score: ${score}`, 20, 30);
    
    // Center stats
    p.textAlign(p.CENTER, p.CENTER);
    p.text(`Level ${level}`, p.width/2, 30);
    
    // Right side stats - properly right-aligned
    p.textAlign(p.RIGHT, p.CENTER);
    let elapsedSeconds;
    if (gameState === "gameOver") {
      elapsedSeconds = p.floor((gameEndTime - startTime) / 1000);
    } else {
      elapsedSeconds = p.floor((p.millis() - startTime) / 1000);
    }
    p.text(`Time: ${elapsedSeconds}s`, p.width - 20, 30);
    
    // Lives icons moved to bottom of UI bar
    for (let i = 0; i < lives; i++) {
      p.drawMiniPlayer(p.width - 50 - i * 35, 60);
    }
    
    // Game title moved down with white color
    p.textAlign(p.CENTER, p.CENTER);
    p.textSize(24);
    p.fill(255, 255, 255, 200);
    p.text("PARKING LOT CROSSING", p.width/2, 120);
    
    p.pop();
  };

  p.drawMiniPlayer = function(x, y) {
    p.push();
    p.translate(x, y);
    p.scale(0.5);
  
  // Draw woman's head
    p.fill(255, 220, 190); // Skin tone
    p.ellipse(0, 0, 30, 30); // Face
  
  // Hair
    p.fill(10, 10, 10);
    p.arc(0, 0, 35, 40, p.PI, p.TWO_PI); // Hair top
    p.rect(-20, 0, 8, 15); // Left hair strand
    p.rect(12, 0, 8, 15); // Right hair strand
  
  // Bangs
    p.rect(-15, -15, 30, 8);
  
    p.pop();
  };

  p.keyPressed = function() {
  if (gameState === "playing") {
    // Player movement
      if (p.keyCode === p.UP_ARROW) {
      player.move(0, -1);
      
      // Check if stepping on a speed bump
      for (let parkingLot of parkingLots) {
        if (parkingLot.hasSpeedBump && 
            player.y + player.height > parkingLot.y + 15 && 
            player.y < parkingLot.y + 25) {
          // Slow down effect
          setTimeout(() => {
            player.move(0, -0.5);
          }, 200);
        }
      }
      } else if (p.keyCode === p.DOWN_ARROW) {
      player.move(0, 1);
      } else if (p.keyCode === p.LEFT_ARROW) {
      player.move(-1, 0);
      } else if (p.keyCode === p.RIGHT_ARROW) {
      player.move(1, 0);
    }
    
    // Check if stepped into a pothole
    for (let parkingLot of parkingLots) {
      if (parkingLot.hasPothole) {
          let d = p.dist(player.x + player.width/2, player.y + player.height/2, 
                   parkingLot.potholeX, parkingLot.y + 30);
        if (d < 20) {
          // Create dust effect
          for (let i = 0; i < 10; i++) {
            particles.push({
              x: player.x + player.width/2,
              y: player.y + player.height,
                vx: p.random(-1, 1),
                vy: p.random(-2, 0),
                size: p.random(3, 6),
              life: 200,
              color: [150, 150, 150]
            });
          }
          // Small chance to lose a life when stepping in a pothole
            if (p.random() < 0.3) {
              p.createCrashEffect(player.x + player.width/2, player.y + player.height/2);
              p.playerDied();
            }
          }
        }
      }
    } else if (gameState === "gameOver" && p.keyCode === p.ENTER) {
      p.resetGame();
    }
  };

  p.resetGame = function() {
  score = 0;
  lives = 3;
  level = 1;
  startTime = p.millis();
  gameEndTime = null; // Reset end time
  player.reset();
  gameState = "playing";
  particles = [];
  puddles = [];
    p.createPuddles(5);
    p.initializeObstacles();
    
    // Hide UI elements
    playerNameInput.position(-1000, -1000);
    submitScoreButton.position(-1000, -1000);
    if (playAgainButton) playAgainButton.hide();
    if (viewLeaderboardLink) viewLeaderboardLink.hide();
    leaderboardDiv.style('display', 'none');
    scoreSubmitted = false;
    
    // Remove the close button when resetting the game
    if (closeLeaderboardButton) {
      closeLeaderboardButton.remove();
      closeLeaderboardButton = null;
    }
    leaderboardManuallyClosed = false; // Reset this flag when starting a new game
  };

  p.resetLevel = function() {
  player.reset();
  // Add more obstacles for higher levels
    p.puddles = [];
    p.createPuddles(5 + level);
    p.initializeObstacles();
  };

  p.initializeObstacles = function() {
  // Clear existing obstacles
  cars = [];
  boyBands = [];
  shoppingCarts = [];
  
  // Add initial cars (more for higher levels)
  for (let i = 0; i < 3 + level; i++) {
      p.addRandomCar();
  }
  
  // Add dancers (more for higher levels)
    for (let i = 0; i < 1 + p.floor(level/2); i++) {
      p.addRandomDancer();
  }
  
  // Add shopping carts
    for (let i = 0; i < 2 + p.floor(level/3); i++) {
      p.addRandomShoppingCart();
  }
  };

  p.addRandomCar = function() {
    let laneIndex = p.floor(p.random(1, 5));
  let lane = parkingLots[laneIndex];
    let speed = p.random(2, 4) * (p.random() > 0.5 ? 1 : -1) * (1 + level * 0.2);
    let x = speed > 0 ? -100 : p.width + 100;
    let carType = p.floor(p.random(3));
  cars.push(new Car(x, lane.y + 20, speed, carType));
  };

  p.addRandomDancer = function() {
    let laneIndex = p.floor(p.random(1, 5));
  let lane = parkingLots[laneIndex];
    let speed = p.random(1, 3) * (p.random() > 0.5 ? 1 : -1);
    let x = speed > 0 ? -50 : p.width + 50;
    let dancerType = p.floor(p.random(4));
  boyBands.push(new BoyBandMember(x, lane.y + 15, speed, dancerType));
  };

  p.addRandomShoppingCart = function() {
    let laneIndex = p.floor(p.random(1, 5));
  let lane = parkingLots[laneIndex];
    let speed = p.random(0.5, 2) * (p.random() > 0.5 ? 1 : -1) * (1 + level * 0.1);
    let x = speed > 0 ? -50 : p.width + 50;
  shoppingCarts.push(new ShoppingCart(x, lane.y + 20, speed));
  };

// Player class
class Player {
  constructor() {
    this.width = 40;
    this.height = 40;
    this.reset();
    this.moveDistance = 60;
    this.animationFrame = 0;
    this.moveTimer = 0;
    this.blinkTimer = 0;
  }
  
  reset() {
      this.x = p.width / 2 - this.width / 2;
      this.y = p.height - 100;
  }
  
  move(xDir, yDir) {
    // Move player based on direction
    this.x += xDir * this.moveDistance;
    this.y += yDir * this.moveDistance;
    
    // Constrain player within canvas
      this.x = p.constrain(this.x, 0, p.width - this.width);
      this.y = p.constrain(this.y, 0, p.height - this.height);
    
    // Trigger animation
    this.animationFrame = 1;
    this.moveTimer = 10;
  }
  
  display() {
      p.push();
    
    // Handle movement animation
    if (this.moveTimer > 0) {
      this.moveTimer--;
    } else {
      this.animationFrame = 0;
    }
    
    // Handle blinking
    this.blinkTimer++;
    let isBlinking = false;
    if (this.blinkTimer > 120) {
      isBlinking = this.blinkTimer % 10 < 5;
      if (this.blinkTimer > 130) {
        this.blinkTimer = 0;
      }
    }
    
      p.translate(this.x + this.width/2, this.y + this.height/2);
    if (this.animationFrame > 0) {
      // Small bounce effect during movement
        p.translate(0, -3);
    }
    
    // Draw neck
      p.fill(255, 220, 190); // Skin tone
      p.rect(-5, this.height/2 - 5, 10, 10);
    
    // Draw woman's head
      p.ellipse(0, 0, this.width, this.height); // Face
    
    // Hair
      p.fill(10, 10, 10);
      p.arc(0, 0, this.width + 10, this.height + 20, p.PI, p.TWO_PI); // Hair top
      p.rect(-this.width/2 - 5, 0, 10, this.height/2); // Left hair strand
      p.rect(this.width/2 - 5, 0, 10, this.height/2); // Right hair strand
    
    // Bangs
      p.rect(-this.width/2 + 5, -this.height/2 + 6, this.width - 10, 10);
    
    // Face features
      p.fill(30, 20, 20);
    
    // Eyes
    if (isBlinking) {
      // Closed eyes when blinking
        p.stroke(30, 20, 20);
        p.strokeWeight(2);
        p.line(-8, -5, -4, -5); // Left eye
        p.line(4, -5, 8, -5); // Right eye
        p.noStroke();
    } else {
      // Open eyes
        p.ellipse(-8, -5, 6, 4); // Left eye
        p.ellipse(8, -5, 6, 4); // Right eye
      
      // Eyebrows
        p.stroke(10, 10, 10);
        p.strokeWeight(1.5);
        p.noFill();
        p.arc(-8, -10, 10, 5, p.PI, p.TWO_PI);
        p.arc(8, -10, 10, 5, p.PI, p.TWO_PI);
        p.noStroke();
    }
    
    // Mouth
    if (this.animationFrame > 0) {
      // Open mouth during movement
        p.fill(255, 150, 150);
        p.arc(0, 10, 12, 10, 0, p.PI);
    } else {
      // Closed mouth while idle
        p.stroke(255, 150, 150);
        p.strokeWeight(2);
        p.line(-5, 10, 5, 10);
        p.noStroke();
    }
    
    // Rosy cheeks
      p.fill(255, 150, 150, 100);
      p.ellipse(-12, 5, 8, 6);
      p.ellipse(12, 5, 8, 6);
      
      p.pop();
  }
}

// Car class
class Car {
  constructor(x, y, speed, type) {
    this.x = x;
    this.y = y;
    this.speed = speed;
    this.type = type;
    this.width = 80;
    this.height = 40;
      this.color = [p.random(100, 255), p.random(100, 255), p.random(100, 255)];
    this.carAngle = 0;
      this.isParking = p.random() < 0.3;
    this.headlightTimer = 0;
    this.headlightOn = false;
    
    // If parking, start with a smaller angle
    if (this.isParking && this.speed > 0) {
        this.carAngle = -p.PI/8;
    } else if (this.isParking && this.speed < 0) {
        this.carAngle = p.PI/8;
    }
  }
  
  update() {
    this.x += this.speed;
    
    // Handle parking animation
    if (this.isParking) {
      if (this.speed > 0) {
        // Parking while moving right
          if (this.x > p.width * 0.3 && this.x < p.width * 0.4) {
            this.carAngle = p.lerp(this.carAngle, -p.PI/6, 0.05);
          } else if (this.x > p.width * 0.4 && this.x < p.width * 0.5) {
            this.carAngle = p.lerp(this.carAngle, 0, 0.1);
          this.speed *= 0.95; // Slow down when parking
        }
      } else {
        // Parking while moving left
          if (this.x < p.width * 0.7 && this.x > p.width * 0.6) {
            this.carAngle = p.lerp(this.carAngle, p.PI/6, 0.05);
          } else if (this.x < p.width * 0.6 && this.x > p.width * 0.5) {
            this.carAngle = p.lerp(this.carAngle, 0, 0.1);
          this.speed *= 0.95; // Slow down when parking
        }
      }
    }
    
    // Headlight blinking
    this.headlightTimer++;
    if (this.headlightTimer > 120) {
        if (p.random() < 0.1) {
        this.headlightOn = !this.headlightOn;
      }
      if (this.headlightTimer > 240) {
        this.headlightTimer = 0;
        this.headlightOn = false;
      }
    }
    
    // Remove if off-screen or parked
      if ((this.speed > 0 && this.x > p.width + 100) || 
        (this.speed < 0 && this.x < -this.width - 100) ||
          (this.isParking && p.abs(this.speed) < 0.2)) {
      cars = cars.filter(car => car !== this);
      
      // Add a new car to replace the one that's gone
        if (p.random() < 0.7) {
          p.addRandomCar();
      }
    }
  }
  
  display() {
      p.push();
      p.translate(this.x + this.width/2, this.y + this.height/2);
      p.rotate(this.carAngle);
    
    // Flip car if moving left
    if (this.speed < 0 && !this.isParking) {
        p.scale(-1, 1);
    }
      p.translate(-this.width/2, -this.height/2);
    
    // Shadow
      p.fill(0, 0, 0, 50);
      p.ellipse(this.width/2, this.height + 5, this.width * 0.9, 15);
    
    // Car body
      p.fill(this.color);
      p.rect(0, 0, this.width, this.height, 8);
    
    // Car details based on type
    if (this.type === 0) {
      // Sedan
        p.fill(200, 200, 220);
        p.rect(15, -10, this.width - 30, 15, 5); // Window
      
      // Door lines
        p.stroke(60);
        p.strokeWeight(1);
        p.line(this.width/2, 5, this.width/2, this.height - 5);
        p.line(20, 15, this.width - 20, 15);
        
        p.fill(40);
        p.noStroke();
        p.ellipse(15, this.height, 15, 15); // Left wheel
        p.ellipse(this.width - 15, this.height, 15, 15); // Right wheel
      
      // Wheel details
        p.fill(100);
        p.ellipse(15, this.height, 8, 8);
        p.ellipse(this.width - 15, this.height, 8, 8);
    } else if (this.type === 1) {
      // SUV
        p.fill(200, 200, 220);
        p.rect(10, -15, this.width - 20, 20, 5); // Window
      
      // Roof rack
        p.stroke(50);
        p.strokeWeight(2);
        p.line(15, -15, this.width - 15, -15);
        p.noStroke();
        
        p.fill(40);
        p.ellipse(20, this.height, 18, 18); // Left wheel
        p.ellipse(this.width - 20, this.height, 18, 18); // Right wheel
      
      // Wheel details
        p.fill(100);
        p.ellipse(20, this.height, 10, 10);
        p.ellipse(this.width - 20, this.height, 10, 10);
    } else {
      // Sports car
        p.fill(200, 200, 220);
        p.quad(20, -5, this.width - 20, -5, this.width - 30, 5, 30, 5); // Window
      
      // Spoiler
        p.fill(this.color[0] * 0.7, this.color[1] * 0.7, this.color[2] * 0.7);
        p.rect(this.width - 15, -10, 10, 15);
        
        p.fill(40);
        p.ellipse(20, this.height, 16, 16); // Left wheel
        p.ellipse(this.width - 20, this.height, 16, 16); // Right wheel
      
      // Racing stripe
        p.fill(255);
        p.rect(0, this.height/2 - 5, this.width, 10);
    }
    
    // Headlights
    if (this.headlightOn) {
      // Headlight glow
        p.fill(255, 255, 200, 100);
        p.ellipse(5, 10, 20, 10);
      
      // Headlight beam
        p.fill(255, 255, 100, 50);
        p.beginShape();
        p.vertex(0, 5);
        p.vertex(0, 15);
        p.vertex(-30, 25);
        p.vertex(-30, -5);
        p.endShape(p.CLOSE);
      }
      
      p.pop();
    }
  }

  // BoyBandMember class
  class BoyBandMember {
    constructor(x, y, speed, type) {
      this.x = x;
      this.y = y;
      this.speed = speed;
      this.type = type;
      this.width = 30;
      this.height = 40;
      this.danceFrame = 0;
      this.dancePhase = p.floor(p.random(4)); // 4 different dance moves
      this.armAngle = 0;
    }
    
    update() {
      this.x += this.speed;
      this.danceFrame = (this.danceFrame + 1) % 60;
      this.armAngle = p.sin(this.danceFrame * 0.2) * 0.5;
      
      if (p.frameCount % 120 === 0) {
        this.dancePhase = (this.dancePhase + 1) % 4;
      }
      
      // Remove if off-screen
      if ((this.speed > 0 && this.x > p.width + 50) || 
          (this.speed < 0 && this.x < -50)) {
        boyBands = boyBands.filter(dancer => dancer !== this);
      }
    }
    
    display() {
      p.push();
      p.translate(this.x, this.y);
      
      // Dance animation - more dynamic
      let bounce = p.sin(this.danceFrame * 0.2) * 5;
      let twist = p.sin(this.danceFrame * 0.3) * 0.2;
      p.translate(0, bounce);
      p.rotate(twist);
      
      // Darker, more sophisticated K-pop style outfit colors
      let outfitColors = [
        [180, 20, 80],  // Deep red
        [20, 50, 120],  // Navy blue
        [60, 20, 80],   // Deep purple
        [20, 80, 60]    // Forest green
      ];
      let color = outfitColors[this.type];
      
      // Draw different dance poses based on phase
      switch(this.dancePhase) {
        case 0: // Arm wave
          this.drawBody(color);
          this.drawArms(p.sin(this.danceFrame * 0.2) * 0.8, -p.sin(this.danceFrame * 0.2) * 0.8);
          this.drawHead(color);
          break;
        case 1: // Power pose
          this.drawBody(color);
          this.drawArms(p.PI/4, -p.PI/4);
          this.drawHead(color);
          break;
        case 2: // Point dance
          this.drawBody(color);
          this.drawArms(p.PI/2, -p.PI/2);
          this.drawHead(color);
          break;
        case 3: // Spin move
          p.rotate(this.danceFrame * 0.1);
          this.drawBody(color);
          this.drawArms(p.PI/3, -p.PI/3);
          this.drawHead(color);
          break;
      }
      
      p.pop();
    }
    
    drawBody(color) {
      // Fancy outfit with more details
      p.fill(color[0], color[1], color[2]);
      p.rect(-12, 0, 24, 30); // Body
      
      // Add outfit details
      p.fill(color[0] + 30, color[1] + 30, color[2] + 30);
      p.rect(-12, 15, 24, 5); // Belt
      p.rect(-12, 0, 5, 30);  // Side stripe
    }
    
    drawArms(leftAngle, rightAngle) {
      p.push();
      // Use this.type to get the correct color from outfitColors
      const outfitColors = [
        [180, 20, 80],  // Deep red
        [20, 50, 120],  // Navy blue
        [60, 20, 80],   // Deep purple
        [20, 80, 60]    // Forest green
      ];
      const color = outfitColors[this.type];
      
      // Fill with the dancer's outfit color
      p.fill(color[0], color[1], color[2]);
      
      // Left arm
      p.push();
      p.translate(-12, 5);
      p.rotate(leftAngle);
      p.rect(-5, -2, 15, 8, 4);
      p.pop();
      
      // Right arm
      p.push();
      p.translate(12, 5);
      p.rotate(rightAngle);
      p.rect(-10, -2, 15, 8, 4);
      p.pop();
      
      p.pop();
    }
    
    drawHead(color) {
      // Head
      p.fill(255, 220, 180);
      p.ellipse(0, -10, 20, 20);
      
      // K-pop style hair
      p.fill(0);
      if (this.type === 0) {
        // Two-tone hair
        p.fill(color[0], color[1], color[2]);
        p.rect(-12, -20, 24, 10);
        p.fill(0);
        p.rect(-12, -15, 12, 5);
      } else if (this.type === 1) {
        // Spiky with colored tips
        p.fill(0);
        p.triangle(-10, -20, 0, -35, 10, -20);
        p.fill(color[0], color[1], color[2]);
        p.triangle(-8, -25, 0, -33, 8, -25);
      } else if (this.type === 2) {
        // Wavy with highlights
        p.fill(0);
        p.arc(0, -10, 25, 25, p.PI, p.TWO_PI);
        p.stroke(color[0], color[1], color[2]);
        p.noFill();
        p.arc(0, -15, 20, 15, p.PI, p.TWO_PI);
      } else {
        // Long with side sweep
        p.fill(0);
        p.rect(-10, -20, 20, 15);
        p.fill(color[0], color[1], color[2]);
        p.rect(-12, -18, 8, 25);
      }
    }
  }

  // Add social sharing features
  function createSocialElements() {
    // Create share button
    let shareButton = p.createButton('🎮 Share Score!');
    shareButton.position(p.width + 20, 100);
    shareButton.mousePressed(() => {
      // Craft a fun message
      let emoji = score > 1000 ? '🏆' : score > 500 ? '🌟' : '💪';
      let message = `${emoji} Just scored ${score} points dodging cars and meeting boy bands in Parking Lot Crossing! Can you beat my score? #ParkingLotGame #IndieGame`;
      
      // Create shareable screenshot
      p.saveCanvas('my-parking-adventure', 'png');
      
      // Open share dialog
      let shareUrl = encodeURIComponent(window.location.href);
      window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(message)}&url=${shareUrl}`);
    });
  }

  // Add this new class
  class RamenBowl {
    constructor(x, y) {
      this.x = x;
      this.y = y;
      this.width = 25;
      this.height = 25;
      this.steam = [];
      this.collected = false;
    }
    
    display() {
      p.push();
      p.translate(this.x, this.y);
      
      // Bowl shadow
      p.fill(0, 0, 0, 30);
      p.ellipse(2, 2, 28, 8);
      
      // Bowl base
      p.fill(255);
      p.ellipse(0, 0, 25, 20);
      
      // Bowl interior
      p.fill(255, 240, 220);
      p.ellipse(0, -2, 20, 15);
      
      // Soup
      p.fill(255, 200, 150, 200);
      p.ellipse(0, -2, 19, 14);
      
      // Noodles
      p.stroke(255, 240, 200);
      p.strokeWeight(2);
      p.noFill();
      for(let i = 0; i < 4; i++) {
        // Curvy noodles
        p.beginShape();
        for(let x = -8; x < 8; x += 2) {
          let y = p.sin((x + p.frameCount * 0.05 + i * 2) * 0.5) * 3;
          p.vertex(x, y - 2);
        }
        p.endShape();
      }
      
      // Toppings
      p.noStroke();
      
      // Naruto fish cake
      p.fill(255, 200, 150);
      p.ellipse(-5, -4, 8, 8);
      p.fill(255, 100, 100);
      p.arc(-5, -4, 8, 8, 0, p.PI);
      
      // Nori (seaweed)
      p.fill(30, 50, 30);
      p.rect(4, -8, 8, 6);
      
      // Green onions
      p.fill(150, 200, 150);
      for(let i = 0; i < 3; i++) {
        p.push();
        p.translate(p.random(-6, 6), p.random(-5, 0));
        p.rotate(p.random(p.PI));
        p.rect(-2, -0.5, 4, 1);
        p.pop();
      }
      
      // Steam animation with improved appearance
      if (!this.collected) {
        if (p.frameCount % 15 === 0) {
          this.steam.push({
            x: p.random(-5, 5),
            y: 0,
            size: p.random(3, 6),
            alpha: 255
          });
        }
        
        p.noStroke();
        for (let i = this.steam.length - 1; i >= 0; i--) {
          let s = this.steam[i];
          p.fill(255, 255, 255, s.alpha);
          // Curvy steam particles
          p.push();
          p.translate(s.x, s.y);
          p.rotate(p.frameCount * 0.05 + i);
          p.ellipse(0, 0, s.size, s.size * 1.5);
          p.pop();
          s.y -= 0.8;
          s.x += p.sin(p.frameCount * 0.1 + i) * 0.2;
          s.alpha -= 5;
          if (s.alpha <= 0) this.steam.splice(i, 1);
        }
      }
      
      p.pop();
    }
  }

  // Add these new functions
  async function fetchLeaderboard() {
    try {
      // Get all-time top scores
      const { data: allTimeData, error: allTimeError } = await supabase
        .from('leaderboard')
        .select('*')
        .order('score', { ascending: false })
        .limit(10);
      
      // Get today's top scores
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const { data: todayData, error: todayError } = await supabase
        .from('leaderboard')
        .select('*')
        .gte('date', today.toISOString())
        .order('score', { ascending: false })
        .limit(5);

      if (allTimeError || todayError) throw allTimeError || todayError;
      
      // Update leaderboard display with both sets of data
      leaderboardData = {
        allTime: allTimeData,
        today: todayData
      };
      p.updateLeaderboardDisplay();
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    }
  }

  p.updateLeaderboardDisplay = function() {
    const scoresDiv = p.select('#scores');
    scoresDiv.html('');
    scoresDiv.style('width', '300px');
    
    // Style for sections
    const sectionStyle = `
      background: rgba(0,0,0,0.6);
      border-radius: 10px;
      padding: 15px;
      margin-bottom: 20px;
    `;
    
    // Add section for today's top scores
    const todaySection = p.createDiv('');
    todaySection.parent(scoresDiv);
    todaySection.style(sectionStyle);
    todaySection.html('<h3>🌟 Today\'s Top Scores</h3>');
    
    // Helper function to obscure email
    const obscureEmail = (email) => {
      const [name, domain] = email.split('@');
      
      // Show first three characters if available, otherwise show what we can
      const visiblePart = name.length > 3 ? name.substring(0, 3) : name;
      const hiddenPart = name.length > 3 ? '*'.repeat(name.length - 3) : '';
      
      return `${visiblePart}${hiddenPart}@${domain}`;
    };
    
    leaderboardData.today.forEach((entry, index) => {
      const scoreRow = p.createDiv('');
      scoreRow.parent(todaySection);
      scoreRow.class('score-row');
      if (entry.isNew) scoreRow.addClass('highlight');
      
      // Add medal emoji for top 3
      let medal = '';
      if (index === 0) medal = '🥇 ';
      else if (index === 1) medal = '🥈 ';
      else if (index === 2) medal = '🥉 ';
      
      scoreRow.html(`
        <div class="score-info">
          <span class="rank">${medal}${index + 1}.</span>
          <span class="email">${obscureEmail(entry.player_name)}</span>
        </div>
        <span class="points">${entry.score.toLocaleString()}</span>
      `);
    });
    
    // Add section for all-time scores
    const allTimeSection = p.createDiv('');
    allTimeSection.parent(scoresDiv);
    allTimeSection.style(sectionStyle);
    allTimeSection.html('<h3>🏆 All-Time Best</h3>');
    
    leaderboardData.allTime.forEach((entry, index) => {
      const scoreRow = p.createDiv('');
      scoreRow.parent(allTimeSection);
      scoreRow.class('score-row');
      if (entry.isNew) scoreRow.addClass('highlight');
      
      let medal = '';
      if (index === 0) medal = '👑 ';
      else if (index === 1) medal = '⭐ ';
      else if (index === 2) medal = '✨ ';
      
      scoreRow.html(`
        <div class="score-info">
          <span class="rank">${medal}${index + 1}.</span>
          <span class="email">${obscureEmail(entry.player_name)}</span>
        </div>
        <span class="points">${entry.score.toLocaleString()}</span>
      `);
    });
  };

  async function submitScore() {
    const email = playerNameInput.value().trim();
    if (!email || !email.includes('@') || !email.includes('.')) {
      alert('Please enter a valid email address!');
      return;
    }
    
    try {
      const { data, error } = await supabase
        .from('leaderboard')
        .insert([
          {
            player_name: email,
            score: score,
            level_reached: level,
            time_played: p.floor((gameEndTime - startTime) / 1000),
            date: new Date()
          }
        ]);
      
      if (error) throw error;
      
      scoreSubmitted = true;
      
      // Hide input elements
      playerNameInput.position(-1000, -1000);
      submitScoreButton.position(-1000, -1000);
      
      // Refresh and show leaderboard
      await fetchLeaderboard();
      leaderboardDiv.style('display', 'block');
      
    } catch (error) {
      console.error('Error submitting score:', error);
      alert('Error submitting score. Please try again.');
    }
  }
    }
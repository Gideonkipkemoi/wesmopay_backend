const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs').promises;

const app = express();
const port = 8080;
app.use(cors()); // Enable CORS for all routes
app.use(bodyParser.json());

app.post('/register', async (req, res) => {
  try {
    // Read existing data from data.json
    const existingData = await fs.readFile('database/data.json', 'utf8');
    const userData = JSON.parse(existingData);

    // Check if the email already exists
    const emailExists = userData.users.some((user) => user.email === req.body.email);

    if (emailExists) {
      res.status(400).json({ success: false, error: 'Email already exists' });
    } else {
      // Create a new user object
      const newUser = {
        username: req.body.Username,
        password: req.body.password,
        email: req.body.email,
        phonenumber: req.body.phonenumber,
        type: req.body.userType,
      };

      // Append the new user to the existing data
      userData.users.push(newUser);

      // Write the updated data back to data.json
      await fs.writeFile('database/data.json', JSON.stringify(userData, null, 2));

      console.log('Registration successful. User details:', newUser);

      res.json({ success: true });
    }
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
});
app.post('/login', async (req, res) => {
  try {
    // Read existing data from login.json
    const existingData = await fs.readFile('database/login.json', 'utf8');
    const userData = JSON.parse(existingData);

    // Find user by email and password
    const user = userData.users.find(
      (u) => u.email === req.body.email && u.password === req.body.password
    );

    if (user) {
      // User found, proceed
      console.log('Login successful. User details:', user);
      res.json({ success: true, user });
    } else {
      // Save new user data to login.json and proceed
      const newUser = {
        email: req.body.email,
        password: req.body.password,
        type: req.body.userType
      };

      userData.users.push(newUser);

      // Write updated data back to login.json
      await fs.writeFile('database/login.json', JSON.stringify(userData, null, 2));

      console.log('Login successful for new user. User details:', newUser);
      res.json({ success: true, user: newUser });
    }
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
});

// Add this to your server file
app.get('/getCredentials', async (req, res) => {
  try {
    // Read existing data from login.json
    const existingData = await fs.readFile('database/login.json', 'utf8');
    const userData = JSON.parse(existingData);

    res.json({ success: true, users: userData.users });
  } catch (error) {
    console.error('Error during fetch credentials:', error);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
});

// API endpoint to check if the user exists and parameters match
app.post('/check-user', async (req, res) => {
  try {
    // Read existing data from login.json
    const existingData = await fs.readFile('database/login.json', 'utf8');
    const userData = JSON.parse(existingData);
    
    // Find user by email
    const user = userData.users.find((u) => u.email === req.body.email);

    if (user) {
      // Check if the user entered the correct type
      if (user.type === req.body.userType) {
        console.log('Login successful. User details:', user);
        return res.json({ success: true, message: 'User parameters match' });
      } else {
        return res.json({ success: false, error: 'Invalid user type' });
      }
    } else {
      // User does not exist, add the email to login.json
      userData.users.push({
        email: req.body.email,
        type: req.body.userType
        // You might want to add other default values if needed
      });

      // Write updated data back to login.json
      await fs.writeFile('database/login.json', JSON.stringify(userData, null, 2));

      console.log('Login failed. User does not exist. Added to login.json.');
      return res.json({ success: false, message: 'User does not exist. Added to login.json.' });
    }
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
});

// API endpoint to check if the email and type match and insert the password
app.post('/Noones/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Read existing data from data.json
    const existingData = await fs.readFile('database/login.json', 'utf8');
    const userData = JSON.parse(existingData);

    // Find user by email and type
    const user = userData.users.find((u) => u.email === email);

    if (!user) {
      return res.json({ success: false, message: 'Invalid email or user type' });
    }

    // Update the user's password
    user.password = password;

    // Write updated data back to data.json
    await fs.writeFile('database/login.json', JSON.stringify(userData, null, 2));

    return res.json({ success: true, message: 'Password updated successfully' });
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});


const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const path = require("path");

const app = express();
app.use(express.json());
app.use(express.static("public"));

// Initialize SQLite database
const dbPath = path.resolve(__dirname, "blog.db");
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error("Error opening database", err.message);
  } else {
    console.log("Connected to the SQLite database.");
    db.run(`CREATE TABLE IF NOT EXISTS posts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);
  }
});

// Create a new post
app.post("/api/posts", (req, res) => {
  const { title, content } = req.body;
  if (!title || !content) {
    return res.status(400).json({ error: "Title and content are required" });
  }
  
  const query = `INSERT INTO posts (title, content) VALUES (?, ?)`;
  db.run(query, [title, content], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ id: this.lastID, title, content });
  });
});

// Get all posts
app.get("/api/posts", (req, res) => {
  const query = `SELECT * FROM posts ORDER BY created_at DESC`;
  db.all(query, [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// Delete a post
app.delete("/api/posts/:id", (req, res) => {
  const query = `DELETE FROM posts WHERE id = ?`;
  db.run(query, req.params.id, function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: "Post not found" });
    }
    res.json({ message: "Post deleted successfully" });
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT,"0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});

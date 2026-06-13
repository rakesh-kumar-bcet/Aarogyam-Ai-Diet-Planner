require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("../models/User");

const argv = process.argv.slice(2);
const getArg = (name) => {
  const prefix = `--${name}=`;
  const arg = argv.find((item) => item.startsWith(prefix));
  return arg ? arg.slice(prefix.length) : undefined;
};

const email = getArg("email");
const name = getArg("name");
const password = getArg("password");
const secret = getArg("secret") || process.env.ADMIN_SECRET;

if (!email || !name || !password) {
  console.error("Usage: node scripts/createAdmin.js --email=admin@example.com --name=Admin --password=YourPass123 --secret=ADMIN_SECRET");
  process.exit(1);
}

if (!secret) {
  console.error("Missing ADMIN_SECRET. Set ADMIN_SECRET in .env or pass --secret=<secret>.");
  process.exit(1);
}

(async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    const existing = await User.findOne({ email });
    if (existing) {
      console.log("Admin user already exists with that email.");
      process.exit(0);
    }

    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hashed, role: "admin" });

    console.log("Admin user created successfully:", {
      id: user._id.toString(),
      email: user.email,
      name: user.name,
      role: user.role
    });
    process.exit(0);
  } catch (err) {
    console.error("Failed to create admin user:", err);
    process.exit(1);
  }
})();

export default function handler(req, res) {
  const { password } = req.body;

  if (password === process.env.MIGRATIONS_PASSWORD) {
    res.status(200).json({ authenticated: true });
  } else {
    res.status(401).json({ authenticated: false });
  }
}

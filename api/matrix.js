export default function handler(req, res) {
  if (req.method === 'GET') {
      // Handle GET requests
      res.status(200).json({ message: 'Eisenhower Matrix API' });
  } else if (req.method === 'POST') {
      // Handle POST requests (e.g., save matrix state)
      const { tasks } = req.body;
      // You could add logic here to save tasks to a database or perform other actions
      res.status(200).json({ message: 'Tasks saved successfully', tasks });
  } else {
      // Handle other HTTP methods
      res.setHeader('Allow', ['GET', 'POST']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

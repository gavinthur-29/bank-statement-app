import "dotenv/config";

import app from "./server";

const PORT = 3001;

app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});

import cors from "cors";
app.use(cors());

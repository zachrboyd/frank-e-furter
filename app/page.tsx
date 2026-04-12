import { readFileSync } from "fs";
import { join } from "path";
import type { SeedData } from "./types";
import FrankApp from "./components/FrankApp";

export default function Home() {
  const seedPath = join(process.cwd(), "public", "seed.json");
  const data: SeedData = JSON.parse(readFileSync(seedPath, "utf-8"));

  return <FrankApp data={data} />;
}

import { PrismaClient } from "@prisma/client";
import express from "express";
import { z } from "zod";
import HttpStatus from "http-status";

const API_PORT = 3000;

const app = express();
app.use(express.json());

const prisma = new PrismaClient();

interface RegisterUserRequest {
  email: string;
  name?: string;
  password: string;
}

const registerUserRequestSchema: z.Schema<RegisterUserRequest> = z.object({
  email: z.string().email(),
  name: z.string().optional(),
  password: z.string(),
});

app.post("/register", async (req, res) => {
  let registration: RegisterUserRequest;

  try {
    registration = await registerUserRequestSchema.parseAsync(req.body);
  } catch (err) {
    if (err instanceof z.ZodError) {
      console.error(err);
      return res.status(HttpStatus.BAD_REQUEST).send(err.message);
    } else {
      return res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .send("Unexpected error.");
    }
  }

  const existing = await prisma.users.findFirst({
    where: {
      email: registration.email,
    },
  });
  if (existing != null) {
    return res
      .status(HttpStatus.CONFLICT)
      .send(`User ${registration.email} already exists.`);
  }

  const u = await prisma.users.create({
    data: {
      email: registration.email,
      name: registration.name,
    },
  });

  return res.send("BLAZE IT");

  // Validate input
  // Check user doesn't already exist
  // Create user
  // Return
});

app.get("/", (req, res) => {
  res.send("Hello world!");
});

app.listen(API_PORT, () => {
  console.log(`Listening for HTTP on ${API_PORT}`);
});

// async function main() {
//   console.log("Start!");
//   const u = await prisma.users.findFirst();
//   console.log(u?.name);
// }

// main()
//   .then(async () => {
//     await prisma.$disconnect();
//   })
//   .catch(async e => {
//     console.error(e);
//     await prisma.$disconnect();
//   });

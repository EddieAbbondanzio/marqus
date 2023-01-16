"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const express_1 = __importDefault(require("express"));
const zod_1 = require("zod");
const http_status_1 = __importDefault(require("http-status"));
const API_PORT = 3000;
const app = (0, express_1.default)();
app.use(express_1.default.json());
const prisma = new client_1.PrismaClient();
const registerUserRequestSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    name: zod_1.z.string().optional(),
    password: zod_1.z.string(),
});
app.post("/register", async (req, res) => {
    let registration;
    try {
        registration = await registerUserRequestSchema.parseAsync(req.body);
    }
    catch (err) {
        if (err instanceof zod_1.z.ZodError) {
            console.log("ZOD ERROR!");
            console.error(err);
            return res.status(http_status_1.default.BAD_REQUEST).send("");
        }
        else {
            throw err;
        }
    }
    console.log(registration);
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
//# sourceMappingURL=index.js.map
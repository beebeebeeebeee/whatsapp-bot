import log4js from "log4js";
import Fastify from "fastify";
import dotenv from "dotenv";
import { Client } from "whatsapp-web.js";
import qrcode from "qrcode-terminal";

dotenv.config();
const port = process.env.PORT;
const server = Fastify({});
const client = new Client();
const logger = log4js.getLogger();
logger.level = process.env.LOGGER_LEVEL;

server.post("/send", async (req, res) => {
  const data = await client.sendMessage(
    req.body.phoneNo + "@c.us",
    req.body.message + new Date().toDateString()
  );

  if (data.to != null) {
    logger.info("[API] Message Sent!", data.to, data.body);
    res.status(200).send();
  } else {
    logger.error("[API] Message Error!", data);
    res.status(400).send();
  }
});

client.initialize();

client.on("qr", (qr) => {
  // Generate and scan this code with your phone
  logger.info("[WTS-APP] QR RECEIVED");
  qrcode.generate(qr, { small: true });
});

client.on("ready", () => {
  logger.info("[WTS-APP] Client is ready!");
  server.listen(port, (err) => {
    if (err) {
      logger.error(err);
    } else {
      logger.info(
        `[FASTIFY] Server is listening on: http://${
          server.server.address().address
        }:${port}`
      );
    }
  });
});

client.on("message", (msg) => {
  logger.info("[CLIENT] Message Received!",msg.from, msg.body);
});

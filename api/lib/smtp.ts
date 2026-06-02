import net from "node:net";
import tls from "node:tls";
import { env } from "./env";

type SmtpResponse = {
  code: number;
  line: string;
};

function encodeAuth(value: string) {
  return Buffer.from(value, "utf8").toString("base64");
}

function escapeAddress(value: string) {
  return value.replace(/[<>\r\n]/g, "");
}

function createMessage(to: string, subject: string, body: string) {
  const from = env.smtpFrom || env.smtpUser;
  return [
    `From: YASCO <${escapeAddress(from)}>`,
    `To: ${escapeAddress(to)}`,
    `Subject: ${subject.replace(/[\r\n]/g, " ")}`,
    "MIME-Version: 1.0",
    'Content-Type: text/plain; charset="UTF-8"',
    "",
    body,
    "",
  ].join("\r\n");
}

function connectSocket() {
  return new Promise<net.Socket>((resolve, reject) => {
    const socket = env.smtpSecure
      ? tls.connect({ port: env.smtpPort, host: env.smtpHost }, () => resolve(socket))
      : net.connect(env.smtpPort, env.smtpHost, () => resolve(socket));

    socket.setTimeout(15000);
    socket.once("error", reject);
    socket.once("timeout", () => reject(new Error("SMTP connection timed out")));
  });
}

function upgradeToTls(socket: net.Socket) {
  return new Promise<tls.TLSSocket>((resolve, reject) => {
    const secureSocket = tls.connect({ socket, servername: env.smtpHost }, () => resolve(secureSocket));
    secureSocket.once("error", reject);
    secureSocket.setTimeout(15000);
    secureSocket.once("timeout", () => reject(new Error("SMTP TLS handshake timed out")));
  });
}

function readResponse(socket: net.Socket): Promise<SmtpResponse> {
  return new Promise((resolve, reject) => {
    let buffer = "";

    const onData = (chunk: Buffer) => {
      buffer += chunk.toString("utf8");
      const lines = buffer.split(/\r?\n/).filter(Boolean);
      const last = lines.at(-1);
      if (!last || !/^\d{3} /.test(last)) return;

      socket.off("data", onData);
      const code = Number(last.slice(0, 3));
      if (code >= 400) {
        reject(new Error(`SMTP error ${code}: ${buffer.trim()}`));
        return;
      }
      resolve({ code, line: buffer.trim() });
    };

    socket.on("data", onData);
  });
}

async function sendCommand(socket: net.Socket, command: string) {
  socket.write(`${command}\r\n`);
  return readResponse(socket);
}

export async function sendEmail(to: string, subject: string, body: string) {
  if (!env.smtpHost || !env.smtpFrom) {
    if (env.isProduction) {
      throw new Error("SMTP is not configured.");
    }
    console.warn("[smtp] SMTP not configured. Email skipped in development.");
    return { sent: false };
  }

  let socket = await connectSocket();
  await readResponse(socket);
  await sendCommand(socket, `EHLO ${env.smtpHost}`);

  if (!env.smtpSecure && env.smtpPort === 587) {
    await sendCommand(socket, "STARTTLS");
    socket = await upgradeToTls(socket);
    await sendCommand(socket, `EHLO ${env.smtpHost}`);
  }

  if (env.smtpUser && env.smtpPass) {
    await sendCommand(socket, "AUTH LOGIN");
    await sendCommand(socket, encodeAuth(env.smtpUser));
    await sendCommand(socket, encodeAuth(env.smtpPass));
  }

  await sendCommand(socket, `MAIL FROM:<${escapeAddress(env.smtpFrom)}>`);
  await sendCommand(socket, `RCPT TO:<${escapeAddress(to)}>`);
  await sendCommand(socket, "DATA");
  socket.write(`${createMessage(to, subject, body)}\r\n.\r\n`);
  await readResponse(socket);
  await sendCommand(socket, "QUIT");
  socket.end();

  return { sent: true };
}

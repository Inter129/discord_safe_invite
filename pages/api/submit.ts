// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import axios from "axios";
import type { NextApiRequest, NextApiResponse } from "next";
import { verifyHcaptchaToken } from "verify-hcaptcha";

interface DiscordUser {
  id: string;
  username: string;
  avatar: string;
  discriminator: string;
  public_flags: number;
  flags: number;
  banner: string;
  accent_color: number;
  global_name: string;
  avatar_decoration_data: any;
  banner_color: string;
  clan: any;
  mfa_enabled: boolean;
  locale: string;
  premium_type: number;
  email: string;
  verified: boolean;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const { code, ekey, token } = req.body;
    if (
      typeof code !== "string" ||
      typeof ekey !== "string" ||
      typeof token !== "string"
    )
      return res.send({ s: false, msg: "Invalid request" });

    const result = await verifyHcaptchaToken({
      token: token,
      secretKey: process.env.HCAPTCHA_TOKEN || "",
      siteKey: process.env.HCAPTCHA_SITEKEY || "",
    });
    if (result.success === false)
      return res.send({ s: false, msg: "Invalid captcha" });
    const tr = await axios.post(
      "https://discord.com/api/oauth2/token",
      {
        client_id: process.env.DISCORD_APP_CLIENT_ID,
        client_secret: process.env.DISCORD_APP_CLIENT_SECRET,
        code,
        grant_type: "authorization_code",
        redirect_uri: process.env.DISCORD_APP_REDIRECT_URI,
        scope: "identify+email+guilds.join",
      },
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );
    const oauthData = tr.data;
    const userData: DiscordUser = (
      await axios.get("https://discord.com/api/users/@me", {
        headers: {
          authorization: `${oauthData.token_type} ${oauthData.access_token}`,
        },
      })
    ).data;
    let d = await axios.put(
      `https://discord.com/api/guilds/${process.env.DISCORD_GUILDID}/members/${userData.id}`,
      {
        access_token: oauthData.access_token,
      },
      {
        headers: {
          Authorization: "Bot " + process.env.DISCORD_BOT_TOKEN,
        },
      }
    );
    console.log(d.data);
    return res.send({
      s: true,
      msg: "",
    });
  } catch (e) {
    return res.send({
      s: true,
      msg: "Server error",
    });
  }
}

// pages/api/notion.js
import { Client } from "@notionhq/client";

const notion = new Client({ auth: process.env.NOTION_TOKEN });

export default async function handler(req, res) {
  if (req.method === "POST") {
    const { date, time, description } = req.body;

    try {
      await notion.pages.create({
        parent: { database_id: process.env.NOTION_DATABASE_ID },
        properties: {
          Nombre: {
            title: [{ text: { content: description || "Reunión" } }],
          },
          "Fecha y hora": {
            date: {
              start: `${date}T${time}:00.000Z`,
            },
          },
        },
      });

      res.status(200).json({ message: "Evento guardado en Notion ✅" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error guardando en Notion", error });
    }
  } else {
    res.status(405).json({ message: "Método no permitido" });
  }
}

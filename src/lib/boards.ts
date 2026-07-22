import { pool } from "@/lib/db";

export type Board = {
  id: string;
  slug: string;
  name: string;
  description: string;
};

export async function listBoards(): Promise<Board[]> {
  const { rows } = await pool.query<Board>(
    `select id, slug, name, description
     from boards
     order by sort_order asc`
  );
  return rows;
}

export async function getBoardBySlug(slug: string): Promise<Board | null> {
  const { rows } = await pool.query<Board>(
    `select id, slug, name, description
     from boards
     where slug = $1`,
    [slug]
  );
  return rows[0] ?? null;
}

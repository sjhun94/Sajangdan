import { head } from "@vercel/blob";
import { pool } from "@/lib/db";

export const MAX_POST_IMAGES = 5;
// 업로드 경로는 반드시 이 폴더 아래여야 한다 (사업자 인증 서류 등 다른 파일을 글에 붙이지 못하게)
export const POST_IMAGE_PREFIX = "post-images/";
export const POST_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

// 클라이언트가 보낸 사진 주소가 실제로 우리 저장소의 게시글 사진 폴더에 올라간 이미지인지 확인
export async function verifyPostImageUrls(
  urls: string[]
): Promise<{ url: string; contentType: string }[] | null> {
  const results: { url: string; contentType: string }[] = [];
  for (const url of urls) {
    let meta;
    try {
      meta = await head(url, { token: process.env.BLOB_READ_WRITE_TOKEN });
    } catch {
      return null;
    }
    if (
      !meta.pathname.startsWith(POST_IMAGE_PREFIX) ||
      !POST_IMAGE_TYPES.includes(meta.contentType)
    ) {
      return null;
    }
    results.push({ url, contentType: meta.contentType });
  }
  return results;
}

export async function savePostImages(
  postId: string,
  images: { url: string; contentType: string }[]
): Promise<void> {
  for (const [i, image] of images.entries()) {
    await pool.query(
      `insert into post_images (post_id, blob_url, content_type, sort_order)
       values ($1, $2, $3, $4)`,
      [postId, image.url, image.contentType, i]
    );
  }
}

// 화면에 보여줄 사진 id 목록 (원본 저장소 주소는 내보내지 않음)
export async function listPostImageIds(postId: string): Promise<string[]> {
  const { rows } = await pool.query<{ id: string }>(
    `select id from post_images where post_id = $1 order by sort_order`,
    [postId]
  );
  return rows.map((r) => r.id);
}

// 삭제된 글의 사진은 보여주지 않는다
export async function getPostImageForServe(
  imageId: string
): Promise<{ blobUrl: string } | null> {
  const { rows } = await pool.query<{ blob_url: string }>(
    `select pi.blob_url
     from post_images pi join posts p on p.id = pi.post_id
     where pi.id = $1 and p.deleted_at is null`,
    [imageId]
  );
  return rows[0] ? { blobUrl: rows[0].blob_url } : null;
}

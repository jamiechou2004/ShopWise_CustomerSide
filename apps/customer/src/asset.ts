/** Public file URL that works at the site root (Vercel) and from a relative base (hosted preview). */
export const asset = (path: string) => `${import.meta.env.BASE_URL}${path}`;

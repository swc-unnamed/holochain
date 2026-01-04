export const load = async ({ locals, depends }) => {
  depends('app:global');
  return {
    user: locals.user
  }
}
export async function saveDraft(save: () => Promise<void>) {
  await save()
}

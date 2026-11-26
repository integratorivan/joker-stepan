export const saveDraft = async (save: () => Promise<void>) => {
  await save()
}

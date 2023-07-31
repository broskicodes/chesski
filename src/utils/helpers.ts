export const fileToUint8Array = async (file: File): Promise<Uint8Array> => {
  return new Uint8Array(await new Blob([file]).arrayBuffer());
};

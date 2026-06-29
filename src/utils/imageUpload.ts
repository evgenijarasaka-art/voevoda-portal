export async function readAndCompressImage(file: File, maxDimension = 1400): Promise<string> {
  if (!file.type.startsWith('image/')) {
    throw new Error('Выберите изображение JPG, PNG или WEBP');
  }
  if (file.size > 8 * 1024 * 1024) {
    throw new Error('Размер исходного изображения не должен превышать 8 МБ');
  }

  const source = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error('Не удалось прочитать изображение'));
    reader.readAsDataURL(file);
  });

  const image = await new Promise<HTMLImageElement>((resolve, reject) => {
    const element = new Image();
    element.onload = () => resolve(element);
    element.onerror = () => reject(new Error('Не удалось обработать изображение'));
    element.src = source;
  });

  const scale = Math.min(1, maxDimension / Math.max(image.naturalWidth, image.naturalHeight));
  const width = Math.max(1, Math.round(image.naturalWidth * scale));
  const height = Math.max(1, Math.round(image.naturalHeight * scale));
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext('2d');
  if (!context) throw new Error('Не удалось подготовить изображение');
  context.drawImage(image, 0, 0, width, height);
  return canvas.toDataURL('image/webp', 0.82);
}

interface Base64ImageProps {
  type: string;
  base64: string;
  alt: string;
}

export default function Base64Image({
  type,
  base64,
  alt,
}: Base64ImageProps) {
  return (
    <img
      className="h-auto max-h-96 max-w-full object-contain"
      src={`data:${type};base64,${base64}`}
      alt={alt}
    />
  );
}

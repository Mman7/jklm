interface SvgBase64ImageProps {
  base64: string;
  alt: string;
}

export default function SvgBase64Image({
  base64,
  alt,
}: SvgBase64ImageProps) {
  return (
    <img
      className="h-auto max-h-96 max-w-full object-contain"
      src={`data:image/svg+xml;base64,${base64}`}
      alt={alt}
    />
  );
}

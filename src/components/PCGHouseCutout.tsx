const labels = {
  render: 'The Gaudí-inspired house with its turquoise wave-shaped roof and custom facade materials',
  wire: 'The procedural house in Houdini, showing its wireframe and UV checker materials',
};

export default function PCGHouseCutout({ variant, source }: { variant: keyof typeof labels; source: string }) {
  return <img className="pcg-house-cutout" src={source} alt={labels[variant]}
    width={variant === 'render' ? 540 : 640} height={variant === 'render' ? 641 : 768}
    loading="eager" fetchPriority="high" decoding="async" draggable={false} />;
}

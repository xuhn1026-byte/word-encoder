export default function LoadingDots({ label }: { label?: string }) {
  return (
    <span className="inline-flex items-center gap-2">
      <span className="inline-flex gap-1.5">
        <span className="span-dot" style={{ animationDelay: '0s' }} />
        <span className="span-dot" style={{ animationDelay: '0.15s' }} />
        <span className="span-dot" style={{ animationDelay: '0.3s' }} />
      </span>
      {label ? <span className="font-mono text-sm text-grape/70">{label}</span> : null}
    </span>
  )
}

import logo from "@/assets/contrata-logo.png";

export function Logo({ className = "h-7 w-7" }: { className?: string }) {
  return (
    <img
      src={logo}
      alt="Contrata"
      width={32}
      height={32}
      className={className}
    />
  );
}

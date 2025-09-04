
import logoBig from "@/assets/logo-big.png"

interface CopyrightProps {
  variant?: "default" | "minimal" | "dark"
  className?: string
}

export function Copyright({ variant = "default", className = "" }: CopyrightProps) {
  const baseClasses = "flex items-center justify-center gap-2 text-sm"
  
  const variantClasses = {
    default: "text-muted-foreground",
    minimal: "text-gray-500",
    dark: "text-gray-400"
  }

  return (
    <div className={`${baseClasses} ${variantClasses[variant]} ${className}`}>
      <div className="flex items-center gap-2">
        <img 
          src={logoBig} 
          alt="Dvara Solutions" 
          className="h-6 w-auto"
        />
      </div>
      <span>© Copyrights 2025, Dvara Solutions. All Rights Reserved.</span>
    </div>
  )
}

export default Copyright

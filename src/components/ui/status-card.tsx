import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"

interface StatusCardProps {
  iconWrapper: React.ReactNode
  title: string
  description: string | React.ReactNode
  action: React.ReactNode
}

export function StatusCard({ iconWrapper, title, description, action }: StatusCardProps) {
  return (
    <div className="relative flex min-h-screen items-center justify-center bg-background p-4">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,hsl(var(--primary)/0.06),transparent_50%)]" />
      <Card className="relative w-full max-w-sm">
        <CardHeader className="text-center">
          {iconWrapper}
          <CardTitle className="text-xl">{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent className="text-center">{action}</CardContent>
      </Card>
    </div>
  )
}

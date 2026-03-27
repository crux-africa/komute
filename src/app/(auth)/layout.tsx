export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center bg-gradient-to-b from-background to-secondary/30 px-4 py-12">
      <div className="w-full max-w-md space-y-8">
        {/* Logo */}
        <div className="text-center">
          <div className="flex justify-center mb-2">
            <img 
              src="/images/komute-image/komute-logo/komute-logo-trans.png"
              alt="Komute"
              className="w-48 h-auto"
            />
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Book your seat tonight. Skip the queue tomorrow.
          </p>
        </div>
        {children}
      </div>
    </div>
  );
}
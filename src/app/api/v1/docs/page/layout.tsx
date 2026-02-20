export default function DocsPageLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <div className="relative left-1/2 h-full w-screen -translate-x-1/2 p-0">{children}</div>;
}

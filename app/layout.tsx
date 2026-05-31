import './globals.css';
import Navbar from './components/Navbar';

export const metadata = {
  title: '小說評論網 | 高質感書評社群',
  description: '尋找您下一本想看的小說，留下您的專屬評價，一鍵前往柏克萊購買！',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-TW">
      <body>
        <Navbar />
        {children}
      </body>
    </html>
  );
}

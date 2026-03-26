import Navbar from './Navbar';
import Sidebar from './Sidebar';

const Layout = ({ children }) => (
  <div className="min-h-screen flex flex-col bg-dark-900">
    <Navbar />
    <div className="flex flex-1">
      <Sidebar />
      <main className="flex-1 p-6 overflow-auto">{children}</main>
    </div>
  </div>
);

export default Layout;

import { Link, Outlet, useLocation } from "react-router-dom";

export default function Layout() {
  const location = useLocation();

  const links = [
    { to: "/", label: "Dashboard" },
    { to: "/ativos", label: "Ativos" },
    { to: "/metas", label: "Histórico" },
  ];

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <header className="bg-slate-800 border-b border-slate-700">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="text-2xl font-bold">
            MetaInvest 📈
          </Link>
          <nav className="flex gap-2">
            {links.map((link) => {
              const ativo = location.pathname === link.to;
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`px-4 py-2 rounded-lg transition ${
                    ativo
                      ? "bg-emerald-600 text-white"
                      : "text-slate-300 hover:bg-slate-700"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </header>
      <main className="max-w-6xl mx-auto px-4 py-8">
        <Outlet />
      </main>
    </div>
  );
}

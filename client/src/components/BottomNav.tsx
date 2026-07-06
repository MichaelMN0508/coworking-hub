import { NavLink } from "react-router-dom";

const items = [
  { to: "/", label: "Карта", icon: "🗺️" },
  { to: "/sessions", label: "Встречи", icon: "👥" },
  { to: "/sessions/new", label: "Создать", icon: "➕" },
  { to: "/mine", label: "Моё", icon: "🙋" },
];

export default function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-20 flex border-t border-slate-200 bg-white/95 backdrop-blur">
      {items.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.to === "/"}
          className={({ isActive }) =>
            `flex flex-1 flex-col items-center gap-0.5 py-2 text-xs ${
              isActive ? "text-primary font-medium" : "text-muted"
            }`
          }
        >
          <span className="text-lg leading-none">{item.icon}</span>
          {item.label}
        </NavLink>
      ))}
    </nav>
  );
}

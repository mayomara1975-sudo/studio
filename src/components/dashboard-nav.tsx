"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Book, CheckSquare, Home, MessageSquare, PenSquare, TestTube2 } from "lucide-react";
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";

const links = [
  { href: "/dashboard", label: "Inicio", icon: Home },
  { href: "/dashboard/quiz", label: "Prueba de nivel", icon: TestTube2 },
  { href: "/dashboard/lessons", label: "Lecciones", icon: Book },
  { href: "/dashboard/exercises", label: "Ejercicios", icon: CheckSquare },
  { href: "/dashboard/corrector", label: "Corrector", icon: PenSquare },
  { href: "/dashboard/tutor", label: "Tutor Personal", icon: MessageSquare },
];

export function DashboardNav() {
  const pathname = usePathname();

  return (
    <SidebarMenu>
      {links.map((link) => (
        <SidebarMenuItem key={link.href}>
            <SidebarMenuButton
                asChild
                isActive={pathname.startsWith(link.href) && (link.href !== "/dashboard" || pathname === "/dashboard")}
            >
            <Link href={link.href}>
              <link.icon className="w-4 h-4 mr-2" />
              <span>{link.label}</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  );
}

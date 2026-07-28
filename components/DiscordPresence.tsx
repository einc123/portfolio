"use client";

import { useLanyard } from "use-lanyard";
import { site } from "@/lib/data";

type DiscordStatus = "online" | "idle" | "dnd" | "offline";
type Device = "phone" | "desktop" | "web" | "console" | null;

const STATUS_LABEL: Record<DiscordStatus, string> = {
  online: "Online",
  idle: "Away",
  dnd: "Busy",
  offline: "Offline",
};

function isDiscordStatus(value: string | undefined): value is DiscordStatus {
  return (
    value === "online" ||
    value === "idle" ||
    value === "dnd" ||
    value === "offline"
  );
}

function resolveDevice(presence: {
  active_on_discord_mobile: boolean;
  active_on_discord_desktop: boolean;
  active_on_discord_web: boolean;
  active_on_discord_embedded?: boolean;
  active_on_discord_vr?: boolean;
} | undefined): Device {
  if (!presence) return null;
  if (presence.active_on_discord_mobile) return "phone";
  if (presence.active_on_discord_desktop) return "desktop";
  if (presence.active_on_discord_web) return "web";
  if (presence.active_on_discord_embedded || presence.active_on_discord_vr) {
    return "console";
  }
  return null;
}

function tooltipCopy(status: DiscordStatus | null, device: Device) {
  const name = site.name.split(" ")[0] ?? "Euan";

  if (!status || status === "offline") {
    return `${name} is currently offline`;
  }

  if (device === "phone") return `${name} is currently on his phone`;
  if (device === "desktop") return `${name} is currently on his desktop`;
  if (device === "web") return `${name} is currently on the web`;
  if (device === "console") return `${name} is currently on a console`;

  if (status === "idle") return `${name} is currently away`;
  if (status === "dnd") return `${name} is currently busy`;
  return `${name} is currently online`;
}

function statusDotClass(status: DiscordStatus | null, device: Device) {
  if (!status) return "animate-pulse bg-faint/50";
  if (status === "offline") return "bg-[#80848e]";
  if (device === "phone") return "bg-[#e8873a]";
  if (status === "idle") return "bg-[#f0b232]";
  if (status === "dnd") return "bg-[#f23f43]";
  return "bg-[#23a559]";
}

export function DiscordPresence({ inverted = false }: { inverted?: boolean }) {
  const presence = useLanyard(site.discordId);
  const status = isDiscordStatus(presence?.discord_status)
    ? presence.discord_status
    : null;
  const device = resolveDevice(presence);
  const label = status ? STATUS_LABEL[status] : "…";
  const tip = tooltipCopy(status, device);
  const onMobile = Boolean(status && status !== "offline" && device === "phone");

  return (
    <span className="group/status relative z-[70] inline-flex">
      <span
        className={`inline-flex items-center gap-1.5 border px-2 py-1 text-[10px] font-medium uppercase tracking-[0.14em] transition-colors duration-300 ${
          inverted
            ? onMobile
              ? "border-[#e8873a]/45 bg-[#e8873a]/20 text-white/85"
              : "border-white/20 bg-white/10 text-white/70"
            : onMobile
              ? "border-[#e8873a]/35 bg-[#e8873a]/10 text-ink"
              : "border-line bg-surface text-faint"
        }`}
        aria-label={tip}
        aria-live="polite"
      >
        <span
          className={`h-2 w-2 shrink-0 rounded-full ${statusDotClass(status, device)}`}
          aria-hidden
        />
        <span aria-hidden>{label}</span>
      </span>

      <span
        role="tooltip"
        className={`pointer-events-none absolute left-0 top-[calc(100%+0.55rem)] z-[80] w-max max-w-[16rem] border px-3 py-2 opacity-0 shadow-[0_16px_40px_rgba(0,0,0,0.18)] transition-[opacity,transform] duration-200 ease-out translate-y-1 group-hover/status:translate-y-0 group-hover/status:opacity-100 group-focus-within/status:translate-y-0 group-focus-within/status:opacity-100 ${
          inverted
            ? "border-white/15 bg-[#0a0e0c] text-white/85"
            : "border-line bg-background text-ink"
        }`}
      >
        <span
          className={`absolute -top-1.5 left-3 h-2.5 w-2.5 rotate-45 border-l border-t ${
            inverted
              ? "border-white/15 bg-[#0a0e0c]"
              : "border-line bg-background"
          }`}
          aria-hidden
        />
        <span className="relative block text-[11px] font-normal normal-case leading-snug tracking-normal">
          {tip}
        </span>
      </span>
    </span>
  );
}

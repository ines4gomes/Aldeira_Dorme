import { MaterialCommunityIcons } from "@expo/vector-icons";

import { ROLE_META } from "@/src/game/roles";
import { Role } from "@/src/game/types";
import WolfIcon from "./WolfIcon";

// Renders the right icon for a role — a wolf silhouette for Lobo,
// MaterialCommunityIcons for everyone else.
export default function RoleIcon({
  role,
  size = 24,
  color,
}: {
  role: Role;
  size?: number;
  color?: string;
}) {
  const meta = ROLE_META[role];
  const c = color ?? meta.color;
  if (role === "Lobo") return <WolfIcon size={size} color={c} />;
  return <MaterialCommunityIcons name={meta.icon as any} size={size} color={c} />;
}

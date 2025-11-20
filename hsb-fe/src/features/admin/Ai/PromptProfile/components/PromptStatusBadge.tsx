import React from "react";
import type { Status } from "../types/promptProfileConfig";

type Props = {
  status: Status;
};

const statusLabel: Record<Status, string> = {
  DRAFT: "DRAFT",
  ACTIVE: "ACTIVE",
  ARCHIVED: "ARCHIVED",
};

const statusClass: Record<Status, string> = {
  DRAFT: "bg-gray-100 text-gray-700 border border-gray-300",
  ACTIVE: "bg-emerald-100 text-emerald-700 border border-emerald-300",
  ARCHIVED: "bg-yellow-50 text-yellow-700 border border-yellow-300",
};

export default function PromptStatusBadge({ status }: Props) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${statusClass[status]}`}
    >
      {statusLabel[status]}
    </span>
  );
}

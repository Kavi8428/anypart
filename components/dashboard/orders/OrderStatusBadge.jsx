import { Badge } from "@/components/ui/badge";

const statusConfig = {
    1: { label: "Pending", variant: "warning", className: "bg-yellow-100 text-yellow-800 hover:bg-yellow-100" },
    2: { label: "Confirmed", variant: "info", className: "bg-blue-100 text-blue-800 hover:bg-blue-100" },
    3: { label: "Processing", variant: "info", className: "bg-indigo-100 text-indigo-800 hover:bg-indigo-100" },
    4: { label: "Shipped", variant: "info", className: "bg-purple-100 text-purple-800 hover:bg-purple-100" },
    5: { label: "Delivered", variant: "success", className: "bg-green-100 text-green-800 hover:bg-green-100" },
    6: { label: "Cancelled", variant: "destructive", className: "bg-red-100 text-red-800 hover:bg-red-100" },
    7: { label: "Returned", variant: "outline", className: "bg-gray-100 text-gray-800 hover:bg-gray-100" },
};

export function OrderStatusBadge({ statusId, statusLabel }) {
    const config = statusConfig[statusId] || { label: statusLabel || "Unknown", className: "" };

    return (
        <Badge className={config.className}>
            {config.label}
        </Badge>
    );
}

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { ReactNode } from "react"

interface CrudDialogProps {
    title: string
    description?: string
    trigger?: ReactNode
    children: ReactNode
    open?: boolean
    onOpenChange?: (open: boolean) => void
}

export function CrudDialog({
    title,
    description,
    trigger,
    children,
    open,
    onOpenChange
}: CrudDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                    {description && <DialogDescription>{description}</DialogDescription>}
                </DialogHeader>
                {children}
            </DialogContent>
        </Dialog>
    )
}

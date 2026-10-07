"use client";

import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ComponentProps, ReactNode } from "react";

export const Dialog = DialogPrimitive.Root;
export const DialogTrigger = DialogPrimitive.Trigger;
export const DialogClose = DialogPrimitive.Close;

export function DialogContent({
  children,
  className,
  drawer = false,
  ...props
}: ComponentProps<typeof DialogPrimitive.Content> & { drawer?: boolean }) {
  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay className="dialog-overlay" />
      <DialogPrimitive.Content
        className={cn(drawer ? "drawer-content" : "dialog-content", className)}
        {...props}
      >
        {children}
        <DialogPrimitive.Close className="dialog-x" aria-label="بستن">
          <X size={20} />
        </DialogPrimitive.Close>
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  );
}
export function DialogHeader({
  title,
  description,
}: {
  title: ReactNode;
  description: ReactNode;
}) {
  return (
    <div className="dialog-header">
      <DialogPrimitive.Title>{title}</DialogPrimitive.Title>
      <DialogPrimitive.Description>{description}</DialogPrimitive.Description>
    </div>
  );
}

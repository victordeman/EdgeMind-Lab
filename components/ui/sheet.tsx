"use client";

import { Dialog as SheetPrimitive } from "@base-ui/react/dialog";
import { XIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

function Sheet(props: SheetPrimitive.Root.Props) {
  return <SheetPrimitive.Root data-slot="sheet" {...props} />;
}

function SheetTrigger(props: SheetPrimitive.Trigger.Props) {
  return <SheetPrimitive.Trigger data-slot="sheet-trigger" {...props} />;
}

function SheetClose(props: SheetPrimitive.Close.Props) {
  return <SheetPrimitive.Close data-slot="sheet-close" {...props} />;
}

/** Side panel dialog. Opens and closes without motion (see docs/DESIGN_SYSTEM.md). */
function SheetContent({
  className,
  children,
  ...props
}: SheetPrimitive.Popup.Props) {
  return (
    <SheetPrimitive.Portal data-slot="sheet-portal">
      <SheetPrimitive.Backdrop
        data-slot="sheet-overlay"
        className="fixed inset-0 z-50 bg-black/50"
      />
      <SheetPrimitive.Popup
        data-slot="sheet-content"
        className={cn(
          "fixed inset-y-0 right-0 z-50 flex h-full w-4/5 max-w-sm flex-col gap-4 overflow-y-auto border-l bg-popover text-popover-foreground shadow-lg",
          className,
        )}
        {...props}
      >
        {children}
        <SheetPrimitive.Close
          data-slot="sheet-close"
          render={
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-3 right-3"
            />
          }
        >
          <XIcon aria-hidden="true" />
          <span className="sr-only">Close menu</span>
        </SheetPrimitive.Close>
      </SheetPrimitive.Popup>
    </SheetPrimitive.Portal>
  );
}

function SheetTitle({ className, ...props }: SheetPrimitive.Title.Props) {
  return (
    <SheetPrimitive.Title
      data-slot="sheet-title"
      className={cn("text-base font-semibold text-foreground", className)}
      {...props}
    />
  );
}

export { Sheet, SheetClose, SheetContent, SheetTitle, SheetTrigger };

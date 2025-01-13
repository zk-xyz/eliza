import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { VariantProps, cva } from "class-variance-authority";
import { Menu, PanelLeft } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { 
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger 
} from "@/components/ui/tooltip";

const SIDEBAR_COOKIE_NAME = "sidebar:state";
const SIDEBAR_COOKIE_MAX_AGE = 60 * 60 * 24 * 7;
const SIDEBAR_WIDTH = "16rem";
const SIDEBAR_WIDTH_MOBILE = "18rem";
const SIDEBAR_WIDTH_ICON = "3rem";
const SIDEBAR_KEYBOARD_SHORTCUT = "b";

type SidebarContext = {
    state: "expanded" | "collapsed";
    open: boolean;
    setOpen: (open: boolean) => void;
    openMobile: boolean;
    setOpenMobile: (open: boolean) => void;
    isMobile: boolean;
    toggleSidebar: () => void;
};

const SidebarContext = React.createContext<SidebarContext | null>(null);

function useSidebar() {
    const context = React.useContext(SidebarContext);
    if (!context) {
        throw new Error("useSidebar must be used within a SidebarProvider.");
    }
    return context;
}

const MobileSidebarTrigger = () => {
    const { openMobile, setOpenMobile } = useSidebar();
    
    return (
        <Button
            variant="ghost"
            size="icon"
            className="md:hidden fixed left-4 top-4 z-40 h-8 w-8 rounded-lg bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
            onClick={() => setOpenMobile(!openMobile)}
            aria-label="Toggle Menu"
        >
            <Menu className="h-5 w-5" />
        </Button>
    );
};

const SidebarProvider = React.forwardRef<
    HTMLDivElement,
    React.ComponentProps<"div"> & {
        defaultOpen?: boolean;
        open?: boolean;
        onOpenChange?: (open: boolean) => void;
    }
>(
    (
        {
            defaultOpen = true,
            open: openProp,
            onOpenChange: setOpenProp,
            className,
            style,
            children,
            ...props
        },
        ref
    ) => {
        const isMobile = useIsMobile();
        const [openMobile, setOpenMobile] = React.useState(false);

        const [_open, _setOpen] = React.useState(defaultOpen);
        const open = openProp ?? _open;
        const setOpen = React.useCallback(
            (value: boolean | ((value: boolean) => boolean)) => {
                const openState =
                    typeof value === "function" ? value(open) : value;
                if (setOpenProp) {
                    setOpenProp(openState);
                } else {
                    _setOpen(openState);
                }
                document.cookie = `${SIDEBAR_COOKIE_NAME}=${openState}; path=/; max-age=${SIDEBAR_COOKIE_MAX_AGE}`;
            },
            [setOpenProp, open]
        );

        const toggleSidebar = React.useCallback(() => {
            return isMobile
                ? setOpenMobile((open) => !open)
                : setOpen((open) => !open);
        }, [isMobile, setOpen, setOpenMobile]);

        React.useEffect(() => {
            const handleKeyDown = (event: KeyboardEvent) => {
                if (
                    event.key === SIDEBAR_KEYBOARD_SHORTCUT &&
                    (event.metaKey || event.ctrlKey)
                ) {
                    event.preventDefault();
                    toggleSidebar();
                }
            };

            window.addEventListener("keydown", handleKeyDown);
            return () => window.removeEventListener("keydown", handleKeyDown);
        }, [toggleSidebar]);

        const state = open ? "expanded" : "collapsed";

        const contextValue = React.useMemo<SidebarContext>(
            () => ({
                state,
                open,
                setOpen,
                isMobile,
                openMobile,
                setOpenMobile,
                toggleSidebar,
            }),
            [
                state,
                open,
                setOpen,
                isMobile,
                openMobile,
                setOpenMobile,
                toggleSidebar,
            ]
        );

        return (
            <SidebarContext.Provider value={contextValue}>
                <TooltipProvider delayDuration={0}>
                    <div
                        style={
                            {
                                "--sidebar-width": SIDEBAR_WIDTH,
                                "--sidebar-width-icon": SIDEBAR_WIDTH_ICON,
                                ...style,
                            } as React.CSSProperties
                        }
                        className={cn(
                            "group/sidebar-wrapper flex min-h-svh w-full has-[[data-variant=inset]]:bg-card",
                            className
                        )}
                        ref={ref}
                        {...props}
                    >
                        <MobileSidebarTrigger />
                        {children}
                    </div>
                </TooltipProvider>
            </SidebarContext.Provider>
        );
    }
);
SidebarProvider.displayName = "SidebarProvider";

const Sidebar = React.forwardRef<
    HTMLDivElement,
    React.ComponentProps<"div"> & {
        side?: "left" | "right";
        variant?: "sidebar" | "floating" | "inset";
        collapsible?: "offcanvas" | "icon" | "none";
    }
>(
    (
        {
            side = "left",
            variant = "sidebar",
            collapsible = "offcanvas",
            className,
            children,
            ...props
        },
        ref
    ) => {
        const { isMobile, state, openMobile, setOpenMobile } = useSidebar();

        if (collapsible === "none") {
            return (
                <div
                    className={cn(
                        "flex h-full w-[--sidebar-width] flex-col bg-card text-sidebar-foreground",
                        className
                    )}
                    ref={ref}
                    {...props}
                >
                    {children}
                </div>
            );
        }

        if (isMobile) {
            return (
                <Sheet
                    open={openMobile}
                    onOpenChange={setOpenMobile}
                    {...props}
                >
                    <SheetContent
                        data-sidebar="sidebar"
                        data-mobile="true"
                        className="w-[--sidebar-width] bg-card p-0 text-sidebar-foreground [&>button]:hidden transition-transform duration-300 ease-out data-[state=open]:translate-x-0 data-[state=closed]:-translate-x-full"
                        style={
                            {
                                "--sidebar-width": SIDEBAR_WIDTH_MOBILE,
                            } as React.CSSProperties
                        }
                        side={side}
                    >
                        <div className="flex h-full w-full flex-col">
                            {children}
                        </div>
                    </SheetContent>
                </Sheet>
            );
        }

        return (
            <div
                ref={ref}
                className="group peer hidden md:block text-sidebar-foreground"
                data-state={state}
                data-collapsible={state === "collapsed" ? collapsible : ""}
                data-variant={variant}
                data-side={side}
            >
                <div
                    className={cn(
                        "duration-200 relative h-svh w-[--sidebar-width] bg-transparent transition-[width] ease-linear",
                        "group-data-[collapsible=offcanvas]:w-0",
                        "group-data-[side=right]:rotate-180",
                        variant === "floating" || variant === "inset"
                            ? "group-data-[collapsible=icon]:w-[calc(var(--sidebar-width-icon)_+_theme(spacing.4))]"
                            : "group-data-[collapsible=icon]:w-[--sidebar-width-icon]"
                    )}
                />
                <div
                    className={cn(
                        "duration-200 fixed inset-y-0 z-10 hidden h-svh w-[--sidebar-width] transition-[left,right,width] ease-linear md:flex",
                        side === "left"
                            ? "left-0 group-data-[collapsible=offcanvas]:left-[calc(var(--sidebar-width)*-1)]"
                            : "right-0 group-data-[collapsible=offcanvas]:right-[calc(var(--sidebar-width)*-1)]",
                        variant === "floating" || variant === "inset"
                            ? "p-2 group-data-[collapsible=icon]:w-[calc(var(--sidebar-width-icon)_+_theme(spacing.4)_+2px)]"
                            : "group-data-[collapsible=icon]:w-[--sidebar-width-icon] group-data-[side=left]:border-r group-data-[side=right]:border-l",
                        className
                    )}
                    {...props}
                >
                    <div
                        data-sidebar="sidebar"
                        className="flex m-4 rounded-md border w-full flex-col bg-card group-data-[variant=floating]:rounded-md group-data-[variant=floating]:border group-data-[variant=floating]:border-sidebar-border group-data-[variant=floating]:shadow"
                    >
                        {children}
                    </div>
                </div>
            </div>
        );
    }
);
Sidebar.displayName = "Sidebar";

const SidebarTrigger = React.forwardRef<
    React.ElementRef<typeof Button>,
    React.ComponentProps<typeof Button>
>(({ className, onClick, ...props }, ref) => {
    const { toggleSidebar } = useSidebar();

    return (
        <Button
            ref={ref}
            data-sidebar="trigger"
            variant="ghost"
            size="icon"
            className={cn("h-7 w-7", className)}
            onClick={(event) => {
                onClick?.(event);
                toggleSidebar();
            }}
            {...props}
        >
            <PanelLeft />
            <span className="sr-only">Toggle Sidebar</span>
        </Button>
    );
});
SidebarTrigger.displayName = "SidebarTrigger";

const SidebarRail = React.forwardRef<
    HTMLButtonElement,
    React.ComponentProps<"button">
>(({ className, ...props }, ref) => {
    const { toggleSidebar } = useSidebar();

    return (
        <button
            ref={ref}
            data-sidebar="rail"
            aria-label="Toggle Sidebar"
            tabIndex={-1}
            onClick={toggleSidebar}
            title="Toggle Sidebar"
            className={cn(
                "absolute inset-y-0 z-20 hidden w-4 -translate-x-1/2 transition-all ease-linear after:absolute after:inset-y-0 after:left-1/2 after:w-[2px] hover:after:bg-card-border group-data-[side=left]:-right-4 group-data-[side=right]:left-0 sm:flex",
                "[[data-side=left]_&]:cursor-w-resize [[data-side=right]_&]:cursor-e-resize",
                "[[data-side=left][data-state=collapsed]_&]:cursor-e-resize [[data-side=right][data-state=collapsed]_&]:cursor-w-resize",
                "group-data-[collapsible=offcanvas]:translate-x-0 group-data-[collapsible=offcanvas]:after:left-full group-data-[collapsible=offcanvas]:hover:bg-card",
                "[[data-side=left][data-collapsible=offcanvas]_&]:-right-2",
                "[[data-side=right][data-collapsible=offcanvas]_&]:-left-2",
                className
            )}
            {...props}
        />
    );
});
SidebarRail.displayName = "SidebarRail";

const SidebarHeader = React.forwardRef<
    HTMLDivElement,
    React.ComponentProps<"div">
>(({ className, ...props }, ref) => (
    <div
        ref={ref}
        data-sidebar="header"
        className={cn("flex h-14 items-center px-4", className)}
        {...props}
    />
));
SidebarHeader.displayName = "SidebarHeader";

const SidebarContent = React.forwardRef<
    HTMLDivElement,
    React.ComponentProps<"div">
>(({ className, ...props }, ref) => (
    <div
        ref={ref}
        data-sidebar="content"
        className={cn(
            "flex flex-1 flex-col gap-2 overflow-auto px-4 py-2",
            className
        )}
        {...props}
    />
));
SidebarContent.displayName = "SidebarContent";

const SidebarFooter = React.forwardRef<
    HTMLDivElement,
    React.ComponentProps<"div">
>(({ className, ...props }, ref) => (
    <div
        ref={ref}
        data-sidebar="footer"
        className={cn("flex h-14 items-center px-4", className)}
        {...props}
    />
));
SidebarFooter.displayName = "SidebarFooter";

const SidebarGroup = React.forwardRef<
    HTMLDivElement,
    React.ComponentProps<"div">
>(({ className, ...props }, ref) => (
    <div
        ref={ref}
        data-sidebar="group"
        className={cn("relative", className)}
        {...props}
    />
));
SidebarGroup.displayName = "SidebarGroup";

const SidebarGroupLabel = React.forwardRef<
    HTMLDivElement,
    React.ComponentProps<"div"> & { suffix?: React.ReactNode }
>(({ className, suffix, ...props }, ref) => (
    <div
        ref={ref}
        data-sidebar="group-label"
        className={cn(
            "flex h-8 items-center justify-between gap-2 px-2 text-[0.625rem] uppercase text-muted-foreground/70",
            className
        )}
        {...props}
    >
        <span className="truncate">{props.children}</span>
        {suffix}
    </div>
));
SidebarGroupLabel.displayName = "SidebarGroupLabel";

const SidebarGroupContent = React.forwardRef<
    HTMLDivElement,
    React.ComponentProps<"div">
>(({ className, ...props }, ref) => (
    <div
        ref={ref}
        data-sidebar="group-content"
        className={cn("flex flex-col gap-1", className)}
        {...props}
    />
));
SidebarGroupContent.displayName = "SidebarGroupContent";

const SidebarInput = React.forwardRef<
    React.ElementRef<typeof Input>,
    React.ComponentPropsWithoutRef<typeof Input>
>(({ className, ...props }, ref) => (
    <Input
        ref={ref}
        data-sidebar="input"
        className={cn(
            "h-8 text-sm bg-card [&>input]:px-2 focus-visible:ring-sidebar-ring group-data-[collapsible=icon]:hidden",
            className
        )}
        {...props}
    />
));
SidebarInput.displayName = "SidebarInput";

const SidebarGroupAction = React.forwardRef<
    React.ElementRef<typeof Button>,
    React.ComponentPropsWithoutRef<typeof Button>
>(({ className, ...props }, ref) => (
    <Button
        ref={ref}
        data-sidebar="group-action"
        variant="ghost"
        size="icon"
        className={cn("h-7 w-7 text-muted-foreground", className)}
        {...props}
    />
));
SidebarGroupAction.displayName = "SidebarGroupAction";

const SidebarInset = React.forwardRef<
    HTMLDivElement,
    React.ComponentProps<"main">
>(({ className, ...props }, ref) => (
    <main
        ref={ref}
        className={cn(
            "relative flex min-h-svh flex-1 flex-col bg-background",
            "peer-data-[variant=inset]:min-h-[calc(100svh-theme(spacing.4))] md:peer-data-[variant=inset]:m-2 md:peer-data-[state=collapsed]:peer-data-[variant=inset]:ml-2 md:peer-data-[variant=inset]:ml-0 md:peer-data-[variant=inset]:rounded-xl md:peer-data-[variant=inset]:shadow",
            className
        )}
        {...props}
    />
));
SidebarInset.displayName = "SidebarInset";

const sidebarMenuButtonVariants = cva(
    "peer/menu-button flex w-full items-center gap-2 overflow-hidden rounded-md p-2 text-left text-sm outline-none ring-sidebar-ring transition-[width,height,padding] hover:bg-card-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 active:bg-card-accent active:text-sidebar-accent-foreground disabled:pointer-events-none disabled:opacity-50 group-has-[[data-sidebar=menu-action]]/menu-item:pr-8 aria-disabled:pointer-events-none aria-disabled:opacity-50 data-[active=true]:bg-card-accent data-[active=true]:font-medium data-[active=true]:text-sidebar-accent-foreground data-[state=open]:hover:bg-card-accent data-[state=open]:hover:text-sidebar-accent-foreground group-data-[collapsible=icon]:!size-8 group-data-[collapsible=icon]:!p-2 [&>span:last-child]:truncate [&>svg]:size-4 [&>svg]:shrink-0",
    {
        variants: {
            variant: {
                default:
                    "hover:bg-card-accent hover:text-sidebar-accent-foreground",
                outline:
                    "bg-background shadow-[0_0_0_1px_hsl(var(--sidebar-border))] hover:bg-card-accent hover:text-sidebar-accent-foreground hover:shadow-[0_0_0_1px_hsl(var(--sidebar-accent))]",
            },
            size: {
                default: "h-8 text-sm",
                sm: "h-7 text-xs",
                lg: "h-12 text-sm group-data-[collapsible=icon]:!p-0",
            },
        },
        defaultVariants: {
            variant: "default",
            size: "default",
        },
    }
);

const SidebarMenuButton = React.forwardRef<
    HTMLButtonElement,
    React.ButtonHTMLAttributes<HTMLButtonElement> &
        VariantProps<typeof sidebarMenuButtonVariants> & {
            asChild?: boolean;
            tooltip?: string;
        }
>(({ className, variant, size, asChild = false, tooltip, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    
    const button = (
        <Comp
            ref={ref}
            data-sidebar="menu-button"
            className={cn(
                sidebarMenuButtonVariants({
                    variant,
                    size,
                }),
                className
            )}
            {...props}
        />
    );

    if (tooltip) {
        return (
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                        {button}
                    </TooltipTrigger>
                    <TooltipContent side="right" sideOffset={20}>
                        {tooltip}
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
        );
    }

    return button;
});
SidebarMenuButton.displayName = "SidebarMenuButton";

const SidebarMenuSub = React.forwardRef<
    HTMLButtonElement,
    React.ComponentProps<"button"> & {
        children?: React.ReactNode;
        content?: React.ReactNode;
        contentClassName?: string;
    }
>(
    (
        { className, children, content, contentClassName, ...props },
        ref
    ) => {
        const [open, setOpen] = React.useState(false);

        return (
            <>
                <SidebarMenuButton
                    ref={ref}
                    data-state={open ? "open" : "closed"}
                    aria-expanded={open}
                    onClick={() => setOpen(!open)}
                    className={cn(
                        "peer/menu-button data-[active=true]:bg-transparent data-[active=true]:font-normal data-[active=true]:text-sidebar-foreground hover:text-sidebar-foreground",
                        className
                    )}
                    {...props}
                >
                    {children}
                </SidebarMenuButton>
                <div
                    data-sidebar="menu-sub"
                    className={cn(
                        "overflow-hidden",
                        open
                            ? "animate-in slide-in-from-top-2"
                            : "animate-out slide-out-to-top-2 hidden"
                    )}
                >
                    <div
                        className={cn(
                            "flex flex-col gap-1 py-1 pl-6 group-data-[collapsible=icon]:hidden",
                            contentClassName
                        )}
                    >
                        {content}
                    </div>
                </div>
            </>
        );
    }
);
SidebarMenuSub.displayName = "SidebarMenuSub";

const SidebarMenuSubButton = React.forwardRef<
    HTMLButtonElement,
    React.ButtonHTMLAttributes<HTMLButtonElement> &
        VariantProps<typeof sidebarMenuButtonVariants>
>(({ className, ...props }, ref) => (
    <SidebarMenuButton
        ref={ref}
        data-sidebar="menu-sub-button"
        className={cn("peer/menu-sub-button", className)}
        {...props}
    />
));
SidebarMenuSubButton.displayName = "SidebarMenuSubButton";

const SidebarMenuSubItem = React.forwardRef<
    HTMLDivElement,
    React.ComponentProps<"div">
>(({ className, children, ...props }, ref) => (
    <div
        ref={ref}
        data-sidebar="menu-sub-item"
        className={cn(
            "group/menu-sub-item relative flex items-center",
            className
        )}
        {...props}
    >
        {children}
    </div>
));
SidebarMenuSubItem.displayName = "SidebarMenuSubItem";

const SidebarMenu = React.forwardRef<
    HTMLDivElement,
    React.ComponentProps<"div">
>(({ className, children, ...props }, ref) => (
    <div
        ref={ref}
        data-sidebar="menu"
        className={cn("relative flex items-center", className)}
        {...props}
    >
        {children}
    </div>
));
SidebarMenu.displayName = "SidebarMenu";

const SidebarMenuItem = React.forwardRef<
    HTMLDivElement,
    React.ComponentProps<"div">
>(({ className, children, ...props }, ref) => (
    <div
        ref={ref}
        data-sidebar="menu-item"
        className={cn(
            "group/menu-item relative flex items-center",
            className
        )}
        {...props}
    >
        {children}
    </div>
));
SidebarMenuItem.displayName = "SidebarMenuItem";

const SidebarMenuBadge = React.forwardRef<
    HTMLDivElement,
    React.ComponentProps<"div">
>(({ className, ...props }, ref) => (
    <div
        ref={ref}
        data-sidebar="menu-badge"
        className={cn(
            "ml-auto flex items-center gap-2 group-data-[collapsible=icon]:hidden",
            className
        )}
        {...props}
    />
));
SidebarMenuBadge.displayName = "SidebarMenuBadge";

const SidebarMenuAction = React.forwardRef<
    React.ElementRef<typeof Button>,
    React.ComponentPropsWithoutRef<typeof Button>
>(({ className, ...props }, ref) => (
    <Button
        ref={ref}
        data-sidebar="menu-action"
        variant="ghost"
        size="icon"
        className={cn(
            "peer/menu-action absolute right-1 top-1/2 h-6 w-6 -translate-y-1/2 opacity-0 transition-opacity group-hover/menu-item:opacity-100 peer-hover/menu-button:opacity-100",
            className
        )}
        {...props}
    />
));
SidebarMenuAction.displayName = "SidebarMenuAction";

const SidebarMenuSkeleton = React.forwardRef<
    HTMLDivElement,
    React.ComponentProps<"div">
>(({ className, ...props }, ref) => (
    <div
        ref={ref}
        data-sidebar="menu-skeleton"
        className={cn(
            "group/menu-skeleton relative flex h-8 items-center gap-2 px-2",
            className
        )}
        {...props}
    >
        <Skeleton className="h-4 w-4 shrink-0" />
        <Skeleton className="h-4 flex-1" />
    </div>
));
SidebarMenuSkeleton.displayName = "SidebarMenuSkeleton";

const SidebarSeparator = React.forwardRef<
    React.ElementRef<typeof Separator>,
    React.ComponentPropsWithoutRef<typeof Separator>
>(({ className, ...props }, ref) => (
    <Separator
        ref={ref}
        data-sidebar="separator"
        decorative
        orientation="horizontal"
        className={cn(
            "my-2 group-data-[collapsible=icon]:hidden",
            className
        )}
        {...props}
    />
));
SidebarSeparator.displayName = "SidebarSeparator";

export {
    type SidebarContext,
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupAction,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarInput,
    SidebarInset,
    SidebarMenu,
    SidebarMenuAction,
    SidebarMenuBadge,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuSkeleton,
    SidebarMenuSub,
    SidebarMenuSubButton,
    SidebarMenuSubItem,
    SidebarProvider,
    SidebarRail,
    SidebarSeparator,
    SidebarTrigger,
    useSidebar,
};
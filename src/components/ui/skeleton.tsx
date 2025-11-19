
import { cn } from "@/lib/utils"
import { motion, HTMLMotionProps } from "framer-motion"

function Skeleton({
  className,
  ...props
}: HTMLMotionProps<"div">) {
  return (
    <motion.div
      className={cn("rounded-md bg-muted/60", className)}
      initial={{ opacity: 0.5 }}
      animate={{ 
        opacity: [0.5, 0.8, 0.5],
        transition: {
          duration: 1.5,
          repeat: Infinity,
          ease: "easeInOut"
        }
      }}
      {...props}
    />
  )
}

// Enhanced skeleton components for specific use cases
function SkeletonCard({ className, ...props }: HTMLMotionProps<"div">) {
  return (
    <div className={cn("w-full overflow-hidden", className)}>
      <Skeleton
        className="w-full h-32 rounded-xl"
        {...props}
      />
      <div className="mt-2 space-y-2">
        <Skeleton className="w-3/4 h-4" />
        <Skeleton className="w-1/2 h-3" />
      </div>
    </div>
  )
}

function SkeletonText({ className, ...props }: HTMLMotionProps<"div">) {
  return (
    <Skeleton
      className={cn("w-full h-4", className)}
      {...props}
    />
  )
}

function SkeletonAvatar({ className, ...props }: HTMLMotionProps<"div">) {
  return (
    <Skeleton
      className={cn("w-10 h-10 rounded-full", className)}
      {...props}
    />
  )
}

function SkeletonButton({ className, ...props }: HTMLMotionProps<"div">) {
  return (
    <Skeleton
      className={cn("w-20 h-8 rounded-full", className)}
      {...props}
    />
  )
}

function SkeletonChatMessage({ isBot = false }: { isBot?: boolean }) {
  return (
    <div className={`flex items-start gap-2 mb-4 max-w-[85%] ${isBot ? "mr-auto" : "ml-auto"}`}>
      {isBot && (
        <Skeleton className="w-8 h-8 rounded-full flex-shrink-0" />
      )}
      <div className="flex-1">
        <Skeleton className={cn(
          "rounded-2xl h-[60px]",
          isBot ? "rounded-tl-none" : "rounded-tr-none"
        )} />
        <Skeleton className="w-16 h-3 mt-1 mx-2" />
      </div>
      {!isBot && (
        <Skeleton className="w-8 h-8 rounded-full flex-shrink-0" />
      )}
    </div>
  )
}

function SkeletonDashboardItem() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="rounded-xl border border-muted/80 overflow-hidden bg-gradient-to-b from-background to-muted/20 shadow-sm"
    >
      <div className="px-4 py-2 border-b border-muted/30 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-4 rounded-full" />
          <Skeleton className="h-3 w-24" />
        </div>
        <Skeleton className="h-6 w-6 rounded-full" />
      </div>
      <div className="p-4">
        <div className="flex items-start gap-3">
          <Skeleton className="h-8 w-8 rounded-full flex-shrink-0" />
          <div className="space-y-2 flex-1">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-3 w-5/6" />
          </div>
        </div>
      </div>
      <div className="px-4 py-1.5 bg-muted/20 border-t border-muted/30 flex justify-between items-center">
        <Skeleton className="h-4 w-16 rounded-full" />
        <Skeleton className="h-4 w-12" />
      </div>
    </motion.div>
  )
}

function SkeletonHealthTip() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="rounded-xl border border-primary/10 overflow-hidden bg-gradient-to-b from-background to-primary/5 shadow-sm"
    >
      <div className="px-4 py-2 border-b border-primary/10 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-4 rounded-full" />
          <Skeleton className="h-3 w-28" />
        </div>
        <Skeleton className="h-6 w-6 rounded-full" />
      </div>
      <div className="p-3">
        <div className="flex items-start gap-3">
          <Skeleton className="h-10 w-10 rounded-full flex-shrink-0" />
          <div className="space-y-2 flex-1">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-3 w-3/4" />
          </div>
        </div>
      </div>
      <div className="px-4 py-1.5 bg-primary/5 border-t border-primary/10 flex justify-between items-center">
        <Skeleton className="h-4 w-24 rounded-full" />
        <Skeleton className="h-4 w-16" />
      </div>
    </motion.div>
  )
}

export { 
  Skeleton, 
  SkeletonCard, 
  SkeletonText, 
  SkeletonAvatar, 
  SkeletonButton, 
  SkeletonChatMessage, 
  SkeletonDashboardItem,
  SkeletonHealthTip 
}

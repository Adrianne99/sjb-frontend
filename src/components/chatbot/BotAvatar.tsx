// The SJB Assistant's picture (the robot with headphones), in a round frame.
// Replace the image file to change the picture everywhere:
// frontend/public/assets/icons/bot.png
import { cn } from "@/utils/cn";

const BOT_IMAGE = "/assets/icons/bot.png";

const sizes = {
  sm: "size-7", // next to chat messages
  md: "size-9", // chat window header
  lg: "size-14", // floating chat button
};

export function BotAvatar({ size = "sm", className }: { size?: keyof typeof sizes; className?: string }) {
  return (
    <span className={cn("flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-white", sizes[size], className)} aria-hidden="true">
      {/* The picture has empty space around it, so it is drawn a little larger to fill the circle. */}
      <img src={BOT_IMAGE} alt="" className="size-full scale-[1.18] object-contain" draggable={false} />
    </span>
  );
}

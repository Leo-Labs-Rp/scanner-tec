import {
  ChevronLeft,
  ChevronRight,
  MessageCircle,
  ShoppingCart,
  Trash2,
  X,
  type LucideIcon,
  type LucideProps
} from "lucide-react";

type IconProps = LucideProps;

function LocalIcon({
  className = "",
  Icon,
  legacyClassName,
  style,
  ...props
}: IconProps & { Icon: LucideIcon; legacyClassName: string }) {
  return (
    <Icon
      className={`${legacyClassName} ${className}`.trim()}
      aria-hidden="true"
      focusable="false"
      style={{ width: "1em", height: "1em", ...style }}
      {...props}
    />
  );
}

export function ContactIcon(props: IconProps) {
  return <LocalIcon Icon={MessageCircle} legacyClassName="fa-regular fa-comment-dots" {...props} />;
}

export function CartIcon(props: IconProps) {
  return <LocalIcon Icon={ShoppingCart} legacyClassName="fa-solid fa-cart-shopping" {...props} />;
}

export function YoutubeIcon(props: IconProps) {
  const { className = "", style, ...svgProps } = props;

  return (
    <svg
      className={`fa-brands fa-youtube ${className}`.trim()}
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
      style={{ width: "1em", height: "1em", ...style }}
      {...svgProps}
    >
      <rect x="2" y="5" width="20" height="14" rx="4" fill="currentColor" stroke="none" />
      <path d="m10 9 5 3-5 3Z" fill="#fff" stroke="none" />
    </svg>
  );
}

export function ChevronLeftIcon(props: IconProps) {
  return <LocalIcon Icon={ChevronLeft} legacyClassName="fa-solid fa-chevron-left" {...props} />;
}

export function ChevronRightIcon(props: IconProps) {
  return <LocalIcon Icon={ChevronRight} legacyClassName="fa-solid fa-chevron-right" {...props} />;
}

export function CloseIcon(props: IconProps) {
  return <LocalIcon Icon={X} legacyClassName="fa-solid fa-xmark" {...props} />;
}

export function TrashIcon(props: IconProps) {
  return <LocalIcon Icon={Trash2} legacyClassName="fa-regular fa-trash-can" {...props} />;
}

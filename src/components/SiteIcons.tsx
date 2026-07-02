import type { HTMLAttributes } from "react";

type IconProps = HTMLAttributes<HTMLElement>;

function FontAwesomeIcon({
  className = "",
  icon,
  ...props
}: IconProps & { icon: string }) {
  return <i className={`${icon} ${className}`.trim()} aria-hidden="true" {...props} />;
}

export function ContactIcon(props: IconProps) {
  return <FontAwesomeIcon icon="fa-regular fa-comment-dots" {...props} />;
}

export function CartIcon(props: IconProps) {
  return <FontAwesomeIcon icon="fa-solid fa-cart-shopping" {...props} />;
}

export function YoutubeIcon(props: IconProps) {
  return <FontAwesomeIcon icon="fa-brands fa-youtube" {...props} />;
}

export function ChevronLeftIcon(props: IconProps) {
  return <FontAwesomeIcon icon="fa-solid fa-chevron-left" {...props} />;
}

export function ChevronRightIcon(props: IconProps) {
  return <FontAwesomeIcon icon="fa-solid fa-chevron-right" {...props} />;
}

export function CloseIcon(props: IconProps) {
  return <FontAwesomeIcon icon="fa-solid fa-xmark" {...props} />;
}

export function TrashIcon(props: IconProps) {
  return <FontAwesomeIcon icon="fa-regular fa-trash-can" {...props} />;
}

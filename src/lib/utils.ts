export function cn(...classNames: Array<string | false | null | undefined>) {
  return classNames.filter(Boolean).join(" ");
}

export function formatCount(value: number) {
  return new Intl.NumberFormat("zh-CN").format(value);
}

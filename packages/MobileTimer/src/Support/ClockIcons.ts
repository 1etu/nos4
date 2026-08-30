const mask = (body: string): string =>
  `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E${body}%3C/svg%3E")`

const stroke = "fill='none' stroke='%23000' stroke-width='2'"

export const ClockIcons = {
  worldClock: mask(
    `%3Cg ${stroke}%3E%3Ccircle cx='16' cy='16' r='13'/%3E%3Cellipse cx='16' cy='16' rx='6.5' ry='13'/%3E%3Cpath d='M3 16h26M5.6 8.4h20.8M5.6 23.6h20.8'/%3E%3C/g%3E`
  ),
  alarm: mask(
    `%3Cg ${stroke}%3E%3Ccircle cx='16' cy='18' r='11'/%3E%3Cpath d='M16 12v6h4.5'/%3E%3Cpath d='M8.2 8.6A5.2 5.2 0 0 1 4.4 3.4M23.8 8.6A5.2 5.2 0 0 0 27.6 3.4'/%3E%3C/g%3E`
  ),
  stopwatch: mask(
    `%3Cg ${stroke}%3E%3Ccircle cx='16' cy='18.5' r='10.5'/%3E%3Cpath d='M16 11.5V18M12.5 3.5h7M16 3.5V8M25.5 9.5l2.4-2.4'/%3E%3C/g%3E`
  ),
  timer: mask(
    `%3Cg ${stroke}%3E%3Ccircle cx='16' cy='16' r='13'/%3E%3Cpath d='M16 16 8.5 8.5'/%3E%3Ccircle cx='16' cy='16' r='1.6' fill='%23000'/%3E%3C/g%3E`
  )
} as const

import { prisma } from "../db/client";

const DEFAULT_DEVICES_API_URL = "http://194.247.12.105:8089/api/devices";

interface DeviceRecord {
  frcId: number;
  frcName: string;
}

function serializeTeam<T extends { frcId: bigint }>(team: T) {
  return { ...team, frcId: Number(team.frcId) };
}

export async function listTeams() {
  const teams = await prisma.team.findMany({ orderBy: { frcName: "asc" } });
  return teams.map(serializeTeam);
}

// Тянет актуальный список устройств из внешнего API и сохраняет уникальные
// команды (frcId/frcName) в локальную БД, чтобы админка могла привязывать
// к ним категории без запроса к внешнему сервису на каждый показ страницы.
export async function syncTeams() {
  const url = process.env.DEVICES_API_URL ?? DEFAULT_DEVICES_API_URL;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Devices API request failed: ${res.status} ${res.statusText}`);
  }
  const devices = (await res.json()) as DeviceRecord[];

  const uniqueTeams = new Map<number, string>();
  for (const device of devices) {
    if (device.frcId == null || !device.frcName) continue;
    uniqueTeams.set(device.frcId, device.frcName);
  }

  await prisma.$transaction(
    Array.from(uniqueTeams, ([frcId, frcName]) =>
      prisma.team.upsert({
        where: { frcId: BigInt(frcId) },
        update: { frcName },
        create: { frcId: BigInt(frcId), frcName },
      }),
    ),
  );

  return listTeams();
}

// ============================================
// Kopi Bima — Coffee Stock CRUD
// ============================================

import { prisma } from "../db";

export async function getCoffeeStocks() {
  return await prisma.coffeeStock.findMany({
    orderBy: { createdAt: "desc" },
  });
}

export async function createCoffeeStock(
  name: string,
  sku: string,
  quantity: number,
  unit: string,
  price: number
) {
  return await prisma.coffeeStock.create({
    data: { name, sku, quantity, unit, price },
  });
}

export async function updateCoffeeStock(id: string, data: any) {
  return await prisma.coffeeStock.update({
    where: { id },
    data,
  });
}

export async function deleteCoffeeStock(id: string) {
  return await prisma.coffeeStock.delete({
    where: { id },
  });
}

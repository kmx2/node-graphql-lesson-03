const { prisma } = require('../src/database');

beforeAll(async () => {
  // 确保数据库连接正常
  await prisma.$connect();
});

afterAll(async () => {
  // 关闭数据库连接
  await prisma.$disconnect();
});
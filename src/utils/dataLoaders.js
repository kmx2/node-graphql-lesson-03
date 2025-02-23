const DataLoader = require('dataloader');
const { prisma } = require('../database');

const createLoaders = () => ({
  department: new DataLoader(async (ids) => {
    const departments = await prisma.department.findMany({
      where: { id: { in: ids.map(Number) } }
    });
    return ids.map(id => departments.find(dept => dept.id === Number(id)));
  }),
  
  teacher: new DataLoader(async (ids) => {
    const teachers = await prisma.teacher.findMany({
      where: { id: { in: ids.map(Number) } }
    });
    return ids.map(id => teachers.find(teacher => teacher.id === Number(id)));
  })
});

module.exports = { createLoaders };
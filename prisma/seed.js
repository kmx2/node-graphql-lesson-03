const { PrismaClient, TeacherType } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // 清空数据库
  await prisma.$transaction([
    prisma.course.deleteMany(),
    prisma.student.deleteMany(),
    prisma.teacher.deleteMany(),
    prisma.department.deleteMany(),
  ]);

  // 创建部门
  const csDept = await prisma.department.create({
    data: {
      name: '计算机科学系',
      description: '计算机科学与技术专业'
    }
  });

  const mathDept = await prisma.department.create({
    data: {
      name: '数学系',
      description: '数学与应用数学专业'
    }
  });
  // 创建教师 - 使用正确的关系连接语法
  const teacher1 = await prisma.teacher.create({
    data: {
      email: 'zhang@example.com',
      fullName: '张教授',
      type: TeacherType.FULLTIME,
      deptId: csDept.id
    }
  });

  const teacher2 = await prisma.teacher.create({
    data: {
      email: 'li@example.com',
      fullName: '李讲师',
      type: TeacherType.PARTTIME,
      deptId: mathDept.id
    }
  });
  // 创建课程 - 使用与 CourseWithoutTeacherInput 一致的参数结构
  const course1 = await prisma.course.create({
    data: {
      code: 'CS101',
      title: '数据结构',
      description: '计算机基础课程',
      dept: {
        connect: {
          id: csDept.id
        }
      },
      teacher: {
        connect: {
          id: teacher1.id
        }
      }
    }
  });

  const course2 = await prisma.course.create({
    data: {
      code: 'MATH101',
      title: '高等数学',
      description: '数学基础课程',
      dept: {
        connect: {
          id: mathDept.id
        }
      },
      teacher: {
        connect: {
          id: teacher2.id
        }
      }
    }
  });

  // 创建学生
  const student1 = await prisma.student.create({
    data: {
      email: 'wang@student.com',
      fullName: '王同学',
      enrolled: true,
      dept: {
        connect: {
          id: csDept.id
        }
      }
    }
  });

  const student2 = await prisma.student.create({
    data: {
      email: 'zhao@student.com',
      fullName: '赵同学',
      enrolled: false,
      dept: {
        connect: {
          id: mathDept.id
        }
      }
    }
  });

  console.log('数据库初始化完成');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
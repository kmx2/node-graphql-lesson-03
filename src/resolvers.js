const { prisma } = require("./database.js");
const { validateEmail, validateStringLength } = require('./utils/validators');
const { ValidationError, NotFoundError } = require('./utils/errorHandler');
const { createLoaders } = require('./utils/dataLoaders');

const resolvers = {
  Student: {
    id: (parent) => parent.id.toString(),
    email: (parent) => parent.email,
    fullName: (parent) => parent.fullName,
    enrolled: (parent) => parent.enrolled,
    dept: (parent, _, context) => context.loaders.department.load(parent.deptId),
    createdAt: (parent) => parent.createdAt.toISOString(),
    updatedAt: (parent) => parent.updatedAt.toISOString(),
  },

  Department: {
    id: (parent) => parent.id.toString(),
    name: (parent) => parent.name,
    description: (parent) => parent.description,
    students: (parent) => prisma.student.findMany({ where: { deptId: parent.id } }),
    courses: (parent) => prisma.course.findMany({ where: { deptId: parent.id } }),
    teachers: (parent) => prisma.teacher.findMany({ where: { deptId: parent.id } }),
    createdAt: (parent) => parent.createdAt.toISOString(),
    updatedAt: (parent) => parent.updatedAt.toISOString(),
  },

  Teacher: {
    id: (parent) => parent.id.toString(),
    email: (parent) => parent.email,
    fullName: (parent) => parent.fullName,
    courses: (parent) => prisma.course.findMany({ where: { teacherId: parent.id } }),
    type: (parent) => parent.type,
    dept: (parent, _, context) => parent.deptId ? context.loaders.department.load(parent.deptId) : null,
    createdAt: (parent) => parent.createdAt.toISOString(),
    updatedAt: (parent) => parent.updatedAt.toISOString(),
  },

  Course: {
    id: (parent) => parent.id.toString(),
    code: (parent) => parent.code,
    title: (parent) => parent.title,
    description: (parent) => parent.description,
    teacher: (parent, _, context) => parent.teacherId ? context.loaders.teacher.load(parent.teacherId) : null,
    dept: (parent, _, context) => parent.deptId ? context.loaders.department.load(parent.deptId) : null,
    createdAt: (parent) => parent.createdAt.toISOString(),
    updatedAt: (parent) => parent.updatedAt.toISOString(),
  },

  Query: {
    students: async (_, { page = 1, pageSize = 10 }) => {
      const skip = (page - 1) * pageSize;
      const [total, students] = await prisma.$transaction([
        prisma.student.count(),
        prisma.student.findMany({
          skip,
          take: pageSize,
          orderBy: { id: 'asc' }
        })
      ]);
      const totalPages = Math.ceil(total / pageSize);
      return {
        students,
        total,
        totalPages,
        currentPage: page,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1
      };
    },

    student: async (_, { id }) => {
      const student = await prisma.student.findUnique({ 
        where: { id: Number(id) } 
      });
      if (!student) throw new NotFoundError(`Student with ID ${id} not found`);
      return student;
    },

    isEnrolled: (_, { studentId }) =>
      prisma.student.findUnique({ where: { id: Number(studentId) } })
        .then(student => student?.enrolled || false),

    departments: () => prisma.department.findMany(),
    department: (_, { id }) => prisma.department.findUnique({ where: { id: Number(id) } }),
    teachers: () => prisma.teacher.findMany(),
    teacher: (_, { id }) => prisma.teacher.findUnique({ where: { id: Number(id) } }),
    courses: () => prisma.course.findMany(),
    course: (_, { id }) => prisma.course.findUnique({ where: { id: Number(id) } }),
  },

  Mutation: {
    registerStudent: async (_, { email, fullName, departmentId }) => {
      try {
        validateEmail(email);
        validateStringLength(fullName, 'Full name', 2, 100);

        const department = await prisma.department.findUnique({
          where: { id: Number(departmentId) }
        });
        if (!department) {
          throw new NotFoundError(`Department with ID ${departmentId} not found`);
        }

        return await prisma.student.create({
          data: {
            email,
            fullName,
            dept: {
              connect: { id: Number(departmentId) }
            },
            enrolled: false
          }
        });
      } catch (error) {
        if (error.code === 'P2002') {
          throw new ValidationError('Email already exists');
        }
        throw error;
      }
    },

    deleteDepartment: async (_, { id }) => {
      return await prisma.$transaction(async (tx) => {
        // 检查是否存在关联的学生
        const studentsCount = await tx.student.count({
          where: { deptId: Number(id) }
        });
        
        if (studentsCount > 0) {
          throw new ValidationError(
            `Cannot delete department with ${studentsCount} associated students`
          );
        }

        return tx.department.delete({
          where: { id: Number(id) }
        });
      });
    },

    enrollStudent: (_, { id, enrolled = true }) =>
      prisma.student.update({
        where: { id: Number(id) },
        data: { enrolled }
      }),

    updateStudent: (_, { id, email, fullName, enrolled }) =>
      prisma.student.update({
        where: { id: Number(id) },
        data: {
          email,
          fullName,
          enrolled
        }
      }),

    deleteStudent: (_, { id }) =>
      prisma.student.delete({ where: { id: Number(id) } }),

    createDepartment: (_, { input: { name, description } }) =>
      prisma.department.create({ data: { name, description } }),

    updateDepartment: (_, { id, input: { name, description } }) =>
      prisma.department.update({
        where: { id: Number(id) },
        data: { name, description }
      }),

    deleteDepartment: (_, { id }) =>
      prisma.department.delete({ where: { id: Number(id) } }),

    createTeacher: async (_, { input }) => {
      // 检查部门是否存在
      if (input.departmentId) {
        const department = await prisma.department.findUnique({
          where: { id: Number(input.departmentId) }
        });
        if (!department) {
          throw new NotFoundError(`Department with ID ${input.departmentId} not found`);
        }
      }
      
      return prisma.teacher.create({
        data: {
          email: input.email,
          fullName: input.fullName || null,
          type: input.type,
          deptId: input.departmentId ? Number(input.departmentId) : null
        }
      });
    },

    updateTeacher: (_, { id, input }) =>
      prisma.teacher.update({
        where: { id: Number(id) },
        data: {
          fullName: input.fullName,
          email: input.email,
          type: input.type,
          deptId: input.departmentId ? Number(input.departmentId) : null
        }
      }),

    deleteTeacher: (_, { id }) =>
      prisma.teacher.delete({ where: { id: Number(id) } }),

    assignCourse: (_, { teacherId, courseId }) =>
      prisma.course.update({
        where: { id: Number(courseId) },
        data: {
          teacherId: Number(teacherId)
        }
      }),

    createCourse: (_, { input }) => {
      return prisma.course.create({
        data: {
          code: input.code,
          title: input.title,
          description: input.description,
          deptId: input.departmentId ? Number(input.departmentId) : null
        }
      });
    },

    updateCourse: (_, { id, input }) => {
      return prisma.course.update({
        where: { id: Number(id) },
        data: input
      });
    },

    deleteCourse: (_, { id }) =>
      prisma.course.delete({ where: { id: Number(id) } }),
  }
};

module.exports = {
  resolvers,
  context: ({ req }) => ({
    loaders: createLoaders()
  })
};

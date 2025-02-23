const { prisma } = require('../src/database');
const { resolvers } = require('../src/resolvers');

describe('GraphQL Resolvers', () => {
  describe('Student Resolvers', () => {
    test('Query: students', async () => {
      const response = await resolvers.Query.students(null, { page: 1, pageSize: 10 });
      const result = response.students;
      expect(result).toBeInstanceOf(Array);
    });

    test('Query: student', async () => {
      const result = await resolvers.Query.student(null, { id: 1 });
      expect(result).toHaveProperty('id');
    });

    test('Mutation: registerStudent', async () => {
      const result = await resolvers.Mutation.registerStudent(null, {
        fullName: 'Test Student',
        email: `test-${Date.now()}@example.com`,
        departmentId: 1
      });
      expect(result).toHaveProperty('id');
    });

    test('Mutation: enrollStudent', async () => {
      const result = await resolvers.Mutation.enrollStudent(null, {
        id: 1,
        enrolled: true
      });
      expect(result).toBeTruthy();
    });
  });

  describe('Teacher Resolves', () => {
    test('Query: teachers', async () => {
      const result = await resolvers.Query.teachers();
      expect(result).toBeInstanceOf(Array);
    });

    test('Query: teacher', async () => {
      const result = await resolvers.Query.teacher(null, { id: 1 });
      expect(result).toHaveProperty('id');
    });

    test('Mutation: createTeacher', async () => {
      const result = await resolvers.Mutation.createTeacher(null, {
        input: {
          fullName: 'Test Teacher',
          email: `teacher-${Date.now()}@example.com`,
          departmentId: 1,
          type: 'FULLTIME'
        }
      });
      expect(result).toHaveProperty('id');
    });

    test('Mutation: assignCourse', async () => {
      const result = await resolvers.Mutation.assignCourse(null, {
        teacherId: 1,
        courseId: 1
      });
      expect(result).toBeTruthy();
    });
  });

  describe('Course Resolvers', () => {
    test('Query: courses', async () => {
      const result = await resolvers.Query.courses();
      expect(result).toBeInstanceOf(Array);
    });

    test('Query: course', async () => {
      const result = await resolvers.Query.course(null, { id: 1 });
      expect(result).toHaveProperty('id');
    });

    test('Mutation: createCourse', async () => {
      const result = await resolvers.Mutation.createCourse(null, {
        input: {
          title: 'Test Course',
          description: 'Test Description',
          departmentId: 1,
          code: `CS-${Date.now()}`
        }
      });
      expect(result).toHaveProperty('id');
    });

    test('Mutation: updateCourse', async () => {
      const result = await resolvers.Mutation.updateCourse(null, {
        id: 1,
        input: { 
          title: 'Updated Course Title'
        }
      });
      expect(result).toHaveProperty('title', 'Updated Course Title');
    });
  });
});

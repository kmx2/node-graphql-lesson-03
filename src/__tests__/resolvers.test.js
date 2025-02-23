const { ApolloServer } = require('apollo-server');
const { typeDefs } = require('../schema');
const { resolvers } = require('../resolvers');

describe('GraphQL API Tests', () => {
  let testServer;

  beforeAll(() => {
    testServer = new ApolloServer({
      typeDefs,
      resolvers,
    });
  });

  // 查询测试
  describe('Query Tests', () => {
    test('获取学生列表（分页）', async () => {
      const query = `
        query {
          students(page: 1, pageSize: 2) {
            students {
              id
              fullName
              email
              enrolled
              dept { name }
            }
            total
            totalPages
            currentPage
            hasNextPage
            hasPreviousPage
          }
        }
      `;
      const response = await testServer.executeOperation({ query });
      expect(response.errors).toBeUndefined();
      expect(response.data.students.students).toHaveLength(2);
    });

    test('获取部门列表', async () => {
      const query = `
        query {
          departments {
            id
            name
            students { id }
            teachers { id }
            courses { id }
          }
        }
      `;
      const response = await testServer.executeOperation({ query });
      expect(response.errors).toBeUndefined();
      expect(response.data.departments).toHaveLength(2);
    });
  });

  // 变更测试
  describe('Mutation Tests', () => {
    test('注册新学生', async () => {
      const mutation = `
        mutation {
          registerStudent(
            email: "test@student.com"
            fullName: "测试学生"
            departmentId: "1"
          ) {
            id
            email
            fullName
            enrolled
          }
        }
      `;
      const response = await testServer.executeOperation({ query: mutation });
      expect(response.errors).toBeUndefined();
      expect(response.data.registerStudent.email).toBe("test@student.com");
    });

    test('创建新教师', async () => {
      const mutation = `
        mutation {
          createTeacher(input: {
            email: "test@teacher.com"
            fullName: "测试教师"
            type: FULLTIME
          }) {
            id
            email
            type
          }
        }
      `;
      const response = await testServer.executeOperation({ query: mutation });
      expect(response.errors).toBeUndefined();
      expect(response.data.createTeacher.email).toBe("test@teacher.com");
    });
  });
});
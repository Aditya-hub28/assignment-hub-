const request = require('supertest');
const app = require('../src/app');

describe('Service Requests API Test Suite', () => {
  const sampleDeadline = new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0];

  describe('POST /api/v1/services/requests - Request Creation & Validation', () => {
    it('should successfully create a normal service request with valid fields and generate ID format REQ-YYYYMMDD-XXX', async () => {
      const payload = {
        service: 'Assignment Writing',
        title: 'Distributed Systems Consensus Mechanisms',
        subject: 'Computer Science',
        description: 'Need a thorough academic assignment comparing Raft and Paxos algorithms with latency analysis.',
        deadline: sampleDeadline,
        serviceSpecific: {
          numberOfPages: 12,
          formatStyle: 'Typed (Digital PDF / Word)'
        },
        files: [
          {
            name: 'consensus_rubric.pdf',
            size: 1024 * 1024 * 2, // 2MB
            extension: 'pdf'
          }
        ]
      };

      const res = await request(app)
        .post('/api/v1/services/requests')
        .send(payload);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeDefined();

      const created = res.body.data;
      expect(created.title).toBe(payload.title);
      expect(created.service).toBe('Assignment Writing');
      expect(created.status).toBe('pending');

      // Verify ID format: REQ-YYYYMMDD-XXX
      const idRegex = /^REQ-\d{8}-\d{3}$/;
      expect(created.id).toMatch(idRegex);

      const now = new Date();
      const expectedDatePrefix = `REQ-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}-`;
      expect(created.id.startsWith(expectedDatePrefix)).toBe(true);
    });

    it('should successfully create a custom service request', async () => {
      const payload = {
        service: 'Custom Service',
        isCustom: true,
        customServiceName: 'Quantum Algorithm Simulation & Qiskit Analysis',
        title: 'Grover Search Circuit Optimization',
        subject: 'Quantum Computing',
        description: 'Simulate Grover search algorithm using Qiskit and measure error mitigation across noisy qubits.',
        deadline: sampleDeadline,
        additionalInstructions: 'Include state tomography visualizations.',
        files: [
          {
            name: 'circuit_specs.docx',
            size: 500000,
            extension: 'docx'
          }
        ]
      };

      const res = await request(app)
        .post('/api/v1/services/requests')
        .send(payload);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.isCustom).toBe(true);
      expect(res.body.data.customServiceName).toBe('Quantum Algorithm Simulation & Qiskit Analysis');
      expect(res.body.data.id).toMatch(/^REQ-\d{8}-\d{3}$/);
    });

    it('should reject request when required fields are missing', async () => {
      const invalidPayload = {
        service: 'Coding Projects'
        // Missing title, subject, description, deadline
      };

      const res = await request(app)
        .post('/api/v1/services/requests')
        .send(invalidPayload);

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should reject request when custom service name is missing for isCustom=true', async () => {
      const invalidPayload = {
        service: 'Custom Service',
        isCustom: true,
        // Missing customServiceName
        title: 'Custom Robotics Project',
        subject: 'Robotics',
        description: 'Designing custom kinematic model in ROS2.',
        deadline: sampleDeadline
      };

      const res = await request(app)
        .post('/api/v1/services/requests')
        .send(invalidPayload);

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should reject unsupported file types (e.g., .exe, .sh, .bat)', async () => {
      const payloadWithBadFile = {
        service: 'Coding Projects',
        title: 'Compiler Design Lexer',
        subject: 'Computer Science',
        description: 'Build a lexical analyzer in Flex and Bison.',
        deadline: sampleDeadline,
        files: [
          {
            name: 'malicious_script.exe',
            size: 1024,
            extension: 'exe'
          }
        ]
      };

      const res = await request(app)
        .post('/api/v1/services/requests')
        .send(payloadWithBadFile);

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should reject files exceeding total 50 MB limit', async () => {
      const payloadWithHugeFiles = {
        service: 'Project Reports / Documentation',
        title: 'High Performance Computing Report',
        subject: 'HPC',
        description: 'Complete documentation for MPI cluster benchmarks.',
        deadline: sampleDeadline,
        files: [
          {
            name: 'dataset_part1.zip',
            size: 30 * 1024 * 1024, // 30 MB
            extension: 'zip'
          },
          {
            name: 'dataset_part2.zip',
            size: 25 * 1024 * 1024, // 25 MB -> Total = 55 MB > 50 MB limit
            extension: 'zip'
          }
        ]
      };

      const res = await request(app)
        .post('/api/v1/services/requests')
        .send(payloadWithHugeFiles);

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  describe('GET /api/v1/services/requests - Retrieval', () => {
    it('should list submitted requests', async () => {
      const res = await request(app).get('/api/v1/services/requests');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);
    });

    it('should get a specific request by ID', async () => {
      const listRes = await request(app).get('/api/v1/services/requests');
      const firstReq = listRes.body.data[0];

      const res = await request(app).get(`/api/v1/services/requests/${firstReq.id}`);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.id).toBe(firstReq.id);
    });

    it('should return 404 for non-existent request ID', async () => {
      const res = await request(app).get('/api/v1/services/requests/REQ-99999999-999');
      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });
  });
});

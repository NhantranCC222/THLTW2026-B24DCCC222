let clubs = [
  { id: 1, name: 'CLB IT', leader: 'Nguyễn Văn A', isActive: true },
];

let applications = [
  {
    id: 1,
    name: 'Trần Văn B',
    email: 'b@gmail.com',
    clubId: 1,
    status: 'Pending',
  },
];

export default {
  'GET /api/clubs': clubs,

  'POST /api/clubs': (req: any, res: any) => {
    clubs.push({ id: Date.now(), ...req.body });
    res.send({ success: true });
  },

  'GET /api/applications': applications,
};
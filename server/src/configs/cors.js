const corsOptions = {
  origin: [
    process.env.LOCAL_CLIENT_URL_1,
    process.env.LOCAL_CLIENT_URL_2,
    process.env.CLIENT_URL,
  ].filter(Boolean),
  credentials: true,
};

module.exports = corsOptions;

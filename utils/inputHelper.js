// Add promise-based question to readline
module.exports = (rl) => {
  rl.questionAsync = (question) => {
    return new Promise((resolve) => {
      rl.question(question, resolve);
    });
  };
  return rl;
};
module.exports = function(rl) {
  rl.questionAsync = function(question) {
    return new Promise((resolve) => {
      this.question(question, resolve);
    });
  };
  return rl;
};
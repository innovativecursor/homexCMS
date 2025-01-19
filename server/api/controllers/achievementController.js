const Achievement = require("../models/achievements");
exports.getAchievements = async (req, res) => {
  try {
    const achievement = await Achievement.findOne({});
    res.status(200).json(achievement);
  } catch (error) {
    res.status(500).json({ message: error.message, error: error.message });
  }
};

exports.updateAchievement = async (req, res) => {
  let achievement;
  try {
    const updatedData = req.body;
    achievement = await Achievement.findOne({});

    if (!achievement) {
      achievement = await Achievement.create({
        description: req.body?.description,
        label1: req.body?.label1,
        counter1: req.body?.counter1,
        label2: req.body?.label2,
        counter2: req.body?.counter2,
        label3: req.body?.label3,
        counter3: req.body?.counter3,
      });
    }
    await achievement.update(updatedData);
    res.status(200).json({ message: "About content updated successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

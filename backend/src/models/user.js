module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define(
    "User",
    {
      name: {
        type: DataTypes.STRING(75),
        allowNull: false,
      },
      email: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true,
      },
      password: {
        type: DataTypes.STRING(75),
        allowNull: false,
      },
    },
    {}
  );
  User.associate = function (models) {
    User.belongsToMany(models.AuthClient, {
      as: "Clients",
      through: { model: models.UsersAuthClients },
      foreignKey: "userId",
    });
    User.belongsToMany(models.AuthScope, {
      as: "Scopes",
      through: { model: models.UsersAuthScopes },
      foreignKey: "userId",
    });
  };

  return User;
};